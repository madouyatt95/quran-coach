/** Editorial links to stable, sourced manuscript paragraphs, never inferred audio offsets. */
export interface BookConnection {bookId:string;chapterId:string;passageId:string;perspective:string}
export interface BookEvent {id:string;title:string;context:string;passages:BookConnection[]}
const at=(bookId:string,chapterId:string,index:number,perspective:string):BookConnection=>({bookId,chapterId,passageId:`${chapterId}:${chapterId}-1:${index}`,perspective});
export const bookEvents:BookEvent[]=[
 {id:'uhud',title:'Uhud et ses lendemains',context:'Une même épreuve, des parcours différents. Chaque biographie conserve ses propres sources.',passages:[
  at('hamza-protection','uhud',0,'Le témoignage de Wahshi et la perte de Hamza.'),
  at('talha-engagement','uhud',0,'La protection du Prophète et la main blessée de Talha.'),
  at('nusayba-presence','uhud',0,'De l’eau apportée aux combattants à la défense, puis au soin.'),
  at('zubayr-fidelite','defendre',0,'Après Uhud : répondre à l’appel malgré les pertes et les blessures.'),
 ]},
 {id:'fille-hamza',title:'Accueillir la fille de Hamza',context:'Le même épisode familial, raconté depuis deux biographies.',passages:[
  at('hamza-protection','memoire',0,'Après la perte de Hamza, prendre soin de sa fille.'),
  at('jafar-deux-rivages','proximite',2,'La responsabilité confiée à la maison de Jafar et d’Asma.'),
 ]},
 {id:'conseil',title:'La succession d’Umar',context:'Le conseil et les consultations, à travers deux de leurs participants.',passages:[
  at('talha-engagement','conseil',0,'La place de Talha parmi les six compagnons désignés.'),
  at('abdurrahman-confier','consultation',0,'Renoncer à sa candidature et conduire les consultations.'),
 ]},
 {id:'mushafs',title:'Les copies du Mushaf sous Uthman',context:'Deux aspects de cette période : les feuillets confiés à Hafsa et les désaccords rapportés autour d’Ibn Masud.',passages:[
  at('hafsa-depositaire','feuillets',2,'Le prêt des feuillets pour préparer les copies, puis leur retour.'),
  at('ibn-masud-parole','retour',0,'Le désaccord rapporté dans sa biographie, avec les précautions du récit.'),
 ]},
];
export function connectionsForChapter(bookId:string,chapterId:string){return bookEvents.filter(e=>e.passages.some(p=>p.bookId===bookId&&p.chapterId===chapterId)).map(event=>({...event,passages:event.passages.filter(p=>p.bookId!==bookId)}));}
