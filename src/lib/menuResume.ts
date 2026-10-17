import type { ReadingBookmark } from '../stores/readingBookmarkStore';
import type { LastListened } from '../stores/listenStore';
import type { HifdhSession } from './hifdhSession';
import type { JourneyPlan } from './hifdhJourney';

export type MenuResume =
  | { kind: 'reading'; at: number; page: number; surah: number; ayah: number; bookmark: ReadingBookmark | null }
  | { kind: 'listening'; at: number; track: LastListened }
  | { kind: 'memorizing'; at: number; surah: number; ayah: number; journey: boolean };

export function menuResumeOptions(input: {
  bookmark: ReadingBookmark | null;
  progress: { lastPage: number; lastSurah?: number; lastAyah: number; updatedAt: number } | null;
  lastListened: LastListened | null;
  hifdhSession: HifdhSession | null;
  journeyPlan: JourneyPlan | null;
}): MenuResume[] {
  const timestamp = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
  const choices: MenuResume[] = [];
  const readingAt = Math.max(timestamp(input.bookmark?.savedAt), timestamp(input.progress?.updatedAt));
  if (readingAt > 0) choices.push({
    kind: 'reading', at: readingAt,
    surah: input.bookmark?.savedAt === readingAt ? input.bookmark.surah : input.progress?.lastSurah || 1,
    page: input.bookmark?.savedAt === readingAt ? input.bookmark.page : input.progress?.lastPage || 1,
    ayah: input.bookmark?.savedAt === readingAt ? input.bookmark.ayah : input.progress?.lastAyah || 1,
    bookmark: input.bookmark?.savedAt === readingAt ? input.bookmark : null,
  });
  const track = input.lastListened;
  if (track?.audioUrl)
    choices.push({ kind: 'listening', at: timestamp(track.updatedAt) || 1, track });
  const saved = input.hifdhSession;
  if (saved)
    choices.push({ kind: 'memorizing', at: timestamp(saved.updatedAt) || 1, surah: saved.surah, ayah: saved.ayah, journey: false });
  const plan = input.journeyPlan;
  const exercise = plan?.exercises[plan.cursor];
  if (exercise)
    choices.push({ kind: 'memorizing', at: timestamp(plan?.updatedAt) || 1, surah: exercise.surah, ayah: exercise.ayah, journey: true });
  return choices.sort((a, b) => b.at - a.at).filter((choice, index, sorted) => sorted.findIndex(item => item.kind === choice.kind) === index);
}

export function selectMenuResume(input: Parameters<typeof menuResumeOptions>[0]): MenuResume | null {
  return menuResumeOptions(input)[0] || null;
}
