import {describe,it,expect} from 'vitest';
import {meaningCaptions,meaningCaptionIndex} from './semanticCaptions';
import type {VerseWords} from '../../../lib/wordTimings';
const values={'1:5:1':'Toi (Seul)','1:5:2':'nous adorons','1:5:3':'et (à) Toi (Seul)','1:5:4':'nous demandons de l’aide.'};
const timings:VerseWords={verseKey:'1:5',words:[1,2,3,4].map((position,i)=>({id:position,position,text:'',timestampFrom:i*2000,timestampTo:i*2000+1000}))};
describe('source-matched meanings',()=>{
 it('preserves the source wording and groups only adjacent references',()=>{
  const groups=meaningCaptions('1:5',values,timings,14,s=>s.length);
  expect(groups.map(g=>g.text).join(' ')).toBe(Object.values(values).join(' '));
  expect(groups.map(g=>g.first)).toEqual([1,3,4]);
 });
 it('follows timestamps, including pauses and backward seeks, not relative verse duration',()=>{
  const groups=meaningCaptions('1:5',values,timings,14,s=>s.length);
  expect(meaningCaptionIndex(groups,0)).toBe(0);
  expect(meaningCaptionIndex(groups,3.7)).toBe(0);
  expect(meaningCaptionIndex(groups,4.1)).toBe(1);
  expect(meaningCaptionIndex(groups,6)).toBe(2);
  expect(meaningCaptionIndex(groups,1)).toBe(0);
 });
 it('refuses incomplete translations, missing or invalid timings and another verse',()=>{
  expect(meaningCaptions('1:6',values,timings,40,s=>s.length)).toEqual([]);
  expect(meaningCaptions('1:5',{},timings,40,s=>s.length)).toEqual([]);
  expect(meaningCaptions('1:5',values,{...timings,words:timings.words.slice(0,3)},40,s=>s.length)).toEqual([]);
  expect(meaningCaptions('1:5',values,{...timings,words:timings.words.map(w=>({...w,timestampTo:0}))},40,s=>s.length)).toEqual([]);
 });
});
