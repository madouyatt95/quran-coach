import {dragTilt,releaseVelocity,shouldCommitTurn} from './bookTurnMotion';
import { useRef, useState, type PointerEvent, type MouseEvent, type RefObject } from 'react';
export function swipePageDelta(dx:number,dy:number,zoom:number,overscroll=0) {
    const horizontal=zoom>1?overscroll:dx;
    return Math.abs(horizontal)>65 && Math.abs(dx)>Math.abs(dy)*1.5 ? horizontal>0?1:-1 : 0;
}
export function edgeDrag(delta:number,left:number,max:number) {
    const next=Math.max(0,Math.min(max,left-delta));
    return {next,excess:delta-(left-next)};
}
export function usePageGestures(viewport:RefObject<HTMLDivElement|null>,zoom:number,setZoom:(z:number)=>void,onTurn:(d:number,velocity?:number)=>void,curl?:{preview:(direction:number,progress:number,tilt?:number)=>void;end:(direction:number,commit:boolean,velocity:number)=>void},baseZoom=1) {
    const points=useRef(new Map<number,{x:number;y:number}>());
    const drag=useRef<{x:number;y:number;lastX:number;lastY:number;excess:number;moved:boolean;multi:boolean;corner:number;progress:number;time:number;velocity:number}|null>(null);
    const pinch=useRef<{distance:number;zoom:number}|null>(null);
    const suppress=useRef(false);
    const [offset,setOffset]=useState(0);
    const anchoredZoom=(z:number,x?:number,y?:number)=>{
        const el=viewport.current;if(!el)return;
        const next=Math.max(1,Math.min(3,z)),r=el.getBoundingClientRect();
        const ax=x===undefined?r.width/2:x-r.left,ay=y===undefined?r.height/2:y-r.top;
        const left=(el.scrollLeft+ax)/zoom*next-ax,top=(el.scrollTop+ay)/zoom*next-ay;
        setZoom(next);requestAnimationFrame(()=>{el.scrollTo({left,top,behavior:'instant'});});
    };
    const reset=()=>{points.current.clear();drag.current=null;pinch.current=null;setOffset(0);};
    return {anchoredZoom,offset,handlers:{
        onPointerDownCapture:(e:PointerEvent<HTMLDivElement>)=>{
            if(e.button!==0||(e.target as HTMLElement).closest('[data-selection-handle]'))return;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
            if(points.current.size===1){suppress.current=false;drag.current={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,excess:0,moved:false,multi:false,corner:Number((e.target as HTMLElement).closest('[data-book-corner]')?.getAttribute('data-book-corner')||0),progress:0,time:e.timeStamp,velocity:0};if(drag.current.corner){viewport.current?.setPointerCapture(e.pointerId);curl?.preview(drag.current.corner,0);};}
            if(points.current.size===2){if(drag.current?.corner){curl?.end(drag.current.corner,false,0);drag.current.corner=0;}const [a,b]=[...points.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};if(drag.current)drag.current.multi=true;suppress.current=true;setOffset(0);}
        },
        onPointerMoveCapture:(e:PointerEvent<HTMLDivElement>)=>{
            if(!points.current.has(e.pointerId))return;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
            if(points.current.size===2&&pinch.current){const[a,b]=[...points.current.values()];anchoredZoom(pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.current.distance),(a.x+b.x)/2,(a.y+b.y)/2);return;}
            const d=drag.current,el=viewport.current;if(!d||!el||d.multi)return;
            if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>10){d.moved=true;suppress.current=true;}
            const travel=Math.max(150,(el.querySelector('[data-active-sheet]')?.getBoundingClientRect().width||el.clientWidth)*.75);
            const dt=e.timeStamp-d.time;
            if(dt>0){const sample=(e.clientX-d.lastX)/travel*1000/Math.max(8,dt);d.velocity=dt>100?sample:d.velocity*.35+sample*.65;d.time=e.timeStamp;}
            if(d.corner){d.progress=Math.max(0,d.corner*(e.clientX-d.x)/travel);curl?.preview(d.corner,d.progress,dragTilt(e.clientX-d.x,e.clientY-d.y,d.corner));d.lastX=e.clientX;d.lastY=e.clientY;return;}
            if(d.moved){
                const dx=e.clientX-d.lastX;
                if(zoom>baseZoom){
                    const step=edgeDrag(dx,el.scrollLeft,Math.max(0,el.scrollWidth-el.clientWidth));
                    el.scrollLeft=step.next;el.scrollTop-=e.clientY-d.lastY;
                    d.excess=step.excess===0?0:Math.sign(d.excess)===Math.sign(step.excess)?d.excess+step.excess:step.excess;
                }else{d.excess=e.clientX-d.x;el.scrollTop-=e.clientY-d.lastY;}
                const horizontal=Math.abs(e.clientX-d.x)>Math.abs(e.clientY-d.y)*1.5;
                setOffset(horizontal?Math.sign(d.excess)*Math.min(90,Math.abs(d.excess)*.5):0);
            }
            d.lastX=e.clientX;d.lastY=e.clientY;
        },
        onPointerUpCapture:(e:PointerEvent<HTMLDivElement>)=>{
            const d=drag.current;points.current.delete(e.pointerId);
            if(d?.corner){const velocity=releaseVelocity(d.velocity*d.corner,e.timeStamp-d.time);curl?.end(d.corner,shouldCommitTurn(d.progress,velocity),velocity);if(d.moved)suppress.current=true;try{viewport.current?.releasePointerCapture(e.pointerId);}catch{/* already released */}}
            else if(d&&!d.multi){const delta=swipePageDelta(e.clientX-d.x,e.clientY-d.y,zoom/baseZoom,d.excess);if(delta)onTurn(delta,releaseVelocity(d.velocity*delta,e.timeStamp-d.time));}
            if(!points.current.size)reset();
        },
        onPointerCancelCapture:()=>{if(drag.current?.corner)curl?.end(drag.current.corner,false,0);reset();suppress.current=true;},
        onPointerLeave:(e:PointerEvent<HTMLDivElement>)=>{if(e.pointerType==='mouse'&&!drag.current?.corner)reset();},
        onClickCapture:(e:MouseEvent<HTMLDivElement>)=>{if(suppress.current){e.preventDefault();e.stopPropagation();}},
    }};
}
