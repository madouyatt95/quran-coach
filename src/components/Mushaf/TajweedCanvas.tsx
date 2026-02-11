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
    /** Array of colors corresponding to each character in the text */
    colors: string[];
    /** Font size in CSS pixels */
    fontSize?: number;
    /** Line height multiplier */
    lineHeight?: number;
}

export const TajweedCanvas: React.FC<TajweedCanvasProps> = ({
    text,
    colors,
    fontSize = 28, // Slightly larger base for mobile readability
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

        // Shape the entire word as one block to preserve ligatures
        const glyphs = shapeText(text, fontSize);
        if (glyphs.length === 0) return;

        // Calculate metrics
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);
        const upem = getFontUpem();
        const scale = fontSize / upem;

        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        const padding = 2; // Small horizontal padding
        const canvasWidth = totalWidth + padding * 2;
        const canvasHeight = fontSize * lineHeight;

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Arabic is RTL. HarfBuzz gives glyphs in logical order (first char first).
        // To draw RTL, we start at the right side of the canvas.
        let xCursor = totalWidth + padding;
        const yBaseline = (fontSize * lineHeight) * 0.7; // Baseline position

        for (const glyph of glyphs) {
            // Pick color from the character cluster (original character index)
            const glyphColor = colors[glyph.cluster] || '#1a1a2e';

            if (glyph.svgPath) {
                ctx.save();

                // Position the glyph. 
                // xCursor is at the "end" (right) of the current glyph slot.
                // We draw the glyph relative to the baseline.
                ctx.translate(xCursor - glyph.xAdvance + glyph.xOffset, yBaseline - glyph.yOffset);

                // Scale SVG path from Font Units to Pixels.
                // Font Y is positive UP, Canvas Y is positive DOWN, so we scale by (scale, -scale).
                ctx.scale(scale, -scale);

                ctx.fillStyle = glyphColor;
                const path = new Path2D(glyph.svgPath);
                ctx.fill(path);
                ctx.restore();
            }

            // Move cursor left for next glyph
            xCursor -= glyph.xAdvance;
        }
    }, [ready, text, colors, fontSize, lineHeight]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    // Fallback while loading
    if (!ready) {
        return <span style={{ color: colors[0] || '#1a1a2e' }}>{text}</span>;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'inline-block',
                verticalAlign: 'baseline',
                margin: '0 0.5px',
                pointerEvents: 'none', // Allow clicks to pass through to ayah container
            }}
        />
    );
};

export default TajweedCanvas;
