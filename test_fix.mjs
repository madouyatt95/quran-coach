import fetch from 'node-fetch';

async function testFix(surah, ayah, duaText) {
    const reciterId = 7;
    const url = `https://api.quran.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`;
    const response = await fetch(url);
    const data = await response.json();

    const ayahTimings = data.audio_files[0].verse_timings.find((v) => v.verse_key === `${surah}:${ayah}`);
    const segments = ayahTimings.segments;

    const quranResponse = await fetch(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani`);
    const quranData = await quranResponse.json();

    const duaWords = duaText.split(/[\s،]+/).filter(w => w.trim().length > 0);
    const apiWords = quranData.verse.words.filter((w) => w.char_type_name === 'word');

    // ... [Normalize matching omitted for brevity, assuming foundIndex is known]
    let foundIndex = (surah === 59 && ayah === 10) ? 19 : 34;

    // The Fix:
    const targetStartRelIdx = foundIndex + 1;
    const targetEndRelIdx = foundIndex + duaWords.length;

    // Find the LAST occurrence of the end relative index
    let endSegIndex = -1;
    for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i][0] === targetEndRelIdx) {
            endSegIndex = i;
            break;
        }
    }

    if (endSegIndex === -1) {
        // Fallback if not found perfectly
        endSegIndex = segments.length - 1;
    }

    // Search backwards from endSegIndex to find the earliest contiguous start 
    // Wait, just find the FIRST occurrence of targetStartRelIdx before or at endSegIndex
    let startSegIndex = -1;
    for (let i = endSegIndex; i >= 0; i--) {
        if (segments[i][0] === targetStartRelIdx) {
            startSegIndex = i;
            // IF we continue backwards, we might find another segment with the same relIdx
            // because sometimes a word is split into multiple segments (like word 20 in 59:10).
            // So we KEEP going backwards as long as the relIdx is targetStartRelIdx.
            while (i > 0 && segments[i - 1][0] === targetStartRelIdx) {
                i--;
                startSegIndex = i;
            }
            break;
        }
    }

    if (startSegIndex === -1) {
        startSegIndex = 0;
    }

    const startMs = Math.max(0, segments[startSegIndex][1] - ayahTimings.timestamp_from);
    const endMs = Math.max(0, segments[endSegIndex][2] - ayahTimings.timestamp_from);

    console.log(`Fixed timings for ${surah}:${ayah} - Start: ${startMs}, End: ${endMs}`);
}

async function run() {
    await testFix(59, 10, "رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ");
    await testFix(66, 8, "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ");
}
run();
