'use server';

import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { getISOWeek } from '@/lib/week';
import {
  type QuizQuestionData,
  stripAnswers,
  selectPhaseQuestions,
  selectFullQuizQuestions,
  gradeQuiz,
  PHASES,
  getRank,
  type ClientQuestion,
} from '@/lib/training';
import { revalidatePath } from 'next/cache';

async function getTechId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('shs_tech_id')?.value ?? null;
}

// Helper to award a badge (same pattern as lib/gamification.ts)
async function awardBadge(technicianId: string, code: string): Promise<string | null> {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return null;

  const existing = await prisma.technicianBadge.findUnique({
    where: {
      technicianId_badgeId: {
        technicianId,
        badgeId: badge.id,
      },
    },
  });

  if (!existing) {
    await prisma.technicianBadge.create({
      data: { technicianId, badgeId: badge.id },
    });
    return badge.name;
  }
  return null;
}

export async function startQuiz(
  phase: string
): Promise<{ questions: ClientQuestion[] } | { error: string }> {
  const techId = await getTechId();
  if (!techId) return { error: 'Not logged in' };

  const allQuestions = (await prisma.quizQuestion.findMany()) as QuizQuestionData[];

  let selected: QuizQuestionData[];
  if (phase === 'FULL') {
    selected = selectFullQuizQuestions(allQuestions);
  } else {
    selected = selectPhaseQuestions(allQuestions, phase);
  }

  if (selected.length === 0) {
    return { error: 'No questions found for this phase' };
  }

  return { questions: selected.map(stripAnswers) };
}

export interface QuizResult {
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
  rankUpdates: {
    phase: string;
    oldRank: string;
    newRank: string;
    passCount: number;
    mastered: boolean;
  }[];
  badgesEarned: string[];
}

export async function submitQuiz(
  phase: string,
  answers: { questionId: string; selected: string }[]
): Promise<QuizResult | { error: string }> {
  const techId = await getTechId();
  if (!techId) return { error: 'Not logged in' };

  const { year, weekNumber } = getISOWeek(new Date());
  const isFullQuiz = phase === 'FULL';

  // Fetch full questions to grade server-side
  const questionIds = answers.map((a) => a.questionId);
  const questions = (await prisma.quizQuestion.findMany({
    where: { id: { in: questionIds } },
  })) as QuizQuestionData[];

  const result = gradeQuiz(answers, questions, isFullQuiz);

  // Check if XP was already earned this week for this phase
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      technicianId: techId,
      year,
      weekNumber,
      phase,
      xpEarned: { gt: 0 },
    },
  });

  const xpToAward = existingAttempt ? 0 : result.xpEarned;

  // Save the attempt
  await prisma.quizAttempt.create({
    data: {
      technicianId: techId,
      year,
      weekNumber,
      phase,
      score: result.score,
      total: result.total,
      xpEarned: xpToAward,
      passed: result.passed,
      answersJson: JSON.stringify(result.details),
    },
  });

  // Track rank updates and badges
  const rankUpdates: QuizResult['rankUpdates'] = [];
  const badgesEarned: string[] = [];

  // Award "First Quiz" badge
  const firstQuizBadge = await awardBadge(techId, 'PACE_FIRST_QUIZ');
  if (firstQuizBadge) badgesEarned.push(firstQuizBadge);

  // Update mastery for each relevant phase
  if (result.passed) {
    const phasesToUpdate = isFullQuiz ? [...PHASES] : [phase];

    for (const p of phasesToUpdate) {
      const mastery = await prisma.phaseMastery.upsert({
        where: {
          technicianId_phase: { technicianId: techId, phase: p },
        },
        update: {},
        create: { technicianId: techId, phase: p },
      });

      if (mastery.mastered) {
        // Already mastered, no update needed
        rankUpdates.push({
          phase: p,
          oldRank: 'Master',
          newRank: 'Master',
          passCount: mastery.passCount,
          mastered: true,
        });
        continue;
      }

      const oldRank = getRank(mastery.passCount);
      const newPassCount = mastery.passCount + 1;
      const newMastered = newPassCount >= 3;
      const newRank = getRank(newPassCount);

      await prisma.phaseMastery.update({
        where: { id: mastery.id },
        data: {
          passCount: newPassCount,
          mastered: newMastered,
          masteredAt: newMastered ? new Date() : undefined,
        },
      });

      rankUpdates.push({
        phase: p,
        oldRank,
        newRank,
        passCount: newPassCount,
        mastered: newMastered,
      });

      // Award phase mastery badges
      if (newMastered) {
        const badgeCode = `PACE_${p}_MASTER`;
        const badgeName = await awardBadge(techId, badgeCode);
        if (badgeName) badgesEarned.push(badgeName);
      }
    }

    // Check for PACE Champion (all 4 mastered)
    const allMasteries = await prisma.phaseMastery.findMany({
      where: { technicianId: techId },
    });
    if (allMasteries.length === 4 && allMasteries.every((m) => m.mastered)) {
      const championBadge = await awardBadge(techId, 'PACE_CHAMPION');
      if (championBadge) badgesEarned.push(championBadge);
    }

    // Check for Perfect Score on Full Quiz
    if (isFullQuiz && result.score === result.total) {
      const perfectBadge = await awardBadge(techId, 'PACE_PERFECT_SCORE');
      if (perfectBadge) badgesEarned.push(perfectBadge);
    }

    // Check for PACE Starter (all 4 phase quizzes passed this week)
    if (!isFullQuiz) {
      const weekAttempts = await prisma.quizAttempt.findMany({
        where: {
          technicianId: techId,
          year,
          weekNumber,
          passed: true,
          phase: { not: 'FULL' },
        },
      });
      const passedPhases = new Set(weekAttempts.map((a) => a.phase));
      if (PHASES.every((p) => passedPhases.has(p))) {
        const starterBadge = await awardBadge(techId, 'PACE_STARTER');
        if (starterBadge) badgesEarned.push(starterBadge);
      }
    }

    // Auto-mark PACE training compliance for current week
    await prisma.complianceRecord.updateMany({
      where: {
        weeklyPerformance: {
          technicianId: techId,
          year,
          weekNumber,
        },
      },
      data: { paceTraining: true },
    });
  }

  revalidatePath('/training');
  revalidatePath('/');

  return {
    score: result.score,
    total: result.total,
    passed: result.passed,
    xpEarned: xpToAward,
    details: result.details,
    rankUpdates,
    badgesEarned,
  };
}
