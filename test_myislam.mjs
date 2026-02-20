import fetch from 'node-fetch';

async function fetchMyIslam() {
    console.log("Fetching myislam.org...");
    try {
        const res = await fetch("https://myislam.org/hisnul-muslim/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        const text = await res.text();
        const urls = text.match(/https:\/\/[^"']+\.mp3/g);
        console.log("Found MP3 URLs:", urls ? urls.slice(0, 10) : "None");
    } catch (e) {
        console.error(e);
    }
}
fetchMyIslam();
