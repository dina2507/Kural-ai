import { useMutation } from '@tanstack/react-query';
import { DigestAgentOutput } from '../../../ai/schemas/digestOutput.schema';
import { toast } from 'sonner';

export function useGenerateDigest() {
  return useMutation({
    mutationFn: async ({ ward, weekStart, weekEnd }: { ward: string, weekStart: string, weekEnd: string }): Promise<DigestAgentOutput> => {
      const res = await fetch('/api/agents/digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ward, weekStart, weekEnd })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate digest');
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      toast.success('Ward digest generated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate digest.');
    }
  });
}

