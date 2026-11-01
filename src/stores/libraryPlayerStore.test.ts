// @vitest-environment jsdom
vi.hoisted(()=>{const entries=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>entries.get(key)||null,setItem:(key:string,value:string)=>entries.set(key,value),removeItem:(key:string)=>entries.delete(key)}});});
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
vi.mock('../lib/audioLibrary',()=>({libraryAudioSource:vi.fn(async(i:{url:string})=>i.url),loadAudioLibrary:vi.fn(async()=>[])}));
vi.mock('./audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:false})}}));
vi.mock('../lib/narrationMediaSession',()=>({bindNarrationMedia:vi.fn(),clearNarrationMedia:vi.fn(),updateNarrationMedia:vi.fn()}));
vi.mock('../lib/mediaSessionOwner',()=>({claimMediaSession:vi.fn()}));
vi.mock('../lib/audioUnlock',()=>({unlockAudio:vi.fn()}));
import {libraryAudioSource,loadAudioLibrary} from '../lib/audioLibrary';
import {unlockAudio} from '../lib/audioUnlock';
import {books} from '../lib/bookLibrary';
import {useLibraryPlayer} from './libraryPlayerStore';
import {useAudioLibraryStore} from './audioLibraryStore';
import type {LibraryAudio} from '../lib/audioProduction';
class MockAudio extends EventTarget {static instance:MockAudio;src='';currentTime=0;duration=100;paused=true;preload='';playbackRate=1;onloadedmetadata:(()=>void)|null=null;constructor(){super();MockAudio.instance=this;}play(){this.paused=false;this.onloadedmetadata?.();return Promise.resolve();}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}load(){}removeAttribute(){this.src='';}}
const track=(id:string,chapter:string,segment:number):LibraryAudio=>({id,title:`Adam · ${chapter==='names'?'1. Le savoir et le refus':'2. La promesse trompeuse'}`,reference:`Manuscrit adam-conte-2026-10-23-v1, chapitre ${chapter}, segment ${segment}/${chapter==='names'?2:1}`,text:id,url:`https://audio.test/${id}.mp3`,duration:100,bytes:100,category:'prophet',sourceUrl:'/',narrator:'George',sentences:[]});
const queue=[track('a','names',1),track('b','names',2),track('c','temptation',1)];
beforeEach(()=>{vi.stubGlobal('Audio',MockAudio);vi.spyOn(document,'hidden','get').mockReturnValue(false);vi.mocked(libraryAudioSource).mockImplementation(async item=>item.url);useAudioLibraryStore.setState({positions:{},autoNextBook:true});vi.mocked(loadAudioLibrary).mockResolvedValue([]);useLibraryPlayer.setState({queue:[],stopAtChapter:false,deadline:0});});
afterEach(()=>{useLibraryPlayer.getState().close();vi.useRealTimers();vi.restoreAllMocks();});
const end=async()=>{MockAudio.instance.currentTime=100;MockAudio.instance.dispatchEvent(new Event('ended'));await Promise.resolve();await Promise.resolve();};
it('plays through technical segments but stops at the real chapter boundary when requested',async()=>{const s=useLibraryPlayer.getState();s.setStopAtChapter(true);await s.play(queue[0],{queue});await end();expect(useLibraryPlayer.getState().item?.id).toBe('b');await end();expect(useLibraryPlayer.getState().item?.id).toBe('b');expect(useLibraryPlayer.getState().playing).toBe(false);});
it('continues to the next chapter from the beginning, even if previously partly heard',async()=>{useAudioLibraryStore.setState({positions:{c:{seconds:40,updatedAt:1}}});await useLibraryPlayer.getState().play(queue[1],{queue});await end();expect(useLibraryPlayer.getState().item?.id).toBe('c');expect(MockAudio.instance.currentTime).toBe(0);});
it('seeks across segments using a single chapter timeline and resumes exactly after pause',async()=>{await useLibraryPlayer.getState().play(queue[0],{queue});useLibraryPlayer.getState().seekChapter(135);await Promise.resolve();await Promise.resolve();expect(useLibraryPlayer.getState().item?.id).toBe('b');expect(MockAudio.instance.currentTime).toBe(35);useLibraryPlayer.getState().toggle();useLibraryPlayer.getState().toggle();await Promise.resolve();await Promise.resolve();expect(MockAudio.instance.currentTime).toBe(35);});
it('does not continue a queue after the sleep deadline',async()=>{await useLibraryPlayer.getState().play(queue[0],{queue});useLibraryPlayer.setState({deadline:Date.now()-1});MockAudio.instance.dispatchEvent(new Event('timeupdate'));await end();expect(useLibraryPlayer.getState().item?.id).toBe('a');expect(useLibraryPlayer.getState().playing).toBe(false);});
it('resumes an explicit reference bookmark near the end without resetting the chapter',async()=>{await useLibraryPlayer.getState().play(queue[0],{queue,startAt:99});expect(MockAudio.instance.currentTime).toBe(99);useLibraryPlayer.getState().pause();expect(useLibraryPlayer.getState().playing).toBe(false);await useLibraryPlayer.getState().play(queue[0],{queue,startAt:99});expect(MockAudio.instance.currentTime).toBe(99);});
it('restores a paused excursion at its exact position without starting playback',async()=>{
 await useLibraryPlayer.getState().play(queue[1],{queue,startAt:25});
 const play=vi.spyOn(MockAudio.instance,'play');
 await useLibraryPlayer.getState().play(queue[0],{queue,startAt:62.75,autoplay:false});
 MockAudio.instance.onloadedmetadata?.();
 expect(play).not.toHaveBeenCalled();expect(MockAudio.instance.currentTime).toBe(62.75);expect(useLibraryPlayer.getState().position).toBe(62.75);expect(useLibraryPlayer.getState().playing).toBe(false);
 useLibraryPlayer.getState().toggle();await Promise.resolve();await Promise.resolve();expect(MockAudio.instance.currentTime).toBe(62.75);expect(play).toHaveBeenCalledOnce();play.mockRestore();
});

