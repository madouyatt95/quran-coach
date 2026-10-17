import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Bookmark,BookmarkCheck} from 'lucide-react';
import {chapterBooks,STORY_COLLECTIONS} from '../../data/storyChapters';
import {getJourney,journeyUrl,readingMinutes,type JourneyKind} from '../../lib/editorialJourneys';
import {useStoryLibraryStore} from '../../stores/storyLibraryStore';
import {useEditorialJourneyStore} from '../../stores/editorialJourneyStore';
import './Journeys.css';
export function StoryLibrary({kind}:{kind:JourneyKind}){
 const [collection,setCollection]=useState('all'),[now]=useState(()=>Date.now());
 const {later,reviews,toggleLater}=useStoryLibraryStore();const progress=useEditorialJourneyStore(s=>s.progress);
 const all=Object.keys(chapterBooks).filter(k=>k.startsWith(kind+':'));
 const keys=collection==='later'?later.filter(k=>k.startsWith(kind+':')):collection==='review'?Object.keys(reviews).filter(k=>k.startsWith(kind+':')&&reviews[k].dueAt<=now):all.filter(k=>collection==='all'||chapterBooks[k].collection===collection);
 const recent=Object.entries(progress).filter(([k])=>k.startsWith(kind+':')).sort((a,b)=>b[1].updatedAt-a[1].updatedAt).find(([k])=>{const [type,id]=k.split(':');const j=getJourney(type,id);return j&&j.steps.some(step=>!progress[k].completed.includes(step.id));});
 const resume=recent?getJourney(kind,recent[0].split(':')[1]):null;
 return <section className="story-library" aria-label="Bibliothèque de parcours">
 {resume&&<Link className="story-library-resume" to={journeyUrl(kind,resume.id.split(':')[1],'resume')}><span>CONTINUER MON HISTOIRE</span><strong>{resume.icon} {resume.title}</strong><small>{resume.steps.find(s=>s.id===recent?.[1].step)?.title||'Retrouver mon parcours'} →</small></Link>}
 <div className="story-library-heading"><div><span className="journey-kicker">PRENDRE LE TEMPS DE COMPRENDRE</span><h2>Des histoires à parcourir</h2></div><Link to="/journeys/notebook">📓 Carnet</Link></div>
 <div className="story-library-tabs" aria-label="Collections"><button aria-pressed={collection==='all'} onClick={()=>setCollection('all')}>À explorer</button>{STORY_COLLECTIONS.map(c=><button key={c.id} aria-pressed={collection===c.id} onClick={()=>setCollection(c.id)}>{c.icon} {c.title}</button>)}<button aria-pressed={collection==='later'} onClick={()=>setCollection('later')}>À lire plus tard</button><button aria-pressed={collection==='review'} onClick={()=>setCollection('review')}>À redécouvrir</button></div>
 {STORY_COLLECTIONS.find(c=>c.id===collection)&&<p className="story-library-description">{STORY_COLLECTIONS.find(c=>c.id===collection)?.description}</p>}
 <div className="story-library-grid">{keys.map(key=>{const j=getJourney(kind,key.split(':')[1]);if(!j)return null;const done=j.steps.filter(s=>progress[key]?.completed.includes(s.id)).length;return <article className="story-library-card" key={key}><Link to={journeyUrl(kind,key.split(':')[1],collection==='review'?'review':'story')}><span className="story-library-icon">{j.icon}</span><h3>{j.title}</h3><p>{j.intro||'Un récit, ses passages et un temps de réflexion.'}</p><small>{j.chapters?.length||j.steps.filter(s=>s.kind==='narrative').length} chapitres · récit ≈ {readingMinutes(j)} min</small>{done>0&&<progress value={done} max={j.steps.length} aria-label={`Progression ${j.title}`}/>}</Link><button aria-label={`${later.includes(key)?'Retirer':'Garder'} ${j.title} ${later.includes(key)?'de la liste':'pour plus tard'}`} aria-pressed={later.includes(key)} onClick={()=>toggleLater(key)}>{later.includes(key)?<BookmarkCheck size={17}/>:<Bookmark size={17}/>}</button></article>;})}</div>
 {keys.length===0&&<p className="story-library-empty">{collection==='review'?'Les parcours révisés reviendront ici après trois jours. Vous pouvez les relire à tout moment.':collection==='later'?'Gardez une histoire avec le signet pour la retrouver ici.':'Aucun parcours dans cette collection pour le moment.'}</p>}
 <p className="story-library-catalog">Le catalogue complet est disponible ci-dessous.</p>
 </section>;
}
