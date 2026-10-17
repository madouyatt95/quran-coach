import {useEffect,useMemo,useRef,useState,type RefObject,type CSSProperties} from 'react';
import {ChevronUp,Languages,Maximize2,Play} from 'lucide-react';
import {fetchSurahTranslation} from '../../../lib/quranApi';
import {CHAPTERS} from '../../../lib/interactiveMushaf/model';
import {TranslationDetails} from './TranslationDetails';
import {captionIndex,translationCaptions} from './translationCaptions';

type Props={surah:number;ayah:number;expanded:boolean;onExpanded:(expanded:boolean)=>void;audioRef?:RefObject<HTMLAudioElement|null>;audioActive?:boolean;fontSize?:13|16|18;onPauseForReading?:()=>()=>void};
export function TranslationRibbon({surah,ayah,expanded,onExpanded,audioRef,audioActive=false,fontSize=13,onPauseForReading}:Props){
    const [result,setResult]=useState<{surah:number;values:Map<number,string>}|null>(null);
    const [retry,setRetry]=useState(0);
    const [details,setDetails]=useState<{surah:number;ayah:number;text:string}|null>(null);
    const [manual,setManual]=useState<{key:string;index:number}|null>(null);
    const resumeAfter=useRef<(()=>void)|null>(null),drag=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
    const pause=()=>{if(!resumeAfter.current)resumeAfter.current=onPauseForReading?.()??(()=>{});};
    const resume=()=>{setManual(null);const action=resumeAfter.current;resumeAfter.current=null;action?.();};
    const [width,setWidth]=useState(240);
    const [clock,setClock]=useState({key:'',progress:0});
    const body=useRef<HTMLButtonElement>(null);
    const key=`${surah}:${ayah}`;
    useEffect(()=>{resumeAfter.current=null;},[key]);
    useEffect(()=>{
        if(!expanded)return;
        let cancelled=false;
        void fetchSurahTranslation(surah,'fr').then(values=>{if(!cancelled)setResult({surah,values});}).catch(()=>{if(!cancelled)setResult({surah,values:new Map()});});
        return()=>{cancelled=true;};
    },[surah,expanded,retry]);
    useEffect(()=>{
        const node=body.current;
        if(!expanded||!node)return;
        const resize=()=>setWidth(Math.max(40,node.clientWidth-16));
        resize();
        const observer=new ResizeObserver(resize);observer.observe(node);
        return()=>observer.disconnect();
    },[expanded]);
    useEffect(()=>{
        if(!expanded||!audioActive)return;
        const update=()=>{
            const audio=audioRef?.current;
            const progress=audio&&Number.isFinite(audio.duration)&&audio.duration>0?Math.min(1,Math.max(0,audio.currentTime/audio.duration)):0;
            if(audio&&!audio.paused){setManual(previous=>previous?null:previous);resumeAfter.current=null;}
            setClock(previous=>previous.key===key&&previous.progress===progress?previous:{key,progress});
        };
        update();
        // Read the actual audio clock: pauses, buffering, seeks and playback speed stay in sync.
        // The ref can point to a new audio element between verses.
        const timer=window.setInterval(update,100);
        return()=>window.clearInterval(timer);
    },[expanded,audioActive,audioRef,key]);
    const number=(CHAPTERS[surah-1]?.offset??0)+ayah;
    const current=result?.surah===surah?result:null;
    const text=current?.values.get(number);
    const captions=useMemo(()=>{
        const context=document.createElement('canvas').getContext('2d');
        if(context)context.font=`${fontSize}px system-ui, sans-serif`;
        return translationCaptions(text||'',width,value=>context?.measureText(value).width??value.length*7);
    },[text,width,fontSize]);
    const progress=audioActive&&clock.key===key?clock.progress:0;
    const browsing=manual?.key===key;
    const index=browsing?Math.min(manual.index,Math.max(0,captions.length-1)):captionIndex(captions,progress);
    const browse=(delta:number)=>{if(!captions.length)return;pause();setManual({key,index:Math.max(0,Math.min(captions.length-1,index+delta))});};
    const openDetails=()=>{if(text){pause();setDetails({surah,ayah,text});}else if(current){setResult(null);setRetry(value=>value+1);}};
    const closeDetails=()=>{setDetails(null);if(!browsing)resume();};
    return <>
        <section className={`iq-translation-ribbon ${expanded?'is-expanded':''}`} aria-label="Traduction du verset" style={{'--iq-subtitle-size':`${fontSize}px`} as CSSProperties}>
            {!expanded?<button className="iq-translation-toggle" aria-expanded={false} aria-controls="iq-translation-caption" onClick={()=>onExpanded(true)}><Languages size={16}/><span>Traduction <small>· {key}</small></span><ChevronUp size={16}/></button>:<>
                <button className="iq-translation-hide" aria-label="Masquer la traduction" aria-expanded={true} aria-controls="iq-translation-caption" onClick={()=>{resume();onExpanded(false);}}><Languages size={16}/><small>{key}</small></button>
                <button ref={body} id="iq-translation-caption" className="iq-translation-caption" lang="fr" aria-label={text?`Lire la traduction complète du verset ${key}`:!current?'Chargement de la traduction':'Réessayer la traduction'} onPointerDown={event=>{swiped.current=false;drag.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerCancel={()=>{drag.current=null;swiped.current=true;}} onPointerUp={event=>{const start=drag.current;drag.current=null;if(start&&Math.abs(event.clientX-start.x)>35&&Math.abs(event.clientY-start.y)<40){swiped.current=true;browse(event.clientX<start.x?1:-1);}}} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();browse(event.key==='ArrowRight'?1:-1);}}} onClick={()=>{if(swiped.current){swiped.current=false;return;}openDetails();}}>
                    <span key={`${key}:${index}`} className="iq-caption-text">{!current?'Chargement de la traduction…':text?captions[index]:'Traduction indisponible · Réessayer'}</span>
                </button>
                {text&&<button className="iq-translation-expand" aria-label={browsing?"Reprendre le suivi des sous-titres":"Lire la traduction complète"} onClick={browsing?resume:openDetails}>{browsing?<Play size={17}/>:<Maximize2 size={15}/>}</button>}
            </>}
        </section>
        {details&&<TranslationDetails {...details} onClose={closeDetails}/>}
    </>;
}
