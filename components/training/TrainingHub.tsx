'use client';

import { useState } from 'react';
import { PhaseCard } from './PhaseCard';
import { FullQuizCard } from './FullQuizCard';
import { QuizFlow } from './QuizFlow';
import { PHASES, type Phase } from '@/lib/training';

interface PhaseInfo {
  phase: string;
  passCount: number;
  mastered: boolean;
  weekAttempt: { score: number; total: number; passed: boolean } | null;
}

interface TrainingHubProps {
  phaseData: PhaseInfo[];
  fullQuizAttempt: { score: number; total: number; passed: boolean } | null;
  techName: string;
  streak: number;
}

export function TrainingHub({
  phaseData,
  fullQuizAttempt,
  techName,
  streak,
}: TrainingHubProps) {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  if (activeQuiz) {
    return (
      <QuizFlow
        phase={activeQuiz}
        techName={techName}
        onClose={() => setActiveQuiz(null)}
      />
    );
  }

  return (
    <div className="relative z-10 space-y-4">
      {/* Phase Cards */}
      <div className="grid grid-cols-2 gap-3">
        {phaseData.map((pd) => (
          <PhaseCard
            key={pd.phase}
            phase={pd.phase as Phase}
            passCount={pd.passCount}
            mastered={pd.mastered}
            weekAttempt={pd.weekAttempt}
            onStart={() => setActiveQuiz(pd.phase)}
          />
        ))}
      </div>

      {/* Full Quiz Card */}
      <FullQuizCard
        weekAttempt={fullQuizAttempt}
        onStart={() => setActiveQuiz('FULL')}
      />

      {/* Streak */}
      {streak > 0 && (
        <div className="text-center text-sm text-slate-400 mt-4">
          {streak >= 4
            ? `${streak} weeks strong. Consistency wins.`
            : `${streak} week streak. Keep it going.`}
        </div>
      )}
    </div>
  );
}
