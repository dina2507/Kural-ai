import { useQuery } from '@tanstack/react-query';

export function useHealthScore() {
  return useQuery({
    queryKey: ['healthScore'],
    queryFn: async () => {
      const res = await fetch('/api/health-score');
      if (!res.ok) throw new Error('Failed to fetch health score');
      const json = await res.json();
      return json.data;
    }
  });
}
