import prisma from '../lib/db';
import { calculateTotalBonus, ComplianceRecord } from '../lib/engine';

async function main() {
    console.log("Starting Full Flow Verification...");

    // 1. Seed Badges
    const BADGES = [
        { code: 'FIRST_STEPS', name: 'First Steps', description: 'Complete your first job', icon: 'Star' },
        { code: 'MONEY_MAKER', name: 'Money Maker', description: 'Earn your first weekly bonus ($7k+)', icon: 'DollarSign' },
        { code: 'REVIEW_MASTER', name: 'Review Master', description: 'Get 5+ reviews in a single week', icon: 'Star' },
        { code: 'ON_FIRE', name: 'On Fire', description: '5 consecutive compliant weeks', icon: 'Flame' },
        { code: 'UNSTOPPABLE', name: 'Unstoppable', description: '10 consecutive compliant weeks', icon: 'Zap' },
        { code: 'HIGH_ROLLER', name: 'High Roller', description: 'Hit $13k+ in a single week', icon: 'Crown' },
        { code: 'MEMBERSHIP_PRO', name: 'Membership Pro', description: 'Sell 5+ memberships in a single week', icon: 'Users' },
        { code: 'PERFECT_WEEK', name: 'Perfect Week', description: '$7k+ Revenue AND 100% Compliance', icon: 'ShieldCheck' },
    ];

    console.log("1. Seeding Badges...");
    for (const b of BADGES) {
        await prisma.badge.upsert({
            where: { code: b.code },
            update: {},
            create: b,
        });
    }
    console.log("   Badges seeded.");

    // 2. Create Technician
    console.log("2. Creating/Finding Technician...");
    const tech = await prisma.technician.upsert({
        where: { employeeId: 'FLOW-TEST-01' },
        update: {},
        create: {
            name: 'Test Technician',
            employeeId: 'FLOW-TEST-01',
            avatar: 'TT',
            isActive: true,
            currentStreak: 4 // Pre-set to 4 to test "On Fire" (5 streak)
        }
    });
    console.log(`   Technician: ${tech.name} (Streak: ${tech.currentStreak})`);

    // 3. Submit Performance (Simulating server action logic)
    console.log("3. Submitting Performance ($13,500 + 5 Reviews)...");

    const compliance: ComplianceRecord = {
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

    const revenue = 13500;
    const reviews = 5;
    const memberships = 2; // Should not trigger PRO (needs 5)

    const bonus = calculateTotalBonus(revenue, reviews, memberships, compliance);
    console.log(`   Calculated Bonus: $${bonus.total}`);

    // Save
    const weekNumber = 42;
    const year = 2024;

    await prisma.weeklyPerformance.upsert({
        where: {
            technicianId_year_weekNumber: {
                technicianId: tech.id,
                year,
                weekNumber
            }
        },
        update: {},
        create: {
            technicianId: tech.id,
            year,
            weekNumber,
            quarter: 4,
            startDate: new Date(),
            endDate: new Date(),
            totalRevenue: revenue,
            jobsCompleted: 10,
            reviews,
            memberships,
            compliance: { create: compliance },
            baseBonus: bonus.base,
            spifBonus: bonus.spifs,
            totalBonus: bonus.total,
            isCompliant: bonus.eligible
        }
    });

    // 4. Trigger Gamification
    console.log("4. Triggering Gamification...");
    // Import dynamically to simulate separate file usage if needed, but direct is fine
    const gamification = await import('../lib/gamification');
    const savedPerf = await prisma.weeklyPerformance.findUnique({
        where: { technicianId_year_weekNumber: { technicianId: tech.id, year, weekNumber } },
        include: { compliance: true }
    });

    if (savedPerf) {
        const res = await gamification.checkAndAwardGamification(tech.id, savedPerf);
        console.log(`   New Streak: ${res?.newStreak}`);
        console.log(`   Awards: ${res?.awards.join(', ')}`);

        // Checks
        if (res?.newStreak !== 5) console.error("❌ Streak Check Failed (Expected 5)");
        else console.log("✅ Streak Check Passed");

        if (res?.awards.includes('On Fire')) console.log("✅ Badge 'On Fire' Awarded");
        else console.error("❌ Badge 'On Fire' Missing");

        if (res?.awards.includes('High Roller')) console.log("✅ Badge 'High Roller' Awarded");
        else console.error("❌ Badge 'High Roller' Missing");
    } else {
        console.error("❌ Failed to save performance");
    }

    console.log("Verification Complete.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
