/**
 * TajweedCanvas — Renders Arabic text with Tajweed colors on a <canvas>.
 * Uses HarfBuzz WASM for correct text shaping (preserving Arabic ligatures).
 * Only used on iOS where HTML <span> elements break ligatures.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { initHarfBuzz, shapeText, isHarfBuzzReady } from '../../lib/harfbuzzService';
import { TAJWEED_RULES } from '../../lib/tajweedService';

interface TajweedCanvasProps {
    /** Raw tajweed HTML from the API */
    tajweedHtml: string;
    /** Which tajweed layers are enabled */
    enabledLayers: string[];
    /** Font size in CSS pixels */
    fontSize?: number;
    /** Line height multiplier */
    lineHeight?: number;
    /** Text color (default) */
    color?: string;
    /** Container width (for line wrapping) */
    containerWidth?: number;
}

/** Maps tajweed rule IDs to their CSS color */
const TAJWEED_COLORS: Record<string, string> = {
    // Madd - Blues
    madda_normal: '#537FFF',
    madda_permissible: '#4169E1',
    madda_necessary: '#00008B',
    madda_obligatory: '#1E90FF',
    madd_2: '#537FFF',
    madd_4: '#4169E1',
    madd_6: '#00008B',
    madd_246: '#537FFF',
    madd_munfasil: '#4169E1',
    madd_muttasil: '#1E90FF',
    // Ghunnah - Greens
    ghunnah: '#169200',
    ghunnah_2: '#169200',
    // Qalqalah - Red-orange
    qalqalah: '#DD0008',
    qalaqah: '#DD0008',
    // Idgham - Oranges
    idgham_ghunnah: '#FF7F00',
    idgham_no_ghunnah: '#FF6347',
    idgham_wo_ghunnah: '#FF6347',
    idgham_mutajanisayn: '#FFA07A',
    idgham_mutaqaribayn: '#FFB347',
    idgham_shafawi: '#FF8C00',
    // Ikhfa - Purple
    ikhfa: '#9400D3',
    ikhfa_shafawi: '#BA55D3',
    ikhafa: '#9400D3',
    ikhafa_shafawi: '#BA55D3',
    // Iqlab - Teal
    iqlab: '#26BFBF',
    // Izhar - dark red
    izhar: '#8B0000',
    izhar_shafawi: '#A52A2A',
    izhar_halqi: '#8B0000',
    // Other
    ham_wasl: '#AAAAAA',
    laam_shamsiyah: '#FF69B4',
    silent: '#AAAAAA',
    slnt: '#AAAAAA',
};

interface TajweedSegment {
    text: string;
    ruleId: string | null;
    color: string;
}

/**
 * Check if a rule is enabled based on user's layer settings.
 */
function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    if (enabledLayers.includes(ruleId)) return true;
    // Category map: same as tajweedParser.tsx
    const categoryMap: Record<string, string> = {
        madda_normal: 'madd', madda_permissible: 'madd', madda_necessary: 'madd', madda_obligatory: 'madd',
        madd_2: 'madd', madd_4: 'madd', madd_6: 'madd', madd_246: 'madd', madd_munfasil: 'madd', madd_muttasil: 'madd',
        ghunnah: 'ghunnah', ghunnah_2: 'ghunnah',
        qalqalah: 'qalqalah', qalaqah: 'qalqalah',
        idgham_ghunnah: 'idgham', idgham_no_ghunnah: 'idgham', idgham_wo_ghunnah: 'idgham',
        idgham_mutajanisayn: 'idgham', idgham_mutaqaribayn: 'idgham', idgham_shafawi: 'idgham',
        ikhfa: 'ikhfa', ikhfa_shafawi: 'ikhfa', ikhafa: 'ikhfa', ikhafa_shafawi: 'ikhfa',
        iqlab: 'iqlab',
        izhar: 'izhar', izhar_shafawi: 'izhar', izhar_halqi: 'izhar',
        ham_wasl: 'other', laam_shamsiyah: 'other', silent: 'other', slnt: 'other',
    };
    const cat = categoryMap[ruleId];
    if (cat && enabledLayers.includes(cat)) return true;
    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const p of prefixes) {
        if (ruleId.startsWith(p) && enabledLayers.includes(p)) return true;
    }
    if (ruleId.startsWith('madda') && enabledLayers.includes('madd')) return true;
    return false;
}

/**
 * Parse tajweed HTML into segments with text and color.
 */
