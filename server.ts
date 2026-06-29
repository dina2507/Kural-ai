import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import multer from 'multer';
import { runVisionAgent } from './src/ai/agents/visionAgent.js';
import { getAdminDb } from './src/lib/firebase/server.js';
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

      const db = getAdminDb();
      
      // PostGIS find nearby issues -> Firebase basic fetch + JS distance
      let nearbyIssues: any[] = [];
      try {
        const issuesSnapshot = await db.collection('issues').get();
        const MAX_RADIUS = 50; // meters
        
        issuesSnapshot.forEach(doc => {
          const i = doc.data();
          if (i.latitude && i.longitude) {
            // Very rough distance calculation for MVP
            const dLat = (i.latitude - lat) * 111320;
            const dLng = (i.longitude - lng) * 40000 * Math.cos(lat * Math.PI / 180);
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist <= MAX_RADIUS) {
              nearbyIssues.push({
                id: doc.id,
                category: i.category,
                title: i.title,
                distance: dist
              });
            }
          }
        });
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
      const db = getAdminDb();

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
          address: 'Address generated from lat/lng', // Placeholder, ideally use geocoding
          ward: 'Unknown Ward', // Placeholder
          images: data.images,
          ai_tags: data.aiTags,
          ai_analysis: data.aiAnalysis,
          reporter_id: reporterId,
          status: 'ai_verified',
          upvotes: 0,
          created_at: new Date().toISOString()
      };

      const docRef = await db.collection('issues').add(newIssue);
      newIssue.id = docRef.id;

      return res.json({
        success: true,
        data: mapIssue(newIssue),
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
      const db = getAdminDb();
      let issuesRef = db.collection('issues');
      let queryRef: any = issuesRef;
      
      if (req.query.status) {
        queryRef = queryRef.where('status', '==', req.query.status);
      }
      if (req.query.category) {
        const cats = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
        queryRef = queryRef.where('category', 'in', cats);
      }

      const snapshot = await queryRef.get();
      
      let finalData: any[] = [];
      snapshot.forEach((doc: any) => {
        finalData.push({ id: doc.id, ...doc.data() });
      });
      finalData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
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
      const db = getAdminDb();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const snapshot = await db.collection('issues')
        .where('created_at', '>=', thirtyDaysAgo.toISOString())
        .get();
        
      let safeIssues: any[] = [];
      snapshot.forEach(doc => {
        safeIssues.push({ id: doc.id, ...doc.data() });
      });
      safeIssues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const analysis = await runCivicMindAgent(safeIssues);
      
      // Store drafts
      if (analysis.clusters && analysis.clusters.length > 0) {
         const batch = db.batch();
         analysis.clusters.forEach(cluster => {
           const draftRef = db.collection('escalation_drafts').doc(cluster.id);
           batch.set(draftRef, {
             ward: cluster.ward,
             category: cluster.category,
             issue_ids: cluster.issueIds,
             urgency_score: cluster.urgencyScore,
             department: cluster.department,
             letter_content: cluster.escalationLetter,
             status: 'draft',
             created_at: new Date().toISOString()
           }, { merge: true });
         });
         await batch.commit();
      }
      
      // Store health score
      await db.collection('city_health_scores').add({
         score: analysis.healthScore,
         rationale: analysis.healthRationale,
         critical_count: analysis.criticalCount,
         total_analyzed: analysis.totalAnalyzed,
         recommended_actions: analysis.recommendedActions,
         created_at: new Date().toISOString()
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
        
        const db = getAdminDb();
        
        // Update issue
        const newStatus = analysis.verified ? 'resolved' : 'in_progress';
        await db.collection('issues').doc(issueId).update({
           resolution_verified: analysis.verified,
           resolution_confidence: analysis.confidence,
           resolution_reasoning: analysis.reasoning,
           status: newStatus,
           resolved_at: analysis.verified ? new Date().toISOString() : null,
           updated_at: new Date().toISOString()
        });
        
        // Timeline event
        await db.collection('issue_timeline').add({
           issue_id: issueId,
           actor_type: 'ai_agent',
           agent_name: 'resolution_agent',
           event_type: 'resolution_verification',
           title: 'Resolution Agent analyzed image',
           description: analysis.reasoning,
           metadata: analysis,
           created_at: new Date().toISOString()
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
      const db = getAdminDb();
      
      const snapshot = await db.collection('city_health_scores')
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();
        
      let data = null;
      if (!snapshot.empty) {
        data = snapshot.docs[0].data();
      }
      
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
       
       const db = getAdminDb();
       
       await db.collection('issue_confirmations').add({
          issue_id: issueId,
          user_id: userId,
          created_at: new Date().toISOString()
       });
       
       // Timeline
       await db.collection('issue_timeline').add({
           issue_id: issueId,
           actor_type: 'citizen',
           actor_id: userId,
           event_type: 'community_verification',
           title: 'Confirmed by citizen',
           created_at: new Date().toISOString()
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
       const db = getAdminDb();
       const issueRef = db.collection('issues').doc(issueId);
       
       const updatedIssue = await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(issueRef);
          if (!doc.exists) {
             throw new Error('Issue not found');
          }
          const upvotes = (doc.data()?.upvotes || 0) + 1;
          transaction.update(issueRef, { upvotes });
          return { id: doc.id, ...doc.data(), upvotes };
       });
       
       return res.json({
         success: true,
         data: mapIssue(updatedIssue),
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.get('/api/issues/:id', async (req, res) => {
     try {
       const db = getAdminDb();
       const doc = await db.collection('issues').doc(req.params.id).get();
       
       if (!doc.exists) {
         return res.status(404).json({ success: false, data: null, error: 'Issue not found', timestamp: new Date().toISOString() });
       }
       
       return res.json({
         success: true,
         data: mapIssue({ id: doc.id, ...doc.data() }),
         timestamp: new Date().toISOString()
       });
     } catch(err) {
       return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString()});
     }
  });

  app.get('/api/issues/:id/timeline', async (req, res) => {
     try {
       const db = getAdminDb();
       const snapshot = await db.collection('issue_timeline')
         .where('issue_id', '==', req.params.id)
         .orderBy('created_at', 'asc')
         .get();
         
       const data: any[] = [];
       snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
       
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
       const db = getAdminDb();
       const snapshot = await db.collection('escalation_drafts')
         .orderBy('urgency_score', 'desc')
         .get();
         
       const data: any[] = [];
       snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
       
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
       const db = getAdminDb();
       await db.collection('escalation_drafts').doc(req.params.id).update({ status: 'sent' });
       
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
       
       const db = getAdminDb();
       
       const snapshot = await db.collection('issues')
          .where('ward', '==', ward)
          .where('created_at', '>=', weekStart)
          .where('created_at', '<=', weekEnd)
          .get();
          
       let safeIssues: any[] = [];
       snapshot.forEach(doc => {
          safeIssues.push({ id: doc.id, ...doc.data() });
       });
       
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
       const reportRef = db.collection('ward_reports').doc(`${ward}-${weekStart}`);
       await reportRef.set({
          ward,
          week_start: weekStart,
          week_end: weekEnd,
          report_content: analysis,
          stats,
          created_at: new Date().toISOString()
       }, { merge: true });
       
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
       const db = getAdminDb();
       
       const healthSnapshot = await db.collection('city_health_scores')
         .orderBy('created_at', 'desc')
         .limit(1)
         .get();
         
       const healthScore = !healthSnapshot.empty ? healthSnapshot.docs[0].data().score : 85;

       const period = req.query.period as string || '30d';
       const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
       const since = new Date();
       since.setDate(since.getDate() - days);
       
       const snapshot = await db.collection('issues')
         .where('created_at', '>=', since.toISOString())
         .get();
         
       let safeIssues: any[] = [];
       snapshot.forEach(doc => safeIssues.push({ id: doc.id, ...doc.data() }));
       
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
