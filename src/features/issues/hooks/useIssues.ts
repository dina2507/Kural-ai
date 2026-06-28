import { useQuery } from '@tanstack/react-query';
import { Issue } from '../types/issue.types';

export function useIssues(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: async (): Promise<Issue[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      
      const res = await fetch(`/api/issues?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch issues');
      
      const json = await res.json();
      return json.data;
    },
  });
}