function parseTajweedSegments(html: string, enabledLayers: string[], defaultColor: string): TajweedSegment[] {
    // Remove verse numbers
    let clean = html.replace(/<span\s+class=end>[^<]*<\/span>/g, '');
    const segments: TajweedSegment[] = [];
    const tagRe = /<tajweed\s+class=([^>]+)>([^<]*)<\/tajweed>/g;
    let lastIdx = 0;
    let m;
    while ((m = tagRe.exec(clean)) !== null) {
        if (m.index > lastIdx) {
            segments.push({ text: clean.substring(lastIdx, m.index), ruleId: null, color: defaultColor });
        }
        const ruleId = m[1];
        const content = m[2];
        const rule = TAJWEED_RULES[ruleId];
        const enabled = rule && isRuleEnabled(ruleId, enabledLayers);
        segments.push({
            text: content,
            ruleId: enabled ? ruleId : null,
            color: enabled ? (TAJWEED_COLORS[ruleId] || defaultColor) : defaultColor,
        });
        lastIdx = m.index + m[0].length;
    }
    if (lastIdx < clean.length) {
        segments.push({ text: clean.substring(lastIdx), ruleId: null, color: defaultColor });
    }
    return segments;
}

/**
 * Build a map: character index → color, from segments.
 */
function buildColorMap(segments: TajweedSegment[]): Map<number, string> {
    const map = new Map<number, string>();
    let charIdx = 0;
    for (const seg of segments) {
        for (let i = 0; i < seg.text.length; i++) {
            map.set(charIdx + i, seg.color);
        }
        charIdx += seg.text.length;
    }
    return map;
}

export const TajweedCanvas: React.FC<TajweedCanvasProps> = ({
    tajweedHtml,
    enabledLayers,
    fontSize = 24,
    lineHeight = 2.4,
    color = '#1a1a2e',
    containerWidth,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(isHarfBuzzReady());
    const [fallbackText, setFallbackText] = useState<string | null>(null);

    // Initialize HarfBuzz lazily
    useEffect(() => {
        if (!ready) {
            initHarfBuzz().then((ok) => {
                setReady(ok);
                if (!ok) {
                    // Fallback: show plain text
                    setFallbackText(
                        tajweedHtml
                            .replace(/<span\s+class=end>[^<]*<\/span>/g, '')
                            .replace(/<[^>]+>/g, '')
                    );
                }
            });
        }
    }, [ready, tajweedHtml]);

    // Render on canvas when ready
    const renderCanvas = useCallback(() => {
        if (!ready || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Parse segments and get plain text
        const segments = parseTajweedSegments(tajweedHtml, enabledLayers, color);
        const plainText = segments.map(s => s.text).join('');
        const colorMap = buildColorMap(segments);

        // Shape the entire text as one block (preserves all ligatures)
        const glyphs = shapeText(plainText, fontSize);
        if (glyphs.length === 0) {
            setFallbackText(plainText);
            return;
        }

        // Calculate total width
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);

        // Set canvas dimensions (with device pixel ratio for sharpness)
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = containerWidth || totalWidth + 20;
        const canvasHeight = fontSize * lineHeight;

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Render glyphs. RTL: start from the right edge
        let xCursor = canvasWidth - 10; // Start from right with some padding
        const yBaseline = fontSize * 1.2; // Approximate baseline position

        for (const glyph of glyphs) {
            // Get color for this glyph based on its cluster (character index)
            const glyphColor = colorMap.get(glyph.cluster) || color;

            // Parse and draw SVG path
            if (glyph.svgPath) {
                ctx.save();
                ctx.translate(xCursor + glyph.xOffset, yBaseline - glyph.yOffset);
                // Scale from font units to canvas pixels
                const scale = fontSize / 1000; // Typical upem is 1000 or 2048
                ctx.scale(scale, -scale); // Flip Y for font coordinates

                ctx.fillStyle = glyphColor;
                const path = new Path2D(glyph.svgPath);
                ctx.fill(path);
                ctx.restore();
            }

            xCursor -= glyph.xAdvance; // RTL: move left
        }
    }, [ready, tajweedHtml, enabledLayers, fontSize, lineHeight, color, containerWidth]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    // Show plain text fallback while HarfBuzz loads or if it fails
    if (fallbackText !== null || !ready) {
        const text = fallbackText || tajweedHtml
            .replace(/<span\s+class=end>[^<]*<\/span>/g, '')
            .replace(/<[^>]+>/g, '');
        return <span style={{ color }}>{text}</span>;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'inline-block',
                maxWidth: '100%',
                direction: 'rtl',
                verticalAlign: 'baseline',
            }}
        />
    );
};

export default TajweedCanvas;
