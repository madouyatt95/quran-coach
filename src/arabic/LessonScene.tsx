import {useState} from 'react';
import {lessonById} from './data';
import {GUIDES} from './pedagogy';
import {useArabicAdventureStore} from '../stores/arabicAdventureStore';
import './LearningBridges.css';

/** Only animates authored teaching examples; never rewrites a Quranic string. */
export function LessonScene({lessonId}:{lessonId:string}) {
 const lesson=lessonById(lessonId);
 const [active,setActive]=useState(0),[compare,setCompare]=useState(false);
 const motion=useArabicAdventureStore(s=>s.motion);
 if(!lesson)return null;
 const word=lesson.example[active]||lesson.example[0];
 const contrast=GUIDES[lessonId]?.contrast;
 const cases=['prepositions','idafa','agreement','kana','inna','verbal'].includes(lessonId);
 const units=word.text.match(/\P{M}\p{M}*/gu)||[];
 const ending=units.at(-1)==='ا'&&units.at(-2)?.includes('ً')?units.slice(-2).join(''):units.at(-1);
 const sides=contrast?.arabic.split(/\s*[↔·]\s*/);
 return <section className={`arabic-scene ${motion?'':'arabic-scene-still'}`} aria-label="Observer la construction">
  <span className="fahm-eyebrow">VOIR ET COMPRENDRE</span><h3>La construction prend forme</h3>
  <p>Touchez un mot pour suivre son rôle, puis comparez les exemples.</p>
  <div className="arabic-scene-words" dir="rtl" lang="ar">{lesson.example.map((w,i)=><button key={i} aria-pressed={i===active} onClick={()=>{setActive(i);setCompare(false);}}>{w.text}</button>)}</div>
  <div key={active} className="arabic-scene-insight" aria-live="polite"><strong>{word.label}</strong><p>{word.detail}</p>{cases&&ending&&<div className="arabic-ending"><span>Observer la fin du mot</span><b lang="ar" dir="rtl">{ending}</b></div>}</div>
  <div className="arabic-actions"><button disabled={active===0} onClick={()=>setActive(i=>i-1)}>← Précédent</button><span>{active+1} / {lesson.example.length}</span><button disabled={active>=lesson.example.length-1} onClick={()=>setActive(i=>i+1)}>Suivant →</button></div>
  {contrast&&<><button className="arabic-next-reason" aria-expanded={compare} onClick={()=>setCompare(!compare)}>{compare?'Fermer la comparaison':'Comparer les constructions'}</button>{compare&&<div className="arabic-scene-comparison"><div>{sides?.map((text,i)=><p key={i} lang="ar" dir="rtl">{text.split(' ').map((token,j)=><span key={j} className={sides?.length===2&&!sides[1-i].split(' ').includes(token)?'arabic-changed-token':undefined}>{token}{' '}</span>)}</p>)}</div><p>{contrast.explanation}</p></div>}</>}
 </section>;
}
