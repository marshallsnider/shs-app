import { Card } from "../ui/Card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    color?: string; // Text color class for the value
}

export function MetricCard({ label, value, subValue, icon: Icon, color = "text-white" }: MetricCardProps) {
    return (
        <Card className="flex flex-col items-start justify-between min-h-[110px]">
            <div className="flex w-full items-start justify-between">
                <div className="p-2 rounded-lg bg-white/5 mx-[-4px] my-[-4px]">
                    <Icon className="w-5 h-5 text-slate-300" />
                </div>
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
                    {subValue && (
                        <span className="text-xs font-medium text-slate-500">{subValue}</span>
                    )}
                </div>
            </div>
        </Card>
    );
}
