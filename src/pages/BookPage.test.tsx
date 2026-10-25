// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)||null,setItem:(key:string,v:string)=>data.set(key,v),removeItem:(key:string)=>data.delete(key)}});});
import {narrativeBooks} from '../data/narrativeBooks';
import {chapterDrafts} from '../lib/narrativeBooks';
import {narrationSentences} from '../lib/narrationText';
import type {LibraryAudio} from '../lib/audioProduction';
const mocks=vi.hoisted(()=>({items:[] as LibraryAudio[],player:{item:null as LibraryAudio|null,queue:[] as LibraryAudio[],position:0,playing:false,play:vi.fn(),pause:vi.fn(),toggle:vi.fn()},load:vi.fn(async()=>[{surah:2,ayah:30,arabic:'نص الاختبار',translation:'Texte de test',number:37}])}));
vi.mock('../hooks/useBookCatalog',()=>({useBookCatalog:()=>({items:mocks.items,loading:false,error:''})}));
vi.mock('../stores/libraryPlayerStore',()=>({useLibraryPlayer:Object.assign(()=>mocks.player,{getState:()=>mocks.player})}));
vi.mock('../lib/audioLibrary',()=>({downloadedAudioIds:async()=>[],downloadLibraryAudio:vi.fn(),removeLibraryDownload:vi.fn()}));
vi.mock('../lib/bookAmbience',()=>({stopBookAmbience:vi.fn(),setBookAmbience:vi.fn(async()=>{})}));
vi.mock('../academy/data/courseEvidence',()=>({loadEvidenceVerses:mocks.load}));
vi.mock('../lib/quranApi',()=>({getAudioUrl:vi.fn(()=>'/test.mp3')}));
vi.mock('../components/Pupitre/usePupitreLayout',async importOriginal=>({...await importOriginal<typeof import('../components/Pupitre/usePupitreLayout')>(),usePupitreLayout:()=>({layout:'plain',choice:'plain',ratio:50,device:{width:900},choose:vi.fn(),setRatio:vi.fn()})}));
import {BookPage} from './BookPage';
import {Routes,Route} from 'react-router-dom';
import {useBookNotebook} from '../stores/bookNotebookStore';
import {useAudioLibraryStore} from '../stores/audioLibraryStore';
import {bookPassages} from '../lib/bookPassages';
const book=narrativeBooks.find(b=>b.id==='adam')!;
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let host:HTMLDivElement,root:Root;
const render=async(path="/books/adam")=>{await act(async()=>{root.render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/books/:bookId" element={<BookPage/>}/></Routes></MemoryRouter>);await new Promise(r=>setTimeout(r,20));});};
const click=async(el:Element)=>{await act(async()=>{(el as HTMLElement).click();await Promise.resolve();});};
beforeEach(()=>{vi.stubGlobal('sessionStorage',window.sessionStorage);sessionStorage.clear();useAudioLibraryStore.setState({bookReading:{},bookReadingUpdatedAt:{},bookReadingPoints:{},positions:{}});useBookNotebook.setState({entries:[]});mocks.items=chapterDrafts(book,book.chapters[0],false,false).map((s,i)=>({id:String(i),title:s.title,text:s.text,reference:s.reference,sourceUrl:s.source_url,category:s.category,narrator:'George',url:'/test.mp3',bytes:100,duration:500,sentences:narrationSentences(s.text).map((_,sentence)=>({sentence,start:sentence*4,end:sentence*4+3}))}));Object.assign(mocks.player,{item:null,playing:false,position:0,queue:[]});mocks.player.play.mockClear();mocks.player.pause.mockClear();vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(0),0));vi.stubGlobal('cancelAnimationFrame',clearTimeout);Element.prototype.scrollIntoView=vi.fn();HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('keeps the chosen paragraph, saves its timestamp, and starts its matching recording',async()=>{await render();const paragraphs=host.querySelectorAll('[data-book-passage]');expect(paragraphs.length).toBeGreaterThan(3);await click(paragraphs[2].querySelector('p')!);await click([...paragraphs[2].querySelectorAll('button')].find(b=>b.textContent==='Je retiens')!);expect(useBookNotebook.getState().entries[0].text).toBe(paragraphs[2].querySelector('p')!.textContent);expect(useBookNotebook.getState().entries[0].seconds).toBeGreaterThan(0);await click([...paragraphs[2].querySelectorAll('button')].find(b=>b.textContent==='Écouter ici')!);expect(mocks.player.play).toHaveBeenCalledWith(expect.objectContaining({id:useBookNotebook.getState().entries[0].audioId}),expect.objectContaining({startAt:useBookNotebook.getState().entries[0].seconds}));});
it('opens verified references over the text and resumes narration only when it was playing',async()=>{mocks.player.item=mocks.items[0];mocks.player.playing=true;mocks.player.position=36.25;mocks.player.queue=mocks.items;await render();await click(host.querySelector('[data-book-passage] p')!);const buttons=[...host.querySelectorAll('.book-passage-actions button')];await click(buttons.find(b=>b.textContent?.startsWith('Coran'))!);expect(document.querySelector('dialog[open]')).not.toBeNull();expect(mocks.player.pause).toHaveBeenCalled();expect(document.querySelector('dialog')?.textContent).toContain('Texte de test');await click(document.querySelector('[aria-label="Fermer la référence"]')!);expect(mocks.player.play).toHaveBeenCalledWith(mocks.items[0],{queue:mocks.items,startAt:36.25});expect(host.querySelector('.book-passage.is-selected')).not.toBeNull();});
it('opens a person over the unchanged passage, pauses and resumes the exact recording',async()=>{
 mocks.player.item=mocks.items[0];mocks.player.playing=true;mocks.player.position=42.5;mocks.player.queue=mocks.items;
 await render();const paragraph=host.querySelector('[data-book-passage] p')!,text=paragraph.textContent;
 await click(paragraph.querySelector('.book-person-name')!);
 expect(document.querySelector('dialog[open]')?.textContent).toContain('Adam');expect(paragraph.textContent).toBe(text);expect(mocks.player.pause).toHaveBeenCalled();
 await click(document.querySelector('[aria-label="Fermer les repères"]')!);
 expect(mocks.player.play).toHaveBeenCalledWith(mocks.items[0],{queue:mocks.items,startAt:42.5});expect(document.querySelector('dialog[open]')).toBeNull();
});
it('jumps from a timeline step to its text without resuming the previous audio',async()=>{
 mocks.player.item=mocks.items[0];mocks.player.playing=true;mocks.player.queue=mocks.items;await render();
 await click([...host.querySelectorAll('button')].find(b=>b.textContent==='Fil du récit')!);
 const steps=document.querySelectorAll('.book-life-timeline>li');expect(steps.length).toBe(book.chapters.length);
 await click([...steps[1].querySelectorAll('button')].find(b=>b.textContent==='Lire')!);
 expect(host.querySelector('.book-reading-heading h2')?.textContent).toBe(book.chapters[1].title);expect(mocks.player.play).not.toHaveBeenCalled();expect(document.querySelector('dialog[open]')).toBeNull();
});

it('opens the glossary without changing the passage and resumes the exact audio position',async()=>{
 const b=narrativeBooks.find(b=>b.id==='nusayba-presence')!;
 mocks.items=chapterDrafts(b,b.chapters[2],false,false).map((s,i)=>({id:`glossary:${i}`,title:s.title,text:s.text,reference:s.reference,sourceUrl:s.source_url,category:s.category,narrator:'George',url:'/test.mp3',bytes:100,duration:500,sentences:narrationSentences(s.text).map((_,sentence)=>({sentence,start:sentence*4,end:sentence*4+3}))}));
 Object.assign(mocks.player,{item:mocks.items[0],queue:mocks.items,position:47.5,playing:true});
 await render('/books/nusayba-presence?chapter=uhud');const prose=host.querySelector('.book-prose')!,text=prose.textContent;
 const trigger=host.querySelector<HTMLButtonElement>('.book-term-name')!;expect(trigger).not.toBeNull();await click(trigger);
 expect(document.querySelector('dialog[open]')?.textContent).toContain('Les mots du récit');expect(host.querySelector('.book-prose')).toBe(prose);expect(prose.textContent).toBe(text);expect(mocks.player.pause).toHaveBeenCalled();
 await click(document.querySelector('[aria-label="Fermer le glossaire"]')!);
 expect(mocks.player.play).toHaveBeenCalledWith(mocks.items[0],{queue:mocks.items,startAt:47.5});
});

it('opens a connected paragraph and returns to the exact selected reading passage',async()=>{
 await render('/books/hamza-protection?chapter=memoire');
 await click(host.querySelector('[data-book-passage="memoire:memoire-1:2"] p')!);
 const card=host.querySelector('[data-connected-book="jafar-deux-rivages"]')!;expect(card).not.toBeNull();
 expect(card.querySelector<HTMLButtonElement>('button[aria-label^="Écouter"]')!.disabled).toBe(true);
 await click(card.querySelector('button[aria-label^="Lire"]')!);
 expect(host.querySelector('.book-passage.is-selected')?.getAttribute('data-book-passage')).toBe('proximite:proximite-1:2');
 expect(host.querySelector('.book-return-point')?.textContent).toContain('Hamza');
 await click(host.querySelector('.book-return-point')!);
 expect(host.querySelector('.book-passage.is-selected')?.getAttribute('data-book-passage')).toBe('memoire:memoire-1:2');
 expect(host.querySelector('.book-return-point')).toBeNull();
});
it.each([true,false])('restores the original audio at the exact second, preserving playing=%s',async playing=>{
 const source=narrativeBooks.find(b=>b.id==='nusayba-presence')!,destination=narrativeBooks.find(b=>b.id==='talha-engagement')!;
 mocks.items=[source,destination].flatMap(b=>chapterDrafts(b,b.chapters[2],false,false).map((s,i)=>({id:`${b.id}:${i}`,title:s.title,text:s.text,reference:s.reference,sourceUrl:s.source_url,category:s.category,narrator:'George',url:'/test.mp3',bytes:100,duration:500,sentences:narrationSentences(s.text).map((_,sentence)=>({sentence,start:sentence*4,end:sentence*4+3}))})));
 const original=mocks.items[0],queue=[original];Object.assign(mocks.player,{item:original,queue,position:47.25,playing});
 mocks.player.play.mockImplementation(async(item,options)=>{Object.assign(mocks.player,{item,queue:options.queue,position:options.startAt,playing:options.autoplay!==false});});
 sessionStorage.setItem('qc-page:/books/nusayba-presence:view',JSON.stringify('listen'));
 await render('/books/nusayba-presence?chapter=uhud');
 await click(host.querySelector('[data-connected-book="talha-engagement"] button[aria-label^="Écouter"]')!);
 expect(mocks.player.play).toHaveBeenLastCalledWith(expect.objectContaining({id:'talha-engagement:0'}),expect.objectContaining({startAt:expect.any(Number)}));
 await click(host.querySelector('.book-topbar button')!);
 expect(mocks.player.play).toHaveBeenLastCalledWith(original,{queue,startAt:47.25,autoplay:playing});
 expect(host.querySelector('.book-listening')).not.toBeNull();mocks.player.play.mockReset();
});

it('offers a collapsed optional recap after 48 hours and only reveals an already traversed paragraph',async()=>{
 const paragraphs=bookPassages(book,book.chapters[0]),saved=paragraphs[2];
 useAudioLibraryStore.setState({bookReading:{adam:book.chapters[0].id},bookReadingPoints:{adam:{chapterId:book.chapters[0].id,passageId:saved.id,previousPassageId:paragraphs[1].id,version:book.version,updatedAt:Date.now()-3*86400000}}});
 await render(`/books/adam?chapter=${book.chapters[0].id}&passage=${encodeURIComponent(saved.id)}`);
 const recap=host.querySelector('.book-return-recap')!;expect(recap).not.toBeNull();expect(recap.querySelector('.book-recap-text')).toBeNull();
 await click(recap.querySelector('button')!);
 expect(recap.querySelector('.book-recap-text p')?.textContent).toBe(narrationSentences(paragraphs[1].text).slice(0,2).join(' '));
 expect(host.querySelector('.book-passage.is-selected')?.getAttribute('data-book-passage')).toBe(saved.id);
 await click(recap.querySelector('[aria-label="Masquer le rappel"]')!);expect(host.querySelector('.book-return-recap')).toBeNull();
});
it('does not propose a recap during a recent return',async()=>{
 const paragraphs=bookPassages(book,book.chapters[0]);
 useAudioLibraryStore.setState({bookReading:{adam:book.chapters[0].id},bookReadingPoints:{adam:{chapterId:book.chapters[0].id,passageId:paragraphs[2].id,previousPassageId:paragraphs[1].id,version:book.version,updatedAt:Date.now()-3600000}}});
 await render();expect(host.querySelector('.book-return-recap')).toBeNull();
});
