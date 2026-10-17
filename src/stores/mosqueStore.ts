import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeMosqueUrl, validCoordinates, type Mosque } from '../lib/mosques';
interface MosqueState {
  favorite: Mosque | null;
  timetableUrl: string;
  selectionMode: 'favorite' | 'nearby';
  nearby: Mosque | null;
  setSelectionMode: (mode: 'favorite' | 'nearby') => void;
  setNearby: (mosque: Mosque | null) => void;
  setFavorite: (mosque: Mosque | null) => void;
  setTimetableUrl: (url: string) => void;
}
export const useMosqueStore = create<MosqueState>()(persist((set) => ({
  favorite: null, timetableUrl: '', selectionMode: 'nearby', nearby: null,
  setSelectionMode: selectionMode => set({selectionMode}),
  setNearby: nearby => set({nearby}),
  setFavorite: favorite => set(state => ({ favorite, selectionMode: 'favorite', timetableUrl: state.favorite?.id === favorite?.id ? state.timetableUrl : '' })),
  setTimetableUrl: url => set({ timetableUrl: safeMosqueUrl(url) || '' }),
}), {
  name: 'quran-coach-mosque-v1',
  partialize: s => ({favorite:s.favorite,timetableUrl:s.timetableUrl,selectionMode:s.selectionMode}),
  merge: (persisted, current) => {
    const saved = persisted as Partial<MosqueState> | null;
    const f = saved?.favorite;
    const valid = f && typeof f.id === 'string' && typeof f.name === 'string' && validCoordinates(f.lat, f.lng) && safeMosqueUrl(f.sourceUrl);
    return { ...current, selectionMode: saved?.selectionMode==='favorite'&&valid?'favorite':'nearby', favorite: valid ? f : null, timetableUrl: valid ? safeMosqueUrl(saved?.timetableUrl) || '' : '' };
  },
}));

export const activeMosque = (s: Pick<MosqueState,'selectionMode'|'nearby'|'favorite'>) => s.selectionMode==='nearby'?s.nearby:s.favorite;
