// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { prophets } from '../data/prophets';

const OUT_DIR = path.resolve(process.cwd(), 'public/audio/prophets');

function getGoogleTtsUrl(text: string): string {
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=fr&q=${encodeURIComponent(text)}`;
}

function chunkText(text: string, maxLength: number = 180): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/([.،!?؛\n]+)/);
    let current = '';

    for (const part of sentences) {
        if (current.length + part.length > maxLength && current.trim().length > 0) {
            chunks.push(current.trim());
            current = part;
        } else {
            current += part;
        }
    }
    if (current.trim().length > 0) {
        chunks.push(current.trim());
    }
    return chunks; // filter out punctuation-only chunks if needed, but google tts handles it
}

async function main() {
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    for (const prophet of prophets) {
        const filename = `${prophet.id}.mp3`;
        const filepath = path.join(OUT_DIR, filename);

        if (fs.existsSync(filepath)) {
            console.log(`Skipping ${filename} (already exists)`);
            continue;
        }

        const cleanText = `L'histoire de ${prophet.nameIslamic}. ${prophet.summary}`.replace(/"/g, '').replace(/'/g, ' ');
        const textChunks = chunkText(cleanText).filter(c => c.length > 2);

        console.log(`Generating audio for ${prophet.nameIslamic}... (${textChunks.length} chunks)`);

        try {
            const stream = fs.createWriteStream(filepath);
            for (const chunk of textChunks) {
                const res = await fetch(getGoogleTtsUrl(chunk), { referrerPolicy: 'no-referrer' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const buffer = await res.arrayBuffer();
                stream.write(Buffer.from(buffer));
                await new Promise(r => setTimeout(r, 700)); // Rate limit pause
            }
            stream.end();
            console.log(`✅ Saved ${filename}`);
        } catch (error) {
            console.error(`❌ Error generating ${filename}:`, error);
        }
    }
}

main().catch(console.error);
