import {lazy,Suspense} from 'react';
import {Link} from 'react-router-dom';
import {ReligiousReference} from '../ReligiousReference';
import {countEvidence,invocationGlossary,normalizeInvocation,quranReference,type Invocation} from '../../lib/adhkarExperience';
const StoryContextButton=lazy(()=>import('../Journeys/StoryContextButton'));
export function InvocationUnderstanding({invocation:d}:{invocation:Invocation}){
 const evidence=countEvidence(d),verse=quranReference(d),words=normalizeInvocation(d.arabic).split(' ');
 const glossary=invocationGlossary.filter(g=>words.some(w=>w===g.arabic||w===g.arabic+'نا'||w===g.arabic+'ي'||w==='و'+g.arabic));
 return <details className="inv-details"><summary>📖 Comprendre cette invocation</summary><div className="inv-details-body">
 <h3>Le sens</h3><p>{d.translation}</p>
 {glossary.length>0&&<><h3>Quelques expressions</h3><dl>{glossary.map(g=><div key={g.arabic}><dt>{g.label}</dt><dd>{g.meaning}</dd></div>)}</dl></>}
 <h3>Dans quel contexte ?</h3><p>{d.hisnReference?`Cette entrée figure dans les invocations du matin et du soir de la Citadelle du musulman${d.categoryId==='morning'?' ; la formule affichée est celle du matin':d.categoryId==='evening'?' ; la formule affichée est celle du soir':''}.`:verse?'Cette formule est extraite d’un passage coranique. Le lien ci-dessous permet de retrouver son contexte.':`Vous la retrouvez dans « ${d.categoryName} ». La référence ci-dessous précise son origine ; ce classement ne définit pas à lui seul un moment ou un nombre prescrit.`}</p>
 {d.note&&<p>{d.note}</p>}
 <h3>Nombre de répétitions</h3><p>{evidence?.description||'Le compteur est un objectif personnel de séance. Aucun nombre prescrit n’est déduit de la référence affichée.'}</p>
 <ReligiousReference kind={verse?'Verset':'Invocation'} source={d.source} sourceUrl={d.sourceUrl}/>
 {verse&&<div className="inv-context-links"><Link to={`/read?surah=${verse.surah}&ayah=${verse.ayah}`}>Lire dans le Mushaf ↗</Link><Link to={`/hifdh?surah=${verse.surah}&ayah=${verse.ayah}`}>Mémoriser ce passage</Link><Suspense fallback={null}><StoryContextButton verseKey={`${verse.surah}:${verse.ayah}`}/></Suspense></div>}
 </div></details>;
}
