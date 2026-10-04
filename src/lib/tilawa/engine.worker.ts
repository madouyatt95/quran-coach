/// <reference lib="webworker" />
import * as ort from "onnxruntime-web/wasm";
import {
  createZipformerSession,
  QuranCorpus,
  type ZipformerSession,
  type WorkerOutbound,
} from "@tilawa/core";
import { cachedTilawaFile } from "./assets";
import type { EngineCommand, EngineResult } from "./protocol";
const worker = self as unknown as DedicatedWorkerGlobalScope;
let session: ZipformerSession | null = null;
let corpus: QuranCorpus | null = null;
let correction = false;
let queue: Promise<unknown> = Promise.resolve();
ort.env.wasm.numThreads = 1;
ort.env.wasm.initTimeout = 60000;
worker.onmessage = ({ data }: { data: EngineCommand & { id: number } }) => {
  queue = queue
    .then(async () => {
      let events: WorkerOutbound[] = [];
      let words: string[] | undefined;
      if (data.type === "begin") {
        if (!session) {
          const raw = await (await cachedTilawaFile("corpus.json")).json();
          corpus = new QuranCorpus(raw);
          const runtime = URL.createObjectURL(
            new Blob(
              [
                await (
                  await cachedTilawaFile("ort-wasm-simd-threaded.mjs")
                ).text(),
              ],
              { type: "text/javascript" },
            ),
          );
          const wasm = URL.createObjectURL(
            await (
              await cachedTilawaFile("ort-wasm-simd-threaded.wasm")
            ).blob(),
          );
          ort.env.wasm.wasmPaths = { mjs: runtime, wasm };
          try {
            session = await createZipformerSession({
              ort,
              model: () =>
                cachedTilawaFile("model.onnx").then((r) => r.arrayBuffer()),
              corpus: raw,
              executionProviders: ["wasm"],
            });
            // Run the first inference before capturing speech: WASM graph compilation
            // must not build an audio backlog while the UI says it is listening.
            await session.feed(new Float32Array(15360));
          } finally {
            URL.revokeObjectURL(runtime);
            URL.revokeObjectURL(wasm);
          }
        }
        session.reset();
        correction = !!data.expected;
        session.setMode(data.expected ? "correction" : "tracking");
        session.setExpected(data.expected || null);
        if (data.expected && corpus) {
          const first = corpus.ayahFirstWord(
            data.expected.surah,
            data.expected.ayah,
          );
          words = corpus.plain.slice(
            first,
            first +
              corpus.ayahWordCount(data.expected.surah, data.expected.ayah),
          );
        }
      } else if (session) {
        events =
          data.type === "audio"
            ? await session.feed(data.samples)
            : await session.stop();
      }
      const cursor = [...events].reverse().find(e => e.type === "word_progress");
      const cursorWords = cursor?.type === "word_progress" && corpus
        ? corpus.plain.slice(corpus.ayahFirstWord(cursor.surah, cursor.ayah),
          corpus.ayahFirstWord(cursor.surah, cursor.ayah) + corpus.ayahWordCount(cursor.surah, cursor.ayah))
        : undefined;
      const result: EngineResult = {
        id: data.id,
        events,
        verdicts: correction ? session?.verdicts() || [] : [],
        cursorWords,
        words,
      };
      worker.postMessage(result);
    })
    .catch((error) => {
      worker.postMessage({
        id: data.id,
        error:
          error instanceof Error ? error.message : "Erreur du moteur local",
        events: [],
        verdicts: [],
      });
    });
};
