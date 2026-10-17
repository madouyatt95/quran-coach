import type { RecognitionCallbacks } from "../speechRecognition";
import type { Ayah } from "../../types";
import type { Passage } from "../learning";
import { recitationWords } from "../recitationMatching";
import { cachedTilawaFile, tilawaPackStatus } from "./assets";
import { corpusWordOffset, issueLabels, recognizedIndices } from "./feedback";
import type { EngineCommand, EngineResult } from "./protocol";
import { SearchEndpoint } from "./searchEndpoint";
import { FreeRecitationGate, type FreeRecitationCallbacks } from "./freeRecitation";
import { validVoicePassage } from '../voiceHistory';
export interface SearchCallbacks {
  onVerse: (p: Passage) => void;
  onStatus: (message: string) => void;
  onLevel?: (level: number) => void;
  onCandidates?: (passages: Passage[]) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}
export interface TrackingPosition extends Passage {
  wordIndex: number;
  words: string[];
}
export interface TrackingCallbacks extends SearchCallbacks {
  onProgress?: (position: TrackingPosition) => void;
}
export interface FreeCallbacks extends SearchCallbacks, FreeRecitationCallbacks {
  onLevel?: (level: number) => void;
}
export class TilawaService {
  private freeGate: FreeRecitationGate | null = null;
  private flushDone: (() => void) | null = null;
  private finishing = false;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private worker: Worker | null = null;
  private requests = new Map<
    number,
    { resolve: (r: EngineResult) => void; reject: (e: Error) => void }
  >();
  private seq = 0;
  private stream: MediaStream | null = null;
  private context: AudioContext | null = null;
  private capture: AudioWorkletNode | null = null;
  private generation = 0;
  private inFlight = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private consume: ((result: EngineResult) => void) | null = null;
  private onEnd: (() => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private command(command: EngineCommand): Promise<EngineResult> {
    if (!this.worker) {
      this.worker = new Worker(new URL("./engine.worker.ts", import.meta.url), {
        type: "module",
      });
      this.worker.onmessage = ({ data }: { data: EngineResult }) => {
        const pending = this.requests.get(data.id);
        if (!pending) return;
        this.requests.delete(data.id);
        if (data.error) pending.reject(new Error(data.error));
        else pending.resolve(data);
      };
      this.worker.onerror = () => {
        const error = new Error(
          "Le moteur local ne peut pas démarrer sur cet appareil. Utilisez le moteur standard.",
        );
        for (const r of this.requests.values()) r.reject(error);
        this.requests.clear();
        this.destroyWorker();
      };
    }
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      const timer = setTimeout(
        () => {
          this.destroyWorker(new Error("Le moteur local met trop de temps à répondre. Réessayez ou utilisez le moteur standard."));
        },
        command.type === "begin" ? 120000 : 45000,
      );
      this.requests.set(id, {
        resolve: (r) => {
          clearTimeout(timer);
          resolve(r);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      this.worker!.postMessage({ ...command, id });
    });
  }
  private destroyWorker(error = new Error("Écoute annulée")) {
    this.worker?.terminate();
    this.worker = null;
    for (const r of this.requests.values())
      r.reject(error);
    this.requests.clear();
  }
  private async releaseMic() {
    this.flushDone?.();
    this.flushDone = null;
    this.capture?.disconnect();
    this.capture = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    const context = this.context;
    this.context = null;
    if (context && context.state !== "closed")
      await context.close().catch(() => undefined);
  }
  async stop() {
    ++this.generation;
    this.freeGate = null;
    if(this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.finishing = false;
    this.consume = null;
    this.onEnd = null;
    this.onError = null;
    await this.releaseMic();
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.destroyWorker(), 30000);
  }
  private async flushCapture() {
    const capture = this.capture;
    if (!capture) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        this.flushDone = null;
        resolve();
      }, 1500);
      this.flushDone = () => {
        clearTimeout(timer);
        resolve();
      };
      capture.port.postMessage("flush");
    });
  }
  async finish() {
    if (this.finishing || !this.consume) return;
    this.finishing = true;
    if(this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = null;
    const generation = this.generation;
    try {
      await this.flushCapture();
      if (generation !== this.generation) return;
      await this.releaseMic();
      const result = await this.command({ type: "finish" });
      if (generation !== this.generation) return;
      this.consume?.(result);
      this.onEnd?.();
    } catch (e) {
      if (generation === this.generation) {
        this.onError?.(e instanceof Error ? e.message : "Écoute interrompue");
        this.onEnd?.();
      }
    } finally {
      if (generation === this.generation) await this.stop();
    }
  }
  private async begin(
    expected: (Passage & { ayahEnd?: number }) | undefined,
    makeConsumer: (init: EngineResult) => (r: EngineResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onAutoFinish?: () => void,
    continuous = false,
    onLevel?: (level: number) => void,
  ): Promise<boolean> {
    const releasing = this.stop();
    const generation = this.generation;
    const current = () => this.generation === generation;
    await releasing;
    if (!current()) return false;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    try {
      if (!(await tilawaPackStatus()).ready)
        throw new Error(
          "Téléchargez le pack Tilawa dans Stockage avant de démarrer.",
        );
      if (!current()) return false;
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof AudioWorkletNode === "undefined"
      )
        throw new Error(
          "L’écoute locale n’est pas disponible ici. Essayez le moteur standard.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      if (!current()) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      this.stream = stream;
      const context = new AudioContext();
      this.context = context;
      await context.resume();
      const init = await this.command({ type: "begin", expected, continuous });
      if (!current()) return false;
      this.consume = makeConsumer(init);
      this.onEnd = onEnd;
      this.onError = onError;
      const worklet = URL.createObjectURL(
        new Blob(
          [await (await cachedTilawaFile("capture-worklet.js")).text()],
          { type: "text/javascript" },
        ),
      );
      try {
        await context.audioWorklet.addModule(worklet);
      } finally {
        URL.revokeObjectURL(worklet);
      }
      if (!current()) return false;
      const capture = new AudioWorkletNode(context, "quran-pcm-capture");
      this.capture = capture;
      const muted = context.createGain();
      muted.gain.value = 0;
      context.createMediaStreamSource(stream).connect(capture);
      capture.connect(muted);
      muted.connect(context.destination);
      let frames = 0;
      const endpoint = onAutoFinish ? new SearchEndpoint() : null;
      const finishSearch = () => {
        if (!current() || this.finishing) return;
        onAutoFinish?.();
        void this.finish();
      };
      if(onAutoFinish) this.searchTimer = setTimeout(finishSearch, 30000);
      capture.port.onmessage = ({
        data,
      }: {
        data: Float32Array | "flushed";
      }) => {
        if (data === "flushed") {
          this.flushDone?.();
          this.flushDone = null;
          return;
        }
        if (!current()) return;
        if (onLevel) {
          let energy = 0;
          for (const sample of data) energy += sample * sample;
          onLevel(Math.min(1, Math.sqrt(energy / Math.max(1, data.length)) * 12));
        }
        // Bound memory if inference cannot keep up; do not silently drop recitation audio.
        if (this.inFlight >= 8 || ++frames > 625) {
          onError(
            this.inFlight >= 8
              ? "Cet appareil ne suit pas assez vite. Reprenez un passage plus court ou utilisez le moteur standard."
              : "Limite de 5 minutes atteinte. Reprenez une nouvelle écoute.",
          );
          void this.stop();
          onEnd();
          return;
        }
        this.inFlight++;
        void this.command({ type: "audio", samples: data })
          .then((result) => {
            if (current()) this.consume?.(result);
          })
          .catch((e) => {
            if (current()) {
              onError(e instanceof Error ? e.message : "Écoute interrompue");
              void this.stop();
              onEnd();
            }
          })
          .finally(() => {
            this.inFlight--;
          });
        if(endpoint?.push(data)) finishSearch();
      };
      return true;
    } catch (error) {
      if (current()) {
        onError(
          error instanceof Error ? error.message : "Microphone indisponible",
        );
        await this.stop();
        onEnd();
      }
      return false;
    }
  }
  start(
    text: string,
    callbacks: RecognitionCallbacks,
    startIndex: number,
    expected: Passage,
  ): Promise<boolean> {
    const words = recitationWords(text);
    let previous = new Set<number>();
    const issues = new Set<number>();
    return this.begin(
      expected,
      (init) => {
        const offset = init.words ? corpusWordOffset(words, init.words, expected.surah, expected.ayah) : null;
        if (offset === null)
          throw new Error(
            "Le découpage de ce verset diffère du corpus vocal. Utilisez le moteur standard pour ce passage.",
          );
        const first = Math.max(startIndex, offset);
        callbacks.onCurrentWord(first);
        if(offset) callbacks.onInterimResult("La basmala d’ouverture n’est pas évaluée ; le suivi commence au verset.");
        return (result) => {
          const next = new Set(Array.from(recognizedIndices(
            result.verdicts,
            expected.surah,
            expected.ayah,
            Math.max(0, startIndex - offset),
          ), index => index + offset));
          for (const index of previous)
            if (!next.has(index) && !issues.has(index))
              callbacks.onWordReset?.(index);
          for (const index of next)
            if (!previous.has(index) && !issues.has(index))
              callbacks.onWordMatch(index, true, words[index]);
          previous = next;
          for (const event of result.events) {
            if (
              event.type === "correction" &&
              event.state.phase === "error" &&
              event.state.issue
            ) {
              const issue = event.state.issue;
              if (
                issue.surah === expected.surah &&
                issue.ayah === expected.ayah &&
                issue.word + offset >= startIndex
              ) {
                issues.add(issue.word + offset);
                callbacks.onWordMatch(
                  issue.word + offset,
                  false,
                  issueLabels[issue.kind] || "Passage à vérifier",
                );
                callbacks.onInterimResult(
                  issueLabels[issue.kind] || "Passage à vérifier",
                );
              }
              // Pause for an explicit retry instead of discarding correction evidence.
              void this.releaseMic();
              callbacks.onEnd();
            }
          }
          const last = words.length - 1;
          // Only complete if all remaining words have an explicit result. Uncertain words remain ungraded.
          const finished = words.every(
            (_, i) => i < first || next.has(i) || issues.has(i),
          );
          const cursor = finished
            ? words.length
            : Math.min(
                last,
                Math.max(first, ...Array.from(next).map((i) => i + 1)),
              );
          callbacks.onCurrentWord(cursor);
        };
      },
      callbacks.onError,
      callbacks.onEnd,
    );
  }
  startPassage(ayahs: Ayah[], callbacks: RecognitionCallbacks, startIndex = 0): Promise<boolean> {
    const first = ayahs[0];
    if (!first || ayahs.some((a,i)=>a.surah !== first.surah || a.numberInSurah !== first.numberInSurah+i)) {
      callbacks.onError("Choisissez un passage consécutif dans une sourate.");
      return Promise.resolve(false);
    }
    const words = ayahs.flatMap(a=>recitationWords(a.text));
    const known = new Map<number, boolean>();
    let cursor = startIndex;
    return this.begin({surah:first.surah, ayah:first.numberInSurah, ayahEnd:ayahs.at(-1)!.numberInSurah}, init => {
      let base = 0;
      const mapping = new Map<number, {base:number; offset:number; length:number}>();
      for (const a of ayahs) {
        const tokens = recitationWords(a.text);
        const offset = corpusWordOffset(tokens, init.passageWords?.[a.numberInSurah] || [], a.surah, a.numberInSurah);
        if (offset === null) throw new Error("Le découpage de ce passage diffère du corpus vocal. Utilisez le moteur standard.");
        mapping.set(a.numberInSurah, {base, offset, length:tokens.length}); base += tokens.length;
      }
      callbacks.onCurrentWord(startIndex);
      return result => {
        for (const v of result.verdicts) {
          const m = mapping.get(v.ayah);
          if (!m || v.surah !== first.surah) continue;
          const index = m.base + m.offset + v.word;
          if (index < startIndex || index >= m.base + m.length) continue;
          if (v.state === 'ok') {
            if (known.get(index) !== true) callbacks.onWordMatch(index, true, words[index]);
            known.set(index,true);
          } else if (known.get(index) === true) {
            known.delete(index); callbacks.onWordReset?.(index);
          }
        }
        for (const e of result.events) {
          if (e.type === 'correction' && e.state.phase === 'error' && e.state.issue) {
            const issue = e.state.issue, m = mapping.get(issue.ayah);
            if (!m || issue.surah !== first.surah) continue;
            const index = m.base + m.offset + issue.word;
            if (index >= startIndex && index < m.base + m.length) {
              const message = issueLabels[issue.kind] || 'Passage à vérifier';
              callbacks.onUncertain?.(index,message);
              known.set(index,false);
              callbacks.onInterimResult(message);
            }
          }
          if (e.type === 'word_progress' && e.surah === first.surah) {
            const m = mapping.get(e.ayah);
            if (m) cursor = Math.max(startIndex, m.base + m.offset + e.word_index);
          }
        }
        const last = words.length - 1;
        if (known.get(last) === true) cursor = words.length;
        callbacks.onCurrentWord(Math.min(cursor,words.length));
      };
    }, callbacks.onError, callbacks.onEnd, undefined, true);
  }
  startFreeRecitation(callbacks: FreeCallbacks) {
    return this.begin(undefined, () => {
      const gate = new FreeRecitationGate(callbacks);
      this.freeGate = gate;
      return result => gate.consume(result);
    }, callbacks.onError, callbacks.onEnd, undefined, false, callbacks.onLevel);
  }
  confirmFreePassage(passage: Passage): boolean {
    return this.freeGate?.confirm(passage) ?? false;
  }
  startTracking(callbacks: TrackingCallbacks) {
    let previous = '';
    let hasCursor = false;
    let lastPosition = '';
    return this.begin(undefined, () => result => {
      // A verse_match can arrive after the cursor has moved on. Never move back
      // to a completed verse, or repaint every intermediate word in one batch.
      const cursor = [...result.events].reverse().find(e => e.type === 'word_progress');
      if (cursor) hasCursor = true;
      const event = cursor ?? (!hasCursor ? [...result.events].reverse().find(e => e.type === 'verse_match') : undefined);
      if (!event || (event.type !== 'word_progress' && event.type !== 'verse_match')) return;
      const key = `${event.surah}:${event.ayah}`;
      if (key !== previous) {
        previous = key;
        callbacks.onVerse({surah:event.surah, ayah:event.ayah});
      }
      const positionKey = event.type === 'word_progress' ? `${key}:${event.word_index}` : '';
      if (event.type === 'word_progress' && result.cursorWords?.length && positionKey !== lastPosition) {
        lastPosition = positionKey;
        callbacks.onProgress?.({surah:event.surah, ayah:event.ayah,
          wordIndex:event.word_index, words:result.cursorWords});
      }
    }, callbacks.onError, callbacks.onEnd);
  }
  private searchConsumer(callbacks: SearchCallbacks, onMatch: () => void) {
    let found = false;
    return (result: EngineResult) => {
        if(found) return;
        for (const event of result.events) {
          const verse = event.type === "verse_match" ? event
            : event.type === "final_sequence" ? event.verses[0] : undefined;
          if(verse && validVoicePassage(verse)) {
            found = true;
            callbacks.onCandidates?.([]);
            callbacks.onVerse({surah:verse.surah,ayah:verse.ayah});
            onMatch();
            return;
          }
          if (event.type === "verse_candidate" && event.candidates.length) {
            const seen = new Set<string>();
            callbacks.onCandidates?.(event.candidates.filter(p => {
              const key = `${p.surah}:${p.ayah}`;
              if (!validVoicePassage(p) || seen.has(key)) return false;
              seen.add(key); return true;
            }).slice(0, 3).map(p => ({surah:p.surah, ayah:p.ayah})));
            callbacks.onStatus("Je recherche votre passage…");
          }
        }
    };
  }
  /** Feed bounded local file audio sequentially: no microphone and no dropped chunks. */
  async searchSamples(samples: Float32Array, callbacks: SearchCallbacks, onProgress: (value: number) => void) {
    const releasing = this.stop(), generation = this.generation;
    const current = () => generation === this.generation;
    await releasing;
    if (!current()) return;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    let matched = false;
    const consume = this.searchConsumer(callbacks, () => { matched = true; });
    try {
      if (samples.length < 8000 || samples.length > 16000 * 30 || samples.some(n => !Number.isFinite(n))) throw new Error('Choisissez un extrait de 1 à 30 secondes.');
      if (!(await tilawaPackStatus()).ready) throw new Error('Téléchargez le pack vocal avant de démarrer.');
      if (!current()) return;
      await this.command({type:'begin'});
      if (!current()) return;
      for (let offset = 0; offset < samples.length && !matched; offset += 7680) {
        const result = await this.command({type:'audio', samples:samples.slice(offset, offset + 7680)});
        if (!current()) return;
        consume(result);
        if (!current()) return;
        onProgress(Math.min(100, Math.round((offset + 7680) / samples.length * 100)));
      }
      if (!matched) { const result = await this.command({type:'finish'}); if (!current()) return; consume(result); }
      if (current()) { onProgress(100); callbacks.onEnd(); }
    } catch (error) {
      if (current()) { callbacks.onError(error instanceof Error ? error.message : 'Analyse indisponible.'); callbacks.onEnd(); }
    } finally { if (current()) await this.stop(); }
  }
  startSearch(callbacks: SearchCallbacks) {
    return this.begin(
      undefined,
      () => this.searchConsumer(callbacks, () => { void this.stop(); callbacks.onEnd(); }),
      callbacks.onError,
      callbacks.onEnd,
      () => callbacks.onStatus("Recherche du verset…"),
      false,
      callbacks.onLevel,
    );
  }
}
export const tilawaService = new TilawaService();
