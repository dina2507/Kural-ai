import { PageHeader } from '@/shared/components/PageHeader';
import { useMyReports } from '@/features/issues/hooks/useMyReports';
import { IssueCard } from '@/features/issues/components/IssueCard';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PullToRefresh from 'react-simple-pull-to-refresh';

export function MyReportsPage() {
  const { data: issues = [], isLoading, refetch } = useMyReports();

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="My Reports" subtitle="Issues you've reported." />
      <PullToRefresh onRefresh={handleRefresh} className="min-h-[50vh]">
        {isLoading ? (
          <div className="text-center p-8 text-text-tertiary">Loading your reports…</div>
        ) : issues.length === 0 ? (
          <div className="bg-bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-text-tertiary mb-4" />
            <div className="text-text-secondary font-medium mb-4">You haven't reported any issues yet.</div>
            <Link to="/report" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium">Report an issue</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
