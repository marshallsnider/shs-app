import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name, employeeId, isActive } = body;

        if (!id || !name?.trim()) {
            return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
        }

        // Check for duplicate employeeId (if changed)
        if (employeeId) {
            const existing = await prisma.technician.findFirst({
                where: {
                    employeeId: { equals: employeeId.trim(), mode: 'insensitive' },
                    id: { not: id },
                },
            });

            if (existing) {
                return NextResponse.json({ error: `Employee ID "${employeeId}" is already taken by ${existing.name}` }, { status: 400 });
            }
        }

        const updated = await prisma.technician.update({
            where: { id },
            data: {
                name: name.trim(),
                employeeId: employeeId?.trim() || undefined,
                isActive: Boolean(isActive),
                avatar: name.trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            },
        });

        return NextResponse.json({ success: true, technician: updated });
    } catch (error: any) {
        console.error('Update tech error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
    }
}
