import fetch from 'node-fetch';

async function testSegments(surah, ayah) {
    const reciterId = 7;
    const url = `https://api.quran.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`;
    const response = await fetch(url);
    const data = await response.json();

    const ayahTimings = data.audio_files[0].verse_timings.find((v) => v.verse_key === `${surah}:${ayah}`);
    const segments = ayahTimings.segments;

    console.log(`Ayah ${surah}:${ayah} segments:`);
    segments.forEach((seg, idx) => {
        console.log(`Word ${idx} (rel idx ${seg[0]}): ${seg[1] - ayahTimings.timestamp_from} to ${seg[2] - ayahTimings.timestamp_from}`);
    });
    console.log(`Ayah total duration diff: ${ayahTimings.timestamp_to - ayahTimings.timestamp_from}`);
}

async function run() {
    await testSegments(59, 10);
    await testSegments(66, 8);
}
run();
