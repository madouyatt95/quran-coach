import {expect,it} from 'vitest';
import {dailyAdhkar} from './dailyAdhkar';
import {HISNUL_MUSLIM_DATA} from './hisnulMuslim';
import {getAdhkarAudioUrl} from '../lib/adhkarAudioService';
it('covers references 75–98, preserves legacy IDs and links every daily prayer to its source',()=>{
 const all=HISNUL_MUSLIM_DATA.flatMap(m=>m.chapters).find(c=>c.id==='chap_27')!.duas;
 expect(all.filter(d=>d.hisnReference).map(d=>d.hisnReference)).toEqual(Array.from({length:24},(_,i)=>i+75));
 expect(all.find(d=>d.hisnReference===75)?.id).toBe(94);
 for(const period of ['morning','evening'] as const){
  for(const d of dailyAdhkar(period)){
   expect(d.sourceUrl).toBe(`https://sunnah.com/hisn:${d.hisnReference}`);
   expect(d.arabic).not.toMatch(/\.\.\.|…|\[آية/);
   expect(d.count).toBeGreaterThan(0);
  }
 }
});
it('includes full Quran passages, correct counters and period-specific prayers',()=>{
 const morning=dailyAdhkar('morning'),evening=dailyAdhkar('evening');
 expect(morning).toHaveLength(23);expect(evening).toHaveLength(21);
 expect(morning.find(d=>d.hisnReference===75)?.arabic).toContain('وَلَا يَئُودُهُ حِفْظُهُمَا');
 const protect=morning.find(d=>d.hisnReference===76)!;
 expect(protect.arabic).toContain('وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ');expect(protect.arabic).toContain('مِنَ الْجِنَّةِ وَالنَّاسِ');expect(protect.count).toBe(3);
 for(const [ref,count] of [[80,4],[82,3],[83,7],[86,3],[87,3],[91,100],[92,10],[94,3],[96,100],[98,10]]) expect(morning.find(d=>d.hisnReference===ref)?.count).toBe(count);
 expect(morning.some(d=>d.hisnReference===97)).toBe(false);
 expect(evening.filter(d=>[93,94,95].includes(d.hisnReference!))).toHaveLength(0);
 expect(evening.find(d=>d.hisnReference===78)?.arabic).toContain('وَإِلَيْكَ الْمَصِيرُ');
 expect(morning.find(d=>d.hisnReference===78)?.arabic).toContain('النُّشُورُ');
 for(const ref of [77,80,81,89,90]) expect(evening.find(d=>d.hisnReference===ref)?.arabic).not.toBe(morning.find(d=>d.hisnReference===ref)?.arabic);
});
it('never plays the old truncated recording for the corrected daily chapter',()=>{
 expect(getAdhkarAudioUrl('hisn_chap_27',94)).toBeNull();expect(getAdhkarAudioUrl('evening',97)).toBeNull();
 expect(getAdhkarAudioUrl('hisn_chap_28',110)).toContain('dua_110.mp3');
});
