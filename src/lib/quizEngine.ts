// Quiz Engine — Algorithmic question generator
// Generates quiz questions from existing app data sources

import { prophets } from '../data/prophets';
import { companions } from '../data/companions';
import { QURAN_THEMES } from '../data/themesData';
import { HISNUL_MUSLIM_DATA } from '../data/hisnulMuslim';
import { JUZ_DATA } from '../data/juzData';
import type { QuizQuestion, QuizThemeId, QuizDifficulty } from '../data/quizTypes';
import { DIFFICULTY_CONFIG } from '../data/quizTypes';

// ─── Utility ────────────────────────────────────────────
function seededRandom(seed: number) {
    let state = seed;
    return function () {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pick<T>(arr: T[], n: number, random: () => number = Math.random): T[] {
    return shuffle(arr, random).slice(0, n);
}

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

function buildMCQ(
    theme: QuizThemeId,
    questionFr: string,
    correct: string,
    pool: string[],
    questionAr?: string,
    explanation?: string,
    choiceCount: number = 4
): QuizQuestion | null {
    const needed = choiceCount - 1;
    const distractors = shuffle(pool.filter(p => p !== correct)).slice(0, needed);
    if (distractors.length < needed) return null;
    const choices = shuffle([correct, ...distractors]);
    return {
        id: uid(),
        theme,
        questionFr,
        questionAr,
        choices,
        correctIndex: choices.indexOf(correct),
        explanation,
    };
}

// ─── Prophet Questions ──────────────────────────────────
function generateProphetQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const namePool = prophets.map(p => p.nameFr);
    const titlePool = prophets.filter(p => p.title).map(p => p.title);

    for (const p of prophets) {
        // Q: Who has this title?
        if (p.title) {
            const q = buildMCQ(
                'prophets',
                `Quel prophète porte le titre : "${p.title}" ?`,
                p.nameFr,
                namePool,
                p.titleAr,
                `${p.nameIslamic} (${p.nameFr}) — ${p.title}`
            );
            if (q) questions.push(q);
        }

        // Q: What is the title of this prophet?
        if (p.title && titlePool.length >= 4) {
            const q = buildMCQ(
                'prophets',
                `Quel est le titre de ${p.nameFr} (${p.nameIslamic}) ?`,
                p.title,
                titlePool,
                p.nameAr,
                p.title
            );
            if (q) questions.push(q);
        }

        // Q: Which prophet is associated with this miracle?
        if (p.miracles && p.miracles.length > 0) {
            const miracle = p.miracles[0];
            const q = buildMCQ(
                'prophets',
                `Quel prophète est associé au miracle : "${miracle}" ?`,
                p.nameFr,
                namePool,
                undefined,
                `${p.nameFr} — ${miracle}`
            );
            if (q) questions.push(q);
        }

        // Q: What is the Arabic name of this prophet?
        const arabicPool = prophets.map(pr => pr.nameAr);
        const q = buildMCQ(
            'prophets',
            `Quel est le nom arabe de ${p.nameFr} ?`,
            p.nameAr,
            arabicPool,
            undefined,
            `${p.nameFr} = ${p.nameAr} (${p.nameIslamic})`
        );
        if (q) questions.push(q);

        // Q: Which prophet was sent to this people/period?
        if (p.period) {
            const periodPool = prophets.filter(pr => pr.period).map(pr => pr.nameFr);
            const q2 = buildMCQ(
                'prophets',
                `Quel prophète est lié à la période : "${p.period}" ?`,
                p.nameFr,
                periodPool,
                undefined,
                `${p.nameFr} — ${p.period}`
            );
            if (q2) questions.push(q2);
        }

        // Q: In which surahs is this prophet mentioned?
        if (p.surahs && p.surahs.length > 0) {
            const surahName = p.surahs[0].name;
            const allSurahNames = prophets.flatMap(pr => (pr.surahs || []).map(s => s.name));
            const uniqueSurahNames = [...new Set(allSurahNames)];
            if (uniqueSurahNames.length >= 4) {
                const q3 = buildMCQ(
                    'prophets',
                    `Dans quelle sourate est principalement mentionné ${p.nameFr} ?`,
                    surahName,
                    uniqueSurahNames,
                    undefined,
                    `Sourate ${surahName}`
                );
                if (q3) questions.push(q3);
            }
        }
    }

    return questions;
}

// ─── Companion Questions ────────────────────────────────
function generateCompanionQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const namePool = companions.map(c => c.nameFr);
    const titlePool = companions.filter(c => c.title).map(c => c.title);

    for (const c of companions) {
        // Q: Who has this title?
        if (c.title) {
            const q = buildMCQ(
                'companions',
                `Quel compagnon porte le titre : "${c.title}" ?`,
                c.nameFr,
                namePool,
                c.titleAr,
                `${c.nameFr} — ${c.title}`
            );
            if (q) questions.push(q);
        }

        // Q: What is the title?
        if (c.title && titlePool.length >= 4) {
            const q = buildMCQ(
                'companions',
                `Quel est le titre de ${c.nameFr} ?`,
                c.title,
                titlePool,
                c.nameAr,
                c.title
            );
            if (q) questions.push(q);
        }

        // Q: What category? (ashara / sahabi / sahabiyyah)
        const categoryLabels: Record<string, string> = {
            ashara: 'Les 10 promis au Paradis',
            sahabi: 'Compagnon notable',
            sahabiyyah: 'Compagnonne notable',
        };
        const catLabel = categoryLabels[c.category] || c.category;
        const catPool = Object.values(categoryLabels);
        if (catPool.length >= 3) {
            const q = buildMCQ(
                'companions',
                `À quelle catégorie appartient ${c.nameFr} ?`,
                catLabel,
                [...catPool, 'Tabi\'in'],
                undefined,
                catLabel
            );
            if (q) questions.push(q);
        }

        // Q: Arabic name
        const arPool = companions.map(co => co.nameAr);
        const q = buildMCQ(
            'companions',
            `Quel est le nom arabe de ${c.nameFr} ?`,
            c.nameAr,
            arPool,
            undefined,
            `${c.nameFr} = ${c.nameAr}`
        );
        if (q) questions.push(q);
    }

    return questions;
}

// ─── Verse / Theme Questions ────────────────────────────
function generateVerseQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const themeNames = QURAN_THEMES.map(t => t.nameFr);

    for (const theme of QURAN_THEMES) {
        for (const verse of theme.verses) {
            // Q: Which theme does this verse belong to?
            const q = buildMCQ(
                'verses',
                `À quel thème appartient ce verset ?`,
                theme.nameFr,
                themeNames,
                verse.textAr,
                `${theme.nameFr} — Sourate ${verse.surah}:${verse.ayah}`
            );
            if (q) questions.push(q);
        }

        // Q: Complete the translation
        const versesWithTranslation = theme.verses.filter(v => v.textFr.length > 20);
        for (const verse of versesWithTranslation.slice(0, 5)) {
            const words = verse.textFr.split(' ');
            if (words.length >= 6) {
                const halfLen = Math.floor(words.length / 2);
                const start = words.slice(0, halfLen).join(' ') + '...';
                const correct = words.slice(halfLen).join(' ');
                // Get distractors from other verses in different themes
                const otherVerses = QURAN_THEMES
                    .filter(t => t.id !== theme.id)
                    .flatMap(t => t.verses)
                    .map(v => {
                        const w = v.textFr.split(' ');
                        return w.slice(Math.floor(w.length / 2)).join(' ');
                    })
                    .filter(s => s.length > 5);
                const distractors = pick(otherVerses, 3);
                if (distractors.length === 3) {
                    const choices = shuffle([correct, ...distractors]);
                    questions.push({
                        id: uid(),
                        theme: 'verses',
                        questionFr: `Complétez : "${start}"`,
                        questionAr: verse.textAr,
                        choices,
                        correctIndex: choices.indexOf(correct),
                        explanation: verse.textFr,
                    });
                }
            }
        }
    }

    return questions;
}

// ─── Invocation Questions ───────────────────────────────
function generateInvocationQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    const allChapters = HISNUL_MUSLIM_DATA.flatMap(mega => mega.chapters);
    const chapterTitles = allChapters.map(ch => ch.title);

    for (const chapter of allChapters) {
        for (const dua of chapter.duas) {
            // Q: Which chapter does this dua belong to?
            if (chapterTitles.length >= 4) {
                const q = buildMCQ(
                    'invocations',
                    `À quel chapitre appartient cette invocation ?`,
                    chapter.title,
                    chapterTitles,
                    dua.arabic,
                    `${chapter.title} — ${dua.translation.slice(0, 60)}...`
                );
                if (q) questions.push(q);
            }

            // Q: What is the French meaning?
            const allTranslations = allChapters
                .flatMap(ch => ch.duas)
                .map(d => d.translation.length > 80 ? d.translation.slice(0, 80) + '...' : d.translation);
            const correctTr = dua.translation.length > 80 ? dua.translation.slice(0, 80) + '...' : dua.translation;
            const q = buildMCQ(
                'invocations',
                `Quelle est la traduction de cette invocation ?`,
                correctTr,
                allTranslations,
                dua.arabic,
                dua.translation
            );
            if (q) questions.push(q);
        }
    }

    return questions;
}

// ─── Structure Questions (Juz) ──────────────────────────
function generateStructureQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const juzNames = JUZ_DATA.map(j => j.name);
    const juzNumbers = JUZ_DATA.map(j => `Juz ${j.number}`);

    for (const juz of JUZ_DATA) {
        // Q: What is the name of this Juz?
        const q1 = buildMCQ(
            'structure',
            `Comment s'appelle le Juz ${juz.number} ?`,
            juz.name,
            juzNames,
            juz.nameArabic,
            `Juz ${juz.number} — ${juz.name} (${juz.nameArabic})`
        );
        if (q1) questions.push(q1);

        // Q: What number is this Juz?
        const q2 = buildMCQ(
            'structure',
            `Quel numéro porte le Juz "${juz.name}" ?`,
            `Juz ${juz.number}`,
            juzNumbers,
            juz.nameArabic,
            `Juz ${juz.number}`
        );
        if (q2) questions.push(q2);

        // Q: Arabic name
        const arNames = JUZ_DATA.map(j => j.nameArabic);
        const q3 = buildMCQ(
            'structure',
            `Quel est le nom arabe du Juz ${juz.number} ?`,
            juz.nameArabic,
            arNames,
            undefined,
            `${juz.name} = ${juz.nameArabic}`
        );
        if (q3) questions.push(q3);
    }

    return questions;
}

// ─── Ya Ayyuha Questions ────────────────────────────────
function generateYaAyyuhaQuestions(): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const yaTheme = QURAN_THEMES.find(t => t.id === 'ya-ayyuha');
    if (!yaTheme) return [];

    for (const verse of yaTheme.verses) {
        // Q: What command does this verse give?
        const allCommands = yaTheme.verses.map(v => v.textFr);
        const q = buildMCQ(
            'ya-ayyuha',
            `Que commande ce verset aux croyants ?`,
            verse.textFr.length > 100 ? verse.textFr.slice(0, 100) + '...' : verse.textFr,
            allCommands.map(c => c.length > 100 ? c.slice(0, 100) + '...' : c),
            verse.textAr,
            `Sourate ${verse.surah}:${verse.ayah}`
        );
        if (q) questions.push(q);

        // Q: Which surah:ayah?
        const allRefs = yaTheme.verses.map(v => `Sourate ${v.surah}:${v.ayah}`);
        if (allRefs.length >= 4) {
            const q2 = buildMCQ(
                'ya-ayyuha',
                `D'où vient ce commandement aux croyants ?`,
                `Sourate ${verse.surah}:${verse.ayah}`,
                allRefs,
                verse.textAr,
                verse.textFr
            );
            if (q2) questions.push(q2);
        }
    }

    return questions;
}

