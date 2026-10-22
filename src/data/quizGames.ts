import {QURAN_VOCABULARY} from './quranVocabulary';
import {investigationQuestions} from './quizInvestigations';
export const GAME_CATALOG=[
 {id:"roots",icon:"🧩",title:"Le domino des racines",tag:"Ṣarf",description:"Relie des mots de même racine pour former une chaîne."},
 {id:"sentences",icon:"🧱",title:"L’atelier des phrases",tag:"Naḥw",description:"Donne leur place aux mots et comprends leurs relations."},
 {id:"expedition",icon:"🗺️",title:"Les expéditions",tag:"Parcours",description:"Choisis tes chemins et garde un carnet de découvertes."},
 {id:'families',icon:'🟨',title:'Les quatre familles',tag:'Logique',description:'16 cartes. Quatre liens cachés à découvrir.'},
 {id:'story',icon:'🧩',title:'Le récit à reconstruire',tag:'Histoire',description:'Replace les scènes et retrouve leur enseignement.'},
 {id:'mystery',icon:'🎧',title:'La sourate mystère',tag:'Écoute',description:'Reconnais une sourate, un verset après l’autre.'},
 {id:'describe',icon:'🤝',title:'Fais deviner',tag:'À plusieurs',description:'Un mot à faire trouver, trois mots à éviter.'},
 {id:'escape',icon:'🗝️',title:'Les portes du savoir',tag:'Enquête',description:'Observe les indices pour ouvrir quatre portes.'},
 {id:'memory',icon:'🃏',title:'Le Memory des mots',tag:'Mémoire',description:'Retrouve les paires arabe et français.'},
] as const;
export type GameKind=typeof GAME_CATALOG[number]['id'];
export const wordById=(id:number)=>QURAN_VOCABULARY.find(w=>w.id===id)!;
export const FAMILY_BOARDS=[
 {id:'everyday',title:'Les mots du quotidien',groups:[
  {title:'Liens familiaux',ids:[134,135,136,137],why:'Enfant, père, mère et frère désignent des liens de parenté.'},
  {title:'Éléments du paysage',ids:[106,107,108,109],why:'Montagne, mer, arbre et vent appartiennent au vocabulaire du milieu naturel.'},
  {title:'Repères du temps',ids:[14,104,105,164],why:'Jour, nuit, journée et aube situent le temps.'},
  {title:'Verbes de parole',ids:[4,96,98,189],why:'Dire, ordonner, expliquer et demander sont ici des actions liées à la parole.'},
 ]},
 {id:'language',title:'Des nombres et des mots',groups:[
  {title:'Nombres de un à quatre',ids:[488,489,490,491],why:'Ces quatre formes correspondent aux nombres un, deux, trois et quatre.'},
  {title:'Le corps',ids:[17,112,113,322],why:'Cœur, main, visage et langue : on retient ici le sens corporel de ces mots.'},
  {title:'Prépositions',ids:[31,32,33,34],why:'Dans, de, sur et vers servent à relier les éléments de la phrase.'},
  {title:'Taille et distance',ids:[143,144,146,147],why:'Grand et petit décrivent une taille ; proche et lointain, une distance.'},
 ]},
];
export const MEMORY_PACKS=[
 {id:'nature',title:'La nature',ids:[101,102,103,106,107,108]},
 {id:'family',title:'La famille',ids:[134,135,136,137,138,142]},
 {id:'actions',title:'Les actions',ids:[4,5,36,61,65,66]},
 {id:'learning',title:'Apprendre',ids:[15,19,47,157,161,167]},
 {id:'values',title:'Les qualités',ids:[21,24,26,75,76,82]},
];
// The first card is always hidden behind a handoff; definitions come from the existing lexicon.
export const DESCRIBE_CARDS=[
 {word:22,answer:'Prière',forbidden:['Salat','Mosquée','Prosternation']},
 {word:121,answer:'Mosquée',forbidden:['Prière','Minaret','Imam']},
 {word:151,answer:'Zakat',forbidden:['Aumône','Pilier','Argent']},
 {word:152,answer:'Pèlerinage',forbidden:['Mecque','Hajj','Voyage']},
 {word:29,answer:'Invocation',forbidden:['Demander','Dua','Prière']},
 {word:24,answer:'Repentir',forbidden:['Pardon','Faute','Revenir']},
 {word:21,answer:'Patience',forbidden:['Attendre','Épreuve','Endurance']},
 {word:26,answer:'Gratitude',forbidden:['Merci','Reconnaissance','Bienfait']},
 {word:15,answer:'Livre',forbidden:['Pages','Lire','Écrit']},
 {word:19,answer:'Connaissance',forbidden:['Savoir','Apprendre','Science']},
 {word:17,answer:'Cœur',forbidden:['Poitrine','Battre','Amour']},
 {word:54,answer:'Eau',forbidden:['Boire','Liquide','Pluie']},
 {word:101,answer:'Soleil',forbidden:['Jour','Lumière','Chaleur']},
 {word:102,answer:'Lune',forbidden:['Nuit','Ciel','Croissant']},
 {word:106,answer:'Montagne',forbidden:['Sommet','Hauteur','Roche']},
 {word:108,answer:'Arbre',forbidden:['Feuilles','Tronc','Racines']},
 {word:134,answer:'Enfant',forbidden:['Parents','Petit','Fils']},
 {word:135,answer:'Père',forbidden:['Papa','Enfant','Famille']},
 {word:136,answer:'Mère',forbidden:['Maman','Enfant','Famille']},
 {word:208,answer:'Qibla',forbidden:['Direction','Prière','Kaaba']},
];
export const STORY_GAMES=[
 {id:'prophet:yusuf',title:'Yusuf : du rêve aux retrouvailles'},
 {id:'prophet:musa',title:'Musa : de l’enfance à la mission'},
 {id:'prophet:nuh',title:'Nuh : l’appel et l’arche'},
 {id:'story:maryam',title:'Maryam : de l’accueil au retour'},
 {id:'story:khidr',title:'Musa et l’apprentissage'},
 {id:'story:jardin-avares',title:'Les propriétaires du jardin'},
];
export const ESCAPE_QUESTIONS=investigationQuestions();
export const ESCAPE_GAMES=[...new Map(ESCAPE_QUESTIONS.map(q=>[q.investigation!.id,{id:q.investigation!.id,title:q.investigation!.title}])).values()];
export const escapeSteps=(id:string)=>ESCAPE_QUESTIONS.filter(q=>q.investigation?.id===id);
