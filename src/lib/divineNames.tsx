import React from 'react';

// Expression régulière pour capturer les Noms Divins en français, phonétique et arabe
// Note: \b permet de matcher des mots entiers pour les caractères latins.
const DIVINE_NAMES_REGEX = /\b(Allah|Dieu|Seigneur|Le Tout Miséricordieux|Le Très Miséricordieux|Le Créateur|L'Éternel|L'Eternel|L'Unique|Le Pourvoyeur|Le Tout-Puissant|Le Sage|L'Omniscient|L'Omnipotent|Ar-Rahman|Ar-Rahim|Ar-Rahmân|Ar-Rahîm|Rabb|Rabbi|Rabbana|Al-Malik|Al-Quddus|As-Salam|Al-Mu'min|Al-Muhaymin|Al-'Aziz|Al-Jabbar|Al-Mutakabbir)\b|(الله|الرحمن|الرحيم|الرب|إله|رب|ربنا|ربي|اللَّهُ|للَّهِ)/gi;

export function formatDivineNames(text: string | null | undefined): React.ReactNode {
    if (!text) return text;

    // On sépare le texte. Les groupes capturés seront conservés dans le tableau résultant.
    const parts = text.split(DIVINE_NAMES_REGEX);

    return parts.map((part, index) => {
        if (!part) return null;

        // Vérifier si ce morceau est un Nom Divin
        if (part.match(DIVINE_NAMES_REGEX)) {
            return (
                <span key={index} className="divine-name font-bold" style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                    {part}
                </span>
            );
        }

        return part;
    });
}
