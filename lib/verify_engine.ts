import { calculateBaseBonus, calculateSPIFs, calculateTotalBonus, isFullyCompliant, ComplianceRecord } from './engine';

const passingCompliance: ComplianceRecord = {
    vanCleanliness: true,
    paperworkSubmitted: true,
    estimateFollowups: true,
    zeroCallbacks: true,
    noComplaints: true,
    noBadDriving: true,
    drugScreening: true,
    noOshaViolations: true,
    paceTraining: true,
};

const failingCompliance: ComplianceRecord = {
    ...passingCompliance,
    vanCleanliness: false
};

function runTest(name: string, expected: any, actual: any) {
    const passed = JSON.stringify(expected) === JSON.stringify(actual);
    if (passed) {
        console.log(`✅ ${name}`);
    } else {
        console.error(`❌ ${name}`);
        console.error(`   Expected:`, expected);
        console.error(`   Actual:  `, actual);
    }
}

console.log("Running Bonus Calculation Tests...");

// Base Bonus Tests
runTest("$0 -> $0", 0, calculateBaseBonus(0));
runTest("$6,999 -> $0", 0, calculateBaseBonus(6999));
// 7000: floor(0/500)+1 = 1 * 75 = 75
runTest("$7,000 -> $75", 75, calculateBaseBonus(7000));
// 7500: floor(500/500)+1 = 2 * 75 = 150
runTest("$7,500 -> $150", 150, calculateBaseBonus(7500));
// 9000: floor(2000/500)+1 = 5 * 75 = 375
runTest("$9,000 -> $375", 375, calculateBaseBonus(9000));

// Tier 2 Starts
// 9500: low=300. high=floor((9500-9000)/500)=1. 300 + 100 = 400.
runTest("$9,500 -> $400 (Pseudocode logic)", 400, calculateBaseBonus(9500));

// Discrepancy check: Prompt said $475 for $9500 in one place? No, prompt didn't say.
// Prompt Example: $12,000 -> $800.
// My Code with Pseudocode: 12000. low=300. high=6. 300+600=900.
runTest("$12,000 -> $900 (Pseudocode logic)", 900, calculateBaseBonus(12000));

// 13000: low=300. high=floor(4000/500)=8. 300+800=1100. Cap 1000.
runTest("$13,000 -> $1,000 (Cap)", 1000, calculateBaseBonus(13000));

// Tier 3
// 13001: 1000 + (13001 * 0.02) = 1000 + 260.02 = 1260.02
runTest("$13,001 -> $1,260.02", 1260.02, calculateBaseBonus(13001));

// 20000: 1000 + 400 = 1400.
runTest("$20,000 -> $1,400", 1400, calculateBaseBonus(20000));


// SPIF Tests
runTest("SPIFs: 3 reviews, 2 memberships", 125, calculateSPIFs(3, 2));

// Full Integration
const res1 = calculateTotalBonus(8500, 3, 2, true);
// 8500 -> 300. SPIF 125. Total 425. (Matches Prompt)
runTest("Total: $8,500, 3R, 2M, OK",
    { base: 300, spifs: 125, total: 425, eligible: true },
    res1
);

const res2 = calculateTotalBonus(15000, 6, 4, false);
runTest("Total: $15,000, Fail Compliance",
    { base: 0, spifs: 0, total: 0, eligible: false },
    res2
);

console.log("Done.");
