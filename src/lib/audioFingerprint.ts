// Audio Fingerprinting Service for Reciter Identification
// Uses Web Audio API to compare audio spectrograms

const RECITERS = [
    { id: 'ar.alafasy', name: 'Mishary Al-Afasy', nameAr: 'مشاري العفاسي' },
    { id: 'ar.abdulbasit', name: 'Abdul Basit', nameAr: 'عبد الباسط' },
    { id: 'ar.husary', name: 'Mahmoud Al-Husary', nameAr: 'محمود الحصري' },
    { id: 'ar.minshawi', name: 'Mohamed Al-Minshawi', nameAr: 'محمد المنشاوي' },
    { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', nameAr: 'عبد الرحمن السديس' },
    { id: 'ar.saadalghamdi', name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي' },
    { id: 'ar.mahermuaiqly', name: 'Maher Al-Muaiqly', nameAr: 'ماهر المعيقلي' },
    { id: 'ar.ahmedajamy', name: 'Ahmad Al-Ajmi', nameAr: 'أحمد العجمي' },
    { id: 'ar.haborehman', name: 'Hani Ar-Rifai', nameAr: 'هاني الرفاعي' },
    { id: 'ar.faresabbad', name: 'Fares Abbad', nameAr: 'فارس عباد' },
];

interface ReciterMatch {
    reciterId: string;
    reciterName: string;
    reciterNameAr: string;
    confidence: number;
}

interface AudioFingerprint {
    frequencies: Float32Array;
    amplitudes: Float32Array;
}

/**
 * Extract audio fingerprint (frequency spectrum) from audio data
 */
async function extractFingerprint(audioBlob: Blob): Promise<AudioFingerprint> {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio data
    const audioData = audioBuffer.getChannelData(0);

    // Use FFT to get frequency spectrum
    const fftSize = 2048;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;

    // Create a buffer source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);

    // Get frequency data
    const frequencies = new Float32Array(analyser.frequencyBinCount);
    const amplitudes = new Float32Array(analyser.frequencyBinCount);

    // Compute simple spectral features (mean amplitude per frequency bin)
    const frameSize = Math.floor(audioData.length / 10); // 10 frames
    for (let frame = 0; frame < 10; frame++) {
        const start = frame * frameSize;
        const end = Math.min(start + frameSize, audioData.length);

        for (let i = start; i < end; i++) {
            const binIndex = Math.floor((i - start) / frameSize * analyser.frequencyBinCount);
            if (binIndex < amplitudes.length) {
                amplitudes[binIndex] += Math.abs(audioData[i]);
            }
        }
    }

    // Normalize
    const maxAmplitude = Math.max(...amplitudes);
    if (maxAmplitude > 0) {
        for (let i = 0; i < amplitudes.length; i++) {
            amplitudes[i] /= maxAmplitude;
        }
    }

    await audioContext.close();

    return { frequencies, amplitudes };
}

/**
 * Compare two audio fingerprints and return similarity score (0-1)
 */
function compareFingerprints(fp1: AudioFingerprint, fp2: AudioFingerprint): number {
    let similarity = 0;
    const length = Math.min(fp1.amplitudes.length, fp2.amplitudes.length);

    // Cosine similarity on amplitude vectors
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < length; i++) {
        dotProduct += fp1.amplitudes[i] * fp2.amplitudes[i];
        norm1 += fp1.amplitudes[i] * fp1.amplitudes[i];
        norm2 += fp2.amplitudes[i] * fp2.amplitudes[i];
    }

    if (norm1 > 0 && norm2 > 0) {
        similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    return similarity;
}

/**
 * Get audio URL for a specific reciter and ayah
 */
function getReciterAudioUrl(reciterId: string, ayahNumber: number): string {
    const baseUrls: Record<string, string> = {
        'ar.alafasy': 'https://cdn.islamic.network/quran/audio/128/ar.alafasy',
        'ar.abdulbasit': 'https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal',
        'ar.husary': 'https://cdn.islamic.network/quran/audio/128/ar.husary',
        'ar.minshawi': 'https://cdn.islamic.network/quran/audio/128/ar.minshawi',
        'ar.abdurrahmaansudais': 'https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais',
        'ar.saadalghamdi': 'https://cdn.islamic.network/quran/audio/128/ar.saadalghamdi',
        'ar.mahermuaiqly': 'https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly',
        'ar.ahmedajamy': 'https://cdn.islamic.network/quran/audio/128/ar.ahmedajamy',
        'ar.haborehman': 'https://cdn.islamic.network/quran/audio/128/ar.hanirifai',
        'ar.faresabbad': 'https://cdn.islamic.network/quran/audio/128/ar.faresabbad',
    };
    return `${baseUrls[reciterId] || baseUrls['ar.alafasy']}/${ayahNumber}.mp3`;
}

/**
 * Convert ayah number in surah to global ayah number
 */
function getGlobalAyahNumber(surah: number, ayahInSurah: number): number {
    // Cumulative ayah counts for each surah
    const SURAH_AYAH_COUNTS = [
        0, 7, 293, 493, 669, 789, 954, 1160, 1235, 1364, 1473, 1596, 1707, 1750, 1802, 1901, 2029,
        2140, 2250, 2348, 2483, 2595, 2673, 2791, 2855, 2932, 3159, 3252, 3340, 3409, 3469, 3503,
        3533, 3606, 3660, 3705, 3788, 3970, 4058, 4133, 4218, 4272, 4325, 4414, 4473, 4510, 4545,
        4583, 4612, 4630, 4675, 4735, 4784, 4846, 4901, 4979, 5075, 5104, 5126, 5150, 5163, 5177,
        5188, 5199, 5217, 5229, 5241, 5271, 5323, 5375, 5419, 5447, 5475, 5495, 5551, 5591, 5622,
        5672, 5712, 5758, 5800, 5829, 5848, 5884, 5909, 5931, 5948, 5967, 5993, 6023, 6043, 6058,
        6079, 6090, 6098, 6106, 6125, 6130, 6138, 6146, 6157, 6168, 6176, 6179, 6188, 6193, 6197,
        6204, 6207, 6213, 6221, 6225, 6230, 6236
    ];

    if (surah < 1 || surah > 114) return 1;
    return SURAH_AYAH_COUNTS[surah - 1] + ayahInSurah;
}

/**
 * Fetch audio from URL and convert to Blob
 */
async function fetchAudioBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
    return await response.blob();
}

/**
 * Identify the reciter by comparing captured audio with known reciter samples
 */
export async function identifyReciter(
    capturedAudio: Blob,
    surah: number,
    ayah: number,
    onProgress?: (reciterName: string, progress: number) => void
): Promise<ReciterMatch | null> {
    try {
        // Extract fingerprint from captured audio
        const capturedFingerprint = await extractFingerprint(capturedAudio);

        const globalAyah = getGlobalAyahNumber(surah, ayah);

        let bestMatch: ReciterMatch | null = null;
        let bestScore = 0;

        // Compare with each reciter
        for (let i = 0; i < RECITERS.length; i++) {
            const reciter = RECITERS[i];
            onProgress?.(reciter.name, (i + 1) / RECITERS.length);

            try {
                const audioUrl = getReciterAudioUrl(reciter.id, globalAyah);
                const reciterAudioBlob = await fetchAudioBlob(audioUrl);
                const reciterFingerprint = await extractFingerprint(reciterAudioBlob);

                const similarity = compareFingerprints(capturedFingerprint, reciterFingerprint);

                if (similarity > bestScore) {
                    bestScore = similarity;
                    bestMatch = {
                        reciterId: reciter.id,
                        reciterName: reciter.name,
                        reciterNameAr: reciter.nameAr,
                        confidence: similarity
                    };
                }
            } catch (err) {
                console.warn(`Failed to compare with ${reciter.name}:`, err);
            }
        }

        // Only return if confidence is above threshold
        if (bestMatch && bestMatch.confidence > 0.15) {
            return bestMatch;
        }

        return null;
    } catch (err) {
        console.error('Error identifying reciter:', err);
        return null;
    }
}

export { RECITERS };
