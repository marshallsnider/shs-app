'use client';

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { GoalProgress } from "./GoalProgress";
import { Pencil, Check } from "lucide-react";
import { updateWeeklyGoal } from "@/app/actions";

interface GoalsWidgetProps {
    technicianId: string;
    year: number;
    weekNumber: number;
    currentRevenue: number;
    currentGoal: number;
}

export function GoalsWidget({
    technicianId, year, weekNumber, currentRevenue, currentGoal
}: GoalsWidgetProps) {
    const format = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val);

    const [isEditing, setIsEditing] = useState(false);
    const [newGoal, setNewGoal] = useState(currentGoal);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        // Enforce minimum field value of 6500
        const finalGoal = Math.max(newGoal, 6500);

        setIsSaving(true);
        try {
            await updateWeeklyGoal(technicianId, year, weekNumber, finalGoal);
            setNewGoal(finalGoal); // Update local state to match clamped value
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to update goal", e);
            alert("Failed to update goal. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card glass className="relative">
            {isEditing ? (
                <div className="mb-6 bg-slate-800/50 p-4 rounded-xl border border-white/5 relative">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                    </button>

                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Set Weekly Goal (Min $6,500)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">$</span>
                        <input
                            type="number"
                            min={6500}
                            value={newGoal}
                            onChange={(e) => setNewGoal(Number(e.target.value))}
                            className="bg-transparent border-b border-white/20 text-white font-bold text-lg w-full focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            ) : (
                <GoalProgress
                    label={
                        <div className="flex items-center gap-2 text-slate-400">
                            Revenue Goal ({format(currentGoal)})
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>
                    }
                    current={currentRevenue}
                    target={currentGoal}
                    format={format}
                />
            )}

            <div className={`mt-4 ${isEditing ? 'opacity-50 pointer-events-none' : ''}`}>
                <GoalProgress
                    label="Bonus Threshold ($7k)"
                    current={currentRevenue}
                    target={7000}
                    format={format}
                />
            </div>
        </Card>
    );
}
