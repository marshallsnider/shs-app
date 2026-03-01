'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface MilestoneToastProps {
    revenue: number;
    techName: string;
    year: number;
    weekNumber: number;
}

const MILESTONES = [
    { threshold: 13000, emoji: '🏆', title: 'LEGENDARY!', message: 'Change Makers Elite — 2% bonus unlocked!' },
    { threshold: 10000, emoji: '🔥', title: 'ON FIRE!', message: 'You\'ve crushed $10K this week!' },
    { threshold: 7000, emoji: '🎉', title: 'BONUS UNLOCKED!', message: 'You\'ve hit the $7K bonus threshold!' },
];

export function MilestoneToast({ revenue, techName, year, weekNumber }: MilestoneToastProps) {
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [visible, setVisible] = useState(true);

    const storageKey = `shs_dismissed_milestones_${year}_${weekNumber}`;

    // Find the highest milestone achieved
    const milestone = MILESTONES.find(m => revenue >= m.threshold && !dismissed.includes(m.title));

    useEffect(() => {
        // Clean up old week keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('shs_dismissed_milestones_') && key !== storageKey) {
                localStorage.removeItem(key);
            }
        }

        // Check localStorage for already-dismissed milestones this week
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                setDismissed(JSON.parse(stored));
            } catch { /* ignore */ }
        }
    }, [storageKey]);

    if (!milestone || !visible) return null;

    const handleDismiss = () => {
        const newDismissed = [...dismissed, milestone.title];
        setDismissed(newDismissed);
        localStorage.setItem(storageKey, JSON.stringify(newDismissed));
        setVisible(false);
    };

    return (
        <div className="fixed top-4 left-4 right-4 z-[100] max-w-md mx-auto animate-slide-down">
            <div className="bg-gradient-to-r from-primary/90 to-primary-light/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-primary/30 border border-white/20">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">{milestone.emoji}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <h4 className="font-bold text-white text-sm">{milestone.title}</h4>
                        </div>
                        <p className="text-white/80 text-xs mt-1">{milestone.message}</p>
                        <p className="text-white/60 text-[10px] mt-1">Keep it up, {techName}! 💪</p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-white/50 hover:text-white p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
