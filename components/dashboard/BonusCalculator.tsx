import { Card } from "../ui/Card";
import { BonusResult } from "@/lib/engine";

interface BonusCalculatorProps {
    bonus: BonusResult;
    potential: number; // Next potential milestone/max
}

export function BonusCalculator({ bonus, potential }: BonusCalculatorProps) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    return (
        <Card className="bg-gradient-to-br from-primary-dark to-slate-900 border-primary/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Current Bonus</h3>
                {bonus.eligible ? (
                    <span className="text-2xl font-bold text-success text-glow">
                        {formatter.format(bonus.total)}
                    </span>
                ) : (
                    <span className="text-2xl font-bold text-slate-500 line-through decoration-danger decoration-2">
                        {formatter.format(bonus.total)}
                    </span>
                )}
            </div>

            <div className="space-y-2 text-sm text-slate-400 border-t border-white/5 pt-3 mb-3">
                <div className="flex justify-between">
                    <span>Base Performance</span>
                    <span className="text-slate-200">{formatter.format(bonus.base)}</span>
                </div>
                <div className="flex justify-between">
                    <span>SPIFs (Rev + Mem)</span>
                    <span className="text-slate-200">{formatter.format(bonus.spifs)}</span>
                </div>
            </div>

            {!bonus.eligible && (
                <div className="text-xs text-danger font-medium text-center bg-danger/10 py-2 rounded">
                    Compliance Failed - Forfeit
                </div>
            )}

            {bonus.eligible && bonus.total > 0 && (
                <div className="mt-2 text-xs text-center text-primary-light">
                    Keep pushing! Next tier unlocks at ...
                </div>
            )}
        </Card>
    );
}
