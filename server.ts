import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import multer from 'multer';
import { runVisionAgent } from './src/ai/agents/visionAgent.js';
import { createServerSupabaseClient } from './src/lib/supabase/server.js';
import { createIssueSchema } from './src/lib/validators/issue.validator.js';

const upload = multer({ storage: multer.memoryStorage() });

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
      
      // In a real app we would use ST_Point, but since we rely on the PostGIS schema:
      // Insert with location
      const { data: issue, error } = await supabase
        .from('issues')
        .insert({
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
          status: 'ai_verified'
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }

      // We should also insert into issue_timeline, but skipping for brevity if not strictly needed
      // returning issue
      return res.json({
        success: true,
        data: issue,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
       console.error('[CreateIssue]', error);
       return res.status(500).json({
         success: false,
         data: null,
         error: error instanceof Error ? error.message : 'Server error',
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
