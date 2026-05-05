'use client';

import { useState, useTransition, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { submitWeeklyPerformance } from "../../actions";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";
import { CheckCircle2 } from "lucide-react";

export function DataEntryForm({ technicians }: { technicians: any[] }) {
    const [revenue, setRevenue] = useState(0);
    const [reviews, setReviews] = useState(0);
    const [memberships, setMemberships] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

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
        dressCode: true,
    });

    const bonus = calculateTotalBonus(revenue, reviews, memberships, compliance);

    const handleComplianceChange = (key: string) => {
        setCompliance(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                await submitWeeklyPerformance(formData);
                setSubmitStatus('success');
                setSubmitMessage('Weekly report submitted successfully!');
                // Reset form
                setRevenue(0);
                setReviews(0);
                setMemberships(0);
                setCompliance({
                    vanCleanliness: true,
                    paperworkSubmitted: true,
                    estimateFollowups: true,
                    zeroCallbacks: true,
                    noComplaints: true,
                    noBadDriving: true,
                    drugScreening: true,
                    noOshaViolations: true,
                    paceTraining: true,
                    dressCode: true,
                });
                formRef.current?.reset();
                // Auto dismiss after 5s
                setTimeout(() => {
                    setSubmitStatus('idle');
                    setSubmitMessage('');
                }, 5000);
            } catch (err) {
                setSubmitStatus('error');
                setSubmitMessage('Failed to submit. Please check all fields and try again.');
                setTimeout(() => {
                    setSubmitStatus('idle');
                    setSubmitMessage('');
                }, 5000);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Success/Error Toast */}
            {submitStatus !== 'idle' && (
                <div className={`lg:col-span-3 p-4 rounded-xl flex items-center gap-3 ${submitStatus === 'success'
                    ? 'bg-success/10 border border-success/20 text-success'
                    : 'bg-danger/10 border border-danger/20 text-danger'
                    }`}>
                    {submitStatus === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    <span className="text-sm font-medium">{submitMessage}</span>
                </div>
            )}

            {/* LEFT COLUMN: Data Entry Form */}
            <div className="lg:col-span-2 space-y-6">
                <form ref={formRef} action={handleSubmit} className="space-y-6">
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
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Submitting...' : 'Submit Weekly Report'}
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT COLUMN: Live Preview */}
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-primary/30">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Calculated Preview</h3>

                        {/*
                          Compliance deducts from BASE only. SPIFs are paid in
                          full no matter what. So the Total never gets struck
                          through (it's what the tech takes home); the Base row
                          carries the strikethrough when forfeited.
                        */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={bonus.strikeLevel === 'disqualified' ? 'text-slate-500' : 'text-slate-400'}>Base Bonus</span>
                                <span className={`font-mono ${bonus.strikeLevel === 'disqualified' ? 'text-slate-500 line-through decoration-danger' : 'text-white'}`}>
                                    ${bonus.base.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">SPIFs</span>
                                <span className="font-mono text-white">${bonus.spifs.toLocaleString()}</span>
                            </div>

                            <div className="h-px bg-white/10 my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">Total Bonus</span>
                                <span className="font-mono font-bold text-xl text-success">
                                    ${bonus.total.toLocaleString()}
                                </span>
                            </div>

                            {bonus.infractionCount > 0 && bonus.strikeLevel !== 'disqualified' && (
                                <div className="flex justify-between items-center text-warning">
                                    <span className="text-sm">Deductions ({bonus.infractionCount} strike{bonus.infractionCount > 1 ? 's' : ''})</span>
                                    <span className="font-mono">-${bonus.deductions}</span>
                                </div>
                            )}

                            {bonus.strikeLevel === 'disqualified' && (
                                <div className="text-xs text-danger text-center bg-danger/10 p-2 rounded">
                                    🚫 3+ Strikes — Base Bonus Forfeited (SPIFs still paid)
                                </div>
                            )}
                            {bonus.strikeLevel === 'danger' && (
                                <div className="text-xs text-orange-400 text-center bg-orange-400/10 p-2 rounded">
                                    🔶 Strike 2 of 3 — One more and base bonus is forfeited
                                </div>
                            )}
                            {bonus.strikeLevel === 'warning' && (
                                <div className="text-xs text-yellow-400 text-center bg-yellow-400/10 p-2 rounded">
                                    ⚠️ Strike 1 of 3 — $25 deducted from base bonus
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
