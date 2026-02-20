import fetch from 'node-fetch';

async function checkHisnMuslimApi() {
    console.log("Checking hisnmuslim.com API over HTTPS...");
    try {
        const res = await fetch('https://www.hisnmuslim.com/api/fr/27.json', {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        if (!res.ok) {
            console.error("Failed to fetch. Status:", res.status);
            return;
        }
        const data = await res.json();
        console.log("Fetched successfully.");
        console.log("Data keys:", Object.keys(data));
        console.log("First item:", JSON.stringify(data[Object.keys(data)[0]][0], null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

checkHisnMuslimApi();
