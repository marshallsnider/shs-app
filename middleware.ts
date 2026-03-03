import { NextRequest, NextResponse } from 'next/server';

import { verifyAdminToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin routes (but not /admin-login)
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('shs_admin_token')?.value;

        if (!token) {
            return redirectToLogin(request);
        }

        const payload = await verifyAdminToken(token);

        if (!payload) {
            return redirectToLogin(request);
        }

        // Add admin info to headers so server components/actions can read it without decoding again if they wanted to,
        // but server actions can also just read the cookie directly.
    }

    return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/admin/:path*'],
};
