import {narrationKey} from './narrationText';
export interface RecordedNarration {
    text: string; url: string; duration: number;
    sentences: {sentence: number; start: number; end: number}[];
}
interface Manifest {entries: Record<string, RecordedNarration>}
let manifest: Promise<Manifest> | undefined;
export async function getRecordedNarration(text: string): Promise<RecordedNarration | null> {
    if (!manifest) manifest = fetch(`${import.meta.env.BASE_URL}audio/narration/fr-v1/manifest.json`, {signal:AbortSignal.timeout(8000)})
        .then(r => {if (!r.ok) throw new Error('Narration indisponible'); return r.json() as Promise<Manifest>;})
        .catch(error => {manifest = undefined; throw error;});
    const item = (await manifest).entries[narrationKey(text)];
    return item?.text === text ? item : null;
}
export function narrationSentenceAt(entry: RecordedNarration, seconds: number): number {
    for (let i=entry.sentences.length-1;i>=0;i--) if(entry.sentences[i].start<=seconds)return entry.sentences[i].sentence;
    return 0;
}
