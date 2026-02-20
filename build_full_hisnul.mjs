import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('hisnul-muslim-api-json/finalData.json', 'utf8'));

let totalDuas = 0;

const megaStructure = [
    { id: 'daily', name: 'Quotidien', nameAr: 'الأذكار اليومية', emoji: '🌅', color: '#FFD54F', chapters: [] },
    { id: 'prayer', name: 'Prière', nameAr: 'الصلاة', emoji: '🕌', color: '#4CAF50', chapters: [] },
    { id: 'protection', name: 'Protection', nameAr: 'الحماية والرقية', emoji: '🛡️', color: '#FF7043', chapters: [] },
    { id: 'meals', name: 'Repas & Social', nameAr: 'الطعام والمعاشرة', emoji: '🍽️', color: '#26C6DA', chapters: [] },
    { id: 'travel', name: 'Voyage', nameAr: 'السفر', emoji: '✈️', color: '#42A5F5', chapters: [] },
    { id: 'dhikr', name: 'Dhikr & Doua', nameAr: 'الذكر والدعاء', emoji: '📿', color: '#AB47BC', chapters: [] },
    { id: 'trials', name: 'Épreuves', nameAr: 'الابتلاءات', emoji: '🤲', color: '#78909C', chapters: [] },
];

function getCategory(title) {
    const t = title.toLowerCase();

    // Exact or specific phrase matches
    if (t.includes('mosquée') || t.includes('prière') || t.includes('adhan') || t.includes('ablution') || t.includes('prosternation') || t.includes('tachahoud') || t.includes('salutation') || t.includes('witr')) return 'prayer';
    if (t.includes('maison') || t.includes('matin') || t.includes('soir') || t.includes('réveil') || t.includes('sommeil') || t.includes('dormir') || t.includes('vêtement') || t.includes('habit') || t.includes('toilette') || t.includes('coq')) return 'daily';
    if (t.includes('repas') || t.includes('manger') || t.includes('boire') || t.includes('éternu') || t.includes('malade') || t.includes('mariage') || t.includes('fiancé') || t.includes('nouveau-né') || t.includes('invit') || t.includes('jeûne') || t.includes('fête') || t.includes('assemblée') || t.includes('saluer')) return 'meals';
    if (t.includes('voyage') || t.includes('pluie') || t.includes('vent') || t.includes('tonnerre') || t.includes('monture') || t.includes('ville') || t.includes('marché') || t.includes('étoile') || t.includes('lune')) return 'travel';
    if (t.includes('colère') || t.includes('peur') || t.includes('diable') || t.includes('démon') || t.includes('mauvais œil') || t.includes('sorcellerie') || t.includes('chien') || t.includes('âne') || t.includes('protection')) return 'protection';
    if (t.includes('dette') || t.includes('souci') || t.includes('tristesse') || t.includes('ennemi') || t.includes('malheur') || t.includes('mort') || t.includes('défunt') || t.includes('tombe') || t.includes('épreuve') || t.includes('difficulté') || t.includes('douleur') || t.includes('condoléance') || t.includes('désespoir') || t.includes('calamité')) return 'trials';
    if (t.includes('istikh') || t.includes('repentir') || t.includes('pardon') || t.includes('hajj') || t.includes('omra') || t.includes('pèlerinage') || t.includes('arafat') || t.includes('safa') || t.includes('marwa') || t.includes('lapidation') || t.includes('sacrifice') || t.includes('talbiya') || t.includes('pierre noire') || t.includes('yéménite')) return 'dhikr';

    return 'dhikr'; // fallback
}

for (let i = 1; i <= 132; i++) {
    const chapData = rawData[i.toString()];
    if (!chapData || !chapData.dua) continue;

    const duasRaw = Array.isArray(chapData.dua) ? chapData.dua : [chapData.dua];

    const duas = [];
    for (const d of duasRaw) {
        if (!d || !d.ar || typeof d.id !== 'number') continue;
        totalDuas++;


        duas.push({
            id: d.id,
            arabic: d.ar,
            phonetic: d.fr_ar || "",
            translation: d.fr || "",
            count: 1,
            source: d.ref || ""
        });
    }

    const title = chapData.tt_fr;
    const catId = getCategory(title);

    // Find category
    const category = megaStructure.find(m => m.id === catId);

    category.chapters.push({
        id: `chap_${i}`,
        title: title,
        titleAr: chapData.tt_ar || "",
        icon: 'BookOpen',
        color: category.color,
        duas: duas
    });
}

console.log(`Processed ${totalDuas} invocations with phonetics.`);

const tsContent = `export interface HisnDua {
    id: number;
    arabic: string;
    phonetic?: string;
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

export const HISNUL_MUSLIM_DATA: HisnMegaCategory[] = ${JSON.stringify(megaStructure, null, 4)};
`;

fs.writeFileSync('src/data/hisnulMuslim.ts', tsContent, 'utf8');
console.log("Wrote fully hydrated src/data/hisnulMuslim.ts with 132 chapters and phonetic texts!");
