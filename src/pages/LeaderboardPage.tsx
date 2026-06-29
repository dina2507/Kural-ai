import { PageHeader } from '@/shared/components/PageHeader';
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard';
import { useMe } from '@/features/profile/hooks/useMe';
import { KarmaChip } from '@/shared/components/KarmaChip';
import { Trophy } from 'lucide-react';

export function LeaderboardPage() {
  const { data: leaders = [], isLoading } = useLeaderboard();
  const { data: me } = useMe();

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <PageHeader title="Leaderboard" subtitle="Top citizens making their city better." />

      {me && (
        <div className="bg-primary-subtle border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <KarmaChip name={me.name} karma={me.karma} avatarUrl={me.photo || undefined} />
          <span className="text-sm text-text-secondary">{me.reports_count} reports</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center p-8 text-text-tertiary">Loading…</div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl divide-y divide-border">
          {leaders.map((u, i) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <span className={`w-6 text-center font-bold ${i < 3 ? 'text-amber-500' : 'text-text-tertiary'}`}>
                {i < 3 ? <Trophy className="w-4 h-4 inline" /> : i + 1}
              </span>
              <div className="flex-1"><KarmaChip name={u.name} karma={u.karma} avatarUrl={u.photo || undefined} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
