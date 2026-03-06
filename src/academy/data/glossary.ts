export const ACADEMY_GLOSSARY: Record<string, string> = {
    'tajwid': 'L\'art de réciter le Coran en accordant à chaque lettre son droit et sa règle de prononciation.',
    'tajweed': 'L\'art de réciter le Coran en accordant à chaque lettre son droit et sa règle de prononciation.',
    'ghunna': 'Nasillement ou son nasal produit par la cavité nasale (Khayshûm) durant 2 temps, notamment sur les Nûn et Mîm avec Shadda.',
    'idgham': 'Fusion ou incorporation d\'une lettre dans la suivante. Par exemple, un Nûn Sâkin dans un Yâ.',
    'khatm': 'Clôture ou lecture complète du Coran.',
    'surate': 'Un chapitre du Coran.',
    'verset': 'Un "Ayah", le signe ou la phrase qui compose une Surate du Coran.',
    'makharij': 'Points de sortie ou d\'articulation des lettres arabes dans l\'appareil vocal.',
    'qalqalah': 'Rebondissement ou écho du son lors de la prononciation de certaines consonnes sans voyelle (Qaf, Ta, Ba, Jim, Dal).',
    'ikhfa': 'Dissimulation. Cacher le Nûn Sâkin ou Tanwîn avant certaines lettres, avec Ghunna.',
    'izhar': 'Clarification. Prononcer clairement le Nûn Sâkin ou Tanwîn sans Ghunna ajoutée.',
    'iqlab': 'Transformation. Changer le Nûn Sâkin en Mîm avant la lettre Bâ, avec Ghunna.',
    'madd': 'Allongement ou prolongation du son de certaines voyelles (A, I, U).',
    'shadda': 'Consonne double. Marque de gémination où l\'on insiste sur la lettre.',
    'sukun': 'Absence de voyelle sur une consonne (lettre silencieuse ou "Sâkin").',
    'tanwin': 'Terminaison nasale "n" ajoutée à la fin d\'un nom (an, in, un).',
    'tawhid': 'Le monothéisme pur : affirmer que Dieu est l\'Unique.',
    'fiqh': 'La jurisprudence islamique, c\'est-à-dire l\'explication détaillée des règles de la pratique religieuse.',
    'aqidah': 'Le dogme islamique, tout ce qui a trait à la croyance et aux fondements de la foi (Les 6 piliers).',
    'sunnah': 'La tradition, les pratiques et enseignements du Prophète Muhammad (ﷺ).',
    'hadith': 'La parole, l\'acte ou l\'approbation du Prophète Muhammad (ﷺ).',
    'tafsir': 'L\'exégèse ou l\'interprétation et l\'explication des versets du Coran.',
};

// Trie par longueur décroissante pour éviter d'entourer "idgham" si le mot est "idgham shafawi"
export const SORTED_GLOSSARY_KEYS = Object.keys(ACADEMY_GLOSSARY).sort((a, b) => b.length - a.length);
