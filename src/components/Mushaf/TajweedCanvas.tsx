/**
 * TajweedCanvas — Renders Arabic text with Tajweed colors on a <canvas>.
 * Uses HarfBuzz WASM for correct text shaping with Professional Uthmanic font.
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
    fontSize = 32, // Professional Mushaf sizing
    lineHeight = 1.8, // Generous line height for Uthmanic font flourishes
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hbReady, setHbReady] = useState(isHarfBuzzReady());

    // Lazy initialization of HarfBuzz core
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
        // We look for --color-text-primary defined on :root/body
        const style = window.getComputedStyle(document.body);
        const defaultColor = style.getPropertyValue('--color-text-primary').trim() || '#F0E6D3';

        // 2. Shape text with the loaded Uthmanic font
        const glyphs = shapeText(text, fontSize);
        if (glyphs.length === 0) return;

        // 3. Clear and Prep Metrics
        const upem = getFontUpem();
        const scale = fontSize / upem;
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);

        // High DPI scaling (Retina support)
        const dpr = window.devicePixelRatio || 1;
        const padding = 2; // Exact horizontal breathing room
        const width = totalWidth + (padding * 2);
        const height = fontSize * lineHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 4. Drawing loop (RTL)
        let xCursor = totalWidth + padding;
        const yBaseline = (fontSize * lineHeight) * 0.75; // Baseline tuning for Uthmanic font

        for (const glyph of glyphs) {
            // Apply rule color or fallback to theme primary
            const glyphColor = colors[glyph.cluster] || defaultColor;

            if (glyph.svgPath) {
                ctx.save();

                // Position relative to RTL baseline
                ctx.translate(xCursor - glyph.xAdvance + glyph.xOffset, yBaseline - glyph.yOffset);

                // SVG Path scale: Font Units to Canvas Pixels
                // Flip Y as canvas is positive down
                ctx.scale(scale, -scale);

                ctx.fillStyle = glyphColor;
                const path = new Path2D(glyph.svgPath);
                ctx.fill(path);
                ctx.restore();
            }
            xCursor -= glyph.xAdvance;
        }
    }, [hbReady, text, colors, fontSize, lineHeight]);

    // Use requestAnimationFrame loop to wait for initialization and draw
    useEffect(() => {
        let rafId: number;
        const loop = () => {
            if (isHarfBuzzReady()) {
                draw();
            } else {
                rafId = requestAnimationFrame(loop);
            }
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [draw]);

    // Fallback: Show original text while engine is warming up
    if (!hbReady) {
        return (
            <span style={{
                color: colors[0] || 'inherit',
                opacity: 0.5,
                whiteSpace: 'nowrap'
            }}>
                {text}
            </span>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'inline-block',
                verticalAlign: 'baseline',
                margin: '0 0.25px',
                pointerEvents: 'none',
                maxWidth: 'none',
            }}
        />
    );
};

export default TajweedCanvas;
