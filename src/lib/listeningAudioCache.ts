import { IMMERSIVE_VOICES } from "./listeningExperience";
export function audioDownloadUrl(url: string) {
  const match =
    /^https:\/\/cdn\.islamic\.network\/quran\/audio\/(\d+)\/(ar\.[a-z]+)\/(\d+)\.mp3$/.exec(
      url,
    );
  if (
    !match ||
    !IMMERSIVE_VOICES.some(
      (v) => v.id === match[2] && v.bitrate === Number(match[1]),
    ) ||
    Number(match[3]) < 1 ||
    Number(match[3]) > 6236
  )
    return url;
  // Keep the historical route for old text-reader packs.
  return match[2] === "ar.alafasy"
    ? `/offline-audio/${match[3]}.mp3`
    : `/verse-audio/${match[1]}/${match[2]}/${match[3]}.mp3`;
}
const ready = new Map<string, string>();
let pending: { url: string; controller: AbortController } | null = null;
export function prefetchedSource(url: string) {
  return ready.get(url) || url;
}
/** Retain only the playing verse and the next one. Never preload whole-surah files. */
export function preloadNextVerse(current: string, next?: string) {
  const keep = new Set([current, next]);
  for (const [url, blob] of ready)
    if (!keep.has(url)) {
      URL.revokeObjectURL(blob);
      ready.delete(url);
    }
  if (pending && pending.url !== next) {
    pending.controller.abort();
    pending = null;
  }
  if (
    !next ||
    ready.has(next) ||
    pending?.url === next ||
    audioDownloadUrl(next) === next
  )
    return;
  const controller = new AbortController();
  const request = { url: next, controller };
  pending = request;
  const timeout = setTimeout(() => controller.abort(), 15000);
  void (async () => {
    // Explicit offline packs take precedence, including in browsers without an active SW yet.
    let response: Response | undefined;
    if (typeof caches !== "undefined")
      for (const name of ["quran-coach-journeys-v1", "quran-coach-audio-v1"]) {
        response = await (await caches.open(name)).match(next);
        if (response) break;
      }
    response ||= await fetch(audioDownloadUrl(next), {
      signal: controller.signal,
    });
    if (!response.ok) return;
    const blob = await response.blob();
    if (
      !blob.size ||
      blob.size > 16 * 1024 * 1024 ||
      /text|json/.test(blob.type) ||
      pending !== request ||
      controller.signal.aborted
    )
      return;
    ready.set(next, URL.createObjectURL(blob));
  })()
    .catch(() => {
      /* Preloading must never prevent normal playback. */
    })
    .finally(() => {
      clearTimeout(timeout);
      if (pending === request) pending = null;
    });
}
export function clearAudioPreload() {
  preloadNextVerse("");
}
