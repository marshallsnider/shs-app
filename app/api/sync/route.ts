import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { getISOWeek, getWeekStartDate, getWeekEndDate, getQuarterFromWeekStart } from '@/lib/week';

const FIELD_PULSE_API_KEY = process.env.FIELD_PULSE_API_KEY;
const FIELD_PULSE_BASE_URL = process.env.FIELD_PULSE_BASE_URL || "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

export const dynamic = 'force-dynamic'; // No caching
export const maxDuration = 60; // Max duration for Vercel

async function fetchFP(endpoint: string) {
    if (!FIELD_PULSE_API_KEY) throw new Error("Missing API Key");
    const res = await fetch(`${FIELD_PULSE_BASE_URL}${endpoint}`, {
        headers: { 'x-api-key': FIELD_PULSE_API_KEY }
    });
    if (!res.ok) throw new Error(`FP Error: ${res.statusText}`);
    const json = await res.json();
    return (json as any).response || (json as any).data || (Array.isArray(json) ? json : []);
}

export async function GET(request: NextRequest) {
    try {
        if (!FIELD_PULSE_API_KEY) return NextResponse.json({ error: 'No API Key' }, { status: 500 });

        // Auth: accept either the Vercel cron Bearer (CRON_SECRET) or an
        // admin cookie. Without one of these, refuse — this endpoint
        // mutates the DB and was previously open to the internet.
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization');
        const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

        const adminToken = request.cookies.get('shs_admin_token')?.value;
        const caller = adminToken ? await verifyAdminToken(adminToken) : null;

        if (!isCron && !caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`--- Starting Sync (API) [${isCron ? 'cron' : `admin:${caller?.id}`}] ---`);

        // 1. Sync Techs
        const fpUsers = await fetchFP('/users');
        const dbTechs = await prisma.technician.findMany({ where: { isActive: true } });
        const userMap: Record<number, any> = {};

        for (const u of fpUsers) {
            const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
            const tech = dbTechs.find(t => t.name.toLowerCase() === name.toLowerCase());
            if (tech) userMap[u.id] = tech;
        }

        // 2. Fetch Jobs (paginate; FP API returns 50/page max).
        // Removed 7-day updated_at filter — it was excluding completed jobs that
        // hadn't been touched in a week, causing under-counts.
        // Dedup by id defensively in case the gateway ignores the page param.
        const now = new Date();
        const jobsById = new Map<number, any>();
        for (let page = 1; page <= 10; page++) {
            try {
                const batch = await fetchFP(`/jobs?limit=50&page=${page}`);
                if (!batch.length) break;
                let added = 0;
                for (const job of batch) {
                    if (job.id && !jobsById.has(job.id)) {
                        jobsById.set(job.id, job);
                        added++;
                    }
                }
                // If a page returned data but added nothing new, the gateway
                // is repeating the same page — stop.
                if (added === 0) break;
                if (batch.length < 50) break;
            } catch (e) {
                break;
            }
        }
        const jobs = Array.from(jobsById.values());

        const jobCounts: Record<string, any> = {};
        const jobMap: Record<number, any> = {};

        for (const job of jobs) {
            if (!job.start_time) continue;
            // Skip future-dated jobs — they used to create future-week
            // performance rows that pushed the dashboard ahead a week.
            if (new Date(job.start_time) > now) continue;

            const wk = getWeekData(job.start_time);
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

        // 3. Fetch Invoices
        let totalRev = 0;
        const processedInvoiceIds = new Set<string | number>();
        let allInvoices: any[] = [];
        const techniciansProcessed = new Set<string>();

        for (let page = 1; page <= 4; page++) {
            try {
                const batch = await fetchFP(`/invoices?limit=50&page=${page}`);
                if (!batch.length) break;
                allInvoices = allInvoices.concat(batch);
                if (batch.length < 50) break;
            } catch (e) {
                break;
            }
        }

        // Track how each invoice gets attributed for one round of logs.
        // This is cheap (counters only) and confirms commission_recipient_id
        // is the primary signal we expected; can be removed in a later cleanup.
        const attributionStats = {
            commission_recipient: 0,
            invoice_assignments: 0,
            invoice_team_members: 0,
            linked_job_assignments: 0,
            unattributed_paid: 0,
        };

        for (const inv of allInvoices) {
            if (inv.id && processedInvoiceIds.has(inv.id)) continue;
            processedInvoiceIds.add(inv.id);

            // Skip invoices with no payments at all — nothing to credit.
            const payments = Array.isArray(inv.payments) ? inv.payments : [];
            if (!payments.length) continue;

            // Resolve the tech once per invoice — payments inherit attribution.
            let techId = null;
            let attributionPath: keyof typeof attributionStats | null = null;

            // PRIMARY: commission_recipient_id — FP's explicit "tech who gets
            // paid commission for this invoice." Matches Vicky's policy:
            // "the tech whose job it is gets full credit." Use this first;
            // fall back only when FP doesn't have it set.
            if (inv.commission_recipient_id) {
                techId = inv.commission_recipient_id;
                attributionPath = 'commission_recipient';
            } else if (inv.assignments?.length) {
                techId = inv.assignments[0].user_id;
                attributionPath = 'invoice_assignments';
            } else if (inv.team_members?.length) {
                techId = inv.team_members[0].id;
                attributionPath = 'invoice_team_members';
            } else if (inv.job_id && jobMap[inv.job_id]?.assignments?.length) {
                techId = jobMap[inv.job_id].assignments[0].user_id;
                attributionPath = 'linked_job_assignments';
            }

            const tech = userMap[techId];
            if (!tech) {
                if (techId === null) attributionStats.unattributed_paid++;
                continue;
            }

            if (attributionPath) attributionStats[attributionPath]++;
            techniciansProcessed.add(tech.name);

            // Credit each payment to the week it was RECEIVED, not the week
            // the invoice was created. Vicky's collection-based mental model:
            // an invoice created in Week 16 but paid in Week 18 belongs to
            // Week 18 (when the cash actually came in). Naturally handles
            // partial payments split across weeks.
            for (const p of payments) {
                const amt = parseFloat(p.amount ?? '0');
                if (!amt) continue;
                const paymentDate = p.payment_date || inv.last_payment_date || inv.created_at;
                if (!paymentDate) continue;
                const wk = getWeekData(paymentDate);
                const key = `${tech.id}_${wk.year}_${wk.week}`;
                if (!jobCounts[key]) jobCounts[key] = { tech, ...wk, count: 0, revenue: 0 };
                jobCounts[key].revenue += amt;
                totalRev += amt;
            }
        }

        console.log('[SYNC] Attribution distribution:', JSON.stringify(attributionStats));

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
                    quarter: getQuarterFromWeekStart(item.year, item.week),
                    startDate: item.startDate,
                    endDate: item.endDate,
                    jobsCompleted: item.count,
                    totalRevenue: item.revenue,
                    reviews: 0,
                    memberships: 0
                }
            });
        }

        // 5. Track Audit Log (only for admin-triggered syncs — cron has no adminId).
        if (caller) {
            await prisma.auditLog.create({
                data: {
                    adminId: caller.id,
                    action: "SYNC_FIELDPULSE",
                    details: JSON.stringify({
                        totalInvoices: allInvoices.length,
                        totalJobs: jobs.length,
                        techniciansProcessed: techniciansProcessed.size,
                    }),
                },
            });
        }

        return NextResponse.json({
            success: true,
            syncedJobs: jobs.length,
            syncedInvoices: allInvoices.length,
            techniciansProcessed: Array.from(techniciansProcessed)
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

function getWeekData(dateStr: string) {
    const d = new Date(dateStr);
    const { year, weekNumber: week } = getISOWeek(d);
    const startDate = getWeekStartDate(year, week);
    const endDate = getWeekEndDate(year, week);
    return { year, week, startDate, endDate };
}
