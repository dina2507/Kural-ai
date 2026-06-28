import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Building, Settings } from 'lucide-react';
import { useIssueTimeline } from '../hooks/useIssueTimeline';
import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    const channel = supabase
      .channel(`timeline-${issueId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'issue_timeline', filter: `issue_id=eq.${issueId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['issueTimeline', issueId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [issueId, queryClient]);

  if (isLoading) return <div className="text-text-tertiary">Loading timeline...</div>;
  if (!events.length) return <div className="text-text-tertiary">No events yet.</div>;

  return (
    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {events.map((event: TimelineEvent, index: number) => {
        let Icon = Settings;
        let borderColor = 'border-gray-500';
        
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
        const relativeTime = formatDistanceToNow(date, { addSuffix: true });

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
  );
}
