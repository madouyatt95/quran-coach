// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {expect,it,vi} from 'vitest';
vi.mock('../../../lib/tafsirApi',()=>({fetchTafsir:vi.fn(async()=>({text:'<p>Explication sourcée</p>',resource_name:'Mokhtasar'}))}));
import {MushafDeskStudy,type DeskStudySnapshot} from './MushafDeskStudy';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('keeps a pinned explanation across page changes and can follow the current selection again',async()=>{
 const host=document.createElement('div'),root=createRoot(host);document.body.append(host);
 const snapshot=(ayah:number)=>({verse:{surah:2,numberInSurah:ayah,text:`Verset ${ayah}`},page:ayah,translation:`Sens ${ayah}`,word:null} as DeskStudySnapshot);
 const render=async(ayah:number)=>act(async()=>root.render(<MemoryRouter><MushafDeskStudy snapshot={snapshot(ayah)} onListen={vi.fn()} renderWord={()=>null}/></MemoryRouter>));
 await render(1);await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Épingler cette explication"]')!.click());await render(2);
 expect(host.querySelector('h3')!.textContent).toContain('2:1');expect(host.textContent).toContain('Sens 1');expect(host.textContent).not.toContain('Sens 2');
 await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Suivre la sélection"]')!.click());expect(host.querySelector('h3')!.textContent).toContain('2:2');
 await act(async()=>{[...host.querySelectorAll('button')].find(b=>b.textContent==='Expliquer ce verset')!.click();await Promise.resolve();});expect(host.textContent).toContain('Explication sourcée');expect(host.textContent).toContain('QuranEnc');
 await act(async()=>root.unmount());host.remove();
});
