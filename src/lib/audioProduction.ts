/** Shared with the production Worker: no credentials or provider calls here. */
export const AUDIO_CATEGORIES = { prophet: 'Prophètes', story: 'Histoires et moralités', academy: 'Académie', invocation: 'Invocations · sens français', journey: 'Parcours', tafsir: 'Comprendre le Coran' } as const;
export type AudioCategory = keyof typeof AUDIO_CATEGORIES;
export interface LibraryAudio {
  id: string; title: string; category: AudioCategory; text: string; sourceUrl: string;
  reference: string; url: string; duration: number; bytes: number; narrator: string;
  sha256?: string; sentences: {sentence: number; start: number; end: number}[];
}
export interface AudioScript {
  id: string; title: string; category: AudioCategory; text: string; original_text: string;
  source_url: string; reference: string; rights: string; approved_by: string | null;
}
export interface VoiceProfile {
  id: string; name: string; voice_id: string; model_id: 'eleven_multilingual_v2';
  stability: number; similarity: number; style: number; credits_per_character: number;
}
export function assertFrenchScript(text: string) {
  if (typeof text !== 'string' || !text.trim() || text.length > 4000) throw new Error('Le script doit contenir entre 1 et 4 000 caractères. Divisez les longs cours en parties.');
  // Arabic source texts never enter this French narration production pipeline.
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(text)) throw new Error('La production est réservée au français. Conservez les récitations arabes humaines séparément.');
  if (!/[a-zà-ÿ]/i.test(text)) throw new Error('Un script français est requis.');
}
export function assertVoice(v: VoiceProfile) {
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(v.voice_id) || v.model_id !== 'eleven_multilingual_v2') throw new Error('Voix ou modèle non autorisé.');
  for (const n of [v.stability, v.similarity, v.style]) if (!Number.isFinite(n) || n < 0 || n > 1) throw new Error('Réglages vocaux invalides.');
  if (!Number.isFinite(v.credits_per_character) || v.credits_per_character < 1 || v.credits_per_character > 10) throw new Error('Tarif de la voix à vérifier (1 à 10 crédits/caractère).');
}
export async function sha256(value: string | ArrayBuffer) {
  const result = await crypto.subtle.digest('SHA-256', typeof value === 'string' ? new TextEncoder().encode(value) : value);
  return Array.from(new Uint8Array(result), b => b.toString(16).padStart(2, '0')).join('');
}
export function productionIdentity(text: string, voice: VoiceProfile) {
  // Deliberately independent of account: switching account cannot defeat deduplication.
  return JSON.stringify([text, voice.voice_id, voice.model_id, voice.stability, voice.similarity, voice.style, 'fr', 'mp3_44100_128', 'normalization-auto-v1']);
}
export function estimatedCredits(text: string, voice: VoiceProfile) {
  assertFrenchScript(text); assertVoice(voice);
  const estimate = Math.ceil(text.length * voice.credits_per_character);
  return {estimate, reserved: Math.ceil(estimate * 1.15)};
}
export interface Alignment {characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[]}
function matchingAlignment(text: string, alignment: Alignment | null): alignment is Alignment {
  return !!alignment && Array.isArray(alignment.characters) && Array.isArray(alignment.character_start_times_seconds)
    && Array.isArray(alignment.character_end_times_seconds) && alignment.characters.join('') === text
    && alignment.characters.every(character => typeof character === 'string' && Array.from(character).length === 1)
    && alignment.characters.length === Array.from(text).length
    && alignment.characters.length === alignment.character_start_times_seconds.length
    && alignment.characters.length === alignment.character_end_times_seconds.length;
}
export function alignmentDuration(text: string, alignment: Alignment | null): number {
  if (!matchingAlignment(text, alignment)) return 0;
  const starts = alignment.character_start_times_seconds, ends = alignment.character_end_times_seconds;
  if (starts.some((v,i) => !Number.isFinite(v) || v < 0 || !Number.isFinite(ends[i]) || ends[i] < v
    || (i > 0 && (v < starts[i-1] || ends[i] < ends[i-1])))) return 0;
  return ends.at(-1) || 0;
}
/** History recovery has returned character durations in the end-times field.
 * Accept that encoding only when every duration agrees with the next absolute
 * start (within the provider's millisecond rounding). Never guess missing marks.
 */
export function historyAlignment(text: string, alignment: Alignment | null): Alignment | null {
  if (alignmentDuration(text, alignment)) return alignment;
  if (!matchingAlignment(text, alignment) || alignment.characters.length < 2) return null;
  const starts = alignment.character_start_times_seconds, durations = alignment.character_end_times_seconds;
  if (starts.some((start,i) => !Number.isFinite(start) || start < 0 || !Number.isFinite(durations[i]) || durations[i] < 0
    || (i > 0 && start < starts[i-1])
    || (i < starts.length-1 && Math.abs(start + durations[i] - starts[i+1]) > 0.002))) return null;
  const absolute = {...alignment, character_end_times_seconds: starts.map((start,i) => start + durations[i])};
  return alignmentDuration(text, absolute) ? absolute : null;
}
export function sentenceTimings(text: string, alignment: Alignment | null) {
  if (!alignment || !alignmentDuration(text, alignment)) return [];
  const starts = alignment.character_start_times_seconds, ends = alignment.character_end_times_seconds;
  let offset = 0;
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence, i) => {
    const start = text.indexOf(sentence, offset); offset = start + sentence.length;
    // Provider indices are Unicode code points, unlike JS string offsets.
    const a = Array.from(text.slice(0, start)).length, b = Array.from(text.slice(0, offset)).length - 1;
    return {sentence: i, start: starts[a], end: ends[b]};
  });
}
