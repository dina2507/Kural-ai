import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function EscalationCard({ draft, key }: { draft: any, key?: React.Key }) {
  const [showFull, setShowFull] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: markSent, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/escalation-drafts/${draft.id}/send`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to send');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalationDrafts'] });
    }
  });

  const isSent = draft.status === 'sent';

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg text-text-primary mb-1">{draft.ward} - {draft.category.replace('_', ' ')}</h4>
          <p className="text-sm text-text-secondary">{draft.issue_ids?.length || 0} issues clustered</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${draft.urgency_score >= 80 ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
             Urgency {draft.urgency_score}
           </span>
           <span className="text-xs font-bold text-text-tertiary uppercase">{draft.department}</span>
        </div>
      </div>

      <div className="bg-bg-elevated p-4 rounded-lg border border-border mb-4 font-serif text-sm text-text-primary leading-relaxed relative">
        <p className={showFull ? 'whitespace-pre-wrap' : 'line-clamp-3'}>
          {draft.letter_content}
        </p>
        {!showFull && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bg-elevated to-transparent pointer-events-none" />
        )}
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={() => setShowFull(!showFull)}
          className="text-primary text-sm font-medium hover:underline"
        >
          {showFull ? 'Show Less' : 'View Full Letter'}
        </button>

        <button 
          onClick={() => markSent()}
          disabled={isSent || isPending}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isSent ? 'bg-success-subtle text-success' : 'bg-primary text-white hover:bg-primary-light'}`}
        >
          {isSent ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Sent
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Mark as Sent
            </>
          )}
        </button>
      </div>
    </div>
  );
}
