import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useMe } from '@/features/profile/hooks/useMe';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { User, Loader2 } from 'lucide-react';

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [name, setName] = useState('');

  useEffect(() => {
    if (me?.name) {
      setName(me.name);
    }
  }, [me]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === me?.name) return;
    updateProfile({ name });
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto pb-20 flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-20">
      <PageHeader title="Profile" subtitle="Manage your account settings." />
      
      <div className="bg-bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-8">
          {me?.photo ? (
            <img src={me.photo} alt={me.name} className="w-16 h-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
              <User className="w-8 h-8 text-text-tertiary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-text-primary">{me?.name}</h2>
            {me?.email && <p className="text-sm text-text-secondary">{me.email}</p>}
            <p className="text-sm font-medium text-amber-500 mt-1">{me?.karma || 0} Karma</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your name"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || name === me?.name || !name.trim()}
            className="w-full py-2 bg-primary text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
