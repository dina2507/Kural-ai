import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import multer from 'multer';
import { runVisionAgent } from './src/ai/agents/visionAgent.js';
import { createServerSupabaseClient } from './src/lib/supabase/server.js';
import { createIssueSchema } from './src/lib/validators/issue.validator.js';

import { runCivicMindAgent } from './src/ai/agents/civicMindAgent.js';
import { runResolutionAgent } from './src/ai/agents/resolutionAgent.js';
import { runDigestAgent } from './src/ai/agents/digestAgent.js';

const upload = multer({ storage: multer.memoryStorage() });

function mapIssue(row: any) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    severity: row.severity,
    status: row.status,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address || '',
    ward: row.ward || 'Unknown Ward',
    images: row.images || [],
    resolutionImage: row.resolution_image || null,
    aiTags: row.ai_tags || [],
    aiAnalysis: row.ai_analysis || {},
    confirmationCount: row.confirmation_count || 0,
    viewCount: row.view_count || 0,
    resolutionVerified: row.resolution_verified || null,
    resolutionConfidence: row.resolution_confidence || null,
    resolutionReasoning: row.resolution_reasoning || null,
    reporterId: row.reporter_id || '',
    upvotes: row.upvotes || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || null,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/agents/vision', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, data: null, error: 'No image provided', timestamp: new Date().toISOString() });
      }

      const { latitude, longitude } = req.body;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ success: false, data: null, error: 'Invalid coordinates', timestamp: new Date().toISOString() });
      }

      const supabase = createServerSupabaseClient();
      
      // PostGIS find nearby issues - RPC call
      let nearbyIssues: any[] = [];
      try {
        const { data, error } = await supabase.rpc('find_nearby_issues', {
          lat: lat,
          lng: lng,
          radius_meters: 50
        });
        if (data) {
          nearbyIssues = data.map((i: any) => ({
            id: i.id,
            category: i.category,
            title: i.title,
            distance: i.dist_meters || 0
          }));
        }
      } catch (err) {
        console.warn('Could not fetch nearby issues', err);
      }

      const imageBase64 = req.file.buffer.toString('base64');
      
      const analysis = await runVisionAgent({
        imageBase64,
        imageMimeType: req.file.mimetype,
        latitude: lat,
        longitude: lng,
        nearbyIssues
      });

      return res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[VisionAgent]', error);
      return res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Agent failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.post('/api/issues', async (req, res) => {
    try {
      const validation = createIssueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, data: null, error: validation.error.message, timestamp: new Date().toISOString() });
      }
      
      const data = validation.data;
      const supabase = createServerSupabaseClient();

      // Ensure we extract token from Auth header in real app
      // Here we assume client creates issue anonymously or provides userId via header
      const reporterId = req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000'; // Fallback for Phase 2 without complete auth
      
      const newIssue: any = {
          title: data.title,
          description: data.description,
          category: data.category,
          severity: data.severity,
          latitude: data.latitude,
          longitude: data.longitude,
          location: `SRID=4326;POINT(${data.longitude} ${data.latitude})`,
          address: 'Address generated from lat/lng', // Placeholder, ideally use geocoding
          ward: 'Unknown Ward', // Placeholder
          images: data.images,
          ai_tags: data.aiTags,
          ai_analysis: data.aiAnalysis,
          reporter_id: reporterId,
          status: 'ai_verified',
          upvotes: 0
      };

      // In a real app we would use ST_Point, but since we rely on the PostGIS schema:
      // Insert with location
      const { data: issue, error } = await supabase
        .from('issues')
        .insert(newIssue)
        .select()
        .single();
        
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('[CreateIssue] Supabase table not found, using in-memory mock');
          newIssue.id = Math.random().toString(36).substring(7);
          newIssue.created_at = new Date().toISOString();
          newIssue.confirmation_count = 0;
          global.mockIssues = global.mockIssues || [];
          global.mockIssues.unshift(newIssue);
          return res.json({ success: true, data: newIssue, timestamp: new Date().toISOString() });
        }
        throw error;
      }

      // We should also insert into issue_timeline, but skipping for brevity if not strictly needed
      // returning issue
      return res.json({
        success: true,
        data: mapIssue(issue),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
       console.error('[CreateIssue]', error);
       return res.status(500).json({
         success: false,
         data: null,
         error: error instanceof Error ? error.message : String(error),
         timestamp: new Date().toISOString(),
       });
    }
  });

  app.get('/api/issues', async (req, res) => {
    try {
      const supabase = createServerSupabaseClient();
      let query = supabase.from('issues').select('*').is('deleted_at', null).order('created_at', { ascending: false });
      
      if (req.query.status) {
        query = query.eq('status', req.query.status);
      }
      if (req.query.category) {
        const cats = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
        query = query.in('category', cats);
      }

      const { data, error } = await query;
      
      let finalData = data || [];
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
           finalData = [];
        } else {
           throw error;
        }
      }
      
      if ((global as any).mockIssues) {
         finalData = [...(global as any).mockIssues, ...finalData];
      }
      
      return res.json({
        success: true,
        data: finalData.map(mapIssue),
        timestamp: new Date().toISOString()
      });
    } catch(err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
    }
  });

  app.post('/api/agents/civic-mind', async (req, res) => {
    try {
      const supabase = createServerSupabaseClient();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: issues, error } = await supabase
        .from('issues')
        .select('*')
        .is('deleted_at', null)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
        
      let safeIssues = issues || [];
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
           safeIssues = (global as any).mockIssues || [];
        } else {
           throw error;
        }
      }
      
      const analysis = await runCivicMindAgent(issues || []);
      
      // Store drafts
      if (analysis.clusters && analysis.clusters.length > 0) {
         const draftsToInsert = analysis.clusters.map(cluster => ({
            id: cluster.id,
            ward: cluster.ward,
            category: cluster.category,
            issue_ids: cluster.issueIds,
            urgency_score: cluster.urgencyScore,
            department: cluster.department,
            letter_content: cluster.escalationLetter,
            status: 'draft'
         }));
         
         await supabase.from('escalation_drafts').upsert(draftsToInsert);
      }
      
      // Store health score
      await supabase.from('city_health_scores').insert({
         score: analysis.healthScore,
         rationale: analysis.healthRationale,
         critical_count: analysis.criticalCount,
         total_analyzed: analysis.totalAnalyzed,
         recommended_actions: analysis.recommendedActions
      });
      
      return res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
      
    } catch(err) {
       console.error('[CivicMind]', err);
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Agent failed', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/agents/resolution', upload.single('afterImage'), async (req, res) => {
     try {
        if (!req.file) {
          return res.status(400).json({ success: false, data: null, error: 'No image provided', timestamp: new Date().toISOString() });
        }
        
        const { issueId, category, originalDescription, beforeImageBase64, beforeMimeType } = req.body;
        
        if (!issueId || !beforeImageBase64) {
          return res.status(400).json({ success: false, data: null, error: 'Missing issue data', timestamp: new Date().toISOString() });
        }

        const afterImageBase64 = req.file.buffer.toString('base64');
        
        const analysis = await runResolutionAgent({
          beforeImageBase64,
          afterImageBase64,
          beforeMimeType: beforeMimeType || 'image/jpeg',
          afterMimeType: req.file.mimetype,
          category,
          originalDescription
        });
        
        const supabase = createServerSupabaseClient();
        
        // Update issue
        const newStatus = analysis.verified ? 'resolved' : 'in_progress';
        await supabase.from('issues').update({
           resolution_verified: analysis.verified,
           resolution_confidence: analysis.confidence,
           resolution_reasoning: analysis.reasoning,
           status: newStatus,
           resolved_at: analysis.verified ? new Date().toISOString() : null
        }).eq('id', issueId);
        
        // Timeline event
        await supabase.from('issue_timeline').insert({
           issue_id: issueId,
           actor_type: 'ai_agent',
           agent_name: 'resolution_agent',
           event_type: 'resolution_verification',
           title: 'Resolution Agent analyzed image',
           description: analysis.reasoning,
           metadata: analysis
        });
        
        return res.json({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString()
        });

     } catch(err) {
        console.error('[ResolutionAgent]', err);
        return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Agent failed', timestamp: new Date().toISOString() });
     }
  });

  app.get('/api/health-score', async (req, res) => {
    try {
      const supabase = createServerSupabaseClient();
      
      const { data, error } = await supabase.from('city_health_scores').select('*').order('created_at', { ascending: false }).limit(1).single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return res.json({
        success: true,
        data: data || { score: 85, rationale: "Default score" },
        timestamp: new Date().toISOString()
      });
    } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
    }
  });
  
  app.post('/api/issues/:id/confirm', async (req, res) => {
     try {
       const issueId = req.params.id;
       const userId = req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000';
       
       const supabase = createServerSupabaseClient();
       
       const { data, error } = await supabase.from('issue_confirmations').insert({
          issue_id: issueId,
          user_id: userId
       });
       
       // Timeline
       await supabase.from('issue_timeline').insert({
           issue_id: issueId,
           actor_type: 'citizen',
           actor_id: userId,
           event_type: 'community_verification',
           title: 'Confirmed by citizen',
       });
       
       return res.json({
         success: true,
         data: { confirmed: true },
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

   app.post('/api/issues/:id/upvote', async (req, res) => {
     try {
       const issueId = req.params.id;
       const supabase = createServerSupabaseClient();
       
       const { data, error } = await supabase.rpc('increment_upvotes', { row_id: issueId });
       
       if (error) {
         if (error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST202' || error.code === '42883') {
           // RPC might not exist, or table might not exist
           const mockIssue = ((global as any).mockIssues || []).find((i: any) => i.id === issueId);
           if (mockIssue) {
              mockIssue.upvotes = (mockIssue.upvotes || 0) + 1;
              return res.json({ success: true, data: mapIssue(mockIssue), timestamp: new Date().toISOString() });
           }
         }
         
         // Fallback if RPC fails but table exists
         const { data: issue, error: fetchError } = await supabase.from('issues').select('upvotes').eq('id', issueId).single();
         if (!fetchError && issue) {
            const { data: updatedIssue, error: updateError } = await supabase.from('issues').update({ upvotes: (issue.upvotes || 0) + 1 }).eq('id', issueId).select().single();
            if (!updateError) {
               return res.json({ success: true, data: mapIssue(updatedIssue), timestamp: new Date().toISOString() });
            }
         }
         
         throw error;
       }
       
       return res.json({
         success: true,
         data: mapIssue(data),
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.get('/api/issues/:id', async (req, res) => {
     try {
       const supabase = createServerSupabaseClient();
       const { data, error } = await supabase.from('issues').select('*').eq('id', req.params.id).single();
       if (error) {
         if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.code === '42P01') {
           const mockIssue = ((global as any).mockIssues || []).find((i: any) => i.id === req.params.id);
           if (!mockIssue) return res.status(404).json({ success: false, data: null, error: 'Issue not found', timestamp: new Date().toISOString() });
           return res.json({ success: true, data: mapIssue(mockIssue), timestamp: new Date().toISOString() });
         }
         throw error;
       }
       
       return res.json({
         success: true,
         data: mapIssue(data),
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.get('/api/issues/:id/timeline', async (req, res) => {
     try {
       const supabase = createServerSupabaseClient();
       const { data, error } = await supabase.from('issue_timeline').select('*').eq('issue_id', req.params.id).order('created_at', { ascending: true });
       if (error) throw error;
       
       return res.json({
         success: true,
         data,
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.get('/api/escalation-drafts', async (req, res) => {
     try {
       const supabase = createServerSupabaseClient();
       const { data, error } = await supabase.from('escalation_drafts').select('*').order('urgency_score', { ascending: false });
       if (error) throw error;
       
       return res.json({
         success: true,
         data,
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });
  
  app.patch('/api/escalation-drafts/:id/send', async (req, res) => {
     try {
       const supabase = createServerSupabaseClient();
       const { error } = await supabase.from('escalation_drafts').update({ status: 'sent' }).eq('id', req.params.id);
       if (error) throw error;
       
       return res.json({
         success: true,
         data: { sent: true },
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.post('/api/agents/digest', async (req, res) => {
     try {
       const { ward, weekStart, weekEnd } = req.body;
       if (!ward || !weekStart || !weekEnd) {
          return res.status(400).json({ success: false, data: null, error: 'Missing ward or dates', timestamp: new Date().toISOString() });
       }
       
       const supabase = createServerSupabaseClient();
       
       const { data: issues, error } = await supabase.from('issues')
          .select('*')
          .eq('ward', ward)
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd);
          
       let safeIssues = issues || [];
       if (error) {
          if (error.code === 'PGRST205' || error.code === '42P01') {
             safeIssues = ((global as any).mockIssues || []).filter((i: any) => i.ward === ward);
          } else {
             throw error;
          }
       }
       
       const total = safeIssues.length;
       const resolved = safeIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
       const open = total - resolved;
       const critical = safeIssues.filter(i => i.severity >= 9 && (i.status !== 'resolved' && i.status !== 'closed')).length;
       const resolutionRate = total > 0 ? resolved / total : 0;
       
       const categoryCounts = safeIssues.reduce((acc, issue) => {
          acc[issue.category] = (acc[issue.category] || 0) + 1;
          return acc;
       }, {} as Record<string, number>);
       
       const topCategory = Object.keys(categoryCounts).length > 0 ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b) : 'None';
       
       const stats = {
          total,
          resolved,
          open,
          critical,
          resolutionRate,
          topCategory,
          avgResolutionDays: 3, // Mocked or calculated if we had more info
       };
       
       const notableIssues = safeIssues.slice(0, 3).map(i => ({
          title: i.title,
          category: i.category,
          status: i.status,
          daysOpen: Math.floor((new Date().getTime() - new Date(i.created_at).getTime()) / 86400000)
       }));
       
       const analysis = await runDigestAgent({
          ward,
          weekStart,
          weekEnd,
          stats,
          citizenHero: { name: 'Priya R.', reportsCount: 5, karma: 150 }, // Mocked hero
          notableIssues
       });
       
       // Upsert ward report
       await supabase.from('ward_reports').upsert({
          ward,
          week_start: weekStart,
          week_end: weekEnd,
          report_content: analysis,
          stats
       });
       
       return res.json({
         success: true,
         data: analysis,
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       console.error('[DigestAgent]', err);
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });
  
  app.get('/api/dashboard', async (req, res) => {
     try {
       const supabase = createServerSupabaseClient();
       
       const { data: healthData, error: healthError } = await supabase.from('city_health_scores').select('score').order('created_at', { ascending: false }).limit(1).single();
       const healthScore = healthData?.score || 85;

       const period = req.query.period as string || '30d';
       const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
       const since = new Date();
       since.setDate(since.getDate() - days);
       
       const { data: issues, error: issuesError } = await supabase.from('issues').select('*').is('deleted_at', null).gte('created_at', since.toISOString());
       let safeIssues = issues || [];
       if (issuesError && (issuesError.code === 'PGRST205' || issuesError.code === '42P01')) {
          safeIssues = ((global as any).mockIssues || []).filter((i: any) => new Date(i.created_at) >= since);
       } else if (issuesError) {
          throw issuesError;
       }
       
       const totalOpen = safeIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
       const totalResolved = safeIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
       const totalCritical = safeIssues.filter(i => i.severity >= 9 && i.status !== 'resolved' && i.status !== 'closed').length;
       const resolutionRate = safeIssues.length > 0 ? totalResolved / safeIssues.length : 0;
       
       const categoryBreakdown = Object.entries(
          safeIssues.reduce((acc, issue) => {
             acc[issue.category] = (acc[issue.category] || 0) + 1;
             return acc;
          }, {} as Record<string, number>)
       ).map(([category, count]) => ({ category, count }));
       
       const wardComparison = Object.entries(
          safeIssues.reduce((acc, issue) => {
             if (!acc[issue.ward]) acc[issue.ward] = { open: 0, resolved: 0 };
             if (issue.status === 'resolved' || issue.status === 'closed') {
                acc[issue.ward].resolved++;
             } else {
                acc[issue.ward].open++;
             }
             return acc;
          }, {} as Record<string, { open: number, resolved: number }>)
       ).map(([ward, counts]: [string, any]) => ({ ward, open: counts.open, resolved: counts.resolved, score: 85 }));
       
       const weeklyTrend = [
          { week: 'Week -3', reported: 12, resolved: 8 },
          { week: 'Week -2', reported: 15, resolved: 10 },
          { week: 'Week -1', reported: 10, resolved: 14 },
          { week: 'This Week', reported: 8, resolved: 12 },
       ]; // Mocked trend
       
       const topReporters = [
          { userId: '1', name: 'Priya R.', avatar: '', count: 5 },
          { userId: '2', name: 'Arun K.', avatar: '', count: 3 },
       ]; // Mocked reporters

       return res.json({
         success: true,
         data: {
           healthScore,
           totalOpen,
           totalResolved,
           totalCritical,
           resolutionRate,
           avgResolutionDays: 3,
           categoryBreakdown,
           weeklyTrend,
           wardComparison,
           topReporters
         },
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       console.error('[Dashboard]', err);
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
