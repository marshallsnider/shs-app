/**
 * Safety Home Services - Bonus Calculation Engine
 * 
 * Rules:
 * - Base Bonus:
 *   - $0 - $6,999: $0
 *   - $7,000 - $9,000: $75 per $500 block (Max 5 blocks = $375)
 *   - $9,500 - $13,000: $100 per $500 block (Max 8 blocks = $800, added to previous tier)
 *   - $13,001+: $1,000 + 2% of TOTAL revenue.
 * 
 * - SPIFs:
 *   - $25 per 5-star Review
 *   - $25 per Club Membership
 * 
 * - Three Strikes Compliance System (deductions hit BASE bonus only —
 *   SPIFs are always paid in full regardless of compliance status):
 *   - 0 infractions: Full bonus + SPIFs
 *   - 1st infraction: -$25 deduction from base, SPIFs unaffected
 *   - 2nd infraction: -$50 additional (total -$75 from base), SPIFs unaffected
 *   - 3rd+ infraction: Base bonus disqualified ($0), SPIFs still paid
 *   - Infraction count resets every Monday morning
 * 
 * - 10 Compliance Items:
 *   Van Cleanliness, Paperwork, Estimate Follow-ups, Zero Callbacks,
 *   No Complaints, No Bad Driving, Drug Screening, No OSHA Violations,
 *   PACE Training, Dress Code
 */

export type ComplianceRecord = {
    vanCleanliness: boolean;
    paperworkSubmitted: boolean;
    estimateFollowups: boolean;
    zeroCallbacks: boolean;
    noComplaints: boolean;
    noBadDriving: boolean;
    drugScreening: boolean;
    noOshaViolations: boolean;
    paceTraining: boolean;
    dressCode: boolean;
    [key: string]: boolean | string | undefined | null;
};

export const COMPLIANCE_REQUIREMENTS = [
    'vanCleanliness',
    'paperworkSubmitted',
    'estimateFollowups',
    'zeroCallbacks',
    'noComplaints',
    'noBadDriving',
    'drugScreening',
    'noOshaViolations',
    'paceTraining',
    'dressCode',
] as const;

export const COMPLIANCE_LABELS: Record<string, string> = {
    vanCleanliness: 'Van Cleanliness',
    paperworkSubmitted: 'Paperwork Submitted',
    estimateFollowups: 'Estimate Follow-ups',
    zeroCallbacks: 'Zero Callbacks',
    noComplaints: 'No Complaints',
    noBadDriving: 'No Bad Driving Reports',
    drugScreening: 'Drug Screening',
    noOshaViolations: 'No OSHA Violations',
    paceTraining: 'PACE Training',
    dressCode: 'Dress Code',
};

export function calculateBaseBonus(weeklyRevenue: number): number {
    const revenue = Number(weeklyRevenue);
    if (isNaN(revenue) || revenue < 0) return 0;

    if (revenue < 7000) return 0;

    if (revenue <= 13000) {
        if (revenue <= 9000) {
            const blocks = Math.floor((revenue - 7000) / 500) + 1;
            return blocks * 75;
        }
        const lowTierBonus = 5 * 75; // $375 (5 blocks: $7k, $7.5k, $8k, $8.5k, $9k)
        const highBlocks = Math.floor((revenue - 9000) / 500);
        const bonus = lowTierBonus + (highBlocks * 100);
        return Math.min(bonus, 1000);
    }

    // $13,001+: $1000 + 2% of TOTAL
    return 1000 + (revenue * 0.02);
}

export function calculateSPIFs(reviews: number, memberships: number): number {
    return (reviews * 25) + (memberships * 25);
}

/**
 * Count the number of compliance infractions (failing items).
 */
export function countInfractions(compliance: ComplianceRecord): number {
    return COMPLIANCE_REQUIREMENTS.filter(req => compliance[req] !== true).length;
}

/**
 * Get the deduction amount based on infraction count.
 * - 0 infractions: $0
 * - 1 infraction: $25
 * - 2 infractions: $75 ($25 + $50)
 * - 3+: Full disqualification (handled separately)
 */
export function getDeductionAmount(infractionCount: number): number {
    if (infractionCount === 0) return 0;
    if (infractionCount === 1) return 25;
    if (infractionCount === 2) return 75; // $25 + $50
    return -1; // Sentinel: full disqualification
}

export type BonusResult = {
    base: number;
    spifs: number;
    total: number;
    eligible: boolean;
    infractionCount: number;
    deductions: number;
    strikeLevel: 'clean' | 'warning' | 'danger' | 'disqualified';
};

export function calculateTotalBonus(
    weeklyRevenue: number,
    reviews: number,
    memberships: number,
    compliance: ComplianceRecord | boolean
): BonusResult {
    const base = calculateBaseBonus(weeklyRevenue);
    const spifs = calculateSPIFs(reviews, memberships);

    // POLICY: compliance deductions hit the BASE bonus only. SPIFs (review
    // and membership payouts) are always paid regardless of compliance —
    // they're a reward for an outcome the customer drove, not for tech
    // behavior we're penalising.

    // If compliance is a simple boolean (legacy), use binary logic
    if (typeof compliance === 'boolean') {
        const adjustedBase = compliance ? base : 0;
        return {
            base: adjustedBase, spifs,
            total: adjustedBase + spifs,
            eligible: compliance,
            infractionCount: compliance ? 0 : 10,
            deductions: compliance ? 0 : base,
            strikeLevel: compliance ? 'clean' : 'disqualified',
        };
    }

    // Three Strikes System
    const infractions = countInfractions(compliance);

    if (infractions === 0) {
        return {
            base, spifs, total: base + spifs, eligible: true,
            infractionCount: 0, deductions: 0, strikeLevel: 'clean',
        };
    }

    if (infractions === 1) {
        const deduction = 25;
        const adjustedBase = Math.max(0, base - deduction);
        return {
            base: adjustedBase, spifs, total: adjustedBase + spifs, eligible: true,
            infractionCount: 1, deductions: deduction, strikeLevel: 'warning',
        };
    }

    if (infractions === 2) {
        const deduction = 75; // $25 + $50
        const adjustedBase = Math.max(0, base - deduction);
        return {
            base: adjustedBase, spifs, total: adjustedBase + spifs, eligible: true,
            infractionCount: 2, deductions: deduction, strikeLevel: 'danger',
        };
    }

    // 3+ infractions: base bonus disqualified, SPIFs still paid in full
    return {
        base: 0, spifs, total: spifs, eligible: false,
        infractionCount: infractions, deductions: base, strikeLevel: 'disqualified',
    };
}

/**
 * @deprecated Use countInfractions instead. Kept for backward compatibility.
 */
export function isFullyCompliant(compliance: ComplianceRecord): boolean {
    return countInfractions(compliance) === 0;
}
