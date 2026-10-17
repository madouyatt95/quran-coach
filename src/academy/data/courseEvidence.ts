import chapters from '../../lib/interactiveMushaf/chapters.json';
import verifiedArabic from './hadithArabicVerified.json';
import {courseChapter} from './courseLibrary';
import {HADITH_PLANS} from './coursePedagogy';
import {referenceParts,referenceKey,chapterReferences,type CourseReference} from '../courseReferences';
import {fetchAyah,fetchSurahTranslation} from '../../lib/quranApi';
import {HADITHS_NAWAWI} from '../../data/hadithsNawawi';

export interface EvidenceTeaching {expression:string;explanation:string;question:string;concept?:number}
const evidence=(expression:string,explanation:string,question:string,concept?:number):EvidenceTeaching=>({expression,explanation,question,concept});
/** Teaching paraphrases tied to verses explicitly present in the supplied chapter.
 * Expressions are reading cues, never substitute Quran text or a new translation. */
const VERSE_TEACHING:Record<string,Record<string,EvidenceTeaching>>={
 'sabirin-tawhid-1':{
  '49:15':evidence('ne doutent point','Le cours cite ce passage pour éclairer l’idée d’une conviction ferme. Observe que le verset relie aussi la foi à l’engagement : la conviction n’est pas présentée comme un simple mot appris.','Comment le passage relie-t-il la conviction et l’action ?',0),
  '2:285':evidence('Ses anges','Ce verset rassemble plusieurs éléments de la foi. Le cours les met en relation avec le hadith de Jibrîl. La foi au destin figure dans ce hadith : il ne faut pas prétendre que chacun des six éléments est énuméré dans ce seul verset.','Quels éléments peux-tu retrouver ici, et lequel demandes-tu au hadith de Jibrîl ?',1),
  '18:110':evidence('une bonne action','Le cours s’appuie sur la fin du verset pour relier la croyance à l’œuvre bonne et à l’adoration vouée à Allah. Ce lien explique pourquoi l’étude de la croyance concerne la manière d’agir.','Quelles exigences le passage réunit-il à propos de l’action ?',2),
 },
 'sabirin-tawhid-2':{
  '15:9':evidence('gardien','Ce passage est cité dans l’étude du Coran comme source. Le cours évoque sa préservation : c’est une question sur le texte transmis, distincte d’une opinion personnelle à son sujet.','Quelle différence fais-tu entre le texte transmis et une interprétation personnelle ?',0),
  '59:7':evidence('Prenez','Le cours mobilise cette parole dans l’étude de la place de la Sunna. Lire la prescription et vérifier comment le support l’explique aide à distinguer la source d’une simple habitude.','Comment le cours rattache-t-il la Sunna à ce passage ?',1),
  '30:30':evidence('nature','Le passage est cité pour la fitra, la disposition naturelle évoquée dans le cours. Cette notion n’est pas équivalente à toute préférence ressentie par une personne.','Pourquoi une préférence personnelle ne suffit-elle pas à définir la fitra ?',2),
 },
 'sabirin-tawhid-3':{
  '33:36':evidence('le choix','Ce passage accompagne la priorité donnée à ce qu’Allah et Son messager ont décidé. Le cours expose ensuite une méthode qui réunit les textes pertinents et leurs explications, au lieu de conclure à partir d’une citation isolée.','Comment le cours prolonge-t-il cette priorité par sa méthode d’étude ?',0),
  '4:115':evidence('le sentier des croyants','Ce passage est cité au sujet de la compréhension transmise. Le cours l’utilise pour expliquer que l’étude ne se limite pas à une impression individuelle devant une phrase.','Quelle place le cours donne-t-il à la compréhension transmise ?',1),
  '12:2':evidence('arabe','Le passage rappelle la langue du Coran. Le cours invite à vérifier le sens des termes dans leur langue et leur contexte plutôt qu’à conclure à partir d’une équivalence approximative.','Que faut-il vérifier lorsqu’un mot traduit te semble ambigu ?',2),
 },
 'sabirin-tawhid-4':{
  '7:179':evidence('ne comprennent pas','Le cours cite le passage dans son étude des obstacles à la compréhension. Il invite à distinguer le fait de posséder des moyens d’apprendre et le fait de les employer.','Quel moyen concret pourrais-tu utiliser pour comprendre une notion encore floue ?',0),
  '43:22':evidence('ancêtres','Le cours l’emploie pour examiner l’attachement à une habitude héritée. Une affirmation répétée dans un groupe doit encore être comprise et reliée à son fondement.','Quel élément manque lorsqu’on justifie une idée uniquement par l’habitude ?',1),
  '4:171':evidence('N’exagérez pas','Le passage est cité dans la mise en garde contre l’exagération. Le cours distingue le respect dû aux personnes et le fait de leur attribuer ce qui ne leur appartient pas.','Comment exprimer du respect tout en conservant cette distinction ?',2),
 },
 'sabirin-tawhid-5':{
  '47:19':evidence('Sache','Le cours cite ce début de prescription pour mettre en avant la connaissance. Comprendre une notion précède la capacité de l’expliquer et de la mettre en pratique.','Que changes-tu dans ta méthode d’étude en commençant par comprendre ?',0),
  '16:43':evidence('Demandez','Le cours cite cette parole pour expliquer le recours à ceux qui savent. Formuler une question précise et demander une explication fondée est une démarche d’apprentissage.','Quelle question précise poserais-tu à propos de ta difficulté ?',1),
  '16:99':evidence('placent leur confiance','Ce passage est mobilisé dans l’étude des voies protectrices. Il relie la foi et la confiance en Allah ; le cours invite à transformer les voies étudiées en habitudes concrètes.','Quelle voie protectrice du chapitre répond à la difficulté que tu rencontres ?',2),
 },
 'sabirin-tawhid-6':{
  '2:163':evidence('Dieu unique','Le cours cite ce passage pour le sens du Tawhîd. Il concerne l’unicité d’Allah et aide à préciser à qui l’adoration est réservée.','Quelle question sur l’adoration cette unicité éclaire-t-elle ?',0),
  '47:19':evidence('Sache','Ce passage accompagne la place de la connaissance et de la formule du Tawhîd. Le cours relie la conviction, le sens compris et la parole exprimée.','Pourquoi prononcer une formule et comprendre son sens sont-ils deux étapes liées ?',1),
  '51:56':evidence('adorent','Le cours cite le passage pour la finalité de l’adoration. Cette dimension donne un prolongement concret à l’étude du Tawhîd.','Comment la définition étudiée se prolonge-t-elle dans les actes ?',2),
 },
 'sabirin-tawhid-7':{
  '2:136':evidence('ne faisons aucune distinction','Le cours rapproche les messagers et les révélations cités pour expliquer une base commune. Il faut conserver les exemples du passage sans en déduire l’identité de toutes les prescriptions.','Quelle unité le cours étudie-t-il ici ?',0),
  '3:67':evidence('musulman','Ce passage sur Ibrahim accompagne l’explication de l’Islam au sens de soumission à Allah. Le sens du terme dépend du contexte étudié.','Quel sens du mot Islam est travaillé dans ce chapitre ?',1),
  '5:48':evidence('une législation','Le cours s’appuie sur ce passage pour distinguer une base commune et des législations différentes. Ces deux idées se complètent dans son explication.','Comment peux-tu expliquer les deux idées ensemble ?',2),
 },
 'sabirin-tawhid-8':{
  '16:36':evidence('écartez-vous','L’appel cité comporte deux mouvements : l’adoration d’Allah et l’écartement du tâghout. Le cours l’utilise pour expliquer la complémentarité de la négation et de l’affirmation.','Peux-tu repérer les deux mouvements sans réduire le passage à un seul ?',0),
  '4:36':evidence('Adorez Allah','Le cours cite cette prescription pour l’adoration réservée à Allah. L’affirmation et l’absence d’association doivent être lues ensemble.','Que perd-on si l’on ne retient qu’une moitié de cette prescription ?',1),
  '7:54':evidence('la création','Le passage est cité dans l’étude de la seigneurie. Le cours rassemble la création, la royauté et l’administration ; il les distingue des actes d’adoration du croyant.','Cette parole décrit-elle ce qui appartient à Allah ou un acte accompli par le croyant ?',2),
 },
 'sabirin-tawhid-9':{
  '31:25':evidence('créé les cieux','Le cours cite la réponse rapportée pour distinguer la reconnaissance du Créateur et l’orientation de l’adoration. Reconnaître et adorer ne sont pas deux expressions interchangeables.','À laquelle de ces deux questions ce passage répond-il directement ?',0),
  '2:165':evidence('amour','Le chapitre présente l’amour d’Allah parmi les effets de la reconnaissance de Sa seigneurie. Il relie une conviction à une orientation du cœur, sans traiter la reconnaissance et l’adoration comme des expressions interchangeables.','Comment une conviction peut-elle éclairer l’orientation du cœur ?',1),
  '2:164':evidence('signes','Le cours cite ces signes dans son étude des effets de la foi. Observer un exemple et expliquer le raisonnement qui le relie au sujet aide à dépasser la simple mémorisation.','Choisis un signe du passage et explique son lien avec la leçon.',2),
 },
 'sabirin-tawhid-10':{
  '30:30':evidence('nature','Le cours mobilise le passage dans la famille de preuves liée à la fitra. Il faut d’abord comprendre cette notion avant de la comparer à la réflexion ou aux exemples de réponse à l’invocation.','À quelle famille le cours rattache-t-il ce passage ?',0),
  '52:35':evidence('créateurs','Le cours explicite les questions du passage pour exposer son raisonnement sur la création. Lis aussi le verset suivant, cité avec lui dans le support. L’exemple du bateau est une illustration pédagogique distincte de ces paroles coraniques.','Quelles possibilités le raisonnement du cours examine-t-il ?',1),
  '27:62':evidence('angoissé','Le cours cite la réponse à l’invocation parmi les exemples de la troisième famille de preuves qu’il nomme « ressenti ». Ce classement décrit la méthode du support.','Comment ce passage est-il classé dans le chapitre ?',2),
 },
};

