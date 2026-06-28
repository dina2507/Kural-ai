import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { CategoryChart } from '@/features/dashboard/components/CategoryChart';
import { TrendChart } from '@/features/dashboard/components/TrendChart';
import { WardComparison } from '@/features/dashboard/components/WardComparison';
import { TopReporters } from '@/features/dashboard/components/TopReporters';

export function DashboardPage() {
  const [period, setPeriod] = useState('30d');
  const { data, isLoading, error } = useDashboard(period);

  if (isLoading) return <div className="p-8 text-center text-text-tertiary">Loading dashboard...</div>;
  if (error || !data) return <div className="p-8 text-center text-danger">Failed to load dashboard data</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <PageHeader title="City Dashboard" subtitle="Real-time analytics across all wards." />
        <div className="mt-4 sm:mt-0">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <MetricCard 
          label="Open Issues" 
          value={data.totalOpen} 
          trend="up" 
          trendValue="+12%" 
          subLabel="vs last period" 
          colorClass="text-warning" 
        />
        <MetricCard 
          label="Resolved" 
          value={data.totalResolved} 
          trend="up" 
          trendValue="+5%" 
          subLabel={`${Math.round(data.resolutionRate * 100)}% resolution rate`}
          colorClass="text-success"
        />
        <MetricCard 
          label="City Health Score" 
          value={data.healthScore} 
          colorClass={data.healthScore >= 80 ? 'text-success' : data.healthScore >= 50 ? 'text-warning' : 'text-danger'}
          subLabel="Based on AI analysis"
        />
        <MetricCard 
          label="Critical Issues" 
          value={data.totalCritical} 
          trend="down" 
          trendValue="-2"
          subLabel="7+ days unresolved"
          colorClass="text-danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <TrendChart data={data.weeklyTrend} />
        </div>
        <div className="lg:col-span-4">
          <CategoryChart data={data.categoryBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WardComparison data={data.wardComparison} />
      </div>

      <TopReporters reporters={data.topReporters} />
    </div>
  );
}

