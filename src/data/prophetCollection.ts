/** Published manuscripts only. The editorial outline is deliberately kept out of the catalogue. */
export const prophetChronology = [
  {bookId:'prophete-la-mecque',period:'Avant la naissance',label:'La Mecque et le monde qui l’entoure'},
  {bookId:'prophete-enfance',period:'L’enfance',label:'L’enfant recueilli'},
  {bookId:'prophete-foyer',period:'La jeunesse et le mariage',label:'La confiance et le foyer'},
  {bookId:'prophete-hira',period:'Le commencement de la révélation',label:'Hira, le commencement'},
  {bookId:'prophete-premiers-croyants',period:'Les premiers croyants',label:'Les premiers qui répondent'},
  {bookId:'prophete-abyssinie',period:'Le refuge en Abyssinie',label:'Un refuge au-delà de la mer'},
] as const;

export const prophetRelatedBooks = [
  'revelation-lettre','hijra-route','ascension-priere','hudaybiyya-pacte','sira-confiance',
] as const;

export function isProphetSeriesBook(id:string){
  return prophetChronology.some(entry=>entry.bookId===id);
}
