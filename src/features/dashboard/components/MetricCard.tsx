import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subLabel?: string;
  colorClass?: string;
}

export function MetricCard({ label, value, trend, trendValue, subLabel, colorClass = 'text-text-primary' }: MetricCardProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-5 border border-border flex flex-col h-full">
      <h3 className="text-sm font-medium text-text-secondary mb-2">{label}</h3>
      <div className="mt-auto">
        <div className="flex items-baseline gap-3 mb-1">
          <span className={`font-mono text-4xl font-black ${colorClass}`}>{value}</span>
          {trend && trendValue && (
            <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-tertiary'}`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {trendValue}
            </span>
          )}
        </div>
        {subLabel && <p className="text-xs text-text-tertiary">{subLabel}</p>}
      </div>
    </div>
  );
}
