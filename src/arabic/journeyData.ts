import corpus from '../lib/fahm/context-corpus.json';
export const canonicalWords=(key:string)=>(corpus as Record<string,string[]>)[key]||[];
export interface JourneyVerse {key:string;focus:number;lesson:string;title:string;explanation:string;question:string;options:string[];answer:number}
const v=(key:string,focus:number,lesson:string,title:string,explanation:string,question:string,options:string[],answer:number):JourneyVerse=>({key,focus,lesson,title,explanation,question,options,answer});
export const SURAH_JOURNEYS=[
 {id:112,title:'Al-Ikhlas',subtitle:'Pronoms, phrase nominale et négation',verses:[
 v('112:1',1,'imperative','Une parole introduite par une demande','Le premier mot est un impératif : il invite le destinataire à dire ce qui suit. Repérez ensuite le pronom indépendant.','Quelle est la nature du premier mot ?',['Un impératif','Un nom','Une négation'],0),
 v('112:2',2,'nominal','Une phrase sans verbe « être » écrit','Deux noms au nominatif forment ici une phrase nominale. Le second apporte une information sur le premier. Le sens de l’attribut se consulte dans la traduction et le tafsir.','Le second mot est ici…',['Une préposition','L’attribut de la phrase nominale','Un verbe passé'],1),
 v('112:3',4,'passive','La négation et les deux voix','Lam commande le jussif. Comparez les deux verbes : le premier est actif ; le second est passif.','Le dernier verbe est…',['Actif','Un nom','Passif'],2),
 v('112:4',3,'attached','Une préposition attachée au pronom','Le troisième mot réunit lām et un pronom. Ce groupe précise une relation ; il ne constitue pas un verbe.','Quelle construction reconnaissez-vous au troisième mot ?',['Préposition + pronom','Un impératif','Nom + adjectif'],0),
 ]},
 {id:113,title:'Al-Falaq',subtitle:'Prépositions, relations entre noms et verbes',verses:[
 v('113:1',2,'conjugation','Reconnaître qui parle','Après la demande initiale, le verbe porte la première personne du singulier. Le groupe qui suit commence par une préposition attachée au nom.','Quelle personne porte le deuxième mot ?',['Nous','Je','Ils'],1),
 v('113:2',4,'conjugation','Repérer l’accompli','Le dernier mot est un verbe accompli, à la troisième personne masculine singulière. Le mot mā le précède ici comme relatif.','Le dernier mot est…',['Un verbe accompli','Un adjectif','Une préposition'],0),
 v('113:3',1,'prepositions','Une liaison suivie d’une préposition','La première unité écrite contient deux éléments : wāw puis min. Elle relie le passage à ce qui précède et introduit un complément.','Que contient le premier mot ?',['Un pronom seul','Un verbe','Conjonction + préposition'],2),
 v('113:4',4,'prepositions','Retrouver fī','La quatrième unité est une préposition ; le nom qui la suit est au génitif.','Quel est le statut du mot après fī ?',['Nom au génitif','Verbe impératif','Nom à l’accusatif'],0),
 v('113:5',3,'patterns','Un participe actif','Le troisième mot est un participe actif de forme I, appartenant à la catégorie des noms. Le dernier mot est un verbe de la même racine.','Le troisième mot appartient à la catégorie…',['Des verbes','Des noms','Des particules'],1),
 ]},
 {id:114,title:'An-Nas',subtitle:'Compléments du nom, adjectifs et relatives',verses:[
 v('114:1',3,'prepositions','Le nom précédé de bi-','Bi- est attaché au nom rabb. La préposition commande le génitif du nom, lui-même précisé par le nom suivant.','Le troisième mot contient…',['Une préposition et un nom','Un verbe et son sujet','Un adjectif seul'],0),
 v('114:2',2,'idafa','Préciser de qui on parle','Le second nom complète le premier : c’est une relation d’iḍāfa. L’enchaînement avec le verset précédent reste nécessaire pour lire la phrase entière.','Quel est le rôle du second nom ?',['Sujet d’un impératif','Complément du nom','Particule interrogative'],1),
 v('114:3',2,'idafa','Retrouver la même relation','Le nom qui termine ce verset complète encore le nom qui le précède. La répétition rend cette relation visible dans plusieurs passages voisins.','Quel cas porte ce complément du nom ?',['Accusatif','Nominatif','Génitif'],2),
 v('114:4',4,'agreement','Un adjectif qui suit son nom','Le dernier mot est un adjectif au génitif. Il précise le nom précédent et suit ses marques d’accord.','Le dernier mot est ici…',['Un verbe','Une épithète','Une préposition'],1),
 v('114:5',2,'conjugation','Un verbe dans une proposition relative','Le passage commence par un relatif. Le verbe qui suit est un inaccompli à la troisième personne masculine singulière.','Quel est l’aspect du deuxième mot ?',['Inaccompli','Impératif','Accompli'],0),
 v('114:6',3,'categories','Deux éléments dans une unité écrite','La dernière unité contient une conjonction wāw suivie d’un nom. Les catégories s’analysent par segments.','Quelle analyse convient à la dernière unité ?',['Un verbe seul','Une préposition seule','Conjonction + nom'],2),
 ]},
];
export interface SegmentTask {id:string;key:string;position:number;cuts:number[];labels:string[];details:string[];root?:string;note:string}
export const SEGMENT_TASKS:SegmentTask[]=[
 {id:'bismi',key:'1:1',position:1,cuts:[1],labels:['Préposition bi-','Nom ism'],details:['Introduit ici la relation « au nom ».','Le nom est au génitif après la préposition.'],note:'La graphie contractée reste intacte ; les groupes ci-dessous servent à expliquer ses éléments.'},
 {id:'waiyyaka',key:'1:5',position:3,cuts:[1],labels:['Conjonction wa-','Pronom complément'],details:['Relie cette construction à la précédente.','Le pronom est placé avant le verbe qu’il complète.'],note:'La place du pronom participe à la construction ; consultez le passage complet pour son sens.'},
 {id:'ihdina',key:'1:6',position:1,cuts:[3],labels:['Verbe de demande','Pronom -nā'],details:['Impératif avec le destinataire comme sujet implicite.','Le pronom signifie « nous » et occupe la fonction de complément.'],root:'ه د ي',note:'La racine est une information morphologique ; ses lettres ne sont pas toutes visibles telles quelles dans cette forme.'},
 {id:'walam',key:'112:3',position:3,cuts:[1],labels:['Conjonction wa-','Particule lam'],details:['Coordonne la deuxième négation.','Introduit la négation et commande le jussif.'],note:'Le pronom sujet n’est pas contenu dans lam ; il se comprend dans le verbe suivant.'},
 {id:'lahu',key:'112:4',position:3,cuts:[1],labels:['Préposition lām','Pronom -hu'],details:['Introduit une relation prépositionnelle.','Pronom de troisième personne masculine singulière, complément de la préposition.'],note:'La voyelle du pronom ne doit pas être interprétée comme la désinence d’un nom décliné.'},
 {id:'birabbi',key:'113:1',position:3,cuts:[1],labels:['Préposition bi-','Nom rabb'],details:['La préposition est attachée au nom.','Le nom est au génitif ; le nom suivant le complète.'],root:'ر ب ب',note:'La shadda porte un redoublement : deux radicales identiques peuvent être réunies graphiquement.'},
 {id:'wamin',key:'113:3',position:1,cuts:[1],labels:['Conjonction wa-','Préposition min'],details:['Relie le groupe à ce qui précède.','Introduit le nom au génitif qui suit.'],note:'Une unité écrite peut réunir deux particules de fonctions différentes.'},
 {id:'wannas',key:'114:6',position:3,cuts:[1,3],labels:['Conjonction wa-','Article al-','Nom nās'],details:['Coordonne ce nom au précédent.','Marque ici la détermination du nom.','Le nom est au génitif dans cette coordination.'],note:'L’article et le nom restent liés à l’oral ; cette séparation est une annotation pédagogique.'},
];
/** Slice original grapheme groups; never synthesize or normalize the Quranic string. */
export function wordSegmentsFor(task:SegmentTask){const text=canonicalWords(task.key)[task.position-1];if(!text)return[];const units=text.match(/\P{M}\p{M}*/gu)||[];const bounds=[0,...task.cuts,units.length];return bounds.slice(0,-1).map((start,i)=>units.slice(start,bounds[i+1]).join(''));}
