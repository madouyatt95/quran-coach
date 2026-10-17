import {describe,it,expect} from 'vitest';
import {pageLessons,matchesPageLesson} from './pageLessons';
import type {MushafWord} from './model';
const word=(rule:string|null):MushafWord=>({key:'2:17:1',verseKey:'2:17',position:1,kind:'word',line:1,glyph:'fixture',text:'fixture',audio:null,french:null,transliteration:null,rules:rule?[rule]:[],tajweedSegments:[{text:'fixture',rule}]});
describe('page Tajwid lessons',()=>{
 it('requires explicit supported source segments, not a word rule or font color',()=>{
  expect(pageLessons([{...word(null),rules:['qalqalah']},word('unknown')])).toEqual([]);
 });
 it('keeps the exact word and segment for a lesson',()=>{
  const example=word('qalqalah'),lessons=pageLessons([example]);
  expect(lessons).toHaveLength(1);expect(lessons[0].examples[0]).toBe(example);
  expect(matchesPageLesson(example,'qalqalah')).toBe(true);expect(matchesPageLesson(example,'ikhfa')).toBe(false);
 });
 it('excludes verse medallions and empty segments',()=>{
  expect(pageLessons([{...word('qalqalah'),kind:'end'},{...word('qalqalah'),tajweedSegments:[{text:'',rule:'qalqalah'}]}])).toEqual([]);
 });
});
