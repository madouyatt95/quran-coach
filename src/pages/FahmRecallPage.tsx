import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {fahmWords,loadFahmVerse} from '../lib/fahm/content';
import {FAHM_MEANING} from '../lib/fahm/meaning';
import type {MushafWord} from '../lib/interactiveMushaf/model';
import {verseKey,normalizeFahmWord} from '../lib/fahm/learning';
import './FahmExperience.css';
export function FahmRecallPage(){
 const store=useFahmLearningStore();
 const [queue]=useState(()=>Object.entries(store.checks).filter(([id,c])=>(id.startsWith('word:')||id.startsWith('meaning:')||id.startsWith('transfer:'))&&c.due<=Date.now()).sort((a,b)=>a[1].due-b[1].due));
 const [index,setIndex]=useState(0),item=queue[index];
 return <main className="fahm-shell"><Link to="/fahm">← Fahm</Link><h1>Retrouver sans aide</h1><p>Une question déjà rencontrée, au moins un jour plus tard. Répondez avant de rouvrir son explication.</p>{item?<RecallQuestion key={item[0]} id={item[0]} target={item[1].target} onNext={()=>setIndex(n=>n+1)} position={`${index+1} / ${queue.length}`}/>:<section className="fahm-card"><h2>{queue.length?'Rappels terminés':'Aucun rappel arrivé à échéance'}</h2><p>Vos prochaines révisions apparaîtront ici au moment prévu.</p><Link to="/fahm">Voir mes acquis →</Link></section>}</main>;
}
function RecallQuestion({id,target,onNext,position}:{id:string;target:{surah:number;ayah:number};onNext:()=>void;position:string}){
 const store=useFahmLearningStore(),[words,setWords]=useState<MushafWord[]|null>(null),[error,setError]=useState(false),[retry,setRetry]=useState(0),[choice,setChoice]=useState<string|null>(null);
 const transfer=id.startsWith('transfer:'),[source,setSource]=useState<MushafWord|null>(null);
 const q=id.startsWith('meaning:')?FAHM_MEANING[verseKey(target)]:null;
 useEffect(()=>{if(q)return;let gone=false;void (async()=>{const w=await loadFahmVerse(target).then(fahmWords);if(transfer){const [,s,a,p]=id.split(':');const sw=await loadFahmVerse({surah:Number(s),ayah:Number(a)}).then(fahmWords);const found=sw.find(v=>v.position===Number(p));if(!found)throw Error();if(!gone)setSource(found);}if(!gone)setWords(w);})().catch(()=>{if(!gone)setError(true);});return()=>{gone=true;};},[target,q,retry,id,transfer]);
 const word=words?.find(w=>w.key===id.slice(5));
 const options=q?q.options:transfer?Array.from(new Set((words||[]).map(w=>w.text))):word?.french?[...new Set([word.french,...(words||[]).flatMap(w=>w.french?[w.french]:[])])].slice(0,3).sort((a,b)=>a.localeCompare(b)):[];
 const answer=q?q.options[q.answer]:transfer?words?.find(w=>normalizeFahmWord(w.text)===normalizeFahmWord(source?.text||''))?.text:word?.french;
 if(error)return <div role="alert">Chargement impossible. <button onClick={()=>{setError(false);setRetry(n=>n+1);}}>Réessayer</button><button onClick={onNext}>Passer pour le moment</button></div>;
 if(!q&&!words)return <p role="status">Chargement du rappel…</p>;
 if(options.length<2)return <section className="fahm-card"><p>Les données de ce rappel ne sont pas disponibles.</p><button onClick={onNext}>Passer pour le moment</button></section>;
 return <section className="fahm-card"><span className="fahm-eyebrow">{position} · CORAN {verseKey(target)}</span><h2>{q?.question||(transfer?'Quel mot du nouveau passage correspond à celui-ci ?':'Retrouvez le sens de ce mot dans le passage étudié.')}</h2>{(word||source)&&<p className="fahm-study-arabic" dir="rtl" lang="ar">{(source||word)!.text}</p>}<div className="fahm-choices">{options.map(o=><button key={o} lang={transfer?'ar':undefined} dir={transfer?'rtl':undefined} disabled={choice!==null} aria-pressed={choice===o} onClick={()=>{setChoice(o);store.check(id,target,o===answer);}}>{o}</button>)}</div>{choice!==null&&<><p role="status">{choice===answer?'Retrouvé sans aide.':'À consolider.'} {q?.explanation||`Le sens associé est « ${answer} ».`}</p><button className="fahm-primary" onClick={onNext}>Rappel suivant →</button></>}<Link to={`/fahm?surah=${target.surah}&ayah=${target.ayah}`} onClick={()=>{if(choice===null)store.check(id,target,false,true);}}>J’ai besoin de revoir le passage</Link></section>;
}
