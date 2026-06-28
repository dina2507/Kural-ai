import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useDashboard } from '../hooks/useDashboard';
import { supabase } from '../../../lib/supabase/client';

interface Props {
  score: number;
  issueCount: number;
  isLive?: boolean;
}

export function HealthScoreRing({ score, issueCount, isLive = true }: Props) {
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();
  
  let color = '#10B981'; // success
  if (score < 50) color = '#EF4444'; // danger
  else if (score < 80) color = '#F59E0B'; // warning
  
  let duration = 2.5;
  if (score < 50) duration = 1.2;
  else if (score < 80) duration = 1.8;

  useEffect(() => {
    if (!isLive) return;
    
    controls2.start({
       scale: [1, 1.15],
       opacity: [0.6, 0],
       transition: { duration, repeat: Infinity, ease: 'easeOut' }
    });
    
    controls3.start({
       scale: [1, 1.35],
       opacity: [0.4, 0],
       transition: { duration, repeat: Infinity, ease: 'easeOut', delay: duration * 0.2 }
    });
  }, [isLive, duration, controls2, controls3]);

  // Handle burst on new issue
  useEffect(() => {
     if (!isLive) return;
     
     const channel = supabase.channel('ring-burst')
       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'issues' }, () => {
          controls1.start({ scale: [1, 1.2, 1], transition: { duration: 0.5 } });
          controls2.start({ scale: [1, 1.6], opacity: [0.8, 0], transition: { duration: 0.8 } });
          controls3.start({ scale: [1, 2], opacity: [0.5, 0], transition: { duration: 0.8 } });
       })
       .subscribe();
       
     return () => { supabase.removeChannel(channel); };
  }, [isLive, controls1, controls2, controls3]);

  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex flex-col items-center justify-center">
      {/* Ring 3 */}
      <motion.div 
         animate={controls3}
         className="absolute inset-0 rounded-full"
         style={{ border: `2px solid ${color}` }}
      />
      
      {/* Ring 2 */}
      <motion.div 
         animate={controls2}
         className="absolute inset-4 rounded-full"
         style={{ border: `2px solid ${color}` }}
      />
      
      {/* Ring 1 (Static but bursts) */}
      <motion.div 
         animate={controls1}
         className="absolute inset-8 rounded-full flex items-center justify-center bg-bg-base z-10 shadow-lg"
         style={{ border: `4px solid ${color}` }}
      >
         <div className="text-center">
            <span className="block font-mono text-5xl font-black" style={{ color }}>{score}</span>
         </div>
      </motion.div>
      
      <div className="absolute -bottom-8 left-0 right-0 text-center">
         <span className="text-sm font-medium text-text-secondary">{issueCount} Active Issues</span>
      </div>
    </div>
  );
}
