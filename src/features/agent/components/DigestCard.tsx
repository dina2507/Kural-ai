import React from 'react';
import { Copy, Share2 } from 'lucide-react';
import { DigestAgentOutput } from '../../../ai/schemas/digestOutput.schema';
import { toast } from 'sonner';

export function DigestCard({ digest, ward, week }: { digest: DigestAgentOutput, ward: string, week: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(`${digest.headline}\n\n${digest.summary}\n\nKey Highlight: ${digest.keyHighlight}\nTop Concern: ${digest.topConcern}`);
    toast.info('Copied to clipboard.');
  };

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6">
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="text-xl font-serif font-bold text-text-primary uppercase tracking-wide">KURAL Ward Digest</h2>
        <p className="text-sm text-text-secondary">{ward} · {week}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-2">{digest.headline}</h3>
        <p className="text-text-primary leading-relaxed whitespace-pre-wrap font-serif text-sm">
          {digest.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-success-subtle border border-success/30 p-4 rounded-lg">
          <h4 className="text-xs font-bold text-success uppercase tracking-wider mb-1">Key Highlight</h4>
          <p className="text-sm text-success">{digest.keyHighlight}</p>
        </div>
        <div className="bg-warning-subtle border border-warning/30 p-4 rounded-lg">
          <h4 className="text-xs font-bold text-warning uppercase tracking-wider mb-1">Top Concern</h4>
          <p className="text-sm text-warning">{digest.topConcern}</p>
        </div>
      </div>

      {digest.citizenHeroReason && (
        <div className="bg-bg-elevated border border-border p-4 rounded-lg mb-6 flex items-start gap-3">
           <span className="text-2xl">🏆</span>
           <div>
             <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Citizen Hero</h4>
             <p className="text-sm text-text-primary">{digest.citizenHeroReason}</p>
           </div>
        </div>
      )}

      <div className="border-t border-border pt-4 flex gap-3">
        <button onClick={handleCopy} className="px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Copy className="w-4 h-4" /> Copy Text
        </button>
        <button className="px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Share2 className="w-4 h-4" /> Share Link
        </button>
      </div>
    </div>
  );
}