const HADITH_EXPRESSIONS=[
 'bâti sur cinq','l’excellence','intentions','ôter ce qui est nuisible','S’ils t’obéissent','cherche refuge','Œuvrez','subsistance','Veille à ce qui t’est utile','serviteur d’Allah','Ne prenez donc pas les tombes','Si je n’avais pas vu','qu’il jure par Allah','Tu seras avec celui que tu aimes','N’insultez pas mes compagnons','douceur de la foi','conforme à notre voie','accrochez-vous','Ceci est le chemin d’Allah','appelle à la droiture',
];

export function evidenceTeaching(moduleId:string,reference:CourseReference):EvidenceTeaching|null{
 if(reference.kind==='verse')return VERSE_TEACHING[moduleId]?.[`${reference.surah}:${reference.ayah}`]||null;
 const plan=HADITH_PLANS[reference.chapter-1];
 if(!plan)return null;
 return evidence(HADITH_EXPRESSIONS[reference.chapter-1],`${plan.concepts[0][1]} ${plan.concepts[1][1]}`,reference.chapter===12?'Qui parle, et quel geste explique-t-il ?':`Comment ce récit éclaire-t-il « ${plan.concepts[1][0]} » ?`);
}

export function courseEvidenceReferences(moduleId:string,concept?:number):CourseReference[]{
 const source=courseChapter(moduleId);if(!source)return [];
 if(source.doc.subject==='hadith')return [{kind:'hadith',chapter:source.chapter.number}];
 const actual=chapterReferences(moduleId);
 return Object.entries(VERSE_TEACHING[moduleId]||{}).filter(([,teaching])=>concept===undefined||teaching.concept===concept).map(([key])=>{
  const [surah,ayah]=key.split(':').map(Number);
  return actual.find(reference=>reference.kind==='verse'&&reference.surah===surah&&reference.ayah===ayah)||{kind:'verse' as const,surah,ayah};
 });
}

