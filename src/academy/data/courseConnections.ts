import {COURSE_LEVELS} from './courseLibrary';

export interface CourseConnection {to:string;title:string;reason:string;section:number;}
export interface CourseReturn {moduleId:string;title:string;section:number;}
type ConnectionSpec=[target:string,section:number,reason:string];

// Curated from the concepts of the two supplied Sabirin courses. These links
// relate lessons; they do not assert a new religious proof or a learner score.
const CONNECTIONS:Record<string,ConnectionSpec[]>={
 T1:[
  ['H2',1,'Retrouve les six éléments de la foi dans les questions du hadith de Jibril.'],
  ['H4',1,'Observe comment la croyance s’exprime aussi par des paroles et des actes.'],
  ['T2',0,'Passe de « ce que je crois » à la recherche des textes qui fondent cette croyance.']],
 T2:[
  ['T3',0,'Apprends à réunir les textes d’un sujet avant d’en tirer une conclusion.'],
  ['H17',1,'Applique la recherche des preuves à la conformité d’une œuvre.'],
  ['H20',2,'Comprends pourquoi vérifier une source compte aussi avant de la partager.']],
 T3:[
  ['H12',1,'Exerce la précision de la transmission en distinguant la parole de Umar de celle du Prophète.'],
  ['H18',1,'Étudie un cas où le sens des termes dépend des explications du cours.'],
  ['T2',1,'Reviens à la place de la Sunna et du consensus parmi les sources étudiées.']],
 T4:[
  ['T5',0,'Relie l’ignorance et le suivi aveugle aux moyens d’apprendre et de vérifier.'],
  ['H10',1,'Retrouve la limite entre respect et exagération dans les éloges du Prophète.'],
  ['H15',2,'Applique la vérification et un langage respectueux aux récits sur les compagnons.']],
 T5:[
  ['H5',1,'Découvre comment un enseignement progressif aide à comprendre les bases.'],
  ['H9',2,'Transforme une voie protectrice en une action utile et accessible.'],
  ['H20',2,'Prolonge la recherche de la science par une transmission vérifiée.']],
 T6:[
  ['T8',2,'Précise les catégories du Tawhîd après avoir étudié son sens général.'],
  ['H4',1,'Retrouve le lien entre le cœur, les paroles et les actes dans les branches de la foi.'],
  ['H3',0,'Examine ce que le cœur recherche lorsqu’une conviction devient une action.']],
 T7:[
  ['T8',1,'Relie le message commun des messagers à l’affirmation de l’adoration d’Allah seul.'],
  ['H1',0,'Étudie ensuite les cinq piliers exposés dans le hadith d’Ibn Umar.'],
  ['H5',0,'Observe la place donnée au Tawhîd dans le récit de l’envoi de Muadh.']],
 T8:[
  ['T9',1,'Approfondis la distinction entre reconnaître la seigneurie et vouer l’adoration.'],
  ['H13',1,'Travaille un exemple où les mots et le contexte du serment doivent être distingués.'],
  ['T6',0,'Reviens au sens du Tawhîd pour relier les catégories à leur définition.']],
 T9:[
  ['H11',1,'Retrouve la protection de l’adoration dans l’explication des lieux de prière.'],
  ['H12',1,'Étudie pourquoi Umar suit un exemple sans attribuer à l’objet un pouvoir autonome.'],
  ['T8',2,'Replace la seigneurie et l’adoration dans les catégories étudiées.']],
 T10:[
  ['T2',2,'Reviens à la place de la saine nature et de la raison dans l’étude de la croyance.'],
  ['H6',1,'Distingue une réflexion choisie d’une insinuation qui surgit.'],
  ['H9',0,'Relie les exemples de demande d’aide à un enseignement qui associe aide et action utile.']],
 H1:[
  ['H2',0,'Replace les cinq piliers dans les degrés de la religion expliqués par Jibril.'],
  ['H3',0,'Approfondis la question de l’intention qui accompagne une pratique visible.'],
  ['T7',2,'Distingue la base commune des messagers des prescriptions de leurs législations.']],
 H2:[
  ['T1',1,'Développe la liste des six éléments de la foi évoquée dans ce hadith.'],
  ['H1',0,'Retrouve l’énumération des cinq piliers et leur place de fondation.'],
  ['H16',1,'Prolonge l’étude de la qualité de l’adoration par les qualités liées à la douceur de la foi.']],
 H3:[
  ['H17',1,'Complète la question « pourquoi agir ? » par « l’œuvre est-elle conforme ? ».'],
  ['H12',2,'Observe un acte dont Umar explique la raison et le modèle suivi.'],
  ['H16',2,'Relie tes intentions aux qualités et aux comportements travaillés dans ce hadith.']],
 H4:[
  ['T6',2,'Reviens au lien entre conviction, parole et acte dans l’étude du Tawhîd.'],
  ['H1',1,'Distingue la diversité des œuvres de la place particulière des cinq piliers.'],
  ['H9',2,'Choisis une action utile pour mettre une branche de la foi en pratique.']],
 H5:[
  ['T1',0,'Retrouve une base de croyance à expliquer avant d’en développer les conséquences.'],
  ['T5',0,'Relie l’enseignement progressif à la recherche de la science.'],
  ['H20',1,'Poursuis avec la responsabilité de l’influence exercée sur ceux qui apprennent.']],
 H6:[
  ['T2',2,'Retrouve la place de la raison et la nécessité d’étudier les preuves.'],
  ['T10',1,'Travaille un raisonnement expliqué, en distinguant illustration et preuve citée.'],
  ['H9',0,'Reprends un enseignement qui associe demande d’aide et action utile.']],
 H7:[
  ['H8',1,'Approfondis la distinction entre croire au destin et prétendre connaître son issue.'],
  ['H9',1,'Relie l’ordre d’œuvrer à l’effort avant l’événement et à l’acceptation après celui-ci.'],
  ['T1',1,'Replace la foi au destin parmi les six éléments de la foi.']],
 H8:[
  ['H7',0,'Retrouve l’ordre d’œuvrer pour comprendre les conséquences pratiques de la foi au destin.'],
  ['H9',2,'Transforme la vigilance en une action utile avec des moyens concrets.'],
  ['T1',1,'Reviens à la place du destin dans l’ensemble des éléments de la foi.']],
 H9:[
  ['H7',2,'Retrouve une application de l’ordre d’œuvrer dans une action accessible aujourd’hui.'],
  ['H3',2,'Clarifie l’objectif de cette action avant de préparer ses moyens.'],
  ['T5',2,'Relie les efforts utiles aux effets de l’apprentissage dans la vie quotidienne.']],
 H10:[
  ['T4',2,'Replace l’exagération dans les mécanismes étudiés par le cours de croyance.'],
  ['H14',1,'Approfondis la manière dont l’amour d’un modèle encourage à suivre ses qualités.'],
  ['H12',1,'Observe un exemple précis de suivi du Prophète dans le récit de Umar.']],
 H11:[
  ['T9',1,'Approfondis le sens de vouer l’adoration et sa différence avec une simple reconnaissance.'],
  ['T4',2,'Relie la protection de l’adoration à la mise en garde contre l’exagération.'],
  ['H10',1,'Travaille la limite entre respect et attribution d’une qualité divine.']],
 H12:[
  ['H17',1,'Prolonge le suivi de l’exemple prophétique par la question de la conformité des œuvres.'],
  ['T3',1,'Replace la parole de Umar dans l’étude de la transmission et de la compréhension.'],
  ['H3',1,'Examine pourquoi le geste visible ne révèle pas à lui seul la raison d’agir.']],
 H13:[
  ['T8',1,'Relie la question du serment à l’affirmation de l’adoration d’Allah seul.'],
  ['H3',1,'Retrouve pourquoi l’expression visible et l’intention ne sont pas interchangeables.'],
  ['T3',0,'Reprends la méthode qui réunit les textes et leurs précisions avant de conclure.']],
 H14:[
  ['H10',1,'Distingue l’amour et le respect de l’exagération dans la place donnée à un modèle.'],
  ['H16',0,'Retrouve l’amour dans les trois qualités liées à la douceur de la foi.'],
  ['H15',2,'Apprends à parler des compagnons en vérifiant ce que tu rapportes.']],
 H15:[
  ['T3',1,'Approfondis la place des compagnons dans la compréhension et la transmission.'],
  ['H12',1,'Travaille l’attribution exacte d’une parole à Umar.'],
  ['H20',2,'Relie le respect de la transmission à la vérification avant de partager.']],
 H16:[
  ['H14',2,'Transforme l’amour d’un modèle en une qualité à imiter.'],
  ['H2',2,'Replace la qualité de l’adoration dans les degrés de la religion.'],
  ['H3',2,'Clarifie ce que tu recherches par un comportement ou une œuvre.']],
 H17:[
  ['H3',0,'Étudie l’intention comme une question complémentaire à la conformité.'],
  ['T2',1,'Reviens à la Sunna parmi les sources utilisées pour étudier une pratique.'],
  ['H18',1,'Approfondis les termes tradition et innovation dans les explications du cours.']],
 H18:[
  ['H17',1,'Relie l’attachement à la Sunna à l’examen de la conformité d’une œuvre.'],
  ['T3',0,'Réunis les explications d’un sujet pour ne pas isoler une expression.'],
  ['H19',0,'Prolonge les conseils par l’image de la direction suivie dans ses choix.']],
 H19:[
  ['T5',2,'Transforme l’orientation étudiée en une voie protectrice mise en pratique.'],
  ['H18',2,'Retrouve des conseils pour examiner la direction de tes habitudes.'],
  ['H20',1,'Examine aussi l’influence de cette direction sur les actes des autres.']],
 H20:[
  ['H5',1,'Approfondis la manière de transmettre progressivement en tenant compte de la personne.'],
  ['T2',0,'Reviens à la recherche d’une source avant de diffuser une affirmation.'],
  ['H15',2,'Applique cette responsabilité à ce que tu rapportes sur une personne du passé.']],
};

