import type {VerseTarget} from './learning';
export const RECALL_DELAY=24*60*60*1000;
export interface RecallCheck {target:VerseTarget;attempts:number;correct:boolean;assisted:boolean;at:number;due:number;lastFailure:number;retainedAt:number;firstAt:number}
/** A correction in the same sitting is practice, never evidence of delayed recall. */
export function updateRecall(old:RecallCheck|undefined,target:VerseTarget,correct:boolean,assisted:boolean,now=Date.now()):RecallCheck {
 const failure=!correct||assisted;
 const eligible=!!old&&now>=old.due&&now-old.at>=RECALL_DELAY&&now-old.lastFailure>=RECALL_DELAY;
 const retainedAt=failure?0:eligible?now:old?.retainedAt||0;
 // Repeated clicks must not postpone a scheduled review.
 const due=old&&now<old.due&&!failure?old.due:now+(retainedAt?3:1)*RECALL_DELAY;
 return {target,attempts:(old?.attempts||0)+1,correct,assisted,at:now,due,lastFailure:failure?now:old?.lastFailure||0,retainedAt,firstAt:old?.firstAt??now};
}
export type KnowledgeStatus='discovered'|'retained'|'consolidate';
export function knowledgeStatus(checks:RecallCheck[]):KnowledgeStatus {
 if(checks.some(c=>!c.correct||c.assisted||c.lastFailure>c.retainedAt))return 'consolidate';
 if(checks.some(c=>c.retainedAt>0))return 'retained';
 return 'discovered';
}
export const KNOWLEDGE_LABELS={discovered:'Découvert',retained:'Retrouvé sans aide',consolidate:'À consolider'};
export interface ExerciseDraft {stage:number;wordKey:string;choice:string|null;meaningChoice:number|null;evidence:string;compared:boolean;completed:boolean;openedAt:number}
export interface ListeningDraft {seenText:boolean;help:0|1|2;choice:number|null;heard:boolean;wrong:boolean;completed:boolean}
