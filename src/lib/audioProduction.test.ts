import {describe,it,expect} from 'vitest';
import {alignmentDuration,assertFrenchScript,estimatedCredits,historyAlignment,productionIdentity,sentenceTimings,sha256,type VoiceProfile} from './audioProduction';
const voice:VoiceProfile={id:'test',name:'Cours',voice_id:'abcdefgh12345678',model_id:'eleven_multilingual_v2',stability:.5,similarity:.7,style:.1,credits_per_character:1};
describe('production audio',()=>{
 it('refuses Arabic recitations, empty and oversized scripts',()=>{for(const text of ['', 'بِسْمِ اللَّهِ', 'a'.repeat(4001)])expect(()=>assertFrenchScript(text)).toThrow();expect(()=>assertFrenchScript('Comprendre la patience.')).not.toThrow();});
 it('reserves margin and rejects invalid pricing',()=>{expect(estimatedCredits('Bonjour.',voice)).toEqual({estimate:8,reserved:10});expect(()=>estimatedCredits('Bonjour',{...voice,credits_per_character:NaN})).toThrow();});
 it('supports a verified fractional tariff while still reserving a margin',()=>{expect(estimatedCredits('Bonjour.',{...voice,credits_per_character:.5})).toEqual({estimate:4,reserved:5});for(const rate of [0,.09,-1,Infinity])expect(()=>estimatedCredits('Bonjour.',{...voice,credits_per_character:rate})).toThrow();});
 it('identity includes actual synthesis settings, not display name or account',async()=>{const a=await sha256(productionIdentity('Bonjour.',voice));expect(await sha256(productionIdentity('Bonjour.',{...voice,id:'new',name:'Autre'}))).toBe(a);expect(await sha256(productionIdentity('Bonjour.',{...voice,style:.5}))).not.toBe(a);});
 it('does not invent timings when provider alignment differs',()=>{expect(sentenceTimings('Bonjour.',{characters:['x'],character_start_times_seconds:[0],character_end_times_seconds:[1]})).toEqual([]);});
 it('handles sentence boundaries and unicode code points',()=>{const text='Bonjour 🌿. Voici la suite.',characters=Array.from(text);const marks=sentenceTimings(text,{characters,character_start_times_seconds:characters.map((_,i)=>i),character_end_times_seconds:characters.map((_,i)=>i+1)});expect(marks).toEqual([{sentence:0,start:0,end:10},{sentence:1,start:11,end:26}]);});
 it('rejects malformed nonmonotonic timing',()=>{expect(sentenceTimings('ab',{characters:['a','b'],character_start_times_seconds:[1,0],character_end_times_seconds:[2,1]})).toEqual([]);});
 it('recovers duration-encoded history marks without inventing intervals',()=>{
  const raw={characters:Array.from('Adam.'),character_start_times_seconds:[0,.151,.244,.325,.36],character_end_times_seconds:[.151,.093,.081,.035,.325]};
  expect(alignmentDuration('Adam.',raw)).toBe(0);
  const recovered=historyAlignment('Adam.',raw);
  expect(alignmentDuration('Adam.',recovered)).toBeCloseTo(.685,3);
  expect(sentenceTimings('Adam.',recovered)).toEqual([{sentence:0,start:0,end:.685}]);
  expect(raw.character_end_times_seconds.at(-1)).toBe(.325);
 });
 it('keeps absolute history marks unchanged and accepts millisecond rounding',()=>{
  const absolute={characters:['a','b'],character_start_times_seconds:[0,.151],character_end_times_seconds:[.151,.244]};
  expect(historyAlignment('ab',absolute)).toBe(absolute);
  const durations={characters:['a','b','c'],character_start_times_seconds:[0,.151,.245],character_end_times_seconds:[.151,.093,.081]};
  expect(alignmentDuration('abc',historyAlignment('abc',durations))).toBeCloseTo(.326,3);
 });
 it('rejects ambiguous or mismatched history marks and backwards ends',()=>{
  const invalid={characters:['a','b','c'],character_start_times_seconds:[0,1,2],character_end_times_seconds:[.2,.3,.4]};
  expect(historyAlignment('abc',invalid)).toBeNull();
  expect(historyAlignment('abd',invalid)).toBeNull();
  expect(historyAlignment('abc',{...invalid,character_end_times_seconds:[1,NaN,.4]})).toBeNull();
  expect(alignmentDuration('ab',{characters:['a','b'],character_start_times_seconds:[0,1],character_end_times_seconds:[3,2]})).toBe(0);
 });
});
