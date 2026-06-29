import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

import { hapticFeedback } from '@/lib/haptics';

export function useConfirmIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issueId: string) => {
      const res = await authedFetch(`/api/issues/${issueId}/confirm`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to confirm issue');
      const json = await res.json();
      return json.data;
    },
    onSuccess: (_, issueId) => {
      hapticFeedback.success();
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Confirmation added. Thank you!');
    },
    onError: () => {
      hapticFeedback.error();
      toast.error('Failed to confirm issue.');
    }
  });
}

