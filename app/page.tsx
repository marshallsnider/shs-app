import { ProgressRing } from "@/components/ui/ProgressRing";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";
import { BonusCalculator } from "@/components/dashboard/BonusCalculator";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";
import { CheckCircle2, DollarSign, Star, Users, Award, TrendingUp, Flame } from "lucide-react";
import prisma from "@/lib/db";

import { GoalsWidget } from "@/components/dashboard/GoalsWidget";
import { LastWeekRecap } from "@/components/dashboard/LastWeekRecap";

// Force dynamic to ensure data isn't cached
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 1. Fetch Technician (Simulating logged in user - grabbing first one)
  const tech = await prisma.technician.findFirst({
    include: { badges: { include: { badge: true } } }
  });

  if (!tech) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>No technician account found. Please ask Admin to create one.</p>
      </div>
    );
  }

  // 2. Fetch Current Week Performance
  // determine current ISO week or just grab the latest one
  const now = new Date();
  const year = now.getFullYear();

  // Simple week calc
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + 1) / 7);

  // Previous week calculation
  let prevWeekNumber = weekNumber - 1;
  let prevYear = year;
  if (prevWeekNumber < 1) {
    prevWeekNumber = 52; // Approximation, sufficient for demo
    prevYear = year - 1;
  }

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

  // Default values if no record yet
  const revenue = performance?.totalRevenue ?? 0;
  // @ts-ignore - DB field update might be lagging in types
  const revenueGoal = performance?.revenueGoal ?? 6500;
  const jobs = performance?.jobsCompleted ?? 0;
  const reviews = performance?.reviews ?? 0;
  const memberships = performance?.memberships ?? 0;

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
  } : {
    vanCleanliness: false, // Default fail until passed
    paperworkSubmitted: false,
    estimateFollowups: false,
    zeroCallbacks: false, // Wait, maybe default true?
    noComplaints: false,
    noBadDriving: false,
    drugScreening: false,
    noOshaViolations: false,
    paceTraining: false,
  };

  // If no record, we might want to default "Negatives" to true (passing)?
  // e.g. "Zero Callbacks" is true by default until a callback happens.
  // But for the MVP visualization let's stick to strict checking.

  const bonus = calculateTotalBonus(revenue, reviews, memberships, complianceRecord);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen px-4 py-6 pb-20 max-w-md mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-success/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Welcome back,
          </h1>
          <p className="text-xl text-white">{tech.name}</p>
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
        </div>
      </header>

      {/* Main Revenue Ring */}
      <section className="flex flex-col items-center justify-center mb-8 relative z-10">
        <div className="relative">
          {/* Animated Glow behind ring */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <ProgressRing
            progress={Math.min((revenue / 7000) * 100, 100)}
            size={240}
            strokeWidth={16}
            label={formatter.format(revenue)}
            subLabel="Current Revenue"
            color={revenue >= 7000 ? "#10b981" : "#3b82f6"}
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            {revenue >= 7000
              ? "Change Makers Bonus Unlocked! 🎉"
              : `${formatter.format(7000 - revenue)} to unlock bonus`}
          </p>
        </div>
      </section>

      {/* Bonus Calculator */}
      <section className="mb-8 relative z-10">
        <BonusCalculator bonus={bonus} potential={1000} />
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
              // Default conservative compliance if missing
              vanCleanliness: false,
              paperworkSubmitted: false,
              estimateFollowups: false,
              zeroCallbacks: false,
              noComplaints: false,
              noBadDriving: false,
              drugScreening: false,
              noOshaViolations: false,
              paceTraining: false,
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

      {/* Compliance */}
      <section className="mb-8 relative z-10 pb-20">
        <CompliancePanel
          compliance={complianceRecord}
          isEligible={bonus.eligible}
        />
      </section>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background-paper/90 backdrop-blur border-t border-white/5 flex items-center justify-around z-50">
        <div className="flex flex-col items-center gap-1 text-primary-light">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px]">Dashboard</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-500">
          <Award className="w-6 h-6" />
          <span className="text-[10px]">Rank</span>
        </div>
      </div>
    </main>
  );
}
