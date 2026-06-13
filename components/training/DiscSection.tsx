'use client';

import { useState, useTransition } from 'react';
import {
  startDiscQuiz,
  checkDiscAnswer,
  submitDiscQuiz,
  type DiscResult,
} from '@/app/training/actions';
import {
  DISC_LESSONS,
  getDiscLesson,
  DISC_SCENARIO_COUNT,
  DISC_QUESTION_COUNT,
  DISC_SUMMARY_HEAD,
  DISC_SUMMARY_BODY,
  DISC_CHEAT_SHEET,
  DISC_SUMMARY_FOOT,
  type DiscBlock,
} from '@/lib/disc';
import { type ClientQuestion } from '@/lib/training';
import {
  Users,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Swords,
} from 'lucide-react';

const PASS = 0.8;
const LETTERS = ['A', 'B', 'C', 'D'] as const;

type Feedback = {
  selected: string;
  correct: string;
  isCorrect: boolean;
  feedback: string;
};

type View =
  | { screen: 'list' }
  | { screen: 'lesson'; slug: string }
  | { screen: 'ready' }
  | { screen: 'loading' }
  | {
      screen: 'quiz';
      questions: ClientQuestion[];
      index: number;
      answers: { questionId: string; selected: string }[];
      feedback: Feedback | null;
      checking: boolean;
    }
  | { screen: 'results'; result: DiscResult }
  | { screen: 'error'; message: string };

