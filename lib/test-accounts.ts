/**
 * Test accounts are real Technician records that can log in and use the app
 * exactly like a working tech, but are excluded from every aggregation that
 * matters: leaderboard, admin dashboard rollups, weekly reports, sync write
 * loop.
 *
 * Use this when an internal user (currently just Marshall) needs to punch
 * around in production to validate behavior without polluting team numbers.
 *
 * To add another test account, append the name (case sensitivity does not
 * matter, comparison is case-insensitive). No code redeploy beyond this file
 * and no schema migration.
 */
export const TEST_TECH_NAMES: readonly string[] = ['Marshall Snider'];

const NORMALIZED = new Set(TEST_TECH_NAMES.map((n) => n.trim().toLowerCase()));

/**
 * True if this technician name should be excluded from team-wide
 * aggregations.
 */
export function isTestTech(name: string | null | undefined): boolean {
    if (!name) return false;
    return NORMALIZED.has(name.trim().toLowerCase());
}
