import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateTotalBonus, ComplianceRecord, COMPLIANCE_LABELS, COMPLIANCE_REQUIREMENTS, countInfractions } from '@/lib/engine';
import { getISOWeek } from '@/lib/week';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const weekParam = searchParams.get('week');

    const current = getISOWeek(new Date());
    const year = yearParam ? parseInt(yearParam) : current.year;
    const weekNumber = weekParam ? parseInt(weekParam) : current.weekNumber;

    const performances = await prisma.weeklyPerformance.findMany({
        where: { year, weekNumber },
        include: {
            technician: true,
            compliance: true,
        },
        orderBy: { totalRevenue: 'desc' },
    });

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    const totalRevenue = performances.reduce((s, p) => s + p.totalRevenue, 0);
    const totalJobs = performances.reduce((s, p) => s + p.jobsCompleted, 0);
    const totalBonuses = performances.reduce((s, p) => s + p.totalBonus, 0);

    // Build HTML report
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>SHS Weekly Report - Week ${weekNumber}, ${year}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
            .header h1 { font-size: 28px; color: #fff; margin-bottom: 8px; }
            .header .subtitle { color: #94a3b8; font-size: 14px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
            .kpi-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; }
            .kpi-card .value { font-size: 24px; font-weight: bold; color: #fff; }
            .kpi-card .label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            th { background: #1e293b; color: #94a3b8; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            td { padding: 12px; border-bottom: 1px solid #1e293b; }
            tr:hover td { background: #1e293b40; }
            .rank-1 td { background: #fbbf2410; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
            .badge-clean { background: #10b98120; color: #10b981; }
            .badge-warning { background: #eab30820; color: #eab308; }
            .badge-danger { background: #f9731620; color: #f97316; }
            .badge-disqualified { background: #ef444420; color: #ef4444; }
            .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; }
            .toolbar { display: flex; gap: 12px; margin-bottom: 24px; }
            .toolbar a, .toolbar button { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
            .btn-back { background: #334155; color: #e2e8f0; }
            .btn-back:hover { background: #475569; }
            .btn-print { background: #6366f1; color: white; }
            .btn-print:hover { background: #818cf8; }
            @media print { body { background: white; color: black; } .kpi-card { border: 1px solid #ddd; } th { background: #f1f5f9; color: #334155; } .toolbar { display: none !important; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="toolbar">
                <a href="/admin" class="btn-back">← Back to Admin</a>
                <button onclick="window.print()" class="btn-print">🖨️ Print / Save PDF</button>
            </div>

            <div class="header">
                <h1>⚡ Safety Home Services</h1>
                <div class="subtitle">Weekly Performance Report — Week ${weekNumber}, ${year}</div>
                <div class="subtitle">Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="value">${formatter.format(totalRevenue)}</div>
                    <div class="label">Total Revenue</div>
                </div>
                <div class="kpi-card">
                    <div class="value">${totalJobs}</div>
                    <div class="label">Jobs Completed</div>
                </div>
                <div class="kpi-card">
                    <div class="value">${formatter.format(totalBonuses)}</div>
                    <div class="label">Total Bonuses</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Technician</th>
                        <th>Revenue</th>
                        <th>Jobs</th>
                        <th>Reviews</th>
                        <th>Memberships</th>
                        <th>Bonus</th>
                        <th>Compliance</th>
                    </tr>
                </thead>
                <tbody>
                    ${performances.map((p, idx) => {
        const infractions = p.compliance ? countInfractions(p.compliance as unknown as ComplianceRecord) : 10;
        const strikeLevel = infractions === 0 ? 'clean' : infractions === 1 ? 'warning' : infractions === 2 ? 'danger' : 'disqualified';
        const strikeLabel = infractions === 0 ? 'All Clear' : infractions >= 3 ? 'Disqualified' : `Strike ${infractions}/3`;

        return `
                        <tr class="${idx === 0 ? 'rank-1' : ''}">
                            <td>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                            <td><strong>${p.technician.name}</strong></td>
                            <td>${formatter.format(p.totalRevenue)}</td>
                            <td>${p.jobsCompleted}</td>
                            <td>${p.reviews}</td>
                            <td>${p.memberships}</td>
                            <td>${formatter.format(p.totalBonus)}</td>
                            <td><span class="badge badge-${strikeLevel}">${strikeLabel}</span></td>
                        </tr>`;
    }).join('')}
                </tbody>
            </table>

            <div class="footer">
                Safety Home Services — Confidential Management Report
            </div>
        </div>
    </body>
    </html>`;

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="SHS-Report-W${weekNumber}-${year}.html"`,
        },
    });
}
