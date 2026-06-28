import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <PageHeader title={`Issue Detail: ${id}`} subtitle="Coming in Phase 3" />
      <div className="bg-bg-surface border border-border rounded-xl p-8 flex items-center justify-center text-text-tertiary">
        Issue details placeholder
      </div>
    </div>
  );
}
