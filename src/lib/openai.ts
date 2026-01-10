// OpenAI API integration for audio transcription

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * Transcribe audio using OpenAI Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    // Determine file extension based on MIME type
    let extension = 'webm';
    if (audioBlob.type.includes('mp4')) extension = 'mp4';
    else if (audioBlob.type.includes('wav')) extension = 'wav';
    else if (audioBlob.type.includes('ogg')) extension = 'ogg';

    const formData = new FormData();
    formData.append('file', audioBlob, `recording.${extension}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ar'); // Arabic

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
}
