import { describe,it,expect } from 'vitest';
import { drawTestQuestions,testWords,cueWordCount,cueEndSeconds } from './memorizationTest';
import type { Ayah } from '../types';
const verse=(numberInSurah:number,text='قل هو الله أحد'):Ayah=>({number:numberInSurah,numberInSurah,text,surah:112,page:604,juz:30,hizbQuarter:240});
describe('random memorization starts',()=>{
 it('draws distinct verses only from the supplied learned passages and includes middle starts',()=>{
 const rows=[verse(1),verse(2),verse(2),verse(3),verse(4)];
 const result=drawTestQuestions(rows,3,()=>0);
 expect(result.map(a=>a.numberInSurah)).toEqual([2,3,4]);
 expect(new Set(result.map(a=>a.numberInSurah)).size).toBe(3);
 });
 it('does not expose the entire verse as a cue, even for short verses',()=>{
 expect(drawTestQuestions([verse(1,'والعصر')],3)).toEqual([]);
 expect(cueWordCount(3)).toBe(1);expect(cueWordCount(30)).toBe(3);
 });
 it('removes only the unnumbered opening formula',()=>{
 expect(testWords(verse(1,'بسم الله الرحمن الرحيم قل هو الله أحد')).offset).toBe(4);
 expect(testWords({...verse(1,'بسم الله الرحمن الرحيم'),surah:1}).offset).toBe(0);
 });
 it('refuses to play an unrestricted verse when audio cue timing is absent or invalid',()=>{
 expect(cueEndSeconds(null,1)).toBeNull();
 const words=[{id:1,position:1,text:'قل',timestampFrom:0,timestampTo:600},{id:2,position:2,text:'هو',timestampFrom:600,timestampTo:1000}];
 expect(cueEndSeconds({verseKey:'112:1',words},2)).toBe(1);
 expect(cueEndSeconds({verseKey:'112:1',words:[{...words[0],timestampTo:0}]},1)).toBeNull();
 });
});
