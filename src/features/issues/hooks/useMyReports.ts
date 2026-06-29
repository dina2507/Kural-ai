import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase/client';
import { authedFetch } from '@/lib/api';
import { Issue } from '../types/issue.types';

export function useMyReports() {
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ['myReports', uid],
    enabled: !!uid,
    queryFn: async (): Promise<Issue[]> => {
      const res = await authedFetch(`/api/issues?reporterId=${uid}`);
      if (!res.ok) throw new Error('Failed to load your reports');
      const json = await res.json();
      return json.data;
    },
  });
}
