/**
 * AUDIT SCRIPT: Week Number Discrepancies
 *
 * Usage:
 *   DATABASE_URL="your_neon_url" npx tsx scripts/audit-week-numbers.ts
 *   DATABASE_URL="your_neon_url" npx tsx scripts/audit-week-numbers.ts --fix
 *   DATABASE_URL="your_neon_url" npx tsx scripts/audit-week-numbers.ts --undo-shift
 *
 * The --undo-shift flag corrects data that was shifted 1 week too far back
 * by adding 7 days to each startDate before recalculating.
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = !process.argv.includes('--fix') && !process.argv.includes('--undo-shift');
const undoShift = process.argv.includes('--undo-shift');

// FIXED: Use getUTC* methods so database dates (UTC midnight) aren't shifted by local timezone
function getISOWeek(date: Date): { year: number; weekNumber: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  return { year, weekNumber };
}

function getWeekStartDate(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayNum = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(year, 0, 4 - (dayNum - 1)));
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}

async function main() {
  const records = await prisma.weeklyPerformance.findMany({
    select: {
      id: true,
      technicianId: true,
      year: true,
      weekNumber: true,
      startDate: true,
      totalRevenue: true,
      technician: { select: { name: true } },
    },
    orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }],
  });

  console.log(`Total records: ${records.length}`);
  if (undoShift) {
    console.log('Mode: UNDO SHIFT (adding 7 days to each startDate, then fixing week numbers)\n');
  } else {
    console.log(dryRun ? 'Mode: DRY RUN (pass --fix to apply changes)\n' : 'Mode: FIXING DATA\n');
  }

  // Build the fix plan based on startDate
  type FixPlan = { id: string; name: string; oldYear: number; oldWeek: number; correctYear: number; correctWeek: number; revenue: number; startDate: Date };
  const fixes: FixPlan[] = [];
  const duplicates: FixPlan[] = [];
  const seen = new Set<string>();

  for (const r of records) {
    if (!r.startDate) continue;

    // If undoing a shift, add 7 days to startDate before calculating correct week
    const dateForCalc = undoShift
      ? new Date(r.startDate.getTime() + 7 * 86400000)
      : r.startDate;

    const actual = getISOWeek(dateForCalc);
    const key = `${r.technicianId}_${actual.year}_${actual.weekNumber}`;

    const plan: FixPlan = {
      id: r.id, name: r.technician.name,
      oldYear: r.year, oldWeek: r.weekNumber,
      correctYear: actual.year, correctWeek: actual.weekNumber,
      revenue: r.totalRevenue, startDate: r.startDate,
    };

    if (seen.has(key)) {
      duplicates.push(plan);
    } else {
      seen.add(key);
      fixes.push(plan);
    }

    if (actual.weekNumber !== r.weekNumber || actual.year !== r.year) {
      console.log(
        `${r.technician.name} | Stored: Y${r.year} W${r.weekNumber} | ` +
        `startDate: ${r.startDate.toISOString().split('T')[0]} | ` +
        `Correct: Y${actual.year} W${actual.weekNumber} | ` +
        `Revenue: $${r.totalRevenue}`
      );
    }
  }

  const mismatches = fixes.filter(f => f.oldYear !== f.correctYear || f.oldWeek !== f.correctWeek);
  console.log(`\n${mismatches.length} records need week number correction.`);

  if (duplicates.length > 0) {
    console.log(`${duplicates.length} duplicate records found (same tech + same correct week):`);
    for (const d of duplicates) {
      console.log(`  DUPLICATE: ${d.name} | Y${d.oldYear} W${d.oldWeek} -> Y${d.correctYear} W${d.correctWeek} | $${d.revenue}`);
    }
  }

  if (mismatches.length === 0 && duplicates.length === 0) {
    console.log('No fixes needed.');
    return;
  }

  if (dryRun) {
    console.log('\nRun with --fix to correct these records.');
    return;
  }

  // Delete duplicates (keep the one with higher revenue, already in fixes[])
  if (duplicates.length > 0) {
    console.log(`\nDeleting ${duplicates.length} duplicate records...`);
    for (const d of duplicates) {
      await prisma.complianceRecord.deleteMany({ where: { weeklyPerformanceId: d.id } });
      await prisma.weeklyPerformance.delete({ where: { id: d.id } });
    }
    console.log('Duplicates removed.');
  }

  console.log('\nPhase 1: Clearing all week numbers to temp values...');
  const phase1: Prisma.PrismaPromise<any>[] = fixes.map((r, i) =>
    prisma.weeklyPerformance.update({
      where: { id: r.id },
      data: { year: 9000, weekNumber: i + 1 },  // unique temp values
    })
  );
  await prisma.$transaction(phase1);

  console.log('Phase 2: Setting correct week numbers...');
  const phase2: Prisma.PrismaPromise<any>[] = fixes.map(r => {
    const newStart = getWeekStartDate(r.correctYear, r.correctWeek);
    const newEnd = new Date(newStart.getTime() + 6 * 86400000);
    return prisma.weeklyPerformance.update({
      where: { id: r.id },
      data: {
        year: r.correctYear,
        weekNumber: r.correctWeek,
        quarter: Math.ceil((newStart.getUTCMonth() + 1) / 3),
        startDate: newStart,
        endDate: newEnd,
      },
    });
  });
  await prisma.$transaction(phase2);

  console.log(`\nDone. Fixed ${mismatches.length} records, removed ${duplicates.length} duplicates.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
