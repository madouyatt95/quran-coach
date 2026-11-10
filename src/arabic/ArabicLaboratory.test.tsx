// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)||null,setItem:(key:string,v:string)=>data.set(key,v),removeItem:(key:string)=>data.delete(key)}});});
vi.mock('../components/Pupitre/Pupitre',()=>({Pupitre:({children}:{children:React.ReactNode})=><div>{children}</div>,PupitreTop:({children}:{children:React.ReactNode})=><section>{children}</section>,PupitreBottom:({children}:{children:React.ReactNode})=><section>{children}</section>}));
import {NahwLaboratory} from './ArabicLaboratory';
import {RootWorkbench} from './RootWorkbench';
import {SARF_FAMILIES} from './sarfData';
import {useArabicPracticeStore} from '../stores/arabicPracticeStore';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let host:HTMLDivElement,root:Root;
const click=async(label:string)=>{const el=[...host.querySelectorAll('button')].find(b=>b.textContent===label);expect(el,label).toBeDefined();await act(async()=>el!.click());};
beforeEach(()=>{useArabicPracticeStore.setState({workshops:{}});host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
it('transforms a phrase, permits an incorrect ending, corrects it and undoes that action',async()=>{
 await act(async()=>root.render(<MemoryRouter><NahwLaboratory/></MemoryRouter>));
 await click('Ajouter إِنَّ');
 expect(host.querySelector('.arabic-lab-words')?.textContent).toBe('إِنَّالْبَيْتَكَبِيرٌ');
 await click('الْبَيْتُ');expect(host.textContent).toContain('Une terminaison reste à ajuster');
 // The selected noun remains in slot 1; choosing its accusative repairs the exercise.
 const choice=[...host.querySelectorAll('fieldset button')].find(b=>b.textContent==='الْبَيْتَ')!;
 await act(async()=>{(choice as HTMLButtonElement).click();});
 expect(host.querySelector('.arabic-lab-result')?.textContent).toContain('Certes, la maison est grande.');
 await click('Annuler ma dernière action');expect(host.textContent).toContain('Une terminaison reste à ajuster');
});
it('assembles a root by touch and lets the learner remove a mistaken suffix',async()=>{
 await act(async()=>root.render(<RootWorkbench family={SARF_FAMILIES[0]}/>));
 await click('Assembler les trois radicales');await click('ك');await click('ت');await click('ب');
 expect(host.textContent).toContain('Racine retrouvée');
 await act(async()=>host.querySelector<HTMLButtonElement>('[aria-label="Retirer la radicale 2"]')!.click());
 expect(host.querySelectorAll('.arabic-root-slots button')[1].textContent).toBe('＋');
 expect(host.textContent).not.toContain('Racine retrouvée');
});
