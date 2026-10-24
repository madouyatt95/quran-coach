// @vitest-environment jsdom
import {act} from 'react';
import {MemoryRouter} from 'react-router-dom';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {WordStudyCard} from './WordStudyCard';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
import {UNICODE_PAGE_FONT} from '../../../lib/interactiveMushaf/service';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
class Sound {onplaying:(()=>void)|null=null;onended:(()=>void)|null=null;onerror:(()=>void)|null=null;loop=false;pause=vi.fn();play=vi.fn(async()=>{this.onplaying?.();});}
let sounds:Sound[],root:Root,div:HTMLDivElement,word:MushafWord;
const beforePlay=vi.fn();
const render=()=>act(async()=>root.render(<MemoryRouter><WordStudyCard word={word} font={UNICODE_PAGE_FONT} paper="sepia" page={3} previous next onAdjacent={()=>{}} onClose={()=>{}} onTranslation={()=>{}} onBeforePlay={beforePlay} rules={{qalqalah:'Qalqalah'}}/></MemoryRouter>));
const click=async(label:string)=>{const button=div.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`);expect(button).not.toBeNull();await act(async()=>button!.click());};
beforeEach(async()=>{
 await import('../../Journeys/StoryContextButton');
 sounds=[];vi.stubGlobal('Audio',class extends Sound {constructor(){super();sounds.push(this);}});
 vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
 word={key:'2:13:13',verseKey:'2:13',text:'أَلَآ',glyph:'x',position:13,line:1,transliteration:null,kind:'word',audio:'https://audio.test/013.mp3',french:'Certes',rules:[],tajweedSegments:[{text:'أَلَآ',rule:null}]} as MushafWord;
 div=document.createElement('div');document.body.append(div);root=createRoot(div);await render();
});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.unstubAllGlobals();});
it('shows playing/error/retry and stops playback when changing the selected word',async()=>{
 await click('Prononcer le mot');expect(beforePlay).toHaveBeenCalled();expect(div.textContent).toContain('Arrêter');
 await act(async()=>sounds[0].onerror?.());expect(div.textContent).toContain('Réessayer');
 await click('Prononcer le mot');expect(sounds[0].pause).toHaveBeenCalled();expect(sounds).toHaveLength(2);
 word={...word,key:'2:13:14',position:14};await render();expect(sounds[1].pause).toHaveBeenCalled();expect(sounds[1].onerror).toBeNull();expect(div.textContent).not.toContain('Réessayer');
});
it('exposes lesson details on expansion and applies looping to the word audio',async()=>{
 await click('Développer la fiche');expect(div.textContent).toContain('Boucle désactivée');
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Boucle désactivée'))!.click());
 await click('Prononcer le mot');expect(sounds[0].loop).toBe(true);
 await act(async()=>window.dispatchEvent(new Event('quran-stop-playback')));expect(sounds[0].pause).toHaveBeenCalled();expect(div.textContent).toContain('Prononcer');
});
it('keeps pronunciation, expansion and closing available in the embedded study pane',async()=>{
 const close=vi.fn();await act(async()=>root.render(<MemoryRouter><WordStudyCard embedded word={word} font={UNICODE_PAGE_FONT} paper="sepia" page={3} previous next onAdjacent={()=>{}} onClose={close} onTranslation={()=>{}} onBeforePlay={beforePlay} rules={{}}/></MemoryRouter>));
 await click('Prononcer le mot');expect(sounds).toHaveLength(1);
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent?.includes('Translittération et Tajwid'))!.click());expect(div.textContent).toContain('Boucle désactivée');
 await click('Fermer l’étude de ce mot');expect(close).toHaveBeenCalledOnce();expect(sounds[0].pause).toHaveBeenCalled();
});
