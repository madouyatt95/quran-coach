import type {AcademyModule} from './data/types';
import {conceptStatus,conceptReviewPriority} from './conceptLearning';
import {conceptKey,useAcademyKnowledgeStore} from '../stores/academyKnowledgeStore';
import {useAcademyStore} from '../stores/academyStore';
import {useAcademyExperienceStore} from '../stores/academyExperienceStore';
export function personalReviewTargets(modules:AcademyModule[],now=Date.now()){
 const knowledge=useAcademyKnowledgeStore.getState().concepts,academy=useAcademyStore.getState(),experience=useAcademyExperienceStore.getState().courses;
 return modules.filter(m=>m.sourceDocument).flatMap(module=>[0,1,2].map(index=>{
  const item=knowledge[conceptKey(module.id,index)],status=conceptStatus(module.id,index,knowledge,academy.progress[module.id]);
  const note=!!(academy.notes[`${module.id}:course-question`]?.trim()||academy.notebook[module.id]?.review?.trim());
  const studied=!!(academy.progress[module.id]?.lastVisitedAt||item?.attempts||experience[module.id]);
  const priority=conceptReviewPriority(item,status,note,now)||(studied?5:0);
  return{id:module.id,index,priority,reason:status==='À revoir'?'Une distinction à reprendre':item?.attempts&&item.due<=now?'Une notion à retrouver après un délai':note?'Une question conservée dans ton carnet':'Un cours que tu as consulté'};
 })).filter(item=>item.priority>0).sort((a,b)=>b.priority-a.priority).slice(0,3);
}
