import type { HadithEntry } from '../types/hadith';

const S = { B: 'Bukhari', M: 'Muslim', T: 'Tirmidhi', BM: 'Bukhari & Muslim' };

export const HADITHS_PART4: HadithEntry[] = [
    // ═══ COMMERCE & TRAVAIL (Nouvelle catégorie) ═══
    { id: 400, ar: "أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَنْ يَجِفَّ عَرَقُهُ", fr: "Donnez à l'employé son salaire avant que sa sueur ne sèche.", src: S.T, nar: "Ibn Umar", cat: 'commerce' },
    { id: 401, ar: "رَحِمَ اللَّهُ رَجُلاً سَمْحًا إِذَا بَاعَ وَإِذَا اشْتَرَى وَإِذَا اقْتَضَى", fr: "Qu'Allah fasse miséricorde à un homme indulgent quand il vend, quand il achète et quand il réclame son dû.", src: S.B, nar: "Jabir", cat: 'commerce' },
    { id: 402, ar: "الْبَيِّعانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا فِي بَيْعِهِمَا", fr: "Les deux parties d'une vente sont libres tant qu'elles ne se sont pas séparées. S'ils sont sincères et clairs, leur vente sera bénie.", src: S.BM, nar: "Hakim ibn Hizam", cat: 'commerce' },
    { id: 403, ar: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", fr: "Celui qui nous trompe n'est pas des nôtres.", src: S.M, nar: "Abu Hurayra", cat: 'commerce' },

    // ═══ CŒUR & SPIRITUALITÉ (Nouvelle catégorie) ═══
    { id: 410, ar: "أَلا وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلا وَهِيَ الْقَلْبُ", fr: "Certes, il y a dans le corps un morceau de chair : s'il est bon, tout le corps est bon, s'il est mauvais, tout le corps est mauvais. C'est le cœur.", src: S.BM, nar: "Nu'man ibn Bashir", cat: 'coeur' },
    { id: 411, ar: "إِنَّ الْعَبْدَ إِذَا أَخْطَأَ خَطِيئَةً نُكِتَتْ فِي قَلْبِهِ نُكْتَةٌ سَوْدَاءُ", fr: "Quand le serviteur commet un péché, une tache noire est marquée dans son cœur.", src: S.T, nar: "Abu Hurayra", cat: 'coeur' },
    { id: 412, ar: "تَعَرَّفْ إِلَى اللَّهِ فِي الرَّخَاءِ يَعْرِفْكَ فِي الشِّدَّةِ", fr: "Fais-toi connaître d'Allah dans l'aisance, Il te connaîtra dans la difficulté.", src: S.T, nar: "Ibn Abbas", cat: 'coeur' },
    { id: 413, ar: "اللَّهُمَّ يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", fr: "Ô Allah, Toi qui retournes les cœurs, raffermis mon cœur sur Ta religion.", src: S.T, nar: "Anas ibn Malik", cat: 'coeur' },

    // ═══ LE PROPHÈTE ﷺ (Nouvelle catégorie) ═══
    { id: 420, ar: "مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا", fr: "Celui qui prie sur moi une fois, Allah prie sur lui dix fois.", src: S.M, nar: "Abu Hurayra", cat: 'prophete' },
    { id: 421, ar: "أَنَا سَيِّدُ وَلَدِ آدَمَ يَوْمَ الْقِيَامَةِ وَلا فَخْرَ", fr: "Je serai le maître des fils d'Adam le Jour de la Résurrection, et je ne dis pas cela par vanité.", src: S.M, nar: "Abu Hurayra", cat: 'prophete' },
    { id: 422, ar: "لِكُلِّ نَبِيٍّ دَعْوَةٌ مُسْتَجَابَةٌ فَتَعَجَّلَ كُلُّ نَبِيٍّ دَعْوَتَهُ وَإِنِّي اخْتَبَأْتُ دَعْوَتِي شَفَاعَةً لأُمَّتِي", fr: "Chaque prophète a eu une invocation exaucée, et j'ai réservé la mienne pour intercéder pour ma communauté.", src: S.BM, nar: "Abu Hurayra", cat: 'prophete' },

    // ═══ VENDREDI (Nouvelle catégorie) ═══
    { id: 430, ar: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ", fr: "Le meilleur jour sur lequel le soleil se soit levé est le vendredi.", src: S.M, nar: "Abu Hurayra", cat: 'vendredi' },
    { id: 431, ar: "فِيهِ سَاعَةٌ لا يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ قَائِمٌ يُصَلِّي يَسْأَلُ اللَّهَ تَعَالَى شَيْئًا إِلا أَعْطَاهُ إِيَّاهُ", fr: "Il y a en ce jour une heure durant laquelle tout serviteur musulman qui demande une chose à Allah l'obtiendra.", src: S.BM, nar: "Abu Hurayra", cat: 'vendredi' },
    { id: 432, ar: "مَنِ اغْتَسَلَ يَوْمَ الْجُمُعَةِ ثُمَّ رَاحَ فَكَأَنَّمَا قَرَّبَ بَدَنَةً", fr: "Celui qui fait le ghousl le vendredi et se rend tôt à la mosquée, est comme s'il offrait un chameau.", src: S.BM, nar: "Abu Hurayra", cat: 'vendredi' },

    // ═══ MORT & FUNÉRAILLES (Nouvelle catégorie) ═══
    { id: 112, ar: "أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ: الْمَوْتِ", fr: "Rappelez-vous souvent le destructeur des plaisirs : la mort.", src: S.T, nar: "Abu Hurayra", cat: 'mort' },
    { id: 440, ar: "أَنْتُمْ شُهَدَاءُ اللَّهِ فِي الأَرْضِ", fr: "Vous êtes les témoins d'Allah sur terre (à propos d'un mort qu'on loue).", src: S.BM, nar: "Anas ibn Malik", cat: 'mort' },
    { id: 441, ar: "إِذَا وُضِعَتِ الْجَنَازَةُ فَاحْتَمَلَهَا الرِّجَالُ عَلَى أَعْنَاقِهِمْ، فَإِنْ كَانَتْ صَالِحَةً قَالَتْ: قَدِّمُونِي", fr: "Quand la dépouille est portée, si elle est pieuse elle s'écrie : Faites-moi avancer !", src: S.B, nar: "Abu Sa'id al-Khudri", cat: 'mort' },

    // ═══ AU-DELÀ (Expansion) ═══
    { id: 109, ar: "فِي الْجَنَّةِ مَا لا عَيْنٌ رَأَتْ وَلا أُذُنٌ سَمِعَتْ وَلا خَطَرَ عَلَى قَلْبِ بَشَرٍ", fr: "Au Paradis, il y a ce que nul œil n'a vu, nulle oreille n'a entendu et ce qui n'a jamais été imaginé par un homme.", src: S.BM, nar: "Abu Hurayra", cat: 'au_dela' },
    { id: 450, ar: "مَوْضِعُ سَوْطٍ فِي الْجَنَّةِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا", fr: "L'espace d'un fouet au Paradis est meilleur que ce bas-monde et ce qu'il contient.", src: S.BM, nar: "Sahl ibn Sa'd", cat: 'au_dela' },
    { id: 451, ar: "إِنَّ أَهْلَ الْجَنَّةِ لَيَتَرَاءَوْنَ أَهْلَ الْغُرَفِ مِنْ فَوْقِهِمْ كَمَا تَرَاءَوْنَ الْكَوْكَبَ الدُّرِّيَّ", fr: "Les gens du Paradis verront ceux des appartements supérieurs comme vous voyez les étoiles brillantes dans le ciel.", src: S.BM, nar: "Abu Sa'id al-Khudri", cat: 'au_dela' },

    // ═══ FRATERNITÉ (Expansion) ═══
    { id: 117, ar: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", fr: "Le croyant est pour le croyant comme un édifice dont les briques se soutiennent.", src: S.BM, nar: "Abu Musa", cat: 'fraternite' },
    { id: 118, ar: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ", fr: "L'image des croyants dans leur amour mutuel est celle d'un corps : si un membre souffre, tout le corps réagit.", src: S.BM, nar: "Nu'man ibn Bashir", cat: 'fraternite' },
];
