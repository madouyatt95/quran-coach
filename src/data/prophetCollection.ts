/** Published manuscripts only. The editorial outline is deliberately kept out of the catalogue. */
export const prophetChronology = [
  {bookId:'prophete-la-mecque',period:'Avant la naissance',label:'La Mecque et le monde qui l’entoure'},
  {bookId:'prophete-enfance',period:'L’enfance',label:'L’enfant recueilli'},
  {bookId:'prophete-foyer',period:'La jeunesse et le mariage',label:'La confiance et le foyer'},
  {bookId:'prophete-hira',period:'Le commencement de la révélation',label:'Hira, le commencement'},
  {bookId:'prophete-premiers-croyants',period:'Les premiers croyants',label:'Les premiers qui répondent'},
  {bookId:'prophete-abyssinie',period:'Le refuge en Abyssinie',label:'Un refuge au-delà de la mer'},
  {bookId:'prophete-conversions',period:'Les appuis mecquois',label:'Des appuis inattendus'},
  {bookId:'prophete-boycott',period:'Le boycott et les deuils',label:'Tenir, puis perdre ses soutiens'},
  {bookId:'prophete-taif',period:'Taif et le retour',label:'La route qui semblait fermée'},
  {bookId:'ascension-priere',period:'Le voyage nocturne',label:'Le voyage nocturne et la prière'},
  {bookId:'prophete-aqaba',period:'Les engagements de Yathrib',label:'Yathrib ouvre une voie'},
  {bookId:'hijra-route',period:'L’Hégire',label:'La route vers Médine'},
  {bookId:'prophete-medine',period:'L’installation à Médine',label:'Bâtir une vie commune'},
  {bookId:'prophete-badr',period:'L’an 2 de l’Hégire',label:'Badr, le jour décisif'},
  {bookId:'prophete-entre-badr-uhud',period:'Entre Badr et Uhud',label:'Une victoire, puis la vigilance'},
  {bookId:'prophete-uhud',period:'L’an 3 de l’Hégire',label:'Uhud, traverser la blessure'},
  {bookId:'prophete-pertes',period:'Les épreuves après Uhud',label:'Quand les épreuves se succèdent'},
  {bookId:'prophete-tranchee',period:'Le siège des Coalisés',label:'La ville derrière le fossé'},
  {bookId:'prophete-apres-siege',period:'Les lendemains du siège',label:'Les lendemains du siège'},
  {bookId:'aicha-innocence',period:'L’épreuve de la calomnie',label:'Aicha et la parole qui innocente'},
  {bookId:'hudaybiyya-pacte',period:'La trêve de Hudaybiyya',label:'L’accord qui ouvre une voie'},
  {bookId:'prophete-lettres',period:'L’appel aux souverains',label:'Le message au-delà de l’Arabie'},
  {bookId:'prophete-khaybar',period:'Après Hudaybiyya',label:'Khaybar et les retrouvailles'},
  {bookId:'prophete-oumra-muta',period:'Les ans 7 et 8 de l’Hégire',label:'Le retour attendu, puis Mu’ta'},
  {bookId:'prophete-retour-mecque',period:'Le retour à La Mecque',label:'Le retour dans La Mecque'},
  {bookId:'prophete-hunayn',period:'Hunayn et Taif',label:'Hunayn et le retour des cœurs'},
  {bookId:'prophete-tabuk',period:'L’an 9 de l’Hégire',label:'Tabuk, partir et dire vrai'},
  {bookId:'prophete-delegations',period:'Les délégations et la transmission',label:'Accueillir et transmettre'},
  {bookId:'prophete-pelerinage',period:'L’an 10 de l’Hégire',label:'Le pèlerinage d’Adieu'},
  {bookId:'prophete-derniers-jours',period:'Les derniers jours à Médine',label:'Les derniers jours et ce qui demeure'},
] as const;

export const prophetRelatedBooks = [
  'revelation-lettre','sira-confiance',
] as const;

export function isProphetSeriesBook(id:string){
  return prophetChronology.some(entry=>entry.bookId===id);
}
