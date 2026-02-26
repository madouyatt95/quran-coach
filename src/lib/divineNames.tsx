import React from 'react';

// Liste des noms en alphabet latin (Français et Phonétique avec variations d'accents)
const LATIN_NAMES = [
    "Allah", "Allāh", "Allâhumma", "Allāhumma", "Allāhi", "Allāhu",
    "lillāh", "lillāhi", "billāh", "billāhi", "wallāhi", "tallāhi",
    "Ar-Raḥmān", "Ar-Rahman", "Ar-Raḥīm", "Ar-Rahim",
    "Rabb", "Rabbi", "Rabbī", "Rabbanā", "Rabbana",
    "Dieu", "Seigneur", "Le Tout Miséricordieux", "Le Très Miséricordieux",
    "Le Créateur", "L'Éternel", "L'Eternel", "L'Unique", "Le Pourvoyeur",
    "Le Tout-Puissant", "Le Sage", "L'Omniscient", "L'Omnipotent",
    "Al-Malik", "Al-Quddus", "As-Salam", "Al-Mu'min", "Al-Muhaymin",
    "Al-'Aziz", "Al-Jabbar", "Al-Mutakabbir"
];

// Tri par longueur décroissante pour éviter qu'un mot court ne cache un mot long (ex: "Allah" vs "Allâhumma")
LATIN_NAMES.sort((a, b) => b.length - a.length);

// Échapper les caractères spéciaux regex
const escapedLatinNames = LATIN_NAMES.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// --- LOGIQUE POUR L'ARABE AVEC HARAKAT ---
// Les voyelles et symboles (Harakat, petits alifs, signes d'arrêt) en Unicode Arabe :
const H = "[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06ED]*";
// Variations du Alif
const A = "[اأإآٱ]";

const ARABIC_NAMES = [
    // Allah et variantes
    `${A}${H}ل${H}ل${H}ه`, // Allah
    `ل${H}ل${H}ه`,         // lillah
    `ب${H}ا${H}ل${H}ل${H}ه`,// billah
    `و${H}ا${H}ل${H}ل${H}ه`,// wallah
    `ت${H}ا${H}ل${H}ل${H}ه`,// tallah
    `${A}${H}ل${H}ل${H}ه${H}م`, // Allahumma
    // Asma ul Husna principaux
    `${A}${H}ل${H}ر${H}ح${H}م${H}ن`, // Ar-Rahman
    `${A}${H}ل${H}ر${H}ح${H}ي${H}م`, // Ar-Rahim
    `ر${H}ب${H}ن${H}ا`,     // Rabbana
    `ر${H}ب${H}ي`,         // Rabbi
    `ر${H}ب`,             // Rabb
    `إ${H}ل${H}ه`          // Ilah
];

// Construction de l'expression régulière globale
// On utilise les lookarounds Unicode (?<!\p{L}) et (?!\p{L}) pour s'assurer
// qu'on matche un mot entier sans inclure les lettres arabes ou latines adjacentes.
// Le flag 'u' est nécessaire pour \p{L}, et 'i' pour l'insensibilité à la casse.
const COMBINED_PATTERN = `(?<!\\p{L})(${escapedLatinNames.join('|')}|${ARABIC_NAMES.join('|')})(?!\\p{L})`;

const DIVINE_NAMES_REGEX = new RegExp(COMBINED_PATTERN, 'gui');

export function formatDivineNames(text: string | null | undefined): React.ReactNode {
    if (!text) return text;

    // split avec regex contenant un groupe capturant va inclure les matchs dans le tableau résultant
    const parts = text.split(DIVINE_NAMES_REGEX);

    return parts.map((part, index) => {
        if (!part) return null;

        // Si la partie correspond exactement à notre regex (c'est un Nom Divin)
        // Note: part.match(DIVINE_NAMES_REGEX) fonctionne mais on peut simplement vérifier si
        // cette partie n'est pas le texte normal. `split` place les groupes capturés aux index impairs
        // SI ET SEULEMENT SI le match a réussi. Plus simple : vérifier l'index.
        if (index % 2 !== 0) {
            return (
                <span key={index} className="divine-name" style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                    {part}
                </span>
            );
        }

        return part;
    });
}
