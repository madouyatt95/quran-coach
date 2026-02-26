import { create } from 'zustand';
import { isAudioCached, downloadAudio, deleteAudioFromCache } from '../lib/audioCacheService';

export interface DownloadTask {
    id: string; // Ex: "surah-1" ou "hisnul-muslim"
    title: string;
    urls: string[];
    progress: number; // 0 à 100
    status: 'idle' | 'downloading' | 'completed' | 'error';
    error?: string;
}

interface DownloadStore {
    tasks: Record<string, DownloadTask>;
    isItemCached: (id: string) => boolean;

    /** Lance un téléchargement groupé d'un ensemble d'URLs */
    startDownload: (id: string, title: string, urls: string[]) => Promise<void>;

    /** Supprime du cache et efface la tâche */
    removeDownload: (id: string, urls: string[]) => Promise<void>;

    /** Vérifie silencieusement si les fichiers sont déjà dispos au chargement de la page */
    verifyCacheStatus: (id: string, sampleUrl: string) => Promise<void>;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
    tasks: {},

    isItemCached: (id: string) => {
        return get().tasks[id]?.status === 'completed';
    },

    verifyCacheStatus: async (id: string, sampleUrl: string) => {
        // On vérifie juste la première URL pour aller vite. Si vraie, on suppose que tout le bloc est complet.
        const cached = await isAudioCached(sampleUrl);
        if (cached) {
            set((state) => ({
                tasks: {
                    ...state.tasks,
                    [id]: {
                        id,
                        title: '',
                        urls: [sampleUrl],
                        progress: 100,
                        status: 'completed'
                    }
                }
            }));
        } else {
            // S'assurer que le statut soit réinitialisé si effacé manuellement via les devs tools
            set((state) => {
                const newTasks = { ...state.tasks };
                if (newTasks[id]) delete newTasks[id];
                return { tasks: newTasks };
            });
        }
    },

    startDownload: async (id, title, urls) => {
        if (urls.length === 0) return;

        set((state) => ({
            tasks: {
                ...state.tasks,
                [id]: { id, title, urls, progress: 0, status: 'downloading' }
            }
        }));

        try {
            let completed = 0;
            const total = urls.length;

            for (const url of urls) {
                // Si l'audio n'est pas déjà en cache, on le télécharge
                if (!(await isAudioCached(url))) {
                    const success = await downloadAudio(url);
                    if (!success) throw new Error('Échec réseau');
                }

                completed++;
                const progress = Math.round((completed / total) * 100);

                set((state) => ({
                    tasks: {
                        ...state.tasks,
                        [id]: { ...state.tasks[id], progress }
                    }
                }));
            }

            set((state) => ({
                tasks: {
                    ...state.tasks,
                    [id]: { ...state.tasks[id], progress: 100, status: 'completed' }
                }
            }));

        } catch (error: any) {
            set((state) => ({
                tasks: {
                    ...state.tasks,
                    [id]: { ...state.tasks[id], status: 'error', error: error.message }
                }
            }));
        }
    },

    removeDownload: async (id, urls) => {
        // On ne bloque pas l'UI, on exécute ça en asynchrone
        Promise.all(urls.map(url => deleteAudioFromCache(url))).then(() => {
            set((state) => {
                const newTasks = { ...state.tasks };
                delete newTasks[id];
                return { tasks: newTasks };
            });
        }).catch(e => console.error("Erreur suppression:", e));

        // Suppression optimiste immédiate pour l'UI
        set((state) => {
            const newTasks = { ...state.tasks };
            delete newTasks[id];
            return { tasks: newTasks };
        });
    }
}));

