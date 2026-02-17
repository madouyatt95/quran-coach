import fetch from 'node-fetch';

async function generateCounts() {
    const counts = {};
    for (let p = 1; p <= 604; p++) {
        console.log(`Fetching page ${p}...`);
        const res = await fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`);
        const data = await res.json();
        counts[p] = data.data.ayahs.length;
    }
    console.log(JSON.stringify(counts));
}

generateCounts();
