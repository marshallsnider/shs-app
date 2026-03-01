import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card";
import { ComplianceRecord, COMPLIANCE_LABELS, COMPLIANCE_REQUIREMENTS } from "@/lib/engine";

interface CompliancePanelProps {
    compliance: ComplianceRecord;
    isEligible: boolean;
    infractionCount: number;
    strikeLevel: 'clean' | 'warning' | 'danger' | 'disqualified';
}

export function CompliancePanel({ compliance, isEligible, infractionCount, strikeLevel }: CompliancePanelProps) {
    const statusConfig = {
        clean: { label: 'ALL CLEAR', style: 'bg-success/20 text-success' },
        warning: { label: 'STRIKE 1', style: 'bg-yellow-500/20 text-yellow-400' },
        danger: { label: 'STRIKE 2', style: 'bg-orange-500/20 text-orange-400' },
        disqualified: { label: 'DISQUALIFIED', style: 'bg-danger/20 text-danger' },
    };

    const status = statusConfig[strikeLevel];

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Compliance Status</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.style}`}>
                    {status.label}
                </div>
            </div>

            <div className="space-y-3">
                {COMPLIANCE_REQUIREMENTS.map((key) => {
                    const label = COMPLIANCE_LABELS[key];
                    const pass = compliance[key] === true;
                    return (
                        <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <span className="text-sm font-medium text-slate-300">{label}</span>
                            {pass ? (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                                <XCircle className="w-5 h-5 text-danger" />
                            )}
                        </div>
                    );
                })}
            </div>

            {infractionCount > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                    <p className="text-xs text-danger/80 leading-relaxed">
                        {infractionCount >= 3
                            ? 'Three strikes reached — bonus forfeited for this week. Infractions reset Monday morning.'
                            : `${infractionCount} compliance infraction${infractionCount > 1 ? 's' : ''}. ${3 - infractionCount} more strike${3 - infractionCount > 1 ? 's' : ''} before full disqualification.`
                        }
                    </p>
                </div>
            )}
        </Card>
    );
}
