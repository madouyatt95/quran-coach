// ─── Chatbot Islamique Engine ────────────────────────────
// A structured knowledge engine that searches across ALL app data
// and provides conversational answers with sources.
//
// Data sources:
// - Quiz engine: Fiqh (3 levels), Aqidah (3 levels), Pillars, Culture, Stories, etc.
// - Hadiths: 400+ hadiths
// - Hisnul Muslim: 289KB of invocations
// - Prophets: 25 prophets with stories
// - Companions: 50+ companions
// - Themes: Quran thematic verses
// - Tafsir: exegesis data
// - FAQ: curated Q&A tree for common questions

import { HADITHS } from '../data/hadiths';
import { EXPANDED_HADITHS } from '../data/hadithsExpanded';
import { HADITHS_NAWAWI } from '../data/hadithsNawawi';
import { HISNUL_MUSLIM_DATA } from '../data/hisnulMuslim';
import { prophets } from '../data/prophets';
import { companions } from '../data/companions';
import { QURAN_THEMES } from '../data/themesData';

// ─── Types ────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatSource[];
    suggestions?: string[];
    timestamp: number;
}

export interface ChatSource {
    type: 'hadith' | 'verse' | 'invocation' | 'fiqh' | 'aqidah' | 'prophet' | 'companion' | 'faq';
    label: string;
    link?: string;
}

// ─── Knowledge Base (extracted from quiz data) ───────────
// We structure the knowledge as category -> topic -> Q&A pairs

