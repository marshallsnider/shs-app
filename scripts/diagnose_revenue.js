/**
 * Diagnostic script: Inspect Field Pulse jobs, invoices, and revenue mapping
 * Run: node scripts/diagnose_revenue.js
 */

const API_KEY = "4TYcFyl5cC4SK4gvzOPCv37KEczLKmma74J3yQMa";
const BASE_URL = "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

async function fetchFP(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'x-api-key': API_KEY }
    });
    if (!res.ok) throw new Error(`FP Error ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return json.response || json.data || (Array.isArray(json) ? json : []);
}

async function main() {
    console.log("=== FIELD PULSE REVENUE DIAGNOSTIC ===\n");

    // 1. Fetch users
    console.log("--- USERS ---");
    const users = await fetchFP('/users');
    const userById = {};
    for (const u of users) {
        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        userById[u.id] = name;
        console.log(`  User ID ${u.id}: ${name} (role: ${u.role || 'unknown'})`);
    }

    // 2. Fetch recent jobs
    console.log("\n--- RECENT JOBS (limit=50) ---");
    const jobs = await fetchFP('/jobs?limit=50');
    console.log(`  Total jobs returned: ${jobs.length}`);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentJobs = [];
    for (const job of jobs) {
        const jobDate = new Date(job.start_time || job.created_at);
        const isRecent = jobDate >= sevenDaysAgo;

        console.log(`\n  Job #${job.id} — "${job.title || job.description || 'No title'}"`);
        console.log(`    Status: ${job.status || 'unknown'}`);
        console.log(`    Start: ${job.start_time || 'none'} | Updated: ${job.updated_at || 'none'}`);
        console.log(`    Customer ID: ${job.customer_id || 'none'}`);
        console.log(`    Recent (last 7 days): ${isRecent}`);

        // Assignments
        if (job.assignments?.length) {
            for (const a of job.assignments) {
                console.log(`    Assigned to: User ${a.user_id} (${userById[a.user_id] || 'unknown'})`);
            }
        } else {
            console.log(`    Assignments: NONE`);
        }

        // Check for amount/total fields on the job itself
        const moneyFields = ['total', 'amount', 'price', 'revenue', 'invoice_total', 'grand_total'];
        for (const f of moneyFields) {
            if (job[f] !== undefined) console.log(`    ${f}: ${job[f]}`);
        }

        if (isRecent) recentJobs.push(job);
    }

    // 3. Fetch invoices
    console.log("\n\n--- INVOICES (limit=50) ---");
    let invoices = [];
    try {
        invoices = await fetchFP('/invoices?limit=50');
        console.log(`  Total invoices returned: ${invoices.length}`);
    } catch (e) {
        console.log(`  Error fetching invoices: ${e.message}`);
    }

    for (const inv of invoices) {
        console.log(`\n  Invoice #${inv.id}`);
        console.log(`    Total: ${inv.total || 'NONE'} | Amount: ${inv.amount || 'NONE'}`);
        console.log(`    Status: ${inv.status || 'unknown'}`);
        console.log(`    Created: ${inv.created_at || 'none'}`);
        console.log(`    Customer ID: ${inv.customer_id || 'none'}`);
        console.log(`    Job ID: ${inv.job_id || 'NONE'}`);

        if (inv.assignments?.length) {
            for (const a of inv.assignments) console.log(`    Assignment: User ${a.user_id} (${userById[a.user_id] || 'unknown'})`);
        }
        if (inv.team_members?.length) {
            for (const m of inv.team_members) console.log(`    Team Member: ID ${m.id} (${userById[m.id] || 'unknown'})`);
        }
        if (inv.author_id) console.log(`    Author: ${inv.author_id} (${userById[inv.author_id] || 'unknown'})`);
    }

    // 4. Check by customer ID matching
    console.log("\n\n--- CUSTOMER-BASED INVOICE MATCHING ---");
    const customerIds = new Set(recentJobs.map(j => j.customer_id).filter(Boolean));
    console.log(`  Unique customer IDs from recent jobs: ${[...customerIds].join(', ') || 'NONE'}`);

    for (const custId of customerIds) {
        console.log(`\n  Checking invoices for customer ${custId}...`);
        try {
            const custInvoices = await fetchFP(`/invoices?customer_id=${custId}`);
            console.log(`    Found ${custInvoices.length} invoices`);
            for (const inv of custInvoices) {
                console.log(`    Invoice #${inv.id}: total=${inv.total || 'NONE'}, status=${inv.status || 'unknown'}, job_id=${inv.job_id || 'NONE'}`);
            }
        } catch (e) {
            console.log(`    Error: ${e.message}`);
        }
    }

    // 5. Try /estimates endpoint too
    console.log("\n\n--- ESTIMATES (checking if revenue is here instead) ---");
    try {
        const estimates = await fetchFP('/estimates?limit=20');
        console.log(`  Total estimates returned: ${estimates.length}`);
        for (const est of estimates.slice(0, 5)) {
            console.log(`  Estimate #${est.id}: total=${est.total || est.amount || 'NONE'}, status=${est.status || 'unknown'}, customer=${est.customer_id || 'none'}`);
        }
    } catch (e) {
        console.log(`  Estimates endpoint: ${e.message}`);
    }

    console.log("\n=== DIAGNOSTIC COMPLETE ===");
}

main().catch(e => console.error("Fatal:", e));
