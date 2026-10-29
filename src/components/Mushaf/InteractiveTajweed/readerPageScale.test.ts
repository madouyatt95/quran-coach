import {expect,it} from 'vitest';
import {readerPageScale,canShowBookSpread,READER_BASE_ZOOM} from './readerPageScale';
const base=READER_BASE_ZOOM;
it('fills the text width and does not shrink it when captions or desk controls reduce height',()=>{
 for(const width of [312,382,422,700]){
  const tall=readerPageScale(width,734,false,false,base);
  const short=readerPageScale(width,230,false,true,base);
  expect(tall*484).toBeCloseTo(width);
  expect(short).toBe(tall);
  // All words in the verified 66..534 column stay inside the centered viewport.
  expect((600*tall-width)/2).toBeLessThan(66*tall);
 }
});
it('fits the entire page and spread, including the real gutter, when requested',()=>{
 for(const spread of [false,true])for(const [w,h] of [[382,600],[740,450],[1172,734]]){
  const scale=readerPageScale(w,h,spread,false,base,'page');
  expect(scale*(spread?1200:600)+(spread?4:0)).toBeLessThanOrEqual(w+1e-8);
  expect(scale*860).toBeLessThanOrEqual(h+1e-8);
 }
});
it('honors custom zoom in both single and double pages',()=>{
 for(const spread of [false,true])for(const framing of ['text','page'] as const){
  const normal=readerPageScale(820,700,spread,false,base,framing);
  expect(readerPageScale(820,700,spread,false,base*1.5,framing)).toBeCloseTo(normal*1.5);
 }
});
it('keeps two leaves readable, cropping only the two outer margins',()=>{
 expect(canShowBookSpread(740,730)).toBe(true);
 expect(canShowBookSpread(700,730)).toBe(false);
 expect(canShowBookSpread(390,700)).toBe(false);
 expect(canShowBookSpread(812,290)).toBe(false);
 const scale=readerPageScale(740,730,true,false,base);
 expect(scale*468).toBeGreaterThan(317);
 expect((1200*scale+4-740)/2).toBeLessThan(66*scale);
});
it('frames the narrower opening pages without clipping their verified 108..492 text column',()=>{
 for(const page of [1,2]){
  const scale=readerPageScale(382,734,false,false,base,'text',page);
  expect(scale).toBeGreaterThan(readerPageScale(382,734,false,false,base,'text',3));
  expect((600*scale-382)/2).toBeLessThan(108*scale);
  expect(readerPageScale(382,734,false,false,base,'page',page)).toBe(readerPageScale(382,734,false,false,base,'page',3));
 }
});
