import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (!user) return [];

      // 1. Get issues reported by the user
      const issuesQuery = query(
        collection(db, 'issues'),
        where('reporter_id', '==', user.uid)
      );
      const issuesSnap = await getDocs(issuesQuery);
      
      if (issuesSnap.empty) return [];
      
      const issuesMap = new Map();
      issuesSnap.docs.forEach(doc => {
          issuesMap.set(doc.id, doc.data());
      });
      
      const issueIds = Array.from(issuesMap.keys());
      
      // 2. Fetch timeline events for these issues
      const chunks = [];
      for (let i = 0; i < issueIds.length; i += 10) {
        chunks.push(issueIds.slice(i, i + 10));
      }
      
      let allEvents: any[] = [];
      
      for (const chunk of chunks) {
        const eventsQuery = query(
          collection(db, 'issue_timeline'),
          where('issue_id', 'in', chunk)
        );
        const eventsSnap = await getDocs(eventsQuery);
        eventsSnap.forEach(doc => {
          const data = doc.data();
          if (data.event_type === 'status_update' || data.event_type === 'comment') {
            if (data.actor_id !== user.uid) {
              allEvents.push({ 
                  id: doc.id, 
                  issueTitle: issuesMap.get(data.issue_id)?.title || 'Your issue',
                  ...data 
              });
            }
          }
        });
      }
      
      allEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return allEvents;
    },
    enabled: !!auth.currentUser,
  });
}
