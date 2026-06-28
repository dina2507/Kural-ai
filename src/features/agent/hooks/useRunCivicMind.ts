import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CivicMindOutput } from '../../../ai/schemas/civicMindOutput.schema';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/utils/errorParser';

export function useRunCivicMind() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<CivicMindOutput> => {
      const res = await fetch('/api/agents/civic-mind', {
        method: 'POST',
      });
      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(parseApiError(errorRes.error, 'Failed to run CivicMind'));
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['healthScore'] });
      queryClient.invalidateQueries({ queryKey: ['escalationDrafts'] });
      toast.success(`Pattern scan complete — ${data.clusters?.length || 0} clusters found.`);
    },
    onError: (err) => {
      toast.error(err.message || 'Pattern scan failed.');
    }
  });
}

