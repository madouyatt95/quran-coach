import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useAdhanPlayback, stopAdhan } from './adhanPlayback';
import { useListenStore } from '../stores/listenStore';
import { mosqueScheduleEvents, scheduleSlug } from './mosqueScheduleEvents';
import { activeMosque, useMosqueStore } from '../stores/mosqueStore';
import { useMosquePlansStore } from '../stores/mosquePlansStore';
import { useMosqueDirectoryStore } from '../stores/mosqueDirectoryStore';
import type { AdhanEvent } from './adhanSchedule';

interface CarBridge {
  updatePrayerSnapshot(data: { mosque: string; adhanName: string; adhanAt: number; iqamaName: string; iqamaAt: number; source: string; updatedAt: number; events:{kind:'adhan'|'iqama';label:string;at:number}[] }): Promise<void>;
  setNowPlaying(data: { title: string; artist: string; playing: boolean; elapsed: number; duration: number }): Promise<void>;
  clearNowPlaying(): Promise<void>;
  addListener(event: 'remoteCommand', callback: (data: { action: string }) => void): Promise<PluginListenerHandle>;
}
const bridge = registerPlugin<CarBridge>('QuranCoachCar');
const nativeIOS = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
let lastSnapshot = '';
let lastSnapshotAt = 0;
let lastAudio = '';

export async function syncCarPrayerSnapshot(events: AdhanEvent[]) {
  if (!nativeIOS()) return;
  const now = Date.now();
  const mosque = activeMosque(useMosqueStore.getState());
  const directory = useMosqueDirectoryStore.getState();
  const plans = useMosquePlansStore.getState().plans;
  const slug = mosque ? scheduleSlug(mosque, directory.links, directory.automatic) : undefined;
  const timetable = slug ? directory.published[slug] : undefined;
  const iqamas = mosque ? mosqueScheduleEvents(mosque, plans, timetable, now).filter(event => event.at > now && event.at <= now + 86400000) : [];
  const iqama = iqamas[0];
  const adhan = events.find(e => e.at > now);
  const data = {
    mosque: mosque?.name ?? '',
    adhanName: adhan?.label ?? '',
    adhanAt: adhan?.at ?? 0,
    iqamaName: iqama?.label ?? '',
    iqamaAt: iqama?.at ?? 0,
    source: iqama ? (iqama.published ? 'Horaire publié' : 'Horaire personnel') : 'Iqama non renseignée',
    updatedAt: now,
    events: [
      ...events.filter(e=>e.at>now&&e.at<=now+86400000).map(e=>({kind:'adhan' as const,label:e.label,at:e.at})),
      ...iqamas.map(e=>({kind:'iqama' as const,label:e.label,at:e.at})),
    ].sort((a,b)=>a.at-b.at).slice(0,24),
  };
  const signature = JSON.stringify({ ...data, updatedAt: 0 });
  if (signature === lastSnapshot && now - lastSnapshotAt < 15 * 60000) return;
  try { await bridge.updatePrayerSnapshot(data); lastSnapshot = signature; lastSnapshotAt = now; } catch { /* Widgets may be unavailable in debug builds. */ }
}

function applyRemote(action: string) {
  const player = useAudioPlayerStore.getState();
  const adhan = useAdhanPlayback.getState();
  if (adhan.status === 'playing' || adhan.status === 'loading') {
    if (action === 'pause' || action === 'toggle') stopAdhan();
    return;
  }
  if (!player.currentSurahNumber) return;
  if (action === 'play' && !player.isPlaying) player.togglePlay();
  if (action === 'pause' && player.isPlaying) player.togglePlay();
  if (action === 'toggle') player.togglePlay();
  if (action === 'next') player.nextAyah();
  if (action === 'previous') player.prevAyah();
}

function syncNowPlaying() {
  if (!nativeIOS()) return;
  const player = useAudioPlayerStore.getState();
  const adhan = useAdhanPlayback.getState();
  const activeAdhan = adhan.status === 'loading' || adhan.status === 'playing';
  if (!activeAdhan && !player.currentSurahNumber) {
    if (lastAudio) { lastAudio = ''; void bridge.clearNowPlaying().catch(() => {}); }
    return;
  }
  const item = player.playlist[player.currentPlaylistIndex];
  const data = activeAdhan ? {
    title: adhan.title || 'Adhan', artist: 'Quran Coach', playing: adhan.status === 'playing', elapsed: 0, duration: 0,
  } : {
    title: player.currentSurahName || 'Écoute du Coran', artist: item?.reciterName || useListenStore.getState().lastListened?.reciterName || 'Quran Coach',
    playing: player.isPlaying, elapsed: player.currentTime, duration: player.duration,
  };
  const signature = `${data.title}|${data.artist}|${data.playing}|${Math.floor(data.elapsed / 5)}`;
  if (signature === lastAudio) return;
  lastAudio = signature;
  void bridge.setNowPlaying(data).catch(() => {});
}

export function startCarMediaBridge() {
  if (!nativeIOS()) return () => {};
  const playerUnsubscribe = useAudioPlayerStore.subscribe(syncNowPlaying);
  const adhanUnsubscribe = useAdhanPlayback.subscribe(syncNowPlaying);
  let handle: PluginListenerHandle | undefined;
  void bridge.addListener('remoteCommand', data => applyRemote(data.action)).then(h => { handle = h; }).catch(() => {});
  syncNowPlaying();
  return () => { playerUnsubscribe(); adhanUnsubscribe(); void handle?.remove(); };
}
