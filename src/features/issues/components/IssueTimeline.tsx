import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, User, Building, Settings, Loader2 } from 'lucide-react';
import { useIssueTimeline } from '../hooks/useIssueTimeline';
import { useEffect } from 'react';
import { db } from '../../../lib/firebase/client';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useAddComment } from '../hooks/useAddComment';
import { useMe } from '@/features/profile/hooks/useMe';

interface TimelineEvent {
  id: string;
  actor_type: 'citizen' | 'ai_agent' | 'system' | 'municipality';
  actor_id: string | null;
  agent_name: string | null;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function IssueTimeline({ issueId }: { issueId: string }) {
  const { data: events = [], isLoading } = useIssueTimeline(issueId);
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [commentText, setCommentText] = useState('');
  const { mutate: addComment, isPending: isAddingComment } = useAddComment(issueId);

  useEffect(() => {
    const q = query(collection(db, 'issue_timeline'), where('issue_id', '==', issueId));
    const unsubscribe = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
    });
    return () => unsubscribe();
  }, [issueId, queryClient]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !me) return;
    addComment(commentText, {
      onSuccess: () => setCommentText('')
    });
  };

  return (
    <div>
      {isLoading ? (
        <div className="text-text-tertiary">Loading timeline...</div>
      ) : events.length === 0 ? (
        <div className="text-text-tertiary mb-6">No events yet.</div>
      ) : (
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent mb-6">
          {events.map((event: TimelineEvent, index: number) => {
            let Icon = Settings;
            let borderColor = 'var(--border)';
            
            if (event.actor_type === 'ai_agent') {
              Icon = Bot;
              borderColor = 'var(--primary)';
            } else if (event.actor_type === 'citizen') {
              Icon = User;
              borderColor = '#3b82f6';
            } else if (event.actor_type === 'municipality') {
              Icon = Building;
              borderColor = 'var(--warning)';
            }

            const date = new Date(event.created_at);
            let relativeTime = 'recently';
            try {
              if (!isNaN(date.getTime())) {
                relativeTime = formatDistanceToNow(date, { addSuffix: true });
              }
            } catch (e) {
              console.error('Date parsing error', e);
            }

            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-bg-surface shrink-0 shadow-sm z-10 mt-1" style={{ borderColor }}>
                  <Icon className="w-4 h-4 text-text-primary" />
                </div>
                
                <div className="flex-1 bg-bg-surface p-3 rounded-lg border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${event.actor_type === 'ai_agent' ? 'text-primary' : 'text-text-tertiary'}`}>
                      {event.agent_name || event.actor_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-text-tertiary">{relativeTime}</span>
                  </div>
                  <h4 className="font-medium text-sm text-text-primary mb-0.5">{event.title}</h4>
                  {event.description && <p className="text-xs text-text-secondary mt-1">{event.description}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {me && (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            type="text"
            placeholder="Add an update or comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isAddingComment}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
          >
            {isAddingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
          </button>
        </form>
      )}
    </div>
  );
}
