import { calculateBaseBonus, calculateSPIFs, calculateTotalBonus, isFullyCompliant, countInfractions, ComplianceRecord } from './engine';

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
    dressCode: true,
};

const oneStrikeCompliance: ComplianceRecord = {
    ...passingCompliance,
    vanCleanliness: false,
};

const twoStrikeCompliance: ComplianceRecord = {
    ...passingCompliance,
    vanCleanliness: false,
    dressCode: false,
};

const threeStrikeCompliance: ComplianceRecord = {
    ...passingCompliance,
    vanCleanliness: false,
    dressCode: false,
    paperworkSubmitted: false,
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

console.log("Running Bonus Calculation Tests...\n");

// Base Bonus Tests
runTest("$0 -> $0", 0, calculateBaseBonus(0));
runTest("$6,999 -> $0", 0, calculateBaseBonus(6999));
runTest("$7,000 -> $75", 75, calculateBaseBonus(7000));
runTest("$7,500 -> $150", 150, calculateBaseBonus(7500));
runTest("$9,000 -> $375", 375, calculateBaseBonus(9000));
runTest("$9,500 -> $475", 475, calculateBaseBonus(9500));
runTest("$9,001 -> $375 (no gap)", 375, calculateBaseBonus(9001));
runTest("$10,000 -> $575", 575, calculateBaseBonus(10000));
runTest("$12,000 -> $975", 975, calculateBaseBonus(12000));
runTest("$13,000 -> $1,000 (Cap)", 1000, calculateBaseBonus(13000));
runTest("$13,001 -> $1,260.02", 1260.02, calculateBaseBonus(13001));
runTest("$20,000 -> $1,400", 1400, calculateBaseBonus(20000));

// SPIF Tests
runTest("SPIFs: 3 reviews, 2 memberships", 125, calculateSPIFs(3, 2));

// Infraction count
runTest("0 infractions (all pass)", 0, countInfractions(passingCompliance));
runTest("1 infraction", 1, countInfractions(oneStrikeCompliance));
runTest("2 infractions", 2, countInfractions(twoStrikeCompliance));
runTest("3 infractions", 3, countInfractions(threeStrikeCompliance));

// Three Strikes Integration
// Policy: deductions hit BASE only; SPIFs always paid in full.
console.log("\nThree Strikes Tests:");

const clean = calculateTotalBonus(8500, 3, 2, passingCompliance);
runTest("Clean: $8,500 -> base=300, spifs=125, total=425", 425, clean.total); // 4 blocks * 75 = 300
runTest("Clean: strikeLevel", 'clean', clean.strikeLevel);

const strike1 = calculateTotalBonus(8500, 3, 2, oneStrikeCompliance);
runTest("Strike 1: base 300-25=275, spifs 125, total = 400", 400, strike1.total);
runTest("Strike 1: spifs preserved", 125, strike1.spifs);
runTest("Strike 1: strikeLevel", 'warning', strike1.strikeLevel);

const strike2 = calculateTotalBonus(8500, 3, 2, twoStrikeCompliance);
runTest("Strike 2: base 300-75=225, spifs 125, total = 350", 350, strike2.total);
runTest("Strike 2: spifs preserved", 125, strike2.spifs);
runTest("Strike 2: strikeLevel", 'danger', strike2.strikeLevel);

const strike3 = calculateTotalBonus(8500, 3, 2, threeStrikeCompliance);
runTest("Strike 3: base 0, spifs 125, total = 125 (SPIFs survive disqualification)", 125, strike3.total);
runTest("Strike 3: base zeroed", 0, strike3.base);
runTest("Strike 3: spifs preserved", 125, strike3.spifs);
runTest("Strike 3: strikeLevel", 'disqualified', strike3.strikeLevel);

// Edge: low base can't absorb deduction — base floors at 0, SPIFs untouched.
const lowBaseStrike1 = calculateTotalBonus(7000, 4, 0, oneStrikeCompliance);
runTest("Low base ($7k = $75) + strike 1 ($25 ded): base 50, spifs 100, total = 150", 150, lowBaseStrike1.total);
runTest("Low base + strike 1: spifs intact", 100, lowBaseStrike1.spifs);

// Legacy boolean test — SPIFs still paid even when boolean compliance is false.
const legacyPass = calculateTotalBonus(8500, 3, 2, true);
runTest("Legacy true: total = 425", 425, legacyPass.total);
const legacyFail = calculateTotalBonus(15000, 6, 4, false);
runTest("Legacy false: base zeroed, spifs paid -> total = 250", 250, legacyFail.total);
runTest("Legacy false: spifs preserved", 250, legacyFail.spifs);

console.log("\nDone.");
