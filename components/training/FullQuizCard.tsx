'use client';

import { GraduationCap, ChevronRight } from 'lucide-react';

interface FullQuizCardProps {
  weekAttempt: { score: number; total: number; passed: boolean } | null;
  onStart: () => void;
}

export function FullQuizCard({ weekAttempt, onStart }: FullQuizCardProps) {
  return (
    <button
      onClick={onStart}
      className="w-full rounded-2xl p-4 bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20 hover:border-primary/40 transition-all duration-200 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2.5 rounded-full">
            <GraduationCap className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Full PACE Quiz</h3>
            <p className="text-xs text-slate-400">
              10 questions across all phases
            </p>
            {weekAttempt && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                This week: {weekAttempt.score}/{weekAttempt.total}{' '}
                {weekAttempt.passed ? '(Passed)' : ''}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>
    </button>
  );
}
