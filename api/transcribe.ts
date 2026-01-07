import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY not configured');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { audio, expectedText } = req.body;

        if (!audio) {
            return res.status(400).json({ error: 'No audio provided' });
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, 'base64');

        // Create form data for OpenAI
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/webm' });
        formData.append('file', blob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'ar');
        formData.append('response_format', 'json');

        // Call OpenAI Whisper API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            return res.status(500).json({ error: 'Transcription failed', details: error });
        }

        const result = await response.json();
        const transcribed = result.text || '';

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

// Compare transcribed text with expected text
function compareArabicTexts(transcribed: string, expected: string) {
    const normalize = (text: string) => {
        return text
            .replace(/[\u064B-\u0652\u0670]/g, '')
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
