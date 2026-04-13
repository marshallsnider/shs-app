import prisma from '@/lib/db';
import { getRank, PHASE_LABELS, PHASES, RANK_COLORS, type Phase } from '@/lib/training';
import { GraduationCap, Trophy, Users, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTrainingPage() {
  // Fetch all technicians with their mastery data
  const technicians = await prisma.technician.findMany({
    where: { isActive: true },
    include: {
      phaseMasteries: true,
    },
    orderBy: { name: 'asc' },
  });

  // Fetch recent quiz attempts
  const recentAttempts = await prisma.quizAttempt.findMany({
    take: 50,
    orderBy: { completedAt: 'desc' },
    include: {
      technician: { select: { name: true } },
    },
  });

  // Stats
  const totalAttempts = await prisma.quizAttempt.count();
  const passedAttempts = await prisma.quizAttempt.count({
    where: { passed: true },
  });
  const totalMastered = await prisma.phaseMastery.count({
    where: { mastered: true },
  });
  const paceChampions = technicians.filter(
    (t) =>
      t.phaseMasteries.length === 4 &&
      t.phaseMasteries.every((m) => m.mastered)
  );

  const avgScore =
    totalAttempts > 0
      ? (
          (await prisma.quizAttempt.aggregate({ _avg: { score: true } }))._avg
            .score ?? 0
        ).toFixed(1)
      : '0';

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap className="w-8 h-8 text-primary-light" />
        <h1 className="text-2xl font-bold text-white">PACE Training</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Attempts" value={totalAttempts} icon={BarChart3} />
        <KPICard
          label="Pass Rate"
          value={
            totalAttempts > 0
              ? `${Math.round((passedAttempts / totalAttempts) * 100)}%`
              : '0%'
          }
          icon={GraduationCap}
        />
        <KPICard label="Phases Mastered" value={totalMastered} icon={Trophy} />
        <KPICard
          label="PACE Champions"
          value={paceChampions.length}
          icon={Users}
        />
      </div>

      {/* Mastery Status Grid */}
      <div className="bg-background-paper border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Mastery Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-400 font-medium py-3 px-2">
                  Technician
                </th>
                {PHASES.map((p) => (
                  <th
                    key={p}
                    className="text-center text-slate-400 font-medium py-3 px-2"
                  >
                    {PHASE_LABELS[p]}
                  </th>
                ))}
                <th className="text-center text-slate-400 font-medium py-3 px-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((tech) => {
                const isChampion =
                  tech.phaseMasteries.length === 4 &&
                  tech.phaseMasteries.every((m) => m.mastered);
                return (
                  <tr
                    key={tech.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-3 px-2 text-white font-medium">
                      {tech.name}
                    </td>
                    {PHASES.map((phase) => {
                      const mastery = tech.phaseMasteries.find(
                        (m) => m.phase === phase
                      );
                      const rank = getRank(mastery?.passCount ?? 0);
                      return (
                        <td key={phase} className="text-center py-3 px-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              mastery?.mastered
                                ? 'bg-yellow-400/20 text-yellow-400'
                                : rank === 'Specialist'
                                  ? 'bg-slate-300/20 text-slate-300'
                                  : rank === 'Practitioner'
                                    ? 'bg-amber-600/20 text-amber-600'
                                    : 'bg-slate-500/20 text-slate-500'
                            }`}
                          >
                            {rank}
                          </span>
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            {mastery?.passCount ?? 0}/3
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-2">
                      {isChampion ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold">
                          <Trophy className="w-3 h-3" />
                          Champion
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Quiz Attempts */}
      <div className="bg-background-paper border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Recent Quiz Attempts
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-400 font-medium py-3 px-2">
                  Tech
                </th>
                <th className="text-left text-slate-400 font-medium py-3 px-2">
                  Phase
                </th>
                <th className="text-center text-slate-400 font-medium py-3 px-2">
                  Score
                </th>
                <th className="text-center text-slate-400 font-medium py-3 px-2">
                  Result
                </th>
                <th className="text-center text-slate-400 font-medium py-3 px-2">
                  XP
                </th>
                <th className="text-right text-slate-400 font-medium py-3 px-2">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAttempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-3 px-2 text-white">
                    {attempt.technician.name}
                  </td>
                  <td className="py-3 px-2 text-slate-300">
                    {attempt.phase === 'FULL'
                      ? 'Full Quiz'
                      : PHASE_LABELS[attempt.phase as Phase] ?? attempt.phase}
                  </td>
                  <td className="text-center py-3 px-2 text-white font-medium">
                    {attempt.score}/{attempt.total}
                  </td>
                  <td className="text-center py-3 px-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        attempt.passed
                          ? 'bg-success/20 text-success'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {attempt.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2 text-primary-light font-medium">
                    +{attempt.xpEarned}
                  </td>
                  <td className="text-right py-3 px-2 text-slate-500 text-xs">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentAttempts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    No quiz attempts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="bg-background-paper border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary-light" />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
  );
}
