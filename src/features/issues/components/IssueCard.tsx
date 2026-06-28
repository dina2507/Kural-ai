import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types/issue.types';
import { MapPin, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function IssueCard({ issue, key }: { issue: Issue, key?: React.Key }) {
  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return 'bg-danger';
    if (severity >= 7) return 'bg-warning';
    if (severity >= 4) return 'bg-warning'; // Wait, let's just use these three
    return 'bg-success';
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all relative flex"
    >
      <div className={`w-1 ${getSeverityColor(issue.severity)} shrink-0`} />
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-bg-elevated border border-border text-text-primary">
              {issue.category.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${issue.severity >= 8 ? 'bg-danger-subtle text-danger' : issue.severity >= 5 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
              Sev {issue.severity}
            </span>
          </div>
          <span className="text-xs text-text-tertiary">
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="font-bold text-text-primary mb-1 line-clamp-2">
          {issue.title}
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-auto pt-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[150px]">{issue.ward || 'Unknown Ward'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{issue.confirmationCount || 0} verifications</span>
          </div>
          
          <div className="flex items-center gap-1">
             <Activity className="w-3.5 h-3.5" />
             <span className="capitalize">{issue.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
      
      <Link to={`/issue/${issue.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Details</span>
      </Link>
    </motion.div>
  );
}
