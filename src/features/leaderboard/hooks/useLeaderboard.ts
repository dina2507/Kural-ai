import { useQuery } from '@tanstack/react-query';

export interface LeaderboardUser { id: string; name: string; photo?: string | null; karma: number; reports_count?: number; }

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardUser[]> => {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to load leaderboard');
      return (await res.json()).data;
    },
  });
}
