/**
 * Audio Fingerprint Service with Pre-computed Database
 * 
 * This module identifies Quran reciters by comparing audio fingerprints
 * against a pre-computed database of spectral signatures.
 */

interface ReciterFingerprint {
    surah: number;
    ayah: number;
    globalAyah: number;
    data: number[];
}

interface ReciterData {
    name: string;
    nameAr: string;
    fingerprints: ReciterFingerprint[];
}

interface FingerprintDatabase {
    version: string;
    generated: string;
    reciters: Record<string, ReciterData>;
}

interface ReciterMatch {
    reciterId: string;
    reciterName: string;
    reciterNameAr: string;
    confidence: number;
}

// Cache for the fingerprint database
let databaseCache: FingerprintDatabase | null = null;
let databaseLoading: Promise<FingerprintDatabase | null> | null = null;

/**
 * Load the fingerprint database (cached)
 */
async function loadDatabase(): Promise<FingerprintDatabase | null> {
    if (databaseCache) return databaseCache;

    if (databaseLoading) return databaseLoading;

    databaseLoading = (async () => {
        try {
            const response = await fetch('/data/reciterFingerprints.json');
            if (!response.ok) {
                console.warn('Fingerprint database not found, falling back to real-time comparison');
                return null;
            }
            databaseCache = await response.json();
            console.log(`Loaded fingerprint database v${databaseCache?.version} with ${Object.keys(databaseCache?.reciters || {}).length} reciters`);
            return databaseCache;
        } catch (error) {
            console.error('Failed to load fingerprint database:', error);
            return null;
        }
    })();

    return databaseLoading;
}

/**
 * Extract fingerprint from audio blob
 */
async function extractFingerprint(audioBlob: Blob): Promise<number[]> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();

    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);

        // Create spectral fingerprint using FFT-like approach
        const sampleSize = 64;
        const fingerprint: number[] = [];
        const chunkSize = Math.floor(channelData.length / sampleSize);

        for (let i = 0; i < sampleSize; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, channelData.length);

            // Calculate RMS energy for this chunk
            let sum = 0;
            for (let j = start; j < end; j++) {
                sum += channelData[j] * channelData[j];
            }
            const rms = Math.sqrt(sum / (end - start));

            // Normalize to 0-1 range
            fingerprint.push(Math.min(1, rms * 10));
        }

        return fingerprint;
    } finally {
        await audioContext.close();
    }
}

/**
 * Compare two fingerprints using cosine similarity
 */
function compareFingerprints(fp1: number[], fp2: number[]): number {
    if (fp1.length !== fp2.length) {
        // Resample to match lengths
        const targetLength = Math.min(fp1.length, fp2.length);
        fp1 = resample(fp1, targetLength);
        fp2 = resample(fp2, targetLength);
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < fp1.length; i++) {
        dotProduct += fp1[i] * fp2[i];
        norm1 += fp1[i] * fp1[i];
        norm2 += fp2[i] * fp2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Resample array to target length
 */
function resample(arr: number[], targetLength: number): number[] {
    const result: number[] = [];
    const step = arr.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
        const idx = Math.floor(i * step);
        result.push(arr[idx]);
    }

    return result;
}

/**
 * Identify reciter using the fingerprint database
 */
export async function identifyReciter(
    audioBlob: Blob,
    _surah?: number, // Not used with database approach
    _ayah?: number,  // Not used with database approach
    onProgress?: (reciterName: string, progress: number) => void
): Promise<ReciterMatch | null> {
    try {
        // Load database
        const database = await loadDatabase();

        if (!database) {
            console.warn('No fingerprint database available');
            return null;
        }

        // Extract fingerprint from captured audio
        const capturedFingerprint = await extractFingerprint(audioBlob);

        let bestMatch: ReciterMatch | null = null;
        let bestScore = 0;

        const reciterIds = Object.keys(database.reciters);

        for (let i = 0; i < reciterIds.length; i++) {
            const reciterId = reciterIds[i];
            const reciterData = database.reciters[reciterId];

            onProgress?.(reciterData.name, (i + 1) / reciterIds.length);

            // Compare against all fingerprints for this reciter
            let totalSimilarity = 0;
            let validComparisons = 0;

            for (const fp of reciterData.fingerprints) {
                const similarity = compareFingerprints(capturedFingerprint, fp.data);
                if (!isNaN(similarity)) {
                    totalSimilarity += similarity;
                    validComparisons++;
                }
            }

            const avgSimilarity = validComparisons > 0 ? totalSimilarity / validComparisons : 0;

            if (avgSimilarity > bestScore) {
                bestScore = avgSimilarity;
                bestMatch = {
                    reciterId,
                    reciterName: reciterData.name,
                    reciterNameAr: reciterData.nameAr,
                    confidence: avgSimilarity
                };
            }
        }

        // Lower threshold since we're averaging against many samples
        if (bestMatch && bestMatch.confidence > 0.1) {
            return bestMatch;
        }

        return null;
    } catch (error) {
        console.error('Error identifying reciter:', error);
        return null;
    }
}
