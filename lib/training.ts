// PACE Training Module - Core logic (pure functions, no DB calls)

export const PHASES = ["PREPARE", "ARRIVE", "CONNECT", "EXECUTE"] as const;
export type Phase = (typeof PHASES)[number];

export const PHASE_LABELS: Record<Phase, string> = {
  PREPARE: "Prepare",
  ARRIVE: "Arrive",
  CONNECT: "Connect",
  EXECUTE: "Execute",
};

export const PHASE_ICONS: Record<Phase, string> = {
  PREPARE: "BookOpen",
  ARRIVE: "MapPin",
  CONNECT: "MessageCircle",
  EXECUTE: "Wrench",
};

export const PHASE_COLORS: Record<Phase, string> = {
  PREPARE: "#3b82f6",   // blue
  ARRIVE: "#10b981",    // green
  CONNECT: "#f59e0b",   // amber
  EXECUTE: "#ef4444",   // red
};

// Rank system
export const RANKS = ["Novice", "Practitioner", "Specialist", "Master"] as const;
export type Rank = (typeof RANKS)[number];

export function getRank(passCount: number): Rank {
  if (passCount >= 3) return "Master";
  if (passCount === 2) return "Specialist";
  if (passCount === 1) return "Practitioner";
  return "Novice";
}

export const RANK_COLORS: Record<Rank, string> = {
  Novice: "text-slate-400",
  Practitioner: "text-amber-600",
  Specialist: "text-slate-300",
  Master: "text-yellow-400",
};

export const RANK_BG: Record<Rank, string> = {
  Novice: "bg-slate-500/20",
  Practitioner: "bg-amber-600/20",
  Specialist: "bg-slate-300/20",
  Master: "bg-yellow-400/20",
};

// Quiz constants
export const PHASE_QUIZ_COUNT = 5;
export const FULL_QUIZ_COUNT = 10;
export const PASS_THRESHOLD = 0.8;
export const XP_PHASE_PASS = 50;
export const XP_FULL_PASS = 150;
export const XP_FAIL = 15;

// Question selection
export interface QuizQuestionData {
  id: string;
  phase: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
  explanation: string;
}

// Stripped version sent to client (no correct answer or explanation)
export interface ClientQuestion {
  id: string;
  phase: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export function stripAnswers(q: QuizQuestionData): ClientQuestion {
  return {
    id: q.id,
    phase: q.phase,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectPhaseQuestions(
  allQuestions: QuizQuestionData[],
  phase: string,
  count: number = PHASE_QUIZ_COUNT
): QuizQuestionData[] {
  const phaseQs = allQuestions.filter((q) => q.phase === phase);
  return shuffle(phaseQs).slice(0, count);
}

export function selectFullQuizQuestions(
  allQuestions: QuizQuestionData[]
): QuizQuestionData[] {
  // 2-3 questions per phase, totaling 10
  const perPhase: QuizQuestionData[] = [];
  const counts = [3, 3, 2, 2]; // distribute 10 across 4 phases
  const shuffledCounts = shuffle(counts);

  PHASES.forEach((phase, i) => {
    const phaseQs = allQuestions.filter((q) => q.phase === phase);
    perPhase.push(...shuffle(phaseQs).slice(0, shuffledCounts[i]));
  });

  return shuffle(perPhase);
}

// Grading
export interface Answer {
  questionId: string;
  selected: string; // "A" | "B" | "C" | "D"
}

export interface GradeResult {
  score: number;
  total: number;
  passed: boolean;
  xpEarned: number;
  details: {
    questionId: string;
    selected: string;
    correct: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export function gradeQuiz(
  answers: Answer[],
  questions: QuizQuestionData[],
  isFullQuiz: boolean
): GradeResult {
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const details = answers.map((a) => {
    const q = questionMap.get(a.questionId);
    return {
      questionId: a.questionId,
      selected: a.selected,
      correct: q?.correct ?? "",
      isCorrect: q ? a.selected === q.correct : false,
      explanation: q?.explanation ?? "",
    };
  });

  const score = details.filter((d) => d.isCorrect).length;
  const total = answers.length;
  const passed = score / total >= PASS_THRESHOLD;
  const xpEarned = passed
    ? isFullQuiz
      ? XP_FULL_PASS
      : XP_PHASE_PASS
    : XP_FAIL;

  return { score, total, passed, xpEarned, details };
}
