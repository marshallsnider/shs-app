'use client';

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { submitWeeklyPerformance } from "../../actions";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";

export function DataEntryForm({ technicians }: { technicians: any[] }) {
    const [revenue, setRevenue] = useState(0);
    const [reviews, setReviews] = useState(0);
    const [memberships, setMemberships] = useState(0);

    // Internal state for bonus preview
    const [compliance, setCompliance] = useState<ComplianceRecord>({
        vanCleanliness: true,
        paperworkSubmitted: true,
        estimateFollowups: true,
        zeroCallbacks: true,
        noComplaints: true,
        noBadDriving: true,
        drugScreening: true,
        noOshaViolations: true,
        paceTraining: true,
    });

    const bonus = calculateTotalBonus(revenue, reviews, memberships, compliance);

    const handleComplianceChange = (key: string) => {
        setCompliance(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Data Entry Form */}
            <div className="lg:col-span-2 space-y-6">
                <form action={submitWeeklyPerformance} className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">1. Select Technician & Week</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Technician</label>
                                <select name="technicianId" className="w-full bg-slate-800 border-none rounded-lg p-2 text-white" required>
                                    <option value="">Select Tech...</option>
                                    {technicians.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Week</label>
                                <input type="week" name="week" className="w-full bg-slate-800 border-none rounded-lg p-2 text-white" required />
                            </div>
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">2. Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Total Revenue ($)</label>
                                <input
                                    type="number"
                                    name="revenue"
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-white font-bold"
                                    value={revenue}
                                    onChange={(e) => setRevenue(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Jobs Completed</label>
                                <input type="number" name="jobs" className="w-full bg-slate-800 border-none rounded-lg p-2 text-white" defaultValue={0} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">5-Star Reviews</label>
                                <input
                                    type="number"
                                    name="reviews"
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-white"
                                    value={reviews}
                                    onChange={(e) => setReviews(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Memberships Sold</label>
                                <input
                                    type="number"
                                    name="memberships"
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-white"
                                    value={memberships}
                                    onChange={(e) => setMemberships(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">3. Compliance Checklist</h3>
                        <div className="space-y-3">
                            {Object.keys(compliance).map((key) => {
                                // Format key to label camelCase -> Title Case
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                    <label key={key} className="flex items-center justify-between p-2 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <span className="text-sm text-slate-300">{label}</span>
                                        <input
                                            type="checkbox"
                                            name={key}
                                            className="w-5 h-5 accent-success rounded"
                                            checked={!!compliance[key]}
                                            onChange={() => handleComplianceChange(key)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all">
                            Submit Weekly Report
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT COLUMN: Live Preview */}
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/30">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Calculated Preview</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Base Bonus</span>
                                <span className="font-mono text-white">${bonus.base.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">SPIFs</span>
                                <span className="font-mono text-white">${bonus.spifs.toLocaleString()}</span>
                            </div>

                            <div className="h-px bg-white/10 my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">Total Bonus</span>
                                <span className={`font-mono font-bold text-xl ${bonus.eligible ? 'text-success' : 'text-danger line-through'}`}>
                                    ${bonus.total.toLocaleString()}
                                </span>
                            </div>

                            {!bonus.eligible && (
                                <div className="text-xs text-danger text-center bg-danger/10 p-2 rounded">
                                    Ineligible due to compliance failure
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
