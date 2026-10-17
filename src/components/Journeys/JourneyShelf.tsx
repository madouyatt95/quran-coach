import { Link } from 'react-router-dom';
import { useEditorialJourneyStore } from '../../stores/editorialJourneyStore';
import { getJourney,journeyUrl,type JourneyKind } from '../../lib/editorialJourneys';
import './Journeys.css';
export function JourneyShelf({kind}:{kind:JourneyKind}) {
 const progress=useEditorialJourneyStore(s=>s.progress),notes=useEditorialJourneyStore(s=>s.notes);
 const recent=Object.entries(progress).filter(([key])=>key.startsWith(kind+':')).sort((a,b)=>b[1].updatedAt-a[1].updatedAt).find(([key])=>getJourney(kind,key.split(':')[1]));
 const j=recent?getJourney(kind,recent[0].split(':')[1]):null;
 return <section className="journey-shelf" aria-label="Mes parcours"><div><strong>À votre rythme</strong><span>Lire · écouter · réfléchir</span></div>{j&&recent&&<Link to={journeyUrl(kind,j.id.split(':')[1],'resume')}>Reprendre : {j.title}<small>{recent[1].completed.length}/{j.steps.length} étapes parcourues</small></Link>}<Link to="/journeys/notebook">📓 Mon carnet <small>{Object.keys(notes).length} réflexion{Object.keys(notes).length>1?'s':''}</small></Link></section>;
}
export function JourneyLinks({kind,id}:{kind:JourneyKind;id:string}){return <nav className="journey-links" aria-label="Découvrir ce récit"><Link to={journeyUrl(kind,id)}>📖 Découvrir par épisodes</Link><Link to={journeyUrl(kind,id,'quran')}>📜 Parcourir les versets</Link><Link to={journeyUrl(kind,id,'audio')}>🎧 Parcours audio</Link></nav>;}
