import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cachedFontSource, detectFontRenderMode, FONT_CACHE, fontBytes, fontPackUrls, fontPaintsPage, fontPaletteName, fontUrl, isAppleMobileWebKit, saveLoadedFont, unicodeWord } from './fontResources';
const valid = () => { const bytes=new Uint8Array(64);bytes.set([119,79,70,50]);return bytes; };
let entries:Map<string,Response>;
beforeEach(()=>{
 entries=new Map();
 vi.stubGlobal('caches',{open:vi.fn(async()=>({match:async(url:string)=>entries.get(url)?.clone(),put:async(url:string,r:Response)=>{entries.set(url,r);},delete:async(url:string)=>entries.delete(url)}))});
});
afterEach(()=>vi.unstubAllGlobals());
it('covers all 604 pages without duplicates, including all fallback themes',()=>{
 expect(new Set(fontPackUrls(false)).size).toBe(604);
 expect(new Set(fontPackUrls(true)).size).toBe(1812);
 expect(fontPackUrls(true)).toContain(fontUrl(604,true,'dark'));
 expect(()=>fontUrl(605)).toThrow();
});
it('selects a supported color font format and never forces a palette on SVG fonts',()=>{
 const supportsColr=(feature:string)=>feature==='font-tech(color-COLRv1)';
 const supportsSvg=(feature:string)=>feature==='font-tech(color-SVG)';
 expect(detectFontRenderMode(supportsColr)).toBe('colrv1');
 expect(detectFontRenderMode(supportsSvg)).toBe('svg');
 expect(detectFontRenderMode(()=>false)).toBe('unicode');
});
it('uses Safari-compatible COLRv1 on Apple WebKit and reserves OT-SVG for browsers that request it',()=>{
 const supports=(feature:string)=>feature==='font-tech(color-COLRv1)'||feature==='font-tech(color-SVG)';
 expect(detectFontRenderMode(supports,{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5})).toBe('colrv1');
 expect(detectFontRenderMode(supports,{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 Version/18.4 Safari/605.1.15',platform:'MacIntel',maxTouchPoints:5})).toBe('colrv1');
 expect(detectFontRenderMode((feature)=>feature==='font-tech(color-COLRv1)',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5})).toBe('colrv1');
 expect(detectFontRenderMode((feature)=>feature==='font-tech(color-SVG)',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5})).toBe('colrv1');
 expect(detectFontRenderMode(()=>false,{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5})).toBe('colrv1');
 expect(isAppleMobileWebKit({userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0',platform:'Win32',maxTouchPoints:1})).toBe(false);
 expect(detectFontRenderMode(supports,{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0',platform:'Win32',maxTouchPoints:1})).toBe('colrv1');
});
it('creates stable, theme-specific CSS palette names for QCF fonts',()=>{
 expect(fontPaletteName('QuranCoachQCF4Page4_colrv1','light')).toBe('--iq-QuranCoachQCF4Page4_colrv1-light');
 expect(fontPaletteName('bad family; name','dark')).toBe('--iq-bad-family--name-dark');
});
it('keeps exact Unicode Quran words readable when custom QCF glyphs are unavailable',()=>{
 expect(unicodeWord({kind:'word',text:'الرَّحْمَٰنِ',verseKey:'1:1'})).toBe('الرَّحْمَٰنِ');
 expect(unicodeWord({kind:'end',text:'',verseKey:'2:17'})).toBe('١٧');
});
it('checks painted pixels instead of trusting CSS feature detection',()=>{
 const pixels=(rgb:number[])=>{const data=new Uint8ClampedArray(104*88*4);data.set([...rgb,255]);return {data};};
 const context={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData(){return pixels(this.font.includes('Color')?[9,176,0]:[18,18,18]);}};
 vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>context})});
 expect(fontPaintsPage('QuranCoachColor',[{glyph:'\ufc41',hasTajweedColor:true}])).toBe(true);
 expect(fontPaintsPage('QuranCoachMono',[{glyph:'\ufc41',hasTajweedColor:true}])).toBe(false);
 expect(fontPaintsPage('QuranCoachMono',[{glyph:'\ufc41',hasTajweedColor:false}])).toBe(true);
 expect(fontPaintsPage('QuranCoachMono',[])).toBe(false);
});
it('accepts visible COLRv1 glyphs when canvas cannot see the CSS palette colors',()=>{
 const data=new Uint8ClampedArray(104*88*4);data.set([18,18,18,255]);
 const context={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData:()=>({data})};
 vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>context})});
 const sample=[{glyph:'\ufc41',hasTajweedColor:true}];
 expect(fontPaintsPage('QuranCoachQCF4Page4_colrv1',sample)).toBe(false);
 expect(fontPaintsPage('QuranCoachQCF4Page4_colrv1',sample,{requireTajweedColor:false})).toBe(true);
});
it('reads a saved font after network loss without any fetch',async()=>{
 const url=fontUrl(1);await saveLoadedFont(url,valid().buffer);
 const fetcher=vi.fn().mockRejectedValue(new Error('offline'));vi.stubGlobal('fetch',fetcher);
 expect((await cachedFontSource(url)).cached).toBe(true);
 expect(fetcher).not.toHaveBeenCalled();expect(caches.open).toHaveBeenCalledWith(FONT_CACHE);
});
it('rejects HTML/error responses and removes an invalid cached font before retrying',async()=>{
 const url=fontUrl(604);entries.set(url,new Response('<html>unavailable</html>'));
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(valid())));
 const result=await cachedFontSource(url);expect(result.cached).toBe(false);expect(entries.has(url)).toBe(false);
 await expect(fontBytes(new Response('bad',{status:503}))).rejects.toThrow();
});
it('still permits online rendering when CacheStorage is blocked',async()=>{
 vi.stubGlobal('caches',{open:vi.fn().mockRejectedValue(new Error('blocked'))});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(valid())));
 expect((await cachedFontSource(fontUrl(1))).bytes.byteLength).toBe(64);
 await expect(saveLoadedFont(fontUrl(1),valid().buffer)).resolves.toBeUndefined();
});
