import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.ADMIN_PASSWORD || 'fallback_secret_do_not_use_in_prod';
const key = new TextEncoder().encode(JWT_SECRET);

export async function signAdminToken(admin: { id: string, email: string, name: string, role: string }) {
    const alg = 'HS256';
    return new SignJWT({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
    })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as { id: string, email: string, name: string, role: string };
    } catch (e) {
        return null;
    }
}
