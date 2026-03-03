'use server';

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcryptjs';
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";

async function getSuperAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('shs_admin_token')?.value;
    if (!token) return null;
    const admin = await verifyAdminToken(token);
    if (admin?.role !== 'SUPER_ADMIN') return null;
    return admin;
}

export async function createAdmin(formData: FormData) {
    const caller = await getSuperAdminSession();
    if (!caller) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;
    const role = formData.get("role") as string || "MANAGER";

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) throw new Error("User with that email already exists.");

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
        data: {
            name,
            email,
            passwordHash,
            role,
            isActive: true
        }
    });

    await prisma.auditLog.create({
        data: {
            adminId: caller.id,
            action: "CREATE_ADMIN",
            targetId: newAdmin.id,
            details: JSON.stringify({ name, email, role })
        }
    });

    revalidatePath('/admin/users');
}

export async function deleteAdmin(adminId: string) {
    const caller = await getSuperAdminSession();
    if (!caller) throw new Error("Unauthorized");

    if (caller.id === adminId) {
        throw new Error("Cannot delete your own account.");
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new Error("Admin not found.");

    await prisma.admin.delete({ where: { id: adminId } });

    await prisma.auditLog.create({
        data: {
            adminId: caller.id,
            action: "DELETE_ADMIN",
            targetId: adminId,
            details: JSON.stringify({ name: admin.name, email: admin.email })
        }
    });

    revalidatePath('/admin/users');
}
