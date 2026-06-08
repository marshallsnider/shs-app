/**
 * Commercial / net-terms accounts.
 *
 * These accounts (Qmerit, Vixxo, Treehouse, NJ Glass & Metal, Bluewater
 * Facility) invoice now and pay weeks later through their own accounts-payable
 * cycle. Under the standard rules the app only credits revenue when a payment
 * is received, so this work stays invisible in the weekly report until the AP
 * check eventually lands. For these accounts we instead recognize the pre-tax
 * subtotal in the week the invoice was FINALIZED (FieldPulse "Invoiced"),
 * regardless of payment, and we exclude them from the payment-based path so the
 * same revenue never counts twice when the check later arrives.
 *
 * IDENTIFICATION is by FieldPulse's related-customer (parent / child) link, the
 * relationship Victoria maintains in the customer section. Each commercial job
 * is a child customer whose `parent_id` points at the account's parent record
 * (verified 2026-06-08). We read that relationship rather than a name string,
 * so a typo or rename can't break it, and a customer's OWN standalone record
 * (personal work they hire us for directly) is correctly NOT treated as
 * commercial.
 *
 * Per Victoria (2026-06-08): these count toward the tech bonus.
 *
 * To add an account later: add its parent customer id below. No other change.
 */
export const COMMERCIAL_ACCOUNT_PARENT_IDS: Record<number, string> = {
    10386303: 'Qmerit',
    10732973: 'Vixxo',
    10733555: 'Treehouse',
    15549954: 'NJ Glass & Metal',
    14657818: 'Bluewater Facility',
};

/**
 * Only recognize commercial invoices finalized on or after this date, compared
 * against the invoice's `invoiced_date` (YYYY-MM-DD...). Keeps the feature from
 * silently restating months of older history and reopening past bonuses.
 * Set 2026-06-08 to cover "last month plus current" (May + June 2026).
 * Move this forward or back to change the window.
 */
export const COMMERCIAL_RECOGNITION_START = '2026-05-01';

/**
 * FieldPulse invoice status codes that mean the invoice has been finalized
 * (issued to the customer), regardless of payment. Confirmed against live data
 * 2026-06-08: 3 = Invoiced (unpaid), 4 = Paid, 5 = Partial, 6 = Past Due.
 * Drafts / estimates / voids (e.g. 2, -1) are intentionally excluded.
 */
export const FINALIZED_INVOICE_STATUSES = new Set<number>([3, 4, 5, 6]);

/**
 * True when an invoice's customer belongs to one of the commercial accounts,
 * either as a related (child) customer or as the account record itself.
 */
export function isCommercialCustomer(customer: any): boolean {
    if (!customer) return false;
    const parentId = Number(customer.parent_id);
    if (parentId && COMMERCIAL_ACCOUNT_PARENT_IDS[parentId]) return true;
    const id = Number(customer.id);
    if (id && COMMERCIAL_ACCOUNT_PARENT_IDS[id]) return true;
    return false;
}

/** True when an invoice has been finalized (issued), regardless of payment. */
export function isFinalizedInvoice(invoice: any): boolean {
    return FINALIZED_INVOICE_STATUSES.has(Number(invoice?.status));
}

/**
 * For commercial accounts, credit the tech who DID THE WORK: the field tech on
 * the linked job, falling back to invoice-level assignments / team members. The
 * invoice's commission_recipient is intentionally NOT used here, because on
 * these accounts it is usually dispatch/office (e.g. Victoria), not the field
 * tech. Returns the matched active technician (from userMap) or null when no
 * tracked field tech can be found (caller should then skip the invoice).
 */
export function resolveCommercialTech(
    invoice: any,
    jobMap: Record<number, any>,
    userMap: Record<number, any>
): any | null {
    const job = invoice?.job_id ? jobMap[invoice.job_id] : null;
    const candidates: any[] = [];
    if (Array.isArray(job?.assignments)) for (const a of job.assignments) candidates.push(a?.user_id);
    if (Array.isArray(invoice?.assignments)) for (const a of invoice.assignments) candidates.push(a?.user_id);
    if (Array.isArray(invoice?.team_members)) for (const a of invoice.team_members) candidates.push(a?.id);
    for (const uid of candidates) {
        if (uid != null && userMap[uid]) return userMap[uid];
    }
    return null;
}
