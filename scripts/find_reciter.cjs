const https = require('https');

const url = 'https://mp3quran.net/api/v3/reciters?language=fr';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const omar = json.reciters.filter(r => r.name.toLowerCase().includes('omar'));
            console.log('Results containing "Omar":');
            omar.forEach(r => {
                console.log(`ID: ${r.id}, Name: ${r.name}`);
            });
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
