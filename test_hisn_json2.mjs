import fetch from 'node-fetch';

async function fetchHisn() {
    console.log("Fetching rn0x Hisnul Muslim JSON...");
    try {
        const res = await fetch("https://raw.githubusercontent.com/rn0x/hisn_almuslim_json/master/hisn_almuslim.json");
        if (res.ok) {
            const data = await res.json();
            console.log("Successfully fetched JSON. Count:", data.length);
            console.log("Sample Data:", JSON.stringify(data[0]).substring(0, 300));
        } else {
            console.error("Failed to fetch JSON: ", res.status);
        }
    } catch (e) {
        console.error(e);
    }
}
fetchHisn();
