import {expect,it} from 'vitest';
import {readerPageScale} from './readerPageScale';
it('enlarges immersion while keeping the complete text column and page height visible',()=>{
 for(const [width,height] of [[382,734],[382,600],[422,790],[812,290]]){
  const scale=readerPageScale(width,height,false,true,1.15);
  expect(scale*484).toBeLessThanOrEqual(width+1e-8);
  expect(scale*860).toBeLessThanOrEqual(height+1e-8);
 }
 expect(readerPageScale(382,734,false,true,1.15)).toBeGreaterThan(readerPageScale(370,640,false,false,1.15));
});
it('preserves normal zoom and fits the full spread to the actual available height',()=>{
 expect(readerPageScale(370,640,false,false,1.15)).toBeCloseTo(370/600*1.15);
 expect(readerPageScale(1172,734,true,true,1.15)*860).toBeCloseTo(734);
});
it('opens two leaves on a square unfolded display and collapses safely on a narrow or short viewport',async()=>{
 const {canShowBookSpread}=await import('./readerPageScale');
 expect(canShowBookSpread(740,730)).toBe(true);
 expect(canShowBookSpread(820,900)).toBe(true);
 expect(canShowBookSpread(390,700)).toBe(false);
 expect(canShowBookSpread(812,290)).toBe(false);
 for(const [w,h] of [[740,730],[820,900],[1172,734]]){const scale=readerPageScale(w,h,true,false,1.15);expect(scale*1200+4).toBeLessThanOrEqual(w);expect(scale*860).toBeLessThanOrEqual(h);}
});
