import { useState } from 'react';
import { MessageCircle, Loader2, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuthority } from '../hooks/useAuthority';
import { buildAuthorityMessage, buildWhatsAppUrl } from '../../../lib/utils/whatsapp';
import { Issue } from '../types/issue.types';

export function ReportToAuthorityButton({ issue }: { issue: Issue }) {
  const { data: authority, isLoading } = useAuthority({
    latitude: issue.latitude,
    longitude: issue.longitude,
    category: issue.category,
  });
  const [opening, setOpening] = useState(false);

  const handleSend = () => {
    if (!authority) return;
    setOpening(true);
    const message = buildAuthorityMessage(issue, authority, authority.locationLabel);
    const url = buildWhatsAppUrl(authority.whatsapp, message);
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpening(false);
  };

  return (
    <div className="bg-bg-surface p-5 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-5 h-5 text-success" />
        <h3 className="font-bold text-text-primary">Report to Authority</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Finding the right authority…
        </div>
      ) : authority ? (
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-text-secondary block">Responsible body</span>
            <span className="font-medium text-text-primary">{authority.name}</span>
            {authority.locationLabel && (
              <span className="text-text-tertiary block text-xs mt-0.5">{authority.locationLabel}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {authority.verified ? (
              <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="w-3.5 h-3.5" /> Verified contact</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-warning"><ShieldAlert className="w-3.5 h-3.5" /> Suggested — please verify</span>
            )}
          </div>

          {authority.helpline && (
            <div className="text-text-secondary">
              Helpline: <a href={`tel:${authority.helpline}`} className="text-primary font-medium">{authority.helpline}</a>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={opening}
            className="w-full flex items-center justify-center gap-2 bg-success text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            {authority.whatsapp ? 'Send via WhatsApp' : 'Open WhatsApp with message'}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {!authority.whatsapp && (
            <p className="text-xs text-text-tertiary">
              No verified WhatsApp number for this body yet — WhatsApp opens with the message ready;
              choose the official contact to send.
            </p>
          )}
        </div>
      ) : (
        <p className="text-text-secondary text-sm">Could not determine the local authority for this location.</p>
      )}
    </div>
  );
}
