export const TILAWA_CACHE = "quran-coach-tilawa-v1";
export const TILAWA_BASE = "/tilawa/v1/";
export interface PackManifest {
  version: string;
  files: { url: string; bytes: number; sha256: string }[];
}
export async function readManifest(): Promise<PackManifest> {
  const cache = await caches.open(TILAWA_CACHE);
  const response =
    (await cache.match(`${TILAWA_BASE}manifest.json`)) ||
    (await fetch(`${TILAWA_BASE}manifest.json`));
  if (!response.ok)
    throw new Error(
      "Le pack Tilawa est indisponible. Réessayez avec une connexion.",
    );
  const manifest = (await response.json()) as PackManifest;
  if (
    manifest.version !== "zipformer-a0w-ep1-a0.5-ort1.24.2" ||
    !manifest.files?.length ||
    !manifest.files.every(
      (f) =>
        f.url.startsWith(TILAWA_BASE) &&
        !f.url.includes("..") &&
        f.bytes > 0 &&
        /^[a-f0-9]{64}$/.test(f.sha256),
    )
  )
    throw new Error("Pack vocal incompatible.");
  return manifest;
}
export async function tilawaPackStatus(): Promise<{
  ready: boolean;
  bytes: number;
}> {
  try {
    const cache = await caches.open(TILAWA_CACHE);
    const manifest = await readManifest();
    let bytes = 0;
    let ready = true;
    for (const file of manifest.files) {
      const response = await cache.match(file.url);
      if (response && response.headers.get("x-qc-sha256") === file.sha256)
        bytes += file.bytes;
      else ready = false;
    }
    return { ready, bytes };
  } catch {
    return { ready: false, bytes: 0 };
  }
}
let activeDownload: Promise<void> | null = null;
export function downloadTilawaPack(
  onProgress: (n: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (activeDownload) return activeDownload;
  activeDownload = (async () => {
    const manifest = await readManifest();
    const cache = await caches.open(TILAWA_CACHE);
    const total = manifest.files.reduce((n, f) => n + f.bytes, 0);
    let done = 0;
    await cache.put(
      `${TILAWA_BASE}manifest.json`,
      new Response(JSON.stringify(manifest), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    for (const file of manifest.files) {
      signal?.throwIfAborted();
      const existing = await cache.match(file.url);
      if (existing?.headers.get("x-qc-sha256") === file.sha256) {
        done += file.bytes;
        onProgress((done / total) * 100);
        continue;
      }
      const response = await fetch(file.url, { signal });
      if (!response.ok)
        throw new Error(`Téléchargement interrompu (${response.status}).`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Téléchargement indisponible.");
      const parts: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;
      for (;;) {
        const { done: ended, value } = await reader.read();
        if (ended) break;
        received += value.byteLength;
        if (received > file.bytes) {
          await reader.cancel();
          throw new Error("Taille du fichier invalide.");
        }
        parts.push(value as Uint8Array<ArrayBuffer>);
        onProgress(((done + received) / total) * 100);
      }
      const bytes = await new Blob(parts).arrayBuffer();
      const digest = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      if (bytes.byteLength !== file.bytes || digest !== file.sha256)
        throw new Error("Le fichier téléchargé est incomplet. Réessayez.");
      const headers = new Headers(response.headers);
      headers.set("x-qc-sha256", digest);
      await cache.put(file.url, new Response(bytes, { headers }));
      done += file.bytes;
    }
    await cache.put(
      `${TILAWA_BASE}manifest.json`,
      new Response(JSON.stringify(manifest), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    onProgress(100);
  })().finally(() => {
    activeDownload = null;
  });
  return activeDownload;
}
export async function removeTilawaPack() {
  if (activeDownload)
    throw new Error("Arrêtez le téléchargement avant de supprimer le pack.");
  await caches.delete(TILAWA_CACHE);
}
export async function cachedTilawaFile(name: string): Promise<Response> {
  const response = await (
    await caches.open(TILAWA_CACHE)
  ).match(TILAWA_BASE + name);
  if (!response)
    throw new Error(
      "Téléchargez le pack vocal dans Stockage avant de démarrer Tilawa.",
    );
  return response;
}
