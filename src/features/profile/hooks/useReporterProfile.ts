import { useQuery } from '@tanstack/react-query';

export interface ReporterProfile {
  id: string;
  name: string;
  karma: number;
  photo?: string;
}

export function useReporterProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId],
    enabled: !!userId && userId !== '00000000-0000-0000-0000-000000000000' && userId !== 'unknown',
    queryFn: async (): Promise<ReporterProfile> => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to load user profile');
      return (await res.json()).data;
    },
  });
}
