import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Database, FileBarChart, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-background-paper border-r border-white/5 flex flex-col">
                <div className="p-6">
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
                </nav>

                <div className="p-4 border-t border-white/5">
                    <NavLink href="#" icon={Settings} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </Link>
    );
}
