import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set');
}
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
