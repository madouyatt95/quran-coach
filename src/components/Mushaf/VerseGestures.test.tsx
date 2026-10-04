// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../../test/memoryStorage';
import { useVersePress } from './hooks/useVersePress';
import { VerseActionBar } from './VerseActionBar';
import { MushafGestureNavigator } from './MushafGestureNavigator';
import { useReadingBookmarkStore } from '../../stores/readingBookmarkStore';
import { useQuranStore } from '../../stores/quranStore';
import type { Ayah } from '../../types';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const ayah = {number:262,surah:2,numberInSurah:255,page:42,text:'اللَّهُ'} as Ayah;
let div:HTMLDivElement;let root:Root;
beforeEach(()=>{
 vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
 vi.useFakeTimers();vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 useReadingBookmarkStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useReadingBookmarkStore.setState({bookmark:null});useQuranStore.setState({currentPage:1,currentSurah:1,currentAyah:1});
 div=document.createElement('div');document.body.append(div);root=createRoot(div);
});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.useRealTimers();vi.restoreAllMocks();});
function pointer(el:Element,type:string,x=10,y=10) {
 const event=new MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0});
 Object.defineProperties(event,{isPrimary:{value:true},pointerId:{value:1}});el.dispatchEvent(event);
}
function Harness({hold,play}:{hold:()=>void;play:()=>void}) {
 const press=useVersePress(hold,1);
 return <span {...press(ayah)} data-testid="verse"><span data-testid="word" onClick={play}>اللَّهُ</span></span>;
}
it('keeps a short tap on a word as audio playback',async()=>{
 const hold=vi.fn(),play=vi.fn();await act(async()=>root.render(<Harness hold={hold} play={play}/>));
 const word=div.querySelector('[data-testid="word"]')!;
 await act(async()=>{pointer(word,'pointerdown');vi.advanceTimersByTime(100);pointer(word,'pointerup');word.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 expect(play).toHaveBeenCalledOnce();expect(hold).not.toHaveBeenCalled();
});
it('opens actions after a hold and suppresses the nested word click on release',async()=>{
 const hold=vi.fn(),play=vi.fn();await act(async()=>root.render(<Harness hold={hold} play={play}/>));
 const word=div.querySelector('[data-testid="word"]')!;
 await act(async()=>{pointer(word,'pointerdown');vi.advanceTimersByTime(500);pointer(word,'pointerup');word.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 expect(hold).toHaveBeenCalledOnce();expect(play).not.toHaveBeenCalled();
});
it.each(['pointermove','pointercancel'])('cancels a hold and audio on %s',async type=>{
 const hold=vi.fn(),play=vi.fn();await act(async()=>root.render(<Harness hold={hold} play={play}/>));
 const word=div.querySelector('[data-testid="word"]')!;
 await act(async()=>{pointer(word,'pointerdown');pointer(word,type,40,60);vi.advanceTimersByTime(600);pointer(word,'pointerup');word.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 expect(hold).not.toHaveBeenCalled();expect(play).not.toHaveBeenCalled();
});
it('clears a pending hold when the reader unmounts',async()=>{
 const hold=vi.fn();await act(async()=>root.render(<Harness hold={hold} play={vi.fn()}/>));
 await act(async()=>pointer(div.querySelector('[data-testid="word"]')!,'pointerdown'));
 await act(async()=>root.render(null));vi.advanceTimersByTime(600);expect(hold).not.toHaveBeenCalled();
});
it('saves the exact long-pressed verse without opening the page picker or playing audio',async()=>{
 const play=vi.fn();await act(async()=>root.render(<MemoryRouter><VerseActionBar selection={{ayah,x:100,y:200}} view="madinah" onClose={vi.fn()} onPlay={play}/></MemoryRouter>));
 const signet=Array.from(document.querySelectorAll('.verse-action-bar button')).find(b=>b.textContent==='Signet') as HTMLButtonElement;
 await act(async()=>signet.click());
 expect(useReadingBookmarkStore.getState().bookmark).toMatchObject({surah:2,ayah:255,page:42,view:'madinah',precision:'verse'});
 expect(play).not.toHaveBeenCalled();expect(document.querySelector('[role="status"]')?.textContent).toContain('Signet enregistré');
});
async function inputRange(el:HTMLInputElement,value:number) {
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));});
}
it('navigates vertically to juz 27, then horizontally within its pages without moving the bookmark',async()=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:255,page:42,view:'mushaf',precision:'verse'});
 await act(async()=>root.render(<MushafGestureNavigator/>));
 const vertical=div.querySelector('input')!;
 await inputRange(vertical,27);
 expect(useQuranStore.getState().currentPage).toBe(1);
 await act(async()=>pointer(vertical,'pointerup'));
 expect(useQuranStore.getState().currentPage).toBe(522);
 const horizontal=div.querySelectorAll('input')[1];expect(horizontal.min).toBe('522');expect(horizontal.max).toBe('541');
 await inputRange(horizontal,532);await act(async()=>pointer(horizontal,'pointerup'));
 expect(useQuranStore.getState().currentPage).toBe(532);expect(sessionStorage.getItem('scrollToPage')).toBe('532');
 expect(useReadingBookmarkStore.getState().bookmark?.page).toBe(42);
});
it('cancels a rail drag without navigating and reaches final page 604 using the keyboard',async()=>{
 await act(async()=>root.render(<MushafGestureNavigator/>));const vertical=div.querySelector('input')!;
 await inputRange(vertical,30);await act(async()=>pointer(vertical,'pointercancel'));
 expect(useQuranStore.getState().currentPage).toBe(1);
 await inputRange(vertical,30);await act(async()=>vertical.dispatchEvent(new KeyboardEvent('keyup',{key:'End',bubbles:true})));
 const horizontal=div.querySelectorAll('input')[1];expect(horizontal.max).toBe('604');
 await inputRange(horizontal,604);await act(async()=>horizontal.dispatchEvent(new KeyboardEvent('keyup',{key:'End',bubbles:true})));
 expect(useQuranStore.getState().currentPage).toBe(604);
});

