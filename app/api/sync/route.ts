import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const API_KEY = process.env.FIELD_PULSE_API_KEY;
const BASE_URL = process.env.FIELD_PULSE_BASE_URL || "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

export const dynamic = 'force-dynamic'; // No caching
export const maxDuration = 60; // Max duration for Pro plan (Hobby is 10s, might be tight)

async function fetchFP(endpoint: string) {
    if (!API_KEY) throw new Error("Missing API Key");
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'x-api-key': API_KEY }
    });
    if (!res.ok) throw new Error(`FP Error: ${res.statusText}`);
    const json = await res.json();
    // Helper types?
    return (json as any).response || (json as any).data || (Array.isArray(json) ? json : []);
}

export async function GET() {
    try {
        if (!API_KEY) return NextResponse.json({ error: 'No API Key' }, { status: 500 });

        console.log('--- Starting Sync (API) ---');

        // 1. Sync Techs
        const fpUsers = await fetchFP('/users');
        // STRICT FILTER: Only sync data for technicians marked Active in our DB
        const dbTechs = await prisma.technician.findMany({
            where: { isActive: true }
        });
        const userMap: Record<number, any> = {};

        for (const u of fpUsers) {
            const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
            const tech = dbTechs.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (tech) userMap[u.id] = tech;
        }

        // 2. Fetch Recent Jobs (Last 7 Days to be safe/fast)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // FP might support ?updated_after=ISO, let's try strict limit instead if generic
        // Assuming limit=50 is fast enough
        const jobs = await fetchFP('/jobs?limit=50');

        const jobCounts: Record<string, any> = {};
        const customerIds = new Set<number>();
        const jobMap: Record<number, any> = {};

        for (const job of jobs) {
            if (!job.start_time) continue;
            // Date filter optimization
            if (new Date(job.updated_at || job.start_time) < sevenDaysAgo) continue;

            const wk = getWeekData(job.start_time);
            if (job.customer_id) customerIds.add(job.customer_id);
            jobMap[job.id] = job;

            if (job.assignments) {
                for (const assign of (job.assignments as any[])) {
                    const tech = userMap[assign.user_id];
                    if (tech) {
                        const key = `${tech.id}_${wk.year}_${wk.week}`;
                        if (!jobCounts[key]) jobCounts[key] = { tech, ...wk, count: 0, revenue: 0 };
                        jobCounts[key].count++;
                    }
                }
            }
        }

        // 3. Fetch Invoices for relevant Customers
        const uniqueCusts = Array.from(customerIds);
        let totalRev = 0;
        const processedInvoiceIds = new Set<string | number>();

        // Concurrent Fetch with Limit
        const batchSize = 5;
        for (let i = 0; i < uniqueCusts.length; i += batchSize) {
            const batch = uniqueCusts.slice(i, i + batchSize);
            await Promise.all(batch.map(async (custId) => {
                try {
                    const invoices = await fetchFP(`/invoices?customer_id=${custId}`);
                    for (const inv of invoices) {
                        // DEDUPLICATION:
                        if (inv.id && processedInvoiceIds.has(inv.id)) continue;
                        processedInvoiceIds.add(inv.id);

                        // Only recent invoices?
                        // if (new Date(inv.created_at) < sevenDaysAgo) continue;

                        let techId = null;
                        if (inv.assignments?.length) techId = inv.assignments[0].user_id;
                        else if (inv.team_members?.length) techId = inv.team_members[0].id;
                        else if (inv.author_id) techId = inv.author_id;
                        else if (inv.job_id && jobMap[inv.job_id]?.assignments?.length) techId = jobMap[inv.job_id].assignments[0].user_id;

                        const tech = userMap[techId];
                        if (tech && inv.total) {
                            const wk = getWeekData(inv.created_at);
                            const key = `${tech.id}_${wk.year}_${wk.week}`;
                            if (!jobCounts[key]) jobCounts[key] = { tech, ...wk, count: 0, revenue: 0 };

                            jobCounts[key].revenue += parseFloat(inv.total);
                            totalRev += parseFloat(inv.total);
                        }
                    }
                } catch (e) { /* ignore */ }
            }));
        }

        // 4. Update DB
        for (const key in jobCounts) {
            const item = jobCounts[key];
            await prisma.weeklyPerformance.upsert({
                where: {
                    technicianId_year_weekNumber: {
                        technicianId: item.tech.id,
                        year: item.year,
                        weekNumber: item.week
                    }
                },
                update: {
                    jobsCompleted: item.count,
                    totalRevenue: item.revenue
                },
                create: {
                    technicianId: item.tech.id,
                    year: item.year,
                    weekNumber: item.week,
                    quarter: Math.ceil(item.week / 13),
                    startDate: item.startDate,
                    endDate: item.endDate,
                    jobsCompleted: item.count,
                    totalRevenue: item.revenue,
                    reviews: 0,
                    memberships: 0
                }
            });
        }

        return NextResponse.json({ success: true, revenueSynced: totalRev, jobsSynced: jobs.length });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

function getWeekData(dateStr: string) {
    const d = new Date(dateStr);
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const year = d.getUTCFullYear();

    const startDate = new Date(year, 0, 4);
    const startDay = startDate.getDay() || 7;
    const weekStart = new Date(startDate.getTime() - (startDay - 1) * 86400000 + (week - 1) * 604800000);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return { year, week, startDate: weekStart, endDate: weekEnd };
}
