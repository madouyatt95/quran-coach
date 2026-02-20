import fetch from 'node-fetch';

async function testTTS() {
    const text = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=ar&q=${encodeURIComponent(text)}`;

    console.log("Fetching:", url);
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "http://localhost:5173"
        }
    });
    console.log("Status:", response.status, response.statusText);
    const type = response.headers.get("content-type");
    console.log("Content-Type:", type);
}

testTTS();
