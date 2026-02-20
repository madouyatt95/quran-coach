import fs from 'fs';
import { compareTwoStrings } from 'string-similarity';

const rawData = JSON.parse(fs.readFileSync('hisnul-muslim-api-json/finalData.json', 'utf8'));
const refs = JSON.parse(fs.readFileSync('reference_267.json', 'utf8'));

function cleanArabic(text) {
    if (!text) return "";
    return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
        .replace(/ٱ/g, 'ا')
        .replace(/أ/g, 'ا')
        .replace(/إ/g, 'ا')
        .replace(/آ/g, 'ا')
        .replace(/ي/g, 'ى')
        .replace(/ؤ/g, 'و')
        .replace(/ة/g, 'ه')
        .replace(/[^\u0600-\u06FF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

for (const r of refs) {
    r.clean = cleanArabic(r.arabic);
}

const allChapters = [];
let audioMapCount = 0;
let totalDuas = 0;

for (let i = 1; i <= 132; i++) {
    const chapData = rawData[i.toString()];
    if (!chapData || !chapData.dua) continue;

    const duasRaw = Array.isArray(chapData.dua) ? chapData.dua : [chapData.dua];

    const duas = [];
    for (const d of duasRaw) {
        if (!d || !d.ar || typeof d.id !== 'number') continue;
        totalDuas++;
        const cleanSource = cleanArabic(d.ar);
        let bestScore = 0;
        let bestId = undefined;

        for (const r of refs) {
            const score = compareTwoStrings(cleanSource, r.clean);
            if (score > bestScore) {
                bestScore = score;
                bestId = r.audioId;
            }
        }

        if (bestId !== undefined) {
            audioMapCount++;
        }

        duas.push({
            id: d.id,
            audioId: bestId,
            arabic: d.ar,
            translation: d.fr || "",
            count: 1,
            source: d.ref || ""
        });
    }

    allChapters.push({
        id: `chap_${i}`,
        title: chapData.tt_fr,
        titleAr: chapData.tt_ar || "",
        icon: 'BookOpen',
        color: '#4CAF50',
        duas: duas
    });
}

console.log(`Mapped ${audioMapCount} out of ${totalDuas} invocations to audio IDs.`);

// Group into Megacategories for UI
const mega = [
    {
        id: "hisnul_full",
        name: "La Citadelle du Musulman",
        nameAr: "حصن المسلم",
        emoji: "🏰",
        color: "#2E7D32",
        chapters: allChapters
    }
];

const tsContent = `export interface HisnDua {
    id: number;
    audioId?: number;
    arabic: string;
    translation: string;
    count: number;
    source: string;
}

export interface HisnChapter {
    id: string;
    title: string;
    titleAr: string;
    icon: string;
    color: string;
    duas: HisnDua[];
}

export interface HisnMegaCategory {
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    color: string;
    chapters: HisnChapter[];
}

export const HISNUL_MUSLIM_DATA: HisnMegaCategory[] = ${JSON.stringify(mega, null, 4)};
`;

fs.writeFileSync('src/data/hisnulMuslim.ts', tsContent, 'utf8');
console.log("Wrote fully hydrated src/data/hisnulMuslim.ts with 132 chapters!");
