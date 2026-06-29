import { useQuery } from '@tanstack/react-query';

export interface ResolvedAuthority {
  name: string;
  whatsapp: string | null;
  helpline: string | null;
  source: string;
  locationLabel: string;
  resolvedVia: string;
  verified: boolean;
}

export function useAuthority(issue?: { latitude: number; longitude: number; category: string }) {
  return useQuery({
    queryKey: ['authority', issue?.latitude, issue?.longitude, issue?.category],
    enabled: !!issue && Number.isFinite(issue.latitude) && Number.isFinite(issue.longitude),
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<ResolvedAuthority> => {
      const p = new URLSearchParams({
        lat: String(issue!.latitude),
        lng: String(issue!.longitude),
        category: issue!.category,
      });
      const res = await fetch(`/api/authority/resolve?${p.toString()}`);
      if (!res.ok) throw new Error('Failed to resolve authority');
      const json = await res.json();
      return json.data;
    },
  });
}
