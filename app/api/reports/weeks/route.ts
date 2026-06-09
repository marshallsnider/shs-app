import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Require a valid admin session (defense-in-depth alongside middleware).
    const adminToken = request.cookies.get('shs_admin_token')?.value;
    const caller = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!caller) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return all distinct year/weekNumber pairs, newest first
    const weeks = await prisma.weeklyPerformance.findMany({
        select: { year: true, weekNumber: true },
        distinct: ['year', 'weekNumber'],
        orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    });

    return NextResponse.json(weeks);
}
