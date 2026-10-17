import {VERSE_GRAMMAR,wordGrammarSource} from './data';
import {canonicalWords,SURAH_JOURNEYS} from './journeyData';
import {normalizeFahmWord} from '../lib/fahm/learning';
import type {MushafWord} from '../lib/interactiveMushaf/model';
export interface CourseOccurrence {key:string;position:number;lesson:string;text:string;explanation:string;source:string}
const annotations:CourseOccurrence[]=Object.entries(VERSE_GRAMMAR).flatMap(([key,v])=>v.words.map(w=>({key,position:w.position,lesson:w.lesson,text:canonicalWords(key)[w.position-1],explanation:w.simple,source:wordGrammarSource(key,w.position)})));
const journeys:CourseOccurrence[]=SURAH_JOURNEYS.flatMap(j=>j.verses.map(v=>({key:v.key,position:v.focus,lesson:v.lesson,text:canonicalWords(v.key)[v.focus-1],explanation:v.explanation,source:wordGrammarSource(v.key,v.focus)})));
export const COURSE_OCCURRENCES=[...annotations,...journeys].filter((o,i,all)=>!!o.text&&all.findIndex(a=>a.key===o.key&&a.position===o.position&&a.lesson===o.lesson)===i);
export function wordCourses(word:Pick<MushafWord,'verseKey'|'position'|'text'|'kind'>) {
 if(word.kind!=='word')return [];
 return COURSE_OCCURRENCES.filter(o=>o.key===word.verseKey&&o.position===word.position&&normalizeFahmWord(word.text)===normalizeFahmWord(o.text));
}
export function courseOccurrences(lesson:string,priorityVerses:string[]=[]){
 return COURSE_OCCURRENCES.filter(o=>o.lesson===lesson).sort((a,b)=>Number(priorityVerses.includes(b.key))-Number(priorityVerses.includes(a.key)));
}
export const occurrenceHref=(o:Pick<CourseOccurrence,'key'|'position'|'lesson'>)=>`/read?surah=${o.key.split(':')[0]}&ayah=${o.key.split(':')[1]}&studyWord=${o.position}&arabicLesson=${o.lesson}`;
