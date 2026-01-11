'use server';

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { calculateTotalBonus, ComplianceRecord } from "@/lib/engine";

// --- Technician Management ---

export async function createTechnician(formData: FormData) {
    const name = formData.get("name") as string;
    const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    await prisma.technician.create({
        data: {
            name,
            avatar: initials,
            isActive: true,
        }
    });

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
    };

    // Calculate Bonus
    const bonusResult = calculateTotalBonus(revenue, reviews, memberships, compliance);

    // Save to DB
    const startDate = getDateFromWeek(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

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
            isCompliant: bonusResult.eligible
        },
        create: {
            technicianId,
            year,
            weekNumber,
            quarter: Math.ceil(weekNumber / 13), // Approx
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
            isCompliant: bonusResult.eligible
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

    revalidatePath('/admin');
    revalidatePath('/admin/data-entry');
}

function getDateFromWeek(year: number, week: number): Date {
    // Simple ISO week logic approximation
    const d = new Date(year, 0, 4); // Jan 4th is always in week 1
    const dayNum = d.getDay() || 7;
    const startOfYear = d.getTime() - (dayNum - 1) * 24 * 3600000;

    // week 1 start
    const w1Start = new Date(startOfYear);
    // target week start
    return new Date(w1Start.getTime() + (week - 1) * 7 * 24 * 3600000);
}

// --- Goals ---

export async function updateWeeklyGoal(technicianId: string, year: number, weekNumber: number, newGoal: number) {
    'use server';

    const startDate = getDateFromWeek(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

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
            quarter: Math.ceil(weekNumber / 13),
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
