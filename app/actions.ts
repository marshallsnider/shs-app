'use server';

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";
import { getWeekStartDate, getWeekEndDate, getQuarterFromWeekStart } from "@/lib/week";
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth";
import bcrypt from 'bcryptjs';

async function getAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('shs_admin_token')?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete('shs_admin_token');
    redirect('/admin-login');
}

export async function loginTechnician(name: string, password: string) {
    const tech = await prisma.technician.findFirst({
        where: {
            name: {
                equals: name.trim(),
                mode: 'insensitive'
            },
            isActive: true,
        }
    });

    if (!tech) {
        return { success: false, error: 'No account found with that name' };
    }

    // No password set yet — send to setup
    if (!tech.passwordHash) {
        return { success: false, needsSetup: true, techId: tech.id };
    }

    // Verify password
    const valid = await bcrypt.compare(password, tech.passwordHash);
    if (!valid) {
        return { success: false, error: 'Incorrect password' };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('shs_tech_id', tech.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });

    return { success: true };
}

export async function setupTechPassword(techId: string, password: string) {
    if (password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters' };
    }

    const tech = await prisma.technician.findUnique({ where: { id: techId } });
    if (!tech) {
        return { success: false, error: 'Technician not found' };
    }

    // Only allow setup if no password exists (first time or admin reset)
    if (tech.passwordHash) {
        return { success: false, error: 'Password already set. Use change password instead.' };
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.technician.update({
        where: { id: techId },
        data: { passwordHash: hash },
    });

    // Log them in
    const cookieStore = await cookies();
    cookieStore.set('shs_tech_id', tech.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    });

    return { success: true };
}

export async function changeTechPassword(currentPassword: string, newPassword: string) {
    const cookieStore = await cookies();
    const techId = cookieStore.get('shs_tech_id')?.value;
    if (!techId) return { success: false, error: 'Not logged in' };

    if (newPassword.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters' };
    }

    const tech = await prisma.technician.findUnique({ where: { id: techId } });
    if (!tech || !tech.passwordHash) {
        return { success: false, error: 'Account not found' };
    }

    const valid = await bcrypt.compare(currentPassword, tech.passwordHash);
    if (!valid) {
        return { success: false, error: 'Current password is incorrect' };
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.technician.update({
        where: { id: techId },
        data: { passwordHash: hash },
    });

    return { success: true };
}

export async function adminResetTechPassword(techId: string) {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: 'Not authorized' };

    await prisma.technician.update({
        where: { id: techId },
        data: { passwordHash: null },
    });

    if (admin) {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: "RESET_TECH_PASSWORD",
                targetId: techId,
            }
        });
    }

    revalidatePath('/admin/technicians');
    return { success: true };
}

// --- Technician Management ---

export async function createTechnician(formData: FormData) {
    const name = formData.get("name") as string;
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    // Generate simple ID: Initials + Random 3 digits
    const randomNum = Math.floor(100 + Math.random() * 900);
    const employeeId = `${initials}-${randomNum}`;

    const admin = await getAdminSession();
    const lastModifiedBy = admin?.id;

    const newTech = await prisma.technician.create({
        data: {
            name,
            employeeId, // e.g. MS-123
            avatar: initials,
            isActive: true,
            lastModifiedBy
        }
    });

    if (admin) {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: "CREATE_TECHNICIAN",
                targetId: newTech.id,
                details: JSON.stringify({ name })
            }
        });
    }

    revalidatePath('/admin/technicians');
}

export async function getTechnicians() {
    return await prisma.technician.findMany({
        orderBy: { name: 'asc' }
    });
}

// --- Performance Data Entry ---

