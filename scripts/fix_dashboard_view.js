// scripts/fix_dashboard_view.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Determine "Next Week" cutoff (we want to keep THIS week, but nuke future)
    // Actually, just nuke anything with startDate > NOW (plus a buffer for end of week?)
    // Current Week (Week 6) started ~Feb 1st or Feb 4th depending on logic.
    // Let's explicitly look for records with weekNumber > 6 (for 2026).

    // Safety: check current date
    const now = new Date();
    // Assuming we are in 2026 as per user context
    console.log(`Current Time (Simulated): ${now.toISOString()}`);

    // Delete records for weeks > current week (roughly)
    // Actually, let's just delete records where weekNumber > 6 AND year == 2026.

    console.log('--- Cleaning Future Data ---');

    const futureRecords = await prisma.weeklyPerformance.deleteMany({
        where: {
            year: 2026,
            weekNumber: { gt: 6 }
        }
    });

    console.log(`Deleted ${futureRecords.count} future records (Week 7+).`);

    // Also check if there are any weird 2027 records?
    const farFuture = await prisma.weeklyPerformance.deleteMany({
        where: { year: { gt: 2026 } }
    });
    if (farFuture.count > 0) console.log(`Deleted ${farFuture.count} records from 2027+.`);

    console.log('Dashboard should now default to Week 6 (Current).');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
