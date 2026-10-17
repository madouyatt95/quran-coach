// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createJSONStorage } from 'zustand/middleware';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { useVerseEntry } from './useVerseEntry';
import { useQuranStore } from '../../../stores/quranStore';
import { createMemoryStorage } from '../../../test/memoryStorage';
import type { Ayah } from '../../../types';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;const scroll=vi.fn();
const verse=(ayah:number):Ayah=>({surah:2,numberInSurah:ayah,number:ayah+7,page:4,text:'آية',juz:1,hizbQuarter:1});
function Harness({ready=true,visible=true,verses=[verse(25)],position=0}:{ready?:boolean;visible?:boolean;verses?:Ayah[];position?:number}) {
 const ref=useRef<HTMLDivElement>(null);const entry=useVerseEntry(ref,verses,ready,visible,position);
 return <div ref={ref} data-entry={entry}>{verses.map(v=><span key={v.number} data-verse-key={`2:${v.numberInSurah}`}>آية<span data-word-key={`2:${v.numberInSurah}:3`}>كلمة</span></span>)}</div>;
}
const render=async(props:Parameters<typeof Harness>[0]={})=>act(async()=>{root.render(<Harness {...props}/>);});
const frame=async()=>act(async()=>{await vi.advanceTimersByTimeAsync(20);});
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('localStorage',createMemoryStorage());useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});vi.stubGlobal('sessionStorage',createMemoryStorage());vi.stubGlobal('requestAnimationFrame',(fn:FrameRequestCallback)=>setTimeout(()=>fn(0),1));vi.stubGlobal('cancelAnimationFrame',clearTimeout);HTMLElement.prototype.scrollBy=scroll;scroll.mockClear();useQuranStore.setState({currentSurah:2,currentAyah:25,currentPage:4,jumpSignal:10});sessionStorage.setItem('scrollToAyah',JSON.stringify({surah:2,ayah:25}));host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals();});
it('waits for the target page then highlights and centers without opening any panel',async()=>{
 await render({ready:false});await frame();expect(scroll).not.toHaveBeenCalled();
 await render();await frame();expect(host.firstElementChild?.getAttribute('data-entry')).toBe('2:25');expect(scroll).toHaveBeenCalledOnce();expect(sessionStorage.getItem('scrollToAyah')).toBeNull();
 await render();await frame();expect(scroll).toHaveBeenCalledOnce();
});
it('handles another verse on the same page and clears the visual marker after leaving the page',async()=>{
 await render();await frame();await act(async()=>useQuranStore.getState().goToAyah(2,24,4,{silent:true}));await render({verses:[verse(24)]});await frame();expect(host.firstElementChild?.getAttribute('data-entry')).toBe('2:24');
 await act(async()=>useQuranStore.setState({currentPage:5}));expect(host.firstElementChild?.getAttribute('data-entry')).toBeNull();
});
it('does not consume navigation while the persistent reader is hidden or the target is absent',async()=>{
 await render({visible:false});await frame();expect(scroll).not.toHaveBeenCalled();await render({verses:[verse(24)]});await frame();expect(scroll).not.toHaveBeenCalled();expect(sessionStorage.getItem('scrollToAyah')).not.toBeNull();
});

it('centers the requested word instead of the beginning of the verse',async()=>{
 await render({ready:false,position:3});
 const word=host.querySelector('[data-word-key]')!;
 vi.spyOn(word,'getBoundingClientRect').mockReturnValue({top:100,bottom:140} as DOMRect);
 await render({position:3});await frame();expect(scroll).toHaveBeenCalledWith({top:120,behavior:'smooth'});
});
