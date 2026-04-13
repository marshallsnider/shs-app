import { ProgressRing } from "@/components/ui/ProgressRing";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";
import { BonusCalculator } from "@/components/dashboard/BonusCalculator";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";
import { CheckCircle2, DollarSign, Star, Users, Award, TrendingUp, Flame, LogOut, GraduationCap } from "lucide-react";
import prisma from "@/lib/db";

import { GoalsWidget } from "@/components/dashboard/GoalsWidget";
import { LastWeekRecap } from "@/components/dashboard/LastWeekRecap";
import { TrophyCase } from "@/components/dashboard/TrophyCase";
import { ComplianceAlert } from "@/components/dashboard/ComplianceAlert";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { HistoricalChart } from "@/components/dashboard/HistoricalChart";
import { MilestoneToast } from "@/components/dashboard/MilestoneToast";
import { logoutTechnician } from "@/app/actions";
import { getISOWeek, getPreviousWeek } from "@/lib/week";

// Force dynamic to ensure data isn't cached
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const techId = cookieStore.get('shs_tech_id')?.value;

  if (!techId) {
    redirect('/login');
  }

  // 1. Fetch Technician specific to cookie
  const tech = await prisma.technician.findUnique({
    where: { id: techId },
    include: { badges: { include: { badge: true } } }
  });

  if (!tech) {
    redirect('/login');
  }

  // 2. Fetch Current Week Performance
  const { year, weekNumber } = getISOWeek(new Date());
  const { year: prevYear, weekNumber: prevWeekNumber } = getPreviousWeek(year, weekNumber);

  const performance = await prisma.weeklyPerformance.findUnique({
    where: {
      technicianId_year_weekNumber: {
        technicianId: tech.id,
        year: year,
        weekNumber: weekNumber
      }
    },
    include: { compliance: true }
  });

  const prevPerformance = await prisma.weeklyPerformance.findUnique({
    where: {
      technicianId_year_weekNumber: {
        technicianId: tech.id,
        year: prevYear,
        weekNumber: prevWeekNumber
      }
    },
    include: { compliance: true }
  });

  // Fetch last 4 weeks for historical chart (handles year boundary)
  const historicalWeeks: { year: number; weekNumber: number }[] = [];
  let histWeek = { year, weekNumber };
  for (let i = 0; i < 4; i++) {
    historicalWeeks.unshift(histWeek);
    histWeek = getPreviousWeek(histWeek.year, histWeek.weekNumber);
  }

  const historicalData = await prisma.weeklyPerformance.findMany({
    where: {
      technicianId: tech.id,
      OR: historicalWeeks.map(w => ({ year: w.year, weekNumber: w.weekNumber })),
    },
    orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }],
  });

  // Default values if no record yet
  const revenue = performance?.totalRevenue ?? 0;
  const revenueGoal = performance?.revenueGoal ?? 6500;
  const jobs = performance?.jobsCompleted ?? 0;
  const reviews = performance?.reviews ?? 0;
  const memberships = performance?.memberships ?? 0;

  const hasComplianceData = !!performance?.compliance;

  const complianceRecord: ComplianceRecord = performance?.compliance ? {
    vanCleanliness: performance.compliance.vanCleanliness,
    paperworkSubmitted: performance.compliance.paperworkSubmitted,
    estimateFollowups: performance.compliance.estimateFollowups,
    zeroCallbacks: performance.compliance.zeroCallbacks,
    noComplaints: performance.compliance.noComplaints,
    noBadDriving: performance.compliance.noBadDriving,
    drugScreening: performance.compliance.drugScreening,
    noOshaViolations: performance.compliance.noOshaViolations,
    paceTraining: performance.compliance.paceTraining,
    dressCode: performance.compliance.dressCode,
  } : {
    vanCleanliness: false,
    paperworkSubmitted: false,
    estimateFollowups: false,
    zeroCallbacks: false,
    noComplaints: false,
    noBadDriving: false,
    drugScreening: false,
    noOshaViolations: false,
    paceTraining: false,
    dressCode: false,
  };

  const bonus = calculateTotalBonus(revenue, reviews, memberships, complianceRecord);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <main id="top" className="min-h-screen px-4 py-6 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Milestone Toast */}
      <MilestoneToast revenue={revenue} techName={tech.name} year={year} weekNumber={weekNumber} />

      {/* Background Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-success/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          {/* Logo with Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="bg-white/5 p-2 rounded-full backdrop-blur-sm border border-white/10 relative z-10">
              <img src="/logo.png" alt="SHS Logo" className="w-12 h-12 object-contain rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Welcome back,
            </h1>
            <p className="text-lg text-white font-medium">{tech.name}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center border border-white/10 shadow-lg text-white font-bold text-lg">
            {tech.avatar}
          </div>
          {/* Streak Indicator */}
          {tech.currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
              <Flame className="w-3 h-3 text-orange-500" fill="currentColor" />
              <span className="text-xs font-bold text-orange-400">{tech.currentStreak}</span>
            </div>
          )}
          <form action={logoutTechnician}>
            <button type="submit" className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Compliance Alert - Show immediately if not qualifying */}
      <ComplianceAlert compliance={complianceRecord} infractionCount={bonus.infractionCount} deductions={bonus.deductions} strikeLevel={bonus.strikeLevel} hasData={hasComplianceData} />

      {/* Main Revenue Ring */}
      <section className="flex flex-col items-center justify-center mb-8 relative z-10">
        <div className="relative">
          {/* Animated Glow behind ring */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <ProgressRing
            progress={Math.min((revenue / revenueGoal) * 100, 100)}
            size={240}
            strokeWidth={16}
            label={formatter.format(revenue)}
            subLabel="Current Revenue"
            color={revenue >= revenueGoal ? "#10b981" : "#3b82f6"}
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            {revenue >= revenueGoal
              ? "Change Makers Bonus Unlocked! 🎉"
              : `${formatter.format(revenueGoal - revenue)} to unlock bonus`}
          </p>
        </div>
      </section>

      {/* Bonus Calculator */}
      <section className="mb-8 relative z-10">
        <BonusCalculator bonus={bonus} potential={1000} revenue={revenue} />
      </section>

      {/* Key Metrics Grid */}
      <section className="grid grid-cols-2 gap-3 mb-8 relative z-10">
        <MetricCard
          label="Jobs Done"
          value={jobs}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Avg Ticket"
          value={formatter.format(jobs > 0 ? revenue / jobs : 0)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Reviews"
          value={reviews}
          subValue={`$${reviews * 25}`}
          icon={Star}
          color="text-warning"
        />
        <MetricCard
          label="Club Mem"
          value={memberships}
          subValue={`$${memberships * 25}`}
          icon={Users}
          color="text-primary-light"
        />
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="mb-8 relative z-10 scroll-mt-20">
        <Leaderboard currentTechId={tech.id} year={year} weekNumber={weekNumber} />
      </section>

      {/* Historical Chart */}
      <section className="mb-8 relative z-10">
        <HistoricalChart
          weeks={historicalData.map(h => ({
            weekNumber: h.weekNumber,
            revenue: h.totalRevenue,
            jobs: h.jobsCompleted
          }))}
          currentWeek={weekNumber}
        />
      </section>

      {/* Last Week Recap */}
      {prevPerformance && (
        <LastWeekRecap
          revenue={prevPerformance.totalRevenue}
          jobs={prevPerformance.jobsCompleted}
          bonus={calculateTotalBonus(
            prevPerformance.totalRevenue,
            prevPerformance.reviews,
            prevPerformance.memberships,
            prevPerformance.compliance || {
              vanCleanliness: false,
              paperworkSubmitted: false,
              estimateFollowups: false,
              zeroCallbacks: false,
              noComplaints: false,
              noBadDriving: false,
              drugScreening: false,
              noOshaViolations: false,
              paceTraining: false,
              dressCode: false,
            }
          ).total}
          isCompliant={prevPerformance.isCompliant}
          format={formatter.format}
        />
      )}

      {/* Goals */}
      <section className="mb-8 relative z-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-light" />
          Weekly Goals
        </h2>
        <GoalsWidget
          technicianId={tech.id}
          year={year}
          weekNumber={weekNumber}
          currentRevenue={revenue}
          currentGoal={revenueGoal}
        />
      </section>

      {/* Trophy Case */}
      <section className="mb-8 relative z-10">
        <TrophyCase badges={tech.badges} />
      </section>

      {/* Compliance */}
      <section className="mb-8 relative z-10 pb-20">
        <CompliancePanel
          compliance={complianceRecord}
          isEligible={bonus.eligible}
          infractionCount={bonus.infractionCount}
          strikeLevel={bonus.strikeLevel}
          hasData={hasComplianceData}
        />
      </section>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background-paper/90 backdrop-blur border-t border-white/5 flex items-center justify-around z-50">
        <a href="#top" className="flex flex-col items-center gap-1 text-primary-light">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px]">Dashboard</span>
        </a>
        <a href="/training" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary-light transition-colors">
          <GraduationCap className="w-6 h-6" />
          <span className="text-[10px]">Training</span>
        </a>
        <a href="#leaderboard" className="flex flex-col items-center gap-1 text-slate-500 hover:text-primary-light transition-colors">
          <Award className="w-6 h-6" />
          <span className="text-[10px]">Rank</span>
        </a>
      </div>
    </main>
  );
}
