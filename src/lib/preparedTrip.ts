import {
  estimatedSeconds,
  preparePassages,
  withVoice,
} from './listeningExperience';
import chapters from './interactiveMushaf/chapters.json';
import { create } from 'zustand';
import { persist } from './profilePersist';
import type { PlaylistItem } from '../types';
import { type CarListeningReference, safeCarAudioUrl } from './carListening';
import {
  books,
  bookForAudio,
  chapterForAudio,
  recordingsForBook,
  segmentNumber,
} from './bookLibrary';
import type { LibraryAudio } from './audioProduction';
export type TripKind = 'Récitation' | 'Biographie' | 'Révision';
export interface TripTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  path: string;
  chapter: string;
  listening?: CarListeningReference;
}
export interface Trip {
  kind: TripKind;
  minutes: number;
  tracks: TripTrack[];
  verses: PlaylistItem[];
}
export const usePreparedTrip = create<{
  trip: Trip | null;
  save: (trip: Trip) => void;
}>()(
  persist((set) => ({ trip: null, save: (trip) => set({ trip }) }), {
    name: 'qc-prepared-trip-v1',
  }),
);
/** The prayer course already ships these verses. Preparing a journey only needs their text and recording URLs. */
export async function tripVerses(
  range: { surah: number; from: number; to: number },
  kind: TripKind,
  voice: string,
) {
  if (range.surah !== 1 && range.surah < 78)
    return preparePassages(
      [{ ...range, title: kind, introduction: '' }],
      voice,
    );
  const arabic = (await import('./fahm/prayer-words-ar.json'))
    .default as Record<string, string[]>;
  const chapter = chapters[range.surah - 1];
  return Array.from({ length: range.to - range.from + 1 }, (_, i) => {
    const n = range.from + i;
    return withVoice(
      {
        surahNumber: chapter.id,
        surahName: chapter.latin,
        surahNameAr: chapter.name,
        totalAyahs: chapter.count,
        playbackType: 'surah',
        verse: {
          number: n,
          globalNumber: chapter.offset + n,
          text: arabic[chapter.id + ':' + n].join(' '),
          translation: '',
        },
      },
      voice,
    );
  });
}
/** Return a prefix of whole verses. The duration is an estimate, never a player timeout. */
export function fitTripBatch(
  batch: PlaylistItem[],
  remaining: number,
  first: boolean,
) {
  const picked: PlaylistItem[] = [];
  let seconds = 0;
  for (const v of batch) {
    const length = estimatedSeconds([v]);
    if (seconds + length > remaining && (picked.length || !first)) break;
    picked.push(v);
    seconds += length;
  }
  return { picked, seconds };
}
export function biographyTrip(
  items: LibraryAudio[],
  minutes: number,
  preferred?: string,
): Trip {
  const groups = books
    .filter((b) => b.scope?.kind === 'biography')
    .flatMap((book) => {
      const recordings = recordingsForBook(items, book);
      return book.chapters.flatMap((chapter, index) => {
        const parts = recordings.filter(
          (r) => chapterForAudio(r, book) === index,
        );
        if (
          !parts.length ||
          !parts.every(
            (p, i) =>
              segmentNumber(p) === i + 1 &&
              Number(p.reference.match(/segment \d+\/(\d+)/)?.[1]) ===
                parts.length &&
              p.duration > 0,
          )
        )
          return [];
        const tracks = parts.map((p) => ({
          id: p.id,
          title: chapter.title,
          artist: book.title,
          url:
            safeCarAudioUrl(
              p.url?.startsWith('/') && !p.url.startsWith('//')
                ? 'https://www.quran-coach.fr' + p.url
                : p.url,
            ) || '',
          duration: p.duration,
          path: `/books/${book.id}?chapter=${chapter.id}`,
          chapter: chapter.id,
        }));
        return tracks.every((t) => t.url)
          ? [
              {
                book: book.id,
                tracks,
                duration: parts.reduce((n, p) => n + p.duration, 0),
              },
            ]
          : [];
      });
    });
  const tracks: TripTrack[] = [];
  let left = minutes * 60;
  const recent = preferred ? items.find((i) => i.id === preferred) : undefined;
  const preferredBook = recent ? bookForAudio(recent)?.id : undefined;
  for (const g of groups.sort(
    (a, b) =>
      Number(b.book === preferredBook) - Number(a.book === preferredBook),
  )) {
    if (g.duration <= left) {
      tracks.push(...g.tracks);
      left -= g.duration;
    }
  }
  return { kind: 'Biographie', minutes, tracks, verses: [] };
}
export function tripCursor(
  trip: Trip,
  lastId: string | undefined,
  position: number,
) {
  const index = trip.tracks.findIndex(
    (t) => t.id === lastId || t.url === lastId,
  );
  if (index < 0) return { index: 0, position: 0 };
  return {
    index,
    position: Number.isFinite(position) ? Math.max(0, position) : 0,
  };
}
