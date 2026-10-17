import {useState} from 'react';
import {Link} from 'react-router-dom';
import type {MushafWord} from '../lib/interactiveMushaf/model';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {verifiedGrammar,rootOccurrences,wordGrammarSource,grammarCheckId,lessonById} from './data';
import './ArabicLearning.css';
const names={nom:'Nom (ism)',verbe:'Verbe (fiʿl)',particule:'Particule (ḥarf)',composé:'Plusieurs segments'};
export function GrammarExplorer({verseKey,words,onExplore}:{verseKey:string;words:MushafWord[];onExplore?:()=>void}){
 const [selected,setSelected]=useState<number|null>(null),[opened,setOpened]=useState(false);
 const state=useArabicLearningStore(),learning=useFahmLearningStore();
 const data=verifiedGrammar(verseKey,words);
 if(!data)return null;
 const active=data.words.find(w=>w.position===selected);
 const taught=data.words.find(w=>state.drafts[w.lesson]?.complete);
 const check=taught?`application:${verseKey}:${taught.position}`:null;
 const saved=check?learning.drafts[`arabic:${check}`]:null;
 const qChoices=Object.keys(names) as (keyof typeof names)[];
 const word=taught&&words.find(w=>w.position===taught.position);
 return <section className="grammar-explorer fahm-card">
 <details onToggle={e=>{if(e.currentTarget.open){setOpened(true);if(check)learning.draft(`arabic:${check}`,{compared:true});}}}><summary>🔎 Comprendre la construction</summary>
 <p>Choisissez un mot. Les mots qui lui sont liés seront soulignés.</p>
 <label className="arabic-detail-toggle"><input type="checkbox" checked={state.detailed} onChange={e=>state.setDetailed(e.target.checked)}/> Termes et analyse détaillée</label>
 <div className="grammar-words" dir="rtl" lang="ar">{words.map(w=>{const annotation=data.words.find(a=>a.position===w.position);return <button key={w.key} aria-label={`Analyser le mot ${w.position} : ${w.text}`} aria-pressed={selected===w.position} className={`${annotation?`grammar-${annotation.category}`:''} ${active?.related?.includes(w.position)?'grammar-related':''}`} onClick={()=>{setSelected(w.position);onExplore?.();}}>{w.text}</button>;})}</div>
 <p className="grammar-legend">Repères de grammaire : <span>nom</span> · <span>verbe</span> · <span>particule</span>. Le texte du Mushaf reste inchangé.</p>
 {active?<div className="grammar-insight" aria-live="polite"><strong>{names[active.category]}</strong><p>{active.simple}</p>{state.detailed&&<p>{active.detail}</p>}{active.related?.length?<small>Lié aux mots {active.related.join(', ')} de ce verset.</small>:null}
 {active.root&&<div className="grammar-root"><span>Racine</span><b dir="rtl" lang="ar">{active.root}</b>{active.pattern&&<span>Forme : <b dir="rtl">{active.pattern}</b></span>}<p>La racine est une piste : la forme et le contexte précisent le sens.</p><details><summary>Retrouver cette famille dans les passages étudiés</summary>{rootOccurrences(active.root).map(o=><Link key={`${o.key}:${o.position}`} to={`/fahm?surah=${o.key.split(':')[0]}&ayah=${o.key.split(':')[1]}`}><span lang="ar" dir="rtl">{o.text}</span> · Coran {o.key}, mot {o.position}</Link>)}</details></div>}
 <div className="arabic-actions"><Link to={`/academy/arabic/${active.lesson}`}>{state.drafts[active.lesson]?.complete?'Revoir la notion':'Apprendre cette notion'} →</Link><a target="_blank" rel="noreferrer" href={wordGrammarSource(verseKey,active.position)}>Vérifier l’analyse ↗</a></div></div>:<p className="arabic-muted">Touchez un mot pour commencer.</p>}
 <details className="arabic-help"><summary>Précisions sur l’analyse</summary><p>{data.note}</p></details></details>
 {taught&&word&&check&&<div className="grammar-transfer"><strong>Vous avez étudié « {lessonById(taught.lesson)?.title} ».</strong><p>Retrouvez la catégorie de <b dir="rtl" lang="ar">{word.text}</b> dans ce passage.</p><div className="arabic-options">{qChoices.map(category=><button key={category} disabled={saved?.completed} aria-pressed={saved?.choice===category} onClick={()=>{const correct=category===taught.category;learning.draft(`arabic:${check}`,{choice:category,completed:true});const [surah,ayah]=verseKey.split(':').map(Number);learning.check(grammarCheckId(check),{surah,ayah},correct,opened||!!saved?.compared);}}>{names[category]}</button>)}</div>{saved?.completed&&<p role="status">{saved.choice===taught.category?'Bien repéré.':'À revoir.'} {names[taught.category]} : {taught.simple} </p>}</div>}
 </section>;
}
