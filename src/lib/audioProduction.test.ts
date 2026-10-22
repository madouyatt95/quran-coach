import {describe,it,expect} from 'vitest';
import {assertFrenchScript,estimatedCredits,productionIdentity,sentenceTimings,sha256,type VoiceProfile} from './audioProduction';
const voice:VoiceProfile={id:'test',name:'Cours',voice_id:'abcdefgh12345678',model_id:'eleven_multilingual_v2',stability:.5,similarity:.7,style:.1,credits_per_character:1};
describe('production audio',()=>{
 it('refuses Arabic recitations, empty and oversized scripts',()=>{for(const text of ['', 'بِسْمِ اللَّهِ', 'a'.repeat(4001)])expect(()=>assertFrenchScript(text)).toThrow();expect(()=>assertFrenchScript('Comprendre la patience.')).not.toThrow();});
 it('reserves margin and rejects invalid pricing',()=>{expect(estimatedCredits('Bonjour.',voice)).toEqual({estimate:8,reserved:10});expect(()=>estimatedCredits('Bonjour',{...voice,credits_per_character:NaN})).toThrow();});
 it('identity includes actual synthesis settings, not display name or account',async()=>{const a=await sha256(productionIdentity('Bonjour.',voice));expect(await sha256(productionIdentity('Bonjour.',{...voice,id:'new',name:'Autre'}))).toBe(a);expect(await sha256(productionIdentity('Bonjour.',{...voice,style:.5}))).not.toBe(a);});
 it('does not invent timings when provider alignment differs',()=>{expect(sentenceTimings('Bonjour.',{characters:['x'],character_start_times_seconds:[0],character_end_times_seconds:[1]})).toEqual([]);});
 it('handles sentence boundaries and unicode code points',()=>{const text='Bonjour 🌿. Voici la suite.',characters=Array.from(text);const marks=sentenceTimings(text,{characters,character_start_times_seconds:characters.map((_,i)=>i),character_end_times_seconds:characters.map((_,i)=>i+1)});expect(marks).toEqual([{sentence:0,start:0,end:10},{sentence:1,start:11,end:26}]);});
 it('rejects malformed nonmonotonic timing',()=>{expect(sentenceTimings('ab',{characters:['a','b'],character_start_times_seconds:[1,0],character_end_times_seconds:[2,1]})).toEqual([]);});
});
