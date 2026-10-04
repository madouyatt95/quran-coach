// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {MushafSearchOverlay,normalizeMushafSearch} from './MushafSearchOverlay';
import {searchQuran,fetchSurah} from '../../lib/quranApi';
import type {Ayah,Surah} from '../../types';
import {createMemoryStorage} from '../../test/memoryStorage';
vi.mock('../../lib/quranApi',()=>({searchQuran:vi.fn(),fetchSurah:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
const goToPage=vi.fn(),goToSurah=vi.fn(),goToAyah=vi.fn(),close=vi.fn();
const surahs=[{number:18,name:'الكهف',englishName:'Al-Kahf',englishNameTranslation:'The Cave',numberOfAyahs:110,revelationType:'Meccan'}] as Surah[];
beforeEach(async()=>{
 vi.useFakeTimers();vi.stubGlobal('sessionStorage',createMemoryStorage());
 HTMLDialogElement.prototype.showModal=function(){this.open=true;};HTMLDialogElement.prototype.close=function(){this.open=false;};
 vi.mocked(searchQuran).mockReset().mockResolvedValue([]);goToPage.mockClear();goToSurah.mockClear();goToAyah.mockClear();close.mockClear();
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
 await act(async()=>root.render(<MushafSearchOverlay surahs={surahs} currentPage={293} goToPage={goToPage} goToSurah={goToSurah} goToAyah={goToAyah} onClose={close}/>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals();});
async function query(value:string){await act(async()=>{const input=document.querySelector('input')!;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));});}
async function tick(){await act(async()=>vi.advanceTimersByTimeAsync(400));}
it('removes Juz navigation and normalizes common spellings',()=>{
 expect(document.body.textContent).not.toContain('Juz');expect(document.body.textContent).not.toContain('The Cave');
 expect(normalizeMushafSearch('Al-Faatiha')).toBe(normalizeMushafSearch('al fatiha'));
 expect(normalizeMushafSearch('الإِخلاص')).toBe(normalizeMushafSearch('الاخلاص'));
});
it('opens an explicit page without keeping a stale verse jump',async()=>{
 sessionStorage.setItem('scrollToAyah','old');await query('293');
 await act(async()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('Ouvrir la page'))!.click());
 expect(goToPage).toHaveBeenCalledWith(293,{silent:true});expect(sessionStorage.getItem('scrollToAyah')).toBeNull();
});
it('uses French matches directly and discards a stale request',async()=>{
 let resolve!:(v:Ayah[])=>void;
 vi.mocked(searchQuran).mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));
 await query('lumière');await tick();expect(searchQuran).toHaveBeenCalledWith('lumière','fr.hamidullah');
 await query('miséricorde');await tick();
 await act(async()=>resolve([{number:1,surah:1,numberInSurah:1,text:'Ancien résultat'} as Ayah]));
 expect(document.body.textContent).not.toContain('Ancien résultat');
 vi.mocked(searchQuran).mockResolvedValueOnce([{number:1,surah:1,numberInSurah:1,text:'Un résultat français'} as Ayah]);
 await query('ouverture');await tick();expect(document.body.textContent).toContain('Un résultat français');
});
it('resolves a verse reference to its actual page before opening',async()=>{
 vi.mocked(fetchSurah).mockResolvedValue({ayahs:[{numberInSurah:10,page:294}]} as Awaited<ReturnType<typeof fetchSurah>>);
 await query('18:10');await act(async()=>Array.from(document.querySelectorAll('button')).find(b=>b.textContent?.includes('verset 10'))!.click());
 expect(goToAyah).toHaveBeenCalledWith(18,10,294,{silent:true});expect(searchQuran).not.toHaveBeenCalled();
});