/** Locate the exact citation in the current supplied chapter, never a random
 * neighbouring chapter. The excerpt stays identified as the author's prose. */
export function evidenceSourceContext(moduleId:string,reference:CourseReference):{page:number;text:string}|null{
 const source=courseChapter(moduleId);if(!source)return null;
 const key=referenceKey(reference);
 for(const page of source.pages){
  const parts=referenceParts(page.text,moduleId);let position=0;
  for(const part of parts){
   if(part.reference&&referenceKey(part.reference)===key){
    const start=Math.max(0,position-280),end=Math.min(page.text.length,position+part.text.length+620);
    return {page:page.page,text:`${start?'… ':''}${page.text.slice(start,end).replace(/\s+/g,' ').trim()}${end<page.text.length?' …':''}`};
   }
   position+=part.text.length;
  }
 }
 return null;
}

export interface EvidenceVerse {surah:number;ayah:number;number?:number;arabic?:string;translation?:string}
async function bounded<T>(promise:Promise<T>):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Texte indisponible')),16000);})]);}
 finally{if(timer)clearTimeout(timer);}
}
export async function loadEvidenceVerses(reference:Extract<CourseReference,{kind:'verse'}>):Promise<EvidenceVerse[]>{
 const chapter=chapters[reference.surah-1];if(!chapter)return [];
 const ayahs=Array.from({length:(reference.end||reference.ayah)-reference.ayah+1},(_,n)=>reference.ayah+n);
 // The same offline-first services as the Mushaf; failure of one language does
 // not hide the other, and no text is synthesized when a provider fails.
 const frenchRequest=bounded(fetchSurahTranslation(reference.surah,'fr')).catch(()=>null);
 const arabic:PromiseSettledResult<Awaited<ReturnType<typeof fetchAyah>>>[]=[];
 for(let start=0;start<ayahs.length;start+=4)arabic.push(...await Promise.allSettled(ayahs.slice(start,start+4).map(ayah=>bounded(fetchAyah(reference.surah,ayah)))));
 const french=await frenchRequest;
 return ayahs.map((ayah,index)=>{
  const number=chapter.offset+ayah;
  const result=arabic[index];const verse=result.status==='fulfilled'&&result.value.surah===reference.surah&&result.value.numberInSurah===ayah&&result.value.number===number?result.value:null;
  return {surah:reference.surah,ayah,...(verse?.text?.trim()?{arabic:verse.text,number:verse.number}:{}),...(french?.get(number)?.trim()?{translation:french.get(number)}:{})};
 });
}