interface KnowledgeEntry {
    question: string;
    answer: string;
    keywords: string[];
    category: string;
    source: string;
    link?: string;
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[''`]/g, "'")
        .trim();
}

function tokenize(text: string): string[] {
    return normalize(text).split(/\s+/).filter(w => w.length > 3);
}

function computeScore(query: string, target: string): number {
    const qTokens = tokenize(query);
    const tNorm = normalize(target);

    let score = 0;
    for (const token of qTokens) {
        if (tNorm.includes(token)) {
            score += token.length > 4 ? 2 : 1;
        }
    }

    // Bonus for exact substring match
    if (tNorm.includes(normalize(query))) {
        score += 5;
    }

    return score;
}

// ─── FAQ Tree (curated common questions) ─────────────────

const FAQ_TREE: KnowledgeEntry[] = [
    // Wudu
    { question: "Comment faire les ablutions (wudu) ?", answer: "Les ablutions comprennent 4 actes obligatoires : 1) Se laver le visage 2) Se laver les mains et avant-bras jusqu'aux coudes 3) Essuyer la tête 4) Se laver les pieds jusqu'aux chevilles. Il est recommandé de commencer par le côté droit, de laver 3 fois chaque membre, et de dire Bismillah au début.", keywords: ['ablution', 'wudu', 'wudhu', 'laver', 'purification'], category: 'Purification', source: 'Fiqh' },
    { question: "Qu'est-ce qui annule les ablutions ?", answer: "Les ablutions sont annulées par : 1) Tout ce qui sort des voies naturelles (urine, selles, gaz) 2) Le sommeil profond 3) La perte de conscience 4) Le toucher des parties intimes sans barrière. Le simple doute n'annule pas les ablutions.", keywords: ['annule', 'ablution', 'invalide', 'casse', 'wudu'], category: 'Purification', source: 'Fiqh' },
    { question: "Comment faire le tayammum ?", answer: "Le Tayammum (ablutions sèches) est autorisé quand l'eau est absente ou nuisible. On frappe la terre une fois avec les deux mains, on essuie le visage, puis on essuie le dos des mains. C'est mentionné dans Sourate An-Nisa (4:43) et Al-Ma'ida (5:6).", keywords: ['tayammum', 'ablution', 'seche', 'terre', 'sable', 'eau'], category: 'Purification', source: 'Fiqh / Coran 4:43' },
    { question: "Comment faire le ghusl ?", answer: "Le Ghusl (bain rituel) comprend : 1) L'intention dans le cœur 2) Se laver les mains 3) Laver les parties intimes 4) Faire les ablutions complètes 5) Verser l'eau sur la tête 3 fois en frottant les cheveux jusqu'aux racines 6) Verser l'eau sur tout le corps en commençant par le côté droit. Il est obligatoire après les rapports, les menstrues, et les lochies.", keywords: ['ghusl', 'bain', 'rituel', 'lavage', 'janaba', 'impurete', 'menstrues'], category: 'Purification', source: 'Fiqh' },

    // Salat
    { question: "Comment faire la prière ?", answer: "La prière comprend : 1) Se mettre debout face à la Qibla 2) Dire 'Allahu Akbar' (Takbir) 3) Réciter Al-Fatiha + une sourate 4) S'incliner (Ruku) en disant 'Subhana Rabbiyal Adhim' 5) Se relever en disant 'Sami Allahu liman hamida' 6) Se prosterner (Sujud) en disant 'Subhana Rabbiyal A'la' 7) S'asseoir brièvement 8) Deuxième prosternation. Cela fait une rak'at. À la fin, on récite le Tashahud et on salue.", keywords: ['priere', 'salat', 'salah', 'prier', 'comment', 'apprendre', 'rakaat'], category: 'Prière', source: 'Fiqh' },
    { question: "Combien de rak'at pour chaque prière ?", answer: "Fajr (Sobh) : 2 rak'at | Dhuhr : 4 rak'at | Asr : 4 rak'at | Maghrib : 3 rak'at | Isha : 4 rak'at. Pour le voyageur, les prières de 4 rak'at sont réduites à 2.", keywords: ['rakaat', 'nombre', 'priere', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'combien'], category: 'Prière', source: 'Fiqh' },
    { question: "Comment faire la prière du voyageur ?", answer: "Le voyageur (distance d'environ 81 km) peut : 1) Raccourcir les prières de 4 rak'at à 2 (Dhuhr, Asr, Isha) 2) Combiner Dhuhr+Asr ensemble et Maghrib+Isha ensemble 3) Cela dure tant qu'il est en voyage. La prière du Fajr (2 rak'at) et Maghrib (3 rak'at) ne changent pas.", keywords: ['voyageur', 'voyage', 'raccourcir', 'combiner', 'qasr', 'jam'], category: 'Prière', source: 'Fiqh' },
    { question: "Comment faire la prière de l'Aïd ?", answer: "La prière de l'Aïd comporte 2 rak'at : 1ère rak'at : 7 Takbirat supplémentaires avant la lecture, puis Al-Fatiha + Sourate Al-A'la. 2ème rak'at : 5 Takbirat supplémentaires avant la lecture, puis Al-Fatiha + Sourate Al-Ghashiya. Pas d'Adhan ni d'Iqama. On la prie en plein air si possible.", keywords: ['aid', 'eid', 'priere', 'fitr', 'adha', 'takbir', 'fete'], category: 'Prière', source: 'Fiqh' },
    { question: "Comment faire la prière funéraire (janaza) ?", answer: "La prière funéraire comporte 4 Takbirat debout (pas de ruku ni de sujud) : 1) Takbir + Al-Fatiha 2) Takbir + Salat sur le Prophète ﷺ 3) Takbir + invocation pour le défunt 4) Takbir + salaam. L'imam se place au niveau de la poitrine pour un homme et au niveau du milieu du corps pour une femme.", keywords: ['funeraire', 'janaza', 'mort', 'defunt', 'enterrement', 'deces'], category: 'Prière', source: 'Fiqh' },
    { question: "Comment faire la prière du vendredi ?", answer: "La prière du Vendredi (Jumu'ah) remplace le Dhuhr et comporte 2 rak'at précédées de 2 sermons (Khutba). Elle est obligatoire pour les hommes résidents. Il est recommandé de se laver, se parfumer, porter de beaux habits, lire Sourate Al-Kahf, et multiplier les salutations sur le Prophète ﷺ.", keywords: ['vendredi', 'jumu', 'jumua', 'jouma', 'khutba', 'sermon'], category: 'Prière', source: 'Fiqh' },

    // Jeûne
    { question: "Comment jeûner pendant le Ramadan ?", answer: "Le jeûne du Ramadan va de l'aube (Fajr) au coucher du soleil (Maghrib). On s'abstient de manger, boire et avoir des rapports. Actes recommandés : prendre le Suhur (repas avant l'aube), rompre le jeûne rapidement avec des dattes, prier Tarawih la nuit, multiplier la lecture du Coran et les invocations.", keywords: ['jeune', 'ramadan', 'jeuner', 'suhur', 'iftar', 'manger', 'boire'], category: 'Jeûne', source: 'Fiqh' },
    { question: "Qu'est-ce qui annule le jeûne ?", answer: "Le jeûne est annulé par : 1) Manger ou boire volontairement 2) Les rapports intimes 3) Le vomissement provoqué 4) Les menstrues. Ne l'annulent PAS : manger/boire par oubli, se brosser les dents, avaler sa salive, goûter la nourriture sans avaler, les injections non nutritives.", keywords: ['annule', 'jeune', 'invalide', 'casse', 'ramadan', 'manger'], category: 'Jeûne', source: 'Fiqh' },

    // Zakat
    { question: "Comment calculer la Zakat ?", answer: "La Zakat est de 2,5% sur l'épargne qui atteint le seuil (Nissab) pendant un an lunaire. Nissab en or : 85g (environ 5000€). Nissab en argent : 595g. On calcule sur tout ce qu'on possède (argent, or, actions, marchandises) moins les dettes. Les 8 bénéficiaires sont : pauvres, nécessiteux, collecteurs, ceux dont le cœur est à gagner, esclaves, endettés, pour la cause d'Allah, voyageurs.", keywords: ['zakat', 'aumone', 'calcul', 'nissab', 'pourcentage', 'richesse'], category: 'Zakat', source: 'Fiqh / Coran 9:60' },

    // Hajj
    { question: "Comment faire le Hajj ?", answer: "Le Hajj comprend 4 piliers : 1) L'Ihram (sacralisation) au Miqat 2) Le stationnement à Arafat (9 Dhul Hijjah) 3) Le Tawaf al-Ifada (7 tours autour de la Ka'ba) 4) Le Sa'y (7 trajets entre Safa et Marwa). Obligations : Ihram au Miqat, nuit à Muzdalifa, nuit à Mina, lapidation des Jamarat, rasage/raccourcissement, Tawaf d'adieu.", keywords: ['hajj', 'pelerinage', 'ihram', 'tawaf', 'arafat', 'mina', 'kaaba'], category: 'Hajj', source: 'Fiqh' },
    { question: "Quelle est la différence entre Hajj et Umrah ?", answer: "Le Hajj est le grand pèlerinage, obligatoire une fois, uniquement pendant Dhul Hijjah. L'Umrah est le petit pèlerinage, possible toute l'année, et comprend : Ihram, Tawaf (7 tours), Sa'y (Safa-Marwa), et rasage. Le Hajj inclut en plus : Arafat, Muzdalifa, Mina, lapidation.", keywords: ['hajj', 'umrah', 'omra', 'difference', 'pelerinage', 'petit', 'grand'], category: 'Hajj', source: 'Fiqh' },

    // Aqidah
    { question: "Quels sont les piliers de l'Islam ?", answer: "Les 5 piliers de l'Islam sont : 1) La Shahada (attestation de foi : La ilaha illa Allah, Muhammad Rasul Allah) 2) La Salat (5 prières quotidiennes) 3) La Zakat (aumône obligatoire) 4) Le Sawm (jeûne du Ramadan) 5) Le Hajj (pèlerinage à la Mecque). Hadith rapporté par Ibn Omar (Bukhari & Muslim).", keywords: ['pilier', 'islam', 'cinq', 'shahada', 'fondement', 'arkan'], category: 'Aqidah', source: 'Hadith Bukhari / Muslim' },
    { question: "Quels sont les piliers de la foi (Iman) ?", answer: "Les 6 piliers de la foi (Iman) : 1) Croire en Allah 2) Croire aux Anges 3) Croire aux Livres révélés 4) Croire aux Messagers 5) Croire au Jour Dernier 6) Croire au Destin (Al-Qadr), bon et mauvais. C'est le Hadith de Jibril rapporté par Omar (Muslim).", keywords: ['pilier', 'foi', 'iman', 'six', 'croire', 'croyance', 'ange'], category: 'Aqidah', source: 'Hadith de Jibril (Muslim)' },
    { question: "Qu'est-ce que le Tawhid ?", answer: "Le Tawhid est l'Unicité d'Allah. Il se divise en 3 catégories : 1) Tawhid Ar-Rububiyya : Allah est le seul Créateur et Souverain 2) Tawhid Al-Uluhiyya : Allah est le seul digne d'adoration 3) Tawhid Al-Asma wa As-Sifat : Allah a des Noms et Attributs parfaits qu'on affirme sans les comparer aux créatures. C'est la base de l'Islam.", keywords: ['tawhid', 'unicite', 'shirk', 'monotheisme', 'adoration', 'uluhiyya', 'rububiyya'], category: 'Aqidah', source: 'Aqidah / Coran' },
    { question: "Qu'est-ce que le shirk ?", answer: "Le Shirk est l'association, c'est-à-dire attribuer à autre qu'Allah ce qui Lui est exclusivement réservé. Shirk majeur (Akbar) : rend mécréant — invoquer les morts, adorer des idoles, porter des amulettes en croyant qu'elles protègent par elles-mêmes. Shirk mineur (Asghar) : n'exclut pas de l'Islam mais diminue le Tawhid — l'ostentation (Riya), jurer par autre qu'Allah.", keywords: ['shirk', 'association', 'polytheisme', 'idole', 'amulette', 'adorer'], category: 'Aqidah', source: 'Aqidah / Coran 4:48' },

    // Sourates spéciales
    { question: "Quelle sourate lire le vendredi ?", answer: "Le Prophète ﷺ a recommandé de lire Sourate Al-Kahf (sourate 18) chaque vendredi. \"Celui qui lit Sourate Al-Kahf un vendredi, une lumière l'éclairera entre les deux vendredis.\" (Al-Hakim). C'est aussi recommandé de multiplier les salutations sur le Prophète ﷺ.", keywords: ['vendredi', 'sourate', 'kahf', 'lire', 'jumu', 'recommande'], category: 'Sourates', source: 'Al-Hakim' },
    { question: "Quelle sourate protège de la tombe ?", answer: "Sourate Al-Mulk (67 - La Royauté, 30 versets). Le Prophète ﷺ a dit : \"Il y a dans le Coran une sourate de 30 versets qui intercède pour celui qui la lit jusqu'à ce qu'il soit pardonné : Tabarak alladhi biyadihil mulk.\" (Abu Dawud, At-Tirmidhi).", keywords: ['tombe', 'protege', 'mulk', 'royaute', 'mort', 'chatiment'], category: 'Sourates', source: 'Abu Dawud / At-Tirmidhi' },
    { question: "Quelle sourate lire avant de dormir ?", answer: "Avant de dormir, le Prophète ﷺ récitait : 1) Sourate Al-Ikhlas, Al-Falaq et An-Nas (3 fois chacune, souffler dans les mains et passer sur le corps) 2) Ayat al-Kursi (Al-Baqara 255) 3) Les 2 derniers versets de Sourate Al-Baqara (285-286) 4) Sourate Al-Mulk.", keywords: ['dormir', 'nuit', 'coucher', 'sommeil', 'lire', 'reciter', 'avant'], category: 'Sourates', source: 'Bukhari / Muslim' },
    { question: "Quelle est la meilleure sourate du Coran ?", answer: "Al-Fatiha est appelée 'la Mère du Livre' et la plus grande sourate. Ayat Al-Kursi (2:255) est le plus grand verset. Al-Baqara est la sourate qui protège la maison de Shaytan. Al-Ikhlas équivaut à un tiers du Coran. Ya-Sin est le cœur du Coran.", keywords: ['meilleure', 'sourate', 'grande', 'importante', 'fatiha', 'kursi', 'ikhlas'], category: 'Sourates', source: 'Bukhari / Muslim' },

    // Invocations courantes
    { question: "Quelles sont les invocations du matin ?", answer: "Les principales invocations du matin (après Fajr) : 1) Ayat al-Kursi (1 fois) 2) Al-Ikhlas, Al-Falaq, An-Nas (3 fois chacune) 3) 'Asbahna wa asbahal mulku lillah' 4) 'Allahumma inni asbahtu ushiduka...' 5) 'SubhanAllah wa bihamdihi' (100 fois) 6) 'La ilaha illa Allah wahdahu la sharika lahu' (100 fois).", keywords: ['matin', 'invocation', 'dhikr', 'fajr', 'aube', 'protection', 'adhkar'], category: 'Invocations', source: 'Hisnul Muslim', link: '/adhkar' },
    { question: "Quelles sont les invocations du soir ?", answer: "Les invocations du soir (après Asr ou Maghrib) sont similaires au matin avec des formulations adaptées : 1) Ayat al-Kursi 2) Les 3 protectrices 3) 'Amsayna wa amsal mulku lillah' 4) 'Allahumma inni amsaytu ushiduka...' 5) Invocations de protection contre le mal.", keywords: ['soir', 'invocation', 'dhikr', 'maghrib', 'nuit', 'protection', 'adhkar'], category: 'Invocations', source: 'Hisnul Muslim', link: '/adhkar' },
];

// ─── Search All Data Sources ─────────────────────────────

function searchFAQ(query: string): { entry: KnowledgeEntry; score: number }[] {
    const results: { entry: KnowledgeEntry; score: number }[] = [];
    const qNorm = normalize(query);
    const qTokens = tokenize(query);

    for (const entry of FAQ_TREE) {
        let score = 0;

        // Check keywords
        for (const kw of entry.keywords) {
            if (qNorm.includes(kw)) {
                score += 3;
            }
            for (const token of qTokens) {
                if (kw.includes(token) || token.includes(kw)) {
                    score += 1;
                }
            }
        }

        // Check question similarity
        score += computeScore(query, entry.question);
        score += computeScore(query, entry.answer) * 0.5;

        if (score > 2) {
            results.push({ entry, score });
        }
    }

    return results.sort((a, b) => b.score - a.score);
}

function searchHadiths(query: string): { text: string; source: string; score: number }[] {
    // Normalize all hadith sources to a common format: { fr, src }
    const allHadiths: { fr: string; src: string }[] = [
        // HADITHS uses textFr / source
        ...HADITHS.map(h => ({ fr: h.textFr, src: h.source })),
        // EXPANDED_HADITHS uses fr / src
        ...EXPANDED_HADITHS.map(h => ({ fr: h.fr, src: h.src })),
        // HADITHS_NAWAWI uses fr / src
        ...HADITHS_NAWAWI.map(h => ({ fr: h.fr, src: h.src })),
    ];

    const results: { text: string; source: string; score: number }[] = [];

    for (const h of allHadiths) {
        const score = computeScore(query, h.fr);
        if (score >= 4) {
            results.push({ text: h.fr, source: h.src, score });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

function searchInvocations(query: string): { title: string; text: string; score: number }[] {
    const results: { title: string; text: string; score: number }[] = [];

    // HISNUL_MUSLIM_DATA is HisnMegaCategory[] → flatten to chapters
    for (const category of HISNUL_MUSLIM_DATA) {
        for (const chapter of category.chapters) {
            const titleScore = computeScore(query, chapter.title);
            if (titleScore >= 3 || normalize(chapter.title).includes(normalize(query))) {
                const firstDua = chapter.duas?.[0];
                results.push({
                    title: chapter.title,
                    text: firstDua?.translation || firstDua?.phonetic || 'Voir les invocations dans l\'app',
                    score: titleScore,
                });
            }
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

function searchProphets(query: string): { name: string; info: string; score: number }[] {
    const results: { name: string; info: string; score: number }[] = [];

    for (const p of prophets) {
        const miracleText = p.miracles?.join(' ') || '';
        const score = computeScore(query, p.nameFr) + computeScore(query, p.summary || '') + computeScore(query, miracleText);
        // Ensure either the query explicitly names the prophet, or the score is very high
        const directMatch = normalize(query).includes(normalize(p.nameFr));

        if (score >= 4 || directMatch) {
            results.push({
                name: `${p.nameFr} (${p.nameAr})`,
                info: p.summary?.slice(0, 200) || miracleText.slice(0, 200) || '',
                score: directMatch ? score + 10 : score,
            });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 2);
}

function searchCompanions(query: string): { name: string; info: string; score: number }[] {
    const results: { name: string; info: string; score: number }[] = [];

    for (const c of companions) {
        const score = computeScore(query, c.nameFr) + computeScore(query, c.summary || '') + computeScore(query, c.title || '');
        const directMatch = normalize(query).includes(normalize(c.nameFr.split(' ')[0])); // Match first name at least

        if (score >= 4 || directMatch) {
            results.push({
                name: `${c.nameFr} (${c.nameAr})`,
                info: c.summary?.slice(0, 200) || c.title || '',
                score: directMatch ? score + 10 : score,
            });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 2);
}

function searchThemes(query: string): { theme: string; verse: string; ref: string; score: number }[] {
    const results: { theme: string; verse: string; ref: string; score: number }[] = [];
    const qNorm = normalize(query);

    for (const theme of QURAN_THEMES) {
        const themeName = theme.nameFr || theme.id;
        // Require strong match on theme name
        const themeScore = computeScore(query, themeName);
        // Also check if query directly contains the theme name or vice versa
        const directMatch = qNorm.includes(normalize(themeName)) || normalize(themeName).includes(qNorm);

        if (themeScore >= 3 || directMatch) {
            for (const verse of theme.verses.slice(0, 5)) {
                // Score each verse individually for relevance to the query
                const verseScore = computeScore(query, verse.textFr);
                const totalScore = themeScore + verseScore;
                // Only include verses that are actually relevant
                if (verseScore >= 2 || directMatch) {
                    results.push({
                        theme: themeName,
                        verse: verse.textFr.slice(0, 150),
                        ref: `Coran ${verse.surah}:${verse.ayah}`,
                        score: totalScore,
                    });
                }
            }
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

// ─── Main Chat Function ──────────────────────────────────

export function chatbotAnswer(query: string): ChatMessage {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    if (query.trim().length < 3) {
        return {
            id,
            role: 'assistant',
            content: "Posez-moi une question sur l'Islam ! Par exemple : \"Comment faire la prière ?\" ou \"Quelle sourate lire le vendredi ?\"",
            suggestions: [
                "Comment faire les ablutions ?",
                "Quels sont les piliers de l'Islam ?",
                "Quelle sourate lire avant de dormir ?",
                "Comment calculer la Zakat ?",
            ],
            timestamp: Date.now(),
        };
    }

    const sources: ChatSource[] = [];
    let answer = '';

    // 1. Search FAQ (best structured answers)
    const faqResults = searchFAQ(query);
    if (faqResults.length > 0 && faqResults[0].score > 4) {
        const best = faqResults[0].entry;
        answer = `**${best.question}**\n\n${best.answer}`;
        sources.push({
            type: 'faq',
            label: `📚 ${best.source}`,
            link: best.link || (best.keywords.includes('adhkar') ? '/adhkar' : undefined),
        });

        // Add more FAQ if relevant
        if (faqResults.length > 1 && faqResults[1].score > 4) {
            answer += `\n\n---\n\n**${faqResults[1].entry.question}**\n\n${faqResults[1].entry.answer}`;
            sources.push({ type: 'faq', label: `📚 ${faqResults[1].entry.source}` });
        }
    }

    // 2. Search hadiths
    const hadithResults = searchHadiths(query);
    if (hadithResults.length > 0 && hadithResults[0].score >= 4) {
        if (answer) answer += '\n\n---\n\n';
        answer += '**📜 Hadiths pertinents :**\n';
        for (const h of hadithResults.slice(0, 2)) {
            answer += `\n> ${h.text.slice(0, 250)}${h.text.length > 250 ? '...' : ''}\n> — *${h.source}*\n`;
            sources.push({ type: 'hadith', label: h.source, link: '/hadiths' });
        }
    }

    // 3. Search invocations
    const invocResults = searchInvocations(query);
    if (invocResults.length > 0 && invocResults[0].score >= 3) {
        if (answer) answer += '\n\n---\n\n';
        answer += '**🤲 Invocations :**\n';
        for (const inv of invocResults.slice(0, 2)) {
            answer += `\n• **${inv.title}** : ${inv.text.slice(0, 200)}\n`;
            sources.push({ type: 'invocation', label: inv.title, link: '/adhkar' });
        }
    }

    // 4. Search prophets
    const prophetResults = searchProphets(query);
    if (prophetResults.length > 0 && prophetResults[0].score >= 4) {
        if (answer) answer += '\n\n---\n\n';
        answer += '**📜 Prophètes :**\n';
        for (const p of prophetResults) {
            answer += `\n• **${p.name}** : ${p.info.slice(0, 200)}...\n`;
            sources.push({ type: 'prophet', label: p.name, link: '/prophets' });
        }
    }

    // 5. Search companions
    const compResults = searchCompanions(query);
    if (compResults.length > 0 && compResults[0].score >= 4) {
        if (answer) answer += '\n\n---\n\n';
        answer += '**⭐ Compagnons :**\n';
        for (const c of compResults) {
            answer += `\n• **${c.name}** : ${c.info.slice(0, 200)}...\n`;
            sources.push({ type: 'companion', label: c.name });
        }
    }

    // 6. Search Quran themes — only if we have a strong match
    const themeResults = searchThemes(query);
    if (themeResults.length > 0 && themeResults[0].score >= 4) {
        if (answer) answer += '\n\n---\n\n';
        answer += '**📖 Versets coraniques :**\n';
        for (const v of themeResults.slice(0, 2)) {
            answer += `\n> "${v.verse}..."\n> — *${v.ref}*\n`;
            sources.push({ type: 'verse', label: v.ref });
        }
    }

    // Fallback
    if (!answer) {
        answer = `Je n'ai pas trouvé de réponse précise à "${query}". Essayez de reformuler votre question ou utilisez l'onglet **Recherche** pour trouver des hadiths et versets par mot-clé.`;
    }

    // Suggestions based on topic
    const suggestions = getSuggestions(query);

    return {
        id,
        role: 'assistant',
        content: answer,
        sources: sources.length > 0 ? sources : undefined,
        suggestions,
        timestamp: Date.now(),
    };
}

function getSuggestions(query: string): string[] {
    const qNorm = normalize(query);

    if (qNorm.includes('priere') || qNorm.includes('salat')) {
        return ["Comment faire la prière du voyageur ?", "Combien de rak'at par prière ?", "Comment faire la prière de l'Aïd ?"];
    }
    if (qNorm.includes('ablution') || qNorm.includes('wudu')) {
        return ["Qu'est-ce qui annule les ablutions ?", "Comment faire le tayammum ?", "Comment faire le ghusl ?"];
    }
    if (qNorm.includes('jeune') || qNorm.includes('ramadan')) {
        return ["Qu'est-ce qui annule le jeûne ?", "Quelles sont les invocations du matin ?", "Quelle sourate lire le vendredi ?"];
    }
    if (qNorm.includes('hajj') || qNorm.includes('pelerinage')) {
        return ["Quelle est la différence entre Hajj et Umrah ?", "Quels sont les piliers de l'Islam ?", "Comment calculer la Zakat ?"];
    }
    if (qNorm.includes('sourate') || qNorm.includes('coran')) {
        return ["Quelle sourate protège de la tombe ?", "Quelle sourate lire avant de dormir ?", "Quelle sourate lire le vendredi ?"];
    }

    return [
        "Quels sont les piliers de l'Islam ?",
        "Comment faire les ablutions ?",
        "Quelles sont les invocations du matin ?",
    ];
}

// ─── Suggested Quick Questions ───────────────────────────

export const CHATBOT_QUICK_QUESTIONS = [
    { emoji: '🕌', label: 'La prière', query: 'Comment faire la prière ?' },
    { emoji: '💧', label: 'Les ablutions', query: 'Comment faire les ablutions ?' },
    { emoji: '🌙', label: 'Le jeûne', query: 'Comment jeûner pendant le Ramadan ?' },
    { emoji: '📿', label: 'Les piliers', query: "Quels sont les piliers de l'Islam ?" },
    { emoji: '🕋', label: 'Le Hajj', query: 'Comment faire le Hajj ?' },
    { emoji: '💰', label: 'La Zakat', query: 'Comment calculer la Zakat ?' },
    { emoji: '📖', label: 'Sourates', query: 'Quelle sourate lire avant de dormir ?' },
    { emoji: '🤲', label: 'Invocations', query: 'Quelles sont les invocations du matin ?' },
    { emoji: '☪️', label: 'Tawhid', query: "Qu'est-ce que le Tawhid ?" },
    { emoji: '✨', label: 'Vendredi', query: 'Quelle sourate lire le vendredi ?' },
];
