const apiKey = process.env.FIELD_PULSE_API_KEY || "4TYcFyl5cC4SK4gvzOPCv37KEczLKmma74J3yQMa";
const base = "https://ywe3crmpll.execute-api.us-east-2.amazonaws.com";

const VARIANTS = [
    "/prod",
    "/production",
    "/v1",
    "/api",
    "" // root
];

async function testVariant(path) {
    const url = `${base}${path}/users`;
    // console.log(`Testing: ${url}`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const res = await fetch(url, {
            headers: { 'x-api-key': apiKey },
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : (data.data?.length || 0);
            console.log(`✅ SUCCESS [${path}]: Status ${res.status}, Found ${count} users.`);
            if (count > 0) console.log('   (This is likely the production URL!)');
            return true;
        } else {
            // console.log(`❌ Fail [${path}]: Status ${res.status}`);
        }
    } catch (err) {
        // console.log(`❌ Error [${path}]: ${err.message}`);
    }
    return false;
}

async function main() {
    console.log(`Scanning for Production URL on ${base}...`);

    // First confirm stage works as a control
    await testVariant("/stage");

    for (const v of VARIANTS) {
        await testVariant(v);
    }
}

main();
