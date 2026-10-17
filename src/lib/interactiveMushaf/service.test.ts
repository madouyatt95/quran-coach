import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { PageNumber } from './model';
beforeEach(()=>vi.resetModules());
afterEach(()=>vi.unstubAllGlobals());
it('does not request pages outside the Mushaf',async()=>{
    const network=vi.fn();vi.stubGlobal('fetch',network);
    const {loadInteractivePage,loadPageFont}=await import('./service');
    await expect(loadInteractivePage(605 as PageNumber)).rejects.toThrow('hors du Mushaf');
    await expect(loadPageFont(605 as PageNumber)).rejects.toThrow('hors du Mushaf');
    expect(network).not.toHaveBeenCalled();
});
it('uses the Unicode reader instead of invisible private glyphs when color-font formats are unsupported',async()=>{
 vi.stubGlobal('CSS',{supports:()=>false});
 const network=vi.fn();vi.stubGlobal('fetch',network);
 const {loadPageFont,UNICODE_PAGE_FONT}=await import('./service');
 await expect(loadPageFont(4)).resolves.toEqual(UNICODE_PAGE_FONT);
 expect(network).not.toHaveBeenCalled();
});
it('loads the QCF COLRv1 font on iPhone WebKit even when font-tech detection is absent',async()=>{
 vi.stubGlobal('navigator',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5});
 vi.stubGlobal('CSS',{supports:()=>false});
 vi.stubGlobal('caches',{open:vi.fn(async()=>({match:vi.fn(async()=>undefined),put:vi.fn(async()=>undefined)}))});
 const bytes=new Uint8Array(64);bytes.set([119,79,70,50]);
 const network=vi.fn().mockImplementation(()=>Promise.resolve(new Response(bytes)));vi.stubGlobal('fetch',network);
 const added:unknown[]=[];
 const context={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData(){const data=new Uint8ClampedArray(104*88*4);data.set([18,18,18,255]);return {data};}};
 const shapeFont=vi.fn(async()=>[]);
 vi.stubGlobal('document',{fonts:{add:(face:unknown)=>added.push(face),delete:vi.fn(),load:shapeFont},createElement:()=>({width:0,height:0,getContext:()=>context})});
 class MockFontFace {
  family:string;source:ArrayBuffer;
  constructor(family:string,source:ArrayBuffer){this.family=family;this.source=source;}
  load(){return Promise.resolve(this);}
 }
 vi.stubGlobal('FontFace',MockFontFace);
 const {loadPageFont}=await import('./service');
 await expect(loadPageFont(4,'dark',[{glyph:'\ufc41',hasTajweedColor:true}])).resolves.toMatchObject({mode:'colrv1',family:'QuranCoachQCF4Page4_colrv1'});
 expect(network).toHaveBeenCalledOnce();
 expect(network).toHaveBeenCalledWith('https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p4.woff2',expect.any(Object));
 expect(added).toHaveLength(1);
 expect(shapeFont).toHaveBeenCalledWith('64px "QuranCoachQCF4Page4_colrv1"','\ufc41');
});
it('uses the Safari COLRv1 font directly instead of trying the Firefox OT-SVG pack',async()=>{
 vi.stubGlobal('navigator',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5});
 vi.stubGlobal('CSS',{supports:()=>false});
 vi.stubGlobal('caches',{open:vi.fn(async()=>({match:vi.fn(async()=>undefined),put:vi.fn(async()=>undefined)}))});
 const bytes=new Uint8Array(64);bytes.set([119,79,70,50]);
 const network=vi.fn().mockImplementation(()=>Promise.resolve(new Response(bytes)));vi.stubGlobal('fetch',network);
 const context={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData(){const data=new Uint8ClampedArray(104*88*4);data.set([18,18,18,255]);return {data};}};
 vi.stubGlobal('document',{fonts:{add:vi.fn(),delete:vi.fn()},createElement:()=>({width:0,height:0,getContext:()=>context})});
 class MockFontFace {family:string;constructor(family:string){this.family=family;}load(){return Promise.resolve(this);}}
 vi.stubGlobal('FontFace',MockFontFace);
 const {loadPageFont}=await import('./service');
 await expect(loadPageFont(2,'light',[{glyph:'\ufc41',hasTajweedColor:true}])).resolves.toMatchObject({mode:'colrv1',family:'QuranCoachQCF4Page2_colrv1'});
 expect(network).toHaveBeenCalledOnce();
 expect(network).toHaveBeenCalledWith('https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p2.woff2',expect.any(Object));
});
it('applies the matching Quran Foundation font palette for the selected paper theme',async()=>{
 vi.stubGlobal('navigator',{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0',platform:'Win32',maxTouchPoints:1});
 vi.stubGlobal('CSS',{supports:(feature:string)=>feature==='font-tech(color-COLRv1)'});
 vi.stubGlobal('caches',{open:vi.fn(async()=>({match:vi.fn(async()=>undefined),put:vi.fn(async()=>undefined)}))});
 const bytes=new Uint8Array(64);bytes.set([119,79,70,50]);vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(bytes)));
 const colorContext={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData:()=>{const data=new Uint8ClampedArray(104*88*4);data.set([9,176,0,255]);return {data};}};
 const styles:Array<{textContent:string;remove:()=>void}>=[];
 vi.stubGlobal('document',{head:{append:(style:{textContent:string;remove:()=>void})=>styles.push(style)},fonts:{add:vi.fn(),delete:vi.fn()},createElement:(tag:string)=>tag==='style'?{textContent:'',remove:vi.fn()}:({width:0,height:0,getContext:()=>colorContext})});
 class MockFontFace {family:string;constructor(family:string){this.family=family;}load(){return Promise.resolve(this);}}
 vi.stubGlobal('FontFace',MockFontFace);
 const {loadPageFont}=await import('./service');
 const font=await loadPageFont(4,'dark',[{glyph:'\ufc41',hasTajweedColor:true}]);
 expect(font.mode).toBe('colrv1');expect(styles).toHaveLength(1);
 expect(styles[0].textContent).toContain('@font-palette-values --iq-QuranCoachQCF4Page4_colrv1-dark');
 expect(styles[0].textContent).toContain('base-palette: 1');
});
it('uses readable Unicode Arabic only when no QCF glyphs are actually visible',async()=>{
 vi.stubGlobal('navigator',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',platform:'iPhone',maxTouchPoints:5});
 vi.stubGlobal('CSS',{supports:(feature:string)=>feature==='font-tech(color-SVG)'||feature==='font-tech(color-COLRv1)'});
 vi.stubGlobal('caches',{open:vi.fn(async()=>({match:vi.fn(async()=>undefined),put:vi.fn(async()=>undefined)}))});
 vi.stubGlobal('fetch',vi.fn().mockImplementation(()=>Promise.resolve(new Response(new Uint8Array([119,79,70,50,...new Array(60).fill(0)])))));
 const context={font:'',textBaseline:'',direction:'',clearRect:vi.fn(),fillText:vi.fn(),getImageData(){return {data:new Uint8ClampedArray(104*88*4)};}};
 vi.stubGlobal('document',{fonts:{add:vi.fn(),delete:vi.fn()},createElement:()=>({width:0,height:0,getContext:()=>context})});
 class MockFontFace {load(){return Promise.resolve(this);}}
 vi.stubGlobal('FontFace',MockFontFace);
 const {loadPageFont,UNICODE_PAGE_FONT}=await import('./service');
 await expect(loadPageFont(4,'light',[{glyph:'\ufc41',hasTajweedColor:true}])).resolves.toEqual(UNICODE_PAGE_FONT);
 expect(fetch).toHaveBeenCalledTimes(1);
});
it('reports offline failure and permits a fresh retry without an invented fallback',async()=>{
    const network=vi.fn().mockRejectedValue(new TypeError('Offline'));vi.stubGlobal('fetch',network);
    const {loadInteractivePage}=await import('./service');
    await expect(loadInteractivePage(1)).rejects.toThrow('Offline');
    await expect(loadInteractivePage(1)).rejects.toThrow('Offline');
    expect(network).toHaveBeenCalledTimes(2);
});
it('deduplicates simultaneous page requests and rejects bad HTTP responses',async()=>{
    const network=vi.fn().mockResolvedValue({ok:false,status:503});vi.stubGlobal('fetch',network);
    const {loadInteractivePage}=await import('./service');
    const a=loadInteractivePage(1),b=loadInteractivePage(1);
    expect(a).toBe(b);await expect(a).rejects.toThrow('indisponible');expect(network).toHaveBeenCalledOnce();
});
it('rejects incomplete responses instead of showing a partial Quran page',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({verses:[]})}));
    const {loadInteractivePage}=await import('./service');
    await expect(loadInteractivePage(1)).rejects.toThrow('correspondent');
});
it.skipIf(!process.env.QCF_AUDIT_DIR)('rejects even a single changed letter and accepts the recorded source',async()=>{
    const source=JSON.parse(readFileSync(`${process.env.QCF_AUDIT_DIR}/v4-api-1.json`,'utf8'));
    const changed=structuredClone(source);changed.verses[0].words[0].text_uthmani+='ب';
    const network=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>changed}).mockResolvedValueOnce({ok:true,json:async()=>source});vi.stubGlobal('fetch',network);
    const {loadInteractivePage}=await import('./service');
    await expect(loadInteractivePage(1)).rejects.toThrow('vérification');
    const page=await loadInteractivePage(1);expect(page.verses).toHaveLength(7);
    expect(await loadInteractivePage(1)).toBe(page);expect(network).toHaveBeenCalledTimes(2);
});

it.skipIf(!process.env.QCF_AUDIT_DIR)('fills a missing official verse and drops a verse belonging to the adjacent edition page',async()=>{
 const source=JSON.parse(readFileSync(`${process.env.QCF_AUDIT_DIR}/v4-api-120.json`,'utf8'));
 const next=JSON.parse(readFileSync(`${process.env.QCF_AUDIT_DIR}/v4-api-121.json`,'utf8'));
 const partial=structuredClone(source),missing=partial.verses.pop();partial.verses.push(next.verses[0]);
 const network=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>partial}).mockResolvedValueOnce({ok:true,json:async()=>({verse:missing})});vi.stubGlobal('fetch',network);
 const {loadInteractivePage}=await import('./service');
 const page=await loadInteractivePage(120);expect(page.verses.at(-1)?.numberInSurah).toBe(77);
 expect(page.verses).toHaveLength(source.verses.length);expect(network).toHaveBeenCalledTimes(2);
});
