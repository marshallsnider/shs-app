'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileBarChart, Printer } from 'lucide-react';

function getISOWeek(d: Date): { year: number; week: number } {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: date.getUTCFullYear(), week };
}

interface WeekOption {
    year: number;
    weekNumber: number;
}

export default function ReportsPage() {
    const now = new Date();
    const current = getISOWeek(now);

    const [year, setYear] = useState(current.year);
    const [week, setWeek] = useState(current.week);
    const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch available weeks from API
    useEffect(() => {
        fetch('/api/reports/weeks')
            .then(res => res.json())
            .then((data: WeekOption[]) => {
                setAvailableWeeks(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const currentIndex = availableWeeks.findIndex(
        w => w.year === year && w.weekNumber === week
    );

    const canGoPrev = currentIndex < availableWeeks.length - 1;
    const canGoNext = currentIndex > 0;

    function goPrev() {
        if (canGoPrev) {
            const prev = availableWeeks[currentIndex + 1];
            setYear(prev.year);
            setWeek(prev.weekNumber);
        }
    }

    function goNext() {
        if (canGoNext) {
            const next = availableWeeks[currentIndex - 1];
            setYear(next.year);
            setWeek(next.weekNumber);
        }
    }

    const reportUrl = `/api/reports?year=${year}&week=${week}`;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FileBarChart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Weekly Reports</h2>
                        <p className="text-sm text-slate-400">Select any week to view that report</p>
                    </div>
                </div>

                <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Open for Print
                </a>
            </div>

            {/* Week Selector */}
            <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-background-paper border border-white/5">
                <button
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <select
                        value={year}
                        onChange={e => {
                            const newYear = Number(e.target.value);
                            setYear(newYear);
                            // Pick the latest week available for that year
                            const match = availableWeeks.find(w => w.year === newYear);
                            if (match) setWeek(match.weekNumber);
                        }}
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                        {[...new Set(availableWeeks.map(w => w.year))].map(y => (
                            <option key={y} value={y} className="bg-background-paper text-white">
                                {y}
                            </option>
                        ))}
                        {availableWeeks.length === 0 && (
                            <option value={current.year} className="bg-background-paper text-white">
                                {current.year}
                            </option>
                        )}
                    </select>

                    <span className="text-slate-500">—</span>

                    <select
                        value={week}
                        onChange={e => setWeek(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                    >
                        {availableWeeks
                            .filter(w => w.year === year)
                            .map(w => (
                                <option key={w.weekNumber} value={w.weekNumber} className="bg-background-paper text-white">
                                    Week {w.weekNumber}
                                </option>
                            ))}
                        {availableWeeks.filter(w => w.year === year).length === 0 && (
                            <option value={current.week} className="bg-background-paper text-white">
                                Week {current.week}
                            </option>
                        )}
                    </select>
                </div>

                <button
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {currentIndex === 0 && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        Current
                    </span>
                )}
            </div>

            {/* Report iframe */}
            <div className="flex-1 rounded-xl overflow-hidden border border-white/5 min-h-[600px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full bg-background-paper">
                        <div className="text-slate-400 animate-pulse">Loading reports…</div>
                    </div>
                ) : (
                    <iframe
                        key={`${year}-${week}`}
                        src={reportUrl}
                        className="w-full h-full min-h-[600px] border-0"
                        title={`SHS Report — Week ${week}, ${year}`}
                    />
                )}
            </div>
        </div>
    );
}
