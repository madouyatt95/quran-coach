// @vitest-environment jsdom
import {act,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect,it,vi} from 'vitest';
import {resolveLayout,type Posture} from './posture';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)}});});
import {Pupitre,PupitreTop,PupitreBottom} from './Pupitre';
const flat:Posture={folded:false,vertical:false,horizontal:false,width:900,height:900};
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('never infers a hinge from width or folded posture alone',()=>{
 expect(resolveLayout('auto',flat)).toBe('plain');
 expect(resolveLayout('auto',{...flat,folded:true})).toBe('plain');
 expect(resolveLayout('auto',{...flat,vertical:true})).toBe('desk');
 expect(resolveLayout('auto',{...flat,horizontal:true})).toBe('book');
 expect(resolveLayout('plain',{...flat,vertical:true})).toBe('plain');
 expect(resolveLayout('desk',{...flat,width:390})).toBe('desk');
 expect(resolveLayout('book',{...flat,width:390})).toBe('plain');
});
it('keeps audio nodes, selections and mount lifecycle intact across layout and orientation changes',async()=>{
 const mount=vi.fn(),dispose=vi.fn();
 function Activity(){const [answer,setAnswer]=useState(0);useEffect(()=>{mount();return dispose;},[]);return <Pupitre title="Test"><PupitreTop><audio src="/test.mp3"/><output>{answer}</output></PupitreTop><PupitreBottom><button onClick={()=>setAnswer(n=>n+1)}>Répondre</button></PupitreBottom></Pupitre>;}
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 await act(async()=>root.render(<Activity/>));const audio=host.querySelector('audio');
 const click=async(label:string)=>{await act(async()=>host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click());};
 await act(async()=>Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='Répondre')!.click());
 for(const choice of ['desk','book','auto','plain']){
  await click('Disposition de l’écran');
  await act(async()=>{const select=host.querySelector('select')!;select.value=choice;select.dispatchEvent(new Event('change',{bubbles:true}));window.dispatchEvent(new Event('resize'));});
  expect(host.querySelector('audio')).toBe(audio);expect(host.querySelector('output')!.textContent).toBe('1');expect(mount).toHaveBeenCalledTimes(1);expect(dispose).not.toHaveBeenCalled();
  await act(async()=>Array.from(host.querySelectorAll('button')).find(b=>b.textContent==='Terminé')!.click());
 }
 await act(async()=>root.unmount());host.remove();expect(dispose).toHaveBeenCalledTimes(1);
});
