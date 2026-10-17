export const MAX_VOICE_FILE_BYTES = 40 * 1024 * 1024;
export const MAX_VOICE_FILE_SECONDS = 300;
export const MAX_VOICE_EXCERPT_SECONDS = 30;
export function voiceFileError(file: Pick<File, 'size' | 'type' | 'name'>): string | null {
    if (file.size > MAX_VOICE_FILE_BYTES) return 'Choisissez un fichier de moins de 40 Mo.';
    if (!file.size) return 'Ce fichier est vide.';
    if (!/^(audio|video)\//.test(file.type) && !/\.(mp3|mp4|m4a|wav|ogg|webm|mov|aac)$/i.test(file.name)) return 'Choisissez un fichier audio ou vidéo.';
    return null;
}
export function voiceExcerpt(buffer: AudioBuffer, start: number, end: number): Float32Array {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > buffer.duration + .05 || end - start < .5 || end - start > MAX_VOICE_EXCERPT_SECONDS + .05) throw new Error('Choisissez un extrait de 1 à 30 secondes.');
    const length = Math.floor((end - start) * 16000);
    const result = new Float32Array(length);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, channel) => buffer.getChannelData(channel));
    // AudioContext decodes at 16 kHz. Interpolation also handles implementations
    // that return a different rate without changing the excerpt boundaries.
    for (let index = 0; index < length; index++) {
        const position = (start + index / 16000) * buffer.sampleRate, left = Math.floor(position), fraction = position - left;
        for (const data of channels) result[index] += ((data[left] ?? 0) * (1 - fraction) + (data[left + 1] ?? data[left] ?? 0) * fraction) / channels.length;
    }
    return result;
}
export async function decodeVoiceFile(file: File, start: number, end: number, signal: AbortSignal): Promise<Float32Array> {
    const error = voiceFileError(file); if (error) throw new Error(error);
    signal.throwIfAborted();
    const context = new AudioContext({ sampleRate: 16000 });
    try {
        const bytes = await file.arrayBuffer(); signal.throwIfAborted();
        let decoded: AudioBuffer;
        try { decoded = await context.decodeAudioData(bytes); }
        catch { throw new Error('La piste audio de ce fichier ne peut pas être lue ici. Essayez un extrait MP3 ou M4A.'); }
        signal.throwIfAborted();
        if (decoded.duration > MAX_VOICE_FILE_SECONDS) throw new Error('Raccourcissez votre fichier à 5 minutes maximum avant de l’importer.');
        // A video can outlast its audio track. Crop to real audio rather than
        // rejecting an otherwise valid excerpt because of a silent video tail.
        const audioEnd = Math.min(end, decoded.duration);
        if (audioEnd - start < .5) throw new Error('Cet extrait ne contient pas de piste audio. Choisissez un début plus tôt.');
        return voiceExcerpt(decoded, start, audioEnd);
    } finally { if (context.state !== 'closed') await context.close().catch(() => undefined); }
}
