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
 const settings=store({carIqamaReminderEnabled:false,carIqamaMinutes:5});
 const listen=store({reciters:[],history:[],favoriteReciters:[],bookmarks:[],lastListened:null,setLastListened:vi.fn()});
 const mosque=store({}),plans=store({plans:{}}),directory=store({links:{},automatic:{},published:{}});
 const adhan=store({status:'idle'});
 return {player,library,librarySettings,settings,listen,mosque,plans,directory,adhan,callbacks,stopAdhan:vi.fn(),bridge:{setNowPlaying:vi.fn(),clearNowPlaying:vi.fn(),getCarPlayback:vi.fn(),carPlaybackCommand:vi.fn(),updatePrayerSnapshot:vi.fn(),updateListeningSnapshot:vi.fn(),updateCarPreferences:vi.fn(),addListener:vi.fn()}};
});
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios'},registerPlugin:()=>f.bridge}));
vi.mock('../stores/audioPlayerStore',()=>({useAudioPlayerStore:f.player}));
vi.mock('../stores/libraryPlayerStore',()=>({useLibraryPlayer:f.library}));
vi.mock('../stores/audioLibraryStore',()=>({useAudioLibraryStore:f.librarySettings}));
vi.mock('../stores/notificationStore',()=>({useNotificationStore:f.settings}));
vi.mock('./adhanPlayback',()=>({useAdhanPlayback:f.adhan,stopAdhan:f.stopAdhan}));
vi.mock('../stores/listenStore',()=>({useListenStore:f.listen}));
vi.mock('./mosqueScheduleEvents',()=>({scheduleSlug:()=>undefined,mosqueScheduleEvents:()=>[]}));
vi.mock('../stores/mosqueStore',()=>({activeMosque:()=>null,useMosqueStore:f.mosque}));
vi.mock('../stores/mosquePlansStore',()=>({useMosquePlansStore:f.plans}));
vi.mock('../stores/mosqueDirectoryStore',()=>({useMosqueDirectoryStore:f.directory}));
import {startCarMediaBridge} from './carExperience';
import {useNativeCarPlayback,emptyCarPlayback} from './nativeCarPlayback';
import {claimMediaSession,releaseMediaSession} from './mediaSessionOwner';
let dispose=()=>{};
beforeEach(()=>{
 vi.clearAllMocks();f.callbacks.clear();useNativeCarPlayback.setState(emptyCarPlayback);releaseMediaSession('car-native');releaseMediaSession('audio-library');
 Object.assign(f.player.value,{isPlaying:false,isLoading:false});Object.assign(f.library.value,{item:null,playing:false,loading:false,queue:[],position:0});
 Object.assign(f.listen.value,{lastListened:null,reciters:[],history:[],favoriteReciters:[],bookmarks:[]});
 Object.assign(f.settings.value,{carIqamaReminderEnabled:false,carIqamaMinutes:5});
 f.bridge.getCarPlayback.mockResolvedValue(emptyCarPlayback);f.bridge.carPlaybackCommand.mockResolvedValue(emptyCarPlayback);
 f.bridge.addListener.mockImplementation(async(event:string,cb:(data:Record<string,unknown>)=>void)=>{f.callbacks.set(event,cb);return {remove:vi.fn()};});
 f.bridge.setNowPlaying.mockResolvedValue(undefined);f.bridge.updateCarPreferences.mockResolvedValue(undefined);
 f.bridge.updateListeningSnapshot.mockResolvedValue(undefined);f.bridge.updatePrayerSnapshot.mockResolvedValue(undefined);
});
it('shares listening favorites, exact bookmarks and native reminder preferences without the Mushaf reciter',async()=>{
 const track={reciterId:'123',reciterName:'Alafasy',surahNumber:2,surahName:'Al-Baqarah',audioUrl:'https://server8.mp3quran.net/afs/002.mp3',position:452.75,updatedAt:12000};
 Object.assign(f.listen.value,{favoriteReciters:['123'],lastListened:track,bookmarks:[{track,createdAt:12000,id:'b'}]});
 dispose=startCarMediaBridge();await vi.waitFor(()=>expect(f.bridge.updateListeningSnapshot).toHaveBeenCalled());
 expect(f.bridge.updateListeningSnapshot).toHaveBeenCalledWith(expect.objectContaining({favorites:['123'],resume:expect.objectContaining({position:452.75,index:0}),bookmarks:[expect.objectContaining({position:452.75})]}));
 expect(f.bridge.updateCarPreferences).toHaveBeenCalledWith({autoNextBook:true,iqamaReminderEnabled:false,iqamaMinutes:5});
 Object.assign(f.settings.value,{carIqamaReminderEnabled:true,carIqamaMinutes:10});f.settings.emit();
 expect(f.bridge.updateCarPreferences).toHaveBeenLastCalledWith({autoNextBook:true,iqamaReminderEnabled:true,iqamaMinutes:10});
});
it('returns native listening progress to the exact phone edition and does not carry it into book playback',async()=>{
 const url='https://server8.mp3quran.net/afs/002.mp3';
 Object.assign(f.listen.value,{reciters:[{id:123,name:'Alafasy',moshaf:[{id:2,server:'https://server8.mp3quran.net/afs/',name:'Hafs',surah_total:114,moshaf_type:11,surah_list:'1,2,3'}]}]});
 dispose=startCarMediaBridge();await vi.waitFor(()=>expect(f.bridge.updateListeningSnapshot).toHaveBeenCalled());
 f.callbacks.get('nativePlayback')!({active:true,id:'listen:123:2',title:'Al-Baqarah',path:'/listen/123?surah=2',playing:true,position:72.5,listening:{reciterId:'123',reciterName:'Alafasy',surahNumber:2,surahName:'Al-Baqarah',audioUrl:url,totalAyahs:286}});
 expect(f.listen.value.setLastListened).toHaveBeenCalledWith(expect.objectContaining({audioUrl:url,position:72.5,playlistIndex:1,playlist:expect.arrayContaining([expect.objectContaining({audioUrl:url})])}));
 f.callbacks.get('nativePlayback')!({active:true,id:'book-id',title:'Livre',path:'/books/adam',playing:true,position:7});
 expect(useNativeCarPlayback.getState().listening).toBeUndefined();
 expect(f.librarySettings.value.savePosition).toHaveBeenLastCalledWith('book-id',7);
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
