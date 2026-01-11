/**
 * Script to generate fingerprint database for reciter identification
 * 
 * Uses multiple CDN sources:
 * - cdn.islamic.network for most reciters
 * - verses.quran.com for Sudais and others not on islamic.network
 * 
 * Usage: node scripts/generateFingerprints.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reciters configuration with CDN sources
const RECITERS = [
    {
        id: 'ar.alafasy',
        name: 'Mishary Rashid Alafasy',
        nameAr: 'مشاري راشد العفاسي',
        cdnType: 'islamic',
        cdnId: 'ar.alafasy'
    },
    {
        id: 'ar.abdulbasitmurattal',
        name: 'Abdul Basit',
        nameAr: 'عبد الباسط عبد الصمد',
        cdnType: 'islamic',
        cdnId: 'ar.abdulbasitmurattal'
    },
    {
        id: 'ar.husary',
        name: 'Mahmoud Khalil Al-Husary',
        nameAr: 'محمود خليل الحصري',
        cdnType: 'islamic',
        cdnId: 'ar.husary'
    },
    {
        id: 'ar.minshawi',
        name: 'Mohamed Siddiq Al-Minshawi',
        nameAr: 'محمد صديق المنشاوي',
        cdnType: 'islamic',
        cdnId: 'ar.minshawi'
    },
    {
        id: 'ar.sudais',
        name: 'Abdurrahman As-Sudais',
        nameAr: 'عبدالرحمن السديس',
        cdnType: 'qurancom',
        cdnId: 'Sudais'
    },
    {
        id: 'ar.ghamdi',
        name: 'Saad Al-Ghamdi',
        nameAr: 'سعد الغامدي',
        cdnType: 'everyayah',
        cdnId: 'Ghamadi_40kbps'
    },
    {
        id: 'ar.mahermuaiqly',
        name: 'Maher Al-Muaiqly',
        nameAr: 'ماهر المعيقلي',
        cdnType: 'islamic',
        cdnId: 'ar.mahermuaiqly'
    },
    {
        id: 'ar.ahmedajamy',
        name: 'Ahmad Al-Ajmi',
        nameAr: 'أحمد العجمي',
        cdnType: 'everyayah',
        cdnId: 'ahmed_ibn_ali_al_ajamy_128kbps'
    },
    {
        id: 'ar.hanirifai',
        name: 'Hani Ar-Rifai',
        nameAr: 'هاني الرفاعي',
        cdnType: 'everyayah',
        cdnId: 'Hani_Rifai_192kbps'
    },
    {
        id: 'ar.shuraym',
        name: 'Saud Ash-Shuraym',
        nameAr: 'سعود الشريم',
        cdnType: 'everyayah',
        cdnId: 'Saood_ash-Shuraym_128kbps'
    },
];

// Ayah counts for each surah
const SURAH_AYAH_COUNTS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
    110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
    83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
    78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
    56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
    11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

// Get ayahs to sample for each surah (first 5 ayahs, or all if less than 5)
function getSampleAyahs(surahNumber) {
    const totalAyahs = SURAH_AYAH_COUNTS[surahNumber - 1];
    const samplesToTake = Math.min(5, totalAyahs);
    return Array.from({ length: samplesToTake }, (_, i) => i + 1);
}

// Pad number with zeros
function padNumber(num, length) {
    return num.toString().padStart(length, '0');
}

// Generate audio URL based on CDN type
function getAudioUrl(reciter, surah, ayah) {
    const surahPadded = padNumber(surah, 3);
    const ayahPadded = padNumber(ayah, 3);

    switch (reciter.cdnType) {
        case 'islamic':
            // Get global ayah number for islamic.network
            let globalAyah = 0;
            for (let i = 0; i < surah - 1; i++) {
                globalAyah += SURAH_AYAH_COUNTS[i];
            }
            globalAyah += ayah;
            return `https://cdn.islamic.network/quran/audio/128/${reciter.cdnId}/${globalAyah}.mp3`;

        case 'qurancom':
            return `https://verses.quran.com/${reciter.cdnId}/mp3/${surahPadded}${ayahPadded}.mp3`;

        case 'everyayah':
            return `https://everyayah.com/data/${reciter.cdnId}/${surahPadded}${ayahPadded}.mp3`;

        default:
            return null;
    }
}

// Download audio and extract fingerprint
async function extractFingerprint(audioUrl) {
    try {
        const response = await fetch(audioUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Simple fingerprint: analyze byte patterns at regular intervals
        const sampleSize = 64;
        const fingerprint = [];
        const step = Math.floor(bytes.length / sampleSize);

        for (let i = 0; i < sampleSize; i++) {
            const idx = Math.min(i * step, bytes.length - 1);
            fingerprint.push(bytes[idx] / 255);
        }

        return fingerprint;
    } catch (error) {
        console.error(`Error fetching ${audioUrl}:`, error.message);
        return null;
    }
}

// Main generation function
async function generateDatabase() {
    console.log('🎵 Starting fingerprint database generation (v2)...\n');

    const database = {
        version: '2.0',
        generated: new Date().toISOString(),
        reciters: {}
    };

    let totalProcessed = 0;

    for (const reciter of RECITERS) {
        console.log(`\n📻 Processing ${reciter.name} (${reciter.cdnType})...`);

        database.reciters[reciter.id] = {
            name: reciter.name,
            nameAr: reciter.nameAr,
            fingerprints: []
        };

        let reciterProcessed = 0;
        let reciterErrors = 0;

        for (let surah = 1; surah <= 114; surah++) {
            const ayahs = getSampleAyahs(surah);

            for (const ayah of ayahs) {
                const audioUrl = getAudioUrl(reciter, surah, ayah);

                if (!audioUrl) continue;

                const fingerprint = await extractFingerprint(audioUrl);

                if (fingerprint) {
                    database.reciters[reciter.id].fingerprints.push({
                        surah,
                        ayah,
                        data: fingerprint
                    });
                    reciterProcessed++;
                    totalProcessed++;

                    if (reciterProcessed % 50 === 0) {
                        console.log(`  → ${reciterProcessed} samples processed...`);
                    }
                } else {
                    reciterErrors++;
                    if (reciterErrors > 20 && reciterProcessed === 0) {
                        console.log(`  ⚠️ Too many errors, skipping ${reciter.name}`);
                        break;
                    }
                }

                // Small delay to avoid rate limiting
                await new Promise(r => setTimeout(r, 50));
            }

            // Break out of surah loop if reciter has too many errors
            if (reciterErrors > 20 && reciterProcessed === 0) break;
        }

        console.log(`  ✓ ${reciterProcessed} samples collected for ${reciter.name}`);
    }

    // Save database
    const outputPath = path.join(__dirname, '..', 'public', 'data', 'reciterFingerprints.json');
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n✅ Database generated successfully!`);
    console.log(`   - Total samples: ${totalProcessed}`);
    console.log(`   - File size: ${sizeMB} MB`);
    console.log(`   - Output: ${outputPath}`);
}

// Run
generateDatabase().catch(console.error);
