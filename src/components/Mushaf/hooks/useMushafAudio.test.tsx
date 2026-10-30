// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { useMushafAudio, type MushafAudioState } from './useMushafAudio';
import {fetchVerseRecitation} from '../../../lib/verseRecitation';
vi.mock('../../../lib/verseRecitation',()=>({fetchVerseRecitation:vi.fn().mockResolvedValue(null)}));
import type { Ayah } from '../../../types';
vi.mock('../../../lib/quranApi',()=>({mushafReciter:(r:string)=>({quranComId:r==='ar.husary'?6:7}),getAudioUrl:(_r:string,n:number)=>`https://audio.test/${n}.mp3`}));
vi.mock('../../../lib/wordTimings',()=>({fetchWordTimings:vi.fn().mockResolvedValue(null)}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
class FakeAudio extends EventTarget {
    src='';currentTime=0;playbackRate=1;paused=true;
    play=vi.fn(async()=>{this.paused=false;this.dispatchEvent(new Event('play'));});
    pause=vi.fn(()=>{this.paused=true;this.dispatchEvent(new Event('pause'));});
}
let element:FakeAudio, api:MushafAudioState, root:Root, div:HTMLDivElement, ayahs:Ayah[];
let sourceMatchedPlayback=false;
let selectedReciter='ar.alafasy',pageMode=false,currentPage=2;
const nextPage=vi.fn();
const nextSurah=vi.fn();
const onPassageAyah=vi.fn();
function Harness(){api=useMushafAudio({sourceMatchedPlayback,pageAyahs:ayahs,selectedReciter,currentPage,nextPage,nextSurah,pageMode,onPassageAyah});return null;}
const render=()=>act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
beforeEach(async()=>{
 vi.stubGlobal('Audio',class extends FakeAudio{constructor(){super();element=this;}});
 vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 ayahs=Array.from({length:5},(_,i)=>({number:i+8,numberInSurah:i+1,surah:2,page:2,text:'نص'} as Ayah));
 sourceMatchedPlayback=false;vi.mocked(fetchVerseRecitation).mockReset().mockResolvedValue(null);
 selectedReciter='ar.alafasy';pageMode=false;currentPage=2;onPassageAyah.mockClear();nextPage.mockClear();nextSurah.mockClear();div=document.createElement('div');document.body.append(div);root=createRoot(div);await render();
});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function ended(){await act(async()=>{element.paused=true;element.dispatchEvent(new Event('ended'));});}
it('plays the complete selected passage three times and stops at its final verse',async()=>{
 await act(async()=>{expect(api.startPassage(2,3,3)).toBe(true);});
 const played=[api.currentAyahRef.current];
 for(let i=0;i<5;i++){await ended();played.push(api.currentAyahRef.current);}
 expect(played).toEqual([2,3,2,3,2,3]);expect(api.passage?.iteration).toBe(3);
 await ended();expect(api.passageComplete).toBe(true);expect(api.audioPlaying).toBe(false);expect(api.currentAyahRef.current).toBe(3);expect(nextSurah).not.toHaveBeenCalled();
 await ended();expect(element.play).toHaveBeenCalledTimes(6);
});
it('repeats one verse, can replay the finished selection, and rejects invalid ranges',async()=>{
 for(const args of [[0,2,3],[3,2,3],[1,6,3],[1,2,0],[1,2,21],[1.5,2,3]])expect(api.startPassage(...args as [number,number,number])).toBe(false);
 await act(async()=>{api.startPassage(5,5,2);});await ended();expect(api.currentAyahRef.current).toBe(5);
 await ended();expect(api.passageComplete).toBe(true);
 await act(async()=>api.toggleAudio());expect(api.passage?.iteration).toBe(1);expect(api.passageComplete).toBe(false);expect(nextSurah).not.toHaveBeenCalled();
});
it('pauses and resumes without restarting the verse, and applies speed immediately',async()=>{
 await act(async()=>api.playAyahAtIndex(1));element.currentTime=12.5;const source=element.src;
 await act(async()=>api.toggleAudio());expect(api.audioPlaying).toBe(false);
 await act(async()=>api.toggleAudio());expect(element.currentTime).toBe(12.5);expect(element.src).toBe(source);
 await act(async()=>api.setPlaybackSpeed(1.5));expect(element.playbackRate).toBe(1.5);
});
it('a new verse tap leaves the repetition, and stop ignores late ended events',async()=>{
 await act(async()=>{api.startPassage(2,3,3);});await act(async()=>api.playAyahAtIndex(4));expect(api.passage).toBeNull();
 await act(async()=>api.stopAudio());const calls=element.play.mock.calls.length;await ended();
 expect(api.audioActive).toBe(false);expect(element.play).toHaveBeenCalledTimes(calls);
});
it('reports an audio failure and does not claim to be playing',async()=>{
 element.play.mockRejectedValueOnce(new Error('offline'));
 await act(async()=>api.playAyahAtIndex(1));expect(api.audioPlaying).toBe(false);expect(api.audioError).toContain('indisponible');
 await act(async()=>api.toggleAudio());expect(api.audioPlaying).toBe(true);expect(api.audioError).toBeNull();
});
it('cancels a passage if another surah replaces its data',async()=>{
 await act(async()=>{api.startPassage(2,3,3);});ayahs=ayahs.map(a=>({...a,surah:3,number:a.number+100}));await render();
 expect(api.passage).toBeNull();expect(api.audioActive).toBe(false);
});
it('waits for the next surah data before continuous autoplay',async()=>{
 await act(async()=>api.playAyahAtIndex(4));await ended();expect(nextSurah).toHaveBeenCalledOnce();
 expect(api.currentAyahRef.current).toBe(5);
 ayahs=ayahs.map(a=>({...a,surah:3,number:a.number+100}));await render();expect(api.currentSurahRef.current).toBe(3);expect(api.currentAyahRef.current).toBe(1);
});

it('clears old word timings and requests the selected voice when changing reciter',async()=>{
 await act(async()=>api.playAyahAtIndex(1));
 await act(async()=>api.setVerseWordsMap(new Map([['2:2',{verseKey:'2:2',words:[]}]])));
 selectedReciter='ar.husary';await render();
 expect(api.audioActive).toBe(false);expect(api.verseWordsMap.size).toBe(0);
 await act(async()=>api.playAyahAtIndex(1));
 const {fetchWordTimings}=await import('../../../lib/wordTimings');
 expect(fetchWordTimings).toHaveBeenLastCalledWith(2,2,6);
});

it('continues onto the next page of the same surah only after its data is ready',async()=>{
 pageMode=true;await render();await act(async()=>api.playAyahAtIndex(4));await ended();
 expect(nextPage).toHaveBeenCalledOnce();expect(nextSurah).not.toHaveBeenCalled();
 const played=element.play.mock.calls.length;currentPage=3;ayahs=[];await render();expect(element.play).toHaveBeenCalledTimes(played);
 ayahs=[{number:13,numberInSurah:6,surah:2,page:3,text:'نص'} as Ayah];await render();
 expect(api.currentAyahRef.current).toBe(6);expect(element.play).toHaveBeenCalledTimes(played+1);
});
it('targets the right chapter when several chapters on a page share verse numbers',async()=>{
 pageMode=true;currentPage=604;ayahs=[{number:6222,numberInSurah:1,surah:112,page:604,text:'نص'},{number:6226,numberInSurah:1,surah:113,page:604,text:'نص'}] as Ayah[];await render();
 await act(async()=>{expect(api.startPassage(1,1,2,113)).toBe(true);});
 expect(api.currentSurahRef.current).toBe(113);await ended();expect(api.currentSurahRef.current).toBe(113);await ended();expect(api.passageComplete).toBe(true);
});
it('stops continuous page playback at the final verse of page 604',async()=>{
 pageMode=true;currentPage=604;ayahs=[{number:6236,numberInSurah:6,surah:114,page:604,text:'نص'}] as Ayah[];await render();
 await act(async()=>api.toggleAudio());await ended();expect(api.audioPlaying).toBe(false);expect(nextPage).not.toHaveBeenCalled();expect(nextSurah).not.toHaveBeenCalled();
});

it('keeps a prepared passage across page loads, repeats from its start, and cancels manual navigation',async()=>{
 pageMode=true;await render();
 const passage=[...ayahs.slice(3),{...ayahs[4],number:13,numberInSurah:6,page:3}];
 await act(async()=>{expect(api.startPassageFromAyahs(passage,2)).toBe(true);});
 await ended();await ended();expect(onPassageAyah).toHaveBeenLastCalledWith(passage[2]);
 currentPage=3;ayahs=[];await render();expect(api.audioPlaying).toBe(true);
 ayahs=[passage[2]];await render();expect(api.passage).not.toBeNull();
 await ended();expect(api.currentAyahRef.current).toBe(4);expect(api.passage?.iteration).toBe(2);
 currentPage=2;await render();await ended();await ended();currentPage=3;await render();await ended();
 expect(api.passageComplete).toBe(true);
 await act(async()=>api.toggleAudio());expect(api.currentAyahRef.current).toBe(4);expect(api.passage?.iteration).toBe(1);
 currentPage=15;await render();expect(api.audioActive).toBe(false);expect(api.passage).toBeNull();
});
it('rejects incomplete prepared passages and clears their queue when choosing a displayed verse',async()=>{
 expect(api.startPassageFromAyahs([ayahs[0],ayahs[2]],2)).toBe(false);
 expect(api.startPassageFromAyahs([],2)).toBe(false);
 await act(async()=>{api.startPassageFromAyahs(ayahs.slice(2),2);});
 await act(async()=>api.playAyahAtIndex(0));expect(api.currentAyahRef.current).toBe(1);expect(api.passage).toBeNull();
});

it('starts at a word with paired media, leaves single-verse mode and continues across pages',async()=>{
 pageMode=true;await render();await act(async()=>{api.startPassage(2,2,1);});
 await act(async()=>api.startContinuousAt(3,{url:'https://verses.quran.com/paired.mp3',offset:5.7,timings:{verseKey:'2:4',words:[{id:4,position:4,text:'',timestampFrom:5700,timestampTo:6000}]}}));
 expect(element.src).toBe('https://verses.quran.com/paired.mp3');expect(element.currentTime).toBe(5.7);expect(api.passage).toBeNull();
 await ended();expect(api.currentAyahRef.current).toBe(5);expect(element.currentTime).toBe(0);
 await ended();expect(nextPage).toHaveBeenCalledOnce();currentPage=3;ayahs=[{number:13,numberInSurah:6,surah:2,page:3,text:'نص'} as Ayah];await render();expect(api.currentAyahRef.current).toBe(6);
});
it('temporarily pauses and resumes only if originally playing and still on the same session',async()=>{
 await act(async()=>api.playAyahAtIndex(2));element.currentTime=8.2;let resume:()=>void=()=>{};
 await act(async()=>{resume=api.pauseForReading();});expect(element.paused).toBe(true);
 await act(async()=>resume());expect(element.paused).toBe(false);expect(element.currentTime).toBe(8.2);
 await act(async()=>api.toggleAudio());const calls=element.play.mock.calls.length;
 await act(async()=>{resume=api.pauseForReading();resume();});expect(element.play).toHaveBeenCalledTimes(calls);
 await act(async()=>api.toggleAudio());await act(async()=>{resume=api.pauseForReading();api.stopAudio();resume();});expect(api.audioPlaying).toBe(false);
});
it('stops at the configured final verse without advancing to the next page',async()=>{
 pageMode=true;await render();await act(async()=>{api.setStopAt(ayahs[2].number);await api.startContinuousAt(1);});
 await ended();expect(api.currentAyahRef.current).toBe(3);await ended();
 expect(api.audioActive).toBe(false);expect(nextPage).not.toHaveBeenCalled();
});
it('restores the exact source, timestamp, speed and boundary after stopping',async()=>{
 await act(async()=>api.startContinuousAt(2));element.currentTime=7.625;
 await act(async()=>{api.setPlaybackSpeed(1.25);api.setStopAt(ayahs[4].number);});
 const saved=api.snapshot()!;expect(saved.verse.numberInSurah).toBe(3);
 await act(async()=>api.stopAudio());await act(async()=>api.restoreSession(saved));
 expect(element.src).toBe(saved.url);expect(element.currentTime).toBe(7.625);expect(element.playbackRate).toBe(1.25);expect(api.stopAt).toBe(ayahs[4].number);
});
it('repeats a word-bounded selection and stops before the rest of the verse',async()=>{
 const timings={verseKey:'2:2',words:[]};const start={url:'https://audio.test/cut.mp3',offset:2.5,timings};
 await act(async()=>{api.startPassageFromAyahs([ayahs[1]],2,{start,end:{...start,offset:4},endTime:5});});
 expect(element.currentTime).toBe(2.5);
 await act(async()=>{element.currentTime=5.1;element.dispatchEvent(new Event('timeupdate'));});
 expect(api.passage?.iteration).toBe(2);expect(element.currentTime).toBe(2.5);
 await act(async()=>{element.currentTime=5.1;element.dispatchEvent(new Event('timeupdate'));});
 expect(api.passageComplete).toBe(true);expect(element.paused).toBe(true);expect(api.currentAyahRef.current).toBe(2);
});
it('keeps a stop boundary across automatic page changes',async()=>{
 pageMode=true;await render();await act(async()=>{api.setStopAt(14);await api.startContinuousAt(4);});
 await ended();expect(nextPage).toHaveBeenCalledOnce();
 currentPage=3;ayahs=[{number:13,numberInSurah:6,surah:2,page:3},{number:14,numberInSurah:7,surah:2,page:3},{number:15,numberInSurah:8,surah:2,page:3}] as Ayah[];await render();
 await ended();expect(api.currentPlayingAyah).toBe(14);await ended();expect(api.audioActive).toBe(false);expect(nextPage).toHaveBeenCalledTimes(1);
});

it('uses the verse audio file paired with caption timestamps, also on continuous next verse',async()=>{
 sourceMatchedPlayback=true;await render();
 vi.mocked(fetchVerseRecitation).mockImplementation(async key=>({url:`https://matched.test/${key}.mp3`,timings:{verseKey:key,words:[{id:1,position:1,text:'',timestampFrom:20,timestampTo:800}]}}));
 await act(async()=>api.playAyahAtIndex(0));
 expect(element.src).toBe('https://matched.test/2:1.mp3');expect(api.sourceMatchedVerse).toBe('2:1');
 await ended();expect(element.src).toBe('https://matched.test/2:2.mp3');expect(api.sourceMatchedVerse).toBe('2:2');
});
it('does not start a stale recording after stop during preparation',async()=>{
 sourceMatchedPlayback=true;await render();let resolve!:(value:null)=>void;
 vi.mocked(fetchVerseRecitation).mockImplementation(()=>new Promise(done=>{resolve=done;}));
 let pending!:Promise<void>;await act(async()=>{pending=api.playAyahAtIndex(0);});
 await act(async()=>api.stopAudio());await act(async()=>{resolve(null);await pending;});
 expect(element.play).not.toHaveBeenCalled();expect(api.audioActive).toBe(false);
});
it('resumes the requested verse instead of the old file after pausing its preparation',async()=>{
 sourceMatchedPlayback=true;await render();await act(async()=>api.playAyahAtIndex(0));
 let resolve!:(value:null)=>void;
 vi.mocked(fetchVerseRecitation).mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
 let pending!:Promise<void>;await act(async()=>{pending=api.playAyahAtIndex(1);});
 await act(async()=>api.toggleAudio());await act(async()=>{resolve(null);await pending;});
 await act(async()=>api.toggleAudio());expect(element.src).toBe('https://audio.test/9.mp3');expect(api.currentAyahRef.current).toBe(2);
});
it('does not claim matched captions when restoring a legacy session',async()=>{
 sourceMatchedPlayback=true;await render();await act(async()=>api.playAyahAtIndex(0));
 const saved=api.snapshot()!;delete saved.sourceMatched;
 await act(async()=>api.restoreSession(saved));expect(api.sourceMatchedVerse).toBeNull();
 expect(element.src).toBe(saved.url);
});
