'use client';

import { BookOpen, MapPin, MessageCircle, Wrench, CheckCircle2 } from 'lucide-react';
import { ProgressRing } from '@/components/ui/ProgressRing';
import {
  type Phase,
  PHASE_LABELS,
  PHASE_COLORS,
  getRank,
  RANK_COLORS,
  RANK_BG,
} from '@/lib/training';

const PHASE_ICON_MAP = {
  PREPARE: BookOpen,
  ARRIVE: MapPin,
  CONNECT: MessageCircle,
  EXECUTE: Wrench,
} as const;

interface PhaseCardProps {
  phase: Phase;
  passCount: number;
  mastered: boolean;
  weekAttempt: { score: number; total: number; passed: boolean } | null;
  onStart: () => void;
}

export function PhaseCard({
  phase,
  passCount,
  mastered,
  weekAttempt,
  onStart,
}: PhaseCardProps) {
  const Icon = PHASE_ICON_MAP[phase];
  const rank = getRank(passCount);
  const color = PHASE_COLORS[phase];
  const progress = Math.min((passCount / 3) * 100, 100);

  return (
    <button
      onClick={onStart}
      className={`relative rounded-2xl p-4 border transition-all duration-200 text-left w-full ${
        mastered
          ? 'bg-yellow-400/5 border-yellow-500/20 hover:border-yellow-500/40'
          : 'bg-background-paper border-white/5 hover:border-white/15'
      }`}
    >
      {/* Mastered stamp */}
      {mastered && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-yellow-400" />
        </div>
      )}

      {/* Progress ring + icon */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          <ProgressRing
            progress={progress}
            size={72}
            strokeWidth={5}
            label=""
            color={mastered ? '#facc15' : color}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              className="w-6 h-6"
              style={{ color: mastered ? '#facc15' : color }}
            />
          </div>
        </div>
      </div>

      {/* Phase name */}
      <h3 className="text-sm font-bold text-white text-center mb-1">
        {PHASE_LABELS[phase]}
      </h3>

      {/* Rank badge */}
      <div className="flex justify-center mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RANK_BG[rank]} ${RANK_COLORS[rank]}`}
        >
          {rank}
        </span>
      </div>

      {/* Week attempt info */}
      {weekAttempt && (
        <div className="text-center">
          <span className="text-[10px] text-slate-500">
            This week: {weekAttempt.score}/{weekAttempt.total}
          </span>
        </div>
      )}
    </button>
  );
}