function ReadingBlocks({ blocks }: { blocks: DiscBlock[] }) {
  return (
    <div>
      {blocks.map((b, i) => {
        if (b.kind === 'h')
          return (
            <h3 key={i} className="text-white font-bold text-[15px] mt-5 mb-1.5">
              {b.text}
            </h3>
          );
        if (b.kind === 'say')
          return (
            <p
              key={i}
              className="border-l-2 border-primary bg-primary/10 rounded-r-lg px-3 py-2.5 my-3 text-white font-semibold text-[14px] leading-relaxed"
            >
              {b.text}
            </p>
          );
        if (b.kind === 'list')
          return (
            <ul
              key={i}
              className="list-disc pl-5 mb-3 text-slate-200 text-[14px] leading-relaxed space-y-1.5"
            >
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        if (b.kind === 'table')
          return (
            <div key={i} className="my-3 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-white/10">
                    {b.headers.map((h, j) => (
                      <th
                        key={j}
                        className="px-3 py-2 text-left font-bold text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, j) => (
                    <tr key={j} className="border-t border-white/10">
                      {row.map((cell, k) => (
                        <td
                          key={k}
                          className={`px-3 py-2 ${
                            k === 0
                              ? 'font-bold text-white bg-white/5'
                              : 'text-slate-200'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={i} className="text-slate-200 text-[14.5px] leading-relaxed mb-3">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function DiscSection({
  modulePassed,
  hideHeader = false,
}: {
  modulePassed: boolean;
  hideHeader?: boolean;
}) {
  const [passed, setPassed] = useState(modulePassed);
  const [view, setView] = useState<View>({ screen: 'list' });
  const [, startTransition] = useTransition();

  function openLesson(slug: string) {
    setView({ screen: 'lesson', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function beginQuiz() {
    setView({ screen: 'loading' });
    startTransition(async () => {
      const res = await startDiscQuiz();
      if ('error' in res) {
        setView({ screen: 'error', message: res.error });
      } else {
        setView({
          screen: 'quiz',
          questions: res.questions,
          index: 0,
          answers: [],
          feedback: null,
          checking: false,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function answer(selected: string) {
    if (view.screen !== 'quiz' || view.feedback || view.checking) return;
    const q = view.questions[view.index];
    const newAnswers = [...view.answers, { questionId: q.id, selected }];
    setView({ ...view, answers: newAnswers, checking: true });

    startTransition(async () => {
      const res = await checkDiscAnswer(q.id, selected);
      if ('error' in res) {
        setView({ screen: 'error', message: res.error });
      } else {
        setView({
          screen: 'quiz',
          questions: view.questions,
          index: view.index,
          answers: newAnswers,
          feedback: { selected, ...res },
          checking: false,
        });
      }
    });
  }

  function next() {
    if (view.screen !== 'quiz' || !view.feedback) return;
    const { questions, index, answers } = view;
    if (index + 1 < questions.length) {
      setView({
        screen: 'quiz',
        questions,
        index: index + 1,
        answers,
        feedback: null,
        checking: false,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView({ screen: 'loading' });
      startTransition(async () => {
        const res = await submitDiscQuiz(answers);
        if ('error' in res) {
          setView({ screen: 'error', message: res.error });
        } else {
          if (res.passed) setPassed(true);
          setView({ screen: 'results', result: res });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  // ---------- LIST ----------
  if (view.screen === 'list') {
    return (
      <div className="relative z-10">
        {!hideHeader && (
          <>
            <div className="flex items-center gap-2 mb-1 mt-2">
              <Users className="w-5 h-5 text-primary-light" />
              <h2 className="text-lg font-bold text-white">DISC</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Read the customer, make the offer land.
            </p>
          </>
        )}

        {/* learn */}
        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2">
          Learn
        </p>
        <div className="space-y-2.5 mb-4">
          {DISC_LESSONS.map((l) => (
            <button
              key={l.slug}
              onClick={() => openLesson(l.slug)}
              className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-2xl p-4 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/15 text-primary-light flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-white truncate">
                  {l.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Read in app</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          ))}
        </div>

        {/* practice */}
        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2">
          Practice
        </p>
        <button
          onClick={() => setView({ screen: 'ready' })}
          className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-2xl p-4 text-left transition-colors"
        >
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/15 text-primary-light flex-shrink-0">
            <Swords className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-white truncate">
              Read the Room — {DISC_SCENARIO_COUNT} scenarios
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {passed
                ? 'Passed · run it again any time'
                : `${DISC_QUESTION_COUNT} questions · ${Math.round(PASS * 100)}% to pass`}
            </div>
          </div>
          {passed ? (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/20 text-success">
              PASSED
            </span>
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>
    );
  }

  // ---------- LESSON ----------
  if (view.screen === 'lesson') {
    const lesson = getDiscLesson(view.slug);
    if (!lesson) {
      return (
        <button
          onClick={() => setView({ screen: 'list' })}
          className="text-primary-light text-sm underline"
        >
          Back to DISC
        </button>
      );
    }
    const idx = DISC_LESSONS.findIndex((l) => l.slug === lesson.slug);
    const nextLesson = DISC_LESSONS[idx + 1];
    return (
      <div className="relative z-10">
        <button
          onClick={() => setView({ screen: 'list' })}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> DISC
        </button>
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary-light bg-primary/10 px-2.5 py-1 rounded-full mb-3">
          DISC · Learn
        </span>
        <h2 className="text-xl font-bold text-white leading-tight mb-3">
          {lesson.title}
        </h2>
        <ReadingBlocks blocks={lesson.reading} />
        {nextLesson ? (
          <button
            onClick={() => openLesson(nextLesson.slug)}
            className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black mt-4 hover:brightness-105"
          >
            Next: {nextLesson.title}
          </button>
        ) : (
          <button
            onClick={() => setView({ screen: 'ready' })}
            className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black mt-4 hover:brightness-105"
          >
            On to the scenarios
          </button>
        )}
        <button
          onClick={() => setView({ screen: 'list' })}
          className="w-full rounded-2xl py-3.5 font-bold bg-transparent border border-white/10 text-white mt-2.5"
        >
          Back to DISC
        </button>
      </div>
    );
  }

  // ---------- READY ----------
  if (view.screen === 'ready') {
    return (
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 rounded-full grid place-items-center mx-auto my-3 bg-primary/15 text-primary-light border border-primary/30">
          <Swords className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Read the Room</h2>
        <p className="text-sm text-slate-400 mb-4">
          {DISC_SCENARIO_COUNT} customers at the door, all residential electrical.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2 mb-4 text-[13.5px] leading-relaxed text-slate-300">
          <p>
            <b className="text-white">Two questions per scenario.</b> First spot
            the personality type, then pick the best way to make your offer.
          </p>
          <p>
            <b className="text-white">Instant feedback after each answer.</b>{' '}
            {DISC_QUESTION_COUNT} questions, 1 point each,{' '}
            {Math.round(PASS * 100)}% to pass.
          </p>
        </div>
        <button
          onClick={beginQuiz}
          className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black hover:brightness-105"
        >
          I&apos;m ready — start the scenarios
        </button>
        <button
          onClick={() => setView({ screen: 'list' })}
          className="w-full rounded-2xl py-3.5 font-bold bg-transparent border border-white/10 text-white mt-2.5"
        >
          Back to DISC
        </button>
      </div>
    );
  }

  // ---------- LOADING ----------
  if (view.screen === 'loading') {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-light animate-spin mb-4" />
        <p className="text-sm text-slate-400">One moment...</p>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (view.screen === 'error') {
    return (
      <div className="relative z-10 text-center py-16">
        <p className="text-red-400 mb-4">{view.message}</p>
        <button
          onClick={() => setView({ screen: 'list' })}
          className="text-primary-light text-sm underline"
        >
          Back to DISC
        </button>
      </div>
    );
  }

  // ---------- QUIZ ----------
  if (view.screen === 'quiz') {
    const q = view.questions[view.index];
    const pct = Math.round((view.index / view.questions.length) * 100);
    const opts = [q.optionA, q.optionB, q.optionC, q.optionD];
    const scenarioNum = Math.floor(view.index / 2) + 1;
    const qNum = (view.index % 2) + 1;
    const fb = view.feedback;
    return (
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setView({ screen: 'list' })}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-[13px] font-bold text-white truncate max-w-[55%] text-center">
            Scenario {scenarioNum} of {DISC_SCENARIO_COUNT} · Q{qNum}
          </span>
          <span className="text-xs text-slate-500">
            {view.index + 1} / {view.questions.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[15px] text-slate-200 leading-relaxed mb-4 whitespace-pre-line">
          {q.question}
        </p>
        <div className="space-y-2.5">
          {opts.map((t, idx) => {
            const letter = LETTERS[idx];
            const isSelected = fb?.selected === letter;
            const isCorrect = fb?.correct === letter;
            let cls =
              'bg-white/5 hover:border-white/30 border border-white/10 text-white';
            if (fb) {
              if (isCorrect)
                cls = 'bg-success/10 border border-success/50 text-white';
              else if (isSelected)
                cls = 'bg-red-500/10 border border-red-500/50 text-white';
              else cls = 'bg-white/5 border border-white/10 text-slate-400';
            }
            return (
              <button
                key={idx}
                disabled={!!fb || view.checking}
                onClick={() => answer(letter)}
                className={`w-full flex items-start gap-3 rounded-2xl p-3.5 text-left text-[14px] transition-colors ${cls} ${
                  view.checking ? 'opacity-60' : ''
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg grid place-items-center font-bold text-[12px] flex-shrink-0 ${
                    fb && isCorrect
                      ? 'bg-success/30 text-success'
                      : fb && isSelected
                        ? 'bg-red-500/30 text-red-300'
                        : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {letter}
                </span>
                <span className="pt-0.5">{t}</span>
              </button>
            );
          })}
        </div>

        {fb && (
          <>
            <div
              className={`rounded-2xl p-3.5 text-left flex gap-2.5 mt-4 border ${
                fb.isCorrect
                  ? 'bg-success/10 border-success/25'
                  : 'bg-red-500/10 border-red-500/25'
              }`}
            >
              <span className="text-lg">{fb.isCorrect ? '✅' : '❌'}</span>
              <p
                className={`text-[13px] leading-relaxed ${
                  fb.isCorrect ? 'text-emerald-100' : 'text-red-100'
                }`}
              >
                <b className="text-white">
                  {fb.isCorrect ? 'Right read.' : 'Misread the room.'}
                </b>{' '}
                {fb.feedback}
              </p>
            </div>
            <button
              onClick={next}
              className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black mt-3 hover:brightness-105"
            >
              {view.index + 1 < view.questions.length
                ? 'Next'
                : 'See my results'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ---------- RESULTS ----------
  if (view.screen === 'results') {
    const { result } = view;
    const pct = Math.round((result.score / result.total) * 100);
    const pass = result.passed;
    return (
      <div className="relative z-10 text-center">
        <div className="relative w-32 h-32 mx-auto my-3">
          <svg width="128" height="128" className="-rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="11"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke={pass ? '#10b981' : '#ef4444'}
              strokeWidth="11"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={2 * Math.PI * 54 * (1 - pct / 100)}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-3xl font-bold text-white">
            {pct}%
          </div>
        </div>
        <div
          className={`text-2xl font-bold ${pass ? 'text-success' : 'text-red-400'}`}
        >
          {pass ? 'Passed' : 'Keep practicing'}
        </div>
        <div className="text-sm text-slate-400 mb-4">
          {result.score} of {result.total} correct · {Math.round(PASS * 100)}% to
          pass
          {result.xpEarned > 0 ? ` · +${result.xpEarned} XP` : ''}
        </div>

        {/* summary + cheat sheet */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-4">
          <p className="text-[13.5px] leading-relaxed text-slate-300 mb-3">
            <b className="text-white">{DISC_SUMMARY_HEAD}</b> {DISC_SUMMARY_BODY}
          </p>
          <div className="space-y-1.5">
            {DISC_CHEAT_SHEET.map((c) => (
              <div key={c.type} className="flex items-start gap-2.5 text-[13.5px]">
                <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary-light grid place-items-center font-bold text-[12px] flex-shrink-0">
                  {c.type}
                </span>
                <span className="text-slate-200 pt-0.5">{c.line}</span>
              </div>
            ))}
          </div>
          {!pass && (
            <p className="text-[12px] text-slate-400 mt-3">{DISC_SUMMARY_FOOT}</p>
          )}
        </div>

        {/* review */}
        <div className="text-left space-y-2.5 mb-4">
          {result.details.map((d, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-3"
            >
              <div className="flex items-start gap-2">
                {d.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] grid place-items-center flex-shrink-0 mt-0.5 font-bold">
                    ✕
                  </span>
                )}
                <div>
                  <p className="text-[13px] text-white font-semibold leading-snug">
                    Scenario {Math.floor(i / 2) + 1} ·{' '}
                    {i % 2 === 0 ? 'What type?' : 'Make the offer'}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                    {d.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView({ screen: 'list' })}
          className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black hover:brightness-105"
        >
          Back to DISC
        </button>
        <button
          onClick={() => openLesson('intro')}
          className="w-full rounded-2xl py-3.5 font-bold bg-white/5 border border-white/10 text-white mt-2.5"
        >
          Review the profiles
        </button>
        {!pass && (
          <button
            onClick={() => setView({ screen: 'ready' })}
            className="w-full rounded-2xl py-3.5 font-bold bg-transparent border border-white/10 text-white mt-2.5 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Run the scenarios again
          </button>
        )}
      </div>
    );
  }

  return null;
}
