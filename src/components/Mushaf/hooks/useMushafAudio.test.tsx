// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { useMushafAudio, type MushafAudioState } from './useMushafAudio';
import type { Ayah } from '../../../types';
vi.mock('../../../lib/quranApi',()=>({getAudioUrl:(_r:string,n:number)=>`https://audio.test/${n}.mp3`}));
vi.mock('../../../lib/wordTimings',()=>({fetchWordTimings:vi.fn().mockResolvedValue(null)}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
class FakeAudio extends EventTarget {
    src='';currentTime=0;playbackRate=1;paused=true;
    play=vi.fn(async()=>{this.paused=false;this.dispatchEvent(new Event('play'));});
    pause=vi.fn(()=>{this.paused=true;this.dispatchEvent(new Event('pause'));});
}
let element:FakeAudio, api:MushafAudioState, root:Root, div:HTMLDivElement, ayahs:Ayah[];
const nextSurah=vi.fn();
function Harness(){api=useMushafAudio({pageAyahs:ayahs,selectedReciter:'ar.alafasy',currentPage:2,nextPage:vi.fn(),nextSurah});return null;}
const render=()=>act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
beforeEach(async()=>{
 vi.stubGlobal('Audio',class extends FakeAudio{constructor(){super();element=this;}});
 vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1));vi.stubGlobal('cancelAnimationFrame',vi.fn());
 ayahs=Array.from({length:5},(_,i)=>({number:i+8,numberInSurah:i+1,surah:2,page:2,text:'نص'} as Ayah));
 nextSurah.mockClear();div=document.createElement('div');document.body.append(div);root=createRoot(div);await render();
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
