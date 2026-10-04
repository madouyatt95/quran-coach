import type { Ayah } from '../types';
import { recitationWords, normalizeRecitationWord } from './recitationMatching';
import type { VerseWords } from './wordTimings';
export type TestOutcome = 'independent' | 'assisted' | 'review';
export interface TestAnswer { surah:number; ayah:number; outcome:TestOutcome }
export function testWords(ayah:Ayah) {
  const words = recitationWords(ayah.text);
  const opening = ayah.surah !== 1 && ayah.surah !== 9 && ayah.numberInSurah === 1 && words.slice(0,4).map(normalizeRecitationWord).join(' ') === 'بسم الله الرحمن الرحيم';
  return {words:opening ? words.slice(4) : words, offset:opening ? 4 : 0};
}
export function drawTestQuestions(verses:Ayah[], count:number, random = Math.random):Ayah[] {
  const unique = new Map(verses.filter(a => testWords(a).words.length >= 3).map(a => [`${a.surah}:${a.numberInSurah}`,a]));
  const pool = [...unique.values()];
  for(let i=pool.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,Math.max(1,Math.min(10,count)));
}
export const cueWordCount = (length:number) => Math.min(3,Math.max(1,Math.floor(length/3)));
export function cueEndSeconds(timings:VerseWords|null, count:number):number|null {
  const words = timings?.words.slice(0,count);
  if (!words || words.length !== count || words.some((w,i) => w.timestampTo <= w.timestampFrom || (i > 0 && w.timestampTo <= words[i-1].timestampTo))) return null;
  return words.at(-1)!.timestampTo / 1000;
}
