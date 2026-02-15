import type { HadithEntry } from '../types/hadith';

const S = { B: 'Bukhari', M: 'Muslim', T: 'Tirmidhi', BM: 'Bukhari & Muslim' };

export const HADITHS_PART3: HadithEntry[] = [
    // ═══ CHARITÉ (Expansion) ═══
    { id: 80, ar: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", fr: "L'aumône éteint le péché comme l'eau éteint le feu.", src: S.T, nar: "Mu'adh ibn Jabal", cat: 'charite' },
    { id: 81, ar: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", fr: "L'aumône n'a jamais diminué une richesse.", src: S.M, nar: "Abu Hurayra", cat: 'charite' },
    { id: 82, ar: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ", fr: "Protégez-vous du Feu, ne serait-ce qu'avec la moitié d'une datte.", src: S.BM, nar: "Adi ibn Hatim", cat: 'charite' },
    { id: 350, ar: "كُلُّ سُلامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ", fr: "Chaque jointure de l'homme doit une aumône chaque jour où le soleil se lève.", src: S.BM, nar: "Abu Hurayra", cat: 'charite' },
    { id: 351, ar: "إِنَّ الصَّدَقَةَ لَتُطْفِئُ عَنْ أَهْلِهَا حَرَّ الْقُبُورِ", fr: "Certes l'aumône éteint pour ceux qui la font la chaleur des tombes.", src: S.T, nar: "Uqba ibn Amir", cat: 'charite' },
    { id: 352, ar: "دَاوُوا مَرْضَاكُمْ بِالصَّدَقَةِ", fr: "Soignez vos malades par l'aumône.", src: S.T, nar: "Abu Umama", cat: 'charite' },

    // ═══ PARENTS & FAMILLE (Expansion) ═══
    { id: 88, ar: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدَيْنِ وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدَيْنِ", fr: "La satisfaction du Seigneur réside dans la satisfaction des parents, et Sa colère dans leur colère.", src: S.T, nar: "Abdullah ibn Amr", cat: 'parents' },
    { id: 89, ar: "الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", fr: "Le Paradis se trouve sous les pieds des mères (version abrégée authentifiée).", src: S.T, nar: "Mu'awiya ibn Jahima", cat: 'parents' },
    { id: 91, ar: "مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي؟ قَالَ: أُمُّكَ ثُمَّ أُمُّكَ ثُمَّ أُمُّكَ ثُمَّ أَبُوكَ", fr: "Qui mérite le plus ma bonne compagnie ? Ta mère, puis ta mère, puis ta mère, puis ton père.", src: S.BM, nar: "Abu Hurayra", cat: 'parents' },
    { id: 360, ar: "لا يَدْخُلُ الْجَنَّةَ قَاطِعٌ", fr: "N'entrera pas au Paradis celui qui rompt les liens (de parenté).", src: S.BM, nar: "Jubayr ibn Mut'im", cat: 'parents' },
    { id: 361, ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَصِلْ رَحِمَهُ", fr: "Que celui qui croit en Allah et au Jour dernier maintienne ses liens de parenté.", src: S.BM, nar: "Abu Hurayra", cat: 'parents' },

    // ═══ MARIAGE & COUPLE (Nouvelle catégorie) ═══
    { id: 370, ar: "إِذَا جَاءَكُمْ مَنْ تَرْضَوْنَ دِينَهُ وَخُلُقَهُ فَزَوِّجُوهُ", fr: "Si quelqu'un dont vous agréez la religion et le comportement vient à vous (pour demander mariage), mariez-le.", src: S.T, nar: "Abu Hurayra", cat: 'mariage' },
    { id: 371, ar: "يا مَعْشَرَ الشَّيَابِ مَنِ اسْتَطَاعَ مِنْكُمُ البَاءَةَ فَلْيَتَزَوَّجْ", fr: "Ô jeunes gens ! Que celui d'entre vous qui en a les moyens se marie.", src: S.BM, nar: "Ibn Mas'ud", cat: 'mariage' },
    { id: 372, ar: "تُنْكَحُ الْمَرْأَةُ لأَرْبَعٍ: لِمَالِهَا وَلِحَسَبِهَا وَلِجَمَالِهَا وَلِدِينِهَا، فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ", fr: "On épouse une femme pour quatre raisons : sa fortune, son lignage, sa beauté et sa religion. Choisis celle qui est religieuse.", src: S.BM, nar: "Abu Hurayra", cat: 'mariage' },
    { id: 373, ar: "الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ", fr: "Ce bas-monde est une jouissance, et la meilleure de ses jouissances est la femme pieuse.", src: S.M, nar: "Abdullah ibn Amr", cat: 'mariage' },
    { id: 374, ar: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا، وَخِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ", fr: "Les croyants les plus complets en foi sont ceux qui ont le meilleur caractère, et les meilleurs d'entre vous sont les meilleurs avec leurs femmes.", src: S.T, nar: "Abu Hurayra", cat: 'mariage' },

    // ═══ REPENTIR (Expansion) ═══
    { id: 95, ar: "كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ", fr: "Tous les fils d'Adam commettent des erreurs, et les meilleurs sont ceux qui se repentent.", src: S.T, nar: "Anas ibn Malik", cat: 'repentir' },
    { id: 99, ar: "إِنَّ اللَّهَ يَقْبَلُ تَوْبَةَ الْعَبْدِ مَا لَمْ يُغَرْغِرْ", fr: "Allah accepte le repentir du serviteur tant que son âme n'a pas atteint sa gorge.", src: S.T, nar: "Abdullah ibn Umar", cat: 'repentir' },
    { id: 380, ar: "النَّدَمُ تَوْبَةٌ", fr: "Le regret c'est le repentir.", src: S.T, nar: "Ibn Mas'ud", cat: 'repentir' },
    { id: 381, ar: "لَوْ لَمْ تُذْنِبُوا لَذَهَبَ اللَّهُ بِكُمْ وَلَجَاءَ بِقَوْمٍ يُذْنِبُونَ فَيَسْتَغْفِرُونَ اللَّهَ فَيَغْفِرُ لَهُمْ", fr: "Si vous ne péchiez pas, Allah vous ferait disparaître et amènerait un peuple qui pécherait et Lui demanderait pardon.", src: S.M, nar: "Abu Hurayra", cat: 'repentir' },

    // ═══ SCIENCE & SAVOIR (Expansion) ═══
    { id: 102, ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", fr: "Celui qui emprunte un chemin à la recherche du savoir, Allah lui facilite un chemin vers le Paradis.", src: S.M, nar: "Abu Hurayra", cat: 'science' },
    { id: 103, ar: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", fr: "La recherche du savoir est une obligation pour tout musulman.", src: S.T, nar: "Anas ibn Malik", cat: 'science' },
    { id: 106, ar: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", fr: "Celui à qui Allah veut du bien, Il lui accorde la compréhension de la religion.", src: S.BM, nar: "Mu'awiya", cat: 'science' },
    { id: 390, ar: "مَنْ سُئِلَ عَنْ عِلْمٍ فكَتَمَهُ أُلْجِمَ يَوْمَ الْقِيَامَةِ بِلِجَامٍ مِنْ نَارٍ", fr: "Celui à qui on demande un savoir et qui le cache sera bridé au Jour de la Résurrection par une bride de feu.", src: S.T, nar: "Abu Hurayra", cat: 'science' },
    { id: 391, ar: "الْعِلْمُ ثَلاثَةٌ: فَمَا سِوَى ذَلِكَ فَهُوَ فَضْلٌ: آيَةٌ مُحْكَمَةٌ، أَوْ سُنَّةٌ قَائِمَةٌ، أَوْ فَرِيضَةٌ عَادِلَةٌ", fr: "La science utile est de trois sortes : un verset explicite, une Sunna établie ou une prescription équitable.", src: S.T, nar: "Abdullah ibn Amr", cat: 'science' },
];
