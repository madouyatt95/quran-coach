// @vitest-environment jsdom
vi.hoisted(()=>{const entries=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>entries.get(key)||null,setItem:(key:string,value:string)=>entries.set(key,value),removeItem:(key:string)=>entries.delete(key)}});});
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
vi.mock('../lib/audioLibrary',()=>({libraryAudioSource:vi.fn(async(i:{url:string})=>i.url)}));
vi.mock('./audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:false})}}));
vi.mock('../lib/narrationMediaSession',()=>({bindNarrationMedia:vi.fn(),clearNarrationMedia:vi.fn(),updateNarrationMedia:vi.fn()}));
vi.mock('../lib/mediaSessionOwner',()=>({claimMediaSession:vi.fn()}));
vi.mock('../lib/audioUnlock',()=>({unlockAudio:vi.fn()}));
import {useLibraryPlayer} from './libraryPlayerStore';
import {useAudioLibraryStore} from './audioLibraryStore';
import type {LibraryAudio} from '../lib/audioProduction';
class MockAudio extends EventTarget {static instance:MockAudio;src='';currentTime=0;duration=100;paused=true;preload='';playbackRate=1;onloadedmetadata:(()=>void)|null=null;constructor(){super();MockAudio.instance=this;}play(){this.paused=false;this.onloadedmetadata?.();return Promise.resolve();}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}load(){}removeAttribute(){this.src='';}}
const track=(id:string,chapter:string,segment:number):LibraryAudio=>({id,title:`Adam · ${chapter==='names'?'1. Le savoir et le refus':'2. La promesse trompeuse'}`,reference:`Manuscrit adam-conte-2026-10-23-v1, chapitre ${chapter}, segment ${segment}/${chapter==='names'?2:1}`,text:id,url:`https://audio.test/${id}.mp3`,duration:100,bytes:100,category:'prophet',sourceUrl:'/',narrator:'George',sentences:[]});
const queue=[track('a','names',1),track('b','names',2),track('c','temptation',1)];
beforeEach(()=>{vi.stubGlobal('Audio',MockAudio);useAudioLibraryStore.setState({positions:{}});useLibraryPlayer.setState({queue:[],stopAtChapter:false,deadline:0});});
afterEach(()=>{useLibraryPlayer.getState().close();});
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