const completeTracks=(id:string)=>{const book=books.find(b=>b.id===id)!;return book.chapters.map((c,index)=>({...track(`${id}-${index}`,c.id,1),title:`${book.title} · ${c.title}`,reference:`Manuscrit ${c.audioVersion||book.version}, chapitre ${c.id}, segment 1/1`}));};
it('announces and starts a complete next book without looping to the current one',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue([...adam,...nuh]);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();
 expect(useLibraryPlayer.getState().nextBook?.book.id).toBe('nuh');expect(useLibraryPlayer.getState().nextBookAt).toBeGreaterThan(0);
 await vi.advanceTimersByTimeAsync(8000);expect(useLibraryPlayer.getState().item?.id).toBe(nuh[0].id);
 expect(useLibraryPlayer.getState().nextBook).toBeNull();
});
it('cancels the announced next book and respects a sleep timer during the transition',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();useLibraryPlayer.getState().cancelNextBook();await vi.advanceTimersByTimeAsync(8000);
 expect(useLibraryPlayer.getState().item?.id).toBe(adam.at(-1)!.id);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});useLibraryPlayer.getState().sleep(.05);await end();await vi.advanceTimersByTimeAsync(8000);
 expect(useLibraryPlayer.getState().item?.id).toBe(adam.at(-1)!.id);expect(useLibraryPlayer.getState().playing).toBe(false);
});
it('does not chain disabled, incomplete, or prematurely stopped books',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh.slice(1));
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();expect(useLibraryPlayer.getState().nextBook).toBeNull();
 vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);useAudioLibraryStore.getState().setAutoNextBook(false);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();await vi.advanceTimersByTimeAsync(9000);expect(useLibraryPlayer.getState().item?.id).toBe(adam.at(-1)!.id);
 useAudioLibraryStore.getState().setAutoNextBook(true);await useLibraryPlayer.getState().play(adam[0],{queue:[adam[0]]});await end();expect(useLibraryPlayer.getState().nextBookAt).toBe(0);
});
it('keeps an explicit cancellation through the remaining segments and permits reactivation',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 await useLibraryPlayer.getState().play(adam[0],{queue:adam});await Promise.resolve();useLibraryPlayer.getState().cancelNextBook();
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam,continueSeries:true});await end();await vi.advanceTimersByTimeAsync(9000);
 expect(useLibraryPlayer.getState().item?.id).toBe(adam.at(-1)!.id);expect(useLibraryPlayer.getState().nextBook).toBeNull();
 useLibraryPlayer.getState().setAutoNextBook(true);await Promise.resolve();await Promise.resolve();expect(useLibraryPlayer.getState().nextBook?.book.id).toBe('nuh');
});
it('waits for the catalogue when it arrives after the book finishes',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');let resolve!:(value:typeof nuh)=>void;
 vi.mocked(loadAudioLibrary).mockImplementation(()=>new Promise(r=>{resolve=r;}));
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();expect(useLibraryPlayer.getState().nextBookAt).toBe(0);
 resolve(nuh);await Promise.resolve();await Promise.resolve();expect(useLibraryPlayer.getState().nextBook?.book.id).toBe('nuh');
 await vi.advanceTimersByTimeAsync(8000);expect(useLibraryPlayer.getState().item?.id).toBe(nuh[0].id);
});

