import { motion } from 'motion/react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  'Vision Agent: Analyzing image...',
  'Detecting issue type and severity...',
  'Geo Agent: Reverse geocoding location...',
  'Duplicate Agent: Checking 50m radius...',
  'Generating report draft...',
];

export function AgentStepList({ isComplete }: { isComplete: boolean }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setActiveStep(steps.length);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [isComplete]);

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const isPast = activeStep > idx;
        const isCurrent = activeStep === idx && !isComplete;
        const isFuture = activeStep < idx;

        if (isFuture) return null;

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {isPast ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : isCurrent ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : null}
            <span className={isPast ? 'text-text-secondary line-through' : 'text-text-primary font-medium'}>
              {step}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
