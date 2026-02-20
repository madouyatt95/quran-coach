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

    const normalizeArabic = (text) => {
        if (!text) return '';
        return text
            .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Arabic diacritics
            .replace(/[\u0640]/g, '') // Tatweel
            .replace(/[ٱإأآء]/g, 'ا') // Normalize Alif variants and Hamza
            .replace(/[ىئ]/g, 'ي') // Normalize Ya variants
            .replace(/ؤ/g, 'و') // Normalize Waw variants
            .replace(/ة/g, 'ه') // Normalize Ta Marbuta to Ha
            .replace(/[^\u0600-\u06FF]/g, ''); // Keep only Arabic letters
    };

    const wordsMatch = (w1, w2) => {
        const skeleton1 = w1.replace(/ا/g, '');
        const skeleton2 = w2.replace(/ا/g, '');
        return skeleton1 === skeleton2 || skeleton1.includes(skeleton2) || skeleton2.includes(skeleton1);
    };

    const cleanDuaWords = duaWords.map(normalizeArabic);
    const cleanAyahWords = apiWords.map((w) => normalizeArabic(w.text_uthmani || ''));

    let foundIndex = -1;
    for (let i = 0; i <= cleanAyahWords.length - cleanDuaWords.length; i++) {
        let match = true;
        for (let j = 0; j < cleanDuaWords.length; j++) {
            if (!wordsMatch(cleanAyahWords[i + j], cleanDuaWords[j])) {
                match = false;
                break;
            }
        }
        if (match) {
            foundIndex = i; // Store it but keep going to find the last one 
        }
    }

    if (foundIndex === -1) {
        console.log(`NO MATCH FOUND FOR ${surah}:${ayah}`);
    } else {
        console.log(`Match found at ${foundIndex} for ${surah}:${ayah}`);
    }

    let startMs = 0;
    let endMs = 0;

    if (foundIndex !== -1) {
        const targetStartRelIdx = foundIndex + 1; // 1-based index in segments
        const targetEndRelIdx = foundIndex + duaWords.length;

        let endSegIndex = -1;
        for (let i = segments.length - 1; i >= 0; i--) {
            if (segments[i][0] === targetEndRelIdx) {
                endSegIndex = i;
                break;
            }
        }
        if (endSegIndex === -1) endSegIndex = segments.length - 1;

        let startSegIndex = -1;
        for (let i = endSegIndex; i >= 0; i--) {
            if (segments[i][0] === targetStartRelIdx) {
                startSegIndex = i;
                while (i > 0 && segments[i - 1][0] === targetStartRelIdx) {
                    i--;
                    startSegIndex = i;
                }
                break;
            }
        }
        if (startSegIndex === -1) startSegIndex = 0;

        startMs = Math.max(0, segments[startSegIndex][1] - ayahTimings.timestamp_from);
        endMs = Math.max(0, segments[endSegIndex][2] - ayahTimings.timestamp_from);

        console.log(`Start segment index: ${startSegIndex} (${segments[startSegIndex]}), End segment index: ${endSegIndex} (${segments[endSegIndex]})`);
    }

    console.log(`Fixed timings for ${surah}:${ayah} - Start: ${startMs}, End: ${endMs}`);
}

async function run() {
    await testFix(60, 4, "رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِليك الْمَصِيرُ");
}
run();
