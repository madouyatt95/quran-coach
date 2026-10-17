// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {it,expect,vi} from 'vitest';
import {BookRibbon,ribbonLength} from './BookRibbon';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('converts finger travel into page coordinates and bounds both ends',()=>{expect(ribbonLength(100,100,.5)).toBe(300);expect(ribbonLength(100,-200,1)).toBe(64);expect(ribbonLength(500,300,1)).toBe(620);});
it('supports pulling down, retracting and suppresses the release click',async()=>{
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host),save=vi.fn(),remove=vi.fn();
 await act(async()=>root.render(<BookRibbon marked={false} scale={1} onSave={save} onRemove={remove}/>));
 const button=host.querySelector('button')!;button.setPointerCapture=vi.fn();button.releasePointerCapture=vi.fn();
 const pointer=(type:string,y:number)=>{const e=new MouseEvent(type,{bubbles:true,clientY:y,button:0});Object.defineProperty(e,'pointerId',{value:1});button.dispatchEvent(e);};
 await act(async()=>{pointer('pointerdown',0);pointer('pointermove',240);pointer('pointerup',240);button.click();});
 expect(save).toHaveBeenCalledOnce();expect(save).toHaveBeenCalledWith(304);expect(remove).not.toHaveBeenCalled();
 await act(async()=>root.render(<BookRibbon marked length={304} scale={1} onSave={save} onRemove={remove}/>));
 await act(async()=>{pointer('pointerdown',300);pointer('pointermove',0);pointer('pointerup',0);button.click();});
 expect(remove).toHaveBeenCalledOnce();
 await act(async()=>root.unmount());host.remove();
});
