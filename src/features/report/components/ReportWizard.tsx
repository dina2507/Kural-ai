import { useReportWizard } from '../hooks/useReportWizard';
import { StepPhoto } from './StepPhoto';
import { StepAnalysis } from './StepAnalysis';
import { StepConfirm } from './StepConfirm';

export function ReportWizard() {
  const { step } = useReportWizard();

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8 max-w-md mx-auto flex items-center gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-bg-elevated'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-bg-elevated'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-bg-elevated'}`} />
      </div>

      {step === 1 && <StepPhoto />}
      {step === 2 && <StepAnalysis />}
      {step === 3 && <StepConfirm />}
    </div>
  );
}
