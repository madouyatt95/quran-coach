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
        { q: "Quelle sourate raconte l'histoire du propriétaire des deux jardins ?", a: "Al-Kahf", p: ["Al-Baqarah", "Yusuf", "Al-Qasas"] }
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
        { q: "Quelle nation était la cité d'Iram 'aux colonnes sans pareilles' ?", a: "Les 'Ad", p: ["Les Samaritains", "Les Romains", "Les Perses"] }
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
        { q: "Quelle sourate est une protection contre la pauvreté ?", a: "Al-Waqi'ah", p: ["Al-Mulk", "An-Naba", "Al-Infitar"] }
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
        { q: "Quelle sourate porte le nom de 'La Femme qui discute' ?", a: "Al-Mujadila", p: ["An-Nisa", "Al-Mumtahina", "Al-Ahzab"] }
    ];
    return data.map(d => buildMCQ('women', d.q, d.a, [...d.p, d.a])).filter(q => q !== null) as QuizQuestion[];
}

// ─── Audio Questions ────────────────────────────────────
function generateAudioQuestions(): QuizQuestion[] {
    const samples = [
        { id: 'a1', theme: 'verses' as const, reciter: 'Mishary Rashid Alafasy', surah: 'Al-Fatihah', url: 'https://download.quranicaudio.com/quran/mishari_rashid_alafasy/001.mp3' },
        { id: 'a2', theme: 'verses' as const, reciter: 'Abdur-Rahman as-Sudais', surah: 'An-Nas', url: 'https://download.quranicaudio.com/quran/abdurrahmaan_as-sudais/114.mp3' },
        { id: 'a3', theme: 'verses' as const, reciter: 'Saad al-Ghamdi', surah: 'Al-Ikhlas', url: 'https://download.quranicaudio.com/quran/saad_al-ghamidi/112.mp3' },
    ];

    const questions: QuizQuestion[] = [];
    const reciterNames = ['Mishary Rashid Alafasy', 'Abdur-Rahman as-Sudais', 'Saad al-Ghamdi', 'Maher Al-Muaiqly'];

    for (const s of samples) {
        // Q: Who is the reciter?
        const q1 = buildMCQ(
            s.theme,
            `Qui est ce récitateur ?`,
            s.reciter,
            reciterNames,
            undefined,
            `Il s'agit de ${s.reciter}.`
        );
        if (q1) {
            q1.audioUrl = s.url;
            questions.push(q1);
        }

        // Q: Which surah?
        const q2 = buildMCQ(
            s.theme,
            `De quelle sourate provient cet extrait ?`,
            s.surah,
            ['Al-Fatihah', 'An-Nas', 'Al-Ikhlas', 'Al-Falaq', 'Al-Baqarah'],
            undefined,
            `C'est la sourate ${s.surah}.`
        );
        if (q2) {
            q2.audioUrl = s.url;
            questions.push(q2);
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
        verses: [...generateVerseQuestions(), ...generateAudioQuestions()],
        invocations: generateInvocationQuestions(),
        structure: generateStructureQuestions(),
        'ya-ayyuha': generateYaAyyuhaQuestions(),
        stories: generateStoriesQuestions(),
        geography: generateGeographyQuestions(),
        virtues: generateVirtuesQuestions(),
        women: generateWomenQuestions(),
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
    const selected = pick(pool, Math.min(count, pool.length));

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
    return pick(allQuestions, Math.min(count, allQuestions.length));
}

/** Build 3 rounds of duel questions, each round = random theme × 3 questions */
export function getDuelRoundQuestions(customThemes?: QuizThemeId[]): { themes: QuizThemeId[]; questions: QuizQuestion[][] } {
    const bank = getQuestionBank();
    const allThemeIds: QuizThemeId[] = ['prophets', 'companions', 'verses', 'invocations', 'structure', 'ya-ayyuha', 'stories', 'geography', 'virtues', 'women'];
    const selectedThemes = customThemes || pick(allThemeIds, 3);

    const rounds = selectedThemes.map(themeId => {
        const pool = bank[themeId] || [];
        return pick(pool, Math.min(3, pool.length));
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
