// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const p=vi.hoisted(()=>({item:{id:'a'},queue:[],position:45,playing:true,rate:1,deadline:null,stopAtChapter:false,loading:false,error:'',nextBook:null as null|{book:{title:string}},nextBookAt:0,toggle:vi.fn(),seekChapter:vi.fn(),setRate:vi.fn(),sleep:vi.fn(),setStopAtChapter:vi.fn(),setAutoNextBook:vi.fn(),cancelNextBook:vi.fn(),playNextBook:vi.fn()}));
vi.mock('../../stores/libraryPlayerStore',()=>({useLibraryPlayer:()=>p}));
vi.mock('../../stores/audioLibraryStore',()=>({useAudioLibraryStore:(selector:(s:{autoNextBook:boolean})=>unknown)=>selector({autoNextBook:true})}));
vi.mock('../../lib/bookLibrary',()=>({chapterPlayback:()=>({seconds:145,duration:300,title:'Chapitre'})}));
import {BookConsole} from './BookConsole';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
beforeEach(()=>{host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.clearAllMocks();});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it('seeks on the complete chapter timeline, pauses the shared player and changes its settings',async()=>{
 await act(async()=>root.render(<BookConsole own available title="Chapitre" onStart={vi.fn()}/>));
 const click=async(label:string)=>act(async()=>host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click());
 await click('Reculer de 15 secondes');expect(p.seekChapter).toHaveBeenCalledWith(130);
 await click('Avancer de 15 secondes');expect(p.seekChapter).toHaveBeenCalledWith(160);
 await click('Mettre le livre en pause');expect(p.toggle).toHaveBeenCalledOnce();
 for(const [label,value,handler] of [['Vitesse de narration','1.5',p.setRate],['Minuterie du livre','20',p.sleep]] as const){await act(async()=>{const select=host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!;select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));});expect(handler).toHaveBeenCalledWith(Number(value));}
 await act(async()=>host.querySelector<HTMLInputElement>('input[type=checkbox]')!.click());expect(p.setStopAtChapter).toHaveBeenCalledWith(true);
});
it('does not control another book timeline and cannot start an unavailable recording',async()=>{
 const start=vi.fn();await act(async()=>root.render(<BookConsole own={false} available={false} title="Chapitre" onStart={start}/>));
 expect([...host.querySelectorAll('.pupitre-transport button')].every(b=>(b as HTMLButtonElement).disabled)).toBe(true);
 await act(async()=>host.querySelector<HTMLButtonElement>('.pupitre-play')!.click());expect(start).not.toHaveBeenCalled();expect(p.toggle).not.toHaveBeenCalled();
});
it('offers the next book and cancellation in the desk console',async()=>{
 p.nextBook={book:{title:'Aimer sans paraître'}};p.nextBookAt=1;
 await act(async()=>root.render(<BookConsole own available compact title="Chapitre" onStart={vi.fn()}/>));
 expect(host.querySelector('[role=status]')?.textContent).toContain('Aimer sans paraître');
 await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Annuler le prochain livre"]')!.click());expect(p.cancelNextBook).toHaveBeenCalledOnce();
 p.nextBook=null;p.nextBookAt=0;
});
