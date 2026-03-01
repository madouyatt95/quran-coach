// ─── Tajweed Rules Database ──────────────────────────────
// Static pedagogical data for Tajweed visualization

export interface TajweedRule {
    id: string;
    name: string;
    nameAr: string;
    color: string;         // CSS color for visual highlighting
    bgColor: string;       // Background color for highlighting
    description: string;
    howTo: string;         // How to apply the rule
    commonMistake: string; // Frequent error to avoid
    example: {
        arabic: string;
        surah: string;
        highlightedWord: string;
    };
}

export const TAJWEED_RULES: TajweedRule[] = [
    {
        id: 'idgham',
        name: 'Idgham (Fusion)',
        nameAr: 'إدغام',
        color: '#4CAF50',
        bgColor: 'rgba(76, 175, 80, 0.15)',
        description: 'Quand un Noun sakin (نْ) ou un Tanwin (ـٌـٍـً) est suivi d\'une des 6 lettres (ي ر م ل و ن), on fusionne les deux sons.',
        howTo: 'Le Noon disparaît et se fond dans la lettre suivante. Si c\'est avec Ghunna (ي ن م و), un nasillement de 2 temps est produit. Si c\'est sans Ghunna (ل ر), la fusion est complète.',
        commonMistake: '❌ Prononcer clairement le Noon au lieu de le fusionner.\n✅ Le Noon doit fondre dans la lettre suivante de manière fluide.',
        example: {
            arabic: 'مِن يَّعْمَلْ',
            surah: 'An-Nisa, 4:123',
            highlightedWord: 'مِن يَّ',
        },
    },
    {
        id: 'ikhfa',
        name: 'Ikhfa (Dissimulation)',
        nameAr: 'إخفاء',
        color: '#FF9800',
        bgColor: 'rgba(255, 152, 0, 0.15)',
        description: 'Quand un Noon sakin ou un Tanwin est suivi de l\'une des 15 lettres d\'Ikhfa, le son du Noon est atténué avec un nasillement (Ghunna) de 2 temps.',
        howTo: 'Le Noon n\'est ni prononcé clairement ni fusionné. Il est « caché » avec un nasillement doux. Les 15 lettres sont : ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك.',
        commonMistake: '❌ Prononcer le Noon clairement avant la lettre suivante.\n✅ Le Noon doit vibrer doucement dans le nez pendant 2 temps.',
        example: {
            arabic: 'مِنْ ثَمَرَةٍ',
            surah: 'Al-Baqarah, 2:25',
            highlightedWord: 'مِنْ ثَ',
        },
    },
    {
        id: 'iqlab',
        name: 'Iqlab (Transformation)',
        nameAr: 'إقلاب',
        color: '#2196F3',
        bgColor: 'rgba(33, 150, 243, 0.15)',
        description: 'Quand un Noon sakin ou un Tanwin est suivi de la lettre ب (Ba), le Noon se transforme en Mim (م) avec un nasillement de 2 temps.',
        howTo: 'Remplacer mentalement le Noon par un Mim et produire un léger nasillement avant le Ba. Les lèvres se ferment comme pour le Mim.',
        commonMistake: '❌ Dire « Noun Ba » séparément.\n✅ Dire « Mim Ba » avec un nasillement doux.',
        example: {
            arabic: 'مِنۢ بَعْدِ',
            surah: 'Al-Baqarah, 2:27',
            highlightedWord: 'مِنۢ بَ',
        },
    },
    {
        id: 'izhar',
        name: 'Izhar (Prononciation claire)',
        nameAr: 'إظهار',
        color: '#9C27B0',
        bgColor: 'rgba(156, 39, 176, 0.15)',
        description: 'Quand un Noon sakin ou un Tanwin est suivi d\'une des 6 lettres de gorge (ء ه ع ح غ خ), le Noon est prononcé clairement sans nasillement.',
        howTo: 'Prononcer le Noon de manière distincte, puis la lettre de gorge suivante. Pas de fusion, pas de nasillement.',
        commonMistake: '❌ Ajouter un nasillement (Ghunna) avant la lettre de gorge.\n✅ Le Noon doit être clair et net.',
        example: {
            arabic: 'مَنْ أَنصَارِي',
            surah: 'As-Saff, 61:14',
            highlightedWord: 'مَنْ أَ',
        },
    },
    {
        id: 'qalqalah',
        name: 'Qalqalah (Rebond)',
        nameAr: 'قلقلة',
        color: '#E91E63',
        bgColor: 'rgba(233, 30, 99, 0.15)',
        description: 'Quand l\'une des 5 lettres de Qalqalah (ق ط ب ج د) porte un Soukoun, elle produit un léger rebond sonore (écho).',
        howTo: 'Les lettres « Qoutb Jad » (قطب جد) produisent un rebond quand elles sont au repos (Soukoun). Le rebond est plus prononcé en fin de verset.',
        commonMistake: '❌ Ne pas faire rebondir la lettre (son plat et sans vie).\n✅ Un léger rebond net, comme un « écho » bref.',
        example: {
            arabic: 'قُلْ هُوَ اللَّهُ أَحَدْ',
            surah: 'Al-Ikhlas, 112:1',
            highlightedWord: 'أَحَدْ',
        },
    },
    {
        id: 'madd-tabii',
        name: 'Madd Tabii (Allongement naturel)',
        nameAr: 'مد طبيعي',
        color: '#00BCD4',
        bgColor: 'rgba(0, 188, 212, 0.15)',
        description: 'Allongement naturel de 2 temps sur les lettres de Madd (ا و ي) quand elles ne sont pas suivies d\'une Hamza ou d\'un Soukoun.',
        howTo: 'Prolonger le son de la voyelle pendant exactement 2 temps (comme dire « un-deux » dans sa tête).',
        commonMistake: '❌ Allonger trop (4-6 temps) ou pas assez (1 temps).\n✅ Exactement 2 temps, ni plus ni moins.',
        example: {
            arabic: 'قَالُوا',
            surah: 'Al-Baqarah, 2:11',
            highlightedWord: 'قَالُوا',
        },
    },
    {
        id: 'ghunna',
        name: 'Ghunna (Nasillement)',
        nameAr: 'غُنَّة',
        color: '#FF5722',
        bgColor: 'rgba(255, 87, 34, 0.15)',
        description: 'Un nasillement de 2 temps produit par les lettres Noon (ن) et Mim (م) quand elles sont doublées (Chaddah).',
        howTo: 'Faire passer le son par le nez pendant 2 temps. Le Noon et le Mim avec Chaddah portent toujours un nasillement.',
        commonMistake: '❌ Ne pas faire de nasillement sur les lettres doublées.\n✅ Vibrer dans le nez pendant 2 temps.',
        example: {
            arabic: 'إِنَّ',
            surah: 'Al-Baqarah, 2:6',
            highlightedWord: 'إِنَّ',
        },
    },
];

// Color legend for rendering
export const TAJWEED_COLOR_LEGEND = TAJWEED_RULES.map(r => ({
    id: r.id,
    name: r.name,
    nameAr: r.nameAr,
    color: r.color,
    bgColor: r.bgColor,
}));
