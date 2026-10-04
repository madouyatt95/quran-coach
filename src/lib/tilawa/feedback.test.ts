import {describe,it,expect} from 'vitest';
import type {WordVerdict} from '@tilawa/core';
import {recognizedIndices,compatibleWords,corpusWordOffset} from './feedback';
describe('Tilawa acoustic evidence',()=>{
 it('never treats unsure, skipped or pending words as correct',()=>{
 const verdicts=['ok','unsure','skipped','pending','wrong'].map((state,word)=>({surah:1,ayah:1,word,state})) as WordVerdict[];
 expect([...recognizedIndices(verdicts,1,1,0)]).toEqual([0]);
 expect([...recognizedIndices(verdicts,1,1,1)]).toEqual([]);
 expect([...recognizedIndices(verdicts,1,2,0)]).toEqual([]);
 });
 it('aligns a prefixed basmala without pretending its words were recognized',()=>{expect(corpusWordOffset(['بسم','الله','الرحمن','الرحيم','قل','هو'],['قل','هو'],112,1)).toBe(4);expect(corpusWordOffset(['بسم','الله','الرحمن','الرحيم','قل','هو'],['قل','هو'],1,1)).toBeNull();expect(corpusWordOffset(['قل','هو'],['قل','هو'],112,1)).toBe(0);});
 it('requires identical normalized word segmentation',()=>{
 expect(compatibleWords(['قُلْ','هُوَ'],['قل','هو'])).toBe(true);
 expect(compatibleWords(['قل','هو'],['قل هو'])).toBe(false);
 expect(compatibleWords(['قل','هو'],['قل','هي'])).toBe(false);
 });
});
