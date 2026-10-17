import {afterAll, describe, expect, it} from 'vitest';
import {writeFileSync} from 'node:fs';
import {buildActivityWidgetSnapshot, activityWidgetDestination, type ActivityWidgetInput} from './activityWidgetData';
import {categoryById, invocationCountKey, invocationTitle} from './adhkarExperience';
import type {SRSCard} from '../stores/srsStore';

const now = new Date(2026, 9, 16, 10);
const input = (): ActivityWidgetInput => ({bookmark: null, progress: null, hifdhSession: null, journeyPlan: null,
  cards: {}, daily: {day: '2026-10-16', counts: {}}, experience: {order: {}, targets: {}}});
const card = (ayah: number, day: string): SRSCard => ({id: `2:${ayah}`, surah: 2, ayah, nextReviewDate: day,
  easeFactor: 2.5, interval: 1, repetitions: 1, lastReviewDate: null, addedDate: '2026-10-01'});

describe('Native activity widgets', () => {
  it('uses the actual bookmark, including a page-only bookmark and its reading mode', () => {
    const state = input(); state.bookmark = {surah: 2, ayah: 75, page: 11, view: 'tajweed-interactive', precision: 'page', savedAt: 200};
    const snapshot = buildActivityWidgetSnapshot(state, now);
    expect(snapshot.reading).toEqual({available: true, chapter: 'Al-Baqarah', detail: 'Votre page marquée', page: 11});
    expect(activityWidgetDestination('/read', '?widget=resume', state, now)).toEqual({route: '/read?page=11', view: 'tajweed-interactive'});
  });
  it('keeps the menu resume priority when actual reading is newer than the ribbon', () => {
    const state = input(); state.bookmark = {surah: 2, ayah: 13, page: 3, view: 'mushaf', precision: 'verse', savedAt: 100};
    state.progress = {lastSurah: 3, lastAyah: 20, lastPage: 52, updatedAt: 300};
    expect(buildActivityWidgetSnapshot(state, now).reading).toMatchObject({chapter: "Ali 'Imran", detail: 'Verset 20', page: 52});
    expect(activityWidgetDestination('/read', '?widget=resume', state, now)).toEqual({route: '/read?page=52&surah=3&ayah=20'});
  });
  it('does not manufacture a position from invalid persisted data', () => {
    const state = input(); state.bookmark = {surah: 114, ayah: 75, page: 604, view: 'mushaf', precision: 'verse', savedAt: 100};
    expect(buildActivityWidgetSnapshot(state, now).reading.available).toBe(false);
    expect(activityWidgetDestination('/read', '?widget=resume', state, now)).toEqual({route: '/read'});
  });
  it('shares real invocation counters and resets yesterday without altering stored counts', () => {
    const state = input(), first = categoryById.get('morning')!.items[0];
    state.daily.counts[invocationCountKey(first)] = first.count;
    expect(buildActivityWidgetSnapshot(state, now).invocations.morning.completed).toBe(1);
    state.daily.day = '2026-10-15';
    expect(buildActivityWidgetSnapshot(state, now).invocations.morning.completed).toBe(0);
    expect(state.daily.counts[invocationCountKey(first)]).toBe(first.count);
  });
  it('preserves the selected order and provides the correct first invocation for the next day', () => {
    const state = input(), [first, second] = categoryById.get('morning')!.items;
    state.experience.order.morning = [second.key, first.key];
    state.daily.counts[invocationCountKey(second)] = second.count;
    const period = buildActivityWidgetSnapshot(state, now).invocations.morning;
    expect(period.first.title).toBe(invocationTitle(second));
    expect(period.next.title).toBe(invocationTitle(first));
  });
  it('resolves the invocation period at tap time and opens the next actual invocation', () => {
    const state = input(), date = new Date(2026, 9, 16, 16);
    expect(activityWidgetDestination('/adhkar', '?widget=moment', state, date)?.route).toContain('/adhkar?cat=evening&dua=');
    const morning = new Date(2026, 9, 17, 4);
    expect(activityWidgetDestination('/adhkar', '?widget=moment', state, morning)?.route).toContain('/adhkar?cat=morning&dua=');
  });
  it('opens the newest unfinished memorization journey and never a completed plan', () => {
    const state = input();
    state.hifdhSession = {surah: 2, start: 70, end: 75, ayah: 73, speed: 1, repeats: 3, focus: false, phonetics: true, step: 'recite', updatedAt: 100};
    state.journeyPlan = {day: '2026-10-16', minutes: 5, cursor: 1, phase: 2, updatedAt: 200,
      exercises: [{surah: 3, ayah: 19, kind: 'recall', reason: 'Révision'}, {surah: 3, ayah: 20, kind: 'recall', reason: 'Révision'}]};
    expect(buildActivityWidgetSnapshot(state, now).memorization).toMatchObject({chapter: "Ali 'Imran", detail: 'Passage 2 sur 2 · verset 20'});
    expect(activityWidgetDestination('/hifdh', '?widget=resume', state, now)?.route).toBe('/hifdh?resume=journey');
    state.journeyPlan.cursor = 2;
    expect(activityWidgetDestination('/hifdh', '?widget=resume', state, now)?.route).toBe('/hifdh?resume=session');
    expect(buildActivityWidgetSnapshot(state, now).memorization.detail).toBe('Versets 70–75 · reprise au 73');
  });
  it('shares due dates rather than freezing the review count at the time the app was opened', () => {
    const state = input(); state.cards = {'2:1': card(1, '2026-10-16'), '2:2': card(2, '2026-10-16'), '2:3': card(3, '2026-10-17'), '2:4': card(4, '2026-02-30')};
    expect(buildActivityWidgetSnapshot(state, now).memorization.reviews).toEqual([{day: '2026-10-16', count: 2}, {day: '2026-10-17', count: 1}]);
    expect(activityWidgetDestination('/hifdh', '?widget=resume', state, now)?.route).toBe('/hifdh?resume=reviews');
  });
  it('leaves normal app navigation intact', () => {
    expect(activityWidgetDestination('/read', '?surah=2&ayah=13', input(), now)).toBeNull();
    expect(activityWidgetDestination('/settings', '?widget=resume', input(), now)).toBeNull();
  });
});

// Optional cross-language fixture: the Swift verifier decodes a real TypeScript snapshot.
afterAll(() => {
  if (!process.env.QC_WIDGET_FIXTURE_PATH) return;
  const state = input(); state.cards = {'2:1': card(1, '2026-10-16'), '2:2': card(2, '2026-10-17')};
  writeFileSync(process.env.QC_WIDGET_FIXTURE_PATH, JSON.stringify(buildActivityWidgetSnapshot(state, now)));
});
