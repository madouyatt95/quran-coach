/**
 * TajweedCanvas — Renders Arabic text with Tajweed colors on a <canvas>.
 * Uses HarfBuzz WASM for correct text shaping (preserving Arabic ligatures).
 * Only used on iOS where HTML <span> elements break ligatures.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { initHarfBuzz, shapeText, isHarfBuzzReady } from '../../lib/harfbuzzService';

interface TajweedCanvasProps {
    /** Plain text to render */
    text: string;
    /** Text color */
    color?: string;
    /** Font size in CSS pixels */
    fontSize?: number;
    /** Line height multiplier */
    lineHeight?: number;
}

export const TajweedCanvas: React.FC<TajweedCanvasProps> = ({
    text,
    color = '#1a1a2e',
    fontSize = 24,
    lineHeight = 2.4,
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

    // Render on canvas when ready
    const renderCanvas = useCallback(() => {
        if (!ready || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Shape the entire text as one block (preserves all ligatures)
        const glyphs = shapeText(text, fontSize);
        if (glyphs.length === 0) return;

        // Calculate total width
        const totalWidth = glyphs.reduce((sum, g) => sum + g.xAdvance, 0);

        // Set canvas dimensions (with device pixel ratio for sharpness)
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = totalWidth + 4; // Tiny padding
        const canvasHeight = fontSize * lineHeight;

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Render glyphs. RTL: start from the right edge
        let xCursor = totalWidth;
        const yBaseline = fontSize * 1.2; // Approximate baseline position

        ctx.fillStyle = color;
        for (const glyph of glyphs) {
            // Parse and draw SVG path
            if (glyph.svgPath) {
                ctx.save();
                ctx.translate(xCursor + glyph.xOffset, yBaseline - glyph.yOffset);
                // Scale from font units to canvas pixels
                const scale = fontSize / 1000; // Typical upem is 1000 or 2048
                ctx.scale(scale, -scale); // Flip Y for font coordinates

                const path = new Path2D(glyph.svgPath);
                ctx.fill(path);
                ctx.restore();
            }
            xCursor -= glyph.xAdvance; // RTL: move left
        }
    }, [ready, text, fontSize, lineHeight, color]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    // Show plain text fallback while HarfBuzz loads or if it fails
    if (!ready) {
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
