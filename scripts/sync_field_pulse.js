// scripts/sync_field_pulse.js
// Usage: export $(grep -v '^#' .env.production.local | xargs) && node scripts/sync_field_pulse.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_KEY = process.env.FIELD_PULSE_API_KEY;
const BASE_URL = process.env.FIELD_PULSE_BASE_URL || "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

if (!API_KEY) { process.exit(1); }

async function fetchFP(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: { 'x-api-key': API_KEY } });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
    const json = await res.json();
    return json.response || json.data || (Array.isArray(json) ? json : []);
}

async function syncAll() {
    console.log('--- STARTING STRICT SYNC ---');

    // 1. Sync Techs (Active Only)
    const fpUsers = await fetchFP('/users');
    const dbTechs = await prisma.technician.findMany({ where: { isActive: true } });
    const userMap = {};

    for (const u of fpUsers) {
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        const tech = dbTechs.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (tech) userMap[u.id] = tech;
    }
    console.log(`Mapped ${Object.keys(userMap).length} Active Techs.`);

    // 2. Fetch Jobs
    const jobs = await fetchFP('/jobs?limit=100');
    const jobCounts = {};
    const customerIds = new Set();
    const jobMap = {};

    for (const job of jobs) {
        if (!job.start_time) continue;
        const wk = getWeekData(job.start_time);

        let hasActiveTech = false;

        if (job.assignments) {
            for (const assign of job.assignments) {
                const tech = userMap[assign.user_id];
                if (tech) {
                    const key = `${tech.id}_${wk.year}_${wk.week}`;
                    if (!jobCounts[key]) jobCounts[key] = { tech, ...wk, count: 0, revenue: 0 };
                    jobCounts[key].count++;
                    hasActiveTech = true;
                }
            }
        }

        // Only search invoices for customers touched by our techs
        if (hasActiveTech && job.customer_id) customerIds.add(job.customer_id);
        jobMap[job.id] = job;
    }
    console.log(`Found ${jobs.length} jobs. Checking Invoices for ${customerIds.size} relevant customers.`);

    // 3. Fetch Invoices CONCURRENTLY
    let totalRevenueFound = 0;
    const uniqueCusts = Array.from(customerIds);
    const processedInvoiceIds = new Set();

    const LIMIT = 10;

    async function processCust(custId) {
        try {
            const invoices = await fetchFP(`/invoices?customer_id=${custId}`);
            for (const inv of invoices) {
                // DEDUPLICATION:
                if (inv.id && processedInvoiceIds.has(inv.id)) continue;
                processedInvoiceIds.add(inv.id);

                let techId = null;
                // STRICT LOGIC: Assignments or Job Link. NO AUTHOR.
                if (inv.assignments?.length > 0) techId = inv.assignments[0].user_id;
                else if (inv.team_members?.length > 0) techId = inv.team_members[0].id || inv.team_members[0].user_id;
                else if (inv.job_id && jobMap[inv.job_id]?.assignments?.length > 0) techId = jobMap[inv.job_id].assignments[0].user_id;

                const tech = userMap[techId];
                if (tech && inv.total) {
                    const wk = getWeekData(inv.created_at);
                    const key = `${tech.id}_${wk.year}_${wk.week}`;
                    if (!jobCounts[key]) jobCounts[key] = { tech, ...wk, count: 0, revenue: 0 };

                    jobCounts[key].revenue += parseFloat(inv.total || 0);
                    totalRevenueFound += parseFloat(inv.total || 0);
                }
            }
        } catch (e) { /* ignore */ }
    }

    // Process in batches
    for (let i = 0; i < uniqueCusts.length; i += LIMIT) {
        const batch = uniqueCusts.slice(i, i + LIMIT);
        process.stdout.write('.');
        await Promise.all(batch.map(processCust));
    }

    console.log(`\nTotal Revenue Found (Strict): $${totalRevenueFound.toFixed(2)}`);

    // Reset current values for these active techs/weeks to 0 before upsert?
    // No, straightforward update.

    // 4. Update DB
    for (const key in jobCounts) {
        const item = jobCounts[key];
        // console.log(`Updating ${item.tech.name}: $${item.revenue.toFixed(2)}`);

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
    console.log('Database updated.');
}

function getWeekData(dateStr) {
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

syncAll()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
