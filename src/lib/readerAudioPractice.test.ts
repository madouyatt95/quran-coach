import {it,expect} from 'vitest';
import {abPassage,abProblem,audioTime} from './readerAudioPractice';
import type {ReaderAudioSession} from './readerAudioSession';
import type {Ayah} from '../types';
const verses=Array.from({length:3},(_,i)=>({surah:2,number:18+i,numberInSurah:11+i,page:3,text:'نص'} as Ayah));
const point=(v=0,offset=1):ReaderAudioSession=>({verse:verses[v],reciter:'ar.husary',url:`https://audio.test/${v}.mp3`,offset,speed:1,stopAt:null,range:null,queue:null,cuts:null,sourceMatched:true,timings:{verseKey:`2:${11+v}`,words:[]},savedAt:0});
it('preserves exact source positions and a contiguous passage across verses',()=>{
 const result=abPassage(point(0,8.2),point(2,3.1),verses);
 expect(result?.verses).toEqual(verses);expect(result?.cuts.start.offset).toBe(8.2);expect(result?.cuts.endTime).toBe(3.1);expect(result?.cuts.end.url).toBe('https://audio.test/2.mp3');
 expect(abPassage(point(),point(2),[verses[0],verses[2]])).toBeNull();
});
it('rejects reverse points, changed voices and changed chapters',()=>{
 expect(abProblem(point(1),point())).not.toBeNull();
 expect(abProblem(point(0,8),point(0,8.1))).not.toBeNull();
 expect(abProblem(point(),{...point(1),reciter:'ar.alafasy'})).not.toBeNull();
 expect(abProblem(point(),{...point(1),verse:{...verses[1],surah:3}})).not.toBeNull();
 expect(abProblem(point(0,2),point(0,4))).toBeNull();
});
it('does not present unknown or invalid durations as estimates',()=>{expect(audioTime(NaN)).toBe('—:—');expect(audioTime(69.9)).toBe('1:09');});
