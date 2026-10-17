import type {LearningQuestion} from './quizLearning';

export interface AnswerDetail {choice?:number; pairs?:number[]; order?:number[]; assisted?:boolean}
export interface PedagogicalAnswer {id:string;correct:boolean;certain:boolean;response:string;detail?:AnswerDetail}

/** Fisher–Yates on indices: answers keep their canonical IDs, regardless of display order. */
export function shuffledIndices(length:number,random= Math.random):number[]{
 const values=Array.from({length},(_,i)=>i);
 for(let i=length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[values[i],values[j]]=[values[j],values[i]];}
 return values;
}
export function assignPair(pairs:Record<number,number>,left:number,right:number){
 return {...Object.fromEntries(Object.entries(pairs).filter(([key,value])=>Number(key)!==left&&value!==right)),[left]:right};
}
export function sameNotion(a:LearningQuestion,b:LearningQuestion){
 if(a.context||b.context)return !!a.context&&!!b.context&&a.context.type===b.context.type&&a.context.id===b.context.id;
 if(a.verseRef||b.verseRef)return !!a.verseRef&&!!b.verseRef&&a.verseRef.surah===b.verseRef.surah&&a.verseRef.ayah===b.verseRef.ayah;
 return a.theme===b.theme;
}
/** Adjust only the unanswered tail; the caller supplies a pool respecting all active filters. */
export function adaptNext(questions:LearningQuestion[],index:number,answers:PedagogicalAnswer[],pool:LearningQuestion[]){
 const result={questions,note:'',support:false};
 if(index+1>=questions.length)return result;
 const last=answers.at(-1),current=questions[index];
 if(!last)return result;
 const needsHelp=!last.correct||!last.certain;
 const readyToApply=answers.length>=2&&answers.slice(-2).every(a=>a.correct&&a.certain);
 if(!needsHelp&&!readyToApply)return result;
 const used=new Set(questions.slice(0,index+1).map(q=>q.id));
 const eligible=pool.filter(q=>!used.has(q.id)&&!q.investigation);
 const candidates=needsHelp?eligible.filter(q=>sameNotion(current,q)&&q.stage!=='apply'):eligible.filter(q=>q.stage==='apply');
 candidates.sort((a,b)=>Number(sameNotion(current,b))-Number(sameNotion(current,a)));
 const candidate=candidates[0];if(!candidate)return result;
 const tail=questions.slice(index+1).filter(q=>q.id!==candidate.id);
 const updated=[...questions.slice(0,index+1),candidate,...tail].slice(0,questions.length);
 return {questions:updated,support:needsHelp,note:needsHelp?'Un autre angle sur cette notion, avec une aide si nécessaire.':'Deux réponses assurées : essaie maintenant une mise en pratique.'};
}
export function answerFeedback(q:LearningQuestion,answer:PedagogicalAnswer):string[]{
 if(answer.correct)return [];
 const detail=answer.detail;
 if(q.format==='match'&&detail?.pairs)return q.pairs!.flatMap(([label,body],i)=>detail.pairs![i]===i?[]:[`« ${label} » : tu as associé « ${q.pairs![detail.pairs![i]]?.[1]||'Sans réponse'} ». À distinguer : ${body}`]);
 if(q.format==='order'&&detail?.order){const first=detail.order.findIndex((value,i)=>value!==i);return first<0?[]:[`À la place ${first+1}, tu as choisi « ${q.items![detail.order[first]]} ». L’étape attendue est « ${q.items![first]} ». ${q.explanation||''}`];}
 const choice=detail?.choice??q.choices.indexOf(answer.response);
 return q.feedbacks?.[choice]?[q.feedbacks[choice]]:[];
}
