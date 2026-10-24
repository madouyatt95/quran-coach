// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)||null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)}});});
import {FaceToFaceGame} from './FaceToFaceGame';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('hides a validated answer and waits for both players before revealing and advancing',async()=>{
 const host=document.createElement('div'),root=createRoot(host);document.body.append(host);
 await act(async()=>root.render(<MemoryRouter><FaceToFaceGame/></MemoryRouter>));
 await act(async()=>[...host.querySelectorAll('button')].find(b=>b.textContent==='Commencer')!.click());
 const halves=host.querySelectorAll('.table-player');
 const answer=async(player:number)=>act(async()=>halves[player].querySelector<HTMLButtonElement>('.table-choices button')!.click());
 const validate=async(player:number)=>act(async()=>halves[player].querySelector<HTMLButtonElement>('.table-confirm')!.click());
 await answer(0);await validate(0);expect(halves[0].textContent).toContain('Réponse enregistrée');expect(halves[0].querySelector('.table-choices')).toBeNull();expect(halves[1].querySelector('.table-choices')).not.toBeNull();
 await answer(1);await validate(1);expect(host.querySelectorAll('.table-reveal')).toHaveLength(2);
 await validate(0);expect(halves[0].querySelector<HTMLButtonElement>('.table-confirm')!.disabled).toBe(true);expect(halves[1].querySelector('.table-reveal')).not.toBeNull();
 await validate(1);expect(host.querySelectorAll('.table-choices')).toHaveLength(2);expect(halves[1].querySelector('header')!.textContent).toContain('2/6');
 await act(async()=>root.unmount());host.remove();
});
