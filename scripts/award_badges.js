const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Minimal Badge Logic Re-creation to avoid import issues in script
const BADGES = {
    FIRST_STEPS: 'FIRST_STEPS',
    MONEY_MAKER: 'MONEY_MAKER',
    REVIEW_MASTER: 'REVIEW_MASTER',
    ON_FIRE: 'ON_FIRE',
    UNSTOPPABLE: 'UNSTOPPABLE',
    HIGH_ROLLER: 'HIGH_ROLLER',
    MEMBERSHIP_PRO: 'MEMBERSHIP_PRO',
    PERFECT_WEEK: 'PERFECT_WEEK',
};

async function main() {
    console.log("Running manual gamification check...");

    // 1. Get Tech
    const tech = await prisma.technician.findFirst();
    if (!tech) return console.log("No tech found");

    console.log(`Checking for ${tech.name}...`);

    // 2. Get Performance (Week 6 - the one with $7,850)
    // We need to look up correctly using ID
    const perfs = await prisma.weeklyPerformance.findMany({
        where: { technicianId: tech.id },
        include: { compliance: true }
    });

    for (const p of perfs) {
        console.log(`Processing Week ${p.weekNumber}: $${p.totalRevenue}`);

        // Logic
        if (p.jobsCompleted > 0) await award(tech.id, BADGES.FIRST_STEPS);
        if (p.totalRevenue >= 7000) await award(tech.id, BADGES.MONEY_MAKER);
        if (p.reviews >= 5) await award(tech.id, BADGES.REVIEW_MASTER);
    }
}

async function award(techId, code) {
    const badge = await prisma.badge.findUnique({ where: { code } });
    if (!badge) return;

    try {
        await prisma.technicianBadge.create({
            data: { technicianId: techId, badgeId: badge.id }
        });
        console.log(`>>> AWARDED: ${badge.name}`);
    } catch (e) {
        // Ignore duplicate
        // console.log(`Already has ${badge.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
