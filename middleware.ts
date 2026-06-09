import { NextRequest, NextResponse } from 'next/server';

import { verifyAdminToken } from './lib/auth';

// API routes that must stay reachable WITHOUT an admin session:
// - /api/admin-auth: the login endpoint itself (public by design).
// - /api/sync: authenticates itself in-handler (Vercel cron Bearer OR admin cookie),
//   so middleware must let it through or the nightly cron would be blocked.
const PUBLIC_API_ROUTES = ['/api/admin-auth', '/api/sync'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /admin pages (matcher excludes /admin-login).
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('shs_admin_token')?.value;
        const payload = token ? await verifyAdminToken(token) : null;

        if (!payload) {
            return redirectToLogin(request);
        }
    }

    // Protect API routes, except the ones that handle their own auth.
    if (
        pathname.startsWith('/api') &&
        !PUBLIC_API_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))
    ) {
        const token = request.cookies.get('shs_admin_token')?.value;
        const payload = token ? await verifyAdminToken(token) : null;

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
};
