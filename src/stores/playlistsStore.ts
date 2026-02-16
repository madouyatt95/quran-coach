import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Playlist, PlaylistItem } from '../types';

interface PlaylistsState {
    playlists: Playlist[];
    createPlaylist: (name: string) => string; // returns id
    deletePlaylist: (id: string) => void;
    addItemToPlaylist: (playlistId: string, item: PlaylistItem) => void;
    removeItemFromPlaylist: (playlistId: string, index: number) => void;
    renamePlaylist: (id: string, newName: string) => void;
    reorderItem: (playlistId: string, fromIndex: number, toIndex: number) => void;
}

export const usePlaylistsStore = create<PlaylistsState>()(
    persist(
        (set) => ({
            playlists: [],

            createPlaylist: (name: string) => {
                const id = Math.random().toString(36).substring(2, 11);
                const newPlaylist: Playlist = {
                    id,
                    name,
                    items: [],
                    createdAt: Date.now(),
                };
                set((state) => ({
                    playlists: [newPlaylist, ...state.playlists],
                }));
                return id;
            },

            deletePlaylist: (id: string) => {
                set((state) => ({
                    playlists: state.playlists.filter((p) => p.id !== id),
                }));
            },

            addItemToPlaylist: (playlistId: string, item: PlaylistItem) => {
                set((state) => ({
                    playlists: state.playlists.map((p) =>
                        p.id === playlistId
                            ? { ...p, items: [...p.items, item] }
                            : p
                    ),
                }));
            },

            removeItemFromPlaylist: (playlistId: string, index: number) => {
                set((state) => ({
                    playlists: state.playlists.map((p) =>
                        p.id === playlistId
                            ? { ...p, items: p.items.filter((_, i) => i !== index) }
                            : p
                    ),
                }));
            },

            renamePlaylist: (id: string, newName: string) => {
                set((state) => ({
                    playlists: state.playlists.map((p) =>
                        p.id === id ? { ...p, name: newName } : p
                    ),
                }));
            },

            reorderItem: (playlistId: string, fromIndex: number, toIndex: number) => {
                set((state) => ({
                    playlists: state.playlists.map((p) => {
                        if (p.id !== playlistId) return p;
                        const items = [...p.items];
                        const [moved] = items.splice(fromIndex, 1);
                        items.splice(toIndex, 0, moved);
                        return { ...p, items };
                    }),
                }));
            },
        }),
        {
            name: 'quran-coach-playlists',
        }
    )
);
