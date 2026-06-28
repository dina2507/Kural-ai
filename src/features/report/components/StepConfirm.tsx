import React, { useState } from 'react';
import { useReportWizard } from '../hooks/useReportWizard';
import { useCreateIssue } from '../../issues/hooks/useCreateIssue';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../../../lib/config';
import { Loader2 } from 'lucide-react';

export function StepConfirm() {
  const { title, description, category, severity, updateForm, imagePreviewUrl, imageFile, location, analysis } = useReportWizard();
  const { mutate: createIssue, isPending } = useCreateIssue();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    // In a real app we'd upload the imageFile to Supabase Storage first and get URL
    // For this prototype we will pass an empty array or placeholder since we don't have storage bucket set up yet
    
    createIssue({
      title,
      description,
      category,
      severity,
      latitude: location?.lat || 0,
      longitude: location?.lng || 0,
      images: [], 
      aiAnalysis: analysis || {},
      aiTags: analysis?.tags || [],
    }, {
      onSuccess: (data) => {
        navigate(`/issue/${data.id}`);
      },
      onError: (err) => {
        setErrorMsg(err.message);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-text-primary text-center">Review & Submit</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-4">
           {imagePreviewUrl && (
            <div className="w-1/3 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border border-border">
              <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
           )}
           <div className="flex-1 bg-bg-surface p-4 rounded-lg border border-border">
              <p className="text-sm font-medium text-text-secondary mb-1">Location</p>
              <p className="text-sm text-text-primary mb-2">GPS: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}</p>
           </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => updateForm({ title: e.target.value })}
            required
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Description</label>
          <textarea 
            value={description} 
            onChange={e => updateForm({ description: e.target.value })}
            rows={4}
            className="bg-bg-elevated border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Category</label>
            <select 
              value={category} 
              onChange={e => updateForm({ category: e.target.value as any })}
              className="bg-bg-elevated border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {APP_CONFIG.issues.categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Severity (1-10)</label>
            <input 
              type="range" 
              min="1" max="10" 
              value={severity} 
              onChange={e => updateForm({ severity: parseInt(e.target.value) })}
              className="w-full h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer mt-3"
            />
            <div className="text-right text-xs font-bold text-text-primary">{severity} / 10</div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-danger-subtle text-danger text-sm rounded-md border border-danger/20">
            {errorMsg}
          </div>
        )}
        
        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-4 mt-4 bg-primary text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-light transition-colors"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          Submit Report
        </button>
      </form>
    </div>
  );
}
