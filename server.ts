import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

import multer from 'multer';
import { runVisionAgent } from './src/ai/agents/visionAgent.js';
import { getDb } from './src/lib/firebase/server.js';
import { verifyIdToken } from './src/lib/firebase/verifyToken.js';
import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc, setDoc,
  query, where, orderBy, limit, writeBatch, runTransaction, startAfter
} from 'firebase/firestore';
import { createIssueSchema } from './src/lib/validators/issue.validator.js';

import { runCivicMindAgent } from './src/ai/agents/civicMindAgent.js';
import { runResolutionAgent } from './src/ai/agents/resolutionAgent.js';
import { runDigestAgent } from './src/ai/agents/digestAgent.js';
import { reverseGeocode } from './src/lib/utils/geocode.js';
import { lookupAuthority } from './src/lib/authorities/directory.js';
import { runAuthorityRouterAgent } from './src/ai/agents/authorityRouterAgent.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const aiLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true });

async function getUser(req: express.Request) {
  const h = req.headers['authorization'] || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return { uid: null, email: null, name: null, photo: null };
  try { return await verifyIdToken(token); }
  catch { return { uid: null, email: null, name: null, photo: null }; }
}

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
    reporterName: row.reporter_name || 'Citizen',
    upvotes: row.upvotes || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || null,
  };
}

