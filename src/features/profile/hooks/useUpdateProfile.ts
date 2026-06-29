import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';
import { MeProfile } from './useMe';

import { hapticFeedback } from '@/lib/haptics';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<MeProfile>): Promise<MeProfile> => {
      const res = await authedFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      hapticFeedback.success();
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully.');
    },
    onError: (err) => {
      hapticFeedback.error();
      toast.error(err.message || 'Failed to update profile.');
    }
  });
}
