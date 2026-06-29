import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Issue } from '../types/issue.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/utils/errorParser';
import { authedFetch } from '@/lib/api';

import { hapticFeedback } from '@/lib/haptics';

export function useCreateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any): Promise<Issue> => {
      const res = await authedFetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const errRes = await res.json();
        throw new Error(parseApiError(errRes.error, 'Failed to create issue'));
      }
      
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      hapticFeedback.success();
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue reported. Community will verify it shortly.');
    },
    onError: (err) => {
       hapticFeedback.error();
       toast.error(err.message || 'Failed to submit issue.');
    }
  });
}

