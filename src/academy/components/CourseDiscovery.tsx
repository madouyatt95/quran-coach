import {useState} from 'react';
import {openingQuestion,coursePlan,EXPLORATION_ANGLES,explorationAnswer} from '../courseExperience';
import {courseChallenge} from '../data/courseChallenges';
import {courseChapter} from '../data/courseLibrary';
import {chapterTeaching} from '../data/courseExplanations';
import {useAcademyExperienceStore} from '../../stores/academyExperienceStore';
import {CourseReferenceList,CourseReferenceText} from './CourseReferences';

export function CourseOpening({id}:{id:string}){
 const hypothesis=useAcademyExperienceStore(state=>state.courses[id]?.hypothesis||'');
 const update=useAcademyExperienceStore(state=>state.update);
 const [show,setShow]=useState(false);
 return <section className="course-discovery-opening"><span>LA QUESTION QUI GUIDE CE CHAPITRE</span><h2>{openingQuestion(id)}</h2><p>Avant de lire, prends une position. Tu pourras la nuancer à la fin du cours.</p><button onClick={()=>setShow(value=>!value)} aria-expanded={show}>{hypothesis?'Retrouver mon idée de départ':'Poser mon idée de départ'}</button>{show&&<label>Mon idée, avant les explications<textarea value={hypothesis} onChange={event=>update(id,{hypothesis:event.target.value.slice(0,3000)})} placeholder="Je pense que… parce que…"/><small>Pas de note : c’est ton point de départ, enregistré sur cet appareil.</small></label>}</section>;
}
export function CourseConceptMap({id,onRead}:{id:string;onRead:(index:number)=>void}){
 const plan=coursePlan(id)!;
 const node=useAcademyExperienceStore(state=>state.courses[id]?.node||0);
 const update=useAcademyExperienceStore(state=>state.update);
 const body=chapterTeaching(id)!.developments[node].split('\n\n');
 const jibril=id==='sabirin-hadith-2';
 const [example,setExample]=useState(false);
 const labels=jibril?['Ce que je fais','Ce que je crois','Comment j’adore']:plan.concepts.map(([title])=>title);
 return <section className="course-concept-map"><span className="academy-course-eyebrow">VOIR LES LIENS</span><h2>Trois idées à comprendre ensemble</h2><p>Touche une notion pour voir ce qu’elle apporte au chapitre.</p><div className="course-map-nodes" role="group" aria-label="Notions du chapitre">{labels.map((label,index)=><button key={label} aria-pressed={node===index} onClick={()=>update(id,{node:index})}><span>{String(index+1).padStart(2,'0')}</span>{label}</button>)}</div><div className="course-map-detail" aria-live="polite"><h3>{plan.concepts[node][0]}</h3><p><CourseReferenceText text={plan.concepts[node][1]}/></p><p><CourseReferenceText text={body[0]}/></p><button onClick={()=>onRead(node)}>Lire cette explication dans le cours →</button></div>{jibril&&<><button onClick={()=>setExample(value=>!value)} aria-expanded={example}>Appliquer le schéma à une prière</button>{example&&<div className="course-map-example"><strong>{['L’acte accompli','Le sens de l’acte','La qualité de l’acte'][node]}</strong><p>{['La prière fait partie des cinq piliers : ici, on regarde la pratique accomplie.','La prière a un sens pour celui qui croit : les convictions éclairent pourquoi et envers qui il accomplit cet acte.','L’excellence concerne la conscience avec laquelle on adore : le récit enseigne qu’Allah voit le croyant.'][node]}</p><small>Change de notion dans le schéma : une même prière permet d’étudier ces trois dimensions.</small></div>}</>}</section>;
}
export function CourseExplore({id,index,onListen}:{id:string;index:number;onListen:()=>void}){
 const [angle,setAngle]=useState<number|null>(null);
 const explore=useAcademyExperienceStore(state=>state.explore);
 const visited=useAcademyExperienceStore(state=>state.courses[id]?.explored);
 const text=angle===null?'':explorationAnswer(id,index,angle);
 const source=courseChapter(id)!;
 return <div className="course-explore"><span>ALLER PLUS LOIN À PARTIR DE CETTE IDÉE</span><div className="course-explore-choices">{EXPLORATION_ANGLES.map((label,n)=><button key={label} aria-expanded={angle===n} onClick={()=>{setAngle(angle===n?null:n);explore(id,`${index}:${n}`);}}>{label}{visited?.includes(`${index}:${n}`)&&<small aria-label="déjà exploré"> ·</small>}</button>)}</div>{angle!==null&&<div className="course-explore-answer"><h3>{EXPLORATION_ANGLES[angle]}</h3>{angle===3?<><CourseReferenceList scoped concept={index} texts={[chapterTeaching(id)!.developments[index]]}/><p>Retrouve aussi le développement et les références du chapitre dans le cours d’origine, pages {source.chapter.start}–{source.chapter.end}.</p><a className="academy-reference-link" href={`${source.doc.pdf}#page=${source.chapter.start}`} target="_blank" rel="noopener noreferrer">Consulter le texte source ↗</a></>:text.split('\n\n').map((paragraph,n)=><p key={n}><CourseReferenceText text={paragraph}/></p>)}<button onClick={onListen}>Réécouter l’explication de cette notion</button><button onClick={()=>setAngle(null)}>Revenir au fil du cours</button></div>}</div>;
}
export function CourseScenario({id,onRead}:{id:string;onRead:()=>void}){
 const plan=coursePlan(id)!,challenge=courseChallenge(id)!;
 const progress=useAcademyExperienceStore(state=>state.courses[id]);
 const decide=useAcademyExperienceStore(state=>state.decide),update=useAcademyExperienceStore(state=>state.update);
 const [step,setStep]=useState(progress?.decisions.final!==undefined||progress?.sequence.length===3?2:progress?.decisions.start!==undefined?1:0);
 const first=progress?.decisions.start,second=progress?.decisions.final;
 const sequence=progress?.sequence||[];
 const [orderError,setOrderError]=useState(false);
 const final=challenge.kind==='order'?sequence.length===3:second!==undefined;
 const chooseOrder=(n:number)=>{if(n!==sequence.length){setOrderError(true);return;}setOrderError(false);update(id,{sequence:[...sequence,n]});};
 return <section className="course-scenario"><span className="academy-course-eyebrow">UNE SITUATION À EXPLORER · {step+1}/3</span><h2>Que ferais-tu, et pourquoi ?</h2><p>Essaie une démarche, observe son explication et avance jusqu’à ta conclusion.</p>{step===0?<><h3>{plan.scenario}</h3>{plan.choices.map((choice,n)=><button key={choice} className={first===n?'chosen':''} onClick={()=>decide(id,'start',n)}>{choice}</button>)}{first!==undefined&&<div role="status"><strong>{first===plan.answer?'Cette démarche va dans le sens du cours.':'Cette piste mérite d’être reprise.'}</strong><p>{plan.explanation}</p><p>{first===plan.answer?'Voyons maintenant si tu peux expliquer ce choix dans une autre situation.':'Reviens au raisonnement avant de décider. Tu peux consulter le cours, puis modifier ta réponse.'}</p>{first!==plan.answer&&<button onClick={onRead}>Retrouver les explications</button>}<button onClick={()=>setStep(1)}>Examiner la suite →</button></div>}</>:step===1?<><h3>{challenge.prompt}</h3>{challenge.kind==='order'?<><ol>{sequence.map(n=><li key={n}>{challenge.steps[n]}</li>)}</ol>{[2,0,1].filter(n=>!sequence.includes(n)).map(n=><button key={n} onClick={()=>chooseOrder(n)}>{challenge.steps[n]}</button>)}{orderError&&<p role="status">Cette étape vient après. Cherche d’abord ce qui permet de comprendre la suivante.</p>}{final&&<p>{challenge.explanation}</p>}</>:<>{challenge.options.map((choice,n)=><button key={choice} className={second===n?'chosen':''} onClick={()=>decide(id,'final',n)}>{choice}</button>)}{second!==undefined&&<p role="status">{challenge.reasons[second]}{second!==challenge.correct&&` Le repère à retrouver est : ${challenge.reasons[challenge.correct]}`}</p>}</>}{final&&<button onClick={()=>setStep(2)}>Construire ma conclusion →</button>}<button onClick={()=>setStep(0)}>Revoir mon premier choix</button></>:<><h3>Ton raisonnement, étape par étape</h3><p>Au départ : {first===undefined?'pas encore de choix':plan.choices[first]}</p><p>{plan.explanation}</p><p>{challenge.kind==='order'?challenge.explanation:second===undefined?'':challenge.reasons[second]}</p><label>Ce que cette situation m’a appris<textarea value={progress?.conclusion||''} onChange={event=>update(id,{conclusion:event.target.value.slice(0,3000)})} placeholder="Je retiens que… La différence que j’ai comprise est…"/></label><button onClick={()=>setStep(0)}>Explorer un autre choix</button><p className="course-personal-note">Tu peux réutiliser cette conclusion dans ton projet personnel ci-dessous.</p></>}</section>;
}
