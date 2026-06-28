import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Issue } from '../types/issue.types';
import { toast } from 'sonner';

export function useCreateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any): Promise<Issue> => {
      const res = await fetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create issue');
      }
      
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue reported. Community will verify it shortly.');
    },
    onError: (err) => {
       toast.error(err.message || 'Failed to submit issue.');
    }
  });
}

