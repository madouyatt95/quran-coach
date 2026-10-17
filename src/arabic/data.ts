import rawLessons from './lessons.json';
import {LEVEL_TWO} from './levelTwo';
import type {ArabicLesson,VerseGrammar,WordGrammar} from './types';
import corpus from '../lib/fahm/context-corpus.json';
import type {MushafWord} from '../lib/interactiveMushaf/model';
import {normalizeFahmWord} from '../lib/fahm/learning';
export const ARABIC_LESSONS=[...rawLessons as ArabicLesson[],...LEVEL_TWO];
export const lessonById=(id:string)=>ARABIC_LESSONS.find(l=>l.id===id);
export const grammarCheckId=(question:string)=>`arabic:${question}`;
const w=(position:number,lesson:string,category:WordGrammar['category'],simple:string,detail:string,related:number[]=[],root?:string,pattern?:string):WordGrammar=>({position,lesson,category,simple,detail,related,root,pattern});
export const VERSE_GRAMMAR:Record<string,VerseGrammar>={
 '1:1':{note:'La préposition بِـ est attachée au nom. La dépendance du groupe initial est expliquée par un élément sous-entendu ; son expression varie selon les analyses.',words:[
 w(1,'prepositions','composé','« Au nom » : une préposition attachée à un nom.','بِـ : ḥarf jarr ; اسْم : nom majrūr et premier terme de l’iḍāfa.',[2]),
 w(2,'idafa','nom','Le nom qui complète « au nom ».','Nom propre au génitif, muḍāf ilayhi du nom qui précède.',[1]),
 w(3,'roots','nom','Un attribut de miséricorde.','Adjectif au génitif dans cette lecture grammaticale ; racine ر ح م.',[2],'ر ح م','فَعْلَان'),
 w(4,'roots','nom','Un autre attribut de miséricorde.','Adjectif au génitif ; racine ر ح م. Le sens précis reste lié au contexte et à l’exégèse.',[2],'ر ح م','فَعِيل'),]},
 '1:3':{note:'Ces attributs prolongent la présentation du Seigneur dans le passage précédent. L’analyse ici suit la lecture adjectivale du corpus.',words:[
 w(1,'roots','nom','Un attribut appartenant à la famille de la miséricorde.','Adjectif masculin au génitif ; racine ر ح م.',[2],'ر ح م','فَعْلَان'),
 w(2,'roots','nom','Un second attribut, de la même famille de mots.','Adjectif masculin au génitif ; même racine, schème différent.',[1],'ر ح م','فَعِيل'),]},
 '1:4':{note:'On peut observer ici une chaîne de compléments du nom. L’analyse reste liée à la lecture Ḥafṣ et au texte affiché.',words:[
 w(1,'patterns','nom','« Maître » : un nom dérivé de la racine م ل ك.','Participe actif au génitif, sur le schème فَاعِل ; premier terme d’une iḍāfa.',[2],'م ل ك','فَاعِل'),
 w(2,'idafa','nom','« Du jour » complète le mot précédent.','Muḍāf ilayhi au génitif ; il est aussi muḍāf du nom suivant.',[1,3]),
 w(3,'idafa','nom','Ce nom précise de quel jour il s’agit.','Second terme au génitif de l’iḍāfa formée avec « jour ».',[2]),]},
 '1:5':{note:'Les pronoms compléments sont placés avant les verbes. Le sujet « nous » est compris dans chaque conjugaison ; il n’est pas le pronom « Toi ».',words:[
 w(1,'pronouns','nom','« Toi » : celui à qui l’adoration est adressée.','Pronom indépendant à la deuxième personne, complément antéposé de نَعْبُدُ.',[2]),
 w(2,'verbal','verbe','« Nous adorons » : le sujet est « nous ».','Muḍāriʿ, première personne du pluriel ; sujet implicite نَحْنُ. Le complément est le pronom précédent.',[1],'ع ب د','Forme I'),
 w(3,'categories','composé','« Et Toi » : une liaison et un pronom.','وَ : conjonction ; إِيَّاكَ : pronom complément antéposé du verbe suivant.',[4]),
 w(4,'derived','verbe','« Nous demandons secours » : une forme dérivée.','Muḍāriʿ, première personne du pluriel, forme X ; racine faible ع و ن. Sujet implicite نَحْنُ.',[3],'ع و ن','Forme X'),]},
 '1:6':{note:'L’impératif sert ici à formuler une demande adressée à Allah. Le qualificatif du chemin suit le nom qu’il précise.',words:[
 w(1,'pronouns','composé','« Guide-nous » : une demande et le pronom « nous ».','Verbe impératif avec sujet implicite أَنْتَ ; ـنَا : pronom complément attaché.',[2],'ه د ي'),
 w(2,'verbal','nom','Le chemin demandé.','Nom à l’accusatif, objet de la demande de guidance.',[1,3]),
 w(3,'categories','nom','Le qualificatif de ce chemin.','Adjectif à l’accusatif accordé au nom qui précède.',[2]),]},
 '112:2':{note:'Cette phrase nominale associe ce dont on parle à l’information donnée, sans verbe « être » écrit séparément.',words:[
 w(1,'nominal','nom','Celui dont on parle.','Nom propre au nominatif, mubtadaʾ dans cette phrase.',[2]),
 w(2,'nominal','nom','L’information donnée à son sujet.','Nom au nominatif, khabar du mubtadaʾ. La grammaire décrit sa fonction ; l’exégèse explique cet attribut.',[1]),]},
 '112:3':{note:'لَمْ introduit une négation et régit le muḍāriʿ au jussif. Les deux verbes distinguent la voix active et la voix passive.',words:[
 w(1,'categories','particule','Une particule de négation.','لَمْ : particule de négation et de jazm, suivie du muḍāriʿ.',[2]),
 w(2,'conjugation','verbe','Le verbe de la première négation est à la voix active.','Muḍāriʿ actif au jussif après لَمْ, troisième personne masculine singulière.',[1],'و ل د','Forme I · actif'),
 w(3,'categories','composé','« Et » suivi de la même négation.','وَ : coordination ; لَمْ : négation et jazm.',[4]),
 w(4,'conjugation','verbe','Le second verbe est à la voix passive.','Muḍāriʿ passif au jussif, troisième personne masculine singulière. Sujet du passif implicite.',[3],'و ل د','Forme I · passif'),]},
};
/** Fail closed if the loaded edition no longer matches our reviewed word positions. */
export function verifiedGrammar(key:string,words:MushafWord[]){
 const text=(corpus as Record<string,string[]>)[key],data=VERSE_GRAMMAR[key];
 if(!data||!text||text.length!==words.length||words.some((word,i)=>word.verseKey!==key||word.position!==i+1||normalizeFahmWord(word.text)!==normalizeFahmWord(text[i])))return null;
 return data;
}
export function rootOccurrences(root:string){return Object.entries(VERSE_GRAMMAR).flatMap(([key,v])=>v.words.filter(w=>w.root===root).map(w=>({key,position:w.position,text:(corpus as Record<string,string[]>)[key][w.position-1]})));}
export const wordGrammarSource=(key:string,position:number)=>`https://corpus.quran.com/wordmorphology.jsp?location=(${key}:${position})`;
