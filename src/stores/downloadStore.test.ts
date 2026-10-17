// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { createMemoryStorage } from "../test/memoryStorage";
import { useDownloadStore as store } from "./downloadStore";
const files = new Map<string, Response>();
const item = {
  surahNumber: 1,
  surahName: "Fatiha",
  surahNameAr: "",
  totalAyahs: 7,
  audioUrl: "https://example.org/1.mp3",
  reciterId: "123",
  playbackType: "surah" as const,
};
beforeEach(() => {
  vi.stubGlobal("localStorage", createMemoryStorage());
  store.persist.setOptions({ storage: createJSONStorage(() => localStorage) });
  store.setState({ tasks: {} });
  files.clear();
  vi.stubGlobal("caches", {
    open: vi.fn(async () => ({
      match: async (url: string) => files.get(url)?.clone(),
      put: async (url: string, r: Response) => {
        files.set(url, r);
      },
      delete: async (url: string) => files.delete(url),
    })),
  });
});
afterEach(() => vi.unstubAllGlobals());
it("recommence après une erreur sans retélécharger les fichiers présents ni perdre les pistes", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("audio1"))
    .mockRejectedValueOnce(new Error("Network error"))
    .mockResolvedValueOnce(new Response("audio2"));
  vi.stubGlobal("fetch", fetch);
  await store
    .getState()
    .startDownload(
      "test",
      "Séance",
      [item.audioUrl, "https://example.org/2.mp3"],
      "audio",
      [item],
    );
  expect(store.getState().tasks.test).toMatchObject({
    status: "error",
    progress: 50,
    items: [item],
  });
  await store
    .getState()
    .startDownload("test", "Séance", [
      item.audioUrl,
      "https://example.org/2.mp3",
    ]);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(store.getState().tasks.test).toMatchObject({
    status: "completed",
    progress: 100,
    bytes: 12,
    items: [item],
  });
  files.delete(item.audioUrl);
  await store.getState().verifyCacheStatus("test", item.audioUrl);
  expect(store.getState().tasks.test).toMatchObject({
    status: "idle",
    progress: 50,
  });
});
it("conserve un fichier partagé lors du retrait d’un téléchargement", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("audio")),
  );
  await store
    .getState()
    .startDownload("a", "A", [item.audioUrl], "audio", [item]);
  await store
    .getState()
    .startDownload("b", "B", [item.audioUrl], "audio", [item]);
  await store.getState().removeDownload("a", [item.audioUrl]);
  expect(files.has(item.audioUrl)).toBe(true);
  expect(store.getState().tasks.a).toBeUndefined();
});
it("ne valide le pack mixte qu’avec audio, texte et explication puis le répare", async () => {
  const urls=['https://example.org/1.mp3','https://api.alquran.cloud/v1/surah/1/quran-uthmani','https://quranenc.com/api/v1/translation/aya/french_mokhtasar/1/1'];
  const fetch=vi.fn().mockResolvedValueOnce(new Response('audio',{headers:{'content-type':'audio/mpeg'}})).mockResolvedValueOnce(Response.json({data:{ayahs:[]}})).mockResolvedValueOnce(Response.json({result:null}));vi.stubGlobal('fetch',fetch);
  await store.getState().startDownload('pack','Fatiha',urls,'journey',[item]);
  expect(store.getState().tasks.pack.status).toBe('error');expect(files.has(urls[2])).toBe(false);
  fetch.mockResolvedValueOnce(Response.json({result:{translation:'Explication',footnotes:''}}));
  await store.getState().startDownload('pack','Fatiha',urls,'journey',[item]);
  expect(fetch).toHaveBeenCalledTimes(4);expect(store.getState().tasks.pack.status).toBe('completed');
  files.delete(urls[0]);await store.getState().verifyCacheStatus('pack',urls[0]);expect(store.getState().tasks.pack.status).toBe('idle');
});
it('valide les polices, signale un fichier HTML puis reprend le pack incomplet', async()=>{
 const good=new Uint8Array(64);good.set([119,79,70,50]);
 const urls=['https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p1.woff2','https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p2.woff2'];
 const network=vi.fn().mockResolvedValueOnce(new Response(good)).mockResolvedValueOnce(new Response('<html>Error</html>')).mockResolvedValueOnce(new Response(good));vi.stubGlobal('fetch',network);
 await store.getState().startDownload('fonts','Polices',urls,'font');
 expect(store.getState().tasks.fonts).toMatchObject({status:'error',progress:50});expect(files.has(urls[1])).toBe(false);
 await store.getState().startDownload('fonts','Polices',urls,'font');
 expect(network).toHaveBeenCalledTimes(3);expect(store.getState().tasks.fonts).toMatchObject({status:'completed',bytes:128});
});
