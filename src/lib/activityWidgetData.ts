import chapters from './interactiveMushaf/chapters.json';
import {menuResumeOptions} from './menuResume';
import {invocationReminder} from './invocationReminder';
import {invocationTitle} from './adhkarExperience';
import {localDay} from './learning';
import type {ReadingBookmark, BookmarkView} from '../stores/readingBookmarkStore';
import type {ReadingProgress} from '../types';
import type {HifdhSession} from './hifdhSession';
import type {JourneyPlan} from './hifdhJourney';
import type {SRSCard} from '../stores/srsStore';

export interface ActivityWidgetInput {
  bookmark: ReadingBookmark | null;
  progress: ReadingProgress | null;
  hifdhSession: HifdhSession | null;
  journeyPlan: JourneyPlan | null;
  cards: Record<string, SRSCard>;
  daily: Parameters<typeof invocationReminder>[1];
  experience: Parameters<typeof invocationReminder>[2];
}
export interface ReadingWidgetData {
  available: boolean; chapter: string; detail: string; page: number;
}
export interface InvocationWidgetItem {title: string; arabic: string; source: string}
export interface InvocationWidgetPeriod {
  completed: number; total: number; next: InvocationWidgetItem; first: InvocationWidgetItem;
}
export interface MemorizationWidgetData {
  available: boolean; chapter: string; detail: string;
  reviews: {day: string; count: number}[];
}
export interface ActivityWidgetSnapshot {
  version: 1; updatedAt: number;
  reading: ReadingWidgetData;
  invocations: {day: string; morning: InvocationWidgetPeriod; evening: InvocationWidgetPeriod};
  memorization: MemorizationWidgetData;
}

const validVerse = (surah: number, ayah: number) => Number.isInteger(surah) && Number.isInteger(ayah) &&
  surah >= 1 && surah <= 114 && ayah >= 1 && ayah <= chapters[surah - 1].count;
const validPage = (page: number) => Number.isInteger(page) && page >= 1 && page <= 604;
const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) &&
  Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;

function resumeInput(input: ActivityWidgetInput) {
  const bookmark = input.bookmark && validVerse(input.bookmark.surah, input.bookmark.ayah) && validPage(input.bookmark.page) ? input.bookmark : null;
  const progress = input.progress && validVerse(input.progress.lastSurah, input.progress.lastAyah) && validPage(input.progress.lastPage) ? input.progress : null;
  const saved = input.hifdhSession;
  const hifdhSession = saved && validVerse(saved.surah, saved.ayah) && validVerse(saved.surah, saved.start) &&
    validVerse(saved.surah, saved.end) && saved.start <= saved.ayah && saved.ayah <= saved.end ? saved : null;
  const exercise = input.journeyPlan?.exercises[input.journeyPlan.cursor];
  const journeyPlan = exercise && validVerse(exercise.surah, exercise.ayah) ? input.journeyPlan : null;
  return {bookmark, progress, hifdhSession, journeyPlan, lastListened: null};
}

/** Share the same resume priorities as the home screen and side menu. */
export function buildActivityWidgetSnapshot(input: ActivityWidgetInput, now = new Date()): ActivityWidgetSnapshot {
  const resume = resumeInput(input), options = menuResumeOptions(resume);
  const reading = options.find(option => option.kind === 'reading');
  const memory = options.find(option => option.kind === 'memorizing');
  const period = (id: 'morning' | 'evening'): InvocationWidgetPeriod => {
    const current = invocationReminder(id, input.daily, input.experience, now.getTime())!;
    const fresh = invocationReminder(id, {day: '', counts: {}}, input.experience, now.getTime())!;
    const item = (entry: typeof current.next): InvocationWidgetItem => ({title: invocationTitle(entry), arabic: entry.arabic, source: entry.source || ''});
    return {completed: current.completed, total: current.total, next: item(current.next), first: item(fresh.next)};
  };
  const buckets = new Map<string, number>();
  for (const card of Object.values(input.cards)) {
    if (validVerse(card.surah, card.ayah) && validDay(card.nextReviewDate)) buckets.set(card.nextReviewDate, (buckets.get(card.nextReviewDate) || 0) + 1);
  }
  return {
    version: 1, updatedAt: now.getTime(),
    reading: reading ? {available: true, chapter: chapters[reading.surah - 1].latin,
      detail: reading.bookmark?.precision === 'page' ? 'Votre page marquée' : `Verset ${reading.ayah}`, page: reading.page}
      : {available: false, chapter: '', detail: '', page: 0},
    invocations: {day: localDay(now), morning: period('morning'), evening: period('evening')},
    memorization: {
      available: !!memory, chapter: memory ? chapters[memory.surah - 1].latin : '',
      detail: memory ? memory.journey ? `Passage ${resume.journeyPlan!.cursor + 1} sur ${resume.journeyPlan!.exercises.length} · verset ${memory.ayah}`
        : resume.hifdhSession!.start === resume.hifdhSession!.end ? `Verset ${memory.ayah}`
          : `Versets ${resume.hifdhSession!.start}–${resume.hifdhSession!.end} · reprise au ${memory.ayah}` : '',
      reviews: [...buckets].sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({day, count})),
    },
  };
}

/** Resolve a widget tap against current local data, even if iOS displays an older snapshot. */
export function activityWidgetDestination(pathname: string, search: string, input: ActivityWidgetInput, now = new Date()): {route: string; view?: BookmarkView} | null {
  const marker = new URLSearchParams(search).get('widget');
  const resume = resumeInput(input), options = menuResumeOptions(resume);
  if (pathname === '/read' && marker === 'resume') {
    const reading = options.find(option => option.kind === 'reading');
    if (!reading) return {route: '/read'};
    const params = new URLSearchParams({page: String(reading.page)});
    if (reading.bookmark?.precision !== 'page') {params.set('surah', String(reading.surah)); params.set('ayah', String(reading.ayah));}
    const view = reading.bookmark?.view;
    return {route: `/read?${params}`, ...(['mushaf', 'madinah', 'tajweed', 'tajweed-interactive'].includes(view || '') ? {view} : {})};
  }
  if (pathname === '/adhkar' && marker === 'moment') {
    const period = now.getHours() >= 4 && now.getHours() < 16 ? 'morning' : 'evening';
    return {route: invocationReminder(period, input.daily, input.experience, now.getTime())!.route};
  }
  if (pathname === '/hifdh' && marker === 'resume') {
    const memory = options.find(option => option.kind === 'memorizing');
    if (memory) return {route: `/hifdh?resume=${memory.journey ? 'journey' : 'session'}`};
    // Match the existing SRS store's UTC date convention.
    const today = now.toISOString().slice(0, 10);
    const due = Object.values(input.cards).some(card => validVerse(card.surah, card.ayah) && validDay(card.nextReviewDate) && card.nextReviewDate <= today);
    return {route: due ? '/hifdh?resume=reviews' : '/hifdh'};
  }
  return null;
}
