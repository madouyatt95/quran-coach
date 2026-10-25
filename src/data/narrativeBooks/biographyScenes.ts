import {unchangedBiographyChapters,biographyMethodNotes} from './biographyEdition';
import type {NarrativeBook} from '../../lib/narrativeBooks';

// Paragraph boundaries are chosen editorially. They never create narration or timestamps.
// Each entry begins a scene; its paragraphs retain their original notebook identity.
type Cue = [paragraph:number, title:string, decor?:'dawn'|'desert'|'water'|'garden'|'night'|'cave', ambience?:'silence'|'wind'|'water'|'rain'];
const three=(a:string,b:string,c:string):Cue[]=>[[0,a],[2,b],[4,c]];
export const biographyScenePlans:Record<string,Cue[][]>={
 'hamza-protection':[
  three('Une place parmi les Banu Hashim','L’appel traverse la famille','Une force qui change de sens'),
  three('Le retour de la chasse','Auprès des croyants menacés','Partir avec les musulmans'),
  three('Quitter La Mecque','Les responsabilités de Médine','Badr approche'),
  three('Le duel de Badr','La victoire et ses conséquences','Une année de menace'),
  three('Le témoignage de Wahshi','Médine porte ses morts','L’absence de Hamza'),
  three('Une enfant à accueillir','Le souvenir d’un linceul','Ce que les vivants préservent'),
 ],
 'jafar-deux-rivages':[
  three('Dans la maison d’Abu Talib','Jafar et Asma','Quitter les siens'),
  [[0,'Un refuge en Abyssinie','water','water'],[2,'Les envoyés de Quraysh','desert','silence'],[3,'Être entendu par le Négus','dawn','silence']],
  [[0,'La sourate Maryam devant le roi','dawn','silence'],[2,'La question sur Jésus','night','silence'],[4,'Demeurer loin du Messager','water','wind']],
  three('Des nouvelles depuis l’Arabie','La parole d’Asma','Retrouver une communauté transformée'),
  three('Une maison ouverte aux pauvres','Accueillir la fille de Hamza','Les liens du retour'),
  three('La route de Muta','Le souvenir de Jafar','Servir de plusieurs manières'),
 ],
 'talha-engagement':[
  three('Un jeune homme des Banu Taym','La pression des proches','Un engagement qui dure'),
  three('Recommencer à Médine','Une mission loin de Badr','À l’approche d’Uhud'),
  three('La main blessée','Protéger au plus près du danger','Les années qui restent'),
  three('Les biens et le partage','Les proches et la maison','Sous les premiers califes'),
  three('Un siège au conseil','Le temps d’Uthman','La rupture de l’assassinat'),
  three('La route de Basra','La mort au Chameau','Une vie traversée par la division'),
 ],
 'zubayr-fidelite':[
  three('Le fils de Safiyya','La foi sous la pression','Les départs de La Mecque'),
  three('Le travail d’Asma','Le poids du quotidien','La naissance d’Abdullah'),
  three('Répondre après Uhud','Au temps du Fossé','Les dernières campagnes'),
  three('Transmettre avec retenue','La mémoire des enfants','Les biens et les responsabilités'),
  three('La crise après Uthman','Le retrait et la mort','Une histoire qui demeure douloureuse'),
  three('Les dettes confiées à Abdullah','Rendre avant de partager','La fidélité après la mort'),
 ],
 'abdurrahman-confier':[
  three('Les débuts auprès d’Abu Bakr','Deux terres d’émigration','Arriver à Médine'),
  three('L’accueil de Saad','Recommencer avec les autres','Une maison qui se construit'),
  three('Badr et Uhud','Conduire la prière','Une confiance reconnue'),
  three('La prospérité et le don','Le repas interrompu','La mémoire des premiers temps'),
  three('Renoncer à la candidature','Le temps des consultations','Porter une décision commune'),
  three('Vivre sous Uthman','La richesse et le souvenir','La fin d’une longue route'),
 ],
 'abu-ubayda-confiance':[
  three('Un nom parmi les premiers croyants','Rejoindre la vie de Médine','Les premières responsabilités'),
  [[0,'Partager les provisions','desert','wind'],[2,'La nourriture sur le rivage','water','water'],[3,'Répondre des besoins de tous','dawn','silence']],
  three('La demande de Najran','L’homme de confiance','Une réputation qui demeure'),
  three('Après la mort du Messager','Les chefs des campagnes','Une charge qui grandit'),
  three('Umar s’arrête à Sargh','L’enseignement rapporté','Décider dans l’épreuve'),
  three('La peste d’Amwas','Les pertes de la communauté','Le chemin de la confiance'),
 ],
 'ibn-masud-parole':[
  three('Le jeune berger des Hudhayl','Les premiers pas dans la foi','Un savoir qui commence'),
  three('Réciter à La Mecque','Les chemins de l’émigration','Prendre place à Médine'),
  three('La proximité quotidienne','Reconnu pour son savoir','La responsabilité de transmettre'),
  [[0,'Le Messager demande à écouter','dawn','silence'],[2,'La relation d’écoute','night','silence'],[3,'Un savoir porté vers Kufa','desert','wind']],
  three('Être envoyé à Kufa','Autour des premiers élèves','Une école qui demeure'),
  three('Les copies et le désaccord','Le retour à Médine','Du berger à l’enseignant'),
 ],
 'hafsa-depositaire':[
  three('La maison d’Umar','Le mariage avec Khunays','Une première perte'),
  three('Les démarches d’Umar','Entrer dans la maison du Messager','Observer et transmettre'),
  three('Apprendre l’écriture','Les prières observées','Une place dans la transmission'),
  three('La confidence et le rappel','Au fil de la vie commune','Après la mort du Prophète'),
  three('La question de Hafsa','Apprendre auprès du Messager','Plusieurs liens avec le texte'),
  [[0,'Le travail de collecte','dawn','silence'],[1,'Un dépôt confié à Hafsa','garden','silence'],[2,'Les copies puis le retour des feuillets','night','silence']],
 ],
 'umm-sulaym-maison':[
  three('La foi à Yathrib','La proposition d’Abu Talha','Une ville qui change'),
  three('La condition d’Umm Sulaym','Une maison qui s’ouvre','Les années à venir'),
  three('Présenter Anas au Prophète','La maison et la bénédiction','Ce qu’un choix transmet'),
  three('L’accueil et les enfants','Donner de l’eau, soigner','Une épreuve approche'),
  [[0,'La perte et son annonce','night','silence'],[2,'Le lendemain auprès du Messager','dawn','silence'],[3,'Porter le deuil','garden','silence']],
  three('Secourir dans le danger','Oser poser une question','La trace de son initiative'),
 ],
 'nusayba-presence':[
  three('Le pacte d’al-Aqaba','Un engagement avant l’émigration','Faire vivre la promesse à Médine'),
  three('Habib et Abdullah','Une maison dans la communauté','Vers Uhud'),
  [[0,'De l’eau à la défense','desert','silence'],[2,'La blessure à l’épaule','night','silence'],[3,'Le temps du soin','dawn','silence']],
  three('Après Uhud, Hudaybiyya','Demeurer engagée','Une fidélité dans le temps'),
  three('La question d’Umm Umara','La place des croyantes','Une attribution discutée'),
  [[0,'La perte de Habib','night','silence'],[1,'Yamama et le retour blessé','desert','silence'],[3,'La visite à Médine','dawn','silence']],
 ],
};
export function stageBiography(book:NarrativeBook):NarrativeBook{
 const plan=biographyScenePlans[book.id];if(!plan)return book;
 return {...book,chapters:book.chapters.map((chapter,ci)=>{
  const paragraphs=chapter.scenes.flatMap(s=>s.paragraphs.map((p,i)=>({...p,id:p.id||`${chapter.id}:${s.id}:${i}`})));
  const notes=[...new Set([...chapter.scenes.map(s=>s.studyNote),biographyMethodNotes[book.id]?.[chapter.id]].filter(Boolean))].join('\n\n');
  const cues=plan[ci];if(!cues||cues[0][0]!==0||cues.some((c,i)=>c[0]>=paragraphs.length||(i>0&&c[0]<=cues[i-1][0])))throw Error(`Découpage de scènes invalide : ${book.id}/${chapter.id}`);
  return {...chapter,...(unchangedBiographyChapters[book.id]?.includes(chapter.id)?{audioVersion:book.version.replace(/-v2$/u,'-v1')}:{}),scenes:cues.map(([at,title,decor,ambience],i)=>({id:`${chapter.id}-scene-${at}`,title,paragraphs:paragraphs.slice(at,cues[i+1]?.[0]??paragraphs.length),studyNote:notes,...(decor?{treatment:{decor,ambience:ambience||'silence' as const}}:{})}))};
 })};
}
