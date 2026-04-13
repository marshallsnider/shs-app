import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Database, FileBarChart, ShieldAlert, LogOut, GraduationCap } from "lucide-react";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/app/actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('shs_admin_token')?.value;

    let admin = null;
    if (token) {
        admin = await verifyAdminToken(token);
    }

    if (!admin) {
        redirect('/admin-login');
    }

    return (
        <div className="flex h-screen bg-background text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-background-paper border-r border-white/5 flex flex-col justify-between">
                <div>
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                            <div className="bg-white/5 p-3 rounded-full border border-white/5 relative z-10 w-fit">
                                <img src="/logo.png" alt="SHS Logo" className="w-12 h-12 object-contain" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-white">
                            SHS Admin
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">Technician Tracker</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
                        <NavLink href="/admin/technicians" icon={Users} label="Technicians" />
                        <NavLink href="/admin/data-entry" icon={Database} label="Data Entry" />
                        <NavLink href="/admin/reports" icon={FileBarChart} label="Reports" />
                        <NavLink href="/admin/training" icon={GraduationCap} label="PACE Training" />

                        {admin.role === 'SUPER_ADMIN' && (
                            <div className="pt-4 mt-4 border-t border-white/5">
                                <NavLink href="/admin/users" icon={ShieldAlert} label="Manage Admins" />
                            </div>
                        )}
                    </nav>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-white truncate">{admin.name}</span>
                            <span className="text-xs text-slate-400 capitalize truncate">{admin.role.replace('_', ' ').toLowerCase()}</span>
                        </div>
                        <form action={logoutAdmin}>
                            <button type="submit" className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors" title="Log out">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon: Icon, label, external }: { href: string; icon: any; label: string; external?: boolean }) {
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
            </a>
        );
    }
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </Link>
    );
}
