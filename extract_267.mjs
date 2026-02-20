import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('./hisn_raw.json', 'utf8'));
const keys = Object.keys(rawData);

let currentId = 1;
const referenceData = [];

// Skip index 0 (Introduction) and index 1 (Virtue of Dhikr)
for (let i = 2; i < keys.length; i++) {
    const categoryName = keys[i];
    const categoryDuas = rawData[categoryName].text;

    if (Array.isArray(categoryDuas)) {
        for (const text of categoryDuas) {
            referenceData.push({
                audioId: currentId++,
                arabic: text
            });
        }
    }
}

console.log(`Extracted exactly ${referenceData.length} reference texts.`);
fs.writeFileSync('reference_267.json', JSON.stringify(referenceData, null, 2));
