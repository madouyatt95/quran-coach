const https = require('https');

const urls = [
    // Quran.com images repo (actual paths)
    'https://raw.githubusercontent.com/quran/quran.com-images/master/width_1024/page001.png',
    'https://raw.githubusercontent.com/quran/quran.com-images/master/width_1024/page1.png',
    // Different resolution
    'https://raw.githubusercontent.com/quran/quran.com-images/master/width_1920/page001.png',
    'https://raw.githubusercontent.com/quran/quran.com-images/master/width_1920/page1.png',
    // quran-tajweed repo
    'https://raw.githubusercontent.com/alsarmad/quran-tajweed/master/images/1.png',
    'https://raw.githubusercontent.com/alsarmad/quran-tajweed/master/images/page001.png',
    'https://raw.githubusercontent.com/alsarmad/quran-tajweed/master/images/001.png',
    // quran-images repo
    'https://raw.githubusercontent.com/GlobalQuran/quran-images/master/mushaf/page001.png'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ url, status: res.statusCode });
            res.resume();
        }).on('error', (e) => {
            resolve({ url, error: e.message });
        });
    });
}

async function main() {
    for (const url of urls) {
        const result = await checkUrl(url);
        if (result.status === 200) {
            console.log(`✅ FOUND SUCCESS: ${result.url}`);
        } else {
            console.log(`${result.status || result.error} - ${result.url}`);
        }
    }
}

main();
