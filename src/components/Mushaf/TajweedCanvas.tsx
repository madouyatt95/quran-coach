/**
 * TajweedCanvas — Renders Arabic text with Tajweed colors on a <canvas>.
 * Uses HarfBuzz WASM for correct text shaping (preserving Arabic ligatures).
 * Only used on iOS where HTML <span> elements break ligatures.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { initHarfBuzz, shapeText, isHarfBuzzReady, getFontUpem } from '../../lib/harfbuzzService';

interface TajweedCanvasProps {
    /** Plain text of the word to render */
    text: string;
    /** Array of colors corresponding to each character in the text. Null uses theme color. */
    colors: (string | null)[];
    /** Font size in CSS pixels */
    fontSize?: number;
    /** Line height multiplier */
    lineHeight?: number;
}

export const TajweedCanvas: React.FC<TajweedCanvasProps> = ({
    text,
    colors,
    fontSize = 28,
    lineHeight = 1.4,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(isHarfBuzzReady());

    // Initialize HarfBuzz lazily
    useEffect(() => {
        if (!ready) {
            initHarfBuzz().then((ok) => {
                setReady(ok);
            });
        }
    }, [ready]);

    const renderCanvas = useCallback(() => {
        if (!ready || !canvasRef.current || !colors) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Detect default text color from theme
        // We look for --color-text-primary defined on :root or body
        const style = window.getComputedStyle(document.body);
        const themeDefaultColor = style.getPropertyValue('--color-text-primary').trim() || '#F0E6D3';

        // 2. Shape the entire word as one block to preserve ligatures
        const glyphs = shapeText(text, fontSize);
        if (glyphs.length === 0) return;

        // 3. Calculate metrics
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);
        const upem = getFontUpem();
        const scale = fontSize / upem;

        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        const padding = 2;
        const canvasWidth = totalWidth + padding * 2;
        const canvasHeight = fontSize * lineHeight;

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Arabic is RTL. Start at the right side.
        let xCursor = totalWidth + padding;
        const yBaseline = (fontSize * lineHeight) * 0.7;

        for (const glyph of glyphs) {
            // Pick color: provided Tajweed color OR theme default
            const glyphColor = colors[glyph.cluster] || themeDefaultColor;

            if (glyph.svgPath) {
                ctx.save();
                ctx.translate(xCursor - glyph.xAdvance + glyph.xOffset, yBaseline - glyph.yOffset);
                ctx.scale(scale, -scale);

                ctx.fillStyle = glyphColor;
                const path = new Path2D(glyph.svgPath);
                ctx.fill(path);
                ctx.restore();
            }

            xCursor -= glyph.xAdvance;
        }
    }, [ready, text, colors, fontSize, lineHeight]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    // Fallback while loading
    if (!ready) {
        return <span style={{ color: 'inherit' }}>{text}</span>;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'inline-block',
                verticalAlign: 'baseline',
                margin: '0 0.5px',
                pointerEvents: 'none',
            }}
        />
    );
};

export default TajweedCanvas;
