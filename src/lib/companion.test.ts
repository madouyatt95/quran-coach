import { describe,it,expect } from 'vitest';
import { CompanionReadingClock,kahfProgress,lastThirdStart,visibleCards,fridayWeek,type CompanionCard } from './companion';
import { evaluateSurahComplete, type ReadingContext } from './invisibleCoachEngine';
const card:CompanionCard={id:'a',topic:'read',origin:'coach',title:'Lire',message:'',reason:'',minutes:2,emoji:'📖',route:'/read',action:'Lire',kind:'Conseil pédagogique',priority:1};
describe('companion evidence',()=>{
 it('does not credit rapid scrolling, jumps, hidden time or repeated ticks',()=>{
    const c=new CompanionReadingClock();
    expect(c.observe('1:1',0,true,0)).toBe(false);
    expect(c.observe('1:2',0,true,2000)).toBe(false);
    expect(c.observe('1:2',1,true,4000)).toBe(false);
    expect(c.observe('1:2',1,false,6000)).toBe(false);
    expect(c.observe('1:2',1,true,50000)).toBe(false);
    expect(c.observe('1:2',1,true,54000)).toBe(true);
    expect(c.observe('1:2',1,true,80000)).toBe(false);
 });
 it('does not celebrate a jump to the final verse',()=>{
    const ctx:ReadingContext={currentSurah:1,currentAyah:7,currentPage:1,totalAyahsInSurah:7,sessionStartTime:0,pagesReadThisSession:0};
    expect(evaluateSurahComplete(ctx)).toBeNull();
    expect(evaluateSurahComplete({...ctx,completedSurah:true})?.level).toBe('celebration');
 });
 it('deduplicates Kahf coverage and resumes the first missing verse',()=>{
    const now=new Date(2026,9,9,12),day='2026-10-09';
    expect(fridayWeek(now)).toBe('2026-10-09');
    const evidence=[1,1,3].map(ayah=>({day,surah:18,ayah,page:293,at:+now}));
    evidence.push({day:'2026-10-02',surah:18,ayah:2,page:293,at:0});
    expect(kahfProgress(evidence,now)).toEqual({count:2,next:2,percent:2});
 });
 it('computes the last third across midnight and rejects invalid boundaries',()=>{
    expect(lastThirdStart(new Date('2026-10-05T18:00:00Z'),new Date('2026-10-06T06:00:00Z'))).toBe(Date.parse('2026-10-06T02:00:00Z'));
    expect(lastThirdStart(new Date('bad'),new Date())).toBeNull();
    expect(lastThirdStart(new Date('2026-10-06T18:00:00Z'),new Date('2026-10-06T06:00:00Z'))).toBeNull();
 });
 it('honors completed, snoozed, muted, expired cards and priority',()=>{
    const cards=[card,{...card,id:'b',priority:2},{...card,id:'c',expiresAt:50}];
    expect(visibleCards(cards,{}, {},[],100).map(c=>c.id)).toEqual(['b','a']);
    expect(visibleCards(cards,{a:1},{b:101},[],100)).toEqual([]);
    expect(visibleCards(cards,{}, {},['read'],100)).toEqual([]);
 });
});
