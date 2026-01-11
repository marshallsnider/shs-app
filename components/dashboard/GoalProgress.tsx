import { ReactNode } from "react";

interface GoalProgressProps {
    label: ReactNode;
    current: number;
    target: number;
    format?: (val: number) => string;
}

export function GoalProgress({ label, current, target, format = (v) => v.toString() }: GoalProgressProps) {
    const percent = Math.min(100, Math.max(0, (current / target) * 100));

    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-400">{label}</span>
                <span className="text-sm font-bold text-white">
                    {format(current)} <span className="text-slate-500 text-xs font-normal">/ {format(target)}</span>
                </span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-light transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
