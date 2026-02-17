// Shared constants and types for Mushaf components

export const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

// French surah name translations
export const SURAH_NAMES_FR: Record<number, string> = {
    1: "L'Ouverture", 2: "La Vache", 3: "La Famille d'Imran", 4: "Les Femmes", 5: "La Table Servie",
    6: "Les Bestiaux", 7: "Les Murailles", 8: "Le Butin", 9: "Le Repentir", 10: "Jonas",
    11: "Houd", 12: "Joseph", 13: "Le Tonnerre", 14: "Abraham", 15: "Al-Hijr",
    16: "Les Abeilles", 17: "Le Voyage Nocturne", 18: "La Caverne", 19: "Marie", 20: "Ta-Ha",
    21: "Les Prophètes", 22: "Le Pèlerinage", 23: "Les Croyants", 24: "La Lumière", 25: "Le Discernement",
    26: "Les Poètes", 27: "Les Fourmis", 28: "Le Récit", 29: "L'Araignée", 30: "Les Romains",
    31: "Luqman", 32: "La Prosternation", 33: "Les Coalisés", 34: "Saba", 35: "Le Créateur",
    36: "Ya-Sin", 37: "Les Rangées", 38: "Sad", 39: "Les Groupes", 40: "Le Pardonneur",
    41: "Les Versets Détaillés", 42: "La Consultation", 43: "L'Ornement", 44: "La Fumée", 45: "L'Agenouillée",
    46: "Al-Ahqaf", 47: "Muhammad", 48: "La Victoire", 49: "Les Appartements", 50: "Qaf",
    51: "Qui Éparpillent", 52: "Le Mont", 53: "L'Étoile", 54: "La Lune", 55: "Le Tout Miséricordieux",
    56: "L'Événement", 57: "Le Fer", 58: "La Discussion", 59: "L'Exode", 60: "L'Éprouvée",
    61: "Le Rang", 62: "Le Vendredi", 63: "Les Hypocrites", 64: "La Fausse Alerte", 65: "Le Divorce",
    66: "L'Interdiction", 67: "La Royauté", 68: "La Plume", 69: "Celle qui Montre la Vérité", 70: "Les Voies d'Ascension",
    71: "Noé", 72: "Les Djinns", 73: "L'Enveloppé", 74: "Le Revêtu d'un Manteau", 75: "La Résurrection",
    76: "L'Homme", 77: "Les Envoyés", 78: "La Nouvelle", 79: "Les Anges qui Arrachent", 80: "Il s'est Renfrogné",
    81: "L'Obscurcissement", 82: "La Rupture", 83: "Les Fraudeurs", 84: "La Déchirure", 85: "Les Constellations",
    86: "L'Astre Nocturne", 87: "Le Très-Haut", 88: "L'Enveloppante", 89: "L'Aube", 90: "La Cité",
    91: "Le Soleil", 92: "La Nuit", 93: "Le Jour Montant", 94: "L'Ouverture de la Poitrine", 95: "Le Figuier",
    96: "L'Adhérence", 97: "La Destinée", 98: "La Preuve", 99: "La Secousse", 100: "Les Coursiers",
    101: "Le Fracas", 102: "La Course aux Richesses", 103: "Le Temps", 104: "Le Calomniateur", 105: "L'Éléphant",
    106: "Quraych", 107: "L'Ustensile", 108: "L'Abondance", 109: "Les Infidèles", 110: "Le Secours Divin",
    111: "Les Fibres", 112: "Le Monothéisme Pur", 113: "L'Aube Naissante", 114: "Les Hommes"
};

// Juz start pages (1-indexed, 30 juz)
export const JUZ_START_PAGES: number[] = [
    1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
    201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

// Surah start pages (1-indexed, 114 surahs)
export const SURAH_START_PAGES: number[] = [
    1, 2, 50, 77, 106, 128, 151, 177, 187, 208,
    221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
    322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
    411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
    477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
    520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
    551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
    570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
    586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
    595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
    600, 600, 601, 601, 601, 602, 602, 602, 603, 603,
    603, 604, 604, 604
];

// Simple mobile detection (Android + iOS)
export const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export type WordState = 'correct' | 'error' | 'current' | 'unread';
export type MaskMode = 'visible' | 'hidden' | 'partial' | 'minimal';

// Convert Western numbers to Arabic-Indic numerals (standard Western numerals as requested)
export function toArabicNumbers(num: number | string): string {
    return num.toString();
}

// Wrap a number in traditional Arabic verse glyphs ﴿ ﴾
export function toVerseGlyph(num: number): string {
    return `\uFD3E${toArabicNumbers(num)}\uFD3F`;
}

// Juz info helper
export function getJuzNumber(ayahs: { juz?: number }[]): number {
    if (ayahs.length === 0) return 1;
    return ayahs[0].juz || 1;
}
