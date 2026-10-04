import {it,expect} from 'vitest';
import {KhatmReadingTracker,MIN_KHATM_READING_MS as minimum,type ReadingObservation} from './khatmReading';
const view=(changes:Partial<ReadingObservation>={}):ReadingObservation=>({page:42,jump:0,active:true,ready:true,surah:2,ayah:255,...changes});
it('validates only the departed page after sufficient continuous consultation',()=>{
 const t=new KhatmReadingTracker();expect(t.observe(view(),0)).toBeNull();
 expect(t.observe(view(),minimum)).toBeNull();expect(t.qualified(view(),minimum)).toBe(true);
 expect(t.observe(view({page:43}),minimum+1)).toBe(42);
 expect(t.observe(view({page:43}),minimum+2)).toBeNull();
 expect(t.observe(view({page:44}),minimum+3)).toBeNull();
});
it('excludes explicit jumps even to the next page, and starts a fresh visit at destination',()=>{
 const t=new KhatmReadingTracker();t.observe(view(),0);
 expect(t.observe(view({page:43,jump:1}),minimum+1)).toBeNull();
 expect(t.observe(view({page:44,jump:1}),minimum*2+2)).toBe(43);
});
it.each([0,200,14999])('does not count rapid browsing after %d ms',ms=>{
 const t=new KhatmReadingTracker();t.observe(view(),0);expect(t.observe(view({page:43}),ms)).toBeNull();
});
it('excludes backwards movement and skipped pages',()=>{
 const t=new KhatmReadingTracker();t.observe(view(),0);expect(t.observe(view({page:41}),minimum)).toBeNull();
 expect(t.observe(view({page:47}),minimum*2)).toBeNull();
});
it('discards visits when leaving the reader, hiding the app, or opening a modal',()=>{
 const t=new KhatmReadingTracker();t.observe(view(),0);t.observe(view({active:false}),minimum);
 t.observe(view(),minimum*5);expect(t.observe(view({page:43}),minimum*5+10)).toBeNull();
});
it('does not count load time and can validate the old page while the next loads',()=>{
 const t=new KhatmReadingTracker();t.observe(view({ready:false}),0);t.observe(view(),minimum*3);
 expect(t.observe(view({page:43,ready:false}),minimum*4)).toBe(42);
 t.observe(view({page:43}),minimum*6);expect(t.observe(view({page:44}),minimum*6+10)).toBeNull();
});
it('does not validate page 604 without a manual action',()=>{
 const t=new KhatmReadingTracker();t.observe(view({page:604}),0);expect(t.observe(view({page:604}),minimum*10)).toBeNull();
 expect(t.observe(view({page:1,jump:1}),minimum*11)).toBeNull();
});
