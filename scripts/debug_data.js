const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- TECHNICIANS ---");
    const techs = await prisma.technician.findMany();
    console.table(techs.map(t => ({ id: t.id, name: t.name, isActive: t.isActive })));

    console.log("\n--- WEEKLY PERFORMANCE ---");
    const perf = await prisma.weeklyPerformance.findMany({
        include: { technician: true }
    });

    // Calculate "Current Week" logic from page.tsx to compare
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const simpleWeekNumber = Math.ceil((days + 1) / 7);

    console.log(`\nLogic Check: page.tsx thinks current week is: ${simpleWeekNumber} of ${now.getFullYear()}`);

    console.table(perf.map(p => ({
        tech: p.technician.name,
        year: p.year,
        week: p.weekNumber,
        revenue: p.totalRevenue,
        jobs: p.jobsCompleted
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
