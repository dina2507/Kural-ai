import React from 'react';
import { IssueStatus } from '../types/issue.types';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Props {
  status: IssueStatus;
}

export function IssueProgressIndicator({ status }: Props) {
  const steps = [
    { id: 'reported', label: 'Reported', activeStatuses: ['reported', 'ai_verified', 'community_confirmed', 'in_progress', 'resolved', 'closed', 'rejected'] },
    { id: 'in_progress', label: 'In Progress', activeStatuses: ['in_progress', 'resolved', 'closed'] },
    { id: 'resolved', label: 'Resolved', activeStatuses: ['resolved', 'closed'] }
  ];

  if (status === 'rejected') {
    return (
      <div className="bg-danger-subtle border border-danger/20 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-danger" />
        <div>
          <h4 className="font-bold text-danger">Issue Rejected</h4>
          <p className="text-sm text-danger/80">This report was marked as invalid or unresolvable.</p>
        </div>
      </div>
    );
  }

  // Determine current step index
  let currentStepIndex = 0;
  if (['in_progress'].includes(status)) currentStepIndex = 1;
  if (['resolved', 'closed'].includes(status)) currentStepIndex = 2;

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border">
      <h3 className="font-bold text-text-primary mb-6">Status</h3>
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bg-elevated -z-10 rounded-full overflow-hidden">
          <div 
             className="h-full bg-primary transition-all duration-500 ease-in-out" 
             style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-bg-surface px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted 
                    ? 'bg-primary text-bg-base' 
                    : 'bg-bg-elevated text-text-tertiary border-2 border-border'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span 
                className={`text-xs font-medium uppercase tracking-wider ${
                  isActive 
                    ? 'text-primary' 
                    : isCompleted 
                      ? 'text-text-primary' 
                      : 'text-text-tertiary'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
