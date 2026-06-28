import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/utils/errorParser';

export function useUpvoteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(parseApiError(error.error, 'Failed to upvote issue'));
      }
      return res.json();
    },
    onSuccess: (_, issueId) => {
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['liveIssues'] });
      toast.success('Thanks for your support!');
    },
    onError: () => {
      toast.error('Failed to upvote issue.');
    }
  });
}
