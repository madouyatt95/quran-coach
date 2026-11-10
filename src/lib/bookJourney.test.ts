import {expect,it} from 'vitest';
import {scenePlaces,journeyDate} from './bookJourney';
import {narrativeBooks} from '../data/narrativeBooks';
import type {NarrativeScene} from './narrativeBooks';
const scene=(text:string,sources:string[]=['reference']):NarrativeScene=>({id:'test',title:'Médine',paragraphs:[{text,sources}],studyNote:''});
it('maps only explicit sourced city mentions, not headings, adjectives or an inferred route',()=>{
 expect(scenePlaces(scene('Le récit ne précise pas de lieu.'))).toEqual([]);
 expect(scenePlaces(scene('La Mecque et Médine.',[]))).toEqual([]);
 expect(scenePlaces(scene('Une médinoise parle.'))).toEqual([]);
 const places=scenePlaces(scene('De La Mecque, il évoque Yathrib.'));
 expect(places.map(p=>p.id)).toEqual(['mecca','medina']);
 expect(places.every(p=>p.evidence.sources.includes('reference')&&p.source.startsWith('https://www.geonames.org/'))).toBe(true);
});
it('never displays a date when its exact supporting manuscript passage is missing',()=>{
 const book=narrativeBooks.find(b=>b.id==='umar-responsabilite')!,chapter=book.chapters.find(c=>c.id==='succession')!;
 expect(journeyDate(book,chapter)?.label).toBe('634 · 13 H');
 expect(journeyDate(book,{...chapter,scenes:[scene('Autre passage.')]})).toBeNull();
 expect(journeyDate(book,{...chapter,id:'unlisted'})).toBeNull();
});
