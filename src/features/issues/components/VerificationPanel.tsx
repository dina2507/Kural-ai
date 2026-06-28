import React from 'react';
import { useConfirmIssue } from '../hooks/useConfirmIssue';
import { Users, CheckCircle } from 'lucide-react';
import { Issue } from '../types/issue.types';
import { useState } from 'react';

export function VerificationPanel({ issue }: { issue: Issue }) {
  const { mutate: confirmIssue, isPending } = useConfirmIssue();
  const [confirmed, setConfirmed] = useState(false); // Optimistic UI

  const handleConfirm = () => {
    confirmIssue(issue.id, {
      onSuccess: () => setConfirmed(true)
    });
  };

  const count = issue.confirmationCount || 0;
  const displayCount = confirmed ? count + 1 : count;
  const isResolved = issue.status === 'resolved' || issue.status === 'closed';

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-subtle rounded-lg">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-text-primary">Community Verification</h3>
          <p className="text-sm text-text-secondary">{displayCount} citizens confirmed this</p>
        </div>
      </div>

      <div className="w-full bg-bg-elevated rounded-full h-2 mb-6 overflow-hidden">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500" 
          style={{ width: `${Math.min((displayCount / 5) * 100, 100)}%` }}
        />
      </div>

      <button
        onClick={handleConfirm}
        disabled={isPending || confirmed || isResolved}
        className="w-full py-3 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-text-primary font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {confirmed ? (
          <>
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-success">Confirmed</span>
          </>
        ) : (
          'Confirm I see this too'
        )}
      </button>
    </div>
  );
}
