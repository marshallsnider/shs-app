import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

const FIELD_PULSE_API_KEY = process.env.FIELD_PULSE_API_KEY;
const FIELD_PULSE_BASE_URL = process.env.FIELD_PULSE_BASE_URL || "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com/stage";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Read-only diagnostic endpoint to answer three open questions:
 *   1. What FP API endpoints are accessible to us?
 *   2. Why aren't check payments registering as paid? (Vicky: $1,593 missing for Jarrod)
 *   3. Are unfiltered jobs all being pulled?
 *
 * Same auth as /api/sync (cron Bearer or admin cookie). Does NOT mutate the DB.
 */

async function probe(endpoint: string): Promise<{ endpoint: string; status: number; sampleKeys?: string[]; count?: number; error?: string }> {
    try {
        const res = await fetch(`${FIELD_PULSE_BASE_URL}${endpoint}`, {
            headers: { 'x-api-key': FIELD_PULSE_API_KEY! },
        });
        if (!res.ok) {
            return { endpoint, status: res.status };
        }
        const json: any = await res.json();
        const items = json.response || json.data || (Array.isArray(json) ? json : []);
        const result: any = { endpoint, status: res.status, count: Array.isArray(items) ? items.length : 1 };
        if (Array.isArray(items) && items[0] && typeof items[0] === 'object') {
            result.sampleKeys = Object.keys(items[0]).sort();
        } else if (!Array.isArray(items) && items && typeof items === 'object') {
            result.sampleKeys = Object.keys(items).sort();
        }
        return result;
    } catch (e) {
        return { endpoint, status: 0, error: (e as Error).message };
    }
}

