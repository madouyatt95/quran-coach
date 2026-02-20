import fetch from 'node-fetch';

async function testRabbanaTimings(surah, ayah, duaText) {
    const reciterId = 7;
    const url = `https://api.quran.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`;
    const response = await fetch(url);
    const data = await response.json();

    const ayahTimings = data.audio_files[0].verse_timings.find((v) => v.verse_key === `${surah}:${ayah}`);
    const segments = ayahTimings.segments;

    const quranResponse = await fetch(`https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani`);
    const quranData = await quranResponse.json();

    let startIndex = 0;
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

    console.log("Ayah Words:", cleanAyahWords);
    console.log("Dua Words:", cleanDuaWords);

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
            console.log("Matched at index", i);
        }
    }

    if (foundIndex !== -1) {
        startIndex = foundIndex;
    } else {
        startIndex = Math.max(0, segments.length - duaWords.length);
        console.log("No match found, defaulting to end. Index:", startIndex);
    }

    const endIndex = Math.min(segments.length - 1, startIndex + duaWords.length - 1);

    const startMs = Math.max(0, segments[startIndex][1] - ayahTimings.timestamp_from);
    const endMs = Math.max(0, segments[endIndex][2] - ayahTimings.timestamp_from);

    console.log(`Ayah ${surah}:${ayah}, Dua: ${duaText.substring(0, 20)}... Start: ${startMs}, End: ${endMs}`);
    return [startMs, endMs];
}

async function run() {
    // Rabbana 37 (59:10) target text: رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ
    await testRabbanaTimings(59, 10, "رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ");
    // Rabbana 40 (66:8) target text: رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ
    await testRabbanaTimings(66, 8, "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ");
}
run();
