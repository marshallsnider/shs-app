const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function main() {
    console.log('Seeding badges...');
    for (const b of BADGES) {
        await prisma.badge.upsert({
            where: { code: b.code },
            update: {},
            create: b,
        });
    }

    const demoTech = await prisma.technician.upsert({
        where: { employeeId: 'DEMO-001' },
        update: {},
        create: {
            name: 'Marshall Snider',
            employeeId: 'DEMO-001',
            avatar: 'MS',
            startDate: new Date(),
            isActive: true,
            currentStreak: 0
        }
    });
    console.log('Demo tech ensured:', demoTech.name);

    console.log('Badges seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
