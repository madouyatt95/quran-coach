import type { VercelRequest, VercelResponse } from '@vercel/node';

// HuggingFace Space URL (set in Vercel environment variables)
const HF_SPACE_URL = process.env.HF_SPACE_URL || '';

/**
 * Transcribe Arabic audio using HuggingFace Space (free, self-hosted).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { audio, expectedText, mimeType } = req.body;

        if (!audio) {
            return res.status(400).json({ error: 'No audio provided' });
        }

        if (!HF_SPACE_URL) {
            return res.status(503).json({ error: 'HF_SPACE_URL non configuré. Configurez la variable d\'environnement Vercel.' });
        }

        // Determine extension and type
        const isMp4 = mimeType?.includes('mp4') || mimeType?.includes('m4a');
        const extension = isMp4 ? 'm4a' : 'webm';
        const contentType = isMp4 ? 'audio/mp4' : 'audio/webm';

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, 'base64');

        let transcribed = '';

        try {
            transcribed = await transcribeWithHuggingFace(audioBuffer, contentType, extension);
        } catch (hfError) {
            console.error('HuggingFace Space error:', hfError);
            return res.status(503).json({
                error: 'Le service de transcription est temporairement indisponible. Réessayez dans quelques instants.',
                details: String(hfError)
            });
        }

        // Compare with expected text if provided
        let comparison = null;
        if (expectedText) {
            comparison = compareArabicTexts(transcribed, expectedText);
        }

        return res.status(200).json({ transcribed, comparison });
    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({ error: 'Server error', details: String(error) });
    }
}

/**
 * Transcribe using HuggingFace Space (Gradio API)
 */
async function transcribeWithHuggingFace(audioBuffer: Buffer, contentType: string, extension: string): Promise<string> {
    // Upload the audio file to HuggingFace Space via Gradio API
    const uploadResponse = await fetch(`${HF_SPACE_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: audioBuffer,
    });

    if (!uploadResponse.ok) {
        throw new Error(`HF upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    const filePath = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;

    // Call the predict endpoint
    const predictResponse = await fetch(`${HF_SPACE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: [{ name: `recording.${extension}`, data: filePath }],
        }),
    });

    if (!predictResponse.ok) {
        throw new Error(`HF predict failed: ${predictResponse.status}`);
    }

    const predictResult = await predictResponse.json();
    return predictResult.data?.[0] || '';
}

/**
 * Compare transcribed text with expected text (Arabic word matching)
 */
function compareArabicTexts(transcribed: string, expected: string) {
    const normalize = (text: string) => {
        return text
            .replace(/[\u064B-\u0652\u0670]/g, '') // Remove tashkeel
            .replace(/\s+/g, ' ')
            .trim();
    };

    const transcribedNorm = normalize(transcribed);
    const expectedNorm = normalize(expected);

    const transcribedWords = transcribedNorm.split(' ').filter(w => w.length > 0);
    const expectedWords = expectedNorm.split(' ').filter(w => w.length > 0);

    const matchedWords: string[] = [];
    const missedWords: string[] = [];

    let tIndex = 0;

    for (const expectedWord of expectedWords) {
        const transcribedWord = transcribedWords[tIndex];

        if (transcribedWord === expectedWord) {
            matchedWords.push(expectedWord);
            tIndex++;
        } else {
            const found = transcribedWords.slice(tIndex, tIndex + 3).indexOf(expectedWord);
            if (found !== -1) {
                tIndex += found + 1;
                matchedWords.push(expectedWord);
            } else {
                missedWords.push(expectedWord);
                tIndex++;
            }
        }
    }

    const accuracy = expectedWords.length > 0
        ? Math.round((matchedWords.length / expectedWords.length) * 100)
        : 100;

    return {
        correct: missedWords.length === 0,
        accuracy,
        matchedWords,
        missedWords,
    };
}
