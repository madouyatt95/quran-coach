import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlData = fs.readFileSync('./hisnulMuslimDB/hisnul.xml', 'utf8');
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});
const jObj = parser.parse(xmlData);

const allDuas = [];

const groups = jObj.hisnulmuslim.group;
for (const g of groups) {
    let duas = g.dua;
    if (!duas) continue;
    if (!Array.isArray(duas)) duas = [duas];

    for (const d of duas) {
        allDuas.push({
            id: d['@_id'],
            arabic: d.arabic
        });
    }
}

fs.writeFileSync('./hisnul_official.json', JSON.stringify(allDuas, null, 2));
console.log(`Extracted ${allDuas.length} duas.`);
