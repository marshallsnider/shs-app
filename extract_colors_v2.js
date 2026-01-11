const J = require('jimp');
const Jimp = J.Jimp || J;

async function main() {
    try {
        console.log('Reading image...');
        const image = await Jimp.read('2.png');

        // Resize to speed up and reduce noise
        image.resize(100, 100);

        const colorCounts = {};
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        image.scan(0, 0, width, height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const a = this.bitmap.data[idx + 3];

            if (a < 200) return; // Skip transparent

            // Quantize
            const bucket = 20;
            const qr = Math.round(r / bucket) * bucket;
            const qg = Math.round(g / bucket) * bucket;
            const qb = Math.round(b / bucket) * bucket;

            const key = `${qr},${qg},${qb}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        });

        // Sort
        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

        console.log("Top colors:");
        sorted.slice(0, 5).forEach(([rgb, count]) => {
            const [r, g, b] = rgb.split(',').map(Number);
            const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            console.log(`${hex} (count: ${count})`);
        });
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
