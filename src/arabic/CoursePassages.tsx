import {Link} from 'react-router-dom';
import {useQuranStore} from '../stores/quranStore';
import {useReadingBookmarkStore} from '../stores/readingBookmarkStore';
import {useSRSStore} from '../stores/srsStore';
import {courseOccurrences,occurrenceHref} from './learningConnections';
import './LearningBridges.css';
export function CoursePassages({lessonId}:{lessonId:string}){
 const surah=useQuranStore(s=>s.currentSurah),ayah=useQuranStore(s=>s.currentAyah);
 const bookmark=useReadingBookmarkStore(s=>s.bookmark),cards=useSRSStore(s=>s.cards);
 const priority=[`${surah}:${ayah}`,...(bookmark?[`${bookmark.surah}:${bookmark.ayah}`]:[]),...Object.keys(cards)];
 const occurrences=courseOccurrences(lessonId,priority);
 if(!occurrences.length)return null;
 return <section className="fahm-card"><h2>Retrouver cette notion dans mon Mushaf</h2><p>Ouvrez le passage pour observer le mot dans son contexte.</p><div className="arabic-passages">{occurrences.map(o=><Link className="arabic-passage" key={`${o.key}:${o.position}`} to={occurrenceHref(o)} state={{readerReturn:{to:`/academy/arabic/${lessonId}`,label:'Retour au cours'}}}><span lang="ar" dir="rtl">{o.text}</span><strong>Coran {o.key} · mot {o.position} →</strong><small>{priority.includes(o.key)?'Dans vos lectures ou révisions · ':''}{o.explanation}</small></Link>)}</div></section>;
}
