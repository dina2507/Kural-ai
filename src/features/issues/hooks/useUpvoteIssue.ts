import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/utils/errorParser';
import { authedFetch } from '@/lib/api';

import { hapticFeedback } from '@/lib/haptics';

export function useUpvoteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const res = await authedFetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(parseApiError(error.error, 'Failed to upvote issue'));
      }
      return res.json();
    },
    onSuccess: (_, issueId) => {
      hapticFeedback.light();
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['liveIssues'] });
      toast.success('Thanks for your support!');
    },
    onError: () => {
      hapticFeedback.error();
      toast.error('Failed to upvote issue.');
    }
  });
}
