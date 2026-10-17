import { loadFrenchWords } from './french';
import { canonicalPage, decodePage, isInteractivePage, pageUrl, PAGE_MANIFEST, type InteractivePage, type PageNumber, type PageResponse } from './model';
import { cachedFontSource, detectFontRenderMode, fontPaintsPage, fontPaletteName, fontUrl, saveLoadedFont, UNICODE_ARABIC_FONT, type FontPaintSample, type FontRenderMode, type PaperTheme } from './fontResources';
export { fontUrl, type PaperTheme } from './fontResources';
const pages=new Map<number,Promise<InteractivePage>>();
const fonts=new Map<string,Promise<PageFont>>();
const faces=new Map<string,FontFace>();
const palettes=new Map<string,HTMLStyleElement>();
const MAX_PAGES=12;
export interface PageFont { family:string; mode:FontRenderMode }
export const UNICODE_PAGE_FONT:PageFont={family:UNICODE_ARABIC_FONT,mode:'unicode'};
function trimPages() { while(pages.size>MAX_PAGES){const key=[...pages.keys()].find(p=>p!==1)!;pages.delete(key);} }
/** Quran page responses remain session-only; long-term text storage requires Content Sync. */
export function loadInteractivePage(page:PageNumber):Promise<InteractivePage> {
    if(!isInteractivePage(page))return Promise.reject(new Error('Page hors du Mushaf.'));
    const cached=pages.get(page);if(cached){pages.delete(page);pages.set(page,cached);return cached;}
    const pending=fetch(pageUrl(page),{signal:AbortSignal.timeout(20000)}).then(async response=>{
        if(!response.ok)throw new Error('Cette page est momentanément indisponible.');
        const data=await response.json() as PageResponse;
        // Some public by_page responses omit a verse despite reporting the full count.
        // Fill only references present in the independently audited edition manifest.
        const expected=PAGE_MANIFEST[page];
        if(expected && Array.isArray(data.verses) && data.pagination?.next_page===null) {
            for(const key of expected.verseKeys) {
                if(data.verses.some(v=>v.verse_key===key))continue;
                const extra=await fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?words=true&word_fields=code_v2,text_uthmani,text_uthmani_tajweed&language=fr&mushaf=19`,{signal:AbortSignal.timeout(20000)});
                if(!extra.ok)throw new Error('Cette page est momentanément indisponible.');
                const body=await extra.json();if(!body.verse || body.verse.verse_key!==key)throw new Error('Verset indisponible.');
                data.verses.push(body.verse);
            }
            data.verses=data.verses.filter(v=>expected.verseKeys.includes(v.verse_key)).sort((a,b)=>a.id-b.id);
            data.pagination.total_records=expected.verseKeys.length;
        }
        const decoded=decodePage(page,data);
        const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalPage(data)));
        const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
        if(hash!==PAGE_MANIFEST[page].sha256)throw new Error('Cette page nécessite une nouvelle vérification.');
        // French is an independent sourced dataset; a failed chunk never blocks Quran text.
        const translations=await Promise.all([...new Set(decoded.verses.map(v=>v.surah!))].map(surah=>loadFrenchWords(surah).catch(()=>({} as Record<string,string>))));
        const french=Object.assign({},...translations) as Record<string,string>;
        decoded.words=decoded.words.map(word=>({...word,french:word.kind==='word'?french[word.key]||word.french:null}));
        return decoded;
    }).catch(error=>{pages.delete(page);throw error;});
    pages.set(page,pending);trimPages();return pending;
}
function pageFontSamples(words:InteractivePage['words']):FontPaintSample[] {
    return words.filter(word=>word.kind==='word').map(word=>({glyph:word.glyph,hasTajweedColor:word.rules.length>0}));
}
function ensureFontPalette(family:string,theme:PaperTheme) {
    if(typeof document==='undefined'||!document.head)return;
    const key=`${family}:${theme}`;
    if(palettes.has(key))return;
    const style=document.createElement('style');
    const palette=theme==='dark'?1:theme==='sepia'?2:0;
    style.textContent=`@font-palette-values ${fontPaletteName(family,theme)} { font-family: "${family}"; base-palette: ${palette}; }`;
    document.head.append(style);palettes.set(key,style);
}
function removeFontPalettes(family:string) {
    for(const [key,style] of palettes){if(key.startsWith(`${family}:`)){style.remove();palettes.delete(key);}}
}
export function loadPageFont(page:PageNumber,theme:PaperTheme='light',samples:FontPaintSample[]=[]):Promise<PageFont> {
    if(!isInteractivePage(page))return Promise.reject(new Error('Page hors du Mushaf.'));
    const preferred=detectFontRenderMode();
    if(preferred==='unicode'||!samples.length)return Promise.resolve(UNICODE_PAGE_FONT);
    // Safari on iOS uses COLRv1 with CSS palettes. The OT-SVG packs are for Firefox.
    const modes:FontRenderMode[]=[preferred];
    return (async()=>{
        for(const mode of modes){
            const svg=mode==='svg',key=`${page}-${mode}-${svg?theme:'color'}`;
            try {
                let loaded=fonts.get(key);
                if(!loaded){
                    loaded=(async()=>{
                        const family=`QuranCoachQCF4Page${page}_${mode}${svg?theme:''}`;
                        const url=fontUrl(page,svg,theme),source=await cachedFontSource(url);
                        const face=new FontFace(family,source.bytes,{display:'block'});
                        let timer:ReturnType<typeof setTimeout>|undefined;
                        try {await Promise.race([face.load(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Le chargement de la police a expiré.')),20000);})]);}
                        finally {if(timer)clearTimeout(timer);}
                        document.fonts.add(face);faces.set(key,face);
                        // iOS may finish FontFace.load() before the face is usable by
                        // Canvas/DOM text. Ask the font set to shape real page glyphs too.
                        if(document.fonts.load)await document.fonts.load(`64px "${family}"`,samples.map(sample=>sample.glyph).join(''));
                        if(!source.cached)void saveLoadedFont(url,source.bytes);
                        while(faces.size>MAX_PAGES+3){const old=[...faces.keys()].find(k=>!k.startsWith('1-')&&k!==key);if(!old)break;const oldFace=faces.get(old)!;document.fonts.delete(oldFace);removeFontPalettes(oldFace.family);faces.delete(old);fonts.delete(old);}
                        return {family,mode};
                    })();
                    fonts.set(key,loaded);
                    void loaded.catch(()=>fonts.delete(key));
                }
                const font=await loaded;
                if(font.mode==='colrv1')ensureFontPalette(font.family,theme);
                // Canvas does not inherit the DOM font-palette declaration. For COLRv1,
                // verify that the private-use QCF glyphs render, then trust the palette
                // already applied to the actual page text. OT-SVG has baked-in colors.
                if(fontPaintsPage(font.family,samples,{requireTajweedColor:mode==='svg'}))return font;
                const face=faces.get(key);if(face){document.fonts.delete(face);removeFontPalettes(face.family);faces.delete(key);}
                fonts.delete(key);
            } catch { fonts.delete(key); }
        }
        return UNICODE_PAGE_FONT;
    })();
}
/** One adjacent page only. Failed prefetch never prevents the current page from rendering. */
export function prepareNextPage(page:number,theme:PaperTheme) {
    if(isInteractivePage(page))void loadInteractivePage(page).then(data=>loadPageFont(page,theme,pageFontSamples(data.words))).catch(()=>{});
}
export { pageFontSamples };
