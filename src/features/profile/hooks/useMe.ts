import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase/client';
import { authedFetch } from '@/lib/api';

export interface MeProfile { id: string; name: string; email?: string; photo?: string | null; karma: number; reports_count: number; }

export function useMe() {
  const uid = auth.currentUser?.uid;
  return useQuery({
    queryKey: ['me', uid],
    enabled: !!uid,
    staleTime: 1000 * 60,
    queryFn: async (): Promise<MeProfile> => {
      const res = await authedFetch('/api/users/me');
      if (!res.ok) throw new Error('Failed to load profile');
      return (await res.json()).data;
    },
  });
}
