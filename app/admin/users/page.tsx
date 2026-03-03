import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('shs_admin_token')?.value;

    let caller = null;
    if (token) {
        caller = await verifyAdminToken(token);
    }

    if (!caller || caller.role !== 'SUPER_ADMIN') {
        redirect('/admin');
    }

    const admins = await prisma.admin.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Manage Admins</h1>
            <p className="text-slate-400">
                Create and manage administrator accounts. Super Admins have full access, while Managers can enter data and view reports but cannot manage other admins.
            </p>
            <AdminUsersClient initialAdmins={admins} currentAdminId={caller.id} />
        </div>
    );
}