// ─── Stories Questions ──────────────────────────────────
function generateStoriesQuestions(): QuizQuestion[] {
    const data = [
        { q: "Qui sont les 'Gens de la Caverne' (Ashab al-Kahf) ?", a: "Des jeunes croyants protégés par Allah", p: ["Des prophètes de l'Antiquité", "Des soldats mécréants", "Des marchands de la Mecque"] },
        { q: "Combien de temps les Gens de la Caverne sont-ils restés endormis ?", a: "309 ans", p: ["100 ans", "40 ans", "1000 ans"] },
        { q: "Quel sage a donné de profonds conseils à son fils dans le Coran ?", a: "Luqman", p: ["Imran", "Uzayr", "Dhul-Qarnayn"] },
        { q: "Qui a construit un mur de fer et de cuivre contre Gog et Magog ?", a: "Dhul-Qarnayn", p: ["Sulayman", "Talut", "Musa"] },
        { q: "Quelle sourate raconte l'histoire du propriétaire des deux jardins ?", a: "Al-Kahf", p: ["Al-Baqarah", "Yusuf", "Al-Qasas"] },
        { q: "Quel homme immensément riche a été englouti par la terre avec ses trésors ?", a: "Qarûn (Coré)", p: ["Pharaon", "Hâmân", "Namroud"] },
        { q: "Quel roi croyant a mené une petite armée contre le géant Jalût (Goliath) ?", a: "Talût (Saül)", p: ["David", "Salomon", "Josué"] },
        { q: "Quel animal est au centre d'une grande querelle légale chez Banu Isra'il ?", a: "Une vache", p: ["Un chameau", "Un mouton", "Un veau d'or"] },
        { q: "Qui a tenté de détruire la Kaaba avec une armée d'éléphants ?", a: "Abrahah", p: ["Namroud", "Abou Jahl", "Chosroès"] },
        { q: "Quel serviteur d'Allah est resté mort pendant 100 ans avant d'être ressuscité ?", a: "Uzayr (Esdras)", p: ["Ilyas", "Al-Yasa", "Idris"] },
        { q: "Comment Yusuf (Joseph) s'est-il retrouvé en Égypte ?", a: "Ses frères l'ont jeté dans un puits", p: ["Il a fui une famine", "Il a été exilé par son père", "Il s'est perdu en voyage"] },
        { q: "Qui a interprété les rêves du roi d'Égypte ?", a: "Yusuf (Joseph)", p: ["Musa (Moïse)", "Ibrahim (Abraham)", "Idris"] },
        { q: "Combien de frères avait Yusuf (Joseph) ?", a: "11 frères", p: ["7 frères", "3 frères", "5 frères"] },
        { q: "Quel prophète a été avalé par un poisson (baleine) ?", a: "Yunus (Jonas)", p: ["Nuh (Noé)", "Ilyas (Élie)", "Ayyub (Job)"] },
        { q: "Pourquoi Iblis a-t-il refusé de se prosterner devant Adam ?", a: "Par orgueil, il se croyait supérieur car créé de feu", p: ["Il ne connaissait pas Adam", "Il était en colère", "Il avait peur"] },
        { q: "Quel oiseau a guidé Sulayman vers la Reine de Saba ?", a: "La huppe (Al-Hudhud)", p: ["Le corbeau", "L'aigle", "La colombe"] },
        { q: "Qui a fabriqué le Veau d'or adoré par les Banu Isra'il ?", a: "As-Samiri", p: ["Harun", "Pharaon", "Qarûn"] },
        { q: "Quel prophète a été testé par la perte de ses biens, de ses enfants et de sa santé ?", a: "Ayyub (Job)", p: ["Nuh (Noé)", "Shu'ayb", "Hud"] },
        { q: "Combien de fils Nuh (Noé) avait-il et combien ont embarqué dans l'Arche ?", a: "4 fils, 3 ont embarqué", p: ["3 fils, tous embarqués", "2 fils, 1 a embarqué", "5 fils, 4 ont embarqué"] },
        { q: "Quel miracle Ibrahim (Abraham) a-t-il vécu dans le feu ?", a: "Le feu est devenu frais et salutaire", p: ["Le feu s'est éteint", "Un ange l'a emporté", "La pluie a éteint le feu"] },
        { q: "Quel animal Allah a-t-il envoyé pour détruire l'armée d'Abrahah ?", a: "Des oiseaux (Ababil)", p: ["Des lions", "Des serpents", "Des sauterelles"] },
        { q: "À qui Allah a-t-il appris le langage des oiseaux ?", a: "Sulayman (Salomon)", p: ["Dawud (David)", "Idris", "Adam"] },
        { q: "Quelle fourmi célèbre a prévenu ses congénères de l'armée de Sulayman ?", a: "La fourmi de la vallée des Fourmis (Wadi an-Naml)", p: ["La fourmi du désert", "La fourmi de Saba", "La fourmi d'Égypte"] },
        { q: "Quel prophète a été élevé au ciel de son vivant selon le Coran ?", a: "Isa (Jésus)", p: ["Idris", "Ilyas", "Musa"] },
        { q: "Comment Allah a-t-il nourri Maryam dans le temple ?", a: "Des fruits hors-saison lui parvenaient miraculeusement", p: ["Les anges cuisinaient pour elle", "Elle jeûnait en permanence", "Zakariya lui apportait de la nourriture"] },
        { q: "Quel prophète a fendu la mer avec son bâton ?", a: "Musa (Moïse)", p: ["Nuh (Noé)", "Sulayman (Salomon)", "Ibrahim (Abraham)"] },
        { q: "Que s'est-il passé quand Musa a frappé le rocher avec son bâton ?", a: "12 sources d'eau ont jailli", p: ["Le rocher s'est brisé", "De l'or est apparu", "Un arbre a poussé"] },
        { q: "Quel épisode illustre le sacrifice d'Ibrahim avec son fils ?", a: "Le sacrifice d'Isma'il remplacé par un bélier", p: ["Le sacrifice d'Ishaq dans le temple", "Le sacrifice d'un chameau à la Mecque", "Le sacrifice d'un agneau à Médine"] },
    ];
    return data.map(d => buildMCQ('stories', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}


// ─── Geography Questions ────────────────────────────────
function generateGeographyQuestions(): QuizQuestion[] {
    const data = [
        { q: "Dans quel pays le Prophète Musa (Moïse) a-t-il grandi ?", a: "L'Égypte", p: ["La Syrie", "La Palestine", "L'Irak"] },
        { q: "Quel est l'ancien nom de Makkah (La Mecque) mentionné dans le Coran ?", a: "Bakkah", p: ["Yathrib", "Taybah", "Pétra"] },
        { q: "Où se trouve la 'Vallée Sacrée' de Tuwa mentionnée pour Musa ?", a: "Au pied du mont Sinaï", p: ["À Makkah", "À Al-Quds", "Au Yémen"] },
        { q: "Quel peuple habitait dans des maisons taillées dans les rochers ?", a: "Thamud", p: ["'Ad", "Banu Isra'il", "Quraysh"] },
        { q: "Quelle nation était la cité d'Iram 'aux colonnes sans pareilles' ?", a: "Les 'Ad", p: ["Les Samaritains", "Les Romains", "Les Perses"] },
        { q: "Sur quelle montagne l'Arche de Nuh (Noé) s'est-elle posée ?", a: "Le Mont Judi", p: ["Le Mont Sinaï", "Le Mont Safa", "Le Mont Arafat"] },
        { q: "Où se trouvait le 'Barrage de Ma'rib' dont la rupture a causé l'inondation d'al-'Arim ?", a: "Au Royaume de Saba (Yémen)", p: ["En Égypte", "En Mésopotamie", "En Syrie"] },
        { q: "Dans quelle cité les anges Harut et Marut ont-ils été envoyés ?", a: "Babylone", p: ["Ninive", "Jérusalem", "Sodome"] },
        { q: "Sur quel mont Allah a-t-il parlé directement à Musa (Moïse) ?", a: "Le Mont Tur (Sinaï)", p: ["Le Mont Uhud", "Le Mont Hira", "Le Mont Thawr"] },
        { q: "Quel fleuve Musa a-t-il dû traverser miraculeusement avec son peuple ?", a: "La Mer Rouge", p: ["L'Euphrate", "Le Jourdain", "Le Tigre"] },
        { q: "Quel est l'ancien nom de Médine (al-Madinah) ?", a: "Yathrib", p: ["Bakkah", "Taif", "Najd"] },
        { q: "Où Ibrahim (Abraham) a-t-il laissé Hajar et Isma'il ?", a: "Dans la vallée de Makkah (désert sans eau)", p: ["À Jérusalem", "En Égypte", "Au Yémen"] },
        { q: "Quelle ville a été détruite pour l'immoralité de ses habitants (peuple de Lut) ?", a: "Sodome", p: ["Babylone", "Ninive", "Madyan"] },
        { q: "Où le Prophète Muhammad ﷺ a-t-il reçu la première révélation ?", a: "La grotte de Hira", p: ["La grotte de Thawr", "La Kaaba", "Le mont Uhud"] },
        { q: "Dans quel pays se trouve le mont Judi (où s'est posée l'Arche) ?", a: "La Turquie (actuelle)", p: ["L'Irak", "L'Iran", "La Syrie"] },
        { q: "À quel peuple le prophète Shu'ayb a-t-il été envoyé ?", a: "Les gens de Madyan", p: ["Les gens de 'Ad", "Les gens de Thamud", "Les Quraysh"] },
        { q: "Quel lieu est le premier qibla (direction de prière) des musulmans ?", a: "Al-Masjid al-Aqsa (Jérusalem)", p: ["La Kaaba à Makkah", "Le Mont Sinaï", "Le Mont Arafat"] },
        { q: "Où s'est déroulé l'Isra et le Mi'raj (voyage nocturne) du Prophète ﷺ ?", a: "De Makkah à Jérusalem, puis vers les cieux", p: ["De Médine à Makkah", "De Taif à Makkah", "De la Mecque au Yémen"] },
        { q: "Quel est le nom de la source miraculeuse qui a jailli pour Hajar et Isma'il ?", a: "Zamzam", p: ["Salsabil", "Kawthar", "Tasnim"] },
        { q: "De quelle tribu était le Prophète Muhammad ﷺ ?", a: "Quraysh", p: ["Banu Hashim seulement", "Aws", "Khazraj"] },
        { q: "Où s'est déroulée la bataille de Badr ?", a: "Entre Makkah et Médine", p: ["À Makkah", "À Médine", "À Taif"] },
        { q: "Quel lieu est surnommé 'Masjid al-Haram' ?", a: "La Mosquée Sacrée de Makkah", p: ["La Mosquée du Prophète à Médine", "Al-Aqsa à Jérusalem", "La Mosquée de Quba"] },
        { q: "Où Yunus (Jonas) a-t-il été envoyé comme prophète ?", a: "Ninive (Irak actuel)", p: ["Babylone", "Jérusalem", "Damas"] },
    ];
    return data.map(d => buildMCQ('geography', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}


// ─── Virtues Questions ──────────────────────────────────
function generateVirtuesQuestions(): QuizQuestion[] {
    const data = [
        { q: "Quelle sourate protège du châtiment de la tombe ?", a: "Al-Mulk (La Royauté)", p: ["Al-Waqi'ah", "Ya-Sin", "Al-Kahf"] },
        { q: "Quelle sourate est recommandée à la lecture chaque Vendredi ?", a: "Al-Kahf (La Caverne)", p: ["Al-Baqarah", "Maryam", "Ar-Rahman"] },
        { q: "Quelle sourate équivaut à un tiers (1/3) du Coran ?", a: "Al-Ikhlas (Le Monothéisme Pur)", p: ["Al-Fatihah", "Al-Kursi", "An-Nas"] },
        { q: "Quelle sourate est souvent appelée le 'Cœur du Coran' ?", a: "Ya-Sin", p: ["Ar-Rahman", "Al-Fatihah", "Al-Muzammil"] },
        { q: "Quelle sourate est une protection contre la pauvreté ?", a: "Al-Waqi'ah", p: ["Al-Mulk", "An-Naba", "Al-Infitar"] },
        { q: "Quel est le plus grand verset du Coran ?", a: "Ayat al-Kursi (Verset du Trône)", p: ["Le dernier verset d'Al-Baqarah", "Le premier verset d'Al-Fatihah", "Le verset de la Lumière"] },
        { q: "La récitation de quelle sourate empêche Shaytan d'entrer dans une maison ?", a: "Al-Baqarah", p: ["Al-Imran", "Al-Falaq", "An-Nas"] },
        { q: "Quelles sont les deux sourates protectrices (Al-Mu'awwidhatayn) ?", a: "Al-Falaq et An-Nas", p: ["Al-Ikhlas et Al-Falaq", "An-Nas et Al-Ikhlas", "Al-Kursi et Al-Falaq"] },
        { q: "Quelle sourate est la 'Guérison' (Ash-Shifa) et la 'Mère du Livre' ?", a: "Al-Fatihah", p: ["Ar-Rahman", "Al-Falaq", "An-Nas"] },
        { q: "Récite une sourate et tu auras 10 récompenses par lettre. Laquelle ?", a: "Toutes les sourates du Coran", p: ["Seulement Al-Fatihah", "Seulement Al-Ikhlas", "Seulement Ya-Sin"] },
        { q: "Quelle sourate commence par 'Tabarak' et contient 30 versets ?", a: "Al-Mulk", p: ["Al-Furqan", "Al-A'raf", "Al-Mu'minun"] },
        { q: "Quels sont les 2 derniers versets d'Al-Baqarah qui suffisent à qui les récite la nuit ?", a: "Les versets 285-286", p: ["Ayat al-Kursi", "Les versets 1-5", "Les versets 255-256"] },
        { q: "Quelle est la plus longue sourate du Coran ?", a: "Al-Baqarah (286 versets)", p: ["Al-Imran (200 versets)", "An-Nisa (176 versets)", "Al-A'raf (206 versets)"] },
        { q: "Quelle est la plus courte sourate du Coran ?", a: "Al-Kawthar (3 versets)", p: ["Al-Ikhlas (4 versets)", "An-Nasr (3 versets)", "Al-'Asr (3 versets)"] },
        { q: "Quelle sourate contient la sajda (prosternation) de la récitation la plus connue ?", a: "Al-'Alaq (Sourate 96)", p: ["As-Sajdah", "Fussilat", "Al-Hajj"] },
        { q: "Combien de sourates commencent par des lettres isolées (Huruf Muqatta'at) ?", a: "29 sourates", p: ["14 sourates", "20 sourates", "7 sourates"] },
        { q: "Quelle sourate est recommandée avant de dormir avec Al-Ikhlas, Al-Falaq et An-Nas ?", a: "Al-Mulk", p: ["Ya-Sin", "Al-Baqarah", "Ad-Dukhan"] },
        { q: "Quel verset de Sourate Al-Baqarah est le 'Maître des versets du Coran' ?", a: "Ayat al-Kursi (verset 255)", p: ["Le verset 286", "Le verset 1", "Le verset 163"] },
        { q: "Quelle sourate intercédera pour celui qui la récite le jour du Jugement ?", a: "Al-Baqarah et Al-Imran", p: ["Ya-Sin et Al-Mulk", "Al-Kahf et Maryam", "Al-Fatihah et Al-Ikhlas"] },
        { q: "Quelle sourate est surnommée 'Az-Zahra' (la resplendissante) ?", a: "Al-Baqarah", p: ["An-Nur", "Ar-Rahman", "Al-Fatihah"] },
        { q: "Quelle sourate contient le verset de la Lumière (Ayat an-Nur) ?", a: "An-Nur (sourate 24)", p: ["Al-Baqarah", "Ya-Sin", "Al-Hadid"] },
        { q: "Combien de sajdas (prosternations) de récitation y a-t-il dans le Coran ?", a: "15 sajdas", p: ["14 sajdas", "10 sajdas", "7 sajdas"] },
    ];
    return data.map(d => buildMCQ('virtues', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}


// ─── Women Questions ────────────────────────────────────
function generateWomenQuestions(): QuizQuestion[] {
    const data = [
        { q: "Qui est la seule femme nommée directement (par son prénom) dans le Coran ?", a: "Maryam (Marie)", p: ["Asiya", "Khadija", "Eve (Hawwa)"] },
        { q: "Comment s'appelait la femme de Pharaon qui a adopté Musa ?", a: "Asiya", p: ["Bilqis", "Hajar", "Sarah"] },
        { q: "Quelle Reine a embrassé l'Islam après avoir rencontré Sulayman ?", a: "La Reine de Saba (Bilqis)", p: ["Zulaikha", "Cléopâtre", "Nefertiti"] },
        { q: "Quelle femme a reçu l'inspiration de placer son bébé dans le fleuve ?", a: "La mère de Musa", p: ["La femme de Lut", "Maryam", "Hajar"] },
        { q: "Quelle sourate porte le nom de 'La Femme qui discute' ?", a: "Al-Mujadila", p: ["An-Nisa", "Al-Mumtahina", "Al-Ahzab"] },
        { q: "Qui était l'épouse du Prophète Ibrahim et la mère de Ishaq ?", a: "Sarah", p: ["Hajar", "Asiya", "Zulaikha"] },
        { q: "Qui était la pieuse mère d'Isma'il, à l'origine du trajet Safa-Marwah ?", a: "Hajar (Agar)", p: ["Sarah", "Maryam", "Bilqis"] },
        { q: "Quelle femme exemplaire est citée comme la femme d'Imran ?", a: "Hanna (Mère de Maryam)", p: ["Elizabeth", "Asiya", "Khadija"] },
        { q: "Quelle femme, épouse de Zakariya, a enfanté Yahya malgré son vieil âge ?", a: "La femme de Zakariya (Elizabeth)", p: ["La femme de Lut", "La femme d'Ibrahim", "La femme de Nuh"] },
        { q: "Quelle sourate du Coran porte le nom d'une femme ?", a: "Sourate Maryam (19)", p: ["Sourate An-Nisa (4)", "Sourate Al-Mujadila (58)", "Sourate At-Talaq (65)"] },
        { q: "Qui a tenté de séduire Yusuf (Joseph) en Égypte ?", a: "La femme d'Al-Aziz (Zulaikha)", p: ["La fille de Pharaon", "La Reine de Saba", "Asiya"] },
        { q: "Quelle femme est citée comme modèle de foi parfaite avec Maryam dans Sourate At-Tahrim ?", a: "Asiya, femme de Pharaon", p: ["Khadija", "Sarah", "Hajar"] },
        { q: "Combien de femmes sont citées comme mauvais exemples dans Sourate At-Tahrim ?", a: "2 (femmes de Nuh et de Lut)", p: ["1 seule", "3 femmes", "4 femmes"] },
        { q: "Sous quel arbre Maryam a-t-elle donné naissance à Isa (Jésus) ?", a: "Un palmier-dattier", p: ["Un olivier", "Un figuier", "Un grenadier"] },
        { q: "Quelle nourriture est tombée du ciel pour Maryam après l'accouchement ?", a: "Des dattes mûres", p: ["Du miel", "Du lait", "Du pain"] },
        { q: "Qui a élevé Maryam dans le temple ?", a: "Le prophète Zakariya", p: ["Le prophète Imran", "Le prophète Isa", "Le prophète Sulayman"] },
        { q: "La mère de Musa a-t-elle allaité son fils après l'avoir mis dans le Nil ?", a: "Oui, elle est devenue sa nourrice au palais", p: ["Non, elle ne l'a jamais revu", "Non, Asiya l'a allaité", "Oui, mais en secret"] },
        { q: "Quelle sourate signifie 'Les Femmes' ?", a: "An-Nisa (sourate 4)", p: ["Al-Mumtahina (sourate 60)", "At-Talaq (sourate 65)", "Al-Ahzab (sourate 33)"] },
        { q: "Qui est surnommée 'La Dame de toutes les femmes du Paradis' ?", a: "Fatima Az-Zahra", p: ["Khadija", "Aisha", "Maryam"] },
        { q: "Quelle femme a couru 7 fois entre Safa et Marwah cherchant de l'eau ?", a: "Hajar", p: ["Sarah", "Maryam", "Asiya"] },
    ];
    return data.map(d => buildMCQ('women', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}


// ─── Pillars & Practice Questions ───────────────────────
function generatePillarsQuestions(): QuizQuestion[] {
    const data = [
        { q: "Quel est le premier pilier de l'Islam ?", a: "La Shahada (attestation de foi)", p: ["La prière (Salat)", "Le jeûne (Sawm)", "Le pèlerinage (Hajj)"] },
        { q: "Que signifie 'La ilaha illa Allah' ?", a: "Il n'y a de divinité qu'Allah", p: ["Allah est le plus grand", "Gloire à Allah", "Louange à Allah"] },
        { q: "Combien de piliers l'Islam comporte-t-il ?", a: "5 piliers", p: ["3 piliers", "6 piliers", "7 piliers"] },
        { q: "Combien de piliers de la foi (Iman) y a-t-il ?", a: "6 piliers", p: ["5 piliers", "7 piliers", "4 piliers"] },
        { q: "Quel pilier de la foi concerne la croyance au destin ?", a: "Al-Qadr (le destin bon et mauvais)", p: ["La croyance aux anges", "La croyance aux livres", "La croyance aux prophètes"] },
        { q: "Combien de prières obligatoires par jour ?", a: "5 prières", p: ["3 prières", "7 prières", "4 prières"] },
        { q: "Quelle est la première prière de la journée ?", a: "Al-Fajr (l'aube)", p: ["Ad-Dhuhr (le midi)", "Al-Maghrib (le coucher du soleil)", "Al-'Isha (la nuit)"] },
        { q: "Combien de rak'at contient la prière du Fajr ?", a: "2 rak'at", p: ["3 rak'at", "4 rak'at", "1 rak'at"] },
        { q: "Combien de rak'at contient la prière du Dhuhr ?", a: "4 rak'at", p: ["2 rak'at", "3 rak'at", "5 rak'at"] },
        { q: "Combien de rak'at contient la prière du Maghrib ?", a: "3 rak'at", p: ["2 rak'at", "4 rak'at", "5 rak'at"] },
        { q: "Quelle est la direction de prière (Qibla) ?", a: "La Kaaba à Makkah", p: ["Jérusalem", "Médine", "Le Mont Sinaï"] },
        { q: "Que signifie 'Allahu Akbar' au début de la prière ?", a: "Allah est le plus Grand", p: ["Il n'y a de dieu qu'Allah", "Gloire à Allah", "Louange à Allah"] },
        { q: "Comment s'appelle l'appel à la prière ?", a: "L'Adhan", p: ["L'Iqama", "Le Takbir", "Le Tasbih"] },
        { q: "Quel est le premier muezzin de l'Islam ?", a: "Bilal ibn Rabah", p: ["Abu Bakr", "Omar ibn al-Khattab", "Uthman ibn Affan"] },
        { q: "Combien de conditions d'ablution (wudu) obligatoires ?", a: "4 actes obligatoires", p: ["3 actes", "5 actes", "6 actes"] },
        { q: "Que doit-on réciter dans chaque rak'at ?", a: "Sourate Al-Fatihah", p: ["Sourate Al-Ikhlas", "Ayat al-Kursi", "Sourate An-Nas"] },
        { q: "Comment s'appelle la prosternation ?", a: "Le Sujud", p: ["Le Ruku", "Le Qiyam", "Le Tashahud"] },
        { q: "Comment s'appelle l'inclinaison dans la prière ?", a: "Le Ruku", p: ["Le Sujud", "Le Qunut", "Le I'tidal"] },
        { q: "Quelle prière surérogatoire est faite la nuit en Ramadan ?", a: "Tarawih", p: ["Tahajjud", "Duha", "Istikhara"] },
        { q: "Quel pourcentage de richesse est dû en Zakat ?", a: "2,5%", p: ["5%", "10%", "1%"] },
        { q: "Combien de catégories de bénéficiaires de la Zakat ?", a: "8 catégories", p: ["5 catégories", "7 catégories", "10 catégories"] },
        { q: "Qu'est-ce que la Zakat al-Fitr ?", a: "L'aumône donnée à la fin du Ramadan", p: ["L'aumône hebdomadaire", "L'aumône du Hajj", "L'aumône de naissance"] },
        { q: "Pendant quel mois les musulmans jeûnent-ils ?", a: "Ramadan", p: ["Sha'ban", "Shawwal", "Dhul-Hijjah"] },
        { q: "À quel moment commence le jeûne ?", a: "À l'aube (Fajr)", p: ["Au lever du soleil", "À minuit", "Après la prière du Fajr"] },
        { q: "Comment s'appelle le repas avant l'aube en Ramadan ?", a: "Le Suhur (Sahour)", p: ["L'Iftar", "Le Ftour", "Le Dîner"] },
        { q: "Comment s'appelle le repas de rupture du jeûne ?", a: "L'Iftar", p: ["Le Suhur", "Le Sahour", "Le Ghada"] },
        { q: "Quelle nuit du Ramadan est meilleure que 1000 mois ?", a: "Laylat al-Qadr", p: ["La 1ère nuit", "La 15ème nuit", "La dernière nuit"] },
        { q: "Qu'est-ce qui invalide le jeûne ?", a: "Manger, boire ou relations intimes volontairement", p: ["Dormir la journée", "Se brosser les dents", "Prendre une douche"] },
        { q: "Pendant quel mois islamique a lieu le Hajj ?", a: "Dhul-Hijjah", p: ["Ramadan", "Muharram", "Rajab"] },
        { q: "Quel est le jour le plus important du Hajj ?", a: "Le jour d'Arafat (9 Dhul-Hijjah)", p: ["Le jour du sacrifice", "Le premier jour", "Le dernier jour"] },
        { q: "Comment s'appelle le vêtement blanc du Hajj ?", a: "L'Ihram", p: ["Le Rida", "Le Izar", "Le Thawb"] },
        { q: "Comment s'appellent les 7 tours autour de la Kaaba ?", a: "Le Tawaf", p: ["Le Sa'i", "Le Rami", "Le Wuquf"] },
        { q: "Que fait-on entre Safa et Marwah ?", a: "Le Sa'i (7 allers-retours)", p: ["Le Tawaf", "Le Rami", "Le Wuquf"] },
        { q: "Quel jour célèbre-t-on l'Aïd al-Adha ?", a: "Le 10 Dhul-Hijjah", p: ["Le 1er Shawwal", "Le 15 Sha'ban", "Le 1er Muharram"] },
        { q: "Combien de fois minimum doit-on faire le Hajj ?", a: "Une seule fois (si capable)", p: ["Chaque année", "3 fois", "5 fois"] },
        { q: "Qu'est-ce que la 'Umrah ?", a: "Le petit pèlerinage (possible toute l'année)", p: ["Le grand pèlerinage", "Une prière spéciale", "Un type de jeûne"] },
        { q: "Combien de sourates contient le Coran ?", a: "114 sourates", p: ["110 sourates", "120 sourates", "100 sourates"] },
        { q: "Par quel ange le Coran a-t-il été transmis ?", a: "Jibril (Gabriel)", p: ["Mikail (Michel)", "Israfil", "Azrail"] },
        { q: "Pendant combien d'années le Coran a-t-il été révélé ?", a: "23 ans", p: ["10 ans", "15 ans", "30 ans"] },
        { q: "Qu'est-ce que le Tayammum ?", a: "Les ablutions sèches (avec de la terre/sable)", p: ["Les ablutions avec de l'eau", "Le bain rituel", "La purification des vêtements"] },
        { q: "Que signifie 'Halal' ?", a: "Permis selon la loi islamique", p: ["Interdit", "Détestable", "Obligatoire"] },
        { q: "Que signifie 'Haram' ?", a: "Interdit selon la loi islamique", p: ["Permis", "Recommandé", "Neutre"] },
        { q: "Comment s'appelle le bain rituel complet ?", a: "Le Ghusl", p: ["Le Wudu", "Le Tayammum", "Le Tahur"] },
        { q: "Qu'est-ce que l'Ihsan ?", a: "Adorer Allah comme si on Le voyait", p: ["La foi en Allah", "La pratique de la prière", "Le pèlerinage"] },
        { q: "Quel type de transaction est interdit (Riba) ?", a: "L'usure / les intérêts", p: ["Le commerce de nourriture", "Le commerce ambulant", "L'échange de monnaie"] },
        { q: "Combien de fois dit-on 'SubhanAllah' dans le Tasbih après la prière ?", a: "33 fois", p: ["10 fois", "99 fois", "7 fois"] },
        { q: "Quelle est la prière de consultation ?", a: "Salat al-Istikhara", p: ["Salat al-Janaza", "Salat ad-Duha", "Salat al-Hajah"] },
        { q: "Quelle est la prière funéraire ?", a: "Salat al-Janaza", p: ["Salat al-Istisqa", "Salat al-Khusuf", "Salat al-Kusuf"] },
        { q: "Quelle prière du vendredi remplace le Dhuhr ?", a: "Salat al-Jumu'ah", p: ["Salat al-Eid", "Salat at-Tarawih", "Salat al-Witr"] },
        { q: "Quelle est la formule à dire après avoir éternué ?", a: "Al-Hamdulillah", p: ["Subhan'Allah", "Astaghfirullah", "Allahu Akbar"] },
        { q: "Que répond-on à celui qui éternue et dit 'Al-Hamdulillah' ?", a: "Yarhamuk Allah", p: ["Barak Allahu fik", "As-salamu alaykum", "Jazak Allahu khayran"] },
        { q: "Quels jours le Prophète ﷺ recommandait-il de jeûner hors Ramadan ?", a: "Les lundis et jeudis", p: ["Les mardis et mercredis", "Les samedis et dimanches", "Seulement le vendredi"] },
        { q: "Quelle est la durée du jeûne d'Achoura ?", a: "1 jour (avec recommandation du 9 aussi)", p: ["3 jours", "10 jours", "1 semaine"] },
        { q: "Combien de rak'at minimum pour la prière du Witr ?", a: "1 rak'at", p: ["2 rak'at", "3 rak'at", "4 rak'at"] },
        { q: "Quelle est la prière surérogatoire du matin ?", a: "Salat ad-Duha", p: ["Salat al-Ishraq", "Salat al-Awwabin", "Salat at-Tahajjud"] },
        { q: "En quelle langue le Coran a-t-il été révélé ?", a: "En arabe", p: ["En hébreu", "En araméen", "En syriaque"] },
        { q: "Quel est le Nisab en or pour la Zakat ?", a: "85 grammes d'or", p: ["50 grammes d'or", "100 grammes d'or", "72 grammes d'or"] },
        { q: "À quel moment le jeûne est-il rompu ?", a: "Au coucher du soleil (Maghrib)", p: ["Après la prière du Isha", "Au crépuscule", "Quand les étoiles apparaissent"] },
        { q: "Que lance-t-on sur les Jamarat pendant le Hajj ?", a: "Des petits cailloux", p: ["Des pierres", "De l'eau", "Du sable"] },
        { q: "Quelle est la différence entre Zakat et Sadaqa ?", a: "La Zakat est obligatoire, la Sadaqa est volontaire", p: ["La Sadaqa est obligatoire", "Elles sont identiques", "La Zakat est pour les riches seulement"] },
        { q: "Quel animal sacrifie-t-on lors de l'Aïd al-Adha ?", a: "Un mouton, chèvre, vache ou chameau", p: ["Uniquement un mouton", "Uniquement un chameau", "Un coq"] },
        { q: "Qu'annule les ablutions (wudu) ?", a: "Tout ce qui sort des voies naturelles", p: ["Toucher de l'eau", "Parler à quelqu'un", "Manger uniquement"] },
        { q: "Comment s'appelle la position assise finale de la prière ?", a: "Le Tashahud", p: ["Le Sujud", "Le Ruku", "Le Qiyam"] },
        { q: "Dans quels jours cherche-t-on Laylat al-Qadr ?", a: "Les nuits impaires des 10 derniers jours", p: ["Les 10 premiers jours", "Les nuits paires", "Uniquement la 27ème nuit"] },
    ];
    return data.map(d => buildMCQ('pillars', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}

// ─── Hadiths Questions ──────────────────────────────────
function generateHadithsQuestions(): QuizQuestion[] {
    const data = [
        { q: "Quel compagnon a rapporté le plus de hadiths ?", a: "Abu Hurayra", p: ["Ibn Abbas", "Aisha", "Anas ibn Malik"] },
        { q: "'Les actes ne valent que par les intentions.' De quel recueil est le 1er hadith ?", a: "Les 40 hadiths de Nawawi", p: ["Sahih Muslim", "Sunan Abu Dawud", "Muwatta de Malik"] },
        { q: "Complétez : 'La pudeur fait partie de la...'", a: "Foi (Iman)", p: ["Prière", "Patience", "Science"] },
        { q: "Quel hadith dit : 'Aucun de vous ne croit tant qu'il n'aime pas pour son frère ce qu'il aime pour lui-même' ?", a: "Hadith 13 de Nawawi", p: ["Hadith 1 de Nawawi", "Hadith 40 de Nawawi", "Un hadith Qudsi"] },
        { q: "Qui a compilé le recueil de hadith considéré le plus authentique ?", a: "L'Imam al-Bukhari", p: ["L'Imam Muslim", "L'Imam Malik", "L'Imam Ahmad"] },
        { q: "Combien de hadiths contient le recueil des '40 hadiths de Nawawi' ?", a: "42 hadiths", p: ["40 hadiths exactement", "50 hadiths", "36 hadiths"] },
        { q: "Le Prophète ﷺ a dit : 'Le meilleur d'entre vous est celui qui...'", a: "Apprend le Coran et l'enseigne", p: ["Prie le plus", "Jeûne le plus", "Donne le plus en charité"] },
        { q: "'Celui qui croit en Allah et au Jour Dernier, qu'il dise du bien ou qu'il...'", a: "Se taise", p: ["Prie", "Parte", "Jeûne"] },
        { q: "Qu'est-ce qu'un hadith 'Qudsi' ?", a: "Un hadith où le Prophète ﷺ rapporte les paroles d'Allah", p: ["Un verset du Coran", "Un hadith faible", "Un hadith inventé"] },
        { q: "Qu'est-ce qu'un hadith 'Sahih' ?", a: "Un hadith authentique vérifié", p: ["Un hadith faible", "Un hadith inventé", "Un hadith sans chaîne"] },
        { q: "Qu'est-ce qu'un hadith 'Da'if' ?", a: "Un hadith faible", p: ["Un hadith authentique", "Un hadith inventé", "Un hadith Qudsi"] },
        { q: "Combien de recueils de hadiths sont considérés comme les plus fiables (Kutub as-Sittah) ?", a: "6 recueils", p: ["4 recueils", "8 recueils", "2 recueils"] },
        { q: "'L'Islam est bâti sur cinq...' Ce hadith est rapporté par qui ?", a: "Ibn Omar", p: ["Abu Hurayra", "Anas ibn Malik", "Ali ibn Abi Talib"] },
        { q: "Le Prophète ﷺ a dit : 'Le fort n'est pas celui qui terrasse les gens, mais celui qui...'", a: "Maîtrise sa colère", p: ["Porte les plus lourdes charges", "Gagne les batailles", "Jeûne le plus"] },
        { q: "'Facilitez et ne rendez pas les choses difficiles.' Qui a dit cela ?", a: "Le Prophète Muhammad ﷺ", p: ["Abu Bakr", "Omar ibn al-Khattab", "Ali ibn Abi Talib"] },
        { q: "Complétez : 'Allah ne regarde pas vos corps ni vos visages, mais Il regarde...'", a: "Vos cœurs et vos actes", p: ["Vos prières", "Votre richesse", "Votre lignée"] },
        { q: "'Quiconque emprunte un chemin pour chercher la science, Allah lui facilite...'", a: "Un chemin vers le Paradis", p: ["La richesse", "Le mariage", "La santé"] },
        { q: "Le hadith de Jibril mentionne combien de niveaux de religion ?", a: "3 (Islam, Iman, Ihsan)", p: ["2 niveaux", "5 niveaux", "7 niveaux"] },
        { q: "'Fais partie du bon Islam de l'homme de...'", a: "Délaisser ce qui ne le regarde pas", p: ["Prier la nuit", "Jeûner chaque jour", "Donner toute sa richesse"] },
        { q: "Que recommande le Prophète ﷺ comme dernière chose à manger avant le Fajr en Ramadan ?", a: "Des dattes", p: ["Du lait", "De l'eau", "Du pain"] },
        { q: "'Les meilleurs des gens sont ceux qui sont les plus...'", a: "Utiles aux gens", p: ["Riches", "Savants", "Beaux"] },
        { q: "Le Prophète ﷺ a dit : 'Le sourire est une...'", a: "Aumône (Sadaqa)", p: ["Obligation", "Prière", "Sunna uniquement"] },
        { q: "'Celui qui emprunte deux chemins en même temps n'atteindra...' À quel principe cela renvoie ?", a: "La sincérité dans les actes (Ikhlas)", p: ["La patience", "Le jeûne", "La prière"] },
        { q: "Qui a compilé le recueil 'Sahih Muslim' ?", a: "L'Imam Muslim ibn al-Hajjaj", p: ["L'Imam al-Bukhari", "L'Imam an-Nawawi", "L'Imam at-Tirmidhi"] },
        { q: "Qu'est-ce que le 'Isnad' dans un hadith ?", a: "La chaîne de transmetteurs", p: ["Le texte du hadith", "Le sujet du hadith", "La classification du hadith"] },
        { q: "Qu'est-ce que le 'Matn' dans un hadith ?", a: "Le texte (contenu) du hadith", p: ["La chaîne de transmetteurs", "La classification", "Le narrateur"] },
        { q: "'Ne soyez pas en colère.' Combien de fois le Prophète ﷺ l'a-t-il répété à l'homme ?", a: "3 fois", p: ["1 fois", "7 fois", "5 fois"] },
        { q: "Le Prophète ﷺ a dit : 'La propreté est la moitié de la...'", a: "Foi (Iman)", p: ["Prière", "Science", "Patience"] },
        { q: "'Quand l'homme meurt, ses œuvres cessent sauf trois.' Lesquelles ?", a: "Aumône continue, science utile, enfant pieux qui invoque", p: ["Prière, jeûne, Hajj", "Coran mémorisé, mosquée, fortune", "Mariage, enfants, commerce"] },
        { q: "Le Prophète ﷺ a dit : 'Le Paradis est sous les pieds des...'", a: "Mères", p: ["Pères", "Savants", "Martyrs"] },
        { q: "Quel compagnon aveugle a compilé le recueil 'Sunan at-Tirmidhi' ?", a: "L'Imam at-Tirmidhi", p: ["L'Imam Abu Dawud", "L'Imam an-Nasa'i", "L'Imam Ibn Majah"] },
        { q: "'Certes, Allah a prescrit l'excellence (Ihsan) en toute chose.' Cela inclut :", a: "Même l'abattage rituel des animaux", p: ["Seulement la prière", "Seulement le travail", "Seulement les études"] },
    ];
    return data.map(d => buildMCQ('hadiths', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}

// ─── Culture Questions ──────────────────────────────────
function generateCultureQuestions(): QuizQuestion[] {
    const data = [
        // Noms d'Allah
        { q: "Combien de noms (attributs) Allah a-t-il selon le hadith connu ?", a: "99 noms", p: ["100 noms", "77 noms", "114 noms"] },
        { q: "Que signifie 'Ar-Rahman' ?", a: "Le Tout Miséricordieux", p: ["Le Très Sage", "Le Tout Puissant", "Le Créateur"] },
        { q: "Que signifie 'Al-Malik' ?", a: "Le Souverain / Le Roi", p: ["Le Miséricordieux", "Le Sage", "Le Créateur"] },
        { q: "Que signifie 'As-Salam' ?", a: "La Paix / La Source de Paix", p: ["Le Protecteur", "Le Pardonnant", "Le Puissant"] },
        { q: "Que signifie 'Al-Ghaffar' ?", a: "Le Très Pardonnant", p: ["Le Tout Puissant", "Le Sage", "Le Créateur"] },
        { q: "Que signifie 'Al-'Alim' ?", a: "L'Omniscient / Le Savant", p: ["Le Puissant", "Le Miséricordieux", "Le Juste"] },
        { q: "Que signifie 'Al-Khaliq' ?", a: "Le Créateur", p: ["Le Pourvoyeur", "Le Sage", "Le Miséricordieux"] },
        { q: "Que signifie 'Ar-Razzaq' ?", a: "Le Pourvoyeur / Celui qui accorde la subsistance", p: ["Le Créateur", "Le Sage", "Le Puissant"] },
        // Calendrier islamique
        { q: "Quel est le premier mois du calendrier hégirien ?", a: "Muharram", p: ["Ramadan", "Rajab", "Safar"] },
        { q: "Quel est le mois sacré du jeûne ?", a: "Ramadan (9ème mois)", p: ["Sha'ban (8ème)", "Shawwal (10ème)", "Rajab (7ème)"] },
        { q: "Quel événement marque le début du calendrier hégirien ?", a: "L'Hégire (migration du Prophète ﷺ à Médine)", p: ["La naissance du Prophète ﷺ", "La révélation du Coran", "La conquête de Makkah"] },
        { q: "Pendant quel mois a eu lieu l'Isra et le Mi'raj ?", a: "Rajab", p: ["Sha'ban", "Ramadan", "Muharram"] },
        { q: "Combien de mois sacrés y a-t-il dans le calendrier islamique ?", a: "4 mois", p: ["3 mois", "2 mois", "6 mois"] },
        { q: "Quels sont les 4 mois sacrés ?", a: "Dhul-Qi'dah, Dhul-Hijjah, Muharram, Rajab", p: ["Ramadan, Sha'ban, Rajab, Muharram", "Ramadan, Shawwal, Dhul-Hijjah, Muharram", "Rajab, Sha'ban, Ramadan, Shawwal"] },
        { q: "Quel mois précède Ramadan ?", a: "Sha'ban", p: ["Rajab", "Jumada al-Thani", "Shawwal"] },
        { q: "Quel mois suit Ramadan ?", a: "Shawwal", p: ["Dhul-Qi'dah", "Sha'ban", "Rajab"] },
        { q: "Quel jour de la semaine est particulier en Islam ?", a: "Le vendredi (Jumu'ah)", p: ["Le samedi", "Le lundi", "Le dimanche"] },
        { q: "Quel est le 10ème jour de Muharram célébré par un jeûne ?", a: "Achoura", p: ["Laylat al-Qadr", "Laylat al-Bara'ah", "Mawlid"] },
        // Vocabulaire
        { q: "Que signifie 'Tawbah' ?", a: "Le repentir", p: ["La patience", "La gratitude", "La confiance"] },
        { q: "Que signifie 'Tawakkul' ?", a: "La confiance en Allah / le fait de s'en remettre à Lui", p: ["Le repentir", "La patience", "La gratitude"] },
        { q: "Que signifie 'Sabr' ?", a: "La patience / l'endurance", p: ["Le repentir", "La gratitude", "La confiance"] },
        { q: "Que signifie 'Shukr' ?", a: "La gratitude / la reconnaissance", p: ["La patience", "Le repentir", "La crainte"] },
        { q: "Que signifie 'Taqwa' ?", a: "La crainte pieuse d'Allah / la piété", p: ["La gratitude", "La patience", "La science"] },
        { q: "Que signifie 'Barakah' ?", a: "La bénédiction divine", p: ["La richesse", "La santé", "La science"] },
        { q: "Que signifie 'Fitrah' ?", a: "La nature innée / la disposition naturelle", p: ["L'obligation", "Le péché", "La tradition"] },
        { q: "Que signifie 'Dunya' ?", a: "La vie d'ici-bas / le monde matériel", p: ["Le Paradis", "L'Au-delà", "La mort"] },
        { q: "Que signifie 'Akhira' ?", a: "L'Au-delà / la vie après la mort", p: ["La vie d'ici-bas", "La mort", "Le Paradis uniquement"] },
        { q: "Que signifie 'Bid'ah' ?", a: "Innovation (en matière de religion)", p: ["Tradition", "Obligation", "Recommandation"] },
        { q: "Que signifie 'Sunnah' dans le contexte de la pratique ?", a: "La voie/tradition du Prophète ﷺ", p: ["Le Coran", "L'obligation", "L'interdiction"] },
        { q: "Que signifie 'Fard' ?", a: "Obligatoire", p: ["Recommandé", "Interdit", "Permis"] },
        // Anges
        { q: "Quel ange est chargé de la révélation ?", a: "Jibril (Gabriel)", p: ["Mikail (Michel)", "Israfil", "Malik"] },
        { q: "Quel ange est chargé de souffler dans la Trompe le Jour du Jugement ?", a: "Israfil", p: ["Jibril", "Mikail", "Azrail"] },
        { q: "Quel ange est chargé de la pluie et de la subsistance ?", a: "Mikail (Michel)", p: ["Jibril", "Israfil", "Raqib"] },
        { q: "Comment s'appellent les deux anges qui interrogent dans la tombe ?", a: "Munkar et Nakir", p: ["Raqib et Atid", "Harut et Marut", "Jibril et Mikail"] },
        { q: "Comment s'appellent les anges qui notent les bonnes et mauvaises actions ?", a: "Raqib et Atid (Kiraman Katibin)", p: ["Munkar et Nakir", "Harut et Marut", "Malik et Ridwan"] },
        { q: "Quel ange garde le Paradis ?", a: "Ridwan", p: ["Malik", "Jibril", "Israfil"] },
        { q: "Quel ange garde l'Enfer ?", a: "Malik", p: ["Ridwan", "Munkar", "Nakir"] },
        // Culture générale
        { q: "Combien de Juz (parties) contient le Coran ?", a: "30 Juz", p: ["28 Juz", "32 Juz", "25 Juz"] },
        { q: "Combien de Hizb contient le Coran ?", a: "60 Hizb", p: ["30 Hizb", "114 Hizb", "120 Hizb"] },
        { q: "Quel est le livre sacré révélé à Musa (Moïse) ?", a: "La Torah (At-Tawrat)", p: ["L'Évangile (Al-Injil)", "Les Psaumes (Az-Zabur)", "Le Coran"] },
        { q: "Quel est le livre sacré révélé à Dawud (David) ?", a: "Les Psaumes (Az-Zabur)", p: ["La Torah", "L'Évangile", "Les Feuillets"] },
        { q: "Quel est le livre sacré révélé à Isa (Jésus) ?", a: "L'Évangile (Al-Injil)", p: ["La Torah", "Les Psaumes", "Le Coran"] },
        { q: "Combien de livres sacrés sont mentionnés dans le Coran ?", a: "4 livres majeurs + les Feuillets", p: ["3 livres", "2 livres", "7 livres"] },
        { q: "Que signifie 'Bismillah' ?", a: "Au nom d'Allah", p: ["Gloire à Allah", "Louange à Allah", "Allah est le plus Grand"] },
        { q: "Que signifie 'SubhanAllah' ?", a: "Gloire à Allah", p: ["Louange à Allah", "Allah est le plus Grand", "Au nom d'Allah"] },
        { q: "Que signifie 'Al-Hamdulillah' ?", a: "Louange à Allah", p: ["Gloire à Allah", "Allah est le plus Grand", "Je demande pardon à Allah"] },
        { q: "Que signifie 'Astaghfirullah' ?", a: "Je demande pardon à Allah", p: ["Gloire à Allah", "Louange à Allah", "Allah est le plus Grand"] },
        { q: "Que signifie 'In sha Allah' ?", a: "Si Allah le veut", p: ["Qu'Allah le bénisse", "Gloire à Allah", "Louange à Allah"] },
        { q: "Que signifie 'Masha Allah' ?", a: "Ce qu'Allah a voulu (admiration)", p: ["Si Allah le veut", "Gloire à Allah", "Au nom d'Allah"] },
        { q: "Que signifie 'Jazak Allahu khayran' ?", a: "Qu'Allah te récompense en bien", p: ["Qu'Allah te pardonne", "Qu'Allah te guérisse", "Paix sur toi"] },
        { q: "Que signifie 'Barak Allahu fik' ?", a: "Qu'Allah te bénisse", p: ["Qu'Allah te pardonne", "Qu'Allah te récompense", "Paix sur toi"] },
        { q: "Que dit-on en entrant dans une mosquée ?", a: "Allahumma iftah li abwaba rahmatik", p: ["SubhanAllah", "Allahu Akbar", "Bismillah seulement"] },
        { q: "De quoi ont été créés les Jinns selon le Coran ?", a: "De feu (flamme sans fumée)", p: ["De lumière", "D'argile", "D'eau"] },
        { q: "De quoi ont été créés les anges selon les hadiths ?", a: "De lumière (Nur)", p: ["De feu", "D'argile", "D'eau"] },
        { q: "De quoi Adam a-t-il été créé ?", a: "D'argile (terre)", p: ["De lumière", "De feu", "D'eau"] },
        { q: "Combien de prophètes sont nommés dans le Coran ?", a: "25 prophètes", p: ["12 prophètes", "30 prophètes", "50 prophètes"] },
        { q: "Qui est le dernier prophète et messager en Islam ?", a: "Muhammad ﷺ", p: ["Isa (Jésus)", "Musa (Moïse)", "Ibrahim (Abraham)"] },
        { q: "Qui est le premier prophète et être humain ?", a: "Adam", p: ["Nuh (Noé)", "Ibrahim (Abraham)", "Idris"] },
        { q: "Quel est le premier verset révélé du Coran ?", a: "'Lis ! Au nom de ton Seigneur qui a créé' (Al-'Alaq:1)", p: ["'Au nom d'Allah le Miséricordieux'", "'Louange à Allah Seigneur des mondes'", "'Dis : Il est Allah, Unique'"] },
        { q: "Quelle est la dernière sourate révélée (selon la majorité) ?", a: "An-Nasr (Le Secours)", p: ["Al-Ma'idah", "At-Tawbah", "Al-Kawthar"] },
        { q: "Quel calife a ordonné la compilation finale du Coran en un seul Mushaf ?", a: "Uthman ibn Affan", p: ["Abu Bakr", "Omar ibn al-Khattab", "Ali ibn Abi Talib"] },
        { q: "Quel calife a ordonné la première collecte écrite du Coran ?", a: "Abu Bakr as-Siddiq", p: ["Uthman ibn Affan", "Omar ibn al-Khattab", "Ali ibn Abi Talib"] },
        { q: "Comment s'appelle la science de la récitation correcte du Coran ?", a: "Le Tajwid", p: ["Le Tafsir", "Le Fiqh", "La Sirah"] },
        { q: "Comment s'appelle la science de l'exégèse coranique ?", a: "Le Tafsir", p: ["Le Tajwid", "Le Fiqh", "Le Hadith"] },
        { q: "Que signifie 'Ummah' ?", a: "La communauté musulmane", p: ["La famille", "La tribu", "La nation arabe"] },
        { q: "Quel mois est appelé 'le mois d'Allah' ?", a: "Muharram", p: ["Ramadan", "Rajab", "Sha'ban"] },
        { q: "Comment s'appelle le voyage nocturne du Prophète ﷺ ?", a: "Al-Isra wal-Mi'raj", p: ["L'Hégire", "La Conquête", "La Révélation"] },
        { q: "Que signifie 'Khilafah' ?", a: "Le califat / la succession dans le leadership", p: ["La royauté", "La démocratie", "L'empire"] },
        { q: "Combien de califes 'bien guidés' (Rashidun) y a-t-il ?", a: "4 califes", p: ["3 califes", "5 califes", "7 califes"] },
    ];
    return data.map(d => buildMCQ('culture', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}

// ─── Tawhid & Aqidah (PDF Vol. 1) ───────────────────────
function generateTawhidQuestions(): QuizQuestion[] {
    const data = [
        { q: 'Que signifie linguistiquement le mot "Aqidah" ?', a: 'Le fait d\'attacher une chose avec force et précision', p: ['La science de l\'unicité', 'Le jugement sans doute', 'Le chemin de la droiture'] },
        { q: 'Quel est le sens global de la science de la "Aqidah" ?', a: 'La croyance affirmative en Allah et Ses fondements (anges, livres, messagers...)', p: ['La mémorisation complète du Coran', 'La connaissance exclusive du Fiqh', 'L\'étude de la langue arabe uniquement'] },
        { q: 'Quelles autres appellations les pieux prédécesseurs donnaient-ils à l\'Aqidah ?', a: 'L\'Unicité, les Fondements de la religion, la Grande compréhension', p: ['Le Tafsir, le Hadith, la Sirah', 'La jurisprudence et l\'éthique', 'La lecture et l\'exégèse'] },
        { q: 'Quelle est la condition indispensable pour qu\'une bonne action soit acceptée ?', a: 'Qu\'elle soit basée sur une croyance authentique (Tawhid)', p: ['Qu\'elle soit faite devant les gens', 'Qu\'elle soit faite le jour du vendredi', 'Qu\'elle soit accompagnée de richesses'] },
        { q: 'Quel est le but unique de la création des djinns et des hommes ?', a: 'Pour qu\'ils adorent Allah Seul', p: ['Pour qu\'ils construisent des cités', 'Pour qu\'ils voyagent sur terre', 'Pour qu\'ils étudient les sciences matérielles'] },
        { q: 'Quel a été l\'appel commun de TOUS les messagers ?', a: 'Adorez Allah et écartez-vous du Tagût', p: ['Construisez des lieux de culte', 'Apprenez l\'histoire des anciens', 'Priez uniquement la nuit'] },
        { q: 'Comment définit-on le "Tagût" ?', a: 'Tout être adoré en dehors d\'Allah qui accepte cette adoration', p: ['Unique terme pour désigner Satan', 'Uniquement les idoles en pierre', 'Chaque personne qui commet un péché'] },
        { q: 'Quels sont les 3 piliers/niveaux nécessaires pour que le Tawhid soit valide ?', a: 'Acceptation du cœur, prononciation de la langue, actes des membres', p: ['Prière, Jeûne et Hajj', 'Science, Patience et Sincérité', 'Intention, État et Parole'] },
        { q: 'Dans le hadith de Mu\'adh, quel est le droit d\'Allah sur Ses serviteurs ?', a: 'Qu\'ils L\'adorent sans rien Lui associer', p: ['Qu\'ils Lui fassent des dons matériels', 'Qu\'ils lisent le Coran chaque jour', 'Qu\'ils demandent pardon 100 fois'] },
        { q: 'Comment appelle-t-on l\'Unicité d\'Allah dans Ses actes comme la Création, la Royauté et l\'Administration ?', a: 'Le Tawhid Ar-Rubûbiya (Seigneurie)', p: ['Le Tawhid Al-Uloûhiya', 'Le Tawhid Al-Asma Wa As-Sifât', 'Le Tawhid Al-Ittiba\''] },
        { q: 'Est-ce que les polythéistes reconnaissaient le Tawhid Ar-Rubûbiya ?', a: 'Oui, ils admettaient qu\'Allah est le Créateur et Pourvoyeur', p: ['Non, ils croyaient que les idoles avaient tout créé', 'Seulement une petite minorité', 'Jamais, ils niaient tout créateur'] },
        { q: 'Reconnaître qu\'Allah est le seul Créateur suffit-il pour entrer dans l\'Islam ?', a: 'Non, il faut aussi Lui vouer un culte exclusif (Uloûhiya)', p: ['Oui, c\'est l\'essence même de la foi', 'Oui, si on le dit avec la langue', 'Non, il faut aussi parler arabe'] },
        { q: 'Quels sont les deux piliers indissociables de l\'attestation de foi ?', a: 'La Négation (de toute autre divinité) et l\'Affirmation (d\'Allah Seul)', p: ['La Prière et la Zakat', 'La Peur et l\'Espoir', 'Le Coeur et le Cerveau'] },
        { q: 'Quelle parole du Prophète Ibrahim rassemble la Négation et l\'Affirmation ?', a: 'Je désavoue ce que vous adorez, à l\'exception de Celui qui m\'a créé', p: ['Allah est mon Seigneur et le vôtre', 'Adorez Allah dans la paix', 'Craignez votre Seigneur'] },
        { q: 'Selon le hadith, dans quelle disposition naît chaque nouveau-né ?', a: 'Sur la nature saine (la Fitrah/l\'Islam)', p: ['Sans aucune connaissance', 'Sur la religion de ses parents', 'Sur une nature rebelle'] },
        { q: 'Les prophètes sont décrits comme des "frères" ayant une religion unique. Laquelle ?', a: 'L\'Islam (le Tawhid)', p: ['Le Judaïsme', 'Le Christianisme', 'Le Sabéisme'] },
        { q: 'Que font les hommes, même mécréants, lorsqu\'ils sont en danger en mer ?', a: 'Ils invoquent Allah exclusivement avec sincérité', p: ['Ils demandent l\'aide de leurs idoles', 'Ils se découragent totalement', 'Ils invoquent les anges'] },
        { q: 'Quelle est la définition de l\'orgueil (Al-Kibr) ?', a: 'Le rejet de la vérité et le mépris des gens', p: ['Porter de beaux vêtements', 'Être fier de sa réussite', 'Vouloir commander les autres'] },
        { q: 'Quel comportement le Coran reproche-t-il à ceux qui refusent la vérité ?', a: 'Suivre aveuglément les ancêtres sans preuve', p: ['Chercher trop de preuves', 'Vouloir trop réfléchir', 'Être trop généreux avec les pauvres'] },
        { q: 'Quel est l\'impact majeur du Tawhid sur la vie du croyant ?', a: 'Le bonheur, la tranquillité du cœur et la sécurité absolue', p: ['L\'obtention immédiate de richesses', 'La fin de toutes les épreuves physiques', 'La célébrité auprès des gens'] },
        // --- Levels 2 & 3 Additions ---
        { q: 'Quelles sont les deux conditions de la Shahada qui s\'opposent à l\'hypocrisie et au doute ?', a: 'La Sincérité et la Certitude', p: ['La Science et l\'Amour', 'L\'Acceptation et la Soumission', 'La Véracité et la Pratique'] },
        { q: 'Pourquoi les mécréants de la Mecque refusaient l\'Islam s\'ils croyaient en un Créateur ?', a: 'Car ils refusaient de Lui vouer un culte exclusif (Uloûhiya)', p: ['Car ils ne comprenaient pas l\'arabe', 'Car ils pensaient qu\'Allah n\'existait pas', 'Car ils ne croyaient pas aux miracles'] },
        { q: 'Quel est l\'ultime degré de l\'amour selon Ibn Al-Qayyim ?', a: 'L\'adoration', p: ['L\'amitié', 'La fraternité', 'Le respect'] },
        { q: 'Pour qu\'un acte soit accepté, il faut la Sincérité et une deuxième condition, laquelle ?', a: 'Le suivi de la Sunna du Prophète ﷺ', p: ['Le faire devant témoins', 'Qu\'il soit difficile à accomplir', 'Qu\'il soit fait à la Mecque'] },
        { q: 'De quoi les anges sont-ils créés ?', a: 'De lumière', p: ['D\'argile', 'De feu', 'D\'eau'] },
        { q: 'Combien d\'ailes le Prophète ﷺ a-t-il vu à l\'ange Gabriel dans sa forme originelle ?', a: '600 ailes', p: ['2 ailes', '7 ailes', '99 ailes'] },
        { q: 'Comment l\'ange de la mort est-il appelé dans le Coran et la Sunna ?', a: 'Malak al-Mawt (l\'Ange de la mort)', p: ['Izrâ\'îl', 'Isrâfîl', 'Mikaïl'] },
        { q: 'Quel est le rôle de l\'ange Isrâfîl ?', a: 'Souffler dans la trompe pour la résurrection', p: ['Apporter la pluie', 'Transmettre la révélation', 'Garder les portes du Paradis'] },
        { q: 'Qui est l\'ange Mâlick dans la croyance islamique ?', a: 'Le gardien de l\'Enfer', p: ['Le gardien du Paradis', 'Le porteur du Trône', 'L\'ange de la pluie'] },
        { q: 'À quel Prophète les Psaumes (Az-Zabour) ont-ils été révélés ?', a: 'David (Dawoûd)', p: ['Moïse (Moussa)', 'Jésus (Issa)', 'Abraham (Ibrahim)'] },
        { q: 'Que signifie linguistiquement le mot grec "Évangile" ?', a: 'La bonne nouvelle', p: ['Le livre sacré', 'L\'unicité', 'Le chemin droit'] },
        { q: 'Quelle est la différence entre un Messager (Rasoûl) et un Prophète (Nabî) ?', a: 'Le Messager apporte une nouvelle législation', p: ['Le Prophète est plus important', 'Il n\'y a aucune différence', 'Seul le Messager reçoit la révélation'] },
        { q: 'Qui est surnommé le "Sceau des Prophètes" ?', a: 'Mohammed ﷺ', p: ['Ibrahim ', 'Moussa ', 'Nuh '] },
        { q: 'Quels sont les 4 degrés (étapes) de la foi au destin (Al-Qadr) ?', a: 'Science, Écriture, Volonté et Création', p: ['Prière, Jeûne, Zakat et Hajj', 'Crainte, Espoir, Amour et Confiance', 'Unicité, Sincérité, Suivi et Acte'] },
        { q: 'Combien de temps avant la création de l\'univers les destinées ont-elles été écrites ?', a: '50 000 ans', p: ['1 000 ans', '1 million d\'années', 'Depuis l\'éternité'] },
        { q: 'La volonté de l\'homme est-elle indépendante de celle d\'Allah ?', a: 'Non, elle est dépendante de la volonté d\'Allah', p: ['Oui, l\'homme est totalement libre', 'Oui, Allah n\'intervient pas dans nos choix', 'Non, l\'homme n\'a aucune volonté'] },
        { q: 'Peut-on nommer Allah par un nom qu\'Il ne S\'est pas attribué (ex: L\'Architecte) ?', a: 'Non, car Ses Noms sont d\'institution divine uniquement', p: ['Oui, si le sens est beau', 'Oui, pour expliquer aux non-musulmans', 'Seulement en période de guerre'] },
        { q: 'Que signifie le terme "Tahrîf" concernant les noms d\'Allah ?', a: 'Le fait de falsifier le sens ou les mots', p: ['Le fait de nier l\'existence d\'Allah', 'Le fait d\'adorer des idoles', 'Le fait de douter du destin'] },
        { q: 'Les Noms d\'Allah sont-ils limités au nombre de 99 ?', a: 'Non, Il possède des Noms dont Lui seul a la connaissance', p: ['Oui, le chiffre est fixe et définitif', 'Oui, c\'est ce que dit le Coran', 'Non, il y en a exactement 1000'] },
        { q: 'Quelle règle suit-on pour les attributs comme la "Main" d\'Allah ?', a: 'On les affirme tels quels, sans ressemblance avec les créatures', p: ['On les nie totalement', 'On dit que c\'est purement imaginaire', 'On les compare aux mains humaines'] },
        { q: 'Que signifie linguistiquement le mot "Koufr" ?', a: 'Le fait de couvrir ou cacher une chose', p: ['Le fait de détester', 'Le fait de combattre', 'Le fait de s\'éloigner'] },
        { q: 'Quel est le jugement de celui qui annule un projet à cause d\'un mauvais présage ?', a: 'C\'est du polythéisme mineur (Shirk Asghar)', p: ['C\'est une bonne précaution', 'C\'est une obligation religieuse', 'C\'est une mécréance majeure d\'office'] },
        { q: 'Porter une "Main de Fatma" en pensant qu\'elle protège par elle-même est... ?', a: 'De l\'association majeure (Shirk Akbar)', p: ['Une simple tradition décorative', 'Une protection recommandée', 'Un petit péché sans gravité'] },
        { q: 'Quel est le jugement de la sorcellerie impliquant les démons ?', a: 'C\'est de la mécréance majeure', p: ['C\'est un métier autorisé', 'C\'est une simple illusion sans péché', 'C\'est un péché mineur'] },
        { q: 'Qu\'est-ce que l\'ostentation (Riyâ\') ?', a: 'Faire une adoration pour être vu et loué par les gens', p: ['Être fier de son travail', 'Faire la prière devant sa famille', 'Apprendre le Coran avec un professeur'] },
        { q: 'Quel moyen de Tawassul (rapprochement) est licite ?', a: 'Par les Noms d\'Allah ou ses propres bonnes actions', p: ['Par l\’invocation d\’un mort pieux', 'Par le degré d\'un saint décédé', 'Par le sacrifice d\'une bête sur une tombe'] },
        { q: 'Quelles sont les 3 questions posées dans la tombe ?', a: 'Seigneur ? Religion ? Prophète ?', p: ['Richesse ? Famille ? Travail ?', 'Prière ? Jeûne ? Zakat ?', 'Coran ? Langue ? Histoire ?'] },
        { q: 'Quelle est la cause du haut taux de suicide chez les athées ?', a: 'L\'absence de sens à la vie et de quiétude du cœur', p: ['Le manque d\'argent', 'La pression sociale', 'La pollution environnementale'] },
        { q: 'Pourquoi la théorie de Darwin est-elle critiquée ?', a: 'Car elle n\'explique pas le passage de l\'inerte à la vie consciente', p: ['Car elle est trop ancienne', 'Car elle parle des animaux', 'Car elle est trop complexe'] },
        // --- Tawhid 4 : Innovation (Bid'ah) & Compagnons ---
        { q: 'Que signifie linguistiquement le mot "Bid\'ah" (innovation) ?', a: 'Une chose qui n\'a pas de modèle précédent', p: ['Un acte obligatoire', 'Une tradition ancienne', 'Une interdiction ferme'] },
        { q: 'Quelle est la définition religieuse de la Bid\'ah ?', a: 'Une voie d\'adoration inventée sans preuve dans le Coran ni la Sunna', p: ['Un acte de piété recommandé', 'Un rappel du Prophète ﷺ', 'Une habitude mondaine quelconque'] },
        { q: 'Quel est le jugement de toute innovation dans la religion selon le Prophète ﷺ ?', a: 'Toute innovation est un égarement', p: ['Elle est recommandée si l\'intention est bonne', 'Elle est autorisée si les savants l\'approuvent', 'Elle est parfois obligatoire'] },
        { q: 'Qu\'a dit l\'imam Mâlick sur celui qui innove dans l\'islam en la voyant bonne ?', a: 'Il prétend que le Prophète ﷺ a trahi le message', p: ['Il est un grand savant', 'Il sera récompensé', 'Il fait revivre la Sunna'] },
        { q: 'Quelle est la différence entre les habitudes mondaines et les adorations concernant l\'innovation ?', a: 'L\'innovation concerne uniquement les adorations, pas les habitudes', p: ['Les deux sont concernées de la même manière', 'Seules les habitudes sont interdites', 'Aucune différence n\'existe'] },
        { q: 'Pourquoi Sufyân At-thawri a-t-il dit qu\'Iblis préfère l\'innovation au péché ?', a: 'Car on se repent du péché mais on ne se repent pas de l\'innovation', p: ['Car le péché est plus grave', 'Car l\'innovation est visible', 'Car elle rapporte de la récompense'] },
        { q: 'Qu\'a dit Omar (radhiAllahu anhu) en voyant les gens prier le Tarawih en commun ?', a: '"Quelle belle innovation que voici !" (au sens linguistique)', p: ['"C\'est une innovation religieuse blâmable"', '"Le Prophète ﷺ l\'a interdit"', '"Cette prière est obligatoire"'] },
        { q: 'Quel est le meilleur des compagnons de façon absolue selon les gens de la Sunna ?', a: 'Abû Bakr, puis Omar, puis Othman, puis Ali', p: ['Ali, puis Omar, puis Abû Bakr, puis Othman', 'Omar seulement', 'Ils sont tous au même degré sans distinction'] },
        { q: 'Que prétendent les Rawâfid (chiites extrémistes) au sujet des compagnons ?', a: 'Qu\'ils ont apostasié après la mort du Prophète ﷺ', p: ['Qu\'ils sont tous au Paradis', 'Qu\'ils sont tous égaux', 'Qu\'ils étaient des savants'] },
        { q: 'Qu\'implique insulter les compagnons selon Sheikh Ibn Outhaimine ?', a: 'Un dénigrement du Prophète ﷺ, de la législation et d\'Allah Lui-même', p: ['Un simple péché mineur', 'Aucune conséquence religieuse', 'Uniquement un manque de respect social'] },
        { q: 'Selon Ibn Abbâs, quel est l\'effet de l\'innovation sur la Sunna au fil du temps ?', a: 'Chaque innovation fait mourir une Sunna jusqu\'à ce que l\'innovation triomphe', p: ['L\'innovation renforce la Sunna', 'Elle n\'a aucun effet', 'Elle crée de nouvelles obligations'] },
        { q: 'Qu\'a répondu Sa\'îd Ibn Al-Mussayib à l\'homme qui priait dans un temps interdit ?', a: 'Allah ne te châtie pas pour la prière, mais pour t\'être opposé à la Sunna', p: ['Continue ta prière, c\'est un bien', 'Tu es récompensé pour ton effort', 'Va prier dans la mosquée'] },
        { q: 'Que dit le Prophète ﷺ au sujet de ceux qui seront éloignés de son Bassin (Hawd) ?', a: 'Ceux qui ont changé et innové après lui seront repoussés', p: ['Tous les croyants y boiront', 'Seuls les pécheurs majeurs seront repoussés', 'Personne ne sera éloigné'] },
        { q: 'Est-il permis de fêter l\'anniversaire du Prophète ﷺ (Mawlid) ?', a: 'Non, c\'est une innovation car ni le Prophète ﷺ ni les compagnons ne l\'ont fait', p: ['Oui, c\'est une bonne tradition', 'Oui, si c\'est fait avec sincérité', 'C\'est obligatoire chaque année'] },
        { q: 'Quel est un exemple d\'innovation qui spécifie un nombre sans preuve ?', a: 'Lire la sourate Yâ-Sîn quarante fois pour résoudre un problème', p: ['Prier cinq fois par jour', 'Faire 7 tours autour de la Ka\'ba', 'Jeûner le mois de Ramadan'] },
        { q: 'Quel est un exemple d\'innovation liée à un lieu sans preuve ?', a: 'Prier sur le mont Hirâ ou Thawr en pensant que c\'est une adoration spécifique', p: ['Prier dans la Mosquée Sacrée', 'Prier à la mosquée du Prophète ﷺ', 'Se rendre à Arafat pendant le Hajj'] },
        { q: 'Que signifie la parole du Prophète ﷺ : "Quiconque instaure en islam une bonne tradition..." ?', a: 'Faire revivre une Sunna établie, non pas inventer une nouvelle adoration', p: ['Inventer une nouvelle forme d\'adoration', 'Créer une nouvelle fête religieuse', 'Modifier les règles du Hajj'] },
        { q: 'Qu\'a dit l\'imam Ahmad quand on lui a demandé qui est préférable : celui qui prie ou celui qui parle sur les innovateurs ?', a: 'Celui qui parle sur les innovateurs, car c\'est pour les musulmans', p: ['Celui qui prie, car c\'est plus pieux', 'Ils sont égaux', 'Celui qui jeûne le plus'] },
        { q: 'Selon les gens de la Sunna, quel est le devoir du musulman envers les compagnons ?', a: 'Les aimer tous, affirmer leur mérite, et se taire sur leurs divergences', p: ['Choisir un camp et critiquer l\'autre', 'Les considérer comme infaillibles', 'Les classer par mérite financier'] },
        { q: 'Quel verset coranique (S48:V29) décrit les compagnons d\'une manière qui provoque la colère des mécréants ?', a: '"Comme une semence qui donne une pousse, qu\'elle renforce et qui se dresse sur sa tige"', p: ['"Ceux qui jeûnent le jour et prient la nuit"', '"Ceux qui combattent pour Allah"', '"Les meilleurs dans le commerce et l\'agriculture"'] },
    ];
    return data.map(d => buildMCQ('tawhid', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}

// ─── Fiqh & Jurisprudence (PDF Levels 1, 2, 3) ─────────
function generateFiqhQuestions(): QuizQuestion[] {
    const data = [
        // --- Purification ---
        { q: 'Quel est le statut d\'une eau dont le goût a été changé par un élément propre au point de changer son nom (ex: eau + café) ?', a: 'Elle n\'est plus purifiante pour les ablutions', p: ['Elle reste purifiante', 'Elle est impure d\'office', 'Elle est seulement déconseillée'] },
        { q: 'Comment doit être purifié un récipient dans lequel un chien a lapé ?', a: 'Le laver 7 fois, dont la première avec de la terre', p: ['Le laver une fois avec de l\'eau', 'Le jeter immédiatement', 'Le laver 3 fois avec du savon'] },
        { q: 'Comment se purifie l\'urine d\'un petit garçon qui ne mange pas encore de nourriture solide ?', a: 'On asperge légèrement la partie touchée', p: ['On doit laver et essorer obligatoirement', 'On doit jeter le vêtement', 'On ne fait rien'] },
        { q: 'Quel est le jugement du port d\'amulettes ou le recours à la superstition ?', a: 'C\'est une forme de polythéisme (Shirk)', p: ['C\'est une sunna recommandée', 'C\'est une obligation en voyage', 'C\'est une tradition sans statut religieux'] },
        { q: 'L\'intention pour les ablutions doit-elle être prononcée à voix haute ?', a: 'Non, elle réside exclusivement dans le cœur', p: ['Oui, avant de commencer', 'Oui, après avoir fini', 'Seulement si on est seul'] },
        { q: 'Que doit faire celui qui a oublié de se laver les mains jusqu\'aux coudes lors de ses ablutions ?', a: 'Il doit refaire ses ablutions entièrement pour respecter l\'ordre', p: ['Il lave juste ses mains', 'Il continue sa prière', 'Il fait le Tayammum'] },
        { q: 'Quelle est la durée autorisée pour essuyer sur les chaussettes pour une personne résidente ?', a: '24 heures (un jour et une nuit)', p: ['12 heures', '3 jours et 3 nuits', 'Indéfiniment tant qu\'on ne les retire pas'] },
        { q: 'Que signifie linguistiquement le mot "Ghusl" ?', a: 'Le fait de verser de l\'eau sur le corps en le frottant', p: ['Le fait de se parfumer', 'Le fait de changer de vêtements', 'La purification du cœur'] },

        // --- Salat (Prayer) ---
        { q: 'À quel moment la prière a-t-elle été légiférée ?', a: 'Lors de la nuit de l\'Ascension (Al-Isra wal Mi\'raj)', p: ['La première année de l\'hégire', 'Avant la prophétie', 'À Médine'] },
        { q: 'À quel moment s\'arrête le temps de la prière de l\'Icha selon l\'avis fort ?', a: 'À la moitié de la nuit religieuse', p: ['À minuit pile', 'À l\'apparition de l\'aube', 'Au milieu de la nuit civile'] },
        { q: 'Le Takbir de sacralisation peut-il être remplacé par une autre formule ?', a: 'Non, aucune autre formule n\'est acceptée', p: ['Oui, par "SoubhanAllah"', 'Oui, par "Al Hamdulillah"', 'Oui, si on oublie les mots'] },
        { q: 'Quel est le jugement du rire s\'il y a émission d\'un son pendant la prière ?', a: 'Il annule la prière de manière unanime', p: ['Il est simplement déconseillé', 'Il ne fait rien', 'Il nécessite une prosternation d\'oubli'] },
        { q: 'À partir de quel âge doit-on ordonner la prière à un enfant ?', a: '7 ans', p: ['10 ans', 'À la puberté', '5 ans'] },
        { q: 'Une femme peut-elle diriger la prière mortuaire devant d\'autres femmes ?', a: 'Oui, c\'est autorisé', p: ['Non, c\'est interdit', 'Seulement si l\'imam est absent', 'Seulement le jour du vendredi'] },
        { q: 'Que doit faire celui qui délaisse un pilier de la prière par oubli ?', a: 'Il doit obligatoirement accomplir le pilier manquant', p: ['Faire deux prosternations d\'oubli', 'Il ne fait rien', 'Recommencer la prière d\'office'] },
        { q: 'Est-ce que le sourire (sans son) annule la prière ?', a: 'Non, il ne l\'annule pas', p: ['Oui, totalement', 'Oui, s\'il est répété 3 fois', 'Seulement si on est l\'imam'] },
        { q: 'Pourquoi est-il recommandé de pointer l\'index lors du Tashahhoud ?', a: 'C\'est un signe d\'unicité éprouvant pour Satan', p: ['Pour compter les versets', 'C\'est un simple exercice physique', 'Pour appeler les anges'] },
        { q: 'Quel est le statut de la prière du Vendredi pour le voyageur ?', a: 'Elle n\'est pas obligatoire', p: ['Elle reste obligatoire', 'Elle est interdite', 'Elle est remplacée par la prière du Maghreb'] },
        { q: 'Peut-on prier derrière un imam pécheur selon la majorité des jurisconsultes ?', a: 'Oui, la prière est valide', p: ['Non, elle est nulle', 'Seulement si c\'est un petit péché', 'Seulement une fois par an'] },
        { q: 'À quel moment l\'Imam doit-il saluer les fidèles le vendredi ?', a: 'Lorsqu\'il monte sur sa chaire (Minbar)', p: ['Avant d\'entrer dans la mosquée', 'Après le deuxième sermon', 'Pendant l\'appel à la prière'] },

        // --- Zakat ---
        { q: 'Quelle est la définition religieuse de la Zakat ?', a: 'Un droit prélevé sur une richesse spécifique pour des bénéficiaires précis', p: ['Un don volontaire sans limite', 'Une taxe d\'état civile', 'Une amende pour les péchés'] },
        { q: 'Combien de catégories de bénéficiaires de la Zakat le Coran mentionne-t-il ?', a: '8 catégories', p: ['3 catégories', '10 catégories', '5 catégories'] },
        { q: 'Quel est le seuil imposable (Nissab) pour l\'or ?', a: '85 grammes', p: ['100 grammes', '595 grammes', '50 grammes'] },
        { q: 'À quel moment la Zakat al-Fitr doit-elle être donnée au plus tard ?', a: 'Avant la prière de l\'Aïd', p: ['Avant la fin du mois de Ramadan', 'Avant le coucher du soleil de l\'Aïd', 'Le lendemain de la fête'] },
        { q: 'Peut-on donner la Zakat pour la construction d\'une route ou d\'un hôpital ?', a: 'Non, elle est réservée aux 8 catégories coraniques', p: ['Oui, c\'est un acte de bienfaisance', 'Oui, si on ne trouve pas de pauvres', 'Uniquement avec l\'accord de l\'imam'] },
        { q: 'Quel est le jugement de celui qui refuse de payer la Zakat par avarice ?', a: 'C\'est un péché majeur mais il reste musulman', p: ['Il devient mécréant immédiatement', 'Ce n\'est pas un péché grave', 'Il doit redoubler son jeûne'] },
        { q: 'La Zakat al-Fitr est-elle due pour le fœtus de plus de 4 mois ?', a: 'C\'est recommandé selon les pieux prédécesseurs', p: ['C\'est strictement interdit', 'C\'est une obligation ferme', 'Seulement si l\'enfant bouge beaucoup'] },
        { q: 'Quelle est la quantité de Zakat al-Fitr à verser par personne ?', a: 'Un Sa\'a (environ 2,5 kg de denrée alimentaire)', p: ['Un repas complet au restaurant', 'Un montant fixe de 100 euros', 'Une demi-datte'] },
        { q: 'La Zakat est-elle due sur les bijoux destinés à une utilisation licite selon l\'avis fort ?', a: 'Oui, il est obligatoire de s\'en acquitter', p: ['Non, aucune Zakat sur les bijoux portés', 'Uniquement s\'ils sont en argent', 'Seulement s\'ils sont très chers'] },
        { q: 'À quel moment précis la Zakat al-Fitr devient-elle obligatoire ?', a: 'Au coucher du soleil la veille de l\'Aïd', p: ['Le premier jour de Ramadan', 'Après la prière du Maghreb le jour de l\'Aïd', 'Le matin même de la naissance'] },

        // --- Hajj & Umrah ---
        { q: 'Qu\'est-ce que le "Mîqât" dans le cadre du pèlerinage ?', a: 'La limite géographique où l\'on se met en état de sacralisation', p: ['Le nom d\'un pilier de la Ka\'ba', 'La montagne de Arafat', 'La fin du pèlerinage'] },
        { q: 'Quels sont les 4 piliers fondamentaux sans lesquels le Hajj n\'est pas valide ?', a: 'Ihram, Arafat, Tawaf Ifada et Sa\'y (Safa/Marwa)', p: ['Prière, Jeûne, Zakat et Hajj', 'Ihram, Mina, Muzdalifa et Safa', 'Tawaf, Lapidation, Sacrifice et Rasage'] },
        { q: 'Où doit obligatoirement avoir lieu le stationnement (Wouqouf) du pèlerin ?', a: 'À Arafat', p: ['À Mina', 'À Muzdalifa', 'Sur le mont Safa'] },
        { q: 'Combien de tours comporte le Tawâf autour de la Ka\'ba ?', a: '7 tours', p: ['3 tours', '10 tours', '5 tours'] },
        { q: 'Le parcours entre Safa et Marwa nécessite-t-il obligatoirement les ablutions ?', a: 'Non, c\'est recommandé mais pas obligatoire', p: ['Oui, c\'est une condition de validité', 'Oui, seulement pour les hommes', 'C\'est interdit sans ablutions'] },
        { q: 'Qu\'est-ce que le Hajj "Tamattu" ?', a: 'Effectuer une Umra, se désacraliser, puis faire le Hajj', p: ['Faire le Hajj seul sans Umra', 'Faire la Umra et le Hajj avec un seul Ihram', 'Rattraper un pèlerinage manqué'] },
        { q: 'À partir de quel endroit se sacralisent les habitants de Médine ?', a: 'Dhul-Hulayfa', p: ['Al-Juhfa', 'Yalamlam', 'Dhât \'Irq'] },
        { q: 'Que célèbre-t-on par le sacrifice d\'une bête (Al-Oudhiya) ?', a: 'Le souvenir de l\'acte de foi du Prophète Ibrahim', p: ['La naissance d\'un enfant', 'Le départ en voyage', 'La fin de l\'année hégirienne'] },
        { q: 'Combien d\'Umra le Prophète ﷺ a-t-il accomplies ?', a: 'Quatre', p: ['Une seule', 'Dix', 'Aucune'] },
        { q: 'Sur quel côté doit se trouver la Ka\'ba pendant le Tawâf ?', a: 'Le côté gauche du pèlerin', p: ['Le côté droit', 'En face du pèlerin', 'Derrière le pèlerin'] },
        { q: 'Comment s\'appelle l\'acte de trotter rapidement entre les deux signes verts ?', a: 'Al-Khabab', p: ['Al-Mîqât', 'Al-Maqâm', 'Al-Ihrâm'] },
        { q: 'Quel est le signe de la nuit du destin ?', a: 'Le soleil se lève blanc et sans rayons le matin suivant', p: ['Il pleut toute la nuit', 'La lune est rouge', 'Les étoiles sont plus brillantes'] },
        { q: 'Combien de temps avant la création de l\'univers les destinées ont-elles été écrites ?', a: '50 000 ans', p: ['1 000 ans', '1 million d\'années', '10 000 ans'] },
        { q: 'Quel est l\'endroit où le Prophète ﷺ a dit que "tout entier est un lieu de station" ?', a: 'Arafat', p: ['Mina', 'Muzdalifa', 'Le mont de la Miséricorde'] },
        { q: 'Peut-on se parfumer APRÈS s\'être mis en état de sacralisation (Ihram) ?', a: 'Non, c\'est interdit', p: ['Oui, avec du parfum naturel', 'Oui, uniquement le premier jour', 'C\'est seulement déconseillé'] },

        // --- Sacrifices & Funerals ---
        { q: 'Comment s\'appelle le sacrifice effectué pour la naissance d\'un enfant ?', a: 'La \'Aqîqah', p: ['Al-Oudhiya', 'Al-Hady', 'Al-Fidya'] },
        { q: 'Quelle est la quantité de moutons pour la naissance d\'un garçon ?', a: 'Deux moutons', p: ['Un seul', 'Trois moutons', 'Une vache'] },
        { q: 'Où se tient l\'Imam lors de la prière funéraire pour un homme ?', a: 'Au niveau de la poitrine', p: ['Au niveau du ventre', 'À côté des pieds', 'À 10 mètres du corps'] },
        { q: 'Quelle est la durée du deuil obligatoire pour une femme dont l\'époux est décédé ?', a: '4 mois et 10 jours', p: ['3 mois', '1 an', '40 jours'] },
        { q: 'Que signifie "Janâba" ?', a: 'L\'état d\'impureté majeure nécessitant le Ghusl', p: ['L\'état de prière constante', 'Le nom d\'une mosquée', 'Un type de tissu pour linceul'] },
        // --- Fiqh 4 : Vente, Usure & Échange ---
        { q: 'Combien de piliers (Arkân) la vente (Al-Bay\') comporte-t-elle ?', a: 'Trois : le vendeur et l\'acheteur, l\'article et le prix, la formule d\'accord', p: ['Un seul : le prix', 'Deux : l\'acheteur et le vendeur', 'Cinq : dont la publicité et le témoin'] },
        { q: 'Que dit Allah dans S2:V275 au sujet du commerce ?', a: 'Allah a permis le commerce (la vente)', p: ['Allah a interdit tout commerce', 'Le commerce est détestable', 'Seul le troc est autorisé'] },
        { q: 'Quel type de vente est interdit après le deuxième appel à la prière du Vendredi ?', a: 'Toute vente et achat pour celui sur qui la prière du Vendredi est obligatoire', p: ['La vente de nourriture uniquement', 'Aucune restriction n\'existe', 'La vente en ligne seulement'] },
        { q: 'Qu\'est-ce que la vente aléatoire (Al-Gharar) ?', a: 'Vendre ce qu\'on ne possède pas, ce qu\'on ne peut livrer, ou un produit inconnu', p: ['Vendre au plus bas prix possible', 'Vendre en gros', 'Vendre à un ami sans bénéfice'] },
        { q: 'Qu\'est-ce que la vente "Al-\'Ina" (vente collusoire) ?', a: 'Acheter à crédit puis revendre au même vendeur comptant à un prix moindre (astuce usuraire)', p: ['Une vente aux enchères ordinaire', 'Un échange de cadeaux', 'Une vente en ligne légale'] },
        { q: 'Combien d\'articles usuraires (Ribawi) le Prophète ﷺ a-t-il cités ?', a: 'Six : l\'or, l\'argent, le froment, l\'orge, les dattes et le sel', p: ['Trois : l\'or, l\'argent et le sel', 'Dix articles', 'Seulement l\'or et l\'argent'] },
        { q: 'Que faut-il respecter lors de l\'échange de deux biens ribawi du même genre ?', a: 'Quantités identiques et échange donnant-donnant (comptant)', p: ['Seulement que le prix soit juste', 'Aucune condition particulière', 'Uniquement la présence de témoins'] },
        { q: 'Est-il permis d\'échanger de l\'or usagé contre de l\'or neuf en réglant la différence ?', a: 'Non, il faut vendre l\'ancien, encaisser, puis acheter le neuf séparément', p: ['Oui, si la différence est minime', 'Oui, c\'est une simple transaction', 'Oui, si les deux parties sont d\'accord'] },
        { q: 'Quelle est la condition obligatoire lors de l\'échange de devises de genres différents (ex: dollars contre francs) ?', a: 'Que l\'échange soit donnant-donnant (comptant) sans échéance', p: ['Que la somme soit identique dans les deux devises', 'Qu\'un notaire soit présent', 'Aucune condition'] },
        { q: 'Qu\'est-ce que l\'option de l\'endroit (Khiyâr al-Majlis) dans la vente ?', a: 'L\'acheteur et le vendeur peuvent renoncer tant qu\'ils ne se sont pas séparés du lieu', p: ['L\'obligation d\'acheter dans un lieu précis', 'Le droit de revendre au même endroit', 'La possibilité d\'annuler après 1 mois'] },
        { q: 'Combien de conditions la vente doit-elle remplir pour être valide ?', a: 'Sept conditions (consentement, capacité, propriété, article connu, prix connu, etc.)', p: ['Trois conditions', 'Une seule condition', 'Dix conditions'] },
        { q: 'Qu\'est-ce que la vente At-Tawarruq et quel est son jugement ?', a: 'Acheter à crédit puis revendre à un tiers comptant pour obtenir des liquidités ; permise en cas de besoin', p: ['Une vente interdite en toute circonstance', 'Un échange d\'or contre de l\'argent', 'Une vente réservée aux commerçants'] },
        { q: 'Pourquoi le Prophète ﷺ a-t-il interdit la vente de fruits avant que leur mûrissement soit apparent ?', a: 'Pour éviter le risque de perte et de litige (vente aléatoire)', p: ['Par préférence personnelle', 'Pour réserver les fruits aux pauvres', 'Car les fruits n\'ont pas de valeur avant maturité'] },
        { q: 'Qu\'est-ce que la surenchère malintentionnée (An-Najash) ?', a: 'Faire monter le prix d\'un article sans intention d\'acheter, pour duper les autres', p: ['Négocier le prix à la baisse', 'Acheter un article pour le revendre plus cher', 'Proposer un prix juste au vendeur'] },
        { q: 'Qu\'est-ce que l\'option du défaut (Khiyâr al-\'Ayb) dans la vente ?', a: 'Le droit de renoncer à l\'achat si un défaut réduisant le prix est découvert', p: ['Le droit de renégocier après 30 jours', 'Le droit de revendre l\'article doublé', 'L\'obligation de garder l\'article malgré tout'] },
        { q: 'Qu\'est-ce que l\'usure à terme (Ribâ An-Nasî\'a) ?', a: 'Échanger des biens ribawi de même cause d\'interdiction sans que ce soit comptant', p: ['Échanger de l\'or contre de l\'or en quantités différentes', 'Payer plus cher pour un article de luxe', 'Vendre à un prix inférieur au marché'] },
        { q: 'Quelle est la cause de l\'usure (\'\'illa) pour l\'or et l\'argent ?', a: 'Le fait d\'être une monnaie/un coût (ce à travers quoi on estime les marchandises)', p: ['Leur poids uniquement', 'Leur couleur et leur éclat', 'Leur rareté dans la nature'] },
        { q: 'Quelle est la cause de l\'usure pour le froment, l\'orge, les dattes et le sel ?', a: 'Le fait d\'être une nourriture consommable et stockable', p: ['Le fait d\'être léger', 'Le fait d\'être importé', 'Le fait d\'être vendu au marché'] },
        { q: 'Est-il permis d\'acheter de l\'or avec une carte bancaire à débit immédiat ?', a: 'Oui, si la somme est directement déduite du compte acheteur et déposée chez le vendeur', p: ['Non, c\'est interdit dans tous les cas', 'Oui, même si c\'est à crédit', 'Seulement avec une carte de fidélité'] },
        { q: 'Quelle est la base (al-asl) concernant les ventes en Islam ?', a: 'La permission, sauf ce que le Législateur a interdit', p: ['L\'interdiction par défaut', 'La consultation obligatoire d\'un savant', 'L\'obligation d\'un contrat écrit'] },
    ];
    return data.map(d => buildMCQ('fiqh', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}


// ─── Audio Questions ────────────────────────────────────

function generateAudioQuestions(): QuizQuestion[] {
    // cdn.islamic.network uses GLOBAL ayah numbers (1-6236)
    // SURAH_STARTS[i] = global ayah number of FIRST ayah of surah (i+1)
    // Computed from official Quran structure: 7+286+200+176+120+...
    const SURAH_STARTS = [1, 8, 294, 494, 670, 790, 955, 1161, 1236, 1365, 1474, 1597, 1708, 1751, 1803, 1902, 2030, 2141, 2251, 2349, 2484, 2596, 2674, 2792, 2856, 2933, 3160, 3253, 3341, 3410, 3470, 3504, 3534, 3607, 3661, 3706, 3789, 3971, 4059, 4134, 4219, 4273, 4326, 4415, 4474, 4511, 4546, 4584, 4613, 4631, 4676, 4736, 4785, 4847, 4902, 4980, 5076, 5105, 5127, 5151, 5164, 5178, 5189, 5200, 5218, 5230, 5242, 5272, 5324, 5376, 5420, 5448, 5476, 5496, 5552, 5592, 5623, 5673, 5713, 5759, 5801, 5830, 5849, 5885, 5910, 5932, 5949, 5968, 5994, 6024, 6044, 6059, 6080, 6091, 6099, 6107, 6126, 6131, 6139, 6147, 6158, 6169, 6177, 6180, 6189, 6194, 6198, 6205, 6208, 6214, 6217, 6222, 6226, 6231];

    const CDN = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

    // Use LOCAL ayah numbers 2+ (to skip Basmallah which is in ayah 1's audio).
    // localAyah → globalAyah = SURAH_STARTS[surahIndex] + (localAyah - 1)
    // We pick distinctive ayahs that people can recognize.
    const samples: { surah: string; surahNum: number; localAyah: number }[] = [
        // ─── Grandes sourates connues ───
        { surah: 'Al-Fatihah', surahNum: 1, localAyah: 2 },       // الحمد لله رب العالمين
        { surah: 'Al-Baqarah', surahNum: 2, localAyah: 2 },       // ذلك الكتاب لا ريب فيه
        { surah: 'Al-Imran', surahNum: 3, localAyah: 2 },         // الله لا إله إلا هو الحي القيوم
        { surah: 'Al-Kahf', surahNum: 18, localAyah: 2 },         // قيما لينذر بأسا شديدا
        { surah: 'Maryam', surahNum: 19, localAyah: 2 },          // ذكر رحمة ربك عبده زكريا
        { surah: 'Ta-Ha', surahNum: 20, localAyah: 2 },           // ما أنزلنا عليك القرآن لتشقى
        { surah: 'Al-Anbiya', surahNum: 21, localAyah: 2 },       // ما يأتيهم من ذكر
        { surah: 'Al-Furqan', surahNum: 25, localAyah: 2 },       // الذي له ملك السماوات
        { surah: 'Yusuf', surahNum: 12, localAyah: 3 },           // نحن نقص عليك أحسن القصص
        { surah: 'Luqman', surahNum: 31, localAyah: 2 },          // تلك آيات الكتاب الحكيم
        { surah: 'Yasin', surahNum: 36, localAyah: 2 },           // والقرآن الحكيم
        { surah: 'As-Saffat', surahNum: 37, localAyah: 2 },       // فالزاجرات زجرا
        { surah: 'Sad', surahNum: 38, localAyah: 2 },             // بل الذين كفروا في عزة
        { surah: 'Az-Zumar', surahNum: 39, localAyah: 2 },        // إنا أنزلنا إليك الكتاب
        { surah: 'Ghafir', surahNum: 40, localAyah: 2 },          // تنزيل الكتاب من الله
        { surah: 'Muhammad', surahNum: 47, localAyah: 2 },        // والذين آمنوا وعملوا
        { surah: 'Al-Hujurat', surahNum: 49, localAyah: 2 },      // لا ترفعوا أصواتكم
        { surah: 'Ar-Rahman', surahNum: 55, localAyah: 13 },      // فبأي آلاء ربكما تكذبان
        { surah: "Al-Waqi'ah", surahNum: 56, localAyah: 2 },      // ليس لوقعتها كاذبة
        { surah: 'Al-Hadid', surahNum: 57, localAyah: 2 },        // له ملك السماوات والأرض
        { surah: 'Al-Mulk', surahNum: 67, localAyah: 2 },         // الذي خلق الموت والحياة
        { surah: 'Al-Qalam', surahNum: 68, localAyah: 2 },        // ما أنت بنعمة ربك بمجنون
        { surah: 'Al-Jinn', surahNum: 72, localAyah: 2 },         // يهدي إلى الرشد فآمنا به
        { surah: 'Al-Muzzammil', surahNum: 73, localAyah: 2 },    // قم الليل إلا قليلا
        // ─── Juz Amma (78-114) — les plus mémorisées ───
        { surah: 'An-Naba', surahNum: 78, localAyah: 2 },         // عن النبإ العظيم
        { surah: "An-Nazi'at", surahNum: 79, localAyah: 2 },      // والناشطات نشطا
        { surah: "'Abasa", surahNum: 80, localAyah: 2 },          // أن جاءه الأعمى
        { surah: 'At-Takwir', surahNum: 81, localAyah: 2 },       // وإذا النجوم انكدرت
        { surah: 'Al-Infitar', surahNum: 82, localAyah: 2 },      // وإذا الكواكب انتثرت
        { surah: 'Al-Mutaffifin', surahNum: 83, localAyah: 2 },   // الذين إذا اكتالوا
        { surah: 'Al-Inshiqaq', surahNum: 84, localAyah: 2 },     // وأذنت لربها وحقت
        { surah: 'Al-Buruj', surahNum: 85, localAyah: 2 },        // واليوم الموعود
        { surah: 'At-Tariq', surahNum: 86, localAyah: 2 },        // وما أدراك ما الطارق
        { surah: "Al-A'la", surahNum: 87, localAyah: 2 },         // الذي خلق فسوى
        { surah: 'Al-Ghashiyah', surahNum: 88, localAyah: 2 },    // وجوه يومئذ خاشعة
        { surah: 'Al-Fajr', surahNum: 89, localAyah: 2 },         // وليال عشر
        { surah: 'Al-Balad', surahNum: 90, localAyah: 2 },        // وأنت حل بهذا البلد
        { surah: 'Ash-Shams', surahNum: 91, localAyah: 2 },       // والقمر إذا تلاها
        { surah: 'Al-Layl', surahNum: 92, localAyah: 2 },         // والنهار إذا تجلى
        { surah: 'Ad-Duha', surahNum: 93, localAyah: 2 },         // ما ودعك ربك وما قلى
        { surah: 'Ash-Sharh', surahNum: 94, localAyah: 2 },       // ووضعنا عنك وزرك
        { surah: 'At-Tin', surahNum: 95, localAyah: 2 },          // وطور سينين
        { surah: "Al-'Alaq", surahNum: 96, localAyah: 2 },        // خلق الإنسان من علق
        { surah: 'Al-Qadr', surahNum: 97, localAyah: 2 },         // وما أدراك ما ليلة القدر
        { surah: 'Al-Bayyinah', surahNum: 98, localAyah: 2 },     // رسول من الله يتلو
        { surah: 'Az-Zalzalah', surahNum: 99, localAyah: 2 },     // وأخرجت الأرض أثقالها
        { surah: "Al-'Adiyat", surahNum: 100, localAyah: 2 },     // فالموريات قدحا
        { surah: "Al-Qari'ah", surahNum: 101, localAyah: 2 },     // ما القارعة
        { surah: 'At-Takathur', surahNum: 102, localAyah: 2 },    // حتى زرتم المقابر
        { surah: "Al-'Asr", surahNum: 103, localAyah: 2 },        // إن الإنسان لفي خسر
        { surah: 'Al-Humazah', surahNum: 104, localAyah: 2 },     // الذي جمع مالا وعدده
        { surah: 'Al-Fil', surahNum: 105, localAyah: 2 },         // ألم يجعل كيدهم في تضليل
        { surah: 'Quraysh', surahNum: 106, localAyah: 2 },        // إيلافهم رحلة الشتاء
        { surah: "Al-Ma'un", surahNum: 107, localAyah: 2 },       // فذلك الذي يدع اليتيم
        { surah: 'Al-Kawthar', surahNum: 108, localAyah: 2 },     // فصل لربك وانحر
        { surah: 'Al-Kafirun', surahNum: 109, localAyah: 2 },     // لا أعبد ما تعبدون
        { surah: 'An-Nasr', surahNum: 110, localAyah: 2 },        // ورأيت الناس يدخلون
        { surah: 'Al-Masad', surahNum: 111, localAyah: 2 },       // ما أغنى عنه ماله
        { surah: 'Al-Ikhlas', surahNum: 112, localAyah: 2 },      // الله الصمد
        { surah: 'Al-Falaq', surahNum: 113, localAyah: 2 },       // من شر ما خلق
        { surah: 'An-Nas', surahNum: 114, localAyah: 2 },         // ملك الناس
    ];

    const questions: QuizQuestion[] = [];
    const allSurahs = samples.map(s => s.surah);

    for (const s of samples) {
        const globalAyah = SURAH_STARTS[s.surahNum - 1] + (s.localAyah - 1);
        const audioUrl = `${CDN}/${globalAyah}.mp3`;

        const q = buildMCQ(
            'verses' as QuizThemeId,
            '🎧 De quelle sourate provient ce verset ?',
            s.surah,
            allSurahs,
            undefined,
            `C'est le verset ${s.localAyah} de la sourate ${s.surah}.`
        );
        if (q) {
            q.audioUrl = audioUrl;
            questions.push(q);
        }
    }
    return questions;
}

// ─── Question Bank Cache ────────────────────────────────
let questionBank: Record<QuizThemeId, QuizQuestion[]> | null = null;

function getQuestionBank(): Record<QuizThemeId, QuizQuestion[]> {
    if (questionBank) return questionBank;

    questionBank = {
        prophets: generateProphetQuestions(),
        companions: generateCompanionQuestions(),
        verses: shuffle([...generateVerseQuestions(), ...generateAudioQuestions()]).slice(0, 30),
        invocations: shuffle(generateInvocationQuestions()).slice(0, 30),
        structure: shuffle(generateStructureQuestions()).slice(0, 30),
        'ya-ayyuha': shuffle(generateYaAyyuhaQuestions()).slice(0, 30),
        stories: generateStoriesQuestions(),
        geography: generateGeographyQuestions(),
        virtues: generateVirtuesQuestions(),
        women: generateWomenQuestions(),
        pillars: generatePillarsQuestions(),
        hadiths: generateHadithsQuestions(),
        culture: generateCultureQuestions(),
        tawhid: generateTawhidQuestions(),
        fiqh: generateFiqhQuestions(),
    };

    console.log('[QuizEngine] Question bank generated:',
        Object.entries(questionBank).map(([k, v]) => `${k}: ${v.length}`).join(', ')
    );

    return questionBank;
}

/** Hash a string into a numeric seed */
function hashString(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// ─── Public API ─────────────────────────────────────────

/** Get N random questions for a theme, optionally adjusted for difficulty */
export function getQuestions(
    theme: QuizThemeId,
    count: number = 5,
    difficulty: QuizDifficulty = 'medium'
): QuizQuestion[] {
    const bank = getQuestionBank();
    const pool = bank[theme] || [];

    // Inject 1-2 audio questions into every Solo game
    const audioPool = generateAudioQuestions();
    const audioCount = Math.min(2, audioPool.length);
    const themeCount = Math.max(1, count - audioCount);
    const themeSelected = pick(pool, Math.min(themeCount, pool.length));
    const audioSelected = pick(audioPool, audioCount);
    const selected = shuffle([...themeSelected, ...audioSelected]);

    const config = DIFFICULTY_CONFIG[difficulty];

    // Adjust choice count based on difficulty
    if (config.choiceCount !== 4) {
        return selected.map(q => {
            if (q.choices.length <= config.choiceCount) return q;
            const correct = q.choices[q.correctIndex];
            const others = q.choices.filter((_, i) => i !== q.correctIndex);
            const kept = pick(others, config.choiceCount - 1);
            const newChoices = shuffle([correct, ...kept]);
            return {
                ...q,
                choices: newChoices,
                correctIndex: newChoices.indexOf(correct),
            };
        });
    }

    return selected;
}

/** Get random questions from ALL themes (for Sprint mode) */
export function getSprintQuestions(count: number = 30): QuizQuestion[] {
    const bank = getQuestionBank();
    const allQuestions = Object.values(bank).flat();
    // Inject 3 audio questions into Sprint
    const audioPool = generateAudioQuestions();
    const audioSelected = pick(audioPool, Math.min(3, audioPool.length));
    const themeSelected = pick(allQuestions, Math.min(count - 3, allQuestions.length));
    return shuffle([...themeSelected, ...audioSelected]);
}

/** Get audio-based quiz questions */
export function getAudioQuestions(count: number = 10): QuizQuestion[] {
    const audioQs = generateAudioQuestions();
    return pick(audioQs, Math.min(count, audioQs.length));
}

/** Build 3 rounds of duel questions, each round = random theme × 3 questions */
export function getDuelRoundQuestions(customThemes?: QuizThemeId[]): { themes: QuizThemeId[]; questions: QuizQuestion[][] } {
    const bank = getQuestionBank();
    const allThemeIds: QuizThemeId[] = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha', 'stories', 'geography', 'virtues', 'women', 'pillars', 'hadiths', 'culture', 'tawhid', 'fiqh'];
    const selectedThemes = customThemes || pick(allThemeIds, 3);

    // Inject 1 audio question into each duel round
    const audioPool = generateAudioQuestions();
    const rounds = selectedThemes.map(themeId => {
        const pool = bank[themeId] || [];
        const themeQs = pick(pool, Math.min(2, pool.length));
        const audioQ = pick(audioPool, 1);
        return shuffle([...themeQs, ...audioQ]);
    });

    return { themes: selectedThemes, questions: rounds };
}

/** Get seeded questions for Daily Challenge (10 Q, all themes) */
export function getDailyQuestions(dateSeed: string): QuizQuestion[] {
    const bank = getQuestionBank();
    const allQuestions = Object.values(bank).flat();
    const seed = hashString(dateSeed);
    const rng = seededRandom(seed);

    return pick(allQuestions, 10, rng);
}

/** Get total question count per theme */
export function getQuestionCounts(): Record<QuizThemeId, number> {
    const bank = getQuestionBank();
    const counts = {} as Record<QuizThemeId, number>;
    for (const [key, val] of Object.entries(bank)) {
        counts[key as QuizThemeId] = val.length;
    }
    return counts;
}

/** Calculate score for an answer (time-based bonus) */
export function calculateScore(
    correct: boolean,
    timeMs: number,
    maxTimeMs: number = 15000,
    difficulty: QuizDifficulty = 'medium'
): number {
    if (!correct) return 0;
    const timeBonus = Math.max(0, 1 - timeMs / maxTimeMs);
    const base = Math.round(100 + timeBonus * 100); // 100-200 points
    return Math.round(base * DIFFICULTY_CONFIG[difficulty].scoreMultiplier);
}
