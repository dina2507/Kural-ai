import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'motion/react';
import { db } from '../../../lib/firebase/client';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

interface Props {
  score: number;
  issueCount: number;
  isLive?: boolean;
}

export function HealthScoreRing({ score, issueCount, isLive = true }: Props) {
  const ring2Ref = useRef<HTMLDivElement>(null);
  const ring3Ref = useRef<HTMLDivElement>(null);

  let color = '#10B981';
  if (score < 50) color = '#EF4444';
  else if (score < 80) color = '#F59E0B';

  let duration = 2.5;
  if (score < 50) duration = 1.2;
  else if (score < 80) duration = 1.8;

  useEffect(() => {
    if (!isLive || !ring2Ref.current || !ring3Ref.current) return;

    const controls2 = animate(ring2Ref.current, { scale: [1, 1.15], opacity: [0.6, 0] }, { duration, repeat: Infinity, ease: 'easeOut' });
    const controls3 = animate(ring3Ref.current, { scale: [1, 1.35], opacity: [0.4, 0] }, { duration, repeat: Infinity, ease: 'easeOut', delay: duration * 0.2 });
    return () => {
      controls2.stop();
      controls3.stop();
    };
  }, [isLive, duration]);

  useEffect(() => {
    if (!isLive) return;
    const q = query(collection(db, 'issues'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && ring2Ref.current) {
          const { animate } = require('motion');
          animate(ring2Ref.current, { scale: [1, 1.6], opacity: [0.8, 0] }, { duration: 0.8 });
          if (ring3Ref.current) animate(ring3Ref.current, { scale: [1, 2], opacity: [0.5, 0] }, { duration: 0.8 });
        }
      });
    });
    return () => unsubscribe();
  }, [isLive]);

  return (
    <div className="relative w-48 h-48 mx-auto mb-8 flex flex-col items-center justify-center">
      <div ref={ring3Ref} className="absolute inset-0 rounded-full" style={{ border: `2px solid ${color}` }} />
      <div ref={ring2Ref} className="absolute inset-4 rounded-full" style={{ border: `2px solid ${color}` }} />
      <div className="absolute inset-8 rounded-full flex items-center justify-center bg-bg-base z-10 shadow-lg" style={{ border: `4px solid ${color}` }}>
        <span className="block font-mono text-5xl font-black" style={{ color }}>{score}</span>
      </div>
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-sm font-medium text-text-secondary">{issueCount} Active Issues</span>
      </div>
    </div>
  );
}
