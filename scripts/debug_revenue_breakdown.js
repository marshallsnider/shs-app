const fs = require('fs');
const path = require('path');

// Manually load .env.production.local
try {
    const envPath = path.resolve(process.cwd(), '.env.production.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) process.env[key.trim()] = val.join('=').trim();
    });
} catch (e) { console.error('Env load failed', e); }

const API_KEY = process.env.FIELD_PULSE_API_KEY;
const BASE_URL = process.env.FIELD_PULSE_BASE_URL || "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

if (!API_KEY) process.exit(1);

async function fetchFP(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers: { 'x-api-key': API_KEY } });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
    const json = await res.json();
    return json.response || json.data || (Array.isArray(json) ? json : []);
}

async function debug() {
    console.log('--- DEBUG REVENUE BREAKDOWN ---');

    // 1. Defined Techs
    // Hardcoded list based on user request to ensure matching
    const TARGET_TECHS = [
        "Trevor Pursel", "Kevin McFarland", "Jarrod Judge", "Tony Carranza", "Alex Robles", "Marshall Snider"
    ];

    const fpUsers = await fetchFP('/users');
    const userMap = {};
    const reverseMap = {};

    for (const u of fpUsers) {
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        // Check if target
        const isTarget = TARGET_TECHS.some(t => t.toLowerCase() === name.toLowerCase());
        if (isTarget) {
            userMap[u.id] = name;
            reverseMap[name] = u.id;
            console.log(`Matched Tech: ${name} (ID: ${u.id})`);
        }
    }

    // 2. Fetch Jobs
    const jobs = await fetchFP('/jobs?limit=100');
    const jobCounts = {}; // { name: { count, revenue } }
    const customerIds = new Set();
    const jobMap = {};

    for (const job of jobs) {
        if (!job.start_time) continue;

        let hasActiveTech = false;

        if (job.assignments) {
            for (const assign of job.assignments) {
                const name = userMap[assign.user_id];
                if (name) {
                    if (!jobCounts[name]) jobCounts[name] = { count: 0, revenue: 0 };
                    jobCounts[name].count++;
                    hasActiveTech = true;
                }
            }
        }

        if (hasActiveTech && job.customer_id) customerIds.add(job.customer_id);
        jobMap[job.id] = job;
    }

    // 3. Fetch Invoices
    const uniqueCusts = Array.from(customerIds);
    console.log(`Checking ${uniqueCusts.length} customers...`);

    const LIMIT = 10;

    async function processCust(custId) {
        try {
            const invoices = await fetchFP(`/invoices?customer_id=${custId}`);
            for (const inv of invoices) {
                let techId = null;
                if (inv.assignments?.length > 0) techId = inv.assignments[0].user_id;
                else if (inv.team_members?.length > 0) techId = inv.team_members[0].id || inv.team_members[0].user_id;
                else if (inv.job_id && jobMap[inv.job_id]?.assignments?.length > 0) techId = jobMap[inv.job_id].assignments[0].user_id;

                const name = userMap[techId];
                if (name && inv.total) {
                    if (!jobCounts[name]) jobCounts[name] = { count: 0, revenue: 0 };
                    jobCounts[name].revenue += parseFloat(inv.total || 0);

                    if (parseFloat(inv.total) > 10000) {
                        console.log(`\n  [LARGE INVOICE] $${inv.total} - ${name} (Inv# ${inv.invoice_number})`);
                        // Dump Job Details if available
                        if (inv.job_id && jobMap[inv.job_id]) {
                            const j = jobMap[inv.job_id];
                            console.log(`    Job ID: ${j.id}`);
                            console.log(`    Job Type: ${j.job_type}`); // Key field?
                            console.log(`    Title: ${j.title}`);
                            console.log(`    Tags: ${JSON.stringify(j.tags)}`);
                            console.log(`    Status: ${j.status_id} (${j.status})`);
                            console.log(`    Assignments: ${JSON.stringify(j.assignments.map(a => a.user_id))}`);
                        }
                    }
                }
            }
        } catch (e) { /* ignore */ }
    }

    for (let i = 0; i < uniqueCusts.length; i += LIMIT) {
        const batch = uniqueCusts.slice(i, i + LIMIT);
        await Promise.all(batch.map(processCust));
        process.stdout.write('.');
    }

    console.log('\n\n--- RESULTS ---');
    let total = 0;
    for (const name in jobCounts) {
        const d = jobCounts[name];
        console.log(`${name}: $${d.revenue.toFixed(2)} (${d.count} Jobs)`);
        total += d.revenue;
    }
    console.log(`TOTAL: $${total.toFixed(2)}`);
}

debug();
