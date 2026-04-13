'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Star, DollarSign, Flame, Zap, Crown, Users, ShieldCheck, Lock, BookOpen, MapPin, MessageCircle, Wrench, Trophy, Target, GraduationCap, X } from "lucide-react";

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
    'PERFECT_WEEK': ShieldCheck,
    'PACE_FIRST_QUIZ': BookOpen,
    'PACE_PREPARE_MASTER': BookOpen,
    'PACE_ARRIVE_MASTER': MapPin,
    'PACE_CONNECT_MASTER': MessageCircle,
    'PACE_EXECUTE_MASTER': Wrench,
    'PACE_CHAMPION': Trophy,
    'PACE_PERFECT_SCORE': Target,
    'PACE_CONSISTENT': Flame,
    'PACE_STARTER': GraduationCap,
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
    { code: 'PACE_FIRST_QUIZ', name: 'First Step', description: 'Complete your first PACE quiz' },
    { code: 'PACE_PREPARE_MASTER', name: 'Prepare Master', description: 'Master the Prepare phase (pass 3 times)' },
    { code: 'PACE_ARRIVE_MASTER', name: 'Arrive Master', description: 'Master the Arrive phase (pass 3 times)' },
    { code: 'PACE_CONNECT_MASTER', name: 'Connect Master', description: 'Master the Connect phase (pass 3 times)' },
    { code: 'PACE_EXECUTE_MASTER', name: 'Execute Master', description: 'Master the Execute phase (pass 3 times)' },
    { code: 'PACE_CHAMPION', name: 'PACE Master', description: 'Master all 4 PACE phases' },
    { code: 'PACE_PERFECT_SCORE', name: 'Perfect Score', description: 'Score 100% on a Full PACE Quiz' },
    { code: 'PACE_CONSISTENT', name: 'Consistent', description: 'Complete quizzes 3 weeks in a row' },
    { code: 'PACE_STARTER', name: 'PACE Starter', description: 'Pass all 4 phase quizzes in one week' },
];

export function TrophyCase({ badges }: TrophyCaseProps) {
    const [selected, setSelected] = useState<typeof ALL_BADGES_DEF[number] | null>(null);
    const earnedCodes = new Set(badges.map(b => b.badge.code));

    const selectedEarned = selected ? earnedCodes.has(selected.code) : false;
    const SelectedIcon = selected ? (ICON_MAP[selected.code] || Star) : Star;

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
                        <button
                            key={def.code}
                            onClick={() => setSelected(def)}
                            className="flex flex-col items-center"
                        >
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
                        </button>
                    );
                })}
            </div>

            {badges.length === 0 && (
                <div className="mt-4 text-center text-xs text-slate-500 italic">
                    Start crushing goals to unlock trophies!
                </div>
            )}

            {/* Badge Detail Popup */}
            {selected && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-background-paper border border-white/10 rounded-2xl p-6 max-w-xs w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end mb-2">
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 mb-4 ${selectedEarned
                                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                    : 'bg-slate-800/50 border-slate-700'
                                }`}>
                                {selectedEarned ? (
                                    <SelectedIcon className="w-10 h-10 text-yellow-400" />
                                ) : (
                                    <Lock className="w-8 h-8 text-slate-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{selected.name}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-3">{selected.description}</p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedEarned
                                    ? 'bg-yellow-400/20 text-yellow-400'
                                    : 'bg-slate-500/20 text-slate-500'
                                }`}>
                                {selectedEarned ? 'Earned' : 'Locked'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
