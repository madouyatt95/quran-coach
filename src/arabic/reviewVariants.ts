import type {GrammarQuestion} from './types';
import {LEVEL_VARIANTS} from './levelTwo';
const variant=(base:string,prompt:string,options:string[],answer:number,explanation:string)=>({base,question:{id:`${base}:transfer`,skill:'role' as const,prompt,options,answer,explanation}});
export const REVIEW_VARIANTS=[
 variant('categories-1','Quelle est la catégorie de شَجَرَةٌ (« un arbre ») ?',['Nom','Verbe','Particule'],0,'Le mot désigne un être végétal : il appartient aux noms.'),
 variant('categories-2','Quelle est la catégorie de إِلَى (« vers ») ?',['Nom','Verbe','Particule'],2,'Ilā est une préposition, donc une particule dans cette classification.'),
 variant('pronouns-1','Qui désigne هِيَ ?',['Nous','Elle','Tu au masculin'],1,'Hiya désigne une troisième personne féminine singulière.'),
 variant('pronouns-2','Dans مَسْجِدُهُ, le suffixe ـهُ précise…',['Le possesseur ou le rattachement du nom','Une action passée','Une question'],0,'Attaché au nom, le pronom en est le complément.'),
 variant('gender-number-1','Combien de portes désigne بَابَانِ ?',['Une','Trois ou davantage','Deux'],2,'La terminaison -āni indique ici le duel au nominatif.'),
 variant('gender-number-2','أَقْلَامٌ, pluriel de قَلَمٌ, est…',['Un duel','Un pluriel brisé','Un pronom'],1,'La structure interne change : il ne s’agit pas seulement d’ajouter une terminaison de pluriel régulier.'),
 variant('definite-1','Quelle forme désigne « la mer » ?',['بَحْرٌ','الْبَحْرُ','فِي بَحْرٍ'],1,'L’article al- rend ici le nom défini.'),
 variant('definite-2','أَنْتَ est-il indéfini parce qu’il n’a pas l’article ?',['Non : un pronom est défini','Oui : tout mot sans article est indéfini','C’est un verbe'],0,'La détermination ne dépend pas toujours de l’article. Les pronoms sont définis.'),
 variant('nominal-1','Dans الْمَاءُ بَارِدٌ, quel mot apporte l’information « froid » ?',['الْمَاءُ','Les deux mots sont des verbes','بَارِدٌ'],2,'Bāridun est l’attribut de la phrase nominale.'),
 variant('nominal-2','Quel groupe signifie « l’eau froide » ?',['الْمَاءُ بَارِدٌ','الْمَاءُ الْبَارِدُ','مِنَ الْمَاءِ'],1,'L’adjectif défini suit le nom défini. Sans article, bāridun serait ici l’attribut : « l’eau est froide ». '),
 variant('verbal-1','Qui s’assoit dans جَلَسَ الرَّجُلُ ?',['L’homme','Un objet non nommé','Le verbe'],0,'Al-rajulu est le sujet du verbe jalasa.'),
 variant('verbal-2','Dans نَجْلِسُ, quel sujet comprend-on ?',['Il','Tu','Nous'],2,'Le préfixe na- marque ici la première personne du pluriel.'),
 variant('prepositions-1','Dans عَلَى الْكُرْسِيِّ, quel nom dépend de la préposition ?',['عَلَى','الْكُرْسِيِّ','Aucun'],1,'Le nom al-kursiyyi est au génitif après ʿalā.'),
 variant('prepositions-2','Dans بِالْقَلَمِ, où est la préposition ?',['Attachée au début : بِـ','Il n’y en a pas','À la fin : ـمِ'],0,'Bi- est une préposition attachée au nom, sans espace.'),
 variant('idafa-1','Dans مِفْتَاحُ الْغُرْفَةِ, quel est le second terme ?',['مِفْتَاحُ','Les deux ensemble','الْغُرْفَةِ'],2,'Al-ghurfati complète le nom « clé » et est au génitif.'),
 variant('idafa-2','Choisissez « la clé de la chambre ».',['الْمِفْتَاحُ الْغُرْفَةِ','مِفْتَاحُ الْغُرْفَةِ','مِفْتَاحٌ الْغُرْفَةِ'],1,'Dans cette iḍāfa simple, le premier terme n’a ni article ni tanwīn.'),
 variant('roots-1','Quelle racine partagent فَتَحَ et فَاتِحٌ ?',['ف ت ح','ف ا ح','ت ح ا'],0,'Les radicales fāʾ, tāʾ, ḥāʾ se retrouvent dans les deux formes.'),
 variant('roots-2','La famille س م ع suffit-elle à traduire tout emploi de سَمِيعٌ ?',['Oui, le contexte ne compte pas','Il faut aussi la forme et le contexte','La racine indique la personne grammaticale'],1,'La racine fournit une famille de sens ; la forme et le contexte restent nécessaires.'),
 variant('patterns-1','Quel schème reconnaît-on dans مَفْتُوحٌ ?',['فَاعِل','فَعَّلَ','مَفْعُول'],2,'Maftūḥun suit le schème mafʿūl, ici participe passif.'),
 variant('patterns-2','Dans سَامِعٌ sur فَاعِل, quelle radicale occupe la place de ع ?',['م','س','ع'],0,'La racine est س م ع ; sa deuxième radicale mīm remplace le ʿayn du modèle.'),
 variant('conjugation-1','Complétez نَحْنُ … (« nous entendons »).',['يَسْمَعُ','نَسْمَعُ','سَمِعَ'],1,'Na- marque ici « nous » à l’inaccompli.'),
 variant('conjugation-2','Quelle forme signifie « j’ouvre » ?',['يَفْتَحُ','نَفْتَحُ','أَفْتَحُ'],2,'Le préfixe ʾa- marque ici la première personne du singulier.'),
 variant('derived-1','دَرَسَ : « il a étudié ». دَرَّسَ signifie ici…',['Il a enseigné','Nous étudions','Une école'],0,'Le redoublement de la deuxième radicale caractérise ici la forme II, avec ce sens à apprendre.'),
 variant('derived-2','Le préfixe أَ de أَكْتُبُ (« j’écris ») indique…',['Une forme dérivée à lui seul','La première personne de l’inaccompli','Le pluriel du nom'],1,'Il s’agit ici d’une marque personnelle de la forme I, pas de la forme IV.'),
 ...LEVEL_VARIANTS,
];
export function reviewVariant(base:GrammarQuestion,seen:string[]){
 const options=REVIEW_VARIANTS.filter(v=>v.base===base.id);
 return options.find(v=>!seen.includes(v.question.id))?.question||options[0]?.question||base;
}
