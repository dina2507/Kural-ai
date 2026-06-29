import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useMe } from '@/features/profile/hooks/useMe';
import { useUpdateIssueStatus } from '../hooks/useUpdateIssueStatus';
import { Issue } from '../types/issue.types';

const OPTIONS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export function OfficialStatusPanel({ issue }: { issue: Issue }) {
  const { data: me } = useMe();
  const isOfficial = me?.role === 'official' || me?.role === 'admin';
  const [status, setStatus] = useState('in_progress');
  const [note, setNote] = useState('');
  const { mutate, isPending } = useUpdateIssueStatus(issue.id);

  if (!isOfficial) return null;

  return (
    <div className="bg-bg-surface p-5 rounded-xl border border-primary/30">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-text-primary">Official Actions</h3>
      </div>
      <div className="space-y-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
        >
          {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional note (added to the timeline)"
          className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
        />
        <button
          onClick={() => mutate({ status, note: note || undefined })}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-light transition disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Update Status
        </button>
      </div>
    </div>
  );
}
