import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Return all distinct year/weekNumber pairs, newest first
    const weeks = await prisma.weeklyPerformance.findMany({
        select: { year: true, weekNumber: true },
        distinct: ['year', 'weekNumber'],
        orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    });

    return NextResponse.json(weeks);
}
