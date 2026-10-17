/** Integrated application cache. Account confirmed 2026-10-10; see audit and QF credits. */
export const FONT_CACHE = 'quran-coach-qcf4-fonts-2026-10-v1';
export const FONT_PACK_ID = 'qcf4-fonts-2026-10-v1';
export type PaperTheme = 'light' | 'sepia' | 'dark';
export type FontRenderMode = 'colrv1' | 'svg' | 'unicode';
export const UNICODE_ARABIC_FONT = '"Geeza Pro", Amiri, "Noto Naskh Arabic", "Traditional Arabic", serif';
export interface FontPaintSample { glyph:string; hasTajweedColor:boolean }

export interface FontRuntimeEnvironment {
    userAgent: string;
    platform: string;
    maxTouchPoints: number;
}

function currentFontEnvironment(): FontRuntimeEnvironment {
    if (typeof navigator === 'undefined') return {userAgent:'',platform:'',maxTouchPoints:0};
    return {userAgent:navigator.userAgent||'',platform:navigator.platform||'',maxTouchPoints:navigator.maxTouchPoints||0};
}

/** Detect iPhone/iPad browsers, including iPadOS desktop-mode Safari and Capacitor. */
export function isAppleMobileWebKit(environment: FontRuntimeEnvironment = currentFontEnvironment()) {
    const appleMobile = /iPhone|iPad|iPod/i.test(environment.userAgent) ||
        (environment.platform === 'MacIntel' && environment.maxTouchPoints > 1);
    return appleMobile && /AppleWebKit/i.test(environment.userAgent);
}

/** Pick a font candidate; the page font loader validates its actual painted output. */
export function detectFontRenderMode(supports: (feature: string) => boolean = feature =>
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports(feature),
    environment: FontRuntimeEnvironment = currentFontEnvironment()): FontRenderMode {
    // Quran Foundation documents COLRv1 for Safari. OT-SVG is intended for Firefox.
    // Try COLRv1 directly on iOS even when its font-tech query is missing or inaccurate.
    if (isAppleMobileWebKit(environment)) return 'colrv1';
    if (supports('font-tech(color-COLRv1)')) return 'colrv1';
    if (supports('font-tech(color-SVG)')) return 'svg';
    return 'unicode';
}

export function fontPaletteName(family:string,theme:PaperTheme) {
    const safeFamily=family.replace(/[^a-zA-Z0-9_-]/g,'-');
    return `--iq-${safeFamily}-${theme}`;
}

export function unicodeWord(word: {kind:'word'|'end';text:string;verseKey:string}) {
    if (word.kind === 'word') return word.text;
    const ayah=word.verseKey.split(':')[1]||'';
    return ayah.replace(/[0-9]/g,digit=>'٠١٢٣٤٥٦٧٨٩'[Number(digit)]||digit);
}

export function fontUrl(page: number, svg = false, theme: PaperTheme = 'light') {
    if (!Number.isInteger(page) || page < 1 || page > 604) throw new Error('Page hors du Mushaf.');
    return `https://verses.quran.foundation/fonts/quran/hafs/v4/${svg ? `ot-svg/${theme}` : 'colrv1'}/woff2/p${page}.woff2`;
}
export function fontPackUrls(svg: boolean) {
    return Array.from({length:604}, (_, i) => svg
        ? (['light','sepia','dark'] as const).map(theme => fontUrl(i+1,true,theme))
        : [fontUrl(i+1)]).flat();
}
/** Test actual glyph painting, since a technology feature query can pass while the font stays blank. */
export function fontPaintsPage(family:string,samples:FontPaintSample[],options:{requireTajweedColor?:boolean}={}) {
    try {
        if(typeof document==='undefined')return false;
        const canvas=document.createElement('canvas');canvas.width=104;canvas.height=88;
        const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return false;
        const colorSamples=samples.filter(sample=>sample.hasTajweedColor&&sample.glyph).slice(0,24);
        const visibleSamples=colorSamples.length?colorSamples:samples.filter(sample=>sample.glyph).slice(0,8);
        if(!visibleSamples.length)return false;
        let visible=false,paintedColor=false;
        context.font=`64px "${family}"`;context.textBaseline='alphabetic';context.direction='rtl';
        for(const sample of visibleSamples){
            context.clearRect(0,0,canvas.width,canvas.height);context.fillStyle='#121212';context.fillText(sample.glyph,4,72);
            const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
            for(let i=0;i<pixels.length;i+=4){
                if(pixels[i+3]<100)continue;
                visible=true;
                if(sample.hasTajweedColor&&(Math.abs(pixels[i]-18)>35||Math.abs(pixels[i+1]-18)>35||Math.abs(pixels[i+2]-18)>35)){
                    paintedColor=true;break;
                }
            }
            if(paintedColor)break;
        }
        if(colorSamples.length&&options.requireTajweedColor!==false)return paintedColor;
        return visible;
    } catch { return false; }
}
export async function fontBytes(response: Response): Promise<ArrayBuffer> {
    if (!response.ok) throw new Error('Police momentanément indisponible.');
    const bytes = await response.arrayBuffer();
    const header = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
    if (bytes.byteLength < 48 || bytes.byteLength > 8 * 1024 * 1024 || String.fromCharCode(...header) !== 'wOF2')
        throw new Error('Le fichier reçu n’est pas une police valide.');
    return bytes;
}
/** CacheStorage works without a service worker, including in the Capacitor webview. */
export async function cachedFontSource(url: string): Promise<{bytes:ArrayBuffer; cached:boolean}> {
    try {
        const cache = await caches.open(FONT_CACHE), response = await cache.match(url);
        if (response) {
            try { return {bytes:await fontBytes(response),cached:true}; }
            catch { await cache.delete(url); }
        }
    } catch { /* Private browsing / unavailable storage: online reading still works. */ }
    const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
    return {bytes:await fontBytes(response),cached:false};
}
export async function saveLoadedFont(url: string, bytes: ArrayBuffer) {
    try {
        await (await caches.open(FONT_CACHE)).put(url, new Response(bytes, {headers:{'Content-Type':'font/woff2'}}));
    } catch { /* Quota failure must not prevent online reading. Explicit packs report it. */ }
}
