import type { Passage } from '../learning';
import type { EngineResult } from './protocol';
import type { TrackingPosition } from './service';

const key = (p: Passage) => `${p.surah}:${p.ayah}`;
export interface FreeRecitationCallbacks {
  onVerse: (passage: Passage) => void;
  onProgress?: (position: TrackingPosition) => void;
  onCandidate: (passage: Passage | null) => void;
  onSearching: () => void;
}
/** A cursor is a location hypothesis, never evidence of memorization or tajwid. */
export class FreeRecitationGate {
  private current: Passage | null = null;
  private candidate: Passage | null = null;
  private proposed = '';
  private observations = 0;
  private position: TrackingPosition | null = null;
  private seeking = true;
  private callbacks: FreeRecitationCallbacks;
  constructor(callbacks: FreeRecitationCallbacks) { this.callbacks = callbacks; }
  private accept(p: Passage) {
    const changed = !this.current || key(this.current) !== key(p);
    this.current = {surah:p.surah, ayah:p.ayah};
    this.candidate = null;
    this.callbacks.onCandidate(null);
    if (changed) this.callbacks.onVerse(this.current);
    if (this.position && key(this.position) === key(p)) this.callbacks.onProgress?.(this.position);
  }
  confirm(p: Passage): boolean {
    if (!this.candidate || key(p) !== key(this.candidate)) return false;
    this.accept(p);
    return true;
  }
  consume(result: EngineResult) {
    if (result.trackingState === 'searching') {
      if (!this.seeking) this.callbacks.onSearching();
      this.seeking = true;
      this.proposed = ''; this.observations = 0; this.position = null;
      if (this.candidate) { this.candidate = null; this.callbacks.onCandidate(null); }
      return;
    }
    // The final cursor is newer than verse_match events from a completed verse.
    const cursor = [...result.events].reverse().find(e => e.type === 'word_progress');
    const match = [...result.events].reverse().find(e => e.type === 'verse_match');
    const discovery = [...result.events].reverse().find(e => e.type === 'verse_candidate');
    const event = cursor ?? (!this.current ? match : undefined);
    if (!event || (event.type !== 'word_progress' && event.type !== 'verse_match')) {
      if (!this.current && discovery?.type === 'verse_candidate' && discovery.candidates[0]) {
        const p = discovery.candidates[0];
        if (!this.candidate || key(this.candidate) !== key(p)) {
          this.candidate = {surah:p.surah,ayah:p.ayah};
          this.callbacks.onCandidate(this.candidate);
        }
      }
      return;
    }
    this.seeking = false;
    const p = {surah:event.surah,ayah:event.ayah};
    if (key(p) === this.proposed) this.observations++;
    else { this.proposed = key(p); this.observations = 1; }
    this.position = cursor && result.cursorWords?.length ? {...p,wordIndex:cursor.word_index,words:result.cursorWords} : null;
    const same = this.current && key(this.current) === key(p);
    const next = this.current && p.surah === this.current.surah && p.ayah === this.current.ayah + 1;
    const confirmed = match && key(match) === key(p);
    const supported = cursor && cursor.matched_indices?.length >= 2 && this.observations >= 2;
    if (same || next || (!this.current && (confirmed || supported))) {
      this.accept(p);
    } else if (!this.candidate || key(this.candidate) !== key(p)) {
      this.candidate = p;
      this.callbacks.onCandidate(p);
    }
  }
}
