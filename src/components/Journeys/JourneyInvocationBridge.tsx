import {Link} from 'react-router-dom';
import {journeyInvocationLinks} from '../../data/journeyInvocationLinks';
import {invocationByKey} from '../../lib/adhkarExperience';
import {useAdhkarExperienceStore} from '../../stores/adhkarExperienceStore';
import {getJourney} from '../../lib/editorialJourneys';
import {useOpenReader} from '../../hooks/useOpenReader';
export function JourneyInvocationBridge({journeyId,onPause}:{journeyId:string;onPause:()=>void}){
 const links=journeyInvocationLinks.filter(link=>link.journeys.some(id=>id===journeyId)),openReader=useOpenReader('Du récit à l’invocation');
 if(!links.length)return null;
 return <section className="journey-invocation-bridge"><span className="journey-kicker">DU RÉCIT À LA PRATIQUE</span>{links.map(link=>{const invocation=invocationByKey.get(link.key);if(!invocation)return null;return <div key={link.key}><h3>{link.label}</h3><p>Retrouvez le passage, puis apprenez l’invocation à votre rythme.</p><div className="journey-bridge-actions"><button onClick={()=>{onPause();openReader({surah:link.surah,ayah:link.ayah});}}>📖 Lire {link.reference}</button><Link to={`/adhkar?cat=${invocation.categoryId}&dua=${encodeURIComponent(link.key)}`} onClick={()=>{onPause();useAdhkarExperienceStore.getState().configure({mode:'learn'});}}>🤲 Apprendre l’invocation</Link><a href={`https://quran.com/${link.surah}/${link.ayah}`} target="_blank" rel="noreferrer">Source ↗</a></div></div>;})}</section>;
}
export function InvocationJourneyLinks({invocationKey}:{invocationKey:string}){
 const links=journeyInvocationLinks.filter(link=>link.key===invocationKey).flatMap(link=>link.journeys).map(id=>getJourney(...id.split(':') as [string,string])).filter(j=>!!j);
 if(!links.length)return null;
 return <details className="inv-details"><summary>📖 Découvrir le récit de cette invocation</summary><div className="inv-details-body">{links.map(j=><Link key={j.id} to={`/journeys/${j.kind}/${j.id.split(':')[1]}`}>{j.title} →</Link>)}<p>Votre position dans le récit est conservée.</p></div></details>;
}
