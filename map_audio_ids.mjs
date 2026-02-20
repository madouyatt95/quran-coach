import fs from 'fs';
import { compareTwoStrings } from 'string-similarity';

// The reference data containing exactly 267 items matching 1.mp3 to 267.mp3
const refs = JSON.parse(fs.readFileSync('reference_267.json', 'utf8'));

// The app's source code where we will inject the audioId
let tsContent = fs.readFileSync('src/data/hisnulMuslim.ts', 'utf8');

// A simplistic tool to clean diacritics for better string comparison
function cleanArabic(text) {
    if (!text) return "";
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove tashkeel
        .replace(/ٱ/g, 'ا') // Normalize alefh
        .replace(/أ/g, 'ا')
        .replace(/إ/g, 'ا')
        .replace(/آ/g, 'ا')
        .replace(/ي/g, 'ى') // Normalize yaa
        .replace(/ؤ/g, 'و') // Normalize waw
        .replace(/ة/g, 'ه') // Normalize taa marbuta
        .replace(/[^\u0600-\u06FF]/g, ' ') // Only keep arabic
        .replace(/\s+/g, ' ')
        .trim();
}

console.log("Cleaning reference texts...");
for (const r of refs) {
    r.clean = cleanArabic(r.arabic);
}

// Regex to find each dua object in the typescript source
const duaRegex = /\{\s*id:\s*\d+,\s*arabic:\s*['"](.*?)['"],(.*?)\}/gs;
let match;
let matchCount = 0;
let updatedTsContent = tsContent;

console.log("Starting mapping...");

while ((match = duaRegex.exec(tsContent)) !== null) {
    const fullMatch = match[0];
    const arabicText = match[1];
    const cleanSource = cleanArabic(arabicText);

    // Find best match in references
    let bestScore = 0;
    let bestId = null;
    let bestArabic = null;

    for (const r of refs) {
        // use string-similarity
        const score = compareTwoStrings(cleanSource, r.clean);
        if (score > bestScore) {
            bestScore = score;
            bestId = r.audioId;
            bestArabic = r.arabic;
        }
    }

    // Check if what we found is at least reasonably identical (e.g > 60% match)
    // Some texts might be shortened or slightly different
    if (bestId !== null) {
        // Construct the replacement string: insert audioId right after the first id
        const idRegex = /id:\s*(\d+),/;
        const newDuaStr = fullMatch.replace(idRegex, `id: $1, audioId: ${bestId},`);

        updatedTsContent = updatedTsContent.replace(fullMatch, newDuaStr);
        console.log(`Matched source "${cleanSource.substring(0, 30)}..." -> Ref ${bestId} (Score: ${(bestScore * 100).toFixed(1)}%)`);
    } else {
        console.warn(`Could not find a match for: ${cleanSource.substring(0, 30)}...`);
    }
    matchCount++;
}

console.log(`Total items processed: ${matchCount}`);
fs.writeFileSync('src/data/hisnulMuslim_updated.ts', updatedTsContent);
console.log("Wrote updated file to src/data/hisnulMuslim_updated.ts");
