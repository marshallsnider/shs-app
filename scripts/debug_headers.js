// require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.FIELD_PULSE_API_KEY;
const baseUrl = process.env.FIELD_PULSE_BASE_URL;

if (!apiKey || !baseUrl) { process.exit(1); }

async function debug() {
    try {
        console.log('--- HEADERS DEBUG ---');
        // Check /users
        const res = await fetch(`${baseUrl}/users`, {
            headers: { 'x-api-key': apiKey }
        });

        console.log('Status:', res.status);
        console.log('Response Headers:');
        res.headers.forEach((val, key) => console.log(`  ${key}: ${val}`));

        const text = await res.text();
        console.log('\nRaw Body (First 200 chars):');
        console.log(text.substring(0, 200));

    } catch (err) {
        console.error(err);
    }
}

debug();
