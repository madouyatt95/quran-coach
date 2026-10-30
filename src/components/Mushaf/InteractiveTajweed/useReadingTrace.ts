import {useCallback,useEffect,useRef,useState,type RefObject} from 'react';
import {captureReadingAnchor,restoreReadingAnchor} from '../../Pupitre/usePupitreContinuity';
import {PAGE_MANIFEST} from '../../../lib/interactiveMushaf/model';
const STORAGE='quran-coach-reading-trace';
export type Trace={page:number;key:string;offset:number;offsetX:number;verse?:string};
export function readTrace():Trace|null{
    try{const v=JSON.parse(localStorage.getItem(STORAGE)||'null');return v&&Number.isInteger(v.page)&&v.page>=1&&v.page<=604&&/^\d+:\d+:\d+$/.test(v.key)&&PAGE_MANIFEST[v.page].verseKeys.includes(v.key.split(':').slice(0,2).join(':'))&&Number.isFinite(v.offset)&&Number.isFinite(v.offsetX)?{...v,verse:typeof v.verse==='string'&&PAGE_MANIFEST[v.page].verseKeys.includes(v.verse)?v.verse:undefined}:null;}catch{return null;}
}
/** Scroll anchors describe the viewport, never a claim that a particular word was read. */
export function useReadingTrace(viewport:RefObject<HTMLDivElement|null>,page:number,ready:boolean,visible:boolean,explicitEntry:boolean){
    const [initial]=useState(readTrace);
    const attempted=useRef(false),selected=useRef<{page:number;verse:string}|null>(initial?.verse?{page:initial.page,verse:initial.verse}:null);
    const [marker,setMarker]=useState<{page:number;key:string;verse?:string}|null>(null);
    const captureNow=useRef<()=>void>(()=>{});
    const pageRef=useRef(page);pageRef.current=page;
    const rememberVerse=useCallback((verse:string)=>{
        const current=pageRef.current;if(!PAGE_MANIFEST[current]?.verseKeys.includes(verse))return;
        selected.current={page:current,verse};captureNow.current();
    },[]);
    useEffect(()=>{
        setMarker(null);
        if(!ready||!visible)return;
        const host=viewport.current,root=host?.closest<HTMLElement>('.iq-reader');if(!host||!root)return;
        let timer=0,frame=0,fade=0,latest:Trace|null=null;
        if(!attempted.current){
            const trace=initial;
            if(!explicitEntry&&trace?.page===page){
                frame=requestAnimationFrame(()=>{
                    attempted.current=true;
                    if(restoreReadingAnchor(root,{attribute:'data-word-key',key:trace.key,offset:trace.offset,offsetX:trace.offsetX})){
                        setMarker({page,key:trace.key,verse:trace.verse});fade=window.setTimeout(()=>setMarker(null),4500);
                    }
                });
            }else attempted.current=true;
        }
        const write=()=>{if(latest)try{localStorage.setItem(STORAGE,JSON.stringify(latest));}catch{/* Storage must not interrupt reading. */}};
        const capture=()=>{const anchor=captureReadingAnchor(root);if(anchor?.attribute==='data-word-key')latest={page,key:anchor.key,offset:anchor.offset,offsetX:anchor.offsetX,...(selected.current?.page===page?{verse:selected.current.verse}:{})};};
        const save=()=>{capture();write();};captureNow.current=save;
        const scroll=()=>{capture();clearTimeout(timer);timer=window.setTimeout(write,400);};
        const hide=()=>{if(document.hidden)save();};
        timer=window.setTimeout(save,3000);
        host.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',hide);
        return()=>{write();captureNow.current=()=>{};clearTimeout(timer);cancelAnimationFrame(frame);clearTimeout(fade);host.removeEventListener('scroll',scroll);window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',hide);};
    },[viewport,page,ready,visible,explicitEntry,initial]);
    return {word:marker?.page===page&&!marker.verse?marker.key:null,verse:marker?.page===page?marker.verse:null,rememberVerse};
}
