import prisma from "@/lib/db";
import { Trophy, Crown, Medal } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface LeaderboardProps {
    currentTechId: string;
    year: number;
    weekNumber: number;
}

export async function Leaderboard({ currentTechId, year, weekNumber }: LeaderboardProps) {
    const performances = await prisma.weeklyPerformance.findMany({
        where: { year, weekNumber },
        include: { technician: true },
        orderBy: { totalRevenue: 'desc' },
    });

    // Only show active techs
    const ranked = performances.filter(p => p.technician.isActive);

    if (ranked.length === 0) {
        return null;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const topRevenue = ranked[0]?.totalRevenue || 1;

    return (
        <Card className="w-full">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Weekly Leaderboard</h3>
            </div>

            <div className="space-y-2">
                {ranked.map((p, idx) => {
                    const isCurrentUser = p.technicianId === currentTechId;
                    const barWidth = topRevenue > 0 ? (p.totalRevenue / topRevenue) * 100 : 0;

                    return (
                        <div
                            key={p.id}
                            className={`relative flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrentUser
                                    ? 'bg-primary/15 border border-primary/30 shadow-lg shadow-primary/10'
                                    : 'bg-white/5 hover:bg-white/8'
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-8 text-center flex-shrink-0">
                                {idx < 3 ? (
                                    <span className="text-lg">{medals[idx]}</span>
                                ) : (
                                    <span className="text-sm font-bold text-slate-500">#{idx + 1}</span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCurrentUser
                                    ? 'bg-primary/30 text-primary-light border border-primary/40'
                                    : 'bg-slate-700 text-white'
                                }`}>
                                {p.technician.avatar || p.technician.name.charAt(0)}
                            </div>

                            {/* Name + Bar */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary-light' : 'text-white'
                                        }`}>
                                        {isCurrentUser ? `${p.technician.name} (You)` : p.technician.name}
                                    </span>
                                    <span className="text-sm font-bold text-white ml-2 flex-shrink-0">
                                        ${p.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${idx === 0 ? 'bg-yellow-400' :
                                                idx === 1 ? 'bg-slate-300' :
                                                    idx === 2 ? 'bg-amber-600' :
                                                        isCurrentUser ? 'bg-primary' : 'bg-slate-600'
                                            }`}
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
