import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssue } from '@/features/issues/hooks/useIssue';
import { IssueTimeline } from '@/features/issues/components/IssueTimeline';
import { VerificationPanel } from '@/features/issues/components/VerificationPanel';
import { ResolutionSection } from '@/features/issues/components/ResolutionSection';
import { OfficialStatusPanel } from '@/features/issues/components/OfficialStatusPanel';
import { IssueProgressIndicator } from '@/features/issues/components/IssueProgressIndicator';
import { StaticMapPreview } from '@/features/issues/components/StaticMapPreview';
import { ImageCarousel } from '@/features/issues/components/ImageCarousel';
import { ReportToAuthorityButton } from '@/features/issues/components/ReportToAuthorityButton';
import { MapPin, ArrowLeft, Share2, Bot, ThumbsUp, Clock } from 'lucide-react';
import { useUpvoteIssue } from '@/features/issues/hooks/useUpvoteIssue';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { KarmaChip } from '@/shared/components/KarmaChip';
import { useReporterProfile } from '@/features/profile/hooks/useReporterProfile';

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: issue, isLoading, error } = useIssue(id!);
  const { mutate: upvoteIssue, isPending: isUpvoting } = useUpvoteIssue();
  const { data: reporterProfile } = useReporterProfile(issue?.reporterId);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: issue.title, text: issue.description, url });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.info('Link copied to clipboard.');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading issue...</div>;
  if (error || !issue) return <div className="p-8 text-center text-danger">Issue not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => upvoteIssue(issue.id)}
             disabled={isUpvoting}
             className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 text-sm font-medium"
          >
             <ThumbsUp className="w-4 h-4" />
             <span>{issue.upvotes || 0} Upvotes</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 text-primary text-sm font-medium">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ImageCarousel images={issue.images} />

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${issue.severity >= 8 ? 'bg-danger-subtle text-danger' : issue.severity >= 5 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                Sev {issue.severity}
              </span>
              <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-bg-surface border border-border text-text-primary">
                {issue.category.replaceAll('_', ' ')}
              </span>
              <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-primary-subtle text-primary">
                {issue.status.replaceAll('_', ' ')}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-2">{issue.title}</h1>
            
            <div className="flex flex-col gap-3 mb-6 pt-2">
              <div className="flex items-center gap-3 bg-bg-elevated p-3 rounded-lg w-fit pr-6">
                 <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Reporter</span>
                 {issue.reporterName ? <KarmaChip name={issue.reporterName} karma={reporterProfile?.karma || 0} avatarUrl={reporterProfile?.photo} /> : <span className="text-sm font-medium">Unknown Citizen</span>}
              </div>
              <div className="flex gap-4">
                <div className="flex items-start gap-2 text-text-secondary text-sm">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{issue.address || `Lat: ${issue.latitude}, Lng: ${issue.longitude}`}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Reported {(() => {
                    try {
                      const date = new Date(issue.createdAt);
                      if (!isNaN(date.getTime())) {
                        return formatDistanceToNow(date, { addSuffix: true });
                      }
                    } catch (e) {}
                    return 'recently';
                  })()}</span>
                </div>
              </div>
            </div>

            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* AI Analysis Card */}
          {issue.aiAnalysis && Object.keys(issue.aiAnalysis).length > 0 && (
            <div className="bg-bg-surface p-5 rounded-xl border border-primary/20 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text-primary">Vision Agent Analysis</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">AI Confidence</span>
                  <span className="font-medium">{(issue.aiAnalysis as any).confidence ? Math.round((issue.aiAnalysis as any).confidence * 100) + '%' : 'N/A'}</span>
                </div>
                {(issue.aiAnalysis as any).urgencyReasoning && (
                  <div>
                    <span className="text-text-secondary block mb-1">Urgency Rationale</span>
                    <span className="font-medium block">{(issue.aiAnalysis as any).urgencyReasoning}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {issue.aiTags?.map(tag => (
                    <span key={tag} className="text-xs bg-bg-elevated px-2 py-1 rounded text-text-secondary">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <IssueProgressIndicator status={issue.status} />

          {(issue.latitude !== undefined && issue.longitude !== undefined) && (
            <StaticMapPreview latitude={issue.latitude} longitude={issue.longitude} />
          )}

          <VerificationPanel issue={issue} />
          
          <OfficialStatusPanel issue={issue} />

          <ResolutionSection issue={issue} />

          <ReportToAuthorityButton issue={issue} />

          <div className="bg-bg-surface p-6 rounded-xl border border-border">
            <h3 className="font-bold text-text-primary mb-6">Recent Activity</h3>
            <IssueTimeline issueId={issue.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
