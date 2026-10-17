import {useState} from 'react';
import {orderedJourneyVerses,type EditorialJourney} from '../../lib/editorialJourneys';
export function StoryVerseMap({journey,onSelect}:{journey:EditorialJourney;onSelect:(id:string)=>void}){
 const [order,setOrder]=useState<'story'|'quran'>('story');
 const verses=orderedJourneyVerses(journey,order);if(!verses.length)return null;
 return <details className="story-verse-map"><summary>Ce récit à travers le Coran · {new Set(verses.map(v=>v.surah)).size} sourate(s)</summary><div className="story-map-order"><button aria-pressed={order==='story'} onClick={()=>setOrder('story')}>Ordre du parcours</button><button aria-pressed={order==='quran'} onClick={()=>setOrder('quran')}>Ordre du Coran</button></div><p>Les versets proposés accompagnent les chapitres ; le passage complet reste accessible à chaque étape. L’ordre du parcours est pédagogique.</p><ol>{verses.map((v,i)=>{const prev=verses[i-1],chapter=journey.chapters?.find(c=>c.id===v.chapterId);return <li key={v.id}>{(!prev||prev.chapterId!==v.chapterId)&&chapter&&<><strong>{chapter.title}</strong><p>{chapter.insight}</p><a href={`https://quran.com/${chapter.reference.replace(':','/')}`} target="_blank" rel="noreferrer">Passage complet · {chapter.reference} ↗</a></>}<button onClick={()=>onSelect(v.id)}>{v.title} →</button></li>;})}</ol></details>;
}
