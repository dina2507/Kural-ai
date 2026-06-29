import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

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
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Confirmation added. Thank you!');
    },
    onError: () => {
      toast.error('Failed to confirm issue.');
    }
  });
}

