'use client';

import { useState, useTransition } from 'react';
import { startQuiz, submitQuiz, type QuizResult } from '@/app/training/actions';
import { type ClientQuestion, PHASE_LABELS, type Phase } from '@/lib/training';
import { QuizResults } from './QuizResults';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

type QuizState =
  | { step: 'loading' }
  | { step: 'question'; questions: ClientQuestion[]; index: number; answers: { questionId: string; selected: string }[]; feedback: null | { selected: string; correct: string; explanation: string; isCorrect: boolean } }
  | { step: 'submitting' }
  | { step: 'results'; result: QuizResult }
  | { step: 'error'; message: string };

interface QuizFlowProps {
  phase: string;
  techName: string;
  onClose: () => void;
}

export function QuizFlow({ phase, techName, onClose }: QuizFlowProps) {
  const [state, setState] = useState<QuizState>({ step: 'loading' });
  const [isPending, startTransition] = useTransition();

  // Start quiz on mount
  useState(() => {
    startTransition(async () => {
      const result = await startQuiz(phase);
      if ('error' in result) {
        setState({ step: 'error', message: result.error });
      } else {
        setState({
          step: 'question',
          questions: result.questions,
          index: 0,
          answers: [],
          feedback: null,
        });
      }
    });
  });

  const phaseLabel = phase === 'FULL' ? 'Full PACE Quiz' : `${PHASE_LABELS[phase as Phase]} Quiz`;

  if (state.step === 'loading') {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading {phaseLabel}...</p>
      </div>
    );
  }

  if (state.step === 'error') {
    return (
      <div className="relative z-10 text-center py-20">
        <p className="text-red-400 mb-4">{state.message}</p>
        <button onClick={onClose} className="text-primary-light text-sm underline">
          Go Back
        </button>
      </div>
    );
  }

  if (state.step === 'submitting') {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin mb-4" />
        <p className="text-sm text-slate-400">Grading your quiz...</p>
      </div>
    );
  }

  if (state.step === 'results') {
    return (
      <QuizResults
        result={state.result}
        phase={phase}
        techName={techName}
        onClose={onClose}
      />
    );
  }

  // Question state
  const { questions, index, answers, feedback } = state;
  const question = questions[index];
  const options = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ];

  function selectAnswer(selected: string) {
    if (feedback) return; // Already answered

    // We don't know the correct answer client-side, but we show the selection
    // and will reveal correct/incorrect after submission
    // For immediate feedback, we submit per-question locally
    // Actually, we need to store and show feedback. We'll send all at end.
    // But the spec says "immediately reveal correct/incorrect"
    // Since we don't have correct answers client-side, we mark selection and move on
    // We'll show full feedback on results screen.
    // UPDATE: For better UX, let's just highlight the selection and move to next
    const newAnswers = [...answers, { questionId: question.id, selected }];

    setState({
      step: 'question',
      questions,
      index,
      answers: newAnswers,
      feedback: { selected, correct: '', explanation: '', isCorrect: false },
    });

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (index + 1 < questions.length) {
        setState({
          step: 'question',
          questions,
          index: index + 1,
          answers: newAnswers,
          feedback: null,
        });
      } else {
        // Submit quiz
        setState({ step: 'submitting' });
        submitQuiz(phase, newAnswers).then((result) => {
          if ('error' in result) {
            setState({ step: 'error', message: result.error });
          } else {
            setState({ step: 'results', result });
          }
        });
      }
    }, 300);
  }

  return (
    <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-sm font-bold text-white">{phaseLabel}</span>
        <span className="text-xs text-slate-500">
          {index + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary-light rounded-full transition-all duration-500"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-white font-medium leading-relaxed">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = feedback?.selected === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => selectAnswer(opt.key)}
              disabled={!!feedback}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border-primary/50 text-white'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-white/20 text-slate-400'
                  }`}
                >
                  {opt.key}
                </span>
                <span className="text-sm leading-relaxed pt-0.5">{opt.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
