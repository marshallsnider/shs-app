import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        console.error("ADMIN_PASSWORD is not set in environment.");
        process.exit(1);
    }

    const email = "marshall@shs.com"; // Default for Marshall
    const name = "Marshall Snider";

    // Check if Marshall already exists
    const existing = await prisma.admin.findUnique({ where: { email } });

    if (existing) {
        console.log("Admin account for Marshall already exists. Updating password to match .env.local...");
        const hash = await bcrypt.hash(password, 10);
        await prisma.admin.update({
            where: { email },
            data: { passwordHash: hash, role: "SUPER_ADMIN" }
        });
        console.log("Admin account updated.");
        return;
    }

    // Create new admin
    console.log("Creating super admin account for Marshall...");
    const hash = await bcrypt.hash(password, 10);

    await prisma.admin.create({
        data: {
            name,
            email,
            passwordHash: hash,
            role: "SUPER_ADMIN",
            isActive: true,
        }
    });

    console.log("Super admin account created successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