export async function GET(request: NextRequest) {
    if (!FIELD_PULSE_API_KEY) return NextResponse.json({ error: 'No API Key' }, { status: 500 });

    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;
    const adminToken = request.cookies.get('shs_admin_token')?.value;
    const caller = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!isCron && !caller) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Endpoint discovery — try a wide set, see what comes back.
    const candidateEndpoints = [
        '/users', '/jobs', '/invoices', '/customers', '/estimates',
        '/payments', '/payins', '/transactions', '/payouts',
        '/companies', '/teams', '/items', '/products',
        '/timesheets', '/time-entries',
        '/notes', '/files', '/tasks',
        '/maintenance-agreements', '/pricebook',
    ];
    const endpointProbes = await Promise.all(candidateEndpoints.map(ep => probe(`${ep}?limit=1`)));

    // 2. Build user_id -> name lookup (needed to interpret commission_recipient_id).
    const usersRes = await fetch(`${FIELD_PULSE_BASE_URL}/users?limit=200`, {
        headers: { 'x-api-key': FIELD_PULSE_API_KEY },
    });
    const usersJson: any = await usersRes.json();
    const users = usersJson.response || usersJson.data || [];
    const userIdToName: Record<string, string> = {};
    for (const u of users) {
        userIdToName[u.id] = `${u.first_name || ''} ${u.last_name || ''}`.trim() || `id:${u.id}`;
    }

    // 3. Invoice deep-dive across MORE pages so we see things our sync sees.
    const invoices: any[] = [];
    for (let page = 1; page <= 4; page++) {
        try {
            const r = await fetch(`${FIELD_PULSE_BASE_URL}/invoices?limit=50&page=${page}`, {
                headers: { 'x-api-key': FIELD_PULSE_API_KEY },
            });
            const j: any = await r.json();
            const batch = j.response || j.data || [];
            if (!batch.length) break;
            invoices.push(...batch);
            if (batch.length < 50) break;
        } catch (e) { break; }
    }

    const paymentSummary = {
        total_invoices: invoices.length,
        with_amount_paid: 0,
        with_amount_unpaid: 0,
        with_payments_array: 0,
        with_amount_paid_but_no_payments: 0,
        with_payments_but_no_amount_paid: 0,
    };
    const samplePaymentsByType: Record<string, any> = {};
    const customerInvoiceMap: Record<string, any[]> = {};

    for (const inv of invoices) {
        const amountPaid = parseFloat(inv.amount_paid || '0');
        const amountUnpaid = parseFloat(inv.amount_unpaid || '0');
        const payments = Array.isArray(inv.payments) ? inv.payments : [];
        if (amountPaid > 0) paymentSummary.with_amount_paid++;
        if (amountUnpaid > 0) paymentSummary.with_amount_unpaid++;
        if (payments.length > 0) paymentSummary.with_payments_array++;
        if (amountPaid > 0 && payments.length === 0) paymentSummary.with_amount_paid_but_no_payments++;
        if (amountPaid === 0 && payments.length > 0) paymentSummary.with_payments_but_no_amount_paid++;

        // Track payment types we see
        for (const p of payments) {
            const t = p.payment_method || p.method || p.type || 'unknown';
            if (!samplePaymentsByType[t]) {
                samplePaymentsByType[t] = { sample: p, keys: Object.keys(p).sort() };
            }
        }

        // Group by customer name to find CJ Lucas (Vicky's example)
        const custName = inv.customer?.display_name
            || inv.customer?.name
            || (inv.customer?.first_name && `${inv.customer.first_name} ${inv.customer.last_name || ''}`.trim())
            || `id:${inv.customer_id}`;
        if (!customerInvoiceMap[custName]) customerInvoiceMap[custName] = [];
        customerInvoiceMap[custName].push({
            id: inv.id,
            total: inv.total,
            amount_paid: inv.amount_paid,
            amount_unpaid: inv.amount_unpaid,
            created_at: inv.created_at,
            invoiced_date: inv.invoiced_date,
            first_payment_date: inv.first_payment_date,
            last_payment_date: inv.last_payment_date,
            commission_recipient_id: inv.commission_recipient_id,
            commission_recipient_name: inv.commission_recipient_id ? (userIdToName[inv.commission_recipient_id] || 'UNKNOWN_USER_ID') : null,
            payment_methods: payments.map((p: any) => ({ method: p.method || p.payment_method, amount: p.amount, payment_date: p.payment_date })),
        });
    }

    // 4. Jobs — same pagination depth as the real sync (10 pages × 50)
    // so we see exactly what /api/sync sees. Then break down per tech.
    const allJobs: any[] = [];
    for (let page = 1; page <= 10; page++) {
        try {
            const r = await fetch(`${FIELD_PULSE_BASE_URL}/jobs?limit=50&page=${page}`, {
                headers: { 'x-api-key': FIELD_PULSE_API_KEY },
            });
            const j: any = await r.json();
            const batch = j.response || j.data || [];
            if (!batch.length) break;
            allJobs.push(...batch);
            if (batch.length < 50) break;
        } catch (e) { break; }
    }

    const jobStatusDist: Record<string, number> = {};
    const jobCompletedAtCount = { not_null: 0, null: 0 };
    const now = new Date();
    for (const j of allJobs) {
        const key = `status=${j.status} status_id=${j.status_id}`;
        jobStatusDist[key] = (jobStatusDist[key] || 0) + 1;
        if (j.completed_at) jobCompletedAtCount.not_null++;
        else jobCompletedAtCount.null++;
    }

    // 5. Per-tech job breakdown — for each active tech (matched by name),
    // list every job in our pull where they appear in assignments. Flag
    // why each job would be included or excluded by the current sync rules.
    const targetTechs: Record<number, string> = {};
    const dbTechNames = ['Trevor Pursel', 'Jarrod Judge', 'Kevin McFarland'];
    for (const u of users) {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        if (dbTechNames.includes(fullName)) targetTechs[u.id] = fullName;
    }

    // Build customer_id -> name lookup so we can match Vicky's by-name lists.
    const customerIdToName: Record<string, string> = {};
    for (let page = 1; page <= 30; page++) {
        try {
            const r = await fetch(`${FIELD_PULSE_BASE_URL}/customers?limit=100&page=${page}`, {
                headers: { 'x-api-key': FIELD_PULSE_API_KEY },
            });
            const j: any = await r.json();
            const batch = j.response || j.data || [];
            if (!batch.length) break;
            for (const c of batch) {
                const nm = c.display_name
                    || c.company_name
                    || `${c.first_name || ''} ${c.last_name || ''}`.trim()
                    || `id:${c.id}`;
                customerIdToName[c.id] = nm;
            }
            if (batch.length < 100) break;
        } catch (e) { break; }
    }

    const jobsByTech: Record<string, any[]> = {};
    for (const j of allJobs) {
        if (!Array.isArray(j.assignments)) continue;
        for (const a of j.assignments) {
            const techName = targetTechs[a.user_id];
            if (!techName) continue;
            if (!jobsByTech[techName]) jobsByTech[techName] = [];
            const startTimeDate = j.start_time ? new Date(j.start_time) : null;
            const isFuture = startTimeDate ? startTimeDate > now : false;
            const reasonExcluded =
                !j.start_time ? 'no_start_time' :
                isFuture ? 'future_start_time' :
                null;
            jobsByTech[techName].push({
                id: j.id,
                status: j.status,
                status_id: j.status_id,
                start_time: j.start_time,
                end_time: j.end_time,
                completed_at: j.completed_at,
                deleted_at: j.deleted_at,
                customer_id: j.customer_id,
                customer_name: customerIdToName[j.customer_id] || `unknown(${j.customer_id})`,
                assignment_count: j.assignments.length,
                included_by_current_sync: reasonExcluded === null,
                excluded_reason: reasonExcluded,
            });
        }
    }
    // Sort each tech's jobs by start_time desc for easier scanning
    for (const k of Object.keys(jobsByTech)) {
        jobsByTech[k].sort((a, b) => (b.start_time || '').localeCompare(a.start_time || ''));
    }

    // 6. For each name Vicky listed for Trevor's Week 18, find their
    // customer record + ALL their jobs in our 500-job pull (regardless of
    // assignee or week) — so we can see if the job exists at all.
    const vickyTrevorWk18Names = ['Christina Cox', 'Mike Wolfington', 'Karen Woodbyrne', 'Jeremy Jones', 'Joseph Cooks-Giles'];
    const vickyCustomerLookup: Record<string, any> = {};
    for (const name of vickyTrevorWk18Names) {
        // Try matching against our pulled customers
        let matches = Object.entries(customerIdToName).filter(([_id, n]) =>
            n.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(n.toLowerCase())
        );
        // If not found in pulled customers, try a direct name search via FP.
        if (matches.length === 0) {
            try {
                const sr = await fetch(`${FIELD_PULSE_BASE_URL}/customers?search=${encodeURIComponent(name)}&limit=10`, {
                    headers: { 'x-api-key': FIELD_PULSE_API_KEY },
                });
                const sj: any = await sr.json();
                const sBatch = sj.response || sj.data || [];
                for (const c of sBatch) {
                    const nm = c.display_name || c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || `id:${c.id}`;
                    customerIdToName[c.id] = nm;
                }
                matches = Object.entries(customerIdToName).filter(([_id, n]) =>
                    n.toLowerCase().includes(name.toLowerCase()) ||
                    name.toLowerCase().includes(n.toLowerCase())
                );
            } catch (e) { /* ignore */ }
        }
        if (matches.length === 0) {
            vickyCustomerLookup[name] = { found: false, note: 'not in customer pull or search' };
            continue;
        }
        const [custId, custName] = matches[0];
        const allJobsForCustomer = allJobs
            .filter(j => String(j.customer_id) === custId)
            .map(j => ({
                id: j.id,
                start_time: j.start_time,
                status: j.status,
                status_id: j.status_id,
                completed_at: j.completed_at,
                assignment_count: Array.isArray(j.assignments) ? j.assignments.length : 0,
                assigned_user_ids: Array.isArray(j.assignments) ? j.assignments.map((a: any) => a.user_id) : [],
                trevor_assigned: Array.isArray(j.assignments) ? j.assignments.some((a: any) => a.user_id === 234120) : false,
            }))
            .sort((a, b) => (b.start_time || '').localeCompare(a.start_time || ''));
        vickyCustomerLookup[name] = {
            found: true,
            customer_id: custId,
            matched_to: custName,
            all_jobs_in_pull: allJobsForCustomer,
            all_jobs_in_pull_count: allJobsForCustomer.length,
        };
    }

    return NextResponse.json({
        endpoint_probes: endpointProbes,
        invoice_payment_summary: paymentSummary,
        invoice_payment_types_seen: samplePaymentsByType,
        invoices_by_customer: customerInvoiceMap,
        job_status_distribution: jobStatusDist,
        job_completed_at_count: jobCompletedAtCount,
        total_jobs_pulled: allJobs.length,
        active_techs_resolved: targetTechs,
        total_customers_pulled: Object.keys(customerIdToName).length,
        vicky_trevor_wk18_lookup: vickyCustomerLookup,
        jobs_by_tech: jobsByTech,
    });
}
