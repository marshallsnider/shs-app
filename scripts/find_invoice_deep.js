// scripts/find_invoice_deep.js
const apiKey = process.env.FIELD_PULSE_API_KEY;
const baseUrl = process.env.FIELD_PULSE_BASE_URL;

if (!apiKey || !baseUrl) process.exit(1);

async function deepSearch() {
    console.log('--- Deep Searching Invoices ---');

    // 1. Search by Customer ID (from Job 15881438) -> 14539170
    const customerId = 14539170;
    console.log(`Checking Invoices for Customer: ${customerId}`);

    const url1 = `${baseUrl}/invoices?customer_id=${customerId}`;
    await check(url1);

    // 2. Search by Author ID (Tech: 234120 - Trevor?)
    // Need to confirm user ID from sync logs. Trevor was new tech.
    // sample Job assignment user_id: 234120.
    const userId = 234120; // Trevor? or whoever
    console.log(`Checking Invoices for User: ${userId} (assignments.user_id)`);
    // field might be 'author_id' or undefined filter
    // Try likely filters
    await check(`${baseUrl}/invoices?author_id=${userId}`);
    await check(`${baseUrl}/invoices?team_member_id=${userId}`); // Guess

    // 3. Search Estimates to see if we can use those
    console.log('\n--- Checking Estimates ---');
    await check(`${baseUrl}/estimates?limit=5`);

}

async function check(url) {
    try {
        const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
        console.log(`GET ${url} -> Status: ${res.status}`);
        if (res.ok) {
            const json = await res.json();
            const items = json.response || json.data || (Array.isArray(json) ? json : []);
            console.log(`Count: ${items.length}`);
            if (items.length > 0) {
                console.log('Sample Found!');
                console.log(JSON.stringify(items[0], null, 2));
            }
        } else {
            console.log('Error:', await res.text());
        }
    } catch (e) {
        console.error(e.message);
    }
}

deepSearch();
