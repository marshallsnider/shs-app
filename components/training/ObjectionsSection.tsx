'use client';

import { useState, useTransition, type ReactNode } from 'react';
import {
  startObjectionQuiz,
  submitObjectionQuiz,
  type ObjectionResult,
} from '@/app/training/actions';
import {
  OBJECTION_MODULES,
  getObjectionModule,
  type Block,
} from '@/lib/objections';
import { type ClientQuestion } from '@/lib/training';
import {
  Shield,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  Loader2,
  RotateCcw,
} from 'lucide-react';

const PASS = 0.8;
const LETTERS = ['A', 'B', 'C', 'D'] as const;

type View =
  | { screen: 'list' }
  | { screen: 'lesson'; slug: string }
  | { screen: 'readDone'; slug: string; ready: boolean }
  | { screen: 'loading'; slug: string }
  | {
      screen: 'quiz';
      slug: string;
      questions: ClientQuestion[];
      index: number;
      answers: { questionId: string; selected: string }[];
      locked: boolean;
    }
  | {
      screen: 'results';
      slug: string;
      questions: ClientQuestion[];
      result: ObjectionResult;
    }
  | { screen: 'error'; slug: string; message: string };

function ReadingBlocks({ blocks }: { blocks: Block[] }) {
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
        return (
          <p key={i} className="text-slate-200 text-[14.5px] leading-relaxed mb-3">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function ObjectionsSection({ passedSlugs }: { passedSlugs: string[] }) {
  const [passed, setPassed] = useState<Set<string>>(new Set(passedSlugs));
  const [view, setView] = useState<View>({ screen: 'list' });
  const [, startTransition] = useTransition();

  function openLesson(slug: string) {
    setView({ screen: 'lesson', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function markRead(slug: string) {
    setView({ screen: 'readDone', slug, ready: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function beginQuiz(slug: string) {
    setView({ screen: 'loading', slug });
    startTransition(async () => {
      const res = await startObjectionQuiz(slug);
      if ('error' in res) {
        setView({ screen: 'error', slug, message: res.error });
      } else {
        setView({
          screen: 'quiz',
          slug,
          questions: res.questions,
          index: 0,
          answers: [],
          locked: false,
        });
      }
    });
  }

  function answer(selected: string) {
    if (view.screen !== 'quiz' || view.locked) return;
    const { slug, questions, index, answers } = view;
    const q = questions[index];
    const newAnswers = [...answers, { questionId: q.id, selected }];
    setView({ ...view, answers: newAnswers, locked: true });

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setView({
          screen: 'quiz',
          slug,
          questions,
          index: index + 1,
          answers: newAnswers,
          locked: false,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setView({ screen: 'loading', slug });
        startTransition(async () => {
          const res = await submitObjectionQuiz(slug, newAnswers);
          if ('error' in res) {
            setView({ screen: 'error', slug, message: res.error });
          } else {
            if (res.passed) {
              setPassed((prev) => new Set(prev).add(slug));
            }
            setView({ screen: 'results', slug, questions, result: res });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    }, 220);
  }

  // ---------- LIST ----------
  if (view.screen === 'list') {
    return (
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1 mt-2">
          <Shield className="w-5 h-5 text-primary-light" />
          <h2 className="text-lg font-bold text-white">Objections</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Three reps to lock each one in.
        </p>

        {/* loop legend */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { n: '1', t: 'Read', s: 'in app', live: false },
            { n: '2', t: 'Check', s: 'next day', live: false },
            { n: '3', t: 'Practice', s: 'Tuesday', live: true },
          ].map((x) => (
            <div
              key={x.n}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-2 text-center"
            >
              <span
                className={`inline-grid place-items-center w-5 h-5 rounded-full text-[10px] font-bold mb-1 ${
                  x.live
                    ? 'bg-success/20 text-success'
                    : 'bg-primary/20 text-primary-light'
                }`}
              >
                {x.n}
              </span>
              <div className="text-[11px] font-bold text-white">{x.t}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wide">
                {x.s}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {OBJECTION_MODULES.map((m) => {
            const done = passed.has(m.slug);
            return (
              <button
                key={m.slug}
                onClick={() => openLesson(m.slug)}
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 rounded-2xl p-4 text-left transition-colors"
              >
                <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/15 text-primary-light flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-white truncate">
                    {m.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {done ? 'Passed · practice it Tuesday' : '1 read · then a check'}
                  </div>
                </div>
                {done ? (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-success/20 text-success">
                    PASSED
                  </span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const mod = getObjectionModule(view.slug);
  if (!mod) {
    return (
      <button
        onClick={() => setView({ screen: 'list' })}
        className="text-primary-light text-sm underline"
      >
        Back to Objections
      </button>
    );
  }

  // ---------- LESSON ----------
  if (view.screen === 'lesson') {
    return (
      <div className="relative z-10">
        <Stepper active={1} />
        <button
          onClick={() => setView({ screen: 'list' })}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Objections
        </button>
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary-light bg-primary/10 px-2.5 py-1 rounded-full mb-3">
          Objection · Execute
        </span>
        <h2 className="text-xl font-bold text-white leading-tight mb-3">
          {mod.title}
        </h2>
        <ReadingBlocks blocks={mod.reading} />
        <button
          onClick={() => markRead(mod.slug)}
          className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black mt-4 hover:brightness-105"
        >
          ✓ I&apos;ve read this
        </button>
      </div>
    );
  }

  // ---------- READ DONE (the space before the check) ----------
  if (view.screen === 'readDone') {
    return (
      <div className="relative z-10 text-center">
        <Stepper active={1} />
        <div className="w-16 h-16 rounded-full grid place-items-center mx-auto my-3 bg-success/15 text-success border border-success/30 text-3xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white mb-1">You&apos;ve read it</h2>
        <p className="text-sm text-slate-400 mb-4">{mod.title}</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3 mb-4">
          <Row icon={<BookOpen className="w-4 h-4 text-primary-light" />}>
            <b className="text-white">Step 1 done.</b> You&apos;ve got the moves
            and the words.
          </Row>
          <Row icon={<Clock className="w-4 h-4 text-amber-400" />}>
            <b className="text-white">Step 2 is the check.</b> It&apos;s a
            follow-up, not a copy test. Best taken later, from memory, with the
            reading closed.
          </Row>
          <Row icon={<Users className="w-4 h-4 text-success" />}>
            <b className="text-white">Step 3 is Tuesday.</b> We practice it out
            loud together in training.
          </Row>
        </div>
        <button
          onClick={() => beginQuiz(mod.slug)}
          className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black hover:brightness-105"
        >
          I&apos;m ready — start the check
        </button>
        <button
          onClick={() => setView({ screen: 'list' })}
          className="w-full rounded-2xl py-3.5 font-bold bg-transparent border border-white/10 text-white mt-2.5"
        >
          Back to Objections
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
          Back to Objections
        </button>
      </div>
    );
  }

  // ---------- QUIZ ----------
  if (view.screen === 'quiz') {
    const q = view.questions[view.index];
    const pct = Math.round((view.index / view.questions.length) * 100);
    const opts = [q.optionA, q.optionB, q.optionC, q.optionD];
    return (
      <div className="relative z-10">
        <Stepper active={2} />
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setView({ screen: 'list' })}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-[13px] font-bold text-white truncate max-w-[55%] text-center">
            {mod.title}
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
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mb-4">
          <Lock className="w-3 h-3" /> Reading hidden — answer from memory
        </p>
        <p className="text-[17px] font-bold text-white leading-snug mb-4">
          {q.question}
        </p>
        <div className="space-y-2.5">
          {opts.map((t, idx) => (
            <button
              key={idx}
              disabled={view.locked}
              onClick={() => answer(LETTERS[idx])}
              className="w-full flex items-start gap-3 bg-white/5 hover:border-white/30 border border-white/10 rounded-2xl p-3.5 text-left text-[14px] text-white transition-colors disabled:opacity-60"
            >
              <span className="w-6 h-6 rounded-lg bg-white/10 grid place-items-center font-bold text-[12px] text-slate-300 flex-shrink-0">
                {LETTERS[idx]}
              </span>
              <span className="pt-0.5">{t}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- RESULTS ----------
  if (view.screen === 'results') {
    const { result, questions } = view;
    const pct = Math.round((result.score / result.total) * 100);
    const pass = result.passed;
    const qMap = new Map(questions.map((q) => [q.id, q]));
    return (
      <div className="relative z-10 text-center">
        <Stepper active={pass ? 3 : 2} />
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

        <div
          className={`rounded-2xl p-3.5 text-left flex gap-2.5 mb-4 border ${
            pass
              ? 'bg-success/10 border-success/25'
              : 'bg-red-500/10 border-red-500/25'
          }`}
        >
          <span className="text-lg">{pass ? '🤝' : '🔁'}</span>
          <p className={`text-[13px] leading-relaxed ${pass ? 'text-emerald-100' : 'text-red-100'}`}>
            {pass ? (
              <>
                <b className="text-white">Up next: practice.</b> Bring this one
                to Tuesday training. We&apos;ll run it live so it&apos;s there
                when a customer says it.
              </>
            ) : (
              <>
                <b className="text-white">Almost.</b> Re-read it, then take the
                check again. 80% locks it in.
              </>
            )}
          </p>
        </div>

        {/* review */}
        <div className="text-left space-y-2.5 mb-4">
          {result.details.map((d, i) => {
            const q = qMap.get(d.questionId);
            return (
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
                      {q?.question ?? ''}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                      {d.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setView({ screen: 'list' })}
          className="w-full rounded-2xl py-3.5 font-bold bg-primary text-black hover:brightness-105"
        >
          Back to Objections
        </button>
        <button
          onClick={() => openLesson(view.slug)}
          className="w-full rounded-2xl py-3.5 font-bold bg-white/5 border border-white/10 text-white mt-2.5"
        >
          Re-read the lesson
        </button>
        {!pass && (
          <button
            onClick={() => beginQuiz(view.slug)}
            className="w-full rounded-2xl py-3.5 font-bold bg-transparent border border-white/10 text-white mt-2.5 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try the check again
          </button>
        )}
      </div>
    );
  }

  return null;
}

function Stepper({ active }: { active: number }) {
  const items = ['Read', 'Check', 'Practice'];
  return (
    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-slate-500">
      {items.map((t, i) => (
        <span key={t} className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 ${
              i + 1 === active ? 'text-primary-light' : ''
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                i + 1 === active ? 'bg-primary' : 'bg-white/20'
              }`}
            />
            {t}
          </span>
          {i < 2 && <span className="opacity-40">→</span>}
        </span>
      ))}
    </div>
  );
}

function Row({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-slate-300">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div>{children}</div>
    </div>
  );
}
