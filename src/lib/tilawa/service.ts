import type { RecognitionCallbacks } from "../speechRecognition";
import type { Passage } from "../learning";
import { recitationWords } from "../recitationMatching";
import { cachedTilawaFile, tilawaPackStatus } from "./assets";
import { corpusWordOffset, issueLabels, recognizedIndices } from "./feedback";
import type { EngineCommand, EngineResult } from "./protocol";
import { SearchEndpoint } from "./searchEndpoint";
export interface SearchCallbacks {
  onVerse: (p: Passage) => void;
  onStatus: (message: string) => void;
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
export class TilawaService {
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
    expected: Passage | undefined,
    makeConsumer: (init: EngineResult) => (r: EngineResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onAutoFinish?: () => void,
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
      const init = await this.command({ type: "begin", expected });
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
  startSearch(callbacks: SearchCallbacks) {
    let found = false;
    return this.begin(
      undefined,
      () => (result) => {
        if(found) return;
        for (const event of result.events) {
          const verse = event.type === "verse_match" ? event
            : event.type === "final_sequence" ? event.verses[0] : undefined;
          if(verse) {
            found = true;
            callbacks.onVerse({surah:verse.surah,ayah:verse.ayah});
            void this.stop();
            callbacks.onEnd();
            return;
          }
          if (event.type === "verse_candidate" && event.candidates.length)
            callbacks.onStatus("Je recherche votre passage…");
        }
      },
      callbacks.onError,
      callbacks.onEnd,
      () => callbacks.onStatus("Recherche du verset…"),
    );
  }
}
export const tilawaService = new TilawaService();
