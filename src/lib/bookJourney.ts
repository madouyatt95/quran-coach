import {bookDateAnchors} from '../data/bookEditorial';
import type {NarrativeBook,NarrativeChapter,NarrativeScene} from './narrativeBooks';
export interface JourneyPlace {id:string;name:string;lat:number;lng:number;source:string;aliases:RegExp}
/** Modern city centres, never an inferred historical route or event location.
 * GeoNames entries checked 2026-11-10. Only explicit manuscript mentions match. */
export const JOURNEY_PLACES:JourneyPlace[]=[
 {id:'mecca',name:'La Mecque',lat:21.42664,lng:39.82563,source:'https://www.geonames.org/104515/makkah.html',aliases:/\b(?:Mecque|Makkah)\b/iu},
 {id:'medina',name:'Médine',lat:24.46861,lng:39.61417,source:'https://www.geonames.org/109223/madinah.html',aliases:/\b(?:Médine|Medine|Madinah|Yathrib)\b/iu},
 {id:'jerusalem',name:'Jérusalem',lat:31.76904,lng:35.21633,source:'https://www.geonames.org/281184/jerusalem.html',aliases:/\b(?:Jérusalem|Jerusalem|al-Quds)\b/iu},
];
export function scenePlaces(scene:NarrativeScene){
 // A heading alone is not evidence: retain the paragraph and its source IDs.
 return JOURNEY_PLACES.flatMap(place=>{
  const evidence=scene.paragraphs.find(p=>p.sources.length>0&&place.aliases.test(p.text));
  return evidence?[{...place,evidence}]:[];
 });
}
export function journeyDate(book:NarrativeBook,chapter:NarrativeChapter){
 const anchor=bookDateAnchors[book.id]?.[chapter.id];
 return anchor&&chapter.scenes.some(s=>s.paragraphs.some(p=>p.text.includes(anchor.quote)))?anchor:null;
}
