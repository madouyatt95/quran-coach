// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter,useLocation,useNavigate} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createMemoryStorage} from '../../test/memoryStorage';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}});});
const player=vi.hoisted(()=>({play:vi.fn(),pause:vi.fn()}));
vi.mock('../../stores/libraryPlayerStore',()=>({useLibraryPlayer:()=>player}));
vi.mock('../Pupitre/usePupitreLayout',()=>({usePupitreLayout:()=>({layout:'desk',choice:'desk',choose:vi.fn(),device:{width:800}})}));
import {BookDiscovery} from './BookDiscovery';
import {books} from '../../lib/bookLibrary';
import type {LibraryAudio} from '../../lib/audioProduction';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
const available=books.filter(b=>['adam','nuh'].includes(b.id));
const tracks:LibraryAudio[]=available.map(b=>({id:b.id,title:`${b.title} · ${b.chapters[0].title}`,text:'Un récit.',reference:`Manuscrit ${b.version}, chapitre ${b.chapters[0].id}, segment 1/1`,sourceUrl:`/books/${b.id}`,category:'prophet',narrator:'George',url:'/test.mp3',duration:400,bytes:100,sentences:[]}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
function App(){const location=useLocation(),navigate=useNavigate();return location.pathname==='/stories'?<BookDiscovery books={available} kind="all" items={tracks}><p>Filtres</p></BookDiscovery>:<><output>{location.pathname} · {location.state?.bookView}</output><button onClick={()=>navigate(-1)}>Retour</button></>;}
async function click(label:string){const button=host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)||[...host.querySelectorAll('button')].find(b=>b.textContent===label);expect(button).toBeTruthy();await act(async()=>button!.click());}
beforeEach(()=>{vi.stubGlobal('sessionStorage',createMemoryStorage());useAudioLibraryStore.setState({positions:{},bookReading:{}});player.play.mockClear();player.pause.mockClear();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
it('selects a cover without playing or leaving, opens explicitly, then restores the selected book and rail',async()=>{
 await act(async()=>root.render(<MemoryRouter initialEntries={['/stories']}><App/></MemoryRouter>));
 const book=available.find(b=>b.id==='nuh')!;await click(`Présenter ${book.title}`);
 expect(host.querySelector('.book-featured h2')?.textContent).toBe(book.title);expect(player.play).not.toHaveBeenCalled();
 const rail=host.querySelector<HTMLElement>('.book-rail-track')!;await act(async()=>{rail.scrollLeft=150;rail.dispatchEvent(new Event('scroll',{bubbles:true}));});
 await click('Lire');expect(host.querySelector('output')?.textContent).toBe('/books/nuh · read');expect(player.play).not.toHaveBeenCalled();
 await click('Retour');expect(host.querySelector('.book-featured h2')?.textContent).toBe(book.title);expect(host.querySelector('.book-rail-track')?.scrollLeft).toBe(150);
 await click('Écouter');expect(player.play).toHaveBeenCalledWith(tracks.find(t=>t.id==='nuh'),{queue:[tracks.find(t=>t.id==='nuh')]});expect(host.querySelector('output')?.textContent).toBe('/books/nuh · listen');
});
it('keeps reading available with no published audio and disables listening',async()=>{
 await act(async()=>root.render(<MemoryRouter><BookDiscovery books={available} items={[]} kind="all">Filtres</BookDiscovery></MemoryRouter>));
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Écouter')?.disabled).toBe(true);
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Lire')?.disabled).toBe(false);
 expect(host.querySelector('[data-pupitre-activity="catalogue"]')).not.toBeNull();
});
