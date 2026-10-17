import {describe,it,expect,vi} from 'vitest';
import {FreeRecitationGate} from './freeRecitation';
import type {EngineResult} from './protocol';
const cursor=(surah:number,ayah:number,word=1):EngineResult => ({id:1,verdicts:[],cursorWords:['قل','هو','الله','أحد'],events:[{type:'word_progress',surah,ayah,word_index:word,total_words:4,matched_indices:[0,1]}]});
function setup(){const callbacks={onVerse:vi.fn(),onProgress:vi.fn(),onCandidate:vi.fn(),onSearching:vi.fn()};return {callbacks,gate:new FreeRecitationGate(callbacks)};}
describe('free recitation location gate',()=>{
 it('waits for supported repeated evidence, then follows the next verse without interruption',()=>{
 const {gate,callbacks:c}=setup();gate.consume(cursor(112,1));expect(c.onVerse).not.toHaveBeenCalled();expect(c.onCandidate).toHaveBeenCalledWith({surah:112,ayah:1});
 gate.consume(cursor(112,1,2));expect(c.onVerse).toHaveBeenCalledExactlyOnceWith({surah:112,ayah:1});gate.consume(cursor(112,2,0));expect(c.onVerse).toHaveBeenLastCalledWith({surah:112,ayah:2});expect(c.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ayah:2,wordIndex:0}));
 });
 it('requires confirmation for another surah or a nonconsecutive verse and rejects stale choices',()=>{
 const {gate,callbacks:c}=setup();gate.consume(cursor(2,10));gate.confirm({surah:2,ayah:10});c.onVerse.mockClear();c.onProgress.mockClear();
 gate.consume(cursor(112,1));gate.consume(cursor(112,1,2));expect(c.onVerse).not.toHaveBeenCalled();expect(c.onProgress).not.toHaveBeenCalled();
 gate.consume(cursor(113,1));expect(gate.confirm({surah:112,ayah:1})).toBe(false);expect(gate.confirm({surah:113,ayah:1})).toBe(true);expect(c.onVerse).toHaveBeenCalledExactlyOnceWith({surah:113,ayah:1});
 gate.consume(cursor(113,4));expect(c.onVerse).toHaveBeenCalledTimes(1);expect(c.onCandidate).toHaveBeenLastCalledWith({surah:113,ayah:4});
 });
 it('does not jump back on a late match and clears a stale proposal when tracking recovers',()=>{
 const {gate,callbacks:c}=setup();gate.consume(cursor(2,10));gate.confirm({surah:2,ayah:10});
 gate.consume(cursor(112,1));gate.consume({...cursor(2,11),events:[...cursor(2,11).events,{type:'verse_match',surah:2,ayah:10} as EngineResult['events'][number]]});
 expect(c.onVerse).toHaveBeenLastCalledWith({surah:2,ayah:11});expect(gate.confirm({surah:112,ayah:1})).toBe(false);
 gate.consume({id:2,events:[{type:'verse_match',surah:2,ayah:10} as EngineResult['events'][number]],verdicts:[]});expect(c.onVerse).toHaveBeenCalledTimes(2);
 });
 it('clears word positions on lost tracking and never confirms a tentative discovery by itself',()=>{
 const {gate,callbacks:c}=setup();gate.consume(cursor(2,10));gate.confirm({surah:2,ayah:10});
 gate.consume({id:2,events:[],verdicts:[],trackingState:'searching'});expect(c.onSearching).toHaveBeenCalledOnce();expect(gate.confirm({surah:2,ayah:10})).toBe(false);
 const other=setup();other.gate.consume({id:1,events:[{type:'verse_candidate',candidates:[{surah:112,ayah:1,confidence:.5,rank:0,source:'discovery'}],stable:false,final_flush:false}],verdicts:[]});expect(other.callbacks.onVerse).not.toHaveBeenCalled();expect(other.callbacks.onCandidate).toHaveBeenCalledWith({surah:112,ayah:1});
 });
});
