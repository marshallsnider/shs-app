import { Card } from "@/components/ui/Card";
import { CheckCircle2, DollarSign, TrendingUp, AlertCircle, Check } from "lucide-react";

interface LastWeekRecapProps {
    revenue: number;
    jobs: number;
    bonus: number;
    isCompliant: boolean;
    format: (val: number) => string;
}

export function LastWeekRecap({ revenue, jobs, bonus, isCompliant, format }: LastWeekRecapProps) {
    return (
        <Card glass className="relative overflow-hidden mb-8">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24 text-white" />
            </div>

            <h2 className="text-lg font-bold text-white mb-4 relative z-10">Last Week's Results</h2>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                {/* Revenue */}
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Revenue
                    </div>
                    <div className="text-xl font-bold text-white">{format(revenue)}</div>
                </div>

                {/* Bonus Earned */}
                <div className={`p-3 rounded-xl border border-white/5 ${bonus > 0 ? 'bg-success/10 border-success/20' : 'bg-slate-800/50'}`}>
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Bonus Earned
                    </div>
                    <div className={`text-xl font-bold ${bonus > 0 ? 'text-success' : 'text-slate-400'}`}>
                        {format(bonus)}
                    </div>
                </div>

                {/* Jobs */}
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Jobs
                    </div>
                    <div className="text-xl font-bold text-white">{jobs}</div>
                </div>

                {/* Compliance */}
                <div className={`p-3 rounded-xl border border-white/5 ${isCompliant ? 'bg-success/10 border-success/20' : 'bg-error/10 border-error/20'}`}>
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        {isCompliant ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />} Compliance
                    </div>
                    <div className={`text-xl font-bold ${isCompliant ? 'text-success' : 'text-error'}`}>
                        {isCompliant ? "Passed" : "Failed"}
                    </div>
                </div>
            </div>
        </Card>
    );
}
