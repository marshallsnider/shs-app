const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // 1. Get the technician
    const tech = await prisma.technician.findFirst();
    if (!tech) {
        console.log("No technician found.");
        return;
    }
    console.log("Seeding for technician:", tech.name);

    // 2. Calculate previous week
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + 1) / 7);

    let prevWeekNumber = weekNumber - 1;
    let prevYear = year;
    if (prevWeekNumber < 1) {
        prevWeekNumber = 52;
        prevYear = year - 1;
    }

    console.log(`Current Week: ${weekNumber}, Year: ${year}`);
    console.log(`Seeding Previous Week: ${prevWeekNumber}, Year: ${prevYear}`);

    // 3. Create/Update Previous Week Performance
    await prisma.weeklyPerformance.upsert({
        where: {
            technicianId_year_weekNumber: {
                technicianId: tech.id,
                year: prevYear,
                weekNumber: prevWeekNumber
            }
        },
        update: {
            totalRevenue: 5000,
            jobsCompleted: 10,
            reviews: 2,
            memberships: 1,
            // Mock compliance for passed
            compliance: {
                upsert: {
                    create: {
                        vanCleanliness: true,
                        paperworkSubmitted: true,
                        estimateFollowups: true,
                        zeroCallbacks: true,
                        noComplaints: true,
                        noBadDriving: true,
                        drugScreening: true,
                        noOshaViolations: true,
                        paceTraining: true
                    },
                    update: {
                        vanCleanliness: true,
                        paperworkSubmitted: true,
                        estimateFollowups: true,
                        zeroCallbacks: true,
                        noComplaints: true,
                        noBadDriving: true,
                        drugScreening: true,
                        noOshaViolations: true,
                        paceTraining: true
                    }
                }
            }
        },
        create: {
            technicianId: tech.id,
            year: prevYear,
            weekNumber: prevWeekNumber,
            quarter: Math.ceil(prevWeekNumber / 13),
            startDate: new Date(), // Dummy date
            endDate: new Date(), // Dummy date
            totalRevenue: 5000,
            jobsCompleted: 10,
            reviews: 2,
            memberships: 1,
            compliance: {
                create: {
                    vanCleanliness: true,
                    paperworkSubmitted: true,
                    estimateFollowups: true,
                    zeroCallbacks: true,
                    noComplaints: true,
                    noBadDriving: true,
                    drugScreening: true,
                    noOshaViolations: true,
                    paceTraining: true
                }
            }
        }
    });

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
