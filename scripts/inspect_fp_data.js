// scripts/inspect_fp_data.js
const apiKey = process.env.FIELD_PULSE_API_KEY;
const baseUrl = process.env.FIELD_PULSE_BASE_URL;

if (!apiKey || !baseUrl) process.exit(1);

async function inspect() {
    console.log('--- Inspecting ESTIMATES ---');

    // Check Estimates
    const res = await fetch(`${baseUrl}/estimates?limit=1`, { headers: { 'x-api-key': apiKey } });
    if (res.ok) {
        const json = await res.json();
        const items = json.response || json.data || (Array.isArray(json) ? json : []);
        if (items.length > 0) {
            console.log('\n--- ESTIMATE SAMPLE (FULL) ---');
            console.log(JSON.stringify(items[0], null, 2));
        } else {
            console.log('No Estimates found.');
        }
    } else {
        console.log('Failed to fetch estimates:', res.status);
    }
}

inspect();
