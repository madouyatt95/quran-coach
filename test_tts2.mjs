import fetch from 'node-fetch';

async function testTTS(client) {
    const text = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=${client}&tl=ar&q=${encodeURIComponent(text)}`;

    console.log(`Testing client=${client} on translate.google.com`);
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "http://localhost:5173"
        }
    });
    console.log(`[${client}] Status: ${response.status} ${response.statusText}`);
}

async function run() {
    await testTTS('tw-ob');
    await testTTS('dict-chrome-ex');
    await testTTS('gtx');
}
run();
