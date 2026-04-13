import prisma from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Users, DollarSign, Award, AlertTriangle, FileText } from "lucide-react";
import { SyncButton } from "@/components/admin/SyncButton";
import { WeekPicker } from "@/components/admin/WeekPicker";
import { getISOWeek } from "@/lib/week";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ year?: string; week?: string }> }) {
    const params = await searchParams;
    // 1. Determine Current Week (Simplistic approx for now, ideally reliable lib)
    const now = new Date();
    // Getting week number - reusing logic or just filtering by recent date is better for aggregation?
    // Let's filter by "Current Year" for now to show YTD or filter by specific week?
    // The design shows "Total Revenue (Week)".

    // We'll grab the latest available week from data to show "Most Recent Week" stats
    const latestPerf = await prisma.weeklyPerformance.findFirst({
        orderBy: { startDate: 'desc' }
    });

    const latestYear = latestPerf?.year || now.getFullYear();
    const latestWeek = latestPerf?.weekNumber || getISOWeek(now).weekNumber;

    // Allow searchParams to override displayed week
    const currentYear = params.year ? parseInt(params.year) : latestYear;
    const currentWeek = params.week ? parseInt(params.week) : latestWeek;

    // Fetch all performance records for this week
    const weeklyData = await prisma.weeklyPerformance.findMany({
        where: {
            year: currentYear,
            weekNumber: currentWeek
        },
        include: {
            technician: true,
            compliance: true
        }
    });

    // Aggregations
    const totalRevenue = weeklyData.reduce((sum: number, p: any) => sum + p.totalRevenue, 0);
    const activeTechs = await prisma.technician.count({ where: { isActive: true } });
    const totalBonuses = weeklyData.reduce((sum: number, p: any) => sum + p.totalBonus, 0);

    // Compliance Alerts involved searching for failures in the compliance relation
    // We want technicians who FAILED compliance
    const complianceFailures = weeklyData.filter((p: any) =>
        p.compliance && (
            !p.compliance.vanCleanliness ||
            !p.compliance.paperworkSubmitted ||
            !p.compliance.estimateFollowups ||
            !p.compliance.zeroCallbacks ||
            !p.compliance.noComplaints ||
            !p.compliance.noBadDriving ||
            !p.compliance.drugScreening ||
            !p.compliance.noOshaViolations ||
            !p.compliance.paceTraining ||
            !p.compliance.dressCode
        )
    );

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Overview</h2>
                <div className="flex items-center gap-4">
                    <SyncButton />
                    <a
                        href={`/api/reports?year=${currentYear}&week=${currentWeek}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        Weekly Report
                    </a>
                    <WeekPicker currentYear={latestYear} currentWeek={latestWeek} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KPICard
                    label="Total Revenue"
                    value={formatter.format(totalRevenue)}
                    icon={DollarSign}
                // trend="+12%" // TODO: Compare with prev week
                />
                <KPICard
                    label="Active Techs"
                    value={activeTechs.toString()}
                    icon={Users}
                />
                <KPICard
                    label="Bonuses Calc"
                    value={formatter.format(totalBonuses)}
                    icon={Award}
                />
                <KPICard
                    label="Compliance Issues"
                    value={complianceFailures.length.toString()}
                    icon={AlertTriangle}
                    color="text-danger"
                />
            </div>

            {/* Recent Activity / At a Glance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-4">Team Performance</h3>
                    {weeklyData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-500">
                            No data entered for this week yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {weeklyData.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                            {p.technician.avatar || p.technician.name.charAt(0)}
                                        </div>
                                        <span className="text-white font-medium">{p.technician.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold">{formatter.format(p.totalRevenue)}</div>
                                        <div className="text-xs text-slate-500">{p.jobsCompleted} Jobs</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-4">Compliance Alerts</h3>
                    <div className="space-y-3">
                        {complianceFailures.length === 0 ? (
                            <div className="text-slate-500 text-sm">All clean! No compliance issues reported.</div>
                        ) : (
                            complianceFailures.map((p: any) => {
                                // Find first failure cause for display
                                const issues = [];
                                if (!p.compliance.vanCleanliness) issues.push("Van Dirty");
                                if (!p.compliance.paperworkSubmitted) issues.push("No Paperwork");
                                if (!p.compliance.estimateFollowups) issues.push("Estimate Follow-ups");
                                if (!p.compliance.zeroCallbacks) issues.push("Callbacks");
                                if (!p.compliance.noComplaints) issues.push("Complaints");
                                if (!p.compliance.noBadDriving) issues.push("Bad Driving");
                                if (!p.compliance.drugScreening) issues.push("Drug Screening");
                                if (!p.compliance.noOshaViolations) issues.push("OSHA Violation");
                                if (!p.compliance.paceTraining) issues.push("PACE Training");
                                if (!p.compliance.dressCode) issues.push("Dress Code");
                                const issueText = issues.join(", ") || "General Failure";

                                return (
                                    <AlertItem
                                        key={p.id}
                                        name={p.technician.name}
                                        issue={issueText}
                                        techId={p.technician.id}
                                    />
                                );
                            })
                        )}
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

function AlertItem({ name, issue, techId }: { name: string, issue: string, techId: string }) {
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
            <a
                href={`/admin/data-entry?tech=${techId}`}
                className="text-xs text-white bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 transition-colors"
            >
                View
            </a>
        </div>
    )
}
