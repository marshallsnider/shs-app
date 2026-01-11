/**
 * Safety Home Services - Bonus Calculation Engine
 * 
 * Rules:
 * - Base Bonus:
 *   - $0 - $6,999: $0
 *   - $7,000 - $9,000: $75 per $500 block (Max 5 blocks = $375)
 *   - $9,500 - $13,000: $100 per $500 block (Max 8 blocks = $800, added to previous tier)
 *     - Note: This tier starts accumulating AFTER the first tier maxes out? 
 *     - Prompt says: "First tier: blocks from $7000-$9000 at $75 each... Second tier: blocks from $9500+ at $100 each"
 *     - Cap at $1000 total.
 *   - $13,001+: $1,000 + 2% of TOTAL revenue.
 * 
 * - SPIFs:
 *   - $25 per 5-star Review
 *   - $25 per Club Membership
 * 
 * - Compliance:
 *   - Must be fully compliant (all 9 items) to receive ANY bonus.
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
    [key: string]: boolean | string | undefined | null; // Index signature for easier checking
};

export function calculateBaseBonus(weeklyRevenue: number): number {
    // Ensure we are working with a number
    const revenue = Number(weeklyRevenue);
    if (isNaN(revenue) || revenue < 0) return 0;

    // Tier 0: Below $7,000
    if (revenue < 7000) {
        return 0;
    }

    // Tier 1 & 2: Up to $13,000
    if (revenue <= 13000) {
        // Tier 1: $7,000 - $9,000 ($75 per $500)
        // Calculate blocks in the $7,000 - $9,000 range
        // Logic: Each full $500 block inside the range $7000..$9000 counts.
        // Example: $7000 is 0 blocks? No, "starting at $7000"? 
        // Prompt Table: $7,000 - $9,000 | $75.
        // Prompt Logic: `Math.floor((weeklyRevenue - 7000) / 500) + 1` ???
        // Let's re-read carefully: "Max 5 blocks = $375".
        // 5 * 75 = 375.
        // Blocks: 7000, 7500, 8000, 8500, 9000? That's 5 points.
        // IF revenue is 7000: floor(0/500)+1 = 1 block ($75).
        // IF revenue is 6999: returns 0.
        // IF revenue is 9000: floor(2000/500)+1 = 5 blocks ($375).
        // IF revenue is 9499: 
        // Wait, prompt pseudocode says:
        // if (weeklyRevenue <= 9000) { return blocks * 75; }
        // if (weeklyRevenue <= 13000) { ... }

        // Let's implement EXACT pseudocode logic first, then refine if needed.

        if (revenue <= 9000) {
            const blocks = Math.floor((revenue - 7000) / 500) + 1;
            // Safety: if revenue < 7000, we already returned 0 above.
            // E.g. 7000 -> 1 * 75
            // 7499 -> 1 * 75
            // 7500 -> 2 * 75
            // 9000 -> 5 * 75 = 375
            return blocks * 75;
        }

        // Tier 2: $9,500 - $13,000
        // "Second tier: blocks from $9500+ at $100 each"
        // "First tier: blocks from $7000-$9000 at $75 each" -> This is flat $300 in prompt?
        // Wait, prompt pseudocode says: "const lowTierBonus = 4 * 75; // 4 blocks = $300"
        // BUT earlier table says "Max 5 blocks = $375".
        // Let's check calculation example:
        // $12,000 -> $800.
        // Pseudocode: 4 * 75 = 300. (Why 4? 7000-9000 range is 2000. 2000/500 = 4 blocks? 7000, 7500, 8000, 8500. 9000 starts next? No.)
        // If range is inclusive 7000-9000.
        // 7000 (1), 7500 (2), 8000 (3), 8500 (4), 9000 (5).

        // CONTRADICTION in prompt:
        // Table: "$7,000 - $9,000 | $75 | Max 5 blocks = $375"
        // Pseudocode: "const lowTierBonus = 4 * 75; // 4 blocks = $300"

        // WHICH ONE TO TRUST?
        // Example: $8,500 -> $300 (Base) in table?
        // Table Example: $8,500 | $300.
        // If table example says $8,500 is $300.
        // 8500 - 7000 = 1500. 1500/500 = 3 blocks? 3*75 = 225.
        // If formula is floor((Rev - 7000)/500) + 1:
        // 8500: floor(1500/500)+1 = 4 blocks -> $300. Correct.
        // So $9000: floor(2000/500)+1 = 5 blocks -> $375.

        // BUT Pseudocode for >9000 says `lowTierBonus = 4 * 75`.
        // It implies that once you pass 9000, you only get credit for 4 blocks of the lower tier?
        // Or maybe the 9000 block counts as high tier?
        // Table says "$9,500 - $13,000 | $100".

        // Let's look at Example $12,000 -> $800.
        // If we use pseudocode: 
        // lowTierBonus = 300.
        // highBlocks = floor((12000 - 9000) / 500) = floor(3000/500) = 6.
        // bonus = 300 + (6 * 100) = 900.
        // min(900, 1000) = 900.
        // BUT Example says $800.
        // Discrepancy.

        // Let's re-read Table carefully.
        // $7,000 - $9,000: $75.
        // $9,500 - $13,000: $100.

        // If we look at $12,000 example yielding $800 base.
        // Maybe:
        // Tier 1 (7000-9000): 7000, 7500, 8000, 8500, 9000. (5 blocks * 75 = 375).
        // Tier 2 (9500-12000): 9500, 10000, 10500, 11000, 11500, 12000. (6 blocks * 100 = 600).
        // Total = 975. 
        // Still not 800.

        // Let's check the Pseudocode again.
        // `const lowTierBonus = 4 * 75; // 4 blocks = $300`
        // `const highBlocks = Math.floor((weeklyRevenue - 9000) / 500);`
        // `midTier = highBlocks * 100`

        // Let's test $12,000 with this pseudocode:
        // low = 300.
        // high = floor((12000-9000)/500) = 6.
        // total = 300 + 600 = 900.
        // Still doesn't match 800.

        // Let's check $20,000 example.
        // Base $1,400.
        // Calc: 1000 + (20000 * 0.02) = 1000 + 400 = 1400. Matches.

        // Let's check $8,500 example.
        // Base $300.
        // Calc logic 1 (floor... + 1):
        // floor((8500-7000)/500)+1 = 4. 4*75 = 300. Matches.

        // So the "low tier" formula `floor((rev-7000)/500)+1` seems correct for values <= 9000.
        // And for $8500, it yields $300.

        // Now back to $12,000 yielding $800.
        // Maybe the "low tier" is capped at some value when moving to high tier?
        // If the Pseudocode `lowTierBonus = 4 * 75` is literal, then low tier contribution is fixed at 300 for anything > 9000.
        // Which means 9000 itself isn't counted in low tier?
        // If I have $12,000:
        // 300 (fixed low) + X (high).
        // To get 800 total, X must be 500.
        // 500 / 100 = 5 blocks.
        // We need 5 high blocks.
        // High blocks formula: `floor((12000 - 9000) / 500)` = 6.
        // Why 5?
        // Maybe high tier starts at 9500?
        // 9500 is 1 block?
        // (9500 - 9000) / 500 = 1.
        // (12000 - 9000) / 500 = 6.
        // 9500, 10000, 10500, 11000, 11500, 12000 -> 6 items.

        // Maybe the "low tier" maxes at 300? 
        // The table says "Max 5 blocks = $375".
        // But pseudocode says `4 * 75`.
        // And example $12000 -> $800 suggests:
        // If low tier Max is $300 (4 blocks).
        // Then high tier needs $500 (5 blocks).
        // 12000 corresponds to 6 blocks past 9000.
        // Perhaps 9000 itself is a dead zone? 
        // Or maybe the high blocks are calculated differently.

        // Let's follow the PSEUDOCODE strictly as requested "IMPLEMENT EXACTLY", but noting the discrepancy.
        // However, the prompt also says "Critical Bonus Calculation Tests... $12,000 -> $1,000 total".
        // In table: $12,000 | 5 Reviews | 3 Memberships | Compliant.
        // Base $800. SPIF $200. Total $1000.
        // So Base must be $800.

        // If I use the Pseudocode LITERALLY:
        // `lowTierBonus = 4 * 75` (300).
        // `highBlocks = floor((12000 - 9000) / 500)` (6).
        // Bonus = 300 + 600 = 900.
        // This contradicts the $800 example.

        // Is it possible "Max 8 blocks" in table implies something?
        // "Max 8 blocks = $800".
        // 9000 + (8*500) = 13000.
        // So range 9000-13000 has 8 blocks.
        // 9500(1), 10000(2), ... 13000(8).
        // (13000-9000)/500 = 8. Correct.

        // So why is 12000 giving 5 blocks in my deduction?
        // (12000-9000)/500 = 6.

        // Could the low tier be $300 max?
        // If low tier max is $300.
        // And high tier is $100 per block.
        // For 12,000 -> 6 blocks -> $600.
        // Total 300 + 600 = $900.
        // Still 900.

        // Maybe I should look at the "Calc Examples" table again.
        // $12,000 -> Base $800.
        // $20,000 -> Base $1,400.
        // $8,500 -> Base $300.

        // Maybe high blocks offset is different?
        // What if high blocks start at 9500 as 0? No, that would be weird.
        // High blocks start at 9500 as 1.
        // `floor((12000 - 9000)/500)`

        // Wait... 5 blocks of high tier = $500.
        // 12000 - 9500 = 2500. 2500/500 = 5 blocks.
        // 9500, 10000, 10500, 11000, 11500, 12000? That's 6 endpoints.
        // Interval [9500, 12000] width 2500. 2500/500 = 5 blocks.
        // 9000 -> 9500 is the first block.
        // If the calculation for high blocks was `floor((revenue - 9500) / 500) + 1`?
        // For 12000: floor(2500/500)+1 = 6.

        // Let's assume the user's "Example" is truth. $12,000 -> $800.
        // And $8,500 -> $300. (300 is 4 blocks of 75).
        // $9000 would be 5 blocks -> $375?

        // If I use the logic:
        // Base < 9000: floor((Rev-7000)/500)+1 * 75.
        // Base > 9000:
        // Fixed part from low tier: $300 (This implies 8500-9000 is ignored or capped?).
        // Variable part: floor((Rev - 9000) / 500) * 100 ?
        // If Rev=12000. 3000/500 = 6. 6*100 = 600. Total 900.

        // Maybe the FIXED part is $200? No.
        // Maybe High Tier is different?

        // Let's look at strict Pseudocode again.
        // `const lowTierBonus = 4 * 75; // 4 blocks = $300`
        // It seems HARDCODED.
        // `const highBlocks = Math.floor((weeklyRevenue - 9000) / 500);`
        // `const bonus = lowTierBonus + (highBlocks * 100);`

        // I will implement the PSEUDOCODE as written, but I will adjust the "lowTierBonus" or "highBlocks" logic slightly to MATCH THE EXAMPLE if possible, or prioritize the pseudocode if it claims to be "CRITICAL".
        // The prompt says "IMPLEMENT EXACTLY" above "Base Bonus Calculation Pseudocode".
        // And then provides examples that contradict it ($12k -> $800 vs $900).

        // Decision: implementation usually trumps examples if "Pseudocode" is explicit.
        // BUT the prompt matches $8,500 -> $300 (which fits `4*75` if we assume 8500 is 4th block).
        // 7000(1), 7500(2), 8000(3), 8500(4).
        // 9000(5).

        // If 9000 is 5th block ($375), why does pseudocode lock typical bonus at 4 blocks ($300)?
        // Maybe because if you go over 9000, you lose the 5th low block and start high blocks?
        // That would be mean ($375 -> $300 + ...).
        // If Rev=9001. 
        // Low=300. High=floor(1/500)=0. Total 300.
        // Drops from 375 (at 9000) to 300? That's a cliff.

        // HYPOTHESIS: The Example table might be using a slightly different logic OR 12,000 -> 800 is a specific case.
        // $12,000 -> $800.
        // 300 (low) + 500 (high) = 800.
        // High blocks = 5.
        // Rev=12000.
        // If high blocks = floor((Rev - 9500)/500) + 1?
        // floor(2500/500)+1 = 6.
        // If high blocks = floor((Rev - 9000)/500) - 1?
        // 6 - 1 = 5.

        // Let's assume the correct logic is: 
        // Start counting high blocks from 9500.
        // And low tier max is $300 (covers up to 8500?). 9000 is ignored?

        // Okay, I will implement the PSEUDOCODE provided in the prompt, because the user said "IMPLEMENT EXACTLY".
        // If the examples are wrong, the code will follow the pseudocode.
        // However, I will check if I can make it match.
        // Actually, looking at the code provided in the prompt:
        // `const highBlocks = Math.floor((weeklyRevenue - 9000) / 500);`
        // This is explicitly providing the formula.
        // So I MUST use this formula.
        // If it gives 900 for 12000, so be it.
        // I will add a comment about the discrepancy.

        // Update: I see "Max 8 blocks = $800" in the table for high tier.
        // $13,000 - $9,000 = $4,000.
        // $4,000 / $500 = 8 blocks.
        // So if you hit 13,000, you get 8 blocks ($800) + low tier ($300).
        // Total $1,100.
        // But the Pseudocode says `Math.min(bonus, 1000)`.
        // So it caps at 1000.
        // Example: $12,000 -> $900 (uncapped). Cap is 1000. So 900.
        // Why did example say $800?
        // Maybe the user made a typo in the example table (12000 is 6 blocks=600 + 300=900?).
        // Or maybe the low tier is 4*75 = 300, and 12000 is 5 blocks high?

        // I will stick to the CODE provided.

        const lowTierBonus = 4 * 75;
        const highBlocks = Math.floor((revenue - 9000) / 500);
        const bonus = lowTierBonus + (highBlocks * 100);
        return Math.min(bonus, 1000);
    }

    // Tier 3: $13,001+
    // $1000 + 2% of TOTAL
    return 1000 + (revenue * 0.02);
}

export function calculateSPIFs(reviews: number, memberships: number): number {
    return (reviews * 25) + (memberships * 25);
}

export type BonusResult = {
    base: number;
    spifs: number;
    total: number;
    eligible: boolean;
};

export function calculateTotalBonus(
    weeklyRevenue: number,
    reviews: number,
    memberships: number,
    compliance: ComplianceRecord | boolean // Allow calculated boolean or full record
): BonusResult {
    const isCompliant = typeof compliance === 'boolean' ? compliance : isFullyCompliant(compliance);

    if (!isCompliant) {
        return { base: 0, spifs: 0, total: 0, eligible: false };
    }

    const base = calculateBaseBonus(weeklyRevenue);
    const spifs = calculateSPIFs(reviews, memberships);

    return {
        base,
        spifs,
        total: base + spifs,
        eligible: true
    };
}

export function isFullyCompliant(compliance: ComplianceRecord): boolean {
    const requirements = [
        'vanCleanliness',
        'paperworkSubmitted',
        'estimateFollowups',
        'zeroCallbacks',
        'noComplaints',
        'noBadDriving',
        'drugScreening',
        'noOshaViolations',
        'paceTraining'
    ];

    // Check if every requirement key is true
    return requirements.every(req => {
        // Safely access property
        const val = compliance[req];
        return val === true;
    });
}
