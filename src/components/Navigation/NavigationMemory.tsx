import {useQuizStore} from '../../stores/quizStore';
import {useLayoutEffect,useRef} from 'react';
import {useLocation,useNavigationType} from 'react-router-dom';
type Position={x:number;y:number;panes:Record<string,{x:number;y:number}>};
const memory=new Map<string,Position>();
function read(key:string):Position|undefined {try{const saved=memory.get(key)||JSON.parse(sessionStorage.getItem(`qc-scroll:${key}`)||'null');return saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&saved.panes&&typeof saved.panes==='object'?saved:undefined;}catch{return memory.get(key);}}
function write(key:string,value:Position){memory.set(key,value);if(memory.size>80)memory.delete(memory.keys().next().value!);try{sessionStorage.setItem(`qc-scroll:${key}`,JSON.stringify(value));const keys=Object.keys(sessionStorage).filter(k=>k.startsWith('qc-scroll:'));keys.slice(0,Math.max(0,keys.length-100)).forEach(k=>sessionStorage.removeItem(k));}catch{/* Memory fallback. */}}
/** Capture before leaving, restore after lazy content appears; user input always wins. */
export function NavigationMemory(){
 const location=useLocation(),kind=useNavigationType();
 const quizView=useQuizStore(s=>s.view),scope=location.pathname==='/quiz'?quizView:'',previous=useRef('');
 useLayoutEffect(()=>{
  const old=history.scrollRestoration;history.scrollRestoration='manual';return()=>{history.scrollRestoration=old;};
 },[]);
 useLayoutEffect(()=>{
  if(location.pathname==='/read')return; // The persistent Mushaf owns its page/verse position.
  const route=location.pathname+location.search+(scope?`::${scope}`:''),entry=location.key+(scope?`::${scope}`:'');
  const samePage=previous.current===location.pathname;previous.current=location.pathname;
  const saved=kind==='REPLACE'&&samePage||location.hash&&kind!=='POP'?undefined:read(kind==='POP'?entry:route)||read(route);
  let restoring=!!saved,frame=0,stopped=false;
  const snapshot=()=>{if(restoring)return;const panes:Position['panes']={};document.querySelectorAll<HTMLElement>('[data-scroll-key]').forEach(el=>{if(el.getClientRects().length)panes[el.dataset.scrollKey!]={x:el.scrollLeft,y:el.scrollTop};});const value={x:window.scrollX,y:window.scrollY,panes};write(entry,value);write(route,value);};
  const restore=()=>{if(stopped||!saved)return;window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});document.querySelectorAll<HTMLElement>('[data-scroll-key]').forEach(el=>{const p=saved.panes[el.dataset.scrollKey!];if(p&&el.getClientRects().length)el.scrollTo({left:p.x,top:p.y,behavior:'instant'});});};
  const queue=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(restore);};
  const stop=()=>{stopped=true;restoring=false;observer.disconnect();cancelAnimationFrame(frame);};
  const observer=new MutationObserver(queue);
  if(saved){restore();observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});}else if(!location.hash&&!(kind==='REPLACE'&&samePage))window.scrollTo({top:0,left:0,behavior:'instant'});
  const timer=window.setTimeout(stop,5000);
  const input=()=>{stop();snapshot();};
  if(!saved)snapshot();
  window.addEventListener('scroll',snapshot,true);window.addEventListener('pagehide',snapshot);
  for(const event of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(event,input,{passive:true,capture:true});
  return()=>{stop();clearTimeout(timer);window.removeEventListener('scroll',snapshot,true);window.removeEventListener('pagehide',snapshot);for(const event of ['wheel','touchstart','pointerdown','keydown'])window.removeEventListener(event,input,true);};
 },[location.key,location.pathname,location.search,location.hash,kind,scope]);
 return null;
}
