// scripts/sync_field_pulse.js
//
// Manually trigger a FieldPulse sync against the deployed app. Uses the
// same authenticated /api/sync endpoint as the daily Vercel cron, so
// there's exactly one sync code path — no chance of drift.
//
// Usage:
//   vercel env pull .env.production.local --environment=production
//   export $(grep -v '^#' .env.production.local | xargs)
//   node scripts/sync_field_pulse.js [--url=https://your.app]
//
// Defaults to safetyhomeservices.app. Pass --url=... to hit a preview
// deployment instead.

const SECRET = process.env.CRON_SECRET;
const urlArg = process.argv.find(a => a.startsWith('--url='));
const APP_URL = urlArg ? urlArg.slice('--url='.length) : 'https://safetyhomeservices.app';

if (!SECRET) {
    console.error('Missing CRON_SECRET. Run `vercel env pull .env.production.local --environment=production` and source it.');
    process.exit(1);
}

(async () => {
    const started = Date.now();
    console.log(`Triggering sync at ${APP_URL}/api/sync ...`);
    const res = await fetch(`${APP_URL}/api/sync`, {
        headers: { Authorization: `Bearer ${SECRET}` },
    });
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    const body = await res.text();
    console.log(`HTTP ${res.status} in ${elapsed}s`);
    try {
        console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
        console.log(body);
    }
    if (!res.ok) process.exit(1);
})().catch(e => {
    console.error(e);
    process.exit(1);
});
