// require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.FIELD_PULSE_API_KEY;
const baseUrl = process.env.FIELD_PULSE_BASE_URL;

if (!apiKey || !baseUrl) {
    console.error('Missing config');
    process.exit(1);
}

console.log('Testing connection...');
console.log('URL:', baseUrl);

async function test() {
    try {
        const endpoints = ['customers', 'estimates', 'users', 'jobs', 'invoices'];

        console.log(`Scanning [${endpoints.join(', ')}] on Production...`);

        for (const ep of endpoints) {
            console.log(`\n--- Checking /${ep} ---`);
            const res = await fetch(`${baseUrl}/${ep}?limit=5`, {
                headers: { 'x-api-key': apiKey }
            });
            console.log(`Status: ${res.status}`);

            if (res.ok) {
                const json = await res.json();
                // Field Pulse API returns { response: [...] }
                // or sometimes { data: [...] } or just [...]
                // We check all standard patterns
                const items = json.response || json.data || (Array.isArray(json) ? json : []);

                const count = items.length;
                console.log(`Count: ${count}`);

                if (count > 0) {
                    const first = items[0];
                    console.log('Sample Keys:', Object.keys(first).join(', '));
                    // console.log('Sample Item:', JSON.stringify(first, null, 2));
                } else {
                    console.log('(No records returned)');
                }
            } else {
                console.error('Error:', await res.text());
            }
        }

    } catch (err) {
        console.error('Request Failed:', err.message);
    }
}

test();
