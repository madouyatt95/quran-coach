/** Exercises reuse the authored Fahm questions and vocabulary, without generated religious text. */
import type {LearningQuestion} from '../lib/quizLearning';
import {FAHM_MEANING} from '../lib/fahm/meaning';
import {QURAN_VOCABULARY} from './quranVocabulary';
import {validExamples} from '../lib/fahm/learning';
// Contrasts paraphrase the same verses as the existing Fahm lessons; no new quotations.
const FATIHA_REASONS:Record<string,[string,string]>={
 '1:1':['Le verset nomme Allah et les attributs de miséricorde : c’est l’ouverture étudiée.','Il ne présente pas les personnages d’un récit. Les noms ici qualifient Allah.'],
 '1:2':['Les mondes ne sont pas les destinataires de la louange : Allah est présenté comme leur Seigneur.','La louange est adressée à Allah ; la suite du verset Le qualifie comme Seigneur des mondes.'],
 '1:3':['Les deux attributs expriment la miséricorde, déjà présente dans l’ouverture.','Adam n’est pas mentionné dans ce verset. Il s’agit des attributs de miséricorde.'],
 '1:4':['Le passage ne nomme pas une fête : il évoque la rétribution.','Le Jour de la rétribution est la référence explicite du verset.'],
 '1:5':['Les deux propositions unissent l’adoration vouée à Allah et la demande de Son secours.','Les anges ne sont pas les destinataires de ces deux propositions : elles s’adressent à Allah.'],
 '1:6':['La demande est celle de la guidance dans le droit chemin.','La richesse n’est pas l’objet de la demande formulée dans ce verset.'],
 '1:7':['Le verset poursuit la demande de guidance ; il ne commence pas un récit indépendant.','Il précise le chemin demandé au verset précédent. Les deux versets se lisent ensemble.'],
};
export function practiceQuestions():LearningQuestion[]{
 const result:LearningQuestion[]=Object.entries(FAHM_MEANING).map(([key,item])=>{
  const [surah,ayah]=key.split(':').map(Number);
  return {id:`fahm-meaning-${key}`,theme:'verses',stage:'understand',format:'choice',questionFr:item.question,choices:[...item.options],correctIndex:item.answer,explanation:item.explanation,feedbacks:FATIHA_REASONS[key],verseRef:{surah,ayah},sourceLink:{label:`Relire le passage ${key}`,href:`/passage?surah=${surah}&ayah=${ayah}&from=quiz`}};
 });
 const words=QURAN_VOCABULARY.filter(w=>validExamples(w).length);
 for(let i=0;i+2<words.length;i+=3){
  const group=words.slice(i,i+3);
  if(new Set(group.map(w=>w.meaningFr)).size!==3||new Set(group.map(w=>w.arabic)).size!==3)continue;
  result.push({id:`vocabulary-match-${group.map(w=>w.id).join('-')}`,theme:'verses',stage:'understand',format:'match',activity:'vocabulary',questionFr:'Relie chaque mot arabe à son sens dans le lexique.',choices:['Associations exactes'],correctIndex:0,pairs:group.map(w=>[w.arabic,w.meaningFr]),pairRefs:group.map(w=>{const e=validExamples(w)[0];return {surah:e.surah,ayah:e.ayah};}),explanation:group.map(w=>`${w.arabic} (${w.transliteration}) : ${w.meaningFr}. Exemple : ${validExamples(w)[0].surah}:${validExamples(w)[0].ayah}.`).join('\n'),sourceLink:{label:'Explorer le vocabulaire et ses exemples',href:'/vocab'}});
 }
 return result;
}
