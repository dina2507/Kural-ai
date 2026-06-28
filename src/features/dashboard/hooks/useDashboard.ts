import { useQuery } from '@tanstack/react-query';

export function useDashboard(period = '30d') {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      return json.data;
    }
  });
}
