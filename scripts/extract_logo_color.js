const Jimp = require('jimp');

async function main() {
    console.log("Reading logo...");
    const image = await Jimp.read('public/logo.png');

    // Resize for speed
    image.resize(100, Jimp.AUTO);

    const colorCounts = {};

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];

        if (a < 128) return;

        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    });

    // Sort by count
    const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

    console.log("Top 5 Colors:");
    sorted.slice(0, 5).forEach(([hex, count]) => console.log(`${hex}: ${count}`));
}

main();
