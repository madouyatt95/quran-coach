// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const f=vi.hoisted(()=>{
 const store=(value:Record<string,unknown>)=>{
  const listeners=new Set<()=>void>();return {getState:()=>value,subscribe:(cb:()=>void)=>{listeners.add(cb);return()=>listeners.delete(cb);},emit:()=>listeners.forEach(cb=>cb()),value};
 };
 const callbacks=new Map<string,(data:Record<string,unknown>)=>void>();
 const player=store({isPlaying:false,isLoading:false,currentSurahNumber:2,currentTime:0,playlist:[],currentPlaylistIndex:0,stop:vi.fn(),togglePlay:vi.fn(),nextAyah:vi.fn(),prevAyah:vi.fn(),seek:vi.fn()});
 const library=store({item:null,playing:false,loading:false,position:0,queue:[],pause:vi.fn(),toggle:vi.fn(),seek:vi.fn(),play:vi.fn()});
 const librarySettings=store({autoNextBook:true,savePosition:vi.fn()});
 const settings=store({selectedReciter:'ar.alafasy'});
 const adhan=store({status:'idle'});
 return {player,library,librarySettings,settings,adhan,callbacks,stopAdhan:vi.fn(),bridge:{setNowPlaying:vi.fn(),clearNowPlaying:vi.fn(),getCarPlayback:vi.fn(),carPlaybackCommand:vi.fn(),updateCarPreferences:vi.fn(),addListener:vi.fn()}};
});
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios'},registerPlugin:()=>f.bridge}));
vi.mock('../stores/audioPlayerStore',()=>({useAudioPlayerStore:f.player}));
vi.mock('../stores/libraryPlayerStore',()=>({useLibraryPlayer:f.library}));
vi.mock('../stores/audioLibraryStore',()=>({useAudioLibraryStore:f.librarySettings}));
vi.mock('../stores/settingsStore',()=>({useSettingsStore:f.settings}));
vi.mock('./adhanPlayback',()=>({useAdhanPlayback:f.adhan,stopAdhan:f.stopAdhan}));
vi.mock('../stores/listenStore',()=>({useListenStore:{getState:()=>({})}}));
vi.mock('./mosqueScheduleEvents',()=>({scheduleSlug:()=>undefined,mosqueScheduleEvents:()=>[]}));
vi.mock('../stores/mosqueStore',()=>({activeMosque:()=>null,useMosqueStore:{getState:()=>({})}}));
vi.mock('../stores/mosquePlansStore',()=>({useMosquePlansStore:{getState:()=>({plans:{}})}}));
vi.mock('../stores/mosqueDirectoryStore',()=>({useMosqueDirectoryStore:{getState:()=>({})}}));
import {startCarMediaBridge} from './carExperience';
import {useNativeCarPlayback,emptyCarPlayback} from './nativeCarPlayback';
import {claimMediaSession,releaseMediaSession} from './mediaSessionOwner';
let dispose=()=>{};
beforeEach(()=>{
 vi.clearAllMocks();f.callbacks.clear();useNativeCarPlayback.setState(emptyCarPlayback);releaseMediaSession('car-native');releaseMediaSession('audio-library');
 Object.assign(f.player.value,{isPlaying:false,isLoading:false});Object.assign(f.library.value,{item:null,playing:false,loading:false,queue:[],position:0});
 f.bridge.getCarPlayback.mockResolvedValue(emptyCarPlayback);f.bridge.carPlaybackCommand.mockResolvedValue(emptyCarPlayback);
 f.bridge.addListener.mockImplementation(async(event:string,cb:(data:Record<string,unknown>)=>void)=>{f.callbacks.set(event,cb);return {remove:vi.fn()};});
 f.bridge.setNowPlaying.mockResolvedValue(undefined);f.bridge.updateCarPreferences.mockResolvedValue(undefined);
});
afterEach(()=>dispose());
it('stops web audio once on native takeover and keeps native progress without repeating the stop',async()=>{
 dispose=startCarMediaBridge();await vi.waitFor(()=>expect(f.bridge.updateCarPreferences).toHaveBeenCalled());
 Object.assign(f.player.value,{isPlaying:true});
 const native={active:true,id:'recording-id',title:'Adam',path:'/books/adam',playing:true,position:10,duration:100};
 f.callbacks.get('nativePlayback')!(native);
 expect(f.player.value.stop).toHaveBeenCalledOnce();expect(f.stopAdhan).toHaveBeenCalledOnce();
 f.callbacks.get('nativePlayback')!({...native,position:11});
 expect(f.player.value.stop).toHaveBeenCalledOnce();expect(f.librarySettings.value.savePosition).toHaveBeenLastCalledWith('recording-id',11);
 window.dispatchEvent(new Event('quran-stop-playback'));
 expect(f.bridge.carPlaybackCommand).toHaveBeenCalledWith({action:'stop'});
});
it('routes headphone pause and seek to a book instead of the stale Quran player',async()=>{
 dispose=startCarMediaBridge();await vi.waitFor(()=>expect(f.bridge.updateCarPreferences).toHaveBeenCalled());
 Object.assign(f.library.value,{item:{id:'book',title:'Adam'},playing:true,position:12});claimMediaSession('audio-library');
 f.callbacks.get('remoteCommand')!({action:'pause'});await vi.waitFor(()=>expect(f.library.value.pause).toHaveBeenCalledOnce());
 f.callbacks.get('remoteCommand')!({action:'seek',seconds:40});await vi.waitFor(()=>expect(f.library.value.seek).toHaveBeenCalledWith(40));
 expect(f.player.value.togglePlay).not.toHaveBeenCalled();
 f.player.emit();expect(f.bridge.setNowPlaying).not.toHaveBeenCalled();
});
