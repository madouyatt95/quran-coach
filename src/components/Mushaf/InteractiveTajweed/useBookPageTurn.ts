import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {boundPageGeometry} from './bookPageGeometry';
import {bookTurnPages,settleDuration,settleProgress} from './bookTurnMotion';

type Turn={target:number;backPage:number;source:HTMLElement;layer:HTMLDivElement;strips:HTMLDivElement[];fronts:HTMLElement[];backs:HTMLElement[];shades:HTMLElement[];shadow:HTMLDivElement;width:number;height:number;direction:number;tilt:number;velocity:number;frame:number;timer:ReturnType<typeof setTimeout>;observer:MutationObserver|null;backReady:boolean;phase:'drag'|'wait'|'animate';progress:number;requested:number};
let cloneId=0;
function pageCopy(source:HTMLElement){
    const copy=source.cloneNode(true) as HTMLElement;copy.removeAttribute('data-active-sheet');
    const ids=new Map<string,string>(),prefix=`book-turn-${++cloneId}-`;
    copy.querySelectorAll('[id]').forEach(node=>{const id=node.id,next=prefix+id;ids.set(id,next);node.id=next;});
    copy.querySelectorAll('*').forEach(node=>{for(const attr of Array.from(node.attributes)){let value=attr.value;ids.forEach((next,id)=>{value=value.replaceAll(`url(#${id})`,`url(#${next})`);if(value===`#${id}`)value=`#${next}`;});if(value!==attr.value)node.setAttribute(attr.name,value);}});
    Object.assign(copy.style,{visibility:'visible',margin:'0',animation:'none',translate:'none',position:'absolute',left:'0',top:'0',transformOrigin:'0 0'});
    copy.querySelectorAll('.iq-paper').forEach(node=>(node as HTMLElement).style.boxShadow='none');
    copy.querySelectorAll('.iq-page-ribbon,.iq-book-ribbon,.iq-page-corners,.iq-margin-notes').forEach(node=>node.remove());
    const shade=document.createElement('div');shade.className='iq-book-face-shade';copy.append(shade);
    return {copy,shade};
}
function dispose(r:Turn){cancelAnimationFrame(r.frame);clearTimeout(r.timer);r.observer?.disconnect();r.layer.remove();r.source.style.visibility='';}
export function useBookPageTurn(viewport:RefObject<HTMLDivElement|null>,page:number,ready:boolean) {
    const [turning,setTurning]=useState(false),[dragging,setDragging]=useState(false);
    const [backPage,setBackPage]=useState<number|null>(null),[revision,setRevision]=useState(0);
    const [preview,setPreview]=useState<{page:number;left:number;top:number}|null>(null);
    const running=useRef<Turn|null>(null);
    const clear=useCallback(()=>{
        const r=running.current;if(r){dispose(r);running.current=null;}
        setTurning(false);setDragging(false);setPreview(null);setBackPage(null);
    },[]);
    useEffect(()=>()=>{if(running.current)dispose(running.current);},[]);
    useEffect(()=>{const cancel=()=>clear();window.addEventListener('resize',cancel);document.addEventListener('visibilitychange',cancel);return()=>{window.removeEventListener('resize',cancel);document.removeEventListener('visibilitychange',cancel);};},[clear]);
    const paint=useCallback((r:Turn,p:number)=>{
        r.progress=p;
        const step=r.width/r.strips.length;
        for(const part of boundPageGeometry(r.width,p,r.direction,r.tilt,r.strips.length)){
            const strip=r.strips[part.index],u=part.index*step;
            strip.style.width=`${step+.35}px`;strip.style.height=`${r.height}px`;
            strip.style.transform=`matrix3d(${part.matrix.join(',')})`;
            r.fronts[part.index].style.transform=`translateX(${-u}px)`;
            const back=r.backs[part.index];
            if(back)back.style.transform=`translateX(${u+step-r.width}px)`;
            r.shades[part.index].style.opacity=String(part.shade);
            if(back)(back.lastElementChild as HTMLElement).style.opacity=String(part.shade*.6);
        }
        r.shadow.style.opacity=String(Math.sin(Math.PI*p)*.22);
        r.shadow.style.transform=`scaleX(${.25+.75*Math.sin(Math.PI*p)})`;
    },[]);
    const animate=useCallback((end:number)=>{
        const r=running.current;if(!r)return;r.phase='animate';setDragging(false);
        const from=r.progress,distance=Math.abs(end-from);
        if(distance<.001){clear();return;}
        const velocity=Math.max(0,r.velocity*Math.sign(end-from)),duration=settleDuration(from,end,r.velocity);
        let start:number|null=null;
        const draw=(now:number)=>{if(running.current!==r)return;start??=now;const t=Math.min(1,(now-start)/duration);paint(r,from+(end-from)*settleProgress(t,velocity,duration,distance));if(t===1)clear();else r.frame=requestAnimationFrame(draw);};
        cancelAnimationFrame(r.frame);r.frame=requestAnimationFrame(draw);
    },[clear,paint]);
    const begin=useCallback((target:number,direction:number,manual=false)=>{
        if(running.current){if(!manual&&running.current.target===target&&running.current.phase==='drag'){running.current.phase='wait';clearTimeout(running.current.timer);running.current.timer=setTimeout(clear,5000);setDragging(false);return true;}return false;}
        const root=viewport.current;
        let source=root?.querySelector<HTMLElement>('[data-active-sheet]');
        const open=root?.querySelector('.iq-book-spread.is-open');
        if(open){const sheets=Array.from(open.querySelectorAll<HTMLElement>('.iq-scaled-page')).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);source=direction>0?sheets[0]:sheets.at(-1);}
        if(!root||!source||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return !manual;
        // The viewport and verso cache live in separate pupitre panes. Keep the fixed
        // animation outside their layout containment and observe the whole reader.
        const host=root.closest<HTMLElement>('.iq-reader')||root.parentElement;
        if(!host)return !manual;
        const rect=source.getBoundingClientRect(),view=root.getBoundingClientRect();
        const layer=document.createElement('div');layer.className='iq-book-turn';layer.inert=true;layer.setAttribute('aria-hidden','true');
        Object.assign(layer.style,{left:`${view.left}px`,top:`${view.top}px`,width:`${view.width}px`,height:`${view.height}px`,perspective:`${Math.max(2400,rect.width*5)}px`,perspectiveOrigin:`${rect.left-view.left+rect.width/2}px ${rect.top-view.top+rect.height/2}px`});
        const sheet=document.createElement('div');sheet.className='iq-book-sheet';
        Object.assign(sheet.style,{left:`${rect.left-view.left}px`,top:`${rect.top-view.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
        const shadow=document.createElement('div');shadow.className='iq-book-shadow';
        shadow.style.transformOrigin=direction>0?'right center':'left center';
        shadow.style.background=`linear-gradient(${direction>0?90:270}deg,transparent,#151022)`;sheet.append(shadow);
        const strips:HTMLDivElement[]=[],fronts:HTMLElement[]=[],backs:HTMLElement[]=[],shades:HTMLElement[]=[];
        for(let index=0;index<16;index++){
            const strip=document.createElement('div');strip.className='iq-book-strip';
            const front=document.createElement('div');front.className='iq-book-face';
            const {copy,shade}=pageCopy(source);front.append(copy);
            const back=document.createElement('div');back.className='iq-book-face iq-book-back';strip.append(front,back);sheet.append(strip);strips.push(strip);fronts.push(copy);shades.push(shade);
        }
        if(open){
            const other=Array.from(open.querySelectorAll<HTMLElement>('.iq-scaled-page')).find(node=>node!==source);
            if(other){
                const otherRect=other.getBoundingClientRect(),still=pageCopy(other).copy;
                Object.assign(still.style,{left:`${otherRect.left-view.left}px`,top:`${otherRect.top-view.top}px`,transform:'none'});
                layer.append(still);
            }
        }
        layer.append(sheet);
        const binding=document.createElement('div');binding.className='iq-book-binding';
        Object.assign(binding.style,{left:`${rect.left-view.left+(direction>0?rect.width:0)-5}px`,top:`${rect.top-view.top}px`,height:`${rect.height}px`});
        layer.append(binding);host.append(layer);
        const backNumber=open&&direction<0?target+1:target;
        const r:Turn={target,backPage:backNumber,source,layer,strips,fronts,backs,shades,shadow,width:rect.width,height:rect.height,direction,tilt:-direction*.25,velocity:0,frame:0,observer:null,backReady:false,timer:setTimeout(clear,manual?120000:5000),phase:manual?'drag':'wait',progress:0,requested:0};running.current=r;
        const attachBack=()=>{
            if(r.backReady||running.current!==r)return;
            const backSource=host.querySelector<HTMLElement>(`[data-book-verso="${backNumber}"] .iq-scaled-page[data-page-ready="true"]`);
            if(!backSource)return;
            // Disconnect before cloning to avoid observing our own DOM writes.
            r.observer?.disconnect();
            strips.forEach(strip=>{const {copy}=pageCopy(backSource);strip.querySelector('.iq-book-back')!.append(copy);backs.push(copy);});
            r.backReady=true;paint(r,r.phase==='drag'?r.requested:r.progress);setRevision(v=>v+1);
        };
        r.observer=new MutationObserver(attachBack);r.observer.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['data-page-ready']});attachBack();
        paint(r,0);setTurning(true);setDragging(manual);setBackPage(backNumber);
        if(manual){source.style.visibility='hidden';setPreview({page:bookTurnPages(page,direction,!!open).under,left:rect.left-view.left+root.scrollLeft,top:rect.top-view.top+root.scrollTop});}
        return true;
    },[viewport,page,clear,paint]);
    const scrub=useCallback((target:number,direction:number,progress:number,tilt?:number)=>{
        if(!running.current&&!begin(target,direction,true))return;
        const r=running.current;if(r?.phase==='drag'&&r.target===target){r.requested=Math.max(0,Math.min(.96,progress));if(tilt!==undefined)r.tilt=tilt;paint(r,r.backReady?r.requested:Math.min(.28,r.requested));}
    },[begin,paint]);
    const release=useCallback((velocity:number)=>{if(running.current)running.current.velocity=velocity;},[]);
    const cancel=useCallback(()=>{if(running.current)animate(0);},[animate]);
    useEffect(()=>{const r=running.current;if(r?.phase==='wait'&&page===r.target&&ready&&r.backReady)animate(1);},[page,ready,revision,animate]);
    return {turning,dragging,preview,backPage,begin,scrub,release,cancel,clear};
}
