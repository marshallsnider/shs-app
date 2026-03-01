'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface WeekOption {
    year: number;
    weekNumber: number;
}

export function WeekPicker({ currentYear, currentWeek }: { currentYear: number; currentWeek: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [open, setOpen] = useState(false);
    const [weeks, setWeeks] = useState<WeekOption[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    const activeYear = Number(searchParams.get('year')) || currentYear;
    const activeWeek = Number(searchParams.get('week')) || currentWeek;

    const isCurrentWeek = activeYear === currentYear && activeWeek === currentWeek;

    useEffect(() => {
        fetch('/api/reports/weeks')
            .then(r => r.json())
            .then((data: WeekOption[]) => setWeeks(data))
            .catch(() => { });
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function selectWeek(w: WeekOption) {
        setOpen(false);
        if (w.year === currentYear && w.weekNumber === currentWeek) {
            router.push('/admin');
        } else {
            router.push(`/admin?year=${w.year}&week=${w.weekNumber}`);
        }
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
                Week {activeWeek}, {activeYear}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && weeks.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-background-paper border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {weeks.map(w => {
                            const isActive = w.year === activeYear && w.weekNumber === activeWeek;
                            return (
                                <button
                                    key={`${w.year}-${w.weekNumber}`}
                                    onClick={() => selectWeek(w)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${isActive
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span>Week {w.weekNumber}, {w.year}</span>
                                    {w.year === currentYear && w.weekNumber === currentWeek && (
                                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                            Current
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
