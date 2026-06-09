import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Saves (upserts) a technician's Web Push subscription.
// Auth is enforced in-handler (this route is on the middleware
// PUBLIC_API_ROUTES allowlist) using the httpOnly shs_tech_id login
// cookie — the authoritative identity. The technicianId in the body is
// accepted but must match the cookie, so a logged-in tech cannot
// subscribe on someone else's behalf. Dedupes on endpoint: re-subscribing
// from the same device replaces the row rather than duplicating it.
export async function POST(request: NextRequest) {
    try {
        const cookieTechId = request.cookies.get('shs_tech_id')?.value;
        if (!cookieTechId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const subscription = body?.subscription;
        const bodyTechId = body?.technicianId;

        if (!subscription || typeof subscription.endpoint !== 'string') {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Use the cookie as the source of truth; reject mismatches.
        if (bodyTechId && bodyTechId !== cookieTechId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const technicianId = cookieTechId;

        // Guard against a stale cookie pointing at a deleted technician.
        const tech = await prisma.technician.findUnique({
            where: { id: technicianId },
            select: { id: true },
        });
        if (!tech) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const endpoint: string = subscription.endpoint;

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            create: { technicianId, endpoint, subscription },
            update: { technicianId, subscription },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[push] subscribe error:', error);
        return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
}
