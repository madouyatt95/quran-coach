import {useEffect,useMemo} from 'react';
import {useSearchParams} from 'react-router-dom';
import {bookOrigins} from '../../lib/bookLibrary';
import {getJourney,referenceVerses} from '../../lib/editorialJourneys';
import {useEditorialJourneyStore} from '../../stores/editorialJourneyStore';
import {JourneyReflection} from '../Journeys/JourneyReflection';
import {StoryReview} from '../Journeys/StoryReview';
import {QuizBridge} from '../Quiz/QuizBridge';
import {useOpenReader} from '../../hooks/useOpenReader';
import '../Journeys/Journeys.css';
/** Keep original journey keys: notes, reviews and completed steps remain on the device. */
export default function BookDeepening({bookId}:{bookId:string}){
 const [params]=useSearchParams(),progress=useEditorialJourneyStore(s=>s.progress),openReader=useOpenReader('Approfondir le récit');
 const journeys=useMemo(()=>[...new Set(bookOrigins[bookId]||[])].flatMap(url=>{const parsed=new URL(url,'https://quran-coach.fr');const kind=parsed.pathname==='/prophets'?'prophet':parsed.pathname==='/stories'?'story':null;const id=kind?parsed.searchParams.get(kind):null;const journey=kind&&id?getJourney(kind,id):null;return journey?[journey]:[];}),[bookId]);
 const study=params.get('study');
 useEffect(()=>{if(study){const frame=requestAnimationFrame(()=>document.getElementById('approfondir')?.scrollIntoView({block:'start'}));return()=>cancelAnimationFrame(frame);}},[study]);
 if(!journeys.length)return null;
 return <section id="approfondir" className="book-deepening" aria-label="Approfondir le livre"><h2>Approfondir</h2><p>Retrouver les passages, réfléchir et vérifier ce que l’on a retenu.</p>{journeys.map(journey=><details key={journey.id} open={params.get('study')===journey.id||undefined}><summary>{journey.title} · enseignements et exercices</summary>{progress[journey.id]&&<p>{progress[journey.id].completed.length} étapes déjà parcourues. Votre progression est conservée.</p>}<ul>{journey.lessons.map(lesson=><li key={lesson}>{lesson}</li>)}</ul>{!!journey.chapters?.length&&<StoryReview journey={journey} revisitLabel="Lire le passage source" onRevisit={id=>{const chapter=journey.chapters?.find(c=>`chapter-${c.id}`===id);const verse=chapter?referenceVerses(chapter.reading||chapter.reference)[0]:undefined;if(verse)openReader(verse);}}/>}<details><summary>Retrouver les versets associés</summary><div className="book-passage-actions">{journey.steps.filter(s=>s.kind==='verse').map(step=><button key={step.id} onClick={()=>openReader({surah:step.surah!,ayah:step.ayah!})}>{step.title}</button>)}</div></details><JourneyReflection journey={journey}/>{!!journey.chapters?.length&&<QuizBridge source="story" id={journey.id}/>}</details>)}</section>;
}
