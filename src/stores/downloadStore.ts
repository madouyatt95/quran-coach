import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface DownloadTask {
  id: string;
  title: string;
  urls: string[];
  progress: number;
  status: "idle" | "downloading" | "completed" | "error";
  error?: string;
  kind?: "audio" | "text";
  bytes?: number;
}
interface DownloadStore {
  tasks: Record<string, DownloadTask>;
  isItemCached: (id: string) => boolean;
  startDownload: (
    id: string,
    title: string,
    urls: string[],
    kind?: "audio" | "text",
  ) => Promise<void>;
  removeDownload: (id: string, urls: string[]) => Promise<void>;
  verifyCacheStatus: (id: string, sampleUrl: string) => Promise<void>;
  pauseDownload: (id: string) => void;
}
const controllers = new Map<string, AbortController>();
const cacheName = (kind?: "audio" | "text") =>
  kind === "text" ? "quran-coach-content-v1" : "quran-coach-audio-v1";
export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      isItemCached: (id) => get().tasks[id]?.status === "completed",
      pauseDownload: (id) => controllers.get(id)?.abort(),
      verifyCacheStatus: async (id) => {
        const task = get().tasks[id];
        if (!task || controllers.has(id)) return;
        try {
          const cache = await caches.open(cacheName(task.kind));
          const matches = await Promise.all(
            task.urls.map((url) => cache.match(url)),
          );
          const count = matches.filter(Boolean).length;
          if (get().tasks[id] !== task) return;
          set((state) => ({
            tasks: {
              ...state.tasks,
              [id]: {
                ...task,
                status: count === task.urls.length ? "completed" : "idle",
                progress: Math.round((count / task.urls.length) * 100),
              },
            },
          }));
        } catch {
          /* The UI can still offer a retry. */
        }
      },
      startDownload: async (id, title, urls, kind = "audio") => {
        if (!urls.length || controllers.has(id)) return;
        const controller = new AbortController();
        controllers.set(id, controller);
        urls = [...new Set(urls)];
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              id,
              title,
              urls,
              kind,
              progress: 0,
              status: "downloading",
              bytes: 0,
            },
          },
        }));
        try {
          const cache = await caches.open(cacheName(kind));
          let completed = 0;
          let bytes = 0;
          for (const url of urls) {
            controller.signal.throwIfAborted();
            let response = await cache.match(url);
            if (!response) {
              // The public CDN allows audio playback but does not provide CORS headers.
              // Fetch the fixed same-origin mirror, keeping the original cache key for playback.
              const match = /^https:\/\/cdn\.islamic\.network\/quran\/audio\/128\/ar\.alafasy\/(\d+)\.mp3$/.exec(url);
              response = await fetch(match ? `/offline-audio/${match[1]}.mp3` : url, { signal: controller.signal });
              if (!response.ok)
                throw new Error(`Échec du téléchargement (${response.status})`);
              if (kind === "text") await response.clone().json();
              await cache.put(url, response.clone());
            }
            bytes += (await response.blob()).size;
            completed++;
            set((state) => ({
              tasks: {
                ...state.tasks,
                [id]: {
                  ...state.tasks[id],
                  bytes,
                  progress: Math.round((completed / urls.length) * 100),
                },
              },
            }));
          }
          set((state) => ({
            tasks: {
              ...state.tasks,
              [id]: { ...state.tasks[id], status: "completed" },
            },
          }));
        } catch (error) {
          set((state) => ({
            tasks: {
              ...state.tasks,
              [id]: {
                ...state.tasks[id],
                status: controller.signal.aborted ? "idle" : "error",
                error: controller.signal.aborted
                  ? "Téléchargement en pause."
                  : error instanceof Error
                    ? error.message
                    : "Stockage indisponible.",
              },
            },
          }));
        } finally {
          controllers.delete(id);
        }
      },
      removeDownload: async (id, urls) => {
        if (controllers.has(id)) return;
        const task = get().tasks[id];
        if (!task) return;
        const others = Object.values(get().tasks).filter(
          (t) => t.id !== id && cacheName(t.kind) === cacheName(task.kind),
        );
        const shared = new Set(others.flatMap((t) => t.urls));
        const cache = await caches.open(cacheName(task.kind));
        await Promise.all(
          urls
            .filter((url) => !shared.has(url))
            .map((url) => cache.delete(url)),
        );
        set((state) => {
          const tasks = { ...state.tasks };
          delete tasks[id];
          return { tasks };
        });
      },
    }),
    {
      name: "quran-coach-downloads-v1",
      partialize: (state) => ({
        tasks: Object.fromEntries(
          Object.entries(state.tasks).map(([id, t]) => [
            id,
            { ...t, status: t.status === "downloading" ? "idle" : t.status },
          ]),
        ),
      }),
    },
  ),
);
