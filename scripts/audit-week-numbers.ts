/**
 * AUDIT SCRIPT: Week Number Discrepancies
 *
 * The app previously calculated week numbers using mixed UTC/local-time logic,
 * which caused stored weekNumber values to be off by +1 from the correct ISO 8601
 * week. This script identifies affected records.
 *
 * Usage:
 *   DATABASE_URL="your_neon_url" npx tsx scripts/audit-week-numbers.ts
 *
 * To actually fix the data, run with --fix:
 *   DATABASE_URL="your_neon_url" npx tsx scripts/audit-week-numbers.ts --fix
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = !process.argv.includes('--fix');

function getISOWeek(date: Date): { year: number; weekNumber: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
      year: true,
      weekNumber: true,
      startDate: true,
      endDate: true,
      totalRevenue: true,
      technician: { select: { name: true } },
    },
    orderBy: [{ year: 'asc' }, { weekNumber: 'asc' }],
  });

  console.log(`Total records: ${records.length}`);
  console.log(dryRun ? 'Mode: DRY RUN (pass --fix to apply changes)\n' : 'Mode: FIXING DATA\n');

  const mismatches: typeof records = [];

  for (const r of records) {
    if (!r.startDate) continue;

    const actual = getISOWeek(r.startDate);
    if (actual.weekNumber !== r.weekNumber || actual.year !== r.year) {
      mismatches.push(r);
      console.log(
        `${r.technician.name} | Stored: Y${r.year} W${r.weekNumber} | ` +
        `startDate: ${r.startDate.toISOString().split('T')[0]} | ` +
        `Correct: Y${actual.year} W${actual.weekNumber} | ` +
        `Revenue: $${r.totalRevenue}`
      );
    }
  }

  console.log(`\n${mismatches.length} of ${records.length} records have mismatched week numbers.`);

  if (mismatches.length === 0) {
    console.log('No fixes needed.');
    return;
  }

  if (dryRun) {
    console.log('\nRun with --fix to correct these records.');
    return;
  }

  console.log('\nApplying fixes...');
  let fixed = 0;
  let skipped = 0;

  for (const r of mismatches) {
    const actual = getISOWeek(r.startDate!);
    const newStart = getWeekStartDate(actual.year, actual.weekNumber);
    const newEnd = new Date(newStart.getTime() + 6 * 86400000);

    // Check if the correct week slot is already occupied for this technician
    const existing = await prisma.weeklyPerformance.findUnique({
      where: {
        technicianId_year_weekNumber: {
          technicianId: (r as any).technicianId || '',
          year: actual.year,
          weekNumber: actual.weekNumber,
        },
      },
    });

    if (existing && existing.id !== r.id) {
      console.log(`  SKIP: ${r.technician.name} W${r.weekNumber} -> W${actual.weekNumber} (slot already taken, id=${existing.id})`);
      skipped++;
      continue;
    }

    await prisma.weeklyPerformance.update({
      where: { id: r.id },
      data: {
        year: actual.year,
        weekNumber: actual.weekNumber,
        quarter: Math.ceil((newStart.getUTCMonth() + 1) / 3),
        startDate: newStart,
        endDate: newEnd,
      },
    });
    fixed++;
  }

  console.log(`\nDone. Fixed: ${fixed}, Skipped (conflicts): ${skipped}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
