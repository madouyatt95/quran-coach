import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

// Test dua - Salat Ibrahimiya (with full tashkeel)
const DUA_TEXT = "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ";

const outputDir = path.resolve("./test_edge_tts_output");
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

async function generateWithVoice(voiceName) {
    console.log(`\n🎤 Testing voice: ${voiceName}`);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    // toFile expects a DIRECTORY path, not a file path
    const voiceDir = path.join(outputDir, voiceName);
    fs.mkdirSync(voiceDir, { recursive: true });

    const result = await tts.toFile(voiceDir, DUA_TEXT);

    const stats = fs.statSync(result.audioFilePath);
    console.log(`✅ Saved: ${result.audioFilePath}`);
    console.log(`📦 Size: ${(stats.size / 1024).toFixed(1)} KB`);

    // Copy with a clean name
    const cleanPath = path.join(outputDir, `salat_ibrahimiya_${voiceName}.mp3`);
    fs.copyFileSync(result.audioFilePath, cleanPath);
    console.log(`📄 Copied to: ${cleanPath}`);

    tts.close();
    return cleanPath;
}

async function main() {
    console.log("📝 Text:", DUA_TEXT);

    try {
        await generateWithVoice("ar-SA-HamedNeural");
    } catch (err) {
        console.error("❌ ar-SA-HamedNeural failed:", err.message);
    }

    try {
        await generateWithVoice("ar-EG-ShakirNeural");
    } catch (err) {
        console.error("❌ ar-EG-ShakirNeural failed:", err.message);
    }

    console.log("\n🎧 Fini ! Ouvre les MP3 dans test_edge_tts_output/ pour écouter.");
}

main();
