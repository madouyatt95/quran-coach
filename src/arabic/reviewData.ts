import {ARABIC_LESSONS,VERSE_GRAMMAR,grammarCheckId} from './data';
import corpus from '../lib/fahm/context-corpus.json';
import type {RecallCheck} from '../lib/fahm/recall';
import type {GrammarQuestion} from './types';
const categories=['nom','verbe','particule','composé'];
export const ARABIC_QUESTIONS=ARABIC_LESSONS.flatMap(l=>l.questions.map(q=>({...q,target:l.target,lesson:l.id}))).concat(Object.entries(VERSE_GRAMMAR).flatMap(([key,v])=>v.words.map(w=>{
 const [surah,ayah]=key.split(':').map(Number),text=(corpus as Record<string,string[]>)[key][w.position-1];
 const q:GrammarQuestion={id:`application:${key}:${w.position}`,skill:'category',prompt:`Coran ${key} : quelle est la catégorie de ${text} ?`,options:['Nom (ism)','Verbe (fiʿl)','Particule (ḥarf)','Plusieurs segments'],answer:categories.indexOf(w.category),explanation:w.simple};
 return{...q,target:{surah,ayah},lesson:w.lesson};
})));
export const arabicReviewItems=(checks:Record<string,RecallCheck>,now:number)=>ARABIC_QUESTIONS.filter(q=>checks[grammarCheckId(q.id)]?.due<=now);