const modules=COURSE_LEVELS.flatMap(level=>level.modules);
const byId=new Map(modules.map(module=>[module.id,module]));
const fullId=(short:string)=>`sabirin-${short[0]==='T'?'tawhid':'hadith'}-${short.slice(1)}`;

/** The order follows the chapter's three concepts. A section prioritizes its
 * curated link; the other two stay available for voluntary exploration. */
export function courseConnections(id:string,index?:number):CourseConnection[]{
 if(!byId.has(id))return [];
 const short=id.replace('sabirin-tawhid-','T').replace('sabirin-hadith-','H');
 const specs=CONNECTIONS[short];
 if(!specs)return [];
 const ordered=index!==undefined&&Number.isInteger(index)&&index>=0&&index<specs.length?[specs[index],...specs.filter((_,position)=>position!==index)]:specs;
 return ordered.map(([target,section,reason])=>{
  const to=fullId(target),lesson=byId.get(to)?.content[0];
  return {to,section,reason,title:lesson?.type==='lesson'?lesson.sections[section]?.title||'': ''};
 });
}

export function courseHref(id:string,section:number){return `/academy?module=${encodeURIComponent(id)}&section=${section}`;}

/** Return targets are derived from the catalog, never arbitrary URLs in state. */
export function courseReturnFrom(state:unknown):CourseReturn|null{
 if(!state||typeof state!=='object'||!('courseReturn' in state))return null;
 const candidate=state.courseReturn;
 if(!candidate||typeof candidate!=='object'||!('moduleId' in candidate)||!('section' in candidate)||typeof candidate.moduleId!=='string'||typeof candidate.section!=='number'||!Number.isInteger(candidate.section))return null;
 const module=byId.get(candidate.moduleId),lesson=module?.content[0];
 if(!module||lesson?.type!=='lesson'||!lesson.sections[candidate.section])return null;
 return {moduleId:module.id,title:module.title,section:candidate.section};
}

export function courseDestinationTitle(id:string){return byId.get(id)?.title||'';}