it('keeps slider arrow keys from also changing the reader page through global shortcuts',async()=>{
 const globalKey=vi.fn();window.addEventListener('keydown',globalKey);
 try {
  await act(async()=>root.render(<MushafGestureNavigator/>));
  await act(async()=>div.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));
  expect(globalKey).not.toHaveBeenCalled();
 } finally {window.removeEventListener('keydown',globalKey);}
});

it('reveals secondary text actions without playing audio or closing the main actions',async()=>{
 const play=vi.fn(),favorite=vi.fn(),understand=vi.fn(),share=vi.fn(),close=vi.fn();
 await act(async()=>root.render(<MemoryRouter><VerseActionBar selection={{ayah,x:180,y:500}} view="mushaf" onClose={close} onPlay={play} onMore={share} onFavorite={favorite} onUnderstand={understand}/></MemoryRouter>));
 await act(async()=>document.querySelector<HTMLButtonElement>('[aria-label="Autres actions"]')!.click());
 expect(document.querySelector('[aria-label="Autres actions"]')?.getAttribute('aria-expanded')).toBe('true');
 const secondary=Array.from(document.querySelectorAll<HTMLButtonElement>('.verse-action-bar__secondary button'));
 expect(secondary.map(b=>b.textContent)).toEqual(['Ajouter aux favoris','Comprendre','Partager']);
 await act(async()=>secondary[0].click());expect(favorite).toHaveBeenCalledOnce();expect(close).not.toHaveBeenCalled();expect(play).not.toHaveBeenCalled();
 await act(async()=>secondary[1].click());expect(understand).toHaveBeenCalledOnce();expect(close).toHaveBeenCalledOnce();expect(share).not.toHaveBeenCalled();
});
it('preserves the sharing shortcut for the facsimile readers',async()=>{
 const share=vi.fn(),close=vi.fn();
 await act(async()=>root.render(<MemoryRouter><VerseActionBar selection={{ayah,x:180,y:500}} view="madinah" onClose={close} onPlay={vi.fn()} onMore={share}/></MemoryRouter>));
 await act(async()=>document.querySelector<HTMLButtonElement>('[aria-label="Autres actions"]')!.click());
 expect(share).toHaveBeenCalledOnce();expect(close).toHaveBeenCalledOnce();expect(document.querySelector('.verse-action-bar__secondary')).toBeNull();
});