it('starts the next book directly from ended while hidden, without timers or another audio unlock',async()=>{
 vi.useFakeTimers();vi.spyOn(document,'hidden','get').mockReturnValue(true);
 const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await Promise.resolve();
 const player=MockAudio.instance,play=vi.spyOn(player,'play'),pause=vi.spyOn(player,'pause');vi.mocked(unlockAudio).mockClear();
 player.dispatchEvent(new Event('ended'));
 // No promise flush or timer advance: play() must stay in the media callback.
 expect(player.src).toBe(nuh[0].url);expect(play).toHaveBeenCalledOnce();expect(pause).not.toHaveBeenCalled();expect(unlockAudio).not.toHaveBeenCalled();
 expect(useLibraryPlayer.getState().nextBookAt).toBe(0);await Promise.resolve();expect(useLibraryPlayer.getState().playing).toBe(true);
});
it('hands off a prepared offline Blob synchronously and releases it only when no longer used',async()=>{
 const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 vi.spyOn(document,'hidden','get').mockReturnValue(true);vi.spyOn(navigator,'onLine','get').mockReturnValue(false);
 const revoke=vi.fn();vi.stubGlobal('URL',class extends URL {static revokeObjectURL=revoke;});
 vi.mocked(libraryAudioSource).mockImplementation(async item=>item.id===nuh[0].id?'blob:next-book':item.url);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await Promise.resolve();await Promise.resolve();
 const source=vi.mocked(libraryAudioSource);source.mockClear();MockAudio.instance.dispatchEvent(new Event('ended'));
 expect(MockAudio.instance.src).toBe('blob:next-book');expect(source.mock.calls.some(([item])=>item.id===nuh[0].id)).toBe(false);expect(revoke).not.toHaveBeenCalledWith('blob:next-book');
 await Promise.resolve();useLibraryPlayer.getState().close();expect(revoke).toHaveBeenCalledWith('blob:next-book');vi.unstubAllGlobals();
});
it('finishes a visible grace period immediately when the screen locks, only once',async()=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();expect(useLibraryPlayer.getState().nextBookAt).toBeGreaterThan(0);
 const play=vi.spyOn(MockAudio.instance,'play');vi.spyOn(document,'hidden','get').mockReturnValue(true);document.dispatchEvent(new Event('visibilitychange'));
 expect(useLibraryPlayer.getState().item?.id).toBe(nuh[0].id);expect(play).toHaveBeenCalledOnce();
 await vi.advanceTimersByTimeAsync(8000);expect(play).toHaveBeenCalledOnce();
});
it.each(['pause','cancel','sleep','chapter','disabled'] as const)('does not resume on lock after %s',async action=>{
 vi.useFakeTimers();const adam=completeTracks('adam'),nuh=completeTracks('nuh');vi.mocked(loadAudioLibrary).mockResolvedValue(nuh);
 await useLibraryPlayer.getState().play(adam.at(-1)!,{queue:adam});await end();
 const s=useLibraryPlayer.getState();if(action==='pause')s.pause();if(action==='cancel')s.cancelNextBook();if(action==='sleep')useLibraryPlayer.setState({deadline:Date.now()-1});if(action==='chapter')s.setStopAtChapter(true);if(action==='disabled')s.setAutoNextBook(false);
 const play=vi.spyOn(MockAudio.instance,'play');vi.spyOn(document,'hidden','get').mockReturnValue(true);document.dispatchEvent(new Event('visibilitychange'));await vi.advanceTimersByTimeAsync(9000);
 expect(play).not.toHaveBeenCalled();expect(useLibraryPlayer.getState().item?.id).toBe(adam.at(-1)!.id);
});
it('starts the next chapter synchronously even if its optional cache preparation is still pending',async()=>{
 vi.spyOn(document,'hidden','get').mockReturnValue(true);
 vi.mocked(libraryAudioSource).mockImplementation(item=>item.id===queue[1].id?new Promise(()=>{}):Promise.resolve(item.url));
 await useLibraryPlayer.getState().play(queue[0],{queue});const play=vi.spyOn(MockAudio.instance,'play');MockAudio.instance.dispatchEvent(new Event('ended'));
 expect(MockAudio.instance.src).toBe(queue[1].url);expect(play).toHaveBeenCalledOnce();
});
