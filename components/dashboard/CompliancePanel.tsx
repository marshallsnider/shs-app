import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card";
import { ComplianceRecord } from "@/lib/engine"; // Assuming type is exported

interface CompliancePanelProps {
    compliance: ComplianceRecord;
    isEligible: boolean;
}

const LABELS: Record<keyof ComplianceRecord, string> = {
    vanCleanliness: "Van Cleanliness",
    paperworkSubmitted: "Paperwork Submitted",
    estimateFollowups: "Estimate Follow-ups",
    zeroCallbacks: "Zero Callbacks",
    noComplaints: "No Complaints",
    noBadDriving: "No Bad Driving",
    drugScreening: "Drug Screening",
    noOshaViolations: "No OSHA Violations",
    paceTraining: "80% PACE Training"
};

export function CompliancePanel({ compliance, isEligible }: CompliancePanelProps) {
    const items = Object.entries(LABELS) as [keyof ComplianceRecord, string][];

    return (
        <Card className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Compliance Status</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isEligible ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                </div>
            </div>

            <div className="space-y-3">
                {items.map(([key, label]) => {
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

            {!isEligible && (
                <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
                    <p className="text-xs text-danger/80 leading-relaxed">
                        You are currently ineligible for bonuses. All 9 compliance items must be passed to unlock your earnings.
                    </p>
                </div>
            )}
        </Card>
    );
}
