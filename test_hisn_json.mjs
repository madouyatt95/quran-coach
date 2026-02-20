import fetch from 'node-fetch';

async function fetchHisn() {
    console.log("Fetching Hisnul Muslim JSON...");
    try {
        const res = await fetch("https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/Hisn-Muslim.json");
        if (res.ok) {
            const data = await res.json();
            console.log("Successfully fetched JSON.");
            console.log("Sample Data:", JSON.stringify(data[0]).substring(0, 200));
        } else {
            console.error("Failed to fetch JSON: ", res.status);
        }
    } catch (e) {
        console.error(e);
    }
}
fetchHisn();
