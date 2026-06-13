'use client';

import { useState } from 'react';
import { Target, Shield, Users } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { FullQuizCard } from './FullQuizCard';
import { QuizFlow } from './QuizFlow';
import { PHASES, type Phase } from '@/lib/training';
import { ObjectionsSection } from './ObjectionsSection';
import { DiscSection } from './DiscSection';
import { CollapsibleSection } from './CollapsibleSection';

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
  objectionPassed: string[];
  discPassed: boolean;
}

export function TrainingHub({
  phaseData,
  fullQuizAttempt,
  techName,
  streak,
  objectionPassed,
  discPassed,
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
      {/* PACE Training (collapsible) */}
      <CollapsibleSection
        icon={<Target className="w-5 h-5" />}
        title="PACE Training"
        summary="4 phases · Full PACE Quiz"
      >
        <div className="space-y-4">
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
        </div>
      </CollapsibleSection>

      {/* Objections (collapsible) */}
      <CollapsibleSection
        icon={<Shield className="w-5 h-5" />}
        title="Objections"
        summary="6 objections · 3 reps each"
      >
        <ObjectionsSection passedSlugs={objectionPassed} hideHeader />
      </CollapsibleSection>

      {/* DISC (collapsible) */}
      <CollapsibleSection
        icon={<Users className="w-5 h-5" />}
        title="DISC"
        summary="4 personality types · 12 scenarios"
      >
        <DiscSection modulePassed={discPassed} hideHeader />
      </CollapsibleSection>

      {/* Streak */}
      {streak > 0 && (
        <div className="text-center text-sm text-slate-400">
          {streak >= 4
            ? `${streak} weeks strong. Consistency wins.`
            : `${streak} week streak. Keep it going.`}
        </div>
      )}
    </div>
  );
}
