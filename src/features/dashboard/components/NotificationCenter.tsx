import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, MessageSquare, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function NotificationCenter() {
  const { data: notifications = [], isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="bg-bg-surface p-6 rounded-xl border border-border mt-6">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </h3>
        <div className="text-text-tertiary">Loading notifications...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-bg-surface p-6 rounded-xl border border-border mt-6">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </h3>
        <div className="text-text-tertiary">You have no new notifications.</div>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border mt-6">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6 flex items-center gap-2">
        <Bell className="w-4 h-4" /> Notifications
      </h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {notifications.map((notif: any) => {
          const isComment = notif.event_type === 'comment';
          return (
            <Link 
              key={notif.id} 
              to={`/issue/${notif.issue_id}`}
              className="block bg-bg-elevated p-4 rounded-lg border border-border hover:border-primary transition group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${isComment ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                  {isComment ? <MessageSquare className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">{notif.issueTitle}</span>:{' '}
                    {isComment ? 'New comment added.' : 'Status updated.'}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {notif.title}
                  </p>
                  {notif.description && (
                    <p className="text-xs text-text-secondary mt-1 italic">
                      "{notif.description}"
                    </p>
                  )}
                  <p className="text-xs text-text-tertiary mt-2">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
