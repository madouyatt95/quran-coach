import {lazy,Suspense} from 'react';
const WordCourseLink=lazy(()=>import('../../../arabic/WordCourseLink'));
const StoryContextButton=lazy(()=>import('../../Journeys/StoryContextButton'));
import {fetchVerseRecitation,wordRecitationStart,type VerseRecitation,type WordRecitationStart} from '../../../lib/verseRecitation';
import {mushafReciter} from '../../../lib/quranApi';
import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,ChevronUp,ChevronDown,Pause,Volume2,X,Bookmark,Play} from 'lucide-react';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
import {CHAPTERS} from '../../../lib/interactiveMushaf/model';
import type {PageFont,PaperTheme} from '../../../lib/interactiveMushaf/service';
import {fontPaletteName} from '../../../lib/interactiveMushaf/fontResources';
import {FRENCH_SOURCE} from '../../../lib/interactiveMushaf/french';
import {TAJWEED_RULES} from '../../../academy/data/tajweed-rules';
import {useMushafStudyStore} from '../../../stores/mushafStudyStore';
import {useSRSStore} from '../../../stores/srsStore';
// Exact source tags only: do not infer a rule from the glyph's color.
const LESSONS:Record<string,string>={idgham_ghunnah:'idgham',idgham_wo_ghunnah:'idgham',ikhafa:'ikhfa',ikhfa:'ikhfa',iqlab:'iqlab',qalqalah:'qalqalah',madda_normal:'madd-tabii',ghunnah:'ghunna'};
export function WordStudyCard({word,font,paper,page,previous,next,onAdjacent,onClose,onTranslation,onBeforePlay,rules,selectedReciter,onContinue,onOptions}:{onOptions?:()=>void;word:MushafWord;font:PageFont;paper:PaperTheme;page:number;previous:boolean;next:boolean;onAdjacent:(delta:number)=>void;onClose:()=>void;onTranslation:()=>void;onBeforePlay:()=>void;rules:Record<string,string>;selectedReciter?:string;onContinue?:(start?:WordRecitationStart)=>void}){
    const [recitation,setRecitation]=useState<{key:string;reciter:string;source:VerseRecitation|null}|null>(null);
    const canContinue=!!onContinue;
    useEffect(()=>{if(!canContinue||!selectedReciter)return;let cancelled=false;void fetchVerseRecitation(word.verseKey,mushafReciter(selectedReciter).quranComId).then(source=>{if(!cancelled)setRecitation({key:word.verseKey,reciter:selectedReciter,source});}).catch(()=>{if(!cancelled)setRecitation({key:word.verseKey,reciter:selectedReciter,source:null});});return()=>{cancelled=true;};},[word.verseKey,selectedReciter,canContinue]);
    const sourceReady=recitation?.key===word.verseKey&&recitation.reciter===selectedReciter;
    const wordStart=wordRecitationStart(sourceReady?recitation.source:null,word.position);
    const [expanded,setExpanded]=useState(false),[rule,setRule]=useState<string|null>(null);
    const [status,setStatus]=useState<'idle'|'loading'|'playing'|'error'>('idle'),[loop,setLoop]=useState(false);
    const audio=useRef<HTMLAudioElement|null>(null),drag=useRef<{x:number;y:number}|null>(null);
    const words=useMushafStudyStore(s=>s.words),toggle=useMushafStudyStore(s=>s.toggle);
    const stop=()=>{const el=audio.current;audio.current=null;if(el){el.onplaying=null;el.onended=null;el.onerror=null;el.pause();}setStatus('idle');};
    const [currentWord,setCurrentWord]=useState(word.key);
    if(currentWord!==word.key){setCurrentWord(word.key);setRule(null);setLoop(false);setStatus('idle');}
    useEffect(()=>()=>{const el=audio.current;audio.current=null;if(el){el.onplaying=null;el.onended=null;el.onerror=null;el.pause();}},[word.key]);
    useEffect(()=>{const handler=()=>stop();window.addEventListener('quran-stop-playback',handler);return()=>window.removeEventListener('quran-stop-playback',handler);},[]);
    useEffect(()=>{if(audio.current)audio.current.loop=loop;},[loop]);
    const play=()=>{
        if(status==='playing'||status==='loading'){stop();return;}if(!word.audio)return;
        onBeforePlay();stop();const el=new Audio(word.audio);audio.current=el;el.loop=loop;setStatus('loading');
        const valid=()=>audio.current===el;
        el.onplaying=()=>{if(valid())setStatus('playing');};el.onended=()=>{if(valid())setStatus('idle');};el.onerror=()=>{if(valid())setStatus('error');};
        void el.play().catch(()=>{if(valid())setStatus('error');});
    };
    const lesson=TAJWEED_RULES.find(l=>l.id===LESSONS[rule||'']);
    return <aside className={`iq-word-card ${expanded?'iq-word-expanded':''}`} role="dialog" aria-label={`Mot ${word.position} · verset ${word.verseKey}`} onKeyDown={e=>{if(e.key==='ArrowRight')onAdjacent(1);if(e.key==='ArrowLeft')onAdjacent(-1);if(e.key==='Escape')onClose();}}>
        <div className="iq-card-grip" onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY};if(!(e.target as HTMLElement).closest('button'))e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={e=>{const d=drag.current;drag.current=null;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dy)>30&&Math.abs(dy)>Math.abs(dx))setExpanded(dy<0);else if(Math.abs(dx)>65)onAdjacent(dx>0?1:-1);}}><button aria-expanded={expanded} aria-label={expanded?'Réduire la fiche':'Développer la fiche'} onClick={()=>setExpanded(!expanded)}>{expanded?<ChevronDown size={17}/>:<ChevronUp size={17}/>}</button></div>
        <header><span>{CHAPTERS[Number(word.verseKey.split(':')[0])-1].latin} · {word.verseKey}</span><button aria-label="Fermer la fiche du mot" onClick={onClose}><X size={18}/></button></header>
        <div className="iq-word-card-main"><button aria-label="Mot précédent" disabled={!previous} onClick={()=>onAdjacent(-1)}><ChevronLeft size={20}/></button><div className="iq-card-glyph" role="img" aria-label={word.text} lang="ar" dir="rtl" style={{fontFamily:font.family,fontPalette:font.mode==='colrv1'?fontPaletteName(font.family,paper):undefined}}>{font.mode==='unicode'?word.text:word.glyph}</div><button aria-label="Mot suivant" disabled={!next} onClick={()=>onAdjacent(1)}><ChevronRight size={20}/></button></div>
        <p className="iq-card-french">{word.french||'Consulter le sens dans le verset'}</p>
        <div className="iq-word-card-actions"><button disabled={!word.audio} onClick={play} aria-label={status==='playing'||status==='loading'?'Arrêter la prononciation':'Prononcer le mot'}>{status==='playing'?<Pause size={17}/>:<Volume2 size={17}/>} {status==='loading'?'Chargement…':status==='playing'?'Arrêter':status==='error'?'Réessayer':'Prononcer'}</button><button aria-pressed={!!words[word.key]} onClick={()=>{if(!words[word.key]){const [s,a]=word.verseKey.split(':').map(Number);useSRSStore.getState().addCard(s,a);}toggle({key:word.key,verseKey:word.verseKey,text:word.text,page});}}><Bookmark size={16}/>{words[word.key]?'Enregistré':'À revoir'}</button></div>
        <Suspense fallback={null}><WordCourseLink key={word.key} word={word} onClose={()=>{stop();onClose();}}/></Suspense>
        <Suspense fallback={null}><StoryContextButton verseKey={word.verseKey} onClose={onClose}/></Suspense>
        {onOptions&&<div className="iq-word-secondary"><button onClick={()=>{stop();onOptions();}}>Options du verset…</button></div>}
        {onContinue&&<div className="iq-word-continue"><button disabled={!sourceReady} onClick={()=>{stop();onContinue(wordStart??undefined);}}><Play size={17}/>{!sourceReady?'Préparation…':wordStart?'Lire à partir de ce mot':'Lire à partir de ce verset'}</button>{sourceReady&&!wordStart&&<small>Le départ au mot n’est pas disponible pour cette voix.</small>}</div>}
        {status==='error' &&<p role="alert">L’audio n’a pas pu être chargé. Réessayez.</p>}
        {expanded&&<div className="iq-word-extra">
            {word.transliteration&&<p className="iq-transliteration">{word.transliteration}</p>}
            {word.french&&<a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">Français mot à mot · QUL</a>}
            <div className="iq-rule-chips">{word.rules.filter(r=>rules[r]).map(r=><button key={r} aria-pressed={rule===r} onClick={()=>setRule(rule===r?null:r)}>{rules[r]}</button>)}</div>
            {rule&&<section className="iq-rule-explanation"><strong>{rules[rule]}</strong><p dir="rtl" lang="ar" className="iq-rule-segments">{word.tajweedSegments.map((s,i)=><span key={i} className={s.rule===rule?'iq-segment-active':''}>{s.text}</span>)}</p><p>{lesson?.description||'Le segment marqué par la source est souligné ci-dessus. Écoutez sa réalisation dans le mot et dans le verset.'}</p><small>Repérage : balises Tajwid Quran.com. La palette du livre peut différer.</small></section>}
            <div className="iq-word-card-actions"><button aria-pressed={loop} onClick={()=>setLoop(!loop)}>Boucle {loop?'activée':'désactivée'}</button><button onClick={()=>{stop();onTranslation();}}>Traduction du verset</button></div>
        </div>}
    </aside>;
}
