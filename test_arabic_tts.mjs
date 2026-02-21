import { Client, handle_file } from "@gradio/client";
import fs from "fs";
import path from "path";

const SPACE_ID = "IbrahimSalah/Arabic-TTS-Spark";

// Salat Ibrahimiya - fully diacritized
const DUA_TEXT = "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ";

// Default reference transcript (from the Space itself)
const REF_TRANSCRIPT = "لَا يَمُرُّ يَوْمٌ إِلَّا وَأَسْتَقْبِلُ عِدَّةَ رَسَائِلَ، تَتَضَمَّنُ أَسْئِلَةً مُلِحَّةْ.";

const OUTPUT_PATH = path.resolve("./test_tts_output.wav");

async function generateSpeech() {
    console.log("🔌 Connecting to Arabic-TTS-Spark Space...");
    const client = await Client.connect(SPACE_ID);
    console.log("✅ Connected!");

    // Check if we have a local reference audio
    const localRef = path.resolve("./jibreen_al_isra_sample.mp3");
    let refAudio;
    if (fs.existsSync(localRef)) {
        console.log("🎵 Using local reference audio:", localRef);
        refAudio = handle_file(localRef);
    } else {
        console.log("🎵 Using Space default reference audio");
        refAudio = null; // Will use the Space default
    }

    console.log("\n🎤 Generating speech for Salat Ibrahimiya...");
    console.log("Text:", DUA_TEXT.substring(0, 60) + "...");
    console.log("⏳ This may take 30-120 seconds on ZeroGPU...\n");

    try {
        const result = await client.predict("/generate_speech", {
            text: DUA_TEXT,
            // Use default reference audio from the space
            reference_transcript: REF_TRANSCRIPT,
            temperature: 0.8,
            top_p: 0.95,
            max_chunk_length: 300,
            crossfade_duration: 0.08,
        });

        console.log("📊 Result:", JSON.stringify(result.data, null, 2));

        // The first return value is the audio file
        const audioData = result.data[0];
        const statusText = result.data[1];

        console.log("\n📝 Status:", statusText);

        if (audioData && audioData.url) {
            console.log("🔗 Audio URL:", audioData.url);

            // Download the audio file
            const response = await fetch(audioData.url);
            const buffer = Buffer.from(await response.arrayBuffer());
            fs.writeFileSync(OUTPUT_PATH, buffer);
            console.log(`\n✅ Audio saved to: ${OUTPUT_PATH}`);
            console.log(`📦 File size: ${(buffer.length / 1024).toFixed(1)} KB`);
        } else if (audioData && audioData.path) {
            console.log("📁 Audio path:", audioData.path);
        } else {
            console.log("⚠️ No audio data returned");
        }
    } catch (err) {
        console.error("❌ Generation failed:", err.message);
        if (err.message.includes("queue")) {
            console.log("💡 The Space might be busy. Try again in a few minutes.");
        }
    }
}

generateSpeech();
