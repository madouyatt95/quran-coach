import {conceptKey,type ConceptKnowledge} from '../stores/academyKnowledgeStore';
import type {ModuleProgress} from '../stores/academyStore';
export type ConceptStatus='À découvrir'|'À revoir'|'Compris'|'Consolidé';
export function conceptStatus(id:string,index:number,concepts:Record<string,ConceptKnowledge>,progress?:ModuleProgress):ConceptStatus {
 const item=concepts[conceptKey(id,index)];
 if(item?.attempts)return item.lastCorrect?(item.confirmedAt?'Consolidé':'Compris'):'À revoir';
 const old=progress?.answers?.[`${id}:1:${index}`];
 return old===undefined?'À découvrir':old===index?'Compris':'À revoir';
}
export function conceptReviewPriority(item:ConceptKnowledge|undefined,status:ConceptStatus,hasNote:boolean,now:number){
 if(status==='À revoir')return 100+(item?.mistakes||0);
 if(item?.attempts&&item.due<=now)return 60+(now-item.due)/86400000;
 if(hasNote)return 40;
 return status==='Compris'?10:0;
}
