import { useQuery } from '@tanstack/react-query';

export function useIssueTimeline(id: string) {
  return useQuery({
    queryKey: ['issueTimeline', id],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${id}/timeline`);
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
