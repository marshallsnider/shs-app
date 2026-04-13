'use client';

import { AlertTriangle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ComplianceRecord, COMPLIANCE_LABELS, COMPLIANCE_REQUIREMENTS } from '@/lib/engine';

interface ComplianceAlertProps {
    compliance: ComplianceRecord;
    infractionCount: number;
    deductions: number;
    strikeLevel: 'clean' | 'warning' | 'danger' | 'disqualified';
    hasData?: boolean;
}

// All Tailwind classes must be full static strings for JIT to detect them
const STRIKE_CONFIG = {
    clean: {
        show: false, icon: ShieldCheck, title: '', subtitle: '',
        bg: '', border: '',
        iconWrap: '', iconColor: '', titleColor: '', subtitleColor: '',
        deductionBg: '', deductionBorder: '', deductionText: '',
        itemBg: '', itemBorder: '', itemIcon: '', itemText: '', ctaColor: '',
    },
    warning: {
        show: true, icon: AlertTriangle,
        title: '⚠️ Strike 1 of 3 — $25 Deduction',
        subtitle: 'One more strike will increase your deduction to $75',
        bg: 'bg-yellow-500/10', border: 'border-yellow-500/30',
        iconWrap: 'bg-yellow-500/20', iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-400', subtitleColor: 'text-yellow-400/70',
        deductionBg: 'bg-yellow-500/10', deductionBorder: 'border-yellow-500/20',
        deductionText: 'text-yellow-300',
        itemBg: 'bg-yellow-500/5', itemBorder: 'border-yellow-500/10',
        itemIcon: 'text-yellow-400', itemText: 'text-yellow-300',
        ctaColor: 'text-yellow-400/60',
    },
    danger: {
        show: true, icon: ShieldAlert,
        title: '🔶 Strike 2 of 3 — $75 Deduction',
        subtitle: 'One more strike = full bonus disqualification!',
        bg: 'bg-orange-500/10', border: 'border-orange-500/30',
        iconWrap: 'bg-orange-500/20', iconColor: 'text-orange-400',
        titleColor: 'text-orange-400', subtitleColor: 'text-orange-400/70',
        deductionBg: 'bg-orange-500/10', deductionBorder: 'border-orange-500/20',
        deductionText: 'text-orange-300',
        itemBg: 'bg-orange-500/5', itemBorder: 'border-orange-500/10',
        itemIcon: 'text-orange-400', itemText: 'text-orange-300',
        ctaColor: 'text-orange-400/60',
    },
    disqualified: {
        show: true, icon: XCircle,
        title: '🚫 3+ Strikes — Bonus Disqualified',
        subtitle: 'You have lost your bonus for this week',
        bg: 'bg-red-500/10', border: 'border-red-500/30',
        iconWrap: 'bg-red-500/20', iconColor: 'text-red-400',
        titleColor: 'text-red-400', subtitleColor: 'text-red-400/70',
        deductionBg: 'bg-red-500/10', deductionBorder: 'border-red-500/20',
        deductionText: 'text-red-300',
        itemBg: 'bg-red-500/5', itemBorder: 'border-red-500/10',
        itemIcon: 'text-red-400', itemText: 'text-red-300',
        ctaColor: 'text-red-400/60',
    },
};

export function ComplianceAlert({ compliance, infractionCount, deductions, strikeLevel, hasData = true }: ComplianceAlertProps) {
    // Don't show strike alerts when no compliance data has been entered yet
    if (!hasData) return null;

    const config = STRIKE_CONFIG[strikeLevel];
    if (!config.show) return null;

    const failingItems = COMPLIANCE_REQUIREMENTS
        .filter(req => compliance[req] !== true)
        .map(key => COMPLIANCE_LABELS[key]);

    const Icon = config.icon;

    return (
        <div className="mb-6 relative z-10">
            <div className={`${config.bg} border ${config.border} rounded-2xl p-4 backdrop-blur-sm`}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={`${config.iconWrap} p-2 rounded-full`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                    <div>
                        <h3 className={`${config.titleColor} font-bold text-sm`}>
                            {config.title}
                        </h3>
                        <p className={`${config.subtitleColor} text-xs`}>
                            {config.subtitle}
                        </p>
                    </div>
                </div>

                {/* Deduction Amount */}
                {deductions > 0 && strikeLevel !== 'disqualified' && (
                    <div className={`text-center mb-3 py-2 rounded-lg ${config.deductionBg} border ${config.deductionBorder}`}>
                        <span className={`${config.deductionText} text-sm font-bold`}>
                            -${deductions} deducted from bonus
                        </span>
                    </div>
                )}

                {/* Strike Indicators */}
                <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3].map(strike => (
                        <div
                            key={strike}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${strike <= infractionCount
                                ? strike === 3
                                    ? 'bg-red-500/30 border-red-500 text-red-300'
                                    : strike === 2
                                        ? 'bg-orange-500/30 border-orange-500 text-orange-300'
                                        : 'bg-yellow-500/30 border-yellow-500 text-yellow-300'
                                : 'bg-white/5 border-white/10 text-slate-600'
                                }`}
                        >
                            {strike <= infractionCount ? '✕' : strike}
                        </div>
                    ))}
                </div>

                {/* Failing Items */}
                <div className="space-y-2">
                    {failingItems.map((item) => (
                        <div
                            key={item}
                            className={`flex items-center gap-2 ${config.itemBg} rounded-lg px-3 py-2 border ${config.itemBorder}`}
                        >
                            <XCircle className={`w-4 h-4 ${config.itemIcon} flex-shrink-0`} />
                            <span className={`${config.itemText} text-sm`}>{item}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <p className={`mt-3 text-center text-xs ${config.ctaColor}`}>
                    {strikeLevel === 'disqualified'
                        ? 'Infractions reset Monday morning'
                        : 'Talk to your supervisor to resolve these issues'}
                </p>
            </div>
        </div>
    );
}
