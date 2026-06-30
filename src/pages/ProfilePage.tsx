import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useMe } from '@/features/profile/hooks/useMe';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { User, Loader2, ShieldAlert } from 'lucide-react';
import { authedFetch } from '@/lib/api';

export function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [name, setName] = useState('');
  
  const [targetUid, setTargetUid] = useState('');
  const [targetRole, setTargetRole] = useState('official');
  const [grantMessage, setGrantMessage] = useState('');

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

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantMessage('');
    if (!targetUid.trim()) return;
    try {
      const res = await authedFetch('/api/admin/grant-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUid, role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grant role');
      setGrantMessage(`Successfully granted ${targetRole} to ${targetUid}`);
      setTargetUid('');
    } catch (err) {
      setGrantMessage((err as Error).message);
    }
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">{me?.name}</h2>
              {me?.role === 'admin' && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">Admin</span>}
              {me?.role === 'official' && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-full">Official</span>}
            </div>
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

      {me?.role === 'admin' && (
        <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="flex items-center gap-2 font-bold text-red-500 mb-4">
            <ShieldAlert className="w-5 h-5" /> Admin Panel
          </h3>
          <form onSubmit={handleGrantRole} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Target User ID</label>
              <input
                type="text"
                value={targetUid}
                onChange={e => setTargetUid(e.target.value)}
                className="w-full px-4 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="User UID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-4 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="official">Official</option>
                <option value="citizen">Citizen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!targetUid.trim()}
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              Grant Role
            </button>
            {grantMessage && <p className="text-sm text-red-500 mt-2">{grantMessage}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
