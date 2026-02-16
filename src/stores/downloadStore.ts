import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DownloadedSurah {
    reciterId: string;
    surahId: number;
    localUrl: string;
    size: number;
}

interface DownloadState {
    downloads: Map<string, DownloadedSurah>; // Key: reciterId-surahId
    isDownloading: Set<string>; // Key: reciterId-surahId

    downloadSurah: (reciterId: string, surahId: number, remoteUrl: string) => Promise<void>;
    removeDownload: (reciterId: string, surahId: number) => void;
    isDownloaded: (reciterId: string, surahId: number) => boolean;
}

export const useDownloadStore = create<DownloadState>()(
    persist(
        (set, get) => ({
            downloads: new Map(),
            isDownloading: new Set(),

            downloadSurah: async (reciterId, surahId, remoteUrl) => {
                const key = `${reciterId}-${surahId}`;
                const downloading = new Set(get().isDownloading);
                downloading.add(key);
                set({ isDownloading: downloading });

                try {
                    const response = await fetch(remoteUrl);
                    if (!response.ok) throw new Error('Fetch failed');
                    // In a real PWA, we'd use Cache API or FileSystem
                    const cache = await caches.open('quran-audio-v1');
                    await cache.put(remoteUrl, response.clone());

                    const newDownloads = new Map(get().downloads);
                    newDownloads.set(key, {
                        reciterId,
                        surahId,
                        localUrl: remoteUrl, // Source is now in cache
                        size: 0
                    });
                    set({ downloads: newDownloads });
                } catch (error) {
                    console.error('[DownloadStore] Error downloading:', error);
                } finally {
                    const finishing = new Set(get().isDownloading);
                    finishing.delete(key);
                    set({ isDownloading: finishing });
                }
            },

            removeDownload: (reciterId, surahId) => {
                const key = `${reciterId}-${surahId}`;
                const newDownloads = new Map(get().downloads);
                newDownloads.delete(key);
                set({ downloads: newDownloads });
                // Also remove from cache
            },

            isDownloaded: (reciterId, surahId) => {
                return get().downloads.has(`${reciterId}-${surahId}`);
            }
        }),
        {
            name: 'quran-coach-downloads',
            partialize: (state) => ({ downloads: Array.from(state.downloads) }),
            // @ts-ignore
            merge: (persistedState, currentState) => {
                if (!persistedState) return currentState;
                return {
                    ...currentState,
                    // @ts-ignore
                    downloads: new Map(persistedState.downloads)
                };
            }
        }
    )
);
