import {useLayoutEffect,useRef,type RefObject} from 'react';

const ANCHORS=['data-word-key','data-book-passage','data-pupitre-anchor'] as const;
type Anchor={attribute:string;key:string;offset:number;offsetX:number};
type Snapshot={documentKey:string;anchor:Anchor|null;lower:number;upper:number};
function scrollHost(upper:HTMLElement):HTMLElement {
 const reader=upper.querySelector<HTMLElement>('.iq-viewport');
 if(reader)return reader;
 if(getComputedStyle(upper).display!=='contents')return upper;
 return document.scrollingElement as HTMLElement||document.documentElement;
}
function viewTop(host:HTMLElement){return host===document.scrollingElement?0:host.getBoundingClientRect().top;}
export function captureReadingAnchor(root:HTMLElement):Anchor|null {
 const upper=root.querySelector<HTMLElement>('.pupitre-upper');if(!upper)return null;
 const host=scrollHost(upper),top=viewTop(host),bottom=host===document.scrollingElement?innerHeight:host.getBoundingClientRect().bottom,left=host===document.scrollingElement?0:host.getBoundingClientRect().left,right=host===document.scrollingElement?innerWidth:host.getBoundingClientRect().right;
 const candidates=[...upper.querySelectorAll<HTMLElement>(ANCHORS.map(a=>`[${a}]`).join(','))].filter(el=>{const r=el.getBoundingClientRect();return r.height>0&&r.bottom>top+16&&r.top<bottom&&r.right>left&&r.left<right;});
 const el=candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-top-40)-Math.abs(b.getBoundingClientRect().top-top-40))[0];
 if(!el)return null;const attribute=ANCHORS.find(a=>el.hasAttribute(a))!;
 return {attribute,key:el.getAttribute(attribute)!,offset:el.getBoundingClientRect().top-top,offsetX:el.getBoundingClientRect().left-left};
}
export function restoreReadingAnchor(root:HTMLElement,anchor:Anchor|null){
 if(!anchor)return false;
 const upper=root.querySelector<HTMLElement>('.pupitre-upper');if(!upper)return false;
 const target=[...upper.querySelectorAll<HTMLElement>(`[${anchor.attribute}]`)].find(el=>el.getAttribute(anchor.attribute)===anchor.key);
 if(!target)return false;
 const host=scrollHost(upper);host.scrollTop+=target.getBoundingClientRect().top-viewTop(host)-anchor.offset;
 host.scrollLeft+=target.getBoundingClientRect().left-(host===document.scrollingElement?0:host.getBoundingClientRect().left)-anchor.offsetX;return true;
}
/** Keep a semantic passage, rather than an obsolete pixel offset after a resize. */
export function usePupitreContinuity(ref:RefObject<HTMLDivElement|null>,signature:string,documentKey:string){
 const last=useRef<Snapshot|null>(null),restoring=useRef(false),currentKey=useRef(documentKey);
 currentKey.current=documentKey;
 useLayoutEffect(()=>{
  const root=ref.current;if(!root)return;
  let frame=0,settle=0;
  const capture=()=>{
   if(restoring.current)return;
   const upper=root.querySelector<HTMLElement>('.pupitre-upper'),lower=root.querySelector<HTMLElement>('.pupitre-lower');
   if(upper)last.current={documentKey:currentKey.current,anchor:captureReadingAnchor(root),upper:scrollHost(upper).scrollTop,lower:lower?.scrollTop||0};
  };
  const restore=()=>{
   const saved=last.current;if(!saved||saved.documentKey!==currentKey.current){capture();return;}
   restoring.current=true;
   cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
    const upper=root.querySelector<HTMLElement>('.pupitre-upper'),lower=root.querySelector<HTMLElement>('.pupitre-lower');
    if(!restoreReadingAnchor(root,saved.anchor)&&upper)scrollHost(upper).scrollTop=saved.upper;
    if(lower)lower.scrollTop=saved.lower;
    settle=requestAnimationFrame(()=>{restoring.current=false;capture();});
   });
  };
  if(last.current?.documentKey===documentKey)restore();else capture();
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(restore);
  const upper=root.querySelector<HTMLElement>('.pupitre-upper');if(upper)observer?.observe(upper);
  root.addEventListener('scroll',capture,true);window.addEventListener('scroll',capture,{passive:true});
  window.addEventListener('qc-pupitre-before-layout',capture);window.addEventListener('resize',restore);
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(settle);restoring.current=false;root.removeEventListener('scroll',capture,true);window.removeEventListener('scroll',capture);window.removeEventListener('qc-pupitre-before-layout',capture);window.removeEventListener('resize',restore);};
 },[ref,signature,documentKey]);
}
