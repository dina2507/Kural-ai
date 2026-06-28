import React, { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useIssues } from '@/features/issues/hooks/useIssues';
import { IssueCard } from '@/features/issues/components/IssueCard';
import { APP_CONFIG } from '@/lib/config';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export function IssuesPage() {
  const [filters, setFilters] = useState({
     category: '',
     status: '',
     sort: 'newest'
  });
  
  const { data: issues = [], isLoading } = useIssues();

  const filtered = issues.filter(issue => {
     if (filters.category && issue.category !== filters.category) return false;
     if (filters.status && issue.status !== filters.status) return false;
     return true;
  }).sort((a, b) => {
     if (filters.sort === 'severity') return b.severity - a.severity;
     if (filters.sort === 'confirmations') return (b.confirmationCount || 0) - (a.confirmationCount || 0);
     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="All Issues" subtitle="Browse and filter civic issues across the city." />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select 
           value={filters.category}
           onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
           className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
           <option value="">All Categories</option>
           {APP_CONFIG.issues.categories.map(cat => (
             <option key={cat} value={cat}>{cat.replaceAll('_', ' ')}</option>
           ))}
        </select>
        
        <select 
           value={filters.status}
           onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
           className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        >
           <option value="">All Statuses</option>
           <option value="reported">Reported</option>
           <option value="ai_verified">AI Verified</option>
           <option value="community_confirmed">Community Confirmed</option>
           <option value="in_progress">In Progress</option>
           <option value="resolved">Resolved</option>
           <option value="closed">Closed</option>
        </select>
        
        <select 
           value={filters.sort}
           onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
           className="bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none md:ml-auto"
        >
           <option value="newest">Newest First</option>
           <option value="severity">Highest Severity</option>
           <option value="confirmations">Most Confirmed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center p-8 text-text-tertiary">Loading issues...</div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center">
           <MapPin className="w-12 h-12 text-text-tertiary mb-4" />
           <div className="text-text-secondary font-medium mb-4">No issues match your filters.</div>
           <button onClick={() => setFilters({ category: '', status: '', sort: 'newest' })} className="px-6 py-2 bg-bg-elevated border border-border rounded-lg text-sm font-medium hover:bg-bg-elevated/80 transition-colors">Clear Filters</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

