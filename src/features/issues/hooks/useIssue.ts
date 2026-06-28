import { useQuery } from '@tanstack/react-query';
import { Issue } from '../types/issue.types';

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: async (): Promise<Issue> => {
      const res = await fetch(`/api/issues/${id}`);
      if (!res.ok) throw new Error('Failed to fetch issue');
      
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
