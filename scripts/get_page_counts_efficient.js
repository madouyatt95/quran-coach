import fetch from 'node-fetch';

async function generateCounts() {
    const pageCounts = {};
    for (let s = 1; s <= 114; s++) {
        console.log(`Fetching surah ${s}...`);
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${s}/quran-uthmani`);
        const data = await res.json();
        data.data.ayahs.forEach(ayah => {
            const page = ayah.page;
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });
    }
    console.log(JSON.stringify(pageCounts));
}

generateCounts();