export async function submitWeeklyPerformance(formData: FormData) {
    const technicianId = formData.get("technicianId") as string;
    const weekStr = formData.get("week") as string; // "2024-W05"
    const revenue = Number(formData.get("revenue"));
    const jobs = Number(formData.get("jobs"));
    const reviews = Number(formData.get("reviews"));
    const memberships = Number(formData.get("memberships"));

    if (!weekStr || !technicianId) {
        throw new Error("Missing required fields");
    }

    // Parse week string (ISO format: 2024-W01)
    const [yearStr, weekNumStr] = weekStr.split("-W");
    const year = parseInt(yearStr);
    const weekNumber = parseInt(weekNumStr);

    // Parse Compliance
    const compliance: ComplianceRecord = {
        vanCleanliness: formData.get("vanCleanliness") === "on",
        paperworkSubmitted: formData.get("paperworkSubmitted") === "on",
        estimateFollowups: formData.get("estimateFollowups") === "on",
        zeroCallbacks: formData.get("zeroCallbacks") === "on",
        noComplaints: formData.get("noComplaints") === "on",
        noBadDriving: formData.get("noBadDriving") === "on",
        drugScreening: formData.get("drugScreening") === "on",
        noOshaViolations: formData.get("noOshaViolations") === "on",
        paceTraining: formData.get("paceTraining") === "on",
        dressCode: formData.get("dressCode") === "on",
    };

    // Calculate Bonus
    const bonusResult = calculateTotalBonus(revenue, reviews, memberships, compliance);

    // Save to DB
    const startDate = getWeekStartDate(year, weekNumber);
    const endDate = getWeekEndDate(year, weekNumber);

    await prisma.weeklyPerformance.upsert({
        where: {
            technicianId_year_weekNumber: {
                technicianId,
                year,
                weekNumber
            }
        },
        update: {
            totalRevenue: revenue,
            jobsCompleted: jobs,
            reviews: reviews,
            memberships: memberships,
            // Compliance
            compliance: {
                upsert: {
                    create: compliance,
                    update: compliance
                }
            },
            // Snapshots
            baseBonus: bonusResult.base,
            spifBonus: bonusResult.spifs,
            totalBonus: bonusResult.total,
            isCompliant: bonusResult.eligible,
            infractionCount: bonusResult.infractionCount,
            deductions: bonusResult.deductions
        },
        create: {
            technicianId,
            year,
            weekNumber,
            quarter: getQuarterFromWeekStart(year, weekNumber),
            startDate,
            endDate,
            totalRevenue: revenue,
            jobsCompleted: jobs,
            reviews: reviews,
            memberships: memberships,
            compliance: {
                create: compliance
            },
            baseBonus: bonusResult.base,
            spifBonus: bonusResult.spifs,
            totalBonus: bonusResult.total,
            isCompliant: bonusResult.eligible,
            infractionCount: bonusResult.infractionCount,
            deductions: bonusResult.deductions
        }
    });

    // Calculate Gamification
    // Since we are server-side, we can import dynamically or statically if no cycle
    // We'll dynamic import to be safe or just use it if library is clean
    const { checkAndAwardGamification } = await import("@/lib/gamification");

    // Re-fetch ensures we have the relations if needed, OR we can pass a constructed object
    // Passing constructed object is faster but riskier if IDs don't match.
    // Let's refetch.
    const savedPerf = await prisma.weeklyPerformance.findUnique({
        where: {
            technicianId_year_weekNumber: {
                technicianId,
                year,
                weekNumber
            }
        },
        include: { compliance: true }
    });

    if (savedPerf) {
        await checkAndAwardGamification(technicianId, savedPerf);
    }

    const admin = await getAdminSession();
    if (admin) {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: "UPDATE_PERFORMANCE",
                targetId: technicianId,
                details: JSON.stringify({ year, weekNumber, revenue })
            }
        });

        await prisma.weeklyPerformance.update({
            where: { id: savedPerf?.id || '' },
            data: { lastModifiedBy: admin.id }
        }).catch(() => { });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/data-entry');
}

// --- Goals ---

export async function updateWeeklyGoal(technicianId: string, year: number, weekNumber: number, newGoal: number) {

    const startDate = getWeekStartDate(year, weekNumber);
    const endDate = getWeekEndDate(year, weekNumber);

    await prisma.weeklyPerformance.upsert({
        where: {
            technicianId_year_weekNumber: {
                technicianId,
                year,
                weekNumber
            }
        },
        update: {
            revenueGoal: newGoal
        },
        create: {
            technicianId,
            year,
            weekNumber,
            quarter: getQuarterFromWeekStart(year, weekNumber),
            startDate,
            endDate,
            revenueGoal: newGoal,
            // Init others to 0
            totalRevenue: 0,
            jobsCompleted: 0,
            reviews: 0,
            memberships: 0,
        }
    });

    revalidatePath('/');
}

export async function logoutTechnician() {
    const cookieStore = await cookies();
    cookieStore.delete('shs_tech_id');
    redirect('/login');
}
