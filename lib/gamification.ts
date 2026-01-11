import prisma from "@/lib/db";
import { WeeklyPerformance, ComplianceRecord } from "@prisma/client";

// Define badge codes
const BADGES = {
    FIRST_STEPS: 'FIRST_STEPS',
    MONEY_MAKER: 'MONEY_MAKER',
    REVIEW_MASTER: 'REVIEW_MASTER',
    ON_FIRE: 'ON_FIRE', // 5 streak
    UNSTOPPABLE: 'UNSTOPPABLE', // 10 streak
    HIGH_ROLLER: 'HIGH_ROLLER',
    MEMBERSHIP_PRO: 'MEMBERSHIP_PRO',
    PERFECT_WEEK: 'PERFECT_WEEK',
};

export async function checkAndAwardGamification(
    technicianId: string,
    performance: WeeklyPerformance & { compliance: ComplianceRecord | null }
) {
    // 1. Calculate Streak
    const tech = await prisma.technician.findUnique({ where: { id: technicianId } });
    if (!tech) return;

    let newStreak = tech.currentStreak;
    if (performance.isCompliant) {
        newStreak += 1;
    } else {
        newStreak = 0;
    }

    await prisma.technician.update({
        where: { id: technicianId },
        data: { currentStreak: newStreak }
    });

    // 2. Check Badges
    const awards: string[] = [];

    // Helper to award
    const award = async (code: string) => {
        // efficient check: try to create, ignore unique constraint error or check first
        const badge = await prisma.badge.findUnique({ where: { code } });
        if (!badge) return;

        const existing = await prisma.technicianBadge.findUnique({
            where: {
                technicianId_badgeId: {
                    technicianId,
                    badgeId: badge.id
                }
            }
        });

        if (!existing) {
            await prisma.technicianBadge.create({
                data: {
                    technicianId,
                    badgeId: badge.id
                }
            });
            awards.push(badge.name);
        }
    };

    // Rules
    if (performance.jobsCompleted > 0) await award(BADGES.FIRST_STEPS);
    if (performance.totalRevenue >= 7000) await award(BADGES.MONEY_MAKER);
    if (performance.reviews >= 5) await award(BADGES.REVIEW_MASTER);
    if (newStreak >= 5) await award(BADGES.ON_FIRE);
    if (newStreak >= 10) await award(BADGES.UNSTOPPABLE);
    if (performance.totalRevenue >= 13000) await award(BADGES.HIGH_ROLLER);
    if (performance.memberships >= 5) await award(BADGES.MEMBERSHIP_PRO);
    if (performance.totalRevenue >= 7000 && performance.isCompliant) await award(BADGES.PERFECT_WEEK);

    return { newStreak, awards };
}
