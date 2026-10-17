import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Link,useLocation} from 'react-router-dom';
import {BookOpen,X} from 'lucide-react';
import {referenceParts,chapterReferences,referenceKey,type CourseReference} from '../courseReferences';
import {courseChapter} from '../data/courseLibrary';
import {courseNarration,narrationBlocks} from '../courseReading';
import {evidenceTeaching,evidenceSourceContext,evidenceHighlight,loadEvidenceVerses,hadithArabic,courseEvidenceReferences,type EvidenceVerse} from '../data/courseEvidence';
import {courseReturnFrom,type CourseReturn} from '../data/courseConnections';
import {getAudioUrl} from '../../lib/quranApi';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {GlossaryText} from './GlossaryText';
import './CourseEvidence.css';

const ReferenceContext=createContext<{moduleId:string;show:(reference:CourseReference)=>void}|null>(null);
export function CourseReferencesProvider({moduleId,children}:{moduleId:string;children:ReactNode}){
 const [selected,setSelected]=useState<CourseReference|null>(null);
 const location=useLocation();const courseReturn=courseReturnFrom(location.state);
 return <ReferenceContext.Provider value={{moduleId,show:setSelected}}>{children}{selected&&<EvidenceReference key={referenceKey(selected)} moduleId={moduleId} reference={selected} returnTo={`${location.pathname}${location.search}`} returnCourse={courseReturn} onClose={()=>setSelected(null)}/>}</ReferenceContext.Provider>;
}
export function CourseReferenceText({text}:{text:string}){
 const context=useContext(ReferenceContext);
 if(!context)return <GlossaryText text={text}/>;
 return <>{referenceParts(text,context.moduleId).map((part,index)=>part.reference?<ReferenceLink key={index} reference={part.reference}>{part.text}</ReferenceLink>:<GlossaryText key={index} text={part.text}/>)}</>;
}
function ReferenceLink({reference,children}:{reference:CourseReference;children:ReactNode}){
 const context=useContext(ReferenceContext)!;
 const title=reference.kind==='verse'?`Coran ${reference.surah}:${reference.ayah}${reference.end?` à ${reference.end}`:''}`:courseChapter(`sabirin-hadith-${reference.chapter}`)?.chapter.title;
 return <button type="button" className="academy-reference-link" onClick={()=>context.show(reference)} aria-label={`Étudier le texte : ${title}`}>{children}</button>;
}
/** A scoped list serves one notion; the main index includes the whole chapter. */
export function CourseReferenceList({texts,scoped=false,concept}:{texts:string[];scoped?:boolean;concept?:number}){
 const context=useContext(ReferenceContext);
 if(!context)return null;
 let references:CourseReference[];
 if(scoped){
  const unique=new Map<string,CourseReference>();const source=courseChapter(context.moduleId);
  if(concept!==undefined)for(const reference of courseEvidenceReferences(context.moduleId,concept))unique.set(referenceKey(reference),reference);
  if(source?.doc.subject==='hadith'){const ref:CourseReference={kind:'hadith',chapter:source.chapter.number};unique.set(referenceKey(ref),ref);}
  for(const text of texts)for(const part of referenceParts(text,context.moduleId))if(part.reference)unique.set(referenceKey(part.reference),part.reference);
  references=[...unique.values()];
 }else references=chapterReferences(context.moduleId,texts);
 if(!references.length)return null;
 return <section className="academy-reference-list"><h2>{scoped?'Étudier le texte lié à cette notion':'Étudier les textes cités'}</h2><p>Lis le texte, repère ce qu’il éclaire, puis retrouve le fil du cours.</p><div>{references.map(reference=><ReferenceLink reference={reference} key={referenceKey(reference)}>{reference.kind==='verse'?`Coran ${reference.surah}:${reference.ayah}${reference.end?`–${reference.end}`:''}`:courseChapter(`sabirin-hadith-${reference.chapter}`)?.chapter.title}</ReferenceLink>)}</div></section>;
}
function Highlight({text,expression}:{text:string;expression?:string}){
 const found=expression&&evidenceHighlight(text,expression);
 return found?<>{found.before}<mark>{found.match}</mark>{found.after}</>:<>{text}</>;
}
function EvidenceReference({moduleId,reference,returnTo,returnCourse,onClose}:{moduleId:string;reference:CourseReference;returnTo:string;returnCourse:CourseReturn|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const source=courseChapter(moduleId)!;
 const referenced=reference.kind==='hadith'?courseChapter(`sabirin-hadith-${reference.chapter}`)!:source;
 const teaching=evidenceTeaching(moduleId,reference);
 const context=evidenceSourceContext(moduleId,reference);
 const title=reference.kind==='verse'?`Coran ${reference.surah}:${reference.ayah}${reference.end?`–${reference.end}`:''}`:referenced.chapter.title;
 useEffect(()=>{
  const element=dialog.current!;const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';element.showModal();
  return()=>{element.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className="academy-reference-dialog academy-evidence" aria-labelledby="course-evidence-title" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget){const rect=event.currentTarget.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)onClose();}}}>
  <header><span>LE TEXTE ET SON SENS DANS LE COURS</span><button onClick={onClose} aria-label="Fermer le texte et revenir au cours" autoFocus><X size={22}/></button></header>
  <div className="academy-reference-dialog-body"><h2 id="course-evidence-title">{title}</h2>
   <p className="academy-evidence-current">Ton cours : {source.chapter.title}</p>
   {reference.kind==='verse'?<VerseText reference={reference} expression={teaching?.expression}/>:<HadithText chapter={reference.chapter} expression={teaching?.expression}/>}
   {teaching&&<section className="academy-evidence-explanation"><h3>{reference.kind==='hadith'&&referenced.chapter.number!==source.chapter.number?'Ce que le récit étudié explique':'Pourquoi ce texte est étudié ici'}</h3><p>{teaching.explanation}</p><p className="academy-evidence-question">{teaching.question}</p><p className="academy-evidence-credit">Repère pédagogique adapté du cours · {reference.kind==='hadith'?referenced.chapter.title:source.chapter.title}.</p></section>}
   {context&&<details className="academy-evidence-context"><summary>Retrouver la citation dans le cours · page {context.page}</summary><blockquote>{context.text}</blockquote><a href={`${source.doc.pdf}#page=${context.page}`} target="_blank" rel="noopener noreferrer">Lire la page du cours ↗</a></details>}
   {!teaching&&context&&<p className="academy-evidence-reading-cue">Pour relier ce passage à la leçon, ouvre son explication dans le cours ci-dessus : l’extrait conserve les mots de l’auteur autour de cette citation.</p>}
   <footer><p>Le repère pédagogique explique l’usage du texte dans le cours. Il ne constitue pas une traduction ni une étude exhaustive du passage.</p>
    {reference.kind==='verse'?<Link className="academy-evidence-open" to={`/read?surah=${reference.surah}&ayah=${reference.ayah}`} state={{readerReturn:{to:returnTo,label:'Retour à mon cours',...(returnCourse?{state:{courseReturn:returnCourse}}:{})}}}><BookOpen size={17}/> Ouvrir le passage dans le Mushaf</Link>:<a className="academy-evidence-open" href={`${referenced.doc.pdf}#page=${referenced.chapter.start}`} target="_blank" rel="noopener noreferrer">Voir le récit et ses explications dans la source ↗</a>}
    <button onClick={onClose}>Reprendre mon cours</button>
   </footer>
  </div>
 </dialog>,document.body);
}
function HadithText({chapter,expression}:{chapter:number;expression?:string}){
 const source=courseChapter(`sabirin-hadith-${chapter}`)!;
 const narration=courseNarration(`sabirin-hadith-${chapter}`);
 const arabic=hadithArabic(chapter);
 return <section className="academy-evidence-text">{arabic&&<div className="academy-evidence-hadith-arabic"><h3>Texte arabe · {arabic.label}</h3><p className="academy-evidence-arabic" lang="ar" dir="rtl">{arabic.arabic}</p><p className="academy-evidence-credit"><CourseReferenceText text={arabic.note}/></p><a className="academy-evidence-source" href={arabic.url} target="_blank" rel="noopener noreferrer">Consulter le récit : {arabic.source} ↗</a></div>}{arabic?.variants?.map(variant=><details key={variant.url} className="academy-evidence-context"><summary>{variant.label} · {variant.source}</summary><p className="academy-evidence-arabic" lang="ar" dir="rtl">{variant.arabic}</p><p className="academy-evidence-credit">{variant.note}</p><a className="academy-evidence-source" href={variant.url} target="_blank" rel="noopener noreferrer">Consulter cette formulation ↗</a></details>)}<h3>Le récit · traduction du cours</h3>{chapter===12&&<p className="academy-reference-attribution">La parole citée est celle de Umar, qui rapporte le geste du Prophète.</p>}{narration?narrationBlocks(narration).map((block,index)=>block.type==='speaker'?<h3 key={index}>{block.text}</h3>:<p key={index}><Highlight text={block.text} expression={expression}/></p>):<p>Le texte complet est disponible dans le document du cours.</p>}<p className="academy-evidence-credit">Traduction et attributions : cours de {source.doc.author} · Masjid Sabirin · chapitre {chapter}, pages {source.chapter.start}–{source.chapter.end}.</p>{!arabic&&<p className="academy-evidence-credit">Le document fourni donne ce récit en français. Son texte arabe n’y figure pas.</p>}</section>;
}
function VerseText({reference,expression}:{reference:Extract<CourseReference,{kind:'verse'}>;expression?:string}){
 const [verses,setVerses]=useState<EvidenceVerse[]|null>(null);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;void loadEvidenceVerses(reference).then(data=>{if(active)setVerses(data);}).catch(()=>{if(active)setVerses([]);});return()=>{active=false;};},[reference,attempt]);
 const incomplete=verses&&(!verses.length||verses.some(verse=>!verse.arabic||!verse.translation));
 return <section className="academy-evidence-text" aria-busy={!verses}>
  {!verses?<p role="status">Chargement du texte et de sa traduction…</p>:verses.map(verse=><article className="academy-evidence-verse" key={`${verse.surah}:${verse.ayah}`}><h3>Verset {verse.ayah}</h3>{verse.arabic?<p className="academy-evidence-arabic" lang="ar" dir="rtl">{verse.arabic}</p>:<p>Le texte arabe n’a pas pu être chargé.</p>}{verse.translation?<p><Highlight text={verse.translation} expression={expression}/></p>:<p>La traduction française n’a pas pu être chargée.</p>}{verse.number&&<audio controls preload="none" src={getAudioUrl('ar.alafasy',verse.number)} aria-label={`Écouter le verset ${verse.surah}:${verse.ayah}`} onPlay={event=>{window.dispatchEvent(new Event('quran-stop-playback'));const global=useAudioPlayerStore.getState();if(global.isPlaying||global.isLoading)global.togglePlay();document.querySelectorAll<HTMLAudioElement>('audio').forEach(audio=>{if(audio!==event.currentTarget)audio.pause();});}}/>}</article>)}
  {incomplete&&<div className="academy-evidence-error"><p role="status">Vérifie ta connexion pour charger les éléments manquants. Tu peux aussi ouvrir le passage dans le Mushaf.</p><button onClick={()=>{setVerses(null);setAttempt(value=>value+1);}}>Réessayer</button></div>}
  <p className="academy-evidence-credit">Texte arabe : édition Uthmani · traduction française des sens : Muhammad Hamidullah · services du lecteur Quran Coach / AlQuran Cloud.</p>
  <a className="academy-evidence-source" href={`https://quran.com/${reference.surah}/${reference.ayah}`} target="_blank" rel="noopener noreferrer">Consulter ce passage sur Quran.com ↗</a>
 </section>;
}
