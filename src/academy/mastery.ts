import type {ModuleProgress} from '../stores/academyStore';
import type {CourseChallenge} from './data/courseChallenges';
export type MasteryLevel='Découvert'|'Compris'|'Consolidé';
export function masteryLevel(progress?:ModuleProgress,confirmation?:{confirmedAt?:number}):MasteryLevel{
 if(confirmation?.confirmedAt)return 'Consolidé';
 return progress?.completed?'Compris':'Découvert';
}
export function masteryDue(progress?:ModuleProgress,confirmation?:{due:number;confirmedAt?:number},now=Date.now()){
 if(!progress?.completed||confirmation?.confirmedAt)return false;
 return (confirmation?.due??progress.reviewDue??((progress.completedAt||0)+86400000))<=now;
}
export function transferQuestion(challenge:CourseChallenge){
 if(challenge.kind==='order')return {q:`Plus tard, tu reprends la démarche « ${challenge.prompt} ». Quel est le premier pas ?`,options:[challenge.steps[2],challenge.steps[0],challenge.steps[1]],answer:1,explanation:challenge.explanation};
 return {q:`Après la leçon, retrouve la distinction : ${challenge.prompt}`,options:challenge.options,answer:challenge.correct,explanation:challenge.reasons[challenge.correct]};
}
