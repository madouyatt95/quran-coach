/**
 * HarfBuzz WASM Service for iOS Tajweed
 * 
 * Shapes Arabic text with HarfBuzz (correct ligatures), then
 * returns SVG path data for each glyph.
 * Using KFGQPC Hafs Uthman Taha Naskh font for 100% authentic rendering.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HbInstance = any;

export interface ShapedGlyph {
    glyphId: number;
    cluster: number;
    xAdvance: number;
    xOffset: number;
    yOffset: number;
    svgPath: string;
}

let hbInstance: HbInstance = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hbFont: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hbFace: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hbBlob: any = null;
let initPromise: Promise<boolean> | null = null;

// Hafs Uthmanic font - the gold standard for Quranic text
const FONT_URL = 'https://github.com/quran/quran.com-frontend-next/raw/master/public/fonts/quran/hafs/v22/KFGQPC-HAFS-V22.ttf';

/**
 * Initialize HarfBuzz and load font. Returns true on success.
 */
export function initHarfBuzz(): Promise<boolean> {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('[HarfBuzz] Starting initialization...');

            // 1. Import harfbuzzjs
            const hb = await import('harfbuzzjs');
            hbInstance = await (hb.default || hb);

            // 2. Fetch the Professional Uthmanic font
            const fontResp = await fetch(FONT_URL);
            if (!fontResp.ok) throw new Error(`Font fetch failed: ${fontResp.status}`);
            const fontData = await fontResp.arrayBuffer();

            // 3. Create HarfBuzz font instance
            hbBlob = hbInstance.createBlob(fontData);
            hbFace = hbInstance.createFace(hbBlob, 0);
            hbFont = hbInstance.createFont(hbFace);

            console.log('[HarfBuzz] Initialization complete - Authentic Uthmanic font loaded');
            return true;
        } catch (err) {
            console.error('[HarfBuzz] Init failed:', err);
            initPromise = null;
            return false;
        }
    })();

    return initPromise;
}

/**
 * Shape Arabic text using HarfBuzz.
 * Returns glyph positions mapped back to character clusters.
 */
export function shapeText(text: string, fontSize: number): ShapedGlyph[] {
    if (!hbInstance || !hbFont) {
        console.warn('[HarfBuzz] Rendering attempted before initialization');
        return [];
    }

    // Scale optimization
    hbFont.setScale(fontSize * 64, fontSize * 64);

    const buffer = hbInstance.createBuffer();
    buffer.addText(text);
    buffer.setDirection('rtl');
    buffer.setScript('Arab');
    buffer.setLanguage('ar');
    hbInstance.shape(hbFont, buffer);

    const infos = buffer.json();
    const result: ShapedGlyph[] = [];

    for (const g of infos) {
        result.push({
            glyphId: g.g,
            cluster: g.cl,
            xAdvance: g.ax / 64,
            xOffset: g.dx / 64,
            yOffset: g.dy / 64,
            svgPath: hbFont.glyphToPath(g.g),
        });
    }

    buffer.destroy();
    return result;
}

export function isHarfBuzzReady(): boolean {
    return hbInstance !== null && hbFont !== null;
}

/**
 * Get the Units Per Em of the currently loaded font.
 */
export function getFontUpem(): number {
    return hbFace ? hbFace.getUnitsPerEm() : 2048;
}

/**
 * Cleanup HarfBuzz resources.
 */
export function destroyHarfBuzz(): void {
    if (hbFont) { hbFont.destroy(); hbFont = null; }
    if (hbFace) { hbFace.destroy(); hbFace = null; }
    if (hbBlob) { hbBlob.destroy(); hbBlob = null; }
    hbInstance = null;
    initPromise = null;
}
