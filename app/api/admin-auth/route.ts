import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signAdminToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!admin || !admin.isActive) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = await signAdminToken({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
        });

        const response = NextResponse.json({ success: true });

        // Set JWT as cookie
        response.cookies.set('shs_admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
            sameSite: 'lax',
        });

        // Also we'll wipe out the legacy cookie just in case
        response.cookies.delete('shs_admin_auth');

        return response;
    } catch (error) {
        console.error("Admin Auth Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
