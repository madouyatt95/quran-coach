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
                error: `Erreur HuggingFace: ${String(hfError)}`,
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
    const sessionHash = Math.random().toString(36).substring(2);

    // Upload the audio file to HuggingFace Space via Gradio API
    const uploadResponse = await fetch(`${HF_SPACE_URL}/upload?session_hash=${sessionHash}`, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: new Uint8Array(audioBuffer),
    });

    if (!uploadResponse.ok) {
        const errBody = await uploadResponse.text().catch(() => 'no body');
        console.error('HF Upload Error Body:', errBody);
        throw new Error(`HF upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    const filePath = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;

    // Call the predict endpoint
    // Gradio 4+ robust payload
    const predictResponse = await fetch(`${HF_SPACE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: [{
                path: filePath,
                orig_name: `recording.${extension}`,
                mime_type: contentType,
                size: audioBuffer.length,
                data: null,
                is_file: true
            }],
            event_data: null,
            fn_index: 0,
            session_hash: sessionHash
        }),
    });

    if (!predictResponse.ok) {
        const errText = await predictResponse.text().catch(() => 'no body');
        console.error('HF Predict Error Body:', errText);
        throw new Error(`HF predict failed: ${predictResponse.status}. Details: ${errText.substring(0, 100)}`);
    }

    const predictResult = await predictResponse.json();

    // Gradio returns a 'data' array with the output
    if (Array.isArray(predictResult.data)) {
        return predictResult.data[0] || '';
    }

    return '';
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
