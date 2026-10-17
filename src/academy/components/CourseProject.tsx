import {useState} from 'react';
import {useAcademyExperienceStore} from '../../stores/academyExperienceStore';
import {useAcademyStore} from '../../stores/academyStore';
import {coursePlan} from '../courseExperience';
import {courseChapter} from '../data/courseLibrary';
import {CourseOral} from './CourseOral';
export function CourseProject({id}:{id:string}){
 const plan=coursePlan(id)!,source=courseChapter(id)!;
 const progress=useAcademyExperienceStore(state=>state.courses[id]);
 const explain=useAcademyExperienceStore(state=>state.explain);
 const [status,setStatus]=useState('');
 const meaningful=plan.concepts.some((_,index)=>progress?.explanationByNode[index]?.trim())||progress?.conclusion?.trim();
 const body=()=>[source.chapter.title,`Mon idée de départ : ${progress?.hypothesis||'À compléter'}`,...plan.concepts.map(([title],index)=>`${title}\n${progress?.explanationByNode[index]||'À compléter'}`),`Ma conclusion\n${progress?.conclusion||'À compléter'}`,`Source étudiée : ${source.doc.author}, ${source.doc.title}, chapitre ${source.chapter.number}, pages ${source.chapter.start}–${source.chapter.end}.`].join('\n\n');
 const save=()=>{const store=useAcademyStore.getState();const previous=store.notebook[id]?.understood||'';const text=body();const combined=previous.includes(text)?previous:[previous,text].filter(Boolean).join('\n\n');if(combined.length>3000){setStatus('Ta synthèse complète reste enregistrée dans ce projet. Le champ du carnet est trop court pour l’ajouter sans tronquer tes notes : tu peux télécharger la fiche.');return;}store.saveNotebook(id,'understood',combined);setStatus('Synthèse ajoutée à ton carnet. Tes notes précédentes sont conservées.');};
 const download=()=>{const url=URL.createObjectURL(new Blob([body()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${id}-ma-synthese.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="course-project"><span className="academy-course-eyebrow">MON PROJET PERSONNEL</span><h2>Construire mon explication du chapitre</h2><p>Au terme de ce cours, garde une fiche que tu pourrais expliquer à un proche. Écris les liens entre les idées avec tes propres mots.</p>{progress?.hypothesis&&<blockquote><small>Au début, je pensais…</small><p>{progress.hypothesis}</p></blockquote>}<div className="course-project-map">{plan.concepts.map(([title],index)=><label key={title}><span>{index+1}. {title}</span><textarea value={progress?.explanationByNode[index]||''} onChange={event=>explain(id,index,event.target.value)} placeholder="Ma définition, mon exemple et le lien avec les autres idées…"/></label>)}</div>{progress?.conclusion&&<div className="course-project-conclusion"><h3>Après la situation, je retiens…</h3><p>{progress.conclusion}</p></div>}<div className="course-project-actions"><button disabled={!meaningful} onClick={save}>Ajouter ma synthèse au carnet</button><button disabled={!meaningful} onClick={download}>Télécharger ma fiche</button></div>{status&&<p role="status">{status}</p>}<small>Ta fiche et tes réponses sont enregistrées au fur et à mesure sur cet appareil.</small><CourseOral key={id} id={id}/></section>;
}
