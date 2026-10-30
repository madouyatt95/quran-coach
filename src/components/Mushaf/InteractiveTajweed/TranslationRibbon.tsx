import {loadFrenchWords} from '../../../lib/interactiveMushaf/french';
import type {VerseWords} from '../../../lib/wordTimings';
import {meaningCaptions,meaningCaptionIndex} from './semanticCaptions';
import {useEffect,useMemo,useRef,useState,type RefObject,type CSSProperties} from 'react';
import {ChevronUp,Languages,Maximize2,Play} from 'lucide-react';
import {fetchSurahTranslation} from '../../../lib/quranApi';
import {CHAPTERS} from '../../../lib/interactiveMushaf/model';
import {TranslationDetails} from './TranslationDetails';
import {translationCaptions} from './translationCaptions';

type Props={timings?:VerseWords;sourceMatched?:boolean;surah:number;ayah:number;expanded:boolean;onExpanded:(expanded:boolean)=>void;audioRef?:RefObject<HTMLAudioElement|null>;audioActive?:boolean;fontSize?:13|16|18;onPauseForReading?:()=>()=>void};
export function TranslationRibbon({timings,sourceMatched=false,surah,ayah,expanded,onExpanded,audioRef,audioActive=false,fontSize=13,onPauseForReading}:Props){
    const [result,setResult]=useState<{surah:number;values:Map<number,string>}|null>(null);
    const [retry,setRetry]=useState(0);
    const [details,setDetails]=useState<{surah:number;ayah:number;text:string}|null>(null);
    const [manual,setManual]=useState<{key:string;index:number}|null>(null);
    const resumeAfter=useRef<(()=>void)|null>(null),drag=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
    const pause=()=>{if(!resumeAfter.current)resumeAfter.current=onPauseForReading?.()??(()=>{});};
    const resume=()=>{setManual(null);const action=resumeAfter.current;resumeAfter.current=null;action?.();};
    const [width,setWidth]=useState(240);
    const [clock,setClock]=useState({key:'',seconds:0});
    const [french,setFrench]=useState<{surah:number;values:Record<string,string>}|null>(null);
    useEffect(()=>{if(!expanded)return;let alive=true;void loadFrenchWords(surah).then(values=>{if(alive)setFrench({surah,values});}).catch(()=>{});return()=>{alive=false;};},[surah,expanded]);
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
            const seconds=audio&&Number.isFinite(audio.currentTime)?audio.currentTime:0;
            if(audio&&!audio.paused){setManual(previous=>previous?null:previous);resumeAfter.current=null;}
            setClock(previous=>previous.key===key&&previous.seconds===seconds?previous:{key,seconds});
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
    const {captions,groups}=useMemo(()=>{
        const context=document.createElement('canvas').getContext('2d');
        if(context)context.font=`${fontSize}px system-ui, sans-serif`;
        const measure=(value:string)=>context?.measureText(value).width??value.length*7;
        const groups=sourceMatched&&audioActive&&french?.surah===surah?meaningCaptions(key,french.values,timings,width,measure):[];
        return {groups,captions:groups.length?groups.map(g=>g.text):translationCaptions(text||'',width,measure)};
    },[text,width,fontSize,sourceMatched,audioActive,french,surah,key,timings]);
    const seconds=audioActive&&clock.key===key?clock.seconds:0;
    const browsing=manual?.key===key;
    const index=browsing?Math.min(manual.index,Math.max(0,captions.length-1)):meaningCaptionIndex(groups,seconds);
    const browse=(delta:number)=>{if(!captions.length)return;pause();setManual({key,index:Math.max(0,Math.min(captions.length-1,index+delta))});};
    const openDetails=()=>{if(text){pause();setDetails({surah,ayah,text});}else if(current){setResult(null);setRetry(value=>value+1);}};
    const closeDetails=()=>{setDetails(null);if(!browsing)resume();};
    return <>
        <section className={`iq-translation-ribbon ${expanded?'is-expanded':''}`} aria-label="Traduction du verset" style={{'--iq-subtitle-size':`${fontSize}px`} as CSSProperties}>
            {!expanded?<button className="iq-translation-toggle" aria-expanded={false} aria-controls="iq-translation-caption" onClick={()=>onExpanded(true)}><Languages size={16}/><span>Traduction <small>· {key}</small></span><ChevronUp size={16}/></button>:<>
                <button className="iq-translation-hide" aria-label="Masquer la traduction" aria-expanded={true} aria-controls="iq-translation-caption" onClick={()=>{resume();onExpanded(false);}}><Languages size={16}/><small>{key}</small><small className="iq-caption-source">{groups.length?"Mots":"Verset"}</small></button>
                <button ref={body} id="iq-translation-caption" className="iq-translation-caption" lang="fr" aria-label={text?`Lire la traduction complète du verset ${key}`:!current?'Chargement de la traduction':'Réessayer la traduction'} onPointerDown={event=>{swiped.current=false;drag.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerCancel={()=>{drag.current=null;swiped.current=true;}} onPointerUp={event=>{const start=drag.current;drag.current=null;if(start&&Math.abs(event.clientX-start.x)>35&&Math.abs(event.clientY-start.y)<40){swiped.current=true;browse(event.clientX<start.x?1:-1);}}} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();browse(event.key==='ArrowRight'?1:-1);}}} onClick={()=>{if(swiped.current){swiped.current=false;return;}openDetails();}}>
                    <span key={`${key}:${index}`} className="iq-caption-text" title={groups.length?"Sens des mots · QUL, synchronisé avec la récitation":"Traduction Hamidullah · faites glisser pour lire la suite"}>{groups.length?captions[index]:!current?'Chargement de la traduction…':text?captions[index]:'Traduction indisponible · Réessayer'}</span>
                </button>
                {text&&<button className="iq-translation-expand" aria-label={browsing?"Reprendre le suivi des sous-titres":"Lire la traduction complète"} onClick={browsing?resume:openDetails}>{browsing?<Play size={17}/>:<Maximize2 size={15}/>}</button>}
            </>}
        </section>
        {details&&<TranslationDetails wordMeanings={groups.length>0} {...details} onClose={closeDetails}/>}
    </>;
}
