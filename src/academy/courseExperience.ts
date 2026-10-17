import {COURSE_LEVELS} from './data/courseLibrary';
import {chapterTeaching} from './data/courseExplanations';
import {TAWHID_PLANS,HADITH_PLANS} from './data/coursePedagogy';
import type {EditorialJourney} from '../lib/editorialJourneys';

export function coursePlan(id:string){const match=/^sabirin-(tawhid|hadith)-(\d+)$/.exec(id);return match?(match[1]==='tawhid'?TAWHID_PLANS:HADITH_PLANS)[Number(match[2])-1]:undefined;}
const QUESTIONS:Record<string,string[]>={
 tawhid:['Peut-on connaître les mots de la foi sans comprendre ce que l’on croit ?','Une affirmation répétée par tout le monde devient-elle une preuve ?','Deux textes paraissent se contredire : faut-il en choisir un ?','Pourquoi une idée fausse peut-elle nous paraître convaincante ?','Comment apprendre sans se laisser entraîner par chaque discours ?','Le Tawhîd est-il seulement une formule à prononcer ?','Même message signifie-t-il mêmes prescriptions pour tous les messagers ?','Pourquoi l’attestation comporte-t-elle une négation et une affirmation ?','Reconnaître un Créateur signifie-t-il déjà Lui vouer son adoration ?','Une illustration et une preuve révélée ont-elles le même rôle ?'],
 hadith:['Pourquoi le hadith compare-t-il l’Islam à une construction ?','Dans une seule prière, comment se rencontrent Islam, foi et excellence ?','Deux personnes font le même don : peut-on connaître leur intention ?','Quel lien entre une parole, la pudeur et un obstacle retiré du chemin ?','Pourquoi ne pas tout expliquer à un débutant dès la première fois ?','Une pensée qui surgit est-elle une conviction que l’on a choisie ?','Si le destin est écrit, pourquoi faire des efforts ?','Une réussite actuelle garantit-elle notre issue ?','Comment avancer après un échec sans nier ce qui est arrivé ?','Comment exprimer son amour sans dépasser la place du Messager ?','Comment distinguer le respect des défunts et l’adoration ?','Qui parle à la Pierre noire, et pourquoi suit-il ce geste ?','Pourquoi faut-il connaître la formule exacte avant de parler d’un serment ?','Aimer un bon exemple suffit-il à remplacer les efforts ?','Peut-on respecter une personne tout en répétant des récits non vérifiés ?','La douceur de la foi est-elle seulement une émotion agréable ?','Une bonne intention suffit-elle à rendre toute pratique conforme ?','Comment comprendre un conseil sans isoler deux mots de son contexte ?','Que nous apprend le chemin dessiné, au-delà de son image ?','Notre responsabilité s’arrête-t-elle à ce que nous faisons nous-mêmes ?']};
export function openingQuestion(id:string){const [,subject,number]=id.split('-');return QUESTIONS[subject]?.[Number(number)-1]||'';}
export function courseJourney(id:string):EditorialJourney{
 const course=COURSE_LEVELS.flatMap(level=>level.modules).find(course=>course.id===id)!;
 const teaching=chapterTeaching(id)!,plan=coursePlan(id)!;
 return {id:`academy:${id}`,kind:'story',title:course.title,icon:'📚',lessons:[teaching.takeaway],steps:plan.concepts.map(([title,body],index)=>({
 id:`lesson-${index}`,kind:'narrative',title,text:[index===0?`Prenons le temps d'une question. ${openingQuestion(id)} ${teaching.introduction}`:`Poursuivons avec une nouvelle idée. ${title}.`,body,...teaching.developments[index].split('\n\n'),index===2?`Retenons l'essentiel. ${teaching.takeaway}`:'Garde cette idée en tête. Elle va nous aider à comprendre la suite.'].join('\n\n')
 }))};
}
export const EXPLORATION_ANGLES=['Pourquoi ?','Ne pas confondre','Un exemple','Les preuves','À retenir'] as const;
export function explorationAnswer(id:string,index:number,angle:number){
 const plan=coursePlan(id)!,teaching=chapterTeaching(id)!;
 const paragraphs=teaching.developments[index].split('\n\n');
 if(angle===0)return paragraphs[0];
 if(angle===1)return `${paragraphs[1]}\n\nReviens à cette question : ${openingQuestion(id)}`;
 if(angle===2)return `${plan.scenario}\n\n${plan.explanation}`;
 if(angle===4)return teaching.takeaway;
 return '';
}
