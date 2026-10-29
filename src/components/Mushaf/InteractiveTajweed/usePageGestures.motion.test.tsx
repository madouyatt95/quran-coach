// @vitest-environment jsdom
import {act,useRef} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,expect,it,vi} from 'vitest';
import {usePageGestures} from './usePageGestures';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let mount:Root;
afterEach(()=>{act(()=>mount.unmount());document.body.innerHTML='';});
function harness(direction:number,zoom=1,baseZoom=1){
 const preview=vi.fn(),end=vi.fn(),turn=vi.fn();const host=document.createElement('div');document.body.append(host);mount=createRoot(host);
 function App(){const ref=useRef<HTMLDivElement>(null);const {handlers}=usePageGestures(ref,zoom,vi.fn(),turn,{preview,end},baseZoom);return <div ref={ref} {...handlers}><button data-book-corner={direction}/></div>;}
 act(()=>mount.render(<App/>));const button=host.querySelector('button')!,viewport=button.parentElement!;
 Object.defineProperty(viewport,'clientWidth',{value:400});viewport.setPointerCapture=vi.fn();viewport.releasePointerCapture=vi.fn();
 const pointer=(type:string,x:number,y:number,time:number,id=1)=>{const e=new Event(type,{bubbles:true});Object.assign(e,{button:0,pointerId:id,clientX:x,clientY:y});Object.defineProperty(e,'timeStamp',{value:1000+time});act(()=>button.dispatchEvent(e));};
 return {pointer,preview,end,turn,viewport};
}
it.each([1,-1])('passes the diagonal angle and signed flick momentum in direction %s',direction=>{
 const {pointer,preview,end}=harness(direction);
 pointer('pointerdown',200,500,0);pointer('pointermove',200+direction*45,460,35);pointer('pointerup',200+direction*45,460,40);
 const call=preview.mock.calls.at(-1)!;expect(call[0]).toBe(direction);expect(call[1]).toBeCloseTo(.15);expect(Math.sign(call[2])).toBe(-direction);
 expect(end.mock.calls[0],JSON.stringify(end.mock.calls)).toEqual([direction,true,expect.any(Number)]);expect(end.mock.calls[0][2]).toBeGreaterThan(.65);
});
it('drops stale momentum and cancels a small gesture after holding it still',()=>{
 const {pointer,end}=harness(1);pointer('pointerdown',200,500,0);pointer('pointermove',245,460,35);pointer('pointerup',245,460,300);
 expect(end).toHaveBeenCalledWith(1,false,0);
});
it('cancels the curl when a second finger starts a zoom',()=>{
 const {pointer,end}=harness(-1);pointer('pointerdown',200,500,0);pointer('pointermove',140,480,35);pointer('pointerdown',250,500,40,2);
 expect(end).toHaveBeenCalledWith(-1,false,0);
});

it('turns directly at the fitted reading zoom rather than panning decorative margins',()=>{
 const {pointer,turn,viewport}=harness(0,1.15,1.15);
 Object.defineProperty(viewport,'scrollWidth',{value:500});viewport.scrollLeft=50;
 pointer('pointerdown',180,200,0);pointer('pointermove',260,200,40);pointer('pointerup',260,200,50);
 expect(turn).toHaveBeenCalledWith(1,expect.any(Number));expect(viewport.scrollLeft).toBe(50);
});
it('pans a manually enlarged page before allowing a turn at its outer edge',()=>{
 const {pointer,turn,viewport}=harness(0,1.7,1.15);
 Object.defineProperty(viewport,'scrollWidth',{value:800});viewport.scrollLeft=200;
 pointer('pointerdown',180,200,0);pointer('pointermove',260,200,40);pointer('pointerup',260,200,50);
 expect(turn).not.toHaveBeenCalled();expect(viewport.scrollLeft).toBe(120);
});
