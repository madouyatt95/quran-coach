import { getQuestionBank, stableQuestionId,generateSiraLevels } from './quizEngine';
import type { QuizQuestion, QuizThemeId } from '../data/quizTypes';
import {QURAN_THEMES} from '../data/themesData';
import { COURSE_LEVELS } from '../academy/data/courseLibrary';
import { courseChallenge } from '../academy/data/courseChallenges';
import { chapterBooks } from '../data/storyChapters';
import { investigationQuestions } from '../data/quizInvestigations';
import { HISNUL_MUSLIM_DATA } from '../data/hisnulMuslim';
export type LearningStage = 'discover'|'understand'|'apply';
export interface LearningQuestion extends QuizQuestion {
 stage:LearningStage; format:'choice'|'order'|'match'|'passage'|'audio';
 passage?:string; items?:string[]; pairs?:Array<[string,string]>;
 feedbacks?:string[]; hint?:string; checkpointId?:string;
 investigation?:{id:string;title:string;step:'Observer'|'Trouver l’indice'|'Justifier'};
 context?:{type:'academy'|'story'|'invocation';id:string};
}
export interface QuizRecall {due:number;last:number;successes:number;seen:number;correct:boolean}
export function recallAnswer(old:QuizRecall|undefined, correct:boolean, certain:boolean, now=Date.now()):QuizRecall {
 const success=correct&&certain;
 const spaced=!old||now>=old.due&&now-old.last>=86400000;
 const successes=success?(old?.successes||0)+(spaced?1:0):0;
 return {last:now,successes,seen:(old?.seen||0)+1,correct:success,due:old&&success&&!spaced?old.due:now+(success?Math.min(14,2**successes):1)*86400000};
}
let cache:LearningQuestion[]|null=null;
export function learningBank():LearningQuestion[]{
 if(cache)return cache;
 const bank:LearningQuestion[]=Object.values(getQuestionBank()).flat().filter(q=>!q.audioUrl&&q.explanation?.trim()).map(q=>({...q,stage:'discover',format:'choice'}));
 const verses=[...new Map(QURAN_THEMES.flatMap(t=>t.verses).map(v=>[`${v.surah}:${v.ayah}`,v])).values()];
 for(const [index,v] of verses.entries()){
  const alternatives=[...new Set(verses.filter(other=>other.textFr!==v.textFr).map(other=>other.textFr))].slice(0,3);
  if(alternatives.length!==3)continue;const choices=[...alternatives];choices.splice(index%4,0,v.textFr);
  bank.push({id:`listen-${v.surah}-${v.ayah}`,theme:'verses',verseRef:{surah:v.surah,ayah:v.ayah},questionFr:'Quel sens correspond à ce verset récité ?',questionAr:v.textAr,choices,correctIndex:index%4,explanation:v.textFr,stage:'understand',format:'audio'});
 }
 const sira=generateSiraLevels();
 for(const [index,items] of [sira.slice(0,3),sira.slice(3,6),sira.slice(6,8)].entries())bank.push({id:`sira-order-${index}`,theme:'stories',questionFr:'Replace ces étapes de la Sira dans l’ordre chronologique.',choices:['Ordre exact'],correctIndex:0,stage:'understand',format:'order',items:items.map(s=>s.title),explanation:items.map(s=>`${s.title} : ${s.year}. ${s.description}`).join('\n'),sourceLink:{label:'Portrait de Muhammad ﷺ',href:'/prophets?prophet=muhammad'}});
 for(const level of COURSE_LEVELS)for(const module of level.modules){
  const theme:QuizThemeId=module.category==='hadith'?'hadiths':'tawhid';
  const sourceLink={label:`Cours : ${module.title}`,href:`/academy?module=${module.id}`};
  const context:LearningQuestion['context']={type:'academy',id:module.id};
  const hint=module.content.flatMap(c=>c.type==='lesson'?c.sections:[])[0]?.body;
  for(const [contentIndex,content] of module.content.entries())if(content.type==='quiz')for(const [i,q] of content.questions.entries())bank.push({id:`course-${module.id}-${contentIndex}-${i}`,theme,questionFr:q.q,choices:q.options,correctIndex:q.answer,explanation:q.explanation,feedbacks:q.feedbacks,hint:q.explanation,format:'choice',stage:contentIndex===1?'discover':'understand',sourceLink,context});
  const challenge=courseChallenge(module.id);
  if(challenge){
   if(challenge.kind==='order')bank.push({id:`apply-${module.id}`,theme,questionFr:challenge.prompt,choices:['Ordre exact'],correctIndex:0,items:challenge.steps,format:'order',stage:'apply',explanation:challenge.explanation,sourceLink,context});
   else bank.push({id:`apply-${module.id}`,theme,questionFr:challenge.prompt,choices:challenge.options,correctIndex:challenge.correct,format:'choice',stage:'apply',explanation:challenge.reasons[challenge.correct],feedbacks:challenge.reasons,hint,sourceLink,context});
  }
  const sections=module.content.flatMap(c=>c.type==='lesson'?c.sections:[]).slice(0,3);
  if(sections.length===3)bank.push({id:`match-${module.id}`,theme,questionFr:'Associe chaque notion à son explication.',choices:['Associations exactes'],correctIndex:0,format:'match',stage:'understand',pairs:sections.map(s=>[s.title,s.body.match(/^.*?[.!?](?:\s|$)/)?.[0].trim()||s.body]),explanation:sections.map(s=>`${s.title} : ${s.body}`).join('\n'),sourceLink,context});
 }
 for(const [key,book] of Object.entries(chapterBooks))for(const chapter of book.chapters){
  const match=chapter.reading.match(/^(\d+):(\d+)/);
  bank.push({id:`story-${key}-${chapter.id}`,theme:key.startsWith('prophet')?'prophets':'stories',questionFr:chapter.question,choices:chapter.options,correctIndex:chapter.answer,explanation:chapter.explanation,format:'passage',stage:'understand',passage:chapter.text,context:{type:'story',id:key},verseRef:match?{surah:Number(match[1]),ayah:Number(match[2])}:undefined,sourceLink:{label:chapter.title,href:`/journeys/${key.replace(':','/')}`}});
 }
 const chapters=HISNUL_MUSLIM_DATA.flatMap(c=>c.chapters);
 for(const chapter of chapters){const dua=chapter.duas[0];if(!dua||!chapter.title.trim()||!dua.translation.trim())continue;
  const choices=[chapter.title,...chapters.filter(c=>c.id!==chapter.id&&c.title.trim()).slice(0,3).map(c=>c.title)];
  const shift=chapter.id.length%choices.length;const mixed=[...choices.slice(shift),...choices.slice(0,shift)];
  bank.push({id:`situation-${chapter.id}`,theme:'invocations',questionFr:'À quelle situation cette invocation est-elle associée ?',questionAr:dua.arabic,passage:dua.translation,choices:mixed,correctIndex:mixed.indexOf(chapter.title),explanation:`${chapter.title} — ${dua.translation}`,stage:'apply',format:'passage',context:{type:'invocation',id:chapter.id},sourceLink:{label:`Invocations : ${chapter.title}`,href:`/adhkar?cat=hisn_${chapter.id}`}});
 }
 for(const q of bank)if(q.context?.type==='academy'){q.checkpointId=bank.find(other=>other.id!==q.id&&other.context?.id===q.context!.id&&other.format==='choice'&&(q.stage==='apply'?other.stage==='discover':other.stage==='apply'))?.id;}
 bank.push(...investigationQuestions());
 cache=[...new Map(bank.map(q=>[q.id,q])).values()];return cache;
}
export interface QuizContext {academy:string[];stories:string[];invocations:string[];verses:string[];surah:number}
export function contextMatches(q:LearningQuestion,c:QuizContext){
 if(q.context?.type==='academy')return c.academy.includes(q.context.id);
 if(q.context?.type==='story')return c.stories.includes(q.context.id);
 if(q.context?.type==='invocation')return c.invocations.some(k=>k.includes(q.context!.id));
 return !!q.verseRef&&(q.verseRef.surah===c.surah||c.verses.includes(`${q.verseRef.surah}:${q.verseRef.ayah}`));
}
export interface LearningOptions {stage?:LearningStage;theme?:QuizThemeId;context?:QuizContext;recalls:Record<string,QuizRecall>;count?:number;now?:number;reviewOnly?:boolean;includeAudio?:boolean;surah?:number;format?:LearningQuestion['format']}
export function learningCandidates(options:LearningOptions):LearningQuestion[]{
 const {stage,theme,context,recalls,now=Date.now(),reviewOnly,includeAudio=false,surah,format}=options;
 return learningBank().filter(q=>!q.investigation&&(!format||q.format===format)&&(includeAudio||q.format!=='audio')&&(!stage||q.stage===stage)&&(!theme||q.theme===theme)&&(!context||contextMatches(q,context))&&(surah===undefined||q.verseRef?.surah===surah)&&(!reviewOnly||(recalls[q.id]&&recalls[q.id].due<=now)));
}
export function buildLearningSession(options:LearningOptions):LearningQuestion[]{
 const {stage,recalls,count=8,now=Date.now(),includeAudio=false}=options;
 const pool=learningCandidates(options);
 // Due recalls first, then fresh questions, then the least recently practiced.
 const ordered=pool.sort((a,b)=>{
  const ra=recalls[a.id],rb=recalls[b.id];const rank=(r:QuizRecall|undefined)=>r&&r.due<=now?0:!r?1:2;
  return rank(ra)-rank(rb)||(ra?.last||0)-(rb?.last||0)||a.id.localeCompare(b.id);
 });
 const selected:LearningQuestion[]=[];
 const stages:LearningStage[]=stage?[stage]:['discover','understand','apply'];
 // Preserve due-first priority while alternating the types of learning.
 for(const due of [true,false]){
  const remaining=ordered.filter(q=>Boolean(recalls[q.id]&&recalls[q.id].due<=now)===due);
  while(remaining.length&&selected.length<count){
   for(const step of stages){const index=remaining.findIndex(q=>q.stage===step);if(index>=0&&selected.length<count)selected.push(...remaining.splice(index,1));}
  }
 }
 if(includeAudio&&!selected.some(q=>q.format==='audio')){const audio=pool.find(q=>q.format==='audio');if(audio){if(selected.length<count)selected.push(audio);else selected[selected.length-1]=audio;}}
 return selected;
}
function fingerprint(q:LearningQuestion){let hash=2166136261;for(const c of JSON.stringify([q.questionFr,q.questionAr,q.choices,q.correctIndex,q.items,q.pairs,q.passage,q.format])){hash=Math.imul(hash^c.charCodeAt(0),16777619);}return (hash>>>0).toString(36);}
export function encodeQuizShare(questions:LearningQuestion[]):string{return `2.${questions.map(q=>encodeURIComponent(q.id)+'.'+fingerprint(q)).join('~')}`;}
export function decodeQuizShare(value:string):LearningQuestion[]|null {
 if(value.length>6000||!value.startsWith('2.'))return null;
 try{const tokens=value.slice(2).split('~');if(tokens.length<1||tokens.length>12||new Set(tokens).size!==tokens.length)return null;const bank=new Map(learningBank().map(q=>[q.id,q]));const result=tokens.map(token=>{const dot=token.lastIndexOf('.');const q=bank.get(decodeURIComponent(token.slice(0,dot)));return q&&fingerprint(q)===token.slice(dot+1)?q:undefined;});return result.every(Boolean)?result as LearningQuestion[]:null;}catch{return null;}
}
export function legacyLearningQuestion(q:QuizQuestion):LearningQuestion{return {...q,id:stableQuestionId(q),stage:'discover',format:'choice'};}
