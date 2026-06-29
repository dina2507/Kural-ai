import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useHealthScore } from '@/features/agent/hooks/useHealthScore';
import { useRunCivicMind } from '@/features/agent/hooks/useRunCivicMind';
import { useEscalationDrafts } from '@/features/agent/hooks/useEscalationDrafts';
import { EscalationCard } from '@/features/agent/components/EscalationCard';
import { AgentStepList } from '@/features/report/components/AgentStepList';
import { useGenerateDigest } from '@/features/agent/hooks/useGenerateDigest';
import { DigestCard } from '@/features/agent/components/DigestCard';
import { RefreshCw, Bot, FileText, Newspaper } from 'lucide-react';
import { motion } from 'motion/react';
import { useIssues } from '@/features/issues/hooks/useIssues';

export function AgentPage() {
  const { data: healthData, refetch: refetchHealth } = useHealthScore();
  const { data: drafts = [] } = useEscalationDrafts();
  const { mutate: runCivicMind, isPending: isRunning, isSuccess } = useRunCivicMind();
  
  const { mutate: generateDigest, isPending: isGeneratingDigest, data: digestData } = useGenerateDigest();
  const [selectedWard, setSelectedWard] = useState('');
  
  const { data: allIssues = [] } = useIssues();
  const availableWards = [...new Set(allIssues.map((i: any) => i.ward).filter(Boolean))] as string[];
  
  useEffect(() => {
    if (!selectedWard && availableWards.length) setSelectedWard(availableWards[0]);
  }, [availableWards, selectedWard]);

  const score = healthData?.score ?? 0;
  let scoreColor = 'text-success';
  let scoreLabel = 'Healthy';
  if (score < 50) {
    scoreColor = 'text-danger';
    scoreLabel = 'Critical';
  } else if (score < 80) {
    scoreColor = 'text-warning';
    scoreLabel = 'Needs Attention';
  }

  const handleGenerateDigest = () => {
     generateDigest({
        ward: selectedWard,
        weekStart: '2026-06-22',
        weekEnd: '2026-06-29'
     });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="CivicMind Control Panel" subtitle="Autonomous pattern analysis and escalation" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-bg-surface p-6 rounded-xl border border-border flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className={`text-6xl font-black font-mono mb-2 ${scoreColor}`}>
             {score}
           </div>
           <div className={`text-sm font-bold uppercase tracking-widest mb-4 ${scoreColor}`}>
             {scoreLabel}
           </div>
           
           <button onClick={() => refetchHealth()} className="text-xs text-text-tertiary flex items-center gap-1 hover:text-text-primary">
             <RefreshCw className="w-3 h-3" /> Refresh Score
           </button>
        </div>
        
        <div className="md:col-span-2 bg-bg-surface p-6 rounded-xl border border-border flex flex-col justify-center">
           <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
             <Bot className="w-5 h-5 text-primary" />
             CivicMind Pattern Agent
           </h3>
           <p className="text-sm text-text-secondary mb-6">
             The agent scans all open issues across the city to identify geographic clusters, computes urgency, and drafts escalation letters to relevant departments.
           </p>
           
           {!isRunning && !isSuccess && (
             <button 
               onClick={() => runCivicMind()}
               className="w-full sm:w-auto self-start px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors"
             >
               Run Pattern Scan
             </button>
           )}
           
           {isRunning && (
             <div className="mt-2">
               <AgentStepList isComplete={false} />
             </div>
           )}
           
           {isSuccess && !isRunning && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-success font-medium flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
               Scan complete. Drafts updated.
             </motion.div>
           )}
        </div>
      </div>

      <div className="mb-12">
        <h3 className="font-bold text-xl mb-6 text-text-primary flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Ward Weekly Digest
        </h3>
        <div className="bg-bg-surface p-6 rounded-xl border border-border">
           <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select 
                 value={selectedWard}
                 onChange={(e) => setSelectedWard(e.target.value)}
                 className="bg-bg-elevated border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary outline-none"
              >
                 {availableWards.map(ward => (
                   <option key={ward} value={ward}>{ward}</option>
                 ))}
              </select>
              <select 
                 className="bg-bg-elevated border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary outline-none"
                 disabled
              >
                 <option value="2026-06-22">Week of June 22–29</option>
              </select>
              <button 
                 onClick={handleGenerateDigest}
                 disabled={!selectedWard || isGeneratingDigest}
                 className="w-full sm:w-auto sm:ml-auto px-6 py-2 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-text-primary font-medium rounded-lg transition-colors"
              >
                 {isGeneratingDigest ? 'Generating...' : 'Generate Digest →'}
              </button>
           </div>
           
           {isGeneratingDigest && (
             <div className="py-4">
               <AgentStepList isComplete={false} />
             </div>
           )}
           
           {digestData && !isGeneratingDigest && (
             <DigestCard digest={digestData} ward={selectedWard} week="Week of June 22–29, 2026" />
           )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-6 text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Escalation Drafts
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {drafts.length === 0 ? (
            <div className="bg-bg-surface p-8 rounded-xl border border-border text-center text-text-tertiary">
              No escalation drafts currently generated. Run a pattern scan.
            </div>
          ) : (
            drafts.map((draft: any) => (
              <EscalationCard key={draft.id} draft={draft} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

