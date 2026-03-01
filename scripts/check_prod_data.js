const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking database...');
    const techs = await prisma.technician.findMany();
    console.log('Technicians found:', techs.length);
    techs.forEach(t => console.log(`- ${t.name} (${t.employeeId}) IsActive: ${t.isActive}`));

    const badges = await prisma.badge.count();
    console.log('Badges count:', badges);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
