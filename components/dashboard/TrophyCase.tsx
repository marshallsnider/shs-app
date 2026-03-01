import { Card } from "@/components/ui/Card";
import { Star, DollarSign, Flame, Zap, Crown, Users, ShieldCheck, Lock } from "lucide-react";

interface TrophyCaseProps {
    badges: any[]; // The earned badges (TechnicianBadge[])
    allBadges?: any[]; // Optional list of all possible badges for "locked" view
}

// Map codes to Icons
const ICON_MAP: any = {
    'FIRST_STEPS': Star,
    'MONEY_MAKER': DollarSign,
    'REVIEW_MASTER': Star,
    'ON_FIRE': Flame,
    'UNSTOPPABLE': Zap,
    'HIGH_ROLLER': Crown,
    'MEMBERSHIP_PRO': Users,
    'PERFECT_WEEK': ShieldCheck
};

// All definitions (Manual fallback if not passed, matching seed)
const ALL_BADGES_DEF = [
    { code: 'FIRST_STEPS', name: 'First Steps', description: 'Complete your first job' },
    { code: 'MONEY_MAKER', name: 'Money Maker', description: 'Earn your first weekly bonus ($7k+)' },
    { code: 'REVIEW_MASTER', name: 'Review Master', description: 'Get 5+ reviews in a single week' },
    { code: 'ON_FIRE', name: 'On Fire', description: '5 consecutive compliant weeks' },
    { code: 'UNSTOPPABLE', name: 'Unstoppable', description: '10 consecutive compliant weeks' },
    { code: 'HIGH_ROLLER', name: 'High Roller', description: 'Hit $13k+ in a single week' },
    { code: 'MEMBERSHIP_PRO', name: 'Membership Pro', description: 'Sell 5+ memberships in a single week' },
    { code: 'PERFECT_WEEK', name: 'Perfect Week', description: '$7k+ Revenue AND 100% Compliance' },
];

export function TrophyCase({ badges }: TrophyCaseProps) {
    // Create a set of earned codes for O(1) lookup
    const earnedCodes = new Set(badges.map(b => b.badge.code));

    return (
        <Card glass className="relative overflow-hidden mb-8">
            <div className="flex items-center gap-2 mb-4 relative z-10">
                <Crown className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-bold text-white">Trophy Case</h2>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 relative z-10">
                {ALL_BADGES_DEF.map((def) => {
                    const isEarned = earnedCodes.has(def.code);
                    const Icon = ICON_MAP[def.code] || Star;

                    return (
                        <div key={def.code} className="flex flex-col items-center">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 mb-1 transition-all ${isEarned
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                    : 'bg-slate-800/50 border-slate-700 opacity-50 grayscale'
                                }`}>
                                {isEarned ? (
                                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                                ) : (
                                    <Lock className="w-4 h-4 text-slate-600" />
                                )}
                            </div>
                            <span className={`text-[10px] text-center font-medium leading-tight ${isEarned ? 'text-white' : 'text-slate-600'}`}>
                                {def.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {badges.length === 0 && (
                <div className="mt-4 text-center text-xs text-slate-500 italic">
                    Start crushing goals to unlock trophies!
                </div>
            )}
        </Card>
    );
}
