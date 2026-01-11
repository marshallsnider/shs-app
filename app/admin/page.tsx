import { Card } from "@/components/ui/Card";
import { Users, DollarSign, Award, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KPICard label="Total Revenue (Week)" value="$145,200" icon={DollarSign} trend="+12%" />
                <KPICard label="Active Techs" value="18" icon={Users} trend="0" />
                <KPICard label="Bonuses Paid" value="$12,400" icon={Award} trend="+5%" />
                <KPICard label="Compliance Issues" value="3" icon={AlertTriangle} color="text-danger" />
            </div>

            {/* Recent Activity / At a Glance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-4">Team Performance</h3>
                    <div className="flex items-center justify-center h-full text-slate-500">
                        [Chart Placeholder: Weekly Team Revenue]
                    </div>
                </Card>

                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-4">Compliance Alerts</h3>
                    <div className="space-y-3">
                        <AlertItem name="John D." issue="Van Cleanliness Failed" />
                        <AlertItem name="Sarah M." issue="Missing Paperwork" />
                        <AlertItem name="Mike R." issue="Callback Reported" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

function KPICard({ label, value, icon: Icon, trend, color = "text-white" }: any) {
    return (
        <div className="p-4 rounded-xl bg-background-paper border border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <div className="p-2 rounded-lg bg-white/5">
                    <Icon className={`w-4 h-4 ${color}`} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            {trend && (
                <p className="text-xs text-success mt-1">{trend} from last week</p>
            )}
        </div>
    );
}

function AlertItem({ name, issue }: { name: string, issue: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs text-danger">{issue}</p>
                </div>
            </div>
            <button className="text-xs text-white bg-slate-700 px-2 py-1 rounded hover:bg-slate-600">
                View
            </button>
        </div>
    )
}
