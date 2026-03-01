// scripts/list_employees.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const techs = await prisma.technician.findMany({
        where: { isActive: true },
        select: { name: true, employeeId: true }
    });
    console.log('--- Active Technician Logins ---');
    techs.forEach(t => console.log(`Name: ${t.name} -> ID: ${t.employeeId}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
