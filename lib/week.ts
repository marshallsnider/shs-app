/**
 * Shared ISO week utilities — all calculations use UTC to avoid timezone drift.
 */

/** Returns the ISO week number and year for a given date. */
export function getISOWeek(date: Date): { year: number; weekNumber: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  return { year, weekNumber };
}

/** Returns the Monday (start) date of a given ISO week, in UTC. */
export function getWeekStartDate(year: number, week: number): Date {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayNum = jan4.getUTCDay() || 7;
  // Monday of week 1
  const week1Monday = new Date(Date.UTC(year, 0, 4 - (dayNum - 1)));
  // Monday of target week
  return new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
}

/** Returns the Sunday (end) date of a given ISO week, in UTC. */
export function getWeekEndDate(year: number, week: number): Date {
  const start = getWeekStartDate(year, week);
  return new Date(start.getTime() + 6 * 86400000);
}

/** Returns the previous ISO week/year, correctly handling year boundaries. */
export function getPreviousWeek(year: number, weekNumber: number): { year: number; weekNumber: number } {
  if (weekNumber > 1) {
    return { year, weekNumber: weekNumber - 1 };
  }
  // Last week of previous year: find it by checking Dec 28 of previous year
  // (Dec 28 is always in the last ISO week of its year)
  const dec28 = new Date(Date.UTC(year - 1, 11, 28));
  return getISOWeek(dec28);
}

/** Returns the quarter (1-4) for a given month (0-11 based Date month). */
export function getQuarterFromWeekStart(year: number, week: number): number {
  const start = getWeekStartDate(year, week);
  return Math.ceil((start.getUTCMonth() + 1) / 3);
}
