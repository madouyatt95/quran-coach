import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadFrenchWords } from './french';
it('loads sourced French by exact word reference, never an end marker',async()=>{
 const first=await loadFrenchWords(1),last=await loadFrenchWords(114);
 expect(first['1:1:1']).toBe('(Je lis) avec (Le) Nom');
 expect(first['1:1:5']).toBeUndefined();
 expect(last['114:6:3']).toBeTruthy();
 await expect(loadFrenchWords(115)).rejects.toThrow();
});
it.skipIf(!process.env.QCF_AUDIT_DIR)('covers every Quran word across all 604 audited pages with no extra reference',async()=>{
 const expected=new Set<string>();
 for(let p=1;p<=604;p++){
  const page=JSON.parse(readFileSync(`${process.env.QCF_AUDIT_DIR}/v4-api-${p}.json`,'utf8')) as {verses:{verse_key:string;words:{position:number;char_type_name:string}[]}[]};
  for(const v of page.verses)for(const w of v.words)if(w.char_type_name==='word')expected.add(`${v.verse_key}:${w.position}`);
 }
 const actual=Object.assign({},...await Promise.all(Array.from({length:114},(_,i)=>loadFrenchWords(i+1)))) as Record<string,string>;
 expect(Object.keys(actual)).toHaveLength(77429);expect(new Set(Object.keys(actual))).toEqual(expected);
 expect(Object.values(actual).every(t=>typeof t==='string'&&t.trim()&&!t.includes('<'))).toBe(true);
});
