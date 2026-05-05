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

    // 2. Invoice payments deep-dive — looking for the "checks not registering" issue.
    // Pull a batch of invoices, find ones with amount_unpaid > 0, dump their
    // payments[] array structure to see if checks are present but ignored.
    const invRes = await fetch(`${FIELD_PULSE_BASE_URL}/invoices?limit=50&page=1`, {
        headers: { 'x-api-key': FIELD_PULSE_API_KEY },
    });
    const invJson: any = await invRes.json();
    const invoices = invJson.response || invJson.data || [];

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
            commission_recipient_id: inv.commission_recipient_id,
            payment_count: payments.length,
            last_payment_date: inv.last_payment_date,
        });
    }

    // 3. Jobs — what's the status distribution? Are completed jobs included?
    const jobsRes = await fetch(`${FIELD_PULSE_BASE_URL}/jobs?limit=50&page=1`, {
        headers: { 'x-api-key': FIELD_PULSE_API_KEY },
    });
    const jobsJson: any = await jobsRes.json();
    const jobs = jobsJson.response || jobsJson.data || [];

    const jobStatusDist: Record<string, number> = {};
    const jobCompletedAtCount = { not_null: 0, null: 0 };
    for (const j of jobs) {
        const key = `status=${j.status} status_id=${j.status_id}`;
        jobStatusDist[key] = (jobStatusDist[key] || 0) + 1;
        if (j.completed_at) jobCompletedAtCount.not_null++;
        else jobCompletedAtCount.null++;
    }

    return NextResponse.json({
        endpoint_probes: endpointProbes,
        invoice_payment_summary: paymentSummary,
        invoice_payment_types_seen: samplePaymentsByType,
        invoices_by_customer: customerInvoiceMap,
        job_status_distribution: jobStatusDist,
        job_completed_at_count: jobCompletedAtCount,
        job_sample_count: jobs.length,
    });
}
