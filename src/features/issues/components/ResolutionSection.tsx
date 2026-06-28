import React, { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Issue } from '../types/issue.types';
import { AgentStepList } from '../../report/components/AgentStepList';
import { ResolutionAgentOutput } from '../../../ai/schemas/resolutionOutput.schema';
import { toast } from 'sonner';

export function ResolutionSection({ issue }: { issue: Issue }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ResolutionAgentOutput | null>(null);
  const queryClient = useQueryClient();

  const { mutate: uploadResolution, isPending, error } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('afterImage', file);
      formData.append('issueId', issue.id);
      formData.append('category', issue.category);
      formData.append('originalDescription', issue.description);
      // Pass a dummy or fetch real before image in real app
      formData.append('beforeImageBase64', 'dummy_base64_for_now'); 

      const res = await fetch('/api/agents/resolution', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Resolution failed');
      return json.data as ResolutionAgentOutput;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
      queryClient.invalidateQueries({ queryKey: ['issueTimeline', issue.id] });
      
      if (data.verified) {
        toast.success(`Resolution confirmed — ${Math.round(data.confidence * 100)}% confidence. Issue closed.`);
      } else {
        toast.warning('Repair appears incomplete. Issue remains open.');
      }
    },
    onError: (err) => {
       toast.error(err.message || 'Verification failed.');
    }
  });


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadResolution(file);
    }
  };

  if (issue.status === 'resolved' || issue.status === 'closed') {
    return (
      <div className="bg-success-subtle p-6 rounded-xl border border-success/30">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-success" />
          <h3 className="font-bold text-success">Resolved</h3>
        </div>
        {issue.resolutionReasoning && (
          <p className="text-sm text-text-primary">{issue.resolutionReasoning}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-surface p-6 rounded-xl border border-border">
      <h3 className="font-bold text-text-primary mb-4">Mark as Resolved</h3>
      
      {!isPending && !result && (
        <div 
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-secondary font-medium">Upload "After" photo</p>
          <p className="text-xs text-text-tertiary mt-1">AI will verify the resolution</p>
        </div>
      )}

      {isPending && (
        <div className="py-4">
          <AgentStepList isComplete={false} />
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg border ${result.verified ? 'bg-success-subtle border-success/30' : 'bg-warning-subtle border-warning/30'}`}>
           <div className="flex items-start gap-3">
             {result.verified ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />}
             <div>
               <h4 className={`font-bold ${result.verified ? 'text-success' : 'text-warning'}`}>
                 {result.verified ? 'Resolution Confirmed' : 'Repair Appears Incomplete'}
               </h4>
               <p className="text-sm mt-1">{result.reasoning}</p>
               <div className="text-xs mt-2 opacity-80">AI Confidence: {Math.round(result.confidence * 100)}%</div>
             </div>
           </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-danger-subtle text-danger text-sm rounded-md border border-danger/20">
          {error.message}
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </div>
  );
}
