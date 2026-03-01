'use client';

import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface WeekData {
    weekNumber: number;
    revenue: number;
    jobs: number;
}

interface HistoricalChartProps {
    weeks: WeekData[];
    currentWeek: number;
}

export function HistoricalChart({ weeks, currentWeek }: HistoricalChartProps) {
    if (weeks.length === 0) return null;

    const maxRevenue = Math.max(...weeks.map(w => w.revenue), 1);
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-light" />
                    <h3 className="text-lg font-bold text-white">Revenue History</h3>
                </div>
                <span className="text-xs text-slate-500">Last {weeks.length} weeks</span>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-2 h-40 px-2">
                {weeks.map((week) => {
                    const height = maxRevenue > 0 ? (week.revenue / maxRevenue) * 100 : 0;
                    const isCurrent = week.weekNumber === currentWeek;

                    return (
                        <div key={week.weekNumber} className="flex-1 flex flex-col items-center gap-1">
                            {/* Revenue label */}
                            <span className={`text-[10px] font-mono ${isCurrent ? 'text-primary-light font-bold' : 'text-slate-500'
                                }`}>
                                {formatter.format(week.revenue)}
                            </span>

                            {/* Bar */}
                            <div className="w-full flex justify-center" style={{ height: '120px' }}>
                                <div className="w-full max-w-[40px] flex items-end">
                                    <div
                                        className={`w-full rounded-t-lg transition-all ${isCurrent
                                                ? 'bg-gradient-to-t from-primary to-primary-light shadow-lg shadow-primary/20'
                                                : 'bg-white/10 hover:bg-white/15'
                                            }`}
                                        style={{
                                            height: `${Math.max(height, 4)}%`,
                                            transition: 'height 0.5s ease-out',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Week label */}
                            <div className="text-center">
                                <span className={`text-xs ${isCurrent ? 'text-primary-light font-bold' : 'text-slate-500'
                                    }`}>
                                    Wk {week.weekNumber}
                                </span>
                                {isCurrent && (
                                    <div className="text-[9px] text-primary-light/60">now</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-slate-500">
                <span>
                    Avg: {formatter.format(weeks.reduce((s, w) => s + w.revenue, 0) / weeks.length)}
                </span>
                <span>
                    Best: {formatter.format(Math.max(...weeks.map(w => w.revenue)))}
                </span>
            </div>
        </Card>
    );
}
