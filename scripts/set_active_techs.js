const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACTIVE_NAMES = [
    "Trevor Pursel",
    "Kevin McFarland",
    "Jarrod Judge",
    "Tony Carranza",
    "Alex Robles",
    "Marshall Snider"
];

async function main() {
    console.log('--- Updating Technician Access ---');
    console.log('Allowed List:', ACTIVE_NAMES.join(', '));

    const allTechs = await prisma.technician.findMany();

    for (const tech of allTechs) {
        // Check if tech name matches one of the active names (approximate match)
        const isAllowed = ACTIVE_NAMES.some(name =>
            tech.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(tech.name.toLowerCase())
        );

        if (isAllowed) {
            if (!tech.isActive) {
                console.log(`✅ Activating: ${tech.name}`);
                await prisma.technician.update({
                    where: { id: tech.id },
                    data: { isActive: true }
                });
            } else {
                console.log(`   (Already Active): ${tech.name}`);
            }
        } else {
            if (tech.isActive) {
                console.log(`🚫 Deactivating: ${tech.name}`);
                await prisma.technician.update({
                    where: { id: tech.id },
                    data: { isActive: false }
                });
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
