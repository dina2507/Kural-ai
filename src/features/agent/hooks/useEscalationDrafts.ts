import { useQuery } from '@tanstack/react-query';

export function useEscalationDrafts() {
  return useQuery({
    queryKey: ['escalationDrafts'],
    queryFn: async () => {
      const res = await fetch('/api/escalation-drafts');
      if (!res.ok) throw new Error('Failed to fetch drafts');
      const json = await res.json();
      return json.data;
    }
  });
}
