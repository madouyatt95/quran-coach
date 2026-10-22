import {learningBank,type LearningQuestion} from './quizLearning';
import {COURSE_LEVELS} from '../academy/data/courseLibrary';
import {chapterBooks} from '../data/storyChapters';
import {validTarget} from './fahm/learning';
export const QUIZ_ACTIVITIES=[
 {id:'order',icon:'🗓️',title:'Remettre dans l’ordre',description:'Récits et étapes à reconstruire'},
 {id:'invocation',icon:'🤲',title:'La bonne invocation',description:'Retrouver la situation correspondante'},
 {id:'audio',icon:'🎧',title:'Reconnaître à l’écoute',description:'Une récitation, une sourate'},
 {id:'vocabulary',icon:'🔤',title:'Les mots et leur sens',description:'Associer les cartes arabe et français'},
 {id:'spot',icon:'🔎',title:'Trouver l’erreur',description:'Repérer une confusion et la comprendre'},
] as const;
export function resolveQuizLaunch(params:URLSearchParams):{title:string;questions:LearningQuestion[];returnTo?:string}{
 const source=params.get('source'),scope=params.get('scope')||'',exercise=params.get('exercise');
 const bank=learningBank();let title='Exercices',pool:LearningQuestion[]=[],returnTo:string|undefined;
 if(source==='academy'){
  const module=COURSE_LEVELS.flatMap(l=>l.modules).find(m=>m.id===scope);
  if(module){title=module.title;pool=bank.filter(q=>q.context?.type==='academy'&&q.context.id===scope&&!q.investigation);returnTo=`/academy?module=${encodeURIComponent(scope)}`;}
 }else if(source==='story'){
  if(chapterBooks[scope]){title='Ce que je retiens du récit';pool=bank.filter(q=>q.context?.type==='story'&&q.context.id===scope&&!q.investigation);returnTo=`/journeys/${scope.replace(':','/')}`;}
 }else if(source==='fahm'){
  const keys=scope.split(',');
  if(keys.length<=286&&keys.every(key=>/^\d+:\d+$/.test(key)&&validTarget(...key.split(':').map(Number) as [number,number]))){
   const selected=new Set(keys);title='Ce que je retiens de Fahm';pool=bank.filter(q=>q.id.startsWith('fahm-meaning-')&&q.verseRef&&selected.has(`${q.verseRef.surah}:${q.verseRef.ayah}`));returnTo='/fahm';
  }
 }else if(exercise){
  const activity=QUIZ_ACTIVITIES.find(a=>a.id===exercise);title=activity?.title||'Exercice introuvable';
  if(activity)pool=bank.filter(q=>!q.investigation&&(exercise==='vocabulary'||exercise==='invocation'?q.activity===exercise:q.format===exercise&&(exercise!=='audio'||!!q.audioUrl)));
 }
 // Never accept an external return URL; preserve the exact lesson/reader position when supplied.
 const requested=params.get('return');
 if(returnTo&&requested&&/^\/(?:academy(?:\?|$)|prophets(?:\?|$)|stories(?:\?|$)|journeys\/(?:prophet|story)\/|fahm(?:\/|\?|$))/.test(requested)&&!/[\\\r\n]/.test(requested))returnTo=requested;
 return {title,questions:pool,returnTo};
}
