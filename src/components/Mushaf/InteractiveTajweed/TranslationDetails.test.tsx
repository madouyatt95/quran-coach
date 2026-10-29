// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {expect,it,vi} from 'vitest';
import {TranslationDetails} from './TranslationDetails';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('closes through a deliberate downward drag on the header without intercepting the text',()=>{
 const previousShow=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=()=>{};
 const capture=HTMLElement.prototype.setPointerCapture;HTMLElement.prototype.setPointerCapture=()=>{};
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host),close=vi.fn();
 act(()=>root.render(<MemoryRouter><TranslationDetails surah={1} ayah={1} text="Traduction" onClose={close}/></MemoryRouter>));
 const header=document.querySelector('.iq-translation-grip')!;
 const pointer=(type:string,x:number,y:number)=>{const e=new MouseEvent(type,{bubbles:true,clientX:x,clientY:y});Object.defineProperty(e,'pointerId',{value:1});act(()=>header.dispatchEvent(e));};
 pointer('pointerdown',30,50);pointer('pointermove',100,55);expect(close).not.toHaveBeenCalled();pointer('pointercancel',100,55);
 pointer('pointerdown',30,50);pointer('pointermove',33,120);expect(close).toHaveBeenCalledTimes(1);
 expect(document.querySelector('.iq-translation-details p')?.textContent).toBe('Traduction');
 act(()=>root.unmount());host.remove();HTMLDialogElement.prototype.showModal=previousShow;HTMLElement.prototype.setPointerCapture=capture;
});
