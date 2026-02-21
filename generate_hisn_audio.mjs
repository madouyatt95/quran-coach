/**
 * Generate MP3 audio files for all Hisnul Muslim invocations
 * Uses Microsoft Edge TTS with ar-SA-HamedNeural voice
 * 
 * Usage: node generate_hisn_audio.mjs
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";

const VOICE = "ar-SA-HamedNeural";
const OUTPUT_DIR = path.resolve("./public/audio/hisn");

// ─── Parse hisnulMuslim.ts to extract all duas ─────────────────────────────
function extractDuasFromSource() {
    const filePath = path.resolve("./src/data/hisnulMuslim.ts");
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract all dua objects using regex
    const duas = [];
    const duaRegex = /\{\s*"id":\s*(\d+),\s*"arabic":\s*"([^"]+)"/g;
    let match;

    while ((match = duaRegex.exec(content)) !== null) {
        const id = parseInt(match[1]);
        let arabic = match[2];

        // Clean up the Arabic text for TTS:
        // Remove « » quotes
        arabic = arabic.replace(/[«»]/g, '').trim();
        // Remove ﴿ ﴾ brackets
        arabic = arabic.replace(/[﴿﴾]/g, '').trim();
        // Remove parenthetical annotations like (ثَلَاثَ مَرَّاتٍ) 
        arabic = arabic.replace(/\(.*?\)/g, '').trim();
        // Remove [...] brackets
        arabic = arabic.replace(/\[.*?\]/g, '').trim();
        // Remove Quranic reference like [آية الكرسي] or [سُورَةُ الْبَقَرَةِ: 285-286]
        arabic = arabic.replace(/\[.*?\]/g, '').trim();
        // Remove ellipsis
        arabic = arabic.replace(/\.\.\./g, '').trim();
        // Remove trailing period
        arabic = arabic.replace(/\.$/, '').trim();
        // Collapse multiple spaces
        arabic = arabic.replace(/\s+/g, ' ').trim();

        // Skip if text is too short (just "bismillah" or similar very short)
        // or if it's mostly a reference/instruction rather than actual dua text
        if (arabic.length < 5) {
            console.log(`⏭️  Skipping dua ${id} (too short: "${arabic}")`);
            continue;
        }

        duas.push({ id, arabic });
    }

    return duas;
}

// ─── Generate a single MP3 ─────────────────────────────────────────────────
async function generateOne(tts, dua, index, total) {
    const outputSubDir = path.join(OUTPUT_DIR, `dua_${dua.id}`);
    const outputFile = path.join(OUTPUT_DIR, `dua_${dua.id}.mp3`);

    // Skip if already generated
    if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        if (stats.size > 1000) { // More than 1KB = likely valid
            console.log(`⏭️  [${index + 1}/${total}] dua_${dua.id}.mp3 already exists (${(stats.size / 1024).toFixed(1)}KB)`);
            return true;
        }
    }

    const preview = dua.arabic.substring(0, 50) + (dua.arabic.length > 50 ? "..." : "");
    console.log(`🎤 [${index + 1}/${total}] Generating dua_${dua.id}.mp3 — ${preview}`);

    try {
        // Create temp dir for this dua
        if (fs.existsSync(outputSubDir)) fs.rmSync(outputSubDir, { recursive: true, force: true });
        fs.mkdirSync(outputSubDir, { recursive: true });

        const result = await tts.toFile(outputSubDir, dua.arabic);

        // Move from subdir to clean filename
        if (fs.existsSync(result.audioFilePath)) {
            fs.copyFileSync(result.audioFilePath, outputFile);
            const stats = fs.statSync(outputFile);
            console.log(`   ✅ ${(stats.size / 1024).toFixed(1)} KB`);

            // Cleanup temp dir
            fs.rmSync(outputSubDir, { recursive: true, force: true });
            return true;
        }
    } catch (err) {
        console.error(`   ❌ Failed: ${err.message}`);
        // Cleanup temp dir on error
        if (fs.existsSync(outputSubDir)) fs.rmSync(outputSubDir, { recursive: true, force: true });
    }
    return false;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
    console.log("📖 Extracting duas from hisnulMuslim.ts...");
    const duas = extractDuasFromSource();
    console.log(`📊 Found ${duas.length} duas to generate\n`);

    // Create output directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    let success = 0;
    let failed = 0;
    let skipped = 0;

    // Process in batches to avoid WebSocket connection issues
    const BATCH_SIZE = 10;

    for (let batchStart = 0; batchStart < duas.length; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, duas.length);
        const batch = duas.slice(batchStart, batchEnd);

        console.log(`\n━━━ Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(duas.length / BATCH_SIZE)} (duas ${batchStart + 1}-${batchEnd}) ━━━`);

        // Create a fresh TTS instance per batch
        const tts = new MsEdgeTTS();
        await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

        for (let i = 0; i < batch.length; i++) {
            const globalIndex = batchStart + i;
            const ok = await generateOne(tts, batch[i], globalIndex, duas.length);
            if (ok) success++;
            else failed++;
        }

        try { tts.close(); } catch (e) { /* ignore */ }

        // Small delay between batches
        if (batchEnd < duas.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n${"═".repeat(50)}`);
    console.log(`✅ Succès: ${success}`);
    console.log(`❌ Échecs: ${failed}`);
    console.log(`📂 Fichiers dans: ${OUTPUT_DIR}`);

    // List all generated files
    if (fs.existsSync(OUTPUT_DIR)) {
        const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp3'));
        const totalSize = files.reduce((sum, f) => sum + fs.statSync(path.join(OUTPUT_DIR, f)).size, 0);
        console.log(`📦 Total: ${files.length} fichiers, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
    }
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
