import {describe,it,expect} from 'vitest';
import {allInvocations,categoryById} from './adhkarExperience';
import {invocationRecording,timedInvocationSelection,estimatedInvocationSeconds,isRecallHidden} from './invocationLearning';
import ranges from '../data/adhkarRecordingRanges.json';
import human from '../data/invocationHumanAudio.json';
const options={arabic:true,french:true,silence:true,gap:4,repeats:1,rate:1};
describe('existing human recordings',()=>{
 it.each(['morning','evening'])('provides complete recorded learning and comparison for the first two %s entries',category=>{
  const entries=categoryById.get(category)!.items.slice(0,2);
  expect(entries.map(d=>d.id)).toEqual([94,95]);
  for(const [index,d] of entries.entries()){
   const audio=invocationRecording(d)!;
   expect(audio.url).toContain(index===0?'OD-075.mp3':'OD-076.mp3');
   expect(audio.duration).toBeGreaterThan(70);
   expect(audio.ranges.length).toBeGreaterThan(1);
   expect(audio.ranges[0][0]).toBe(0);
   expect(audio.ranges.at(-1)![1]).toBe(audio.duration);
  }
 });
 it('keeps every imported recitation tied to its unchanged source entry and complete audio',()=>{
  for(const [key,recording] of Object.entries(human)){
   expect(allInvocations.find(d=>d.key===key)?.arabic).toBe(recording.arabic);
   expect(recording.reciter).toBe('Muhammad Jumah');
   expect(recording.ranges[0][0]).toBe(0);
   expect(recording.ranges.at(-1)![1]).toBe(recording.duration);
   recording.ranges.forEach(([start,end],i)=>{expect(end).toBeGreaterThan(start);if(i)expect(start).toBe(recording.ranges[i-1][1]);});
  }
 });
 it('never loses a section of a recording when dividing at acoustic pauses',()=>{
  for(const recording of Object.values(ranges)){
   expect(recording.ranges[0][0]).toBe(0);
   expect(recording.ranges.at(-1)![1]).toBe(recording.duration);
   recording.ranges.forEach(([start,end],i)=>{expect(end).toBeGreaterThan(start);if(i)expect(start).toBe(recording.ranges[i-1][1]);});
  }
 });
 it('uses an existing exact text, not an ID or partial-word match',()=>{
  const d=allInvocations.find(d=>d.key==='hisn_chap_1:14')!;
  expect(invocationRecording(d)?.url).toContain('OD-001.mp3');
  expect(invocationRecording({arabic:d.arabic+' رَبِّ'})).toBeNull();
 });
});
describe('duration selection and recall',()=>{
 it.each([2,5,10])('selects whole entries within the estimate of %i minutes',minutes=>{
  const pool=categoryById.get('morning')!.items,selection=timedInvocationSelection(pool,minutes,options);
  expect(selection.items.length).toBeGreaterThan(0);
  expect(selection.seconds).toBeLessThanOrEqual(minutes*60);
  expect(selection.seconds).toBe(selection.items.reduce((total,d)=>total+estimatedInvocationSeconds(d,options),0));
  for(const d of selection.items)expect(pool.includes(d)).toBe(true);
 });
 it('accounts for language, speed and repetitions without changing prescribed counts',()=>{
  const d=categoryById.get('morning')!.items[0],count=d.count;
  expect(estimatedInvocationSeconds(d,{...options,repeats:3,rate:.5})).toBeGreaterThan(estimatedInvocationSeconds(d,options));
  expect(d.count).toBe(count);
  expect(timedInvocationSelection([],2,options).items).toEqual([]);
 });
 it('reveals progressively, without replacing the source Arabic',()=>{
  expect([0,1,2].map(i=>isRecallHidden('read',i))).toEqual([false,false,false]);
  expect([0,1,2].map(i=>isRecallHidden('clues',i))).toEqual([false,true,false]);
  expect([0,1,2].map(i=>isRecallHidden('memory',i))).toEqual([true,true,true]);
 });
});
