/**
 * TajweedCanvas — Renders Arabic text with Tajweed colors on a <canvas>.
 * Uses HarfBuzz WASM for correct text shaping (preserving Arabic ligatures).
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { initHarfBuzz, shapeText, isHarfBuzzReady, getFontUpem } from '../../lib/harfbuzzService';

interface TajweedCanvasProps {
    text: string;
    colors: (string | null)[];
    fontSize?: number;
    lineHeight?: number;
}

export const TajweedCanvas: React.FC<TajweedCanvasProps> = ({
    text,
    colors,
    fontSize = 30, // Higher base font size for clarity
    lineHeight = 1.6,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hbReady, setHbReady] = useState(isHarfBuzzReady());

    // Lazy initialization of HarfBuzz
    useEffect(() => {
        if (!hbReady) {
            initHarfBuzz().then(ok => {
                if (ok) setHbReady(true);
            });
        }
    }, [hbReady]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !hbReady || !colors) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Theme-aware base color detection
        const style = window.getComputedStyle(document.body);
        const defaultColor = style.getPropertyValue('--color-text-primary').trim() || '#F0E6D3';

        // 2. Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 3. Shape text
        const glyphs = shapeText(text, fontSize);
        if (glyphs.length === 0) return;

        // 4. Calculate dimensions
        const upem = getFontUpem();
        const scale = fontSize / upem;
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);

        // High DPI scaling
        const dpr = window.devicePixelRatio || 1;
        const padding = 2;
        const width = totalWidth + (padding * 2);
        const height = fontSize * lineHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // 5. Drawing loop
        let xCursor = totalWidth + padding;
        const yBaseline = (fontSize * lineHeight) * 0.72; // Adjusted baseline

        for (const glyph of glyphs) {
            const glyphColor = colors[glyph.cluster] || defaultColor;

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
    }, [hbReady, text, colors, fontSize, lineHeight]);

    // Use requestAnimationFrame for smooth and reliable drawing after mount
    useEffect(() => {
        let rafId: number;
        const loop = () => {
            if (hbReady) {
                draw();
            } else {
                rafId = requestAnimationFrame(loop);
            }
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [hbReady, draw]);

    // Fallback: Show colored text via spans if HarfBuzz is not yet ready
    if (!hbReady) {
        return <span style={{ color: colors[0] || 'inherit', whiteSpace: 'nowrap' }}>{text}</span>;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'inline-block',
                verticalAlign: 'baseline',
                margin: '0 0.5px',
                pointerEvents: 'none',
                maxWidth: 'none', // Prevent accidental squishing
            }}
        />
    );
};

export default TajweedCanvas;
