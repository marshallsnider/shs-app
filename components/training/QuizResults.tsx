'use client';

import { useEffect, useState } from 'react';
import { type QuizResult } from '@/app/training/actions';
import { PHASE_LABELS, getRank, RANK_COLORS, type Phase } from '@/lib/training';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizResultsProps {
  result: QuizResult;
  phase: string;
  techName: string;
  onClose: () => void;
}

export function QuizResults({ result, phase, techName, onClose }: QuizResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(0);

  const phaseLabel =
    phase === 'FULL'
      ? 'Full PACE Quiz'
      : `${PHASE_LABELS[phase as Phase]} Quiz`;

  const rankUps = result.rankUpdates.filter((r) => r.oldRank !== r.newRank);
  const hasRankUp = rankUps.length > 0;

  // Animate XP counter
  useEffect(() => {
    if (result.xpEarned === 0) return;
    const duration = 1000;
    const steps = 20;
    const increment = result.xpEarned / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= result.xpEarned) {
        setAnimatedXp(result.xpEarned);
        clearInterval(interval);
      } else {
        setAnimatedXp(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [result.xpEarned]);

  // Fire confetti on pass
  useEffect(() => {
    if (result.passed && typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: hasRankUp ? 150 : 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: hasRankUp
            ? ['#facc15', '#f59e0b', '#fbbf24']
            : ['#3b82f6', '#10b981', '#6366f1'],
        });
      });
    }
  }, [result.passed, hasRankUp]);

  return (
    <div className="relative z-10">
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Training
      </button>

      {/* Score circle */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="flex flex-col items-center mb-6"
      >
        <div
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
            result.passed
              ? 'border-success bg-success/10'
              : 'border-orange-500 bg-orange-500/10'
          }`}
        >
          <span className="text-3xl font-bold text-white">
            {result.score}/{result.total}
          </span>
          <span
            className={`text-xs font-bold mt-1 ${
              result.passed ? 'text-success' : 'text-orange-400'
            }`}
          >
            {result.passed ? 'PASSED' : 'KEEP GOING'}
          </span>
        </div>
      </motion.div>

      {/* Pass/Fail message */}
      <div className="text-center mb-6">
        <p className="text-sm text-slate-300">
          {result.passed
            ? result.score === result.total
              ? 'Perfect score. Nothing got past you.'
              : 'Solid work. Knowledge is power.'
            : 'Not quite. Review the explanations and come back stronger.'}
        </p>
      </div>

      {/* XP Earned */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center mb-6"
      >
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-6 py-3 text-center">
          <span className="text-2xl font-bold text-primary-light">
            +{animatedXp}
          </span>
          <span className="text-xs text-primary-light/70 ml-1">XP</span>
          {result.xpEarned === 0 && (
            <p className="text-[10px] text-slate-500 mt-1">
              XP already earned this week for this quiz
            </p>
          )}
        </div>
      </motion.div>

      {/* Rank Updates */}
      {rankUps.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-6"
        >
          {rankUps.map((ru) => (
            <div
              key={ru.phase}
              className="bg-yellow-400/5 border border-yellow-500/20 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">
                  Rank Up!
                </span>
              </div>
              <p className="text-white text-sm font-medium">
                {PHASE_LABELS[ru.phase as Phase]}: {ru.oldRank} →{' '}
                <span className={RANK_COLORS[getRank(ru.passCount)]}>
                  {ru.newRank}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {ru.mastered
                  ? `${PHASE_LABELS[ru.phase as Phase]} Mastered. You own this.`
                  : `${3 - ru.passCount} more pass${3 - ru.passCount !== 1 ? 'es' : ''} to Master.`}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Mastery progress (no rank change) */}
      {result.passed && rankUps.length === 0 && result.rankUpdates.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          {result.rankUpdates
            .filter((ru) => !ru.mastered)
            .map((ru) => (
              <div
                key={ru.phase}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
              >
                <p className="text-xs text-slate-400">
                  {PHASE_LABELS[ru.phase as Phase]}: {ru.passCount} of 3 passes.{' '}
                  {3 - ru.passCount} more to Master.
                </p>
              </div>
            ))}
        </motion.div>
      )}

      {/* Badge Unlocks */}
      {result.badgesEarned.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2 mb-6"
        >
          {result.badgesEarned.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl px-4 py-3"
            >
              <Award className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm font-bold text-yellow-400">
                  Badge Unlocked!
                </p>
                <p className="text-xs text-yellow-400/70">{badge}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Answer Details (expandable) */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors py-3"
      >
        <span>Review Answers</span>
        {showDetails ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {result.details.map((d, i) => (
              <div
                key={d.questionId}
                className={`p-3 rounded-xl border ${
                  d.isCorrect
                    ? 'bg-success/5 border-success/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {d.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs text-slate-400">
                    Q{i + 1}: Your answer: {d.selected} &middot; Correct: {d.correct}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {d.explanation}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors"
        >
          Back to Training
        </button>
      </div>
    </div>
  );
}
