import { expect, it } from 'vitest';
import {
  biographyTrip,
  fitTripBatch,
  tripCursor,
  tripVerses,
} from './preparedTrip';
import { books } from './bookLibrary';
import type { LibraryAudio } from './audioProduction';
const book = books.find((b) => b.scope?.kind === 'biography')!;
function segment(n: number, total: number, duration = 30): LibraryAudio {
  const chapter = book.chapters[0];
  return {
    id: 'segment-' + n,
    title: book.title + ' · ' + chapter.title,
    reference: `Manuscrit ${chapter.audioVersion || book.version}, chapitre ${chapter.id}, segment ${n}/${total}`,
    duration,
    url: 'https://www.quran-coach.fr/audio/' + n + '.mp3',
    text: '',
    sourceUrl: '',
    category: 'prophet',
    narrator: 'George',
    bytes: 1,
    sentences: [],
  };
}
it('retient les chapitres complets publiés en ordre de lecture et respecte la durée', () => {
  const first = segment(1, 2),
    second = segment(2, 2);
  expect(biographyTrip([second], 2).tracks).toHaveLength(0);
  expect(biographyTrip([first, second], 0.5).tracks).toHaveLength(0);
  const trip = biographyTrip([second, first], 1);
  expect(trip.tracks.map((t) => t.id)).toEqual([first.id, second.id]);
  expect(tripCursor(trip, second.id, 0)).toEqual({ index: 1, position: 0 });
  expect(tripCursor(trip, second.id, 7.5)).toEqual({ index: 1, position: 7.5 });
});
it('prépare les versets entiers depuis le texte embarqué du Juz Amma', async () => {
  const batch = await tripVerses(
    { surah: 114, from: 2, to: 6 },
    'Révision',
    'ar.alafasy',
  );
  expect(batch.at(-1)?.verse?.globalNumber).toBe(6236);
  expect(batch.at(-1)?.audioUrl).toContain('/ar.alafasy/6236.mp3');
  const fit = fitTripBatch(batch, 12, true);
  expect(fit.picked.length).toBeGreaterThan(0);
  expect(fit.seconds).toBeLessThanOrEqual(12);
  expect(fitTripBatch(batch, 0, false).picked).toEqual([]);
});
