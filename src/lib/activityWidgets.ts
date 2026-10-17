import {registerPlugin} from '@capacitor/core';
import {useReadingBookmarkStore} from '../stores/readingBookmarkStore';
import {useQuranStore} from '../stores/quranStore';
import {useHifdhJourneyStore} from '../stores/hifdhJourneyStore';
import {useSRSStore} from '../stores/srsStore';
import {useDailyAdhkarStore} from '../stores/dailyAdhkarStore';
import {useAdhkarExperienceStore} from '../stores/adhkarExperienceStore';
import {readHifdhSession, HIFDH_SESSION_EVENT} from './hifdhSession';
import {buildActivityWidgetSnapshot, type ActivityWidgetSnapshot} from './activityWidgetData';

const bridge = registerPlugin<{updateActivityWidgets(data: {snapshot: ActivityWidgetSnapshot}): Promise<void>}>('QuranCoachCar');
export const activityWidgetInput = () => ({
  bookmark: useReadingBookmarkStore.getState().bookmark, progress: useQuranStore.getState().progress,
  hifdhSession: readHifdhSession(localStorage), journeyPlan: useHifdhJourneyStore.getState().plan,
  cards: useSRSStore.getState().cards, daily: useDailyAdhkarStore.getState(), experience: useAdhkarExperienceStore.getState(),
});

export function startActivityWidgetSync() {
  let signature = '', stopped = false, writing = false;
  let pending: ActivityWidgetSnapshot | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const write = async () => {
    if (writing || stopped) return;
    writing = true;
    try {
      while (pending && !stopped) {
        const snapshot = pending; pending = undefined;
        const next = JSON.stringify({...snapshot, updatedAt: 0});
        if (next === signature) continue;
        try {await bridge.updateActivityWidgets({snapshot}); signature = next;} catch { /* Retry at the next foreground refresh. */ }
      }
    } finally {writing = false;}
  };
  const flush = () => {
    if (timer) clearTimeout(timer);
    if (stopped) return;
    pending = buildActivityWidgetSnapshot(activityWidgetInput());
    void write();
  };
  const schedule = () => {if (timer) clearTimeout(timer); timer = setTimeout(flush, 350);};
  const unsubscribers = [
    useReadingBookmarkStore.subscribe(schedule),
    useQuranStore.subscribe((state, previous) => {if (state.progress !== previous.progress) schedule();}),
    useHifdhJourneyStore.subscribe((state, previous) => {if (state.plan !== previous.plan) schedule();}),
    useSRSStore.subscribe(schedule), useDailyAdhkarStore.subscribe(schedule), useAdhkarExperienceStore.subscribe(schedule),
  ];
  const interval = setInterval(flush, 60_000);
  document.addEventListener('visibilitychange', flush);
  window.addEventListener('pagehide', flush);
  window.addEventListener('storage', schedule);
  window.addEventListener(HIFDH_SESSION_EVENT, schedule);
  flush();
  return () => {
    stopped = true; pending = undefined;
    if (timer) clearTimeout(timer);
    clearInterval(interval); unsubscribers.forEach(unsubscribe => unsubscribe());
    document.removeEventListener('visibilitychange', flush);
    window.removeEventListener('pagehide', flush);
    window.removeEventListener('storage', schedule);
    window.removeEventListener(HIFDH_SESSION_EVENT, schedule);
  };
}
