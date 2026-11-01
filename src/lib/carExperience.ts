import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useAdhanPlayback, stopAdhan } from './adhanPlayback';
import { useListenStore } from '../stores/listenStore';
import { mosqueScheduleEvents, scheduleSlug } from './mosqueScheduleEvents';
import { activeMosque, useMosqueStore } from '../stores/mosqueStore';
import { useMosquePlansStore } from '../stores/mosquePlansStore';
import { useMosqueDirectoryStore } from '../stores/mosqueDirectoryStore';
import type { AdhanEvent } from './adhanSchedule';
import {readCarPlayback,useNativeCarPlayback,carPlaybackCommand,type NativeCarPlayback} from './nativeCarPlayback';
import {mediaSessionOwner,claimMediaSession,releaseMediaSession} from './mediaSessionOwner';

interface CarBridge {
  updatePrayerSnapshot(data: { mosque: string; adhanName: string; adhanAt: number; iqamaName: string; iqamaAt: number; source: string; updatedAt: number; events:{kind:'adhan'|'iqama';label:string;at:number}[] }): Promise<void>;
  setNowPlaying(data: { title: string; artist: string; playing: boolean; elapsed: number; duration: number }): Promise<void>;
  clearNowPlaying(): Promise<void>;
  getCarPlayback():Promise<NativeCarPlayback>;
  updateCarPreferences(data:{reciter?:string;autoNextBook?:boolean}):Promise<void>;
  addListener(event: 'remoteCommand'|'nativePlayback', callback: (data: Record<string,unknown>) => void): Promise<PluginListenerHandle>;
}
const bridge = registerPlugin<CarBridge>('QuranCoachCar');
const nativeIOS = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
let lastSnapshot = '';
let lastSnapshotAt = 0;
let lastAudio = '';
let suppressWebSync=false;

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

async function applyRemote(action: string,seconds?:number) {
  const player = useAudioPlayerStore.getState();
  const adhan = useAdhanPlayback.getState();
  if (adhan.status === 'playing' || adhan.status === 'loading') {
    if (action === 'pause' || action === 'toggle') stopAdhan();
    return;
  }
  const {useLibraryPlayer}=await import('../stores/libraryPlayerStore');
  const library=useLibraryPlayer.getState();
  if(library.item&&(library.playing||library.loading||mediaSessionOwner()==='audio-library')){
    if(action==='play'&&!library.playing||action==='toggle')library.toggle();
    if(action==='pause')library.pause();
    if(action==='seek'&&Number.isFinite(seconds))library.seek(seconds!);
    if(action==='forward')library.seek(library.position+15);
    if(action==='backward')library.seek(library.position-15);
    const index=library.queue.findIndex(item=>item.id===library.item?.id),next=library.queue[index+(action==='next'?1:-1)];
    if((action==='next'||action==='previous')&&next)void library.play(next,{queue:library.queue,fromStart:true});
    return;
  }
  if (!player.currentSurahNumber) return;
  if (action === 'play' && !player.isPlaying) player.togglePlay();
  if (action === 'pause' && player.isPlaying) player.togglePlay();
  if (action === 'toggle') player.togglePlay();
  if (action === 'next') player.nextAyah();
  if (action === 'previous') player.prevAyah();
  if (action === 'seek'&&Number.isFinite(seconds)) player.seek(seconds!);
  if (action === 'forward') player.seek(player.currentTime+15);
  if (action === 'backward') player.seek(player.currentTime-15);
}

