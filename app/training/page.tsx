import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getISOWeek } from '@/lib/week';
import { PHASES } from '@/lib/training';
import { TrainingHub } from '@/components/training/TrainingHub';
import { GraduationCap, TrendingUp, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrainingPage() {
  const cookieStore = await cookies();
  const techId = cookieStore.get('shs_tech_id')?.value;

  if (!techId) {
    redirect('/login');
  }

  const tech = await prisma.technician.findUnique({
    where: { id: techId },
  });

  if (!tech) {
    redirect('/login');
  }

  const { year, weekNumber } = getISOWeek(new Date());

  // Fetch phase masteries
  const masteries = await prisma.phaseMastery.findMany({
    where: { technicianId: techId },
  });

  // Ensure all 4 phases have a mastery row
  for (const phase of PHASES) {
    if (!masteries.find((m) => m.phase === phase)) {
      const created = await prisma.phaseMastery.create({
        data: { technicianId: techId, phase },
      });
      masteries.push(created);
    }
  }

  // Fetch this week's quiz attempts
  const weekAttempts = await prisma.quizAttempt.findMany({
    where: {
      technicianId: techId,
      year,
      weekNumber,
    },
    orderBy: { completedAt: 'desc' },
  });

  // Calculate total XP from all quiz attempts
  const totalXp = await prisma.quizAttempt.aggregate({
    where: { technicianId: techId },
    _sum: { xpEarned: true },
  });

  // Build phase data for the UI
  const phaseData = PHASES.map((phase) => {
    const mastery = masteries.find((m) => m.phase === phase);
    const latestAttempt = weekAttempts.find((a) => a.phase === phase);
    return {
      phase,
      passCount: mastery?.passCount ?? 0,
      mastered: mastery?.mastered ?? false,
      weekAttempt: latestAttempt
        ? {
            score: latestAttempt.score,
            total: latestAttempt.total,
            passed: latestAttempt.passed,
          }
        : null,
    };
  });

  const fullQuizAttempt = weekAttempts.find((a) => a.phase === 'FULL');

  return (
    <main className="min-h-screen px-4 py-6 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-success/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="bg-white/5 p-2 rounded-full backdrop-blur-sm border border-white/10 relative z-10">
              <GraduationCap className="w-10 h-10 text-primary-light" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PACE Training
            </h1>
            <p className="text-sm text-slate-400">
              {tech.name} &middot; Week {weekNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <span className="text-xs font-bold text-primary-light">
            {totalXp._sum.xpEarned ?? 0} XP
          </span>
        </div>
      </header>

      {/* Training Hub (client component) */}
      <TrainingHub
        phaseData={phaseData}
        fullQuizAttempt={
          fullQuizAttempt
            ? {
                score: fullQuizAttempt.score,
                total: fullQuizAttempt.total,
                passed: fullQuizAttempt.passed,
              }
            : null
        }
        techName={tech.name}
        streak={tech.currentStreak}
      />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background-paper/90 backdrop-blur border-t border-white/5 flex items-center justify-around z-50">
        <a
          href="/"
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary-light transition-colors"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px]">Dashboard</span>
        </a>
        <a
          href="/training"
          className="flex flex-col items-center gap-1 text-primary-light"
        >
          <GraduationCap className="w-6 h-6" />
          <span className="text-[10px]">Training</span>
        </a>
        <a
          href="/#leaderboard"
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary-light transition-colors"
        >
          <Award className="w-6 h-6" />
          <span className="text-[10px]">Rank</span>
        </a>
      </div>
    </main>
  );
}
