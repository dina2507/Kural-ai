import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AgentStepList } from './AgentStepList';
import { useReportWizard } from '../hooks/useReportWizard';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function StepAnalysis() {
  const { imageFile, imagePreviewUrl, location, setAnalysis, analysis, setStep } = useReportWizard();

  const { mutate: analyze, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!imageFile || !location) throw new Error('Missing input');
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      
      const res = await fetch('/api/agents/vision', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Agent failed');
      }
      return json.data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  useEffect(() => {
    if (!analysis && !isPending) {
      analyze();
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="w-full aspect-[4/3] bg-bg-surface border-2 border-border rounded-xl overflow-hidden relative">
          {imagePreviewUrl && (
            <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
          )}
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        {!analysis && (
          <div className="bg-bg-surface p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-6 text-text-primary">Agent Processing</h3>
            <AgentStepList isComplete={false} />
            {error && (
              <div className="mt-4 p-3 bg-danger-subtle text-danger text-sm rounded-md border border-danger/20">
                Analysis failed. Please try again or proceed manually.
              </div>
            )}
          </div>
        )}
        
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-bg-surface p-6 rounded-xl border border-border">
              <AgentStepList isComplete={true} />
            </div>
            
            {analysis.isDuplicate && (
              <div className="bg-warning-subtle border border-warning/30 p-4 rounded-xl flex gap-4">
                <AlertTriangle className="text-warning w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-warning mb-1">Similar issue found nearby</h4>
                  <p className="text-sm text-text-primary mb-3">A similar issue was reported recently. Do you want to merge this report?</p>
                  <div className="flex gap-3">
                    <button className="px-3 py-1.5 bg-warning text-bg-base font-medium text-sm rounded hover:bg-opacity-90">Merge Report</button>
                    <button className="px-3 py-1.5 border border-warning/50 text-warning font-medium text-sm rounded hover:bg-warning-subtle">Keep Separate</button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-bg-surface p-6 rounded-xl border border-primary/30 shadow-primary">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-subtle text-primary">
                  {analysis.category.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${analysis.severity >= 8 ? 'bg-danger-subtle text-danger' : analysis.severity >= 5 ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                  Severity {analysis.severity}/10
                </span>
              </div>
              <h4 className="font-bold text-lg mb-2">{analysis.title}</h4>
              <p className="text-text-secondary text-sm mb-4">{analysis.description}</p>
              
              <div className="flex items-center gap-2 text-xs text-text-tertiary">
                <CheckCircle2 className="w-4 h-4 text-success" />
                AI Confidence: {Math.round(analysis.confidence * 100)}%
              </div>
            </div>
            
            <button 
              onClick={() => setStep(3)}
              className="w-full py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors"
            >
              Next: Review & Submit &rarr;
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
