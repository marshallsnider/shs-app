import { Card } from "../ui/Card";
import { BonusResult } from "@/lib/engine";

interface BonusCalculatorProps {
    bonus: BonusResult;
    potential: number; // Next potential milestone/max
    revenue?: number;  // Current revenue for next-tier calc
}

function getNextTierMessage(revenue: number): string | null {
    if (revenue < 7000) return `$${(7000 - revenue).toLocaleString()} to unlock your first bonus!`;
    if (revenue < 9500) return `$${(9500 - revenue).toLocaleString()} to reach the $100/block tier!`;
    if (revenue < 13001) return `$${(13001 - revenue).toLocaleString()} to unlock Elite 2% bonus!`;
    return null; // Already at max tier
}

export function BonusCalculator({ bonus, potential, revenue = 0 }: BonusCalculatorProps) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const nextTier = getNextTierMessage(revenue);

    // Compliance only ever zeros the BASE bonus. SPIFs are always paid in
    // full, so the headline total is what the tech actually takes home —
    // never struck through, never dimmed. Per-row, the Base row carries
    // the strikethrough/dimming when forfeited so the visual signal stays.
    return (
        <Card className="bg-gradient-to-br from-primary-dark to-slate-900 border-primary/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Current Bonus</h3>
                <span className={`text-2xl font-bold ${bonus.eligible ? 'text-success text-glow' : 'text-success'}`}>
                    {formatter.format(bonus.total)}
                </span>
            </div>

            <div className="space-y-2 text-sm text-slate-400 border-t border-white/5 pt-3 mb-3">
                <div className="flex justify-between">
                    <span className={!bonus.eligible ? 'text-slate-500' : ''}>Base Performance</span>
                    <span className={!bonus.eligible ? 'text-slate-500 line-through decoration-danger' : 'text-slate-200'}>
                        {formatter.format(bonus.base)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>SPIFs (Rev + Mem)</span>
                    <span className="text-slate-200">{formatter.format(bonus.spifs)}</span>
                </div>
            </div>

            {!bonus.eligible && (
                <div className="text-xs text-danger font-medium text-center bg-danger/10 py-2 rounded">
                    Bonus Forfeited — SPIFs Still Paid
                </div>
            )}

            {bonus.eligible && nextTier && (
                <div className="mt-2 text-xs text-center text-primary-light">
                    Keep pushing! {nextTier}
                </div>
            )}

            {bonus.eligible && !nextTier && revenue >= 13001 && (
                <div className="mt-2 text-xs text-center text-success">
                    🏆 Elite tier active — earning 2% of total revenue!
                </div>
            )}
        </Card>
    );
}