function syncNowPlaying() {
  if (!nativeIOS()||suppressWebSync||mediaSessionOwner()==='car-native'||mediaSessionOwner()==='audio-library') return;
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
  let disposed=false,stopRequested=false;
  const playerUnsubscribe = useAudioPlayerStore.subscribe(syncNowPlaying);
  const adhanUnsubscribe = useAdhanPlayback.subscribe(syncNowPlaying);
  const handles:PluginListenerHandle[]=[];
  const cleanups:(()=>void)[]=[];
  const listen=(event:'remoteCommand'|'nativePlayback',callback:(data:Record<string,unknown>)=>void)=>{
    void bridge.addListener(event,callback).then(h=>{if(disposed)void h.remove();else handles.push(h);}).catch(()=>{});
  };
  listen('remoteCommand',data=>{if(typeof data.action==='string')void applyRemote(data.action,typeof data.seconds==='number'?data.seconds:undefined);});
  const accept=(raw:unknown)=>{
    if(disposed)return;
    const state=readCarPlayback(raw);
    const previous=useNativeCarPlayback.getState();
    if(!state.active){stopRequested=false;releaseMediaSession('car-native');}
    if(state.active&&!stopRequested&&(!previous.active||previous.id!==state.id)){
      claimMediaSession('car-native');suppressWebSync=true;
      window.dispatchEvent(new Event('quran-stop-playback'));
      const player=useAudioPlayerStore.getState();if(player.isPlaying||player.isLoading)player.stop();
      stopAdhan();suppressWebSync=false;
    }
    useNativeCarPlayback.setState(state);
  };
  listen('nativePlayback',accept);
  void bridge.getCarPlayback().then(accept).catch(()=>{});
  const stopNative=()=>{
    if(suppressWebSync||!useNativeCarPlayback.getState().active)return;
    stopRequested=true;releaseMediaSession('car-native');
    void carPlaybackCommand('stop').catch(()=>{});
  };
  window.addEventListener('quran-stop-playback',stopNative);
  const onVisible=()=>{if(!document.hidden)void bridge.getCarPlayback().then(accept).catch(()=>{});};
  document.addEventListener('visibilitychange',onVisible);
  // Narration modules are loaded only for the native bridge, not by the PWA.
  void Promise.all([import('../stores/libraryPlayerStore'),import('../stores/audioLibraryStore'),import('../stores/settingsStore')]).then(([{useLibraryPlayer},{useAudioLibraryStore},{useSettingsStore}])=>{
    if(disposed)return;
    let lastPreferences='';
    const preferences=()=>{
      const value={reciter:useSettingsStore.getState().selectedReciter,autoNextBook:useAudioLibraryStore.getState().autoNextBook},signature=JSON.stringify(value);
      if(lastPreferences===signature)return;lastPreferences=signature;
      void bridge.updateCarPreferences(value).catch(()=>{lastPreferences='';});
    };
    cleanups.push(useSettingsStore.subscribe(preferences),useAudioLibraryStore.subscribe(preferences));preferences();
    const librarySync=()=>{
      if(suppressWebSync)return;
      const s=useLibraryPlayer.getState();if(!s.item)return;
      if(s.playing||s.loading)stopNative();
      if(mediaSessionOwner()==='audio-library')void bridge.setNowPlaying({title:s.item.title,artist:s.item.narrator,playing:s.playing,elapsed:s.position,duration:s.duration}).catch(()=>{});
    };
    cleanups.push(useLibraryPlayer.subscribe(librarySync));
    cleanups.push(useNativeCarPlayback.subscribe(s=>{if(s.active&&s.id&&!s.id.includes(':'))useAudioLibraryStore.getState().savePosition(s.id,s.position);}));
    const webStarts=()=>{if(!suppressWebSync&&(useAudioPlayerStore.getState().isPlaying||useAudioPlayerStore.getState().isLoading))stopNative();};
    cleanups.push(useAudioPlayerStore.subscribe(webStarts));
    const native=useNativeCarPlayback.getState();if(native.active){useLibraryPlayer.getState().pause();claimMediaSession('car-native');}
  }).catch(()=>{});
  return () => {disposed=true;playerUnsubscribe();adhanUnsubscribe();cleanups.forEach(stop=>stop());handles.forEach(h=>void h.remove());window.removeEventListener('quran-stop-playback',stopNative);document.removeEventListener('visibilitychange',onVisible);};
}
