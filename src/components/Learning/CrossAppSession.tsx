import {useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {usePersonalJourneyStore} from '../../stores/personalJourneyStore';
import {useAcademyStore} from '../../stores/academyStore';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useQuranStore} from '../../stores/quranStore';
import {fitDailyActivities} from '../../lib/dailyActivities';
import catalog from '../../data/bookCatalog.json';
import './Learning.css';
export function CrossAppSession(){
 const store=usePersonalJourneyStore(),academy=useAcademyStore(),library=useAudioLibraryStore(),page=useQuranStore(s=>s.currentPage);
 const [minutes,setMinutes]=useState(15),[replanning,setReplanning]=useState(false);
 const session=store.session,active=session?.activities.find(a=>!a.done);
 const prepare=()=>{
  const bookId=Object.entries(library.bookReadingUpdatedAt).sort((a,b)=>b[1]-a[1])[0]?.[0]||'adam';
  const book=catalog.find(b=>b.id===bookId)||catalog[0];
  const chapter=library.bookReading[book.id]||book.chapters[0].id;
  const course=academy.currentModule;
  store.start(minutes,fitDailyActivities(minutes,[
   {id:'read',title:'Retrouver mon Mushaf',href:`/read?page=${page||1}`,minutes:3},
   {id:'review',title:'Retrouver ce que j’ai appris',href:'/learning/review',minutes:2},
   {id:'course',title:course?'Continuer mon cours':'Choisir mon premier cours',href:course?`/academy?module=${encodeURIComponent(course)}`:'/academy',minutes:5},
   {id:'book',title:`Lire ou écouter · ${book.title}`,href:`/books/${book.id}?chapter=${encodeURIComponent(chapter)}`,minutes:5},
   {id:'fahm',title:'Comprendre un passage avec Fahm',href:'/fahm',minutes:5},
  ]));setReplanning(false);
 };
 return <section className="learning-card learning-hero"><span className="learning-kicker">Un fil pour votre journée</span><h2>Ma séance, dans toute l’application</h2>
 {(!session||replanning)?<><p>Choisissez une durée indicative. Chaque étape reste disponible si vous faites une pause.</p><div className="learning-actions">{[5,10,15,20].map(n=><button className="learning-btn" key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)}>{n} min</button>)}</div><button className="learning-btn primary" onClick={prepare}>Préparer mon programme</button>{session&&<button className="learning-btn" onClick={()=>setReplanning(false)}>Conserver ma séance</button>}</>:<><progress className="learning-progress" value={session.activities.filter(a=>a.done).length} max={session.activities.length}/>{session.activities.map(a=><div className="learning-step" key={a.id}><span>{a.done?'✓':'○'}</span><Link to={a.href}>{a.title}</Link><small>≈ {a.minutes} min</small></div>)}{active?<Link className="learning-btn primary" to={active.href}>Continuer · {active.title}</Link>:<p>Séance terminée. Retrouvez vos révisions dans les prochains jours.</p>}{active&&<button className="learning-btn" onClick={()=>store.complete(active.id)}>J’ai effectué cette étape</button>}<button className="learning-btn" onClick={()=>setReplanning(true)}>Préparer une autre séance</button></>}
 </section>;
}
/** A deliberate acknowledgement avoids counting a page opening as learning. */
export function SessionReturn(){
 const session=usePersonalJourneyStore(s=>s.session),complete=usePersonalJourneyStore(s=>s.complete),location=useLocation();
 const step=session?.activities.find(a=>!a.done);
 if(!step||location.pathname==='/learning'||location.pathname==='/read'||location.pathname.startsWith('/admin'))return null;
 const target=new URL(step.href,'https://quran-coach.fr');
 if(location.pathname!==target.pathname)return null;
 const currentQuery=new URLSearchParams(location.search);
 if([...target.searchParams].some(([key,value])=>currentQuery.get(key)!==value))return null;
 return <aside className="session-return"><span>Ma séance · {step.title}</span><button onClick={()=>complete(step.id)}>Étape effectuée</button><Link to="/learning">Suite →</Link></aside>;
}
