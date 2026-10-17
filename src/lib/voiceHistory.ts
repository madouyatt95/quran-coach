import type { Passage } from './learning';
import chapters from './interactiveMushaf/chapters.json';
export const VOICE_HISTORY_KEY = 'quran-coach-voice-history-v1';
export interface VoiceHistoryEntry extends Passage { at: number }
export function validVoicePassage(p: Passage): boolean {
    return Number.isInteger(p.surah) && Number.isInteger(p.ayah) && p.ayah > 0 && p.ayah <= (chapters[p.surah - 1]?.count ?? 0);
}
export function readVoiceHistory(): VoiceHistoryEntry[] {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(VOICE_HISTORY_KEY) || '[]');
        return Array.isArray(value) ? value.filter(p => p && validVoicePassage(p) && Number.isFinite(p.at)).slice(0, 30) : [];
    } catch { return []; }
}
export function rememberVoicePassage(items: VoiceHistoryEntry[], passage: Passage, at = Date.now()): VoiceHistoryEntry[] {
    if (!validVoicePassage(passage)) return items;
    return [{ surah: passage.surah, ayah: passage.ayah, at }, ...items.filter(p => p.surah !== passage.surah || p.ayah !== passage.ayah)].slice(0, 30);
}
export function saveVoiceHistory(items: VoiceHistoryEntry[]): boolean {
    try { localStorage.setItem(VOICE_HISTORY_KEY, JSON.stringify(items)); return true; } catch { return false; }
}
