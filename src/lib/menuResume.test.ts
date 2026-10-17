import { expect, it } from 'vitest';
import { selectMenuResume } from './menuResume';

const empty = { bookmark: null, progress: null, lastListened: null, hifdhSession: null, journeyPlan: null };

it('chooses the most recently saved activity and retains its exact cursor', () => {
  const selected = selectMenuResume({
    ...empty,
    bookmark: { surah: 2, ayah: 75, page: 11, view: 'mushaf', precision: 'verse', savedAt: 100 },
    lastListened: { reciterId: 'ar.alafasy', reciterName: 'Al-Afasy', surahNumber: 1, surahName: 'Al-Fatiha', audioUrl: '/1.mp3', position: 83, updatedAt: 300 },
    hifdhSession: { surah: 3, start: 7, end: 9, ayah: 8, speed: 1, repeats: 1, phonetics: false, focus: false, step: 'recite', updatedAt: 200 },
  });
  expect(selected).toMatchObject({ kind: 'listening', at: 300, track: { position: 83 } });
});

it('resumes an unfinished guided memorization plan', () => {
  const selected = selectMenuResume({ ...empty, journeyPlan: {
    day: '2026-10-08', minutes: 10, phase: 2, cursor: 1, updatedAt: 500,
    exercises: [{ surah: 1, ayah: 1, kind: 'learn', reason: '' }, { surah: 1, ayah: 2, kind: 'recall', reason: '' }],
  } });
  expect(selected).toMatchObject({ kind: 'memorizing', journey: true, surah: 1, ayah: 2 });
});

it('does not select a completed plan and keeps legacy sessions available as a fallback', () => {
  const selected = selectMenuResume({ ...empty,
    journeyPlan: { day: '2026-10-08', minutes: 5, phase: 0, cursor: 1, exercises: [{ surah: 1, ayah: 1, kind: 'learn', reason: '' }] },
    hifdhSession: { surah: 2, start: 75, end: 75, ayah: 75, speed: 1, repeats: 1, phonetics: false, focus: false, step: 'review' },
  });
  expect(selected).toMatchObject({ kind: 'memorizing', journey: false, surah: 2, ayah: 75 });
});

it('offers each activity once, keeping the latest memorization cursor and reading surah', async () => {
  const { menuResumeOptions } = await import('./menuResume');
  const options = menuResumeOptions({ ...empty,
    progress: { lastSurah: 2, lastPage: 11, lastAyah: 75, updatedAt: 400 },
    lastListened: { reciterId: 'ar.alafasy', reciterName: 'Al-Afasy', surahNumber: 1, surahName: 'Al-Fatiha', audioUrl: '/1.mp3', position: 83, updatedAt: 300 },
    hifdhSession: { surah: 3, start: 7, end: 9, ayah: 8, speed: 1, repeats: 1, phonetics: false, focus: false, step: 'recite', updatedAt: 200 },
    journeyPlan: { day: '2026-10-08', minutes: 5, phase: 0, cursor: 0, updatedAt: 500, exercises: [{ surah: 1, ayah: 2, kind: 'learn', reason: '' }] },
  });
  expect(options.map(item => item.kind)).toEqual(['memorizing', 'reading', 'listening']);
  expect(options[0]).toMatchObject({ surah: 1, ayah: 2, journey: true });
  expect(options[1]).toMatchObject({ surah: 2, ayah: 75, page: 11 });
});
