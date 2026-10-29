import {useEffect,useRef,useState,type RefObject} from 'react';
import {captureReadingAnchor,restoreReadingAnchor} from '../../Pupitre/usePupitreContinuity';
const STORAGE='quran-coach-reading-trace';
type Trace={page:number;key:string;offset:number;offsetX:number};
export function readTrace():Trace|null{
    try{const v=JSON.parse(localStorage.getItem(STORAGE)||'null');return v&&Number.isInteger(v.page)&&v.page>=1&&v.page<=604&&/^\d+:\d+:\d+$/.test(v.key)&&Number.isFinite(v.offset)&&Number.isFinite(v.offsetX)?v:null;}catch{return null;}
}
/** A local visual breadcrumb, deliberately independent of the manual bookmark. */
export function useReadingTrace(viewport:RefObject<HTMLDivElement|null>,page:number,ready:boolean,visible:boolean,explicitEntry:boolean){
    const [initial]=useState(readTrace);
    const attempted=useRef(false);
    const [marker,setMarker]=useState<{page:number;key:string}|null>(null);
    useEffect(()=>{
        setMarker(null);
        if(!ready||!visible)return;
        const host=viewport.current,root=host?.closest<HTMLElement>('.iq-reader');if(!host||!root)return;
        let timer=0,frame=0,fade=0,latest:Trace|null=null;
        if(!attempted.current){
            attempted.current=true;const trace=initial;
            if(!explicitEntry&&trace?.page===page){
                frame=requestAnimationFrame(()=>{
                    if(restoreReadingAnchor(root,{attribute:'data-word-key',key:trace.key,offset:trace.offset,offsetX:trace.offsetX})){
                        setMarker({page,key:trace.key});fade=window.setTimeout(()=>setMarker(null),4500);
                    }
                });
            }
        }
        const write=()=>{if(latest)try{localStorage.setItem(STORAGE,JSON.stringify(latest));}catch{/* Storage must not interrupt reading. */}};
        const capture=()=>{const anchor=captureReadingAnchor(root);if(anchor?.attribute==='data-word-key')latest={page,key:anchor.key,offset:anchor.offset,offsetX:anchor.offsetX};};
        const save=()=>{capture();write();};
        const scroll=()=>{capture();clearTimeout(timer);timer=window.setTimeout(write,400);};
        const hide=()=>{if(document.hidden)save();};
        timer=window.setTimeout(save,3000);
        host.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',hide);
        return()=>{write();clearTimeout(timer);cancelAnimationFrame(frame);clearTimeout(fade);host.removeEventListener('scroll',scroll);window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',hide);};
    },[viewport,page,ready,visible,explicitEntry,initial]);
    return marker?.page===page?marker.key:null;
}