/** Explicit matches to existing library entries. Some entries are excerpts:
 * their scope is named and never presented as the entire French PDF narration.
 * Collection identities checked on Sunnah.com, 2026-10-13. No new Arabic copy. */
const ARABIC_HADITH:Record<number,{id:number;label:string;source:string;url:string;note:string}>={
 1:{id:903,label:'Les cinq piliers',source:'Al-Bukhâri 8 · Muslim 16',url:'https://sunnah.com/bukhari:8',note:'Le français du cours cite le jeûne avant le pèlerinage ; les versions de ce récit présentent ces deux éléments dans des ordres différents.'},
 2:{id:902,label:'Extrait : la réponse sur l’Islam',source:'Muslim 8a',url:'https://sunnah.com/muslim:8a',note:'Cet extrait arabe couvre la réponse sur l’Islam. Le récit français ci-dessous conserve également les réponses sur la foi, l’excellence et l’Heure.'},
 3:{id:901,label:'Les intentions et l’émigration',source:'Al-Bukhâri 1 · Muslim 1907',url:'https://sunnah.com/muslim:1907a',note:'Cette version arabe mentionne aussi l’émigration vers Allah et Son messager. Le cours français fourni reproduit une formulation plus courte du récit.'},
 17:{id:905,label:'La première formulation citée',source:'Muslim 1718a',url:'https://sunnah.com/muslim:1718a',note:'L’arabe ci-dessus correspond à la première formulation. Le cours cite ensuite une autre version de Muslim en français.'},
};
export function hadithArabic(chapter:number){
 const verified=verifiedArabic.find(item=>item.chapter===chapter);if(verified)return {...verified,id:verified.id};
 const match=ARABIC_HADITH[chapter];if(!match)return null;
 const entry=HADITHS_NAWAWI.find(item=>item.id===match.id);
 return entry?{...match,arabic:entry.ar,variants:undefined}:null;
}

/** Match an existing sequence only. Punctuation, diacritics, and the source
 * spelling in the displayed text are retained verbatim. */
export function evidenceHighlight(text:string,expression:string):{before:string;match:string;after:string}|null{
 const normalize=(value:string)=>value.toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
 // Source paragraphs and translations arrive with whitespace normalized. Keep
 // offsets exact by normalizing apostrophes only, never deleting characters.
 const needle=normalize(expression);const index=text.toLocaleLowerCase('fr').replace(/[’‘]/g,"'").indexOf(needle);
 return index<0?null:{before:text.slice(0,index),match:text.slice(index,index+expression.length),after:text.slice(index+expression.length)};
}
