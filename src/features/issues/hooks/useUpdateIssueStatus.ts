import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api';
import { toast } from 'sonner';

export function useUpdateIssueStatus(issueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, note }: { status: string; note?: string }) => {
      const res = await authedFetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issue', issueId] });
      qc.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
      qc.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue status updated.');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to update status.'),
  });
}
