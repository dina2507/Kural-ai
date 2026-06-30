import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api';

export function useAddComment(issueId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await authedFetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add comment');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
    }
  });
}
