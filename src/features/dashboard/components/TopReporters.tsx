import React from 'react';
import { KarmaChip } from '../../../shared/components/KarmaChip';

export function TopReporters({ reporters }: { reporters: any[] }) {
  if (!reporters || reporters.length === 0) return null;

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border mt-6">
      <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6 flex items-center justify-between">
        Top Reporters
        <span className="text-xs font-normal text-text-tertiary">Selected Period</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reporters.map((reporter, index) => (
          <div key={reporter.userId} className={`flex items-center justify-between p-4 rounded-lg border ${index === 0 ? 'bg-bg-elevated border-warning/30' : 'border-border'}`}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-text-tertiary w-4">{index + 1}</span>
              <KarmaChip name={reporter.name} karma={reporter.count * 10} avatarUrl={reporter.avatar} />
            </div>
            <div className="text-right">
              <span className="block text-sm font-bold text-text-primary">{reporter.count}</span>
              <span className="block text-xs text-text-tertiary">reports</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