import { auth } from './src/lib/firebase/client.js';
import { signInAnonymously } from 'firebase/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  try {
    await signInAnonymously(auth);
    console.log('Server authenticated anonymously with Firebase');
  } catch (err) {
    console.error('Failed to authenticate server with Firebase:', err);
  }

  app.use(helmet({ contentSecurityPolicy: false })); // disable CSP for MVP to avoid breaking Vite HMR
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), authUid: auth.currentUser?.uid || null });
  });

  app.post('/api/users/sync', async (req, res) => {
    try {
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Not signed in', timestamp: new Date().toISOString() });
      const db = getDb();
      const userRef = doc(db, 'users', u.uid);
      const snap = await getDoc(userRef);
      
      const role = u.email === 'dinagar2505@gmail.com' ? 'admin' : 'citizen';
      
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: u.email, name: u.name || 'Citizen', photo: u.photo || null,
          role: role, karma: 0, reports_count: 0, created_at: new Date().toISOString(),
        });
      } else {
        const existingRole = snap.data()?.role;
        const newRole = u.email === 'dinagar2505@gmail.com' ? 'admin' : existingRole;
        await setDoc(userRef, { email: u.email, name: u.name || snap.data()?.name, photo: u.photo || snap.data()?.photo || null, role: newRole }, { merge: true });
      }
      return res.json({ success: true, data: { uid: u.uid }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'users'), orderBy('karma', 'desc'), limit(20)));
      const data: any[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      return res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/users/me', async (req, res) => {
    try {
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Not signed in', timestamp: new Date().toISOString() });
      const db = getDb();
      const snap = await getDoc(doc(db, 'users', u.uid));
      const data = snap.exists() ? { id: snap.id, ...snap.data() } : { id: u.uid, name: u.name || 'Citizen', role: 'citizen', karma: 0, reports_count: 0 };
      return res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.put('/api/users/me', async (req, res) => {
    try {
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Not signed in', timestamp: new Date().toISOString() });
      const db = getDb();
      const userRef = doc(db, 'users', u.uid);
      
      const { name } = req.body;
      if (name !== undefined) {
        await setDoc(userRef, { name }, { merge: true });
      }
      
      const snap = await getDoc(userRef);
      return res.json({ success: true, data: { id: snap.id, ...snap.data() }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      if (req.params.id === 'me') return; // Handled above
      const db = getDb();
      const snap = await getDoc(doc(db, 'users', req.params.id));
      if (!snap.exists()) {
        return res.status(404).json({ success: false, data: null, error: 'User not found', timestamp: new Date().toISOString() });
      }
      return res.json({ success: true, data: { id: snap.id, ...snap.data() }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/agents/vision', aiLimiter, upload.single('image'), async (req, res) => {
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

      const db = getDb();

      let nearbyIssues: any[] = [];
      try {
        const issuesSnapshot = await getDocs(collection(db, 'issues'));
        const MAX_RADIUS = 50; // meters
        issuesSnapshot.forEach((d) => {
          const i = d.data();
          if (i.latitude && i.longitude) {
            const dLat = (i.latitude - lat) * 111320;
            const dLng = (i.longitude - lng) * 40000 * Math.cos(lat * Math.PI / 180);
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist <= MAX_RADIUS) {
              nearbyIssues.push({ id: d.id, category: i.category, title: i.title, distance: dist });
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
        nearbyIssues,
      });

      return res.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[VisionAgent]', error);
      return res.status(500).json({ success: false, data: null, error: error instanceof Error ? error.message : 'Agent failed', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/issues', async (req, res) => {
    try {
      const validation = createIssueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, data: null, error: validation.error.message, timestamp: new Date().toISOString() });
      }

      const data = validation.data;
      const db = getDb();
      const u = await getUser(req);
      if (!u.uid) {
        return res.status(401).json({ success: false, data: null, error: 'Please sign in to report an issue.', timestamp: new Date().toISOString() });
      }

      const geo = await reverseGeocode(data.latitude, data.longitude);
      const resolvedWard = geo?.ward || geo?.locality || geo?.city || 'Unknown Ward';
      const resolvedAddress = geo?.formatted || `${data.latitude}, ${data.longitude}`;

      const newIssue: any = {
          title: data.title,
          description: data.description,
          category: data.category,
          severity: data.severity,
          latitude: data.latitude,
          longitude: data.longitude,
          address: resolvedAddress,
          ward: resolvedWard,
          images: data.images,
          ai_tags: data.aiTags,
          ai_analysis: data.aiAnalysis,
          reporter_id: u.uid,
          reporter_name: u.name || 'Citizen',
          status: 'ai_verified',
          upvotes: 0,
          confirmation_count: 0,
          created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'issues'), newIssue);
      newIssue.id = docRef.id;

      // Award karma for reporting (+10) and bump the user's report count.
      try {
        const userRef = doc(db, 'users', u.uid);
        await runTransaction(db, async (tx) => {
          const us = await tx.get(userRef);
          if (us.exists()) {
            tx.update(userRef, {
              karma: (us.data()?.karma || 0) + 10,
              reports_count: (us.data()?.reports_count || 0) + 1,
            });
          } else {
            tx.set(userRef, { email: u.email, name: u.name || 'Citizen', photo: u.photo || null, role: 'citizen', karma: 10, reports_count: 1, created_at: new Date().toISOString() });
          }
        });
      } catch (_) { /* karma is best-effort */ }

      return res.json({ success: true, data: mapIssue(newIssue), timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('[CreateIssue]', error);
      return res.status(500).json({ success: false, data: null, error: error instanceof Error ? error.message : String(error), timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/issues', async (req, res) => {
    try {
      const db = getDb();
      const constraints: any[] = [];
      if (req.query.status) {
        constraints.push(where('status', '==', req.query.status));
      }
      if (req.query.category) {
        const cats = Array.isArray(req.query.category) ? req.query.category : [req.query.category];
        constraints.push(where('category', 'in', cats));
      }
      if (req.query.reporterId) {
        constraints.push(where('reporter_id', '==', req.query.reporterId));
      }

      constraints.push(orderBy('created_at', 'desc'));

      const limitNum = parseInt((req.query.limit as string) || '30', 10);
      constraints.push(limit(limitNum));

      if (req.query.cursor) {
        const docSnap = await getDoc(doc(db, 'issues', req.query.cursor as string));
        if (docSnap.exists()) {
          constraints.push(startAfter(docSnap));
        }
      }

      const ref = query(collection(db, 'issues'), ...constraints);
      const snapshot = await getDocs(ref);

      let finalData: any[] = [];
      snapshot.forEach((d) => finalData.push({ id: d.id, ...d.data() }));

      const nextCursor = finalData.length === limitNum ? finalData[finalData.length - 1].id : null;

      return res.json({ success: true, data: finalData.map(mapIssue), nextCursor, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/agents/civic-mind', aiLimiter, async (req, res) => {
    try {
      const db = getDb();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const snapshot = await getDocs(
        query(collection(db, 'issues'), where('created_at', '>=', thirtyDaysAgo.toISOString()))
      );

      let safeIssues: any[] = [];
      snapshot.forEach((d) => safeIssues.push({ id: d.id, ...d.data() }));
      safeIssues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const analysis = await runCivicMindAgent(safeIssues);

      if (analysis.clusters && analysis.clusters.length > 0) {
        const batch = writeBatch(db);
        analysis.clusters.forEach((cluster) => {
          const draftRef = doc(db, 'escalation_drafts', cluster.id);
          batch.set(draftRef, {
            ward: cluster.ward,
            category: cluster.category,
            issue_ids: cluster.issueIds,
            urgency_score: cluster.urgencyScore,
            department: cluster.department,
            letter_content: cluster.escalationLetter,
            status: 'draft',
            created_at: new Date().toISOString(),
          }, { merge: true });
        });
        await batch.commit();
      }

      await addDoc(collection(db, 'city_health_scores'), {
        score: analysis.healthScore,
        rationale: analysis.healthRationale,
        critical_count: analysis.criticalCount,
        total_analyzed: analysis.totalAnalyzed,
        recommended_actions: analysis.recommendedActions,
        created_at: new Date().toISOString(),
      });

      return res.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[CivicMind]', err);
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Agent failed', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/agents/resolution', aiLimiter, upload.single('afterImage'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, data: null, error: 'No image provided', timestamp: new Date().toISOString() });
      }

      const { issueId, category, originalDescription } = req.body;
      if (!issueId) {
        return res.status(400).json({ success: false, data: null, error: 'Missing issueId', timestamp: new Date().toISOString() });
      }

      const db = getDb();

      // Use the issue's ORIGINAL stored photo as the "before" image (no client-supplied dummy).
      const issueSnap0 = await getDoc(doc(db, 'issues', issueId));
      if (!issueSnap0.exists()) {
        return res.status(404).json({ success: false, data: null, error: 'Issue not found', timestamp: new Date().toISOString() });
      }
      const issueData0 = issueSnap0.data() as any;
      const beforeUrl = (issueData0.images || [])[0];
      if (!beforeUrl) {
        return res.status(400).json({ success: false, data: null, error: 'This issue has no original photo to compare against.', timestamp: new Date().toISOString() });
      }

      let beforeImageBase64 = '';
      let beforeMimeType = 'image/jpeg';
      try {
        const imgRes = await fetch(beforeUrl);
        if (!imgRes.ok) throw new Error('image fetch failed');
        beforeMimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        beforeImageBase64 = Buffer.from(await imgRes.arrayBuffer()).toString('base64');
      } catch (_) {
        return res.status(502).json({ success: false, data: null, error: 'Could not load the original photo for comparison.', timestamp: new Date().toISOString() });
      }

      const afterImageBase64 = req.file.buffer.toString('base64');
      const analysis = await runResolutionAgent({
        beforeImageBase64,
        afterImageBase64,
        beforeMimeType,
        afterMimeType: req.file.mimetype,
        category: category || issueData0.category,
        originalDescription: originalDescription || issueData0.description,
      });

      const newStatus = analysis.verified ? 'resolved' : 'in_progress';
      await updateDoc(doc(db, 'issues', issueId), {
        resolution_verified: analysis.verified,
        resolution_confidence: analysis.confidence,
        resolution_reasoning: analysis.reasoning,
        status: newStatus,
        resolved_at: analysis.verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });

        if (analysis.verified) {
          try {
            const issueSnap = await getDoc(doc(db, 'issues', issueId));
            const reporterId = issueSnap.data()?.reporter_id;
            if (reporterId) {
              const rRef = doc(db, 'users', reporterId);
              await runTransaction(db, async (tx) => {
                const us = await tx.get(rRef);
                if (us.exists()) tx.update(rRef, { karma: (us.data()?.karma || 0) + 30 });
              });
            }
          } catch (_) {}
        }

      await addDoc(collection(db, 'issue_timeline'), {
        issue_id: issueId,
        actor_type: 'ai_agent',
        agent_name: 'resolution_agent',
        event_type: 'resolution_verification',
        title: 'Resolution Agent analyzed image',
        description: analysis.reasoning,
        metadata: analysis,
        created_at: new Date().toISOString(),
      });

      return res.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[ResolutionAgent]', err);
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Agent failed', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/health-score', async (req, res) => {
    try {
      const db = getDb();
      
      const allIssuesSnapshot = await getDocs(collection(db, 'issues'));
      let allIssues: any[] = [];
      allIssuesSnapshot.forEach(d => allIssues.push(d.data()));
      const globalOpen = allIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
      const computedScore = Math.max(10, 100 - (globalOpen * 5));

      const snapshot = await getDocs(
        query(collection(db, 'city_health_scores'), orderBy('created_at', 'desc'), limit(1))
      );
      let data: any = null;
      if (!snapshot.empty) data = snapshot.docs[0].data();
      return res.json({ success: true, data: data || { score: computedScore, rationale: 'Calculated dynamically based on open issues' }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/issues/:id/confirm', async (req, res) => {
    try {
      const issueId = req.params.id;
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Please sign in to confirm.', timestamp: new Date().toISOString() });
      const userId = u.uid;
      const db = getDb();
      const issueRef = doc(db, 'issues', issueId);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(issueRef);
        if (!snap.exists()) throw new Error('Issue not found');
        const count = (snap.data()?.confirmation_count || 0) + 1;
        const update: any = { confirmation_count: count, updated_at: new Date().toISOString() };
        if (count >= 5 && snap.data()?.status === 'ai_verified') {
          update.status = 'community_confirmed';
        }
        tx.update(issueRef, update);
        tx.set(doc(collection(db, 'issue_confirmations')), {
          issue_id: issueId, user_id: userId, created_at: new Date().toISOString(),
        });
      });

      await addDoc(collection(db, 'issue_timeline'), {
        issue_id: issueId,
        actor_type: 'citizen',
        actor_id: userId,
        event_type: 'community_verification',
        title: 'Confirmed by citizen',
        created_at: new Date().toISOString(),
      });

      // Karma +5 for community confirmation (best-effort)
      try {
        const cRef = doc(db, 'users', userId);
        await runTransaction(db, async (tx) => {
          const us = await tx.get(cRef);
          if (us.exists()) tx.update(cRef, { karma: (us.data()?.karma || 0) + 5 });
        });
      } catch (_) {}

      return res.json({ success: true, data: { confirmed: true }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/issues/:id/upvote', async (req, res) => {
    try {
      const issueId = req.params.id;
      const db = getDb();
      const issueRef = doc(db, 'issues', issueId);

      const updatedIssue = await runTransaction(db, async (tx) => {
        const snap = await tx.get(issueRef);
        if (!snap.exists()) throw new Error('Issue not found');
        const upvotes = (snap.data()?.upvotes || 0) + 1;
        tx.update(issueRef, { upvotes });
        return { id: snap.id, ...snap.data(), upvotes };
      });

      return res.json({ success: true, data: mapIssue(updatedIssue), timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/issues/:id', async (req, res) => {
    try {
      const db = getDb();
      const snap = await getDoc(doc(db, 'issues', req.params.id));
      if (!snap.exists()) {
        return res.status(404).json({ success: false, data: null, error: 'Issue not found', timestamp: new Date().toISOString() });
      }
      return res.json({ success: true, data: mapIssue({ id: snap.id, ...snap.data() }), timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/issues/:id/comments', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user.uid) {
        return res.status(401).json({ success: false, data: null, error: 'Unauthorized', timestamp: new Date().toISOString() });
      }
      const userId = user.uid;

      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, data: null, error: 'Comment text is required', timestamp: new Date().toISOString() });
      }

      const db = getDb();
      
      const userSnap = await getDoc(doc(db, 'users', userId));
      const userData = userSnap.data();
      const role = userData?.role || 'citizen';
      const actorType = role === 'official' || role === 'admin' ? 'municipality' : 'citizen';

      await addDoc(collection(db, 'issue_timeline'), {
        issue_id: req.params.id,
        actor_type: actorType,
        actor_id: userId,
        agent_name: userData?.name || 'User',
        event_type: 'comment',
        title: 'Comment Added',
        description: text,
        metadata: {},
        created_at: new Date().toISOString()
      });

      return res.json({ success: true, data: { status: 'added' }, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ success: false, data: null, error: 'Internal server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/issues/:id/timeline', async (req, res) => {
    try {
      const db = getDb();
      const snapshot = await getDocs(
        query(collection(db, 'issue_timeline'), where('issue_id', '==', req.params.id))
      );
      const data: any[] = [];
      snapshot.forEach((d) => data.push({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/escalation-drafts', async (req, res) => {
    try {
      const db = getDb();
      const snapshot = await getDocs(
        query(collection(db, 'escalation_drafts'), orderBy('urgency_score', 'desc'))
      );
      const data: any[] = [];
      snapshot.forEach((d) => data.push({ id: d.id, ...d.data() }));
      return res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.patch('/api/escalation-drafts/:id/send', async (req, res) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'escalation_drafts', req.params.id), { status: 'sent' });
      return res.json({ success: true, data: { sent: true }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/agents/digest', aiLimiter, async (req, res) => {
    try {
      const { ward, weekStart, weekEnd } = req.body;
      if (!ward || !weekStart || !weekEnd) {
        return res.status(400).json({ success: false, data: null, error: 'Missing ward or dates', timestamp: new Date().toISOString() });
      }

      const db = getDb();
      const snapshot = await getDocs(
        query(collection(db, 'issues'), where('ward', '==', ward))
      );

      let safeIssues: any[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.created_at >= weekStart && data.created_at <= weekEnd) {
          safeIssues.push({ id: d.id, ...data });
        }
      });

      const total = safeIssues.length;
      const resolved = safeIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
      const open = total - resolved;
      const critical = safeIssues.filter((i) => i.severity >= 9 && (i.status !== 'resolved' && i.status !== 'closed')).length;
      const resolutionRate = total > 0 ? resolved / total : 0;

      const categoryCounts = safeIssues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b))
        : 'None';

      const resolvedTimed = safeIssues.filter((i) => i.resolved_at && i.created_at);
      const avgResolutionDays = resolvedTimed.length
        ? Math.round(resolvedTimed.reduce((s, i) => s + (new Date(i.resolved_at).getTime() - new Date(i.created_at).getTime()) / 86400000, 0) / resolvedTimed.length)
        : 0;
      const stats = { total, resolved, open, critical, resolutionRate, topCategory, avgResolutionDays };

      const notableIssues = safeIssues.slice(0, 3).map((i) => ({
        title: i.title,
        category: i.category,
        status: i.status,
        daysOpen: Math.floor((new Date().getTime() - new Date(i.created_at).getTime()) / 86400000),
      }));

      // Real citizen hero = top reporter in this ward/period
      let citizenHero: { name: string; reportsCount: number; karma: number } | null = null;
      const heroCounts = safeIssues.reduce((acc, i) => {
        const id = i.reporter_id;
        if (!id || id === '00000000-0000-0000-0000-000000000000') return acc;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const heroId = Object.keys(heroCounts).sort((a, b) => heroCounts[b] - heroCounts[a])[0];
      if (heroId) {
        const heroSnap = await getDoc(doc(db, 'users', heroId));
        const hd = heroSnap.data() as any;
        citizenHero = { name: hd?.name || 'Citizen', reportsCount: heroCounts[heroId], karma: hd?.karma || 0 };
      }

      const analysis = await runDigestAgent({
        ward, weekStart, weekEnd, stats,
        citizenHero,
        notableIssues,
      });

      const reportRef = doc(db, 'ward_reports', `${ward}-${weekStart}`);
      await setDoc(reportRef, {
        ward, week_start: weekStart, week_end: weekEnd,
        report_content: analysis, stats, created_at: new Date().toISOString(),
      }, { merge: true });

      return res.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('[DigestAgent]', err);
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/dashboard', async (req, res) => {
    try {
      const db = getDb();
      
      const allIssuesSnapshot = await getDocs(query(collection(db, 'issues'), limit(100)));
      let allIssues: any[] = [];
      allIssuesSnapshot.forEach(d => allIssues.push(d.data()));
      const globalOpen = allIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
      const computedScore = Math.max(10, 100 - (globalOpen * 5)); // Minus 5 points per open issue, floor at 10

      const healthSnapshot = await getDocs(
        query(collection(db, 'city_health_scores'), orderBy('created_at', 'desc'), limit(1))
      );
      const healthScore = !healthSnapshot.empty ? healthSnapshot.docs[0].data().score : computedScore;

      const period = (req.query.period as string) || '30d';
      const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const snapshot = await getDocs(
        query(collection(db, 'issues'), where('created_at', '>=', since.toISOString()), limit(100))
      );

      let safeIssues: any[] = [];
      snapshot.forEach((d) => safeIssues.push({ id: d.id, ...d.data() }));

      const totalOpen = safeIssues.filter((i) => i.status !== 'resolved' && i.status !== 'closed').length;
      const totalResolved = safeIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
      const totalCritical = safeIssues.filter((i) => i.severity >= 9 && i.status !== 'resolved' && i.status !== 'closed').length;
      const resolutionRate = safeIssues.length > 0 ? totalResolved / safeIssues.length : 0;

      const categoryBreakdown = Object.entries(
        safeIssues.reduce((acc, issue) => { acc[issue.category] = (acc[issue.category] || 0) + 1; return acc; }, {} as Record<string, number>)
      ).map(([category, count]) => ({ category, count }));

      const wardComparison = Object.entries(
        safeIssues.reduce((acc, issue) => {
          if (!acc[issue.ward]) acc[issue.ward] = { open: 0, resolved: 0, total: 0 };
          acc[issue.ward].total++;
          if (issue.status === 'resolved' || issue.status === 'closed') acc[issue.ward].resolved++;
          else acc[issue.ward].open++;
          return acc;
        }, {} as Record<string, { open: number; resolved: number; total: number }>)
      ).map(([ward, counts]: [string, any]) => {
         const wardScore = Math.max(10, 100 - (counts.open * 5));
         return { ward, open: counts.open, resolved: counts.resolved, score: wardScore };
      });

      // Real 4-week trend (reported by created_at, resolved by resolved_at)
      const trendSince = new Date();
      trendSince.setDate(trendSince.getDate() - 28);
      const trendSnap = await getDocs(query(collection(db, 'issues'), where('created_at', '>=', trendSince.toISOString())));
      const trendIssues: any[] = [];
      trendSnap.forEach((d) => trendIssues.push(d.data()));

      const now = Date.now();
      const weeklyTrend = [3, 2, 1, 0].map((w) => {
        const start = now - (w + 1) * 7 * 86400000;
        const end = now - w * 7 * 86400000;
        const reported = trendIssues.filter((i) => {
          const t = new Date(i.created_at).getTime();
          return t >= start && t < end;
        }).length;
        const resolved = trendIssues.filter((i) => {
          const r = i.resolved_at ? new Date(i.resolved_at).getTime() : NaN;
          return !isNaN(r) && r >= start && r < end;
        }).length;
        return { week: w === 0 ? 'This Week' : `Week -${w}`, reported, resolved };
      });

      // Real top reporters from the selected period
      const reporterMap = safeIssues.reduce((acc, i) => {
        const id = i.reporter_id || 'unknown';
        if (id === '00000000-0000-0000-0000-000000000000' || id === 'unknown') return acc;
        if (!acc[id]) acc[id] = { userId: id, name: i.reporter_name || 'Citizen', avatar: '', count: 0 };
        acc[id].count++;
        return acc;
      }, {} as Record<string, { userId: string; name: string; avatar: string; count: number }>);
      const topReporters = (Object.values(reporterMap) as { userId: string; name: string; avatar: string; count: number }[])
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const resolvedIssues = safeIssues.filter(i => (i.status === 'resolved' || i.status === 'closed') && i.resolved_at);
      let avgResolutionDays = 0;
      if (resolvedIssues.length > 0) {
         const totalMs = resolvedIssues.reduce((acc, i) => {
             const created = new Date(i.created_at).getTime();
             const resolved = new Date(i.resolved_at).getTime();
             return acc + (resolved - created);
         }, 0);
         avgResolutionDays = totalMs / resolvedIssues.length / (1000 * 60 * 60 * 24);
      }

      return res.json({
        success: true,
        data: { healthScore, totalOpen, totalResolved, totalCritical, resolutionRate, avgResolutionDays, categoryBreakdown, weeklyTrend, wardComparison, topReporters },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Dashboard]', err);
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.get('/api/authority/resolve', async (req, res) => {
    try {
      const lat = parseFloat(String(req.query.lat));
      const lng = parseFloat(String(req.query.lng));
      const category = String(req.query.category || 'other');
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ success: false, data: null, error: 'Invalid coordinates', timestamp: new Date().toISOString() });
      }

      const geo = await reverseGeocode(lat, lng);
      const locationLabel = geo?.formatted || `${lat}, ${lng}`;

      // 1) Verified directory match
      let entry = lookupAuthority(geo, category);
      let resolvedVia = 'directory';
      let verified = !!entry;

      // 2) AI fallback — names the body (+ helpline only if confident). No auto-dial WhatsApp number.
      if (!entry) {
        try {
          const ai = await runAuthorityRouterAgent({ category, location: geo || {} });
          entry = {
            name: ai.authorityName,
            whatsapp: null,
            helpline: ai.helpline,
            categories: ['*'],
            source: `AI-suggested (confidence ${Math.round(ai.confidence * 100)}%) — verify before relying`,
          };
          resolvedVia = 'ai';
          verified = false;
        } catch (_) { /* fall through */ }
      }

      // 3) Last-resort generic
      if (!entry) {
        entry = { name: 'Local Municipal Body', whatsapp: null, helpline: null, categories: ['*'], source: 'generic fallback' };
        resolvedVia = 'fallback';
        verified = false;
      }

      return res.json({
        success: true,
        data: {
          name: entry.name,
          whatsapp: entry.whatsapp,
          helpline: entry.helpline,
          source: entry.source,
          locationLabel,
          resolvedVia,
          verified,
          geo,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.patch('/api/issues/:id/status', async (req, res) => {
    try {
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Please sign in.', timestamp: new Date().toISOString() });

      const db = getDb();

      // Server-side role check — never trust the client for this.
      const meSnap = await getDoc(doc(db, 'users', u.uid));
      const role = meSnap.data()?.role || 'citizen';
      if (role !== 'official' && role !== 'admin') {
        return res.status(403).json({ success: false, data: null, error: 'Only officials can update issue status.', timestamp: new Date().toISOString() });
      }

      const { status, note } = req.body || {};
      const allowed = ['in_progress', 'resolved', 'rejected', 'closed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, data: null, error: 'Invalid status', timestamp: new Date().toISOString() });
      }

      const issueRef = doc(db, 'issues', req.params.id);
      const issueSnap = await getDoc(issueRef);
      if (!issueSnap.exists()) {
        return res.status(404).json({ success: false, data: null, error: 'Issue not found', timestamp: new Date().toISOString() });
      }
      const prevStatus = issueSnap.data()?.status;

      const update: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved') update.resolved_at = new Date().toISOString();
      await updateDoc(issueRef, update);

      // Timeline entry (renders in the existing IssueTimeline as a "municipality" action)
      await addDoc(collection(db, 'issue_timeline'), {
        issue_id: req.params.id,
        actor_type: 'municipality',
        actor_id: u.uid,
        event_type: 'status_update',
        title: `Marked ${String(status).replace('_', ' ')} by ${u.name || 'official'}`,
        description: note || null,
        created_at: new Date().toISOString(),
      });

      // Award the reporter +30 karma the first time an issue becomes resolved.
      if (status === 'resolved' && prevStatus !== 'resolved') {
        const reporterId = issueSnap.data()?.reporter_id;
        if (reporterId) {
          try {
            const rRef = doc(db, 'users', reporterId);
            await runTransaction(db, async (tx) => {
              const us = await tx.get(rRef);
              if (us.exists()) tx.update(rRef, { karma: (us.data()?.karma || 0) + 30 });
            });
          } catch (_) {}
        }
      }

      return res.json({ success: true, data: { status }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  app.post('/api/admin/grant-role', async (req, res) => {
    try {
      const u = await getUser(req);
      if (!u.uid) return res.status(401).json({ success: false, data: null, error: 'Unauthorized', timestamp: new Date().toISOString() });
      const db = getDb();
      const adminSnap = await getDoc(doc(db, 'users', u.uid));
      if (!adminSnap.exists() || adminSnap.data()?.role !== 'admin') {
        return res.status(403).json({ success: false, data: null, error: 'Forbidden', timestamp: new Date().toISOString() });
      }

      const { targetUid, role } = req.body;
      if (!targetUid || !['citizen', 'official', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, data: null, error: 'Invalid parameters', timestamp: new Date().toISOString() });
      }

      await updateDoc(doc(db, 'users', targetUid), { role });
      return res.json({ success: true, data: { role }, timestamp: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ success: false, data: null, error: err instanceof Error ? err.message : 'Server error', timestamp: new Date().toISOString() });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }

  app.listen(PORT, '0.0.0.0', () => { console.log(`Server running on http://localhost:${PORT}`); });
}

startServer();
