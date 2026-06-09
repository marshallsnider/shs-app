import { NextResponse, NextRequest } from 'next/server';
import webpush from 'web-push';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Estimate follow-up reminder push.
// Scheduled hourly on weekdays (vercel.json: "0 * * * 1-5"); the handler
// itself decides whether to send by computing the *Pacific* hour, so the
// 11 AM / 3 PM PT targets stay correct year-round across DST without any
// manual UTC adjustment. Vercel cron runs in UTC and does NOT observe DST,
// which is exactly why we gate on the local hour instead of a fixed time.

const REMINDER_TITLE = 'SHS';
const REMINDER_BODY = 'Follow-up calls due. Knock out your estimate follow-ups.';
const SEND_HOURS = [11, 15]; // 11 AM and 3 PM Pacific

// Current hour (0-23) in America/Los_Angeles, DST-aware via Intl.
function pacificHour(): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '0';
    // '24' can appear for midnight in some runtimes; normalize to 0.
    const hour = parseInt(hourPart, 10) % 24;
    return Number.isNaN(hour) ? -1 : hour;
}

export async function GET(request: NextRequest) {
    try {
        // --- Auth: identical pattern to /api/sync ---
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = request.headers.get('authorization');
        const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`;

        const adminToken = request.cookies.get('shs_admin_token')?.value;
        const caller = adminToken ? await verifyAdminToken(adminToken) : null;

        if (!isCron && !caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Manual test hook: ?force=1 bypasses the hour check, but only for an
        // authenticated admin (never via cron). Lets you fire a send on demand.
        const force = request.nextUrl.searchParams.get('force') === '1' && !!caller;

        // --- VAPID config ---
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const subject = process.env.VAPID_SUBJECT;
        if (!publicKey || !privateKey || !subject) {
            console.error('[REMINDERS] Missing VAPID env vars; cannot send.');
            return NextResponse.json({ error: 'Push not configured' }, { status: 500 });
        }
        webpush.setVapidDetails(subject, publicKey, privateKey);

        // --- Hour gate (skipped when forced) ---
        const hour = pacificHour();
        if (!force && !SEND_HOURS.includes(hour)) {
            console.log(`[REMINDERS] Skipped — Pacific hour ${hour} not in ${SEND_HOURS.join('/')}.`);
            return NextResponse.json({ success: true, skipped: true, pacificHour: hour });
        }

        const subs = await prisma.pushSubscription.findMany();
        const payload = JSON.stringify({ title: REMINDER_TITLE, body: REMINDER_BODY, url: '/' });

        let sent = 0;
        let pruned = 0;
        let errored = 0;

        // One failure must not abort the whole loop.
        for (const sub of subs) {
            try {
                await webpush.sendNotification(sub.subscription as unknown as webpush.PushSubscription, payload);
                sent++;
            } catch (err) {
                const statusCode = (err as { statusCode?: number })?.statusCode;
                if (statusCode === 404 || statusCode === 410) {
                    // Endpoint gone (device unsubscribed) — prune the row.
                    await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
                    pruned++;
                } else {
                    errored++;
                    const message = err instanceof Error ? err.message : String(err);
                    console.error(`[REMINDERS] send failed (status ${statusCode ?? 'n/a'}):`, message);
                }
            }
        }

        // One-line run summary so a silently broken send is noticeable.
        console.log(
            `[REMINDERS] hour=${hour} force=${force} total=${subs.length} sent=${sent} pruned=${pruned} errored=${errored}`
        );

        return NextResponse.json({
            success: true,
            pacificHour: hour,
            forced: force,
            total: subs.length,
            sent,
            pruned,
            errored,
        });
    } catch (error) {
        console.error('[REMINDERS] error:', error);
        return NextResponse.json({ error: 'Reminder run failed' }, { status: 500 });
    }
}
