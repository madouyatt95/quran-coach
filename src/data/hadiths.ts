// ─── Hadith Database ────────────────────────────────────
// ~200 authentic hadiths tagged by theme for contextual daily selection

export type HadithTag =
    | 'general' | 'priere' | 'jeune' | 'ramadan' | 'vendredi'
    | 'hajj' | 'muharram' | 'rajab' | 'shaban' | 'dhikr'
    | 'patience' | 'science' | 'mort' | 'paradis' | 'matin'
    | 'soir' | 'charite' | 'parents' | 'fraternie' | 'repentir'
    | 'coran' | 'prophete' | 'bon_comportement' | 'dua';

export interface Hadith {
    id: number;
    textAr: string;
    textFr: string;
    source: string;
    narrator: string;
    tags: HadithTag[];
}

export const HADITHS: Hadith[] = [
    // ─── GENERAL ─────────────────────────────────
    { id: 1, textAr: "إنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", textFr: "Les actes ne valent que par leurs intentions, et chacun n'a pour lui que ce qu'il a eu réellement l'intention de faire.", source: "Bukhari & Muslim", narrator: "Umar ibn al-Khattab", tags: ['general'] },
    { id: 2, textAr: "مِنْ حُسْنِ إسْلامِ الْمَرْءِ تَرْكُهُ مَا لا يَعْنِيهِ", textFr: "Parmi les qualités d'un bon Islam, il y a le fait de délaisser ce qui ne nous concerne pas.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['general', 'bon_comportement'] },
    { id: 3, textAr: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", textFr: "Aucun de vous ne sera un vrai croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.", source: "Bukhari & Muslim", narrator: "Anas ibn Malik", tags: ['general', 'fraternie'] },
    { id: 4, textAr: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", textFr: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['general', 'bon_comportement'] },
    { id: 5, textAr: "لَا تَغْضَبْ", textFr: "Ne te mets pas en colère.", source: "Bukhari", narrator: "Abu Hurayra", tags: ['general', 'bon_comportement', 'patience'] },
    { id: 6, textAr: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", textFr: "Ce bas monde est la prison du croyant et le paradis du mécréant.", source: "Muslim", narrator: "Abu Hurayra", tags: ['general', 'patience'] },
    { id: 7, textAr: "إنَّ اللَّهَ لا يَنْظُرُ إلَى أَجْسَادِكُمْ وَلا إلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إلَى قُلُوبِكُمْ", textFr: "Allah ne regarde ni vos corps ni vos apparences, mais Il regarde vos cœurs.", source: "Muslim", narrator: "Abu Hurayra", tags: ['general'] },
    { id: 8, textAr: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", textFr: "Le musulman est celui dont les musulmans sont à l'abri de sa langue et de sa main.", source: "Bukhari & Muslim", narrator: "Abdullah ibn Amr", tags: ['general', 'bon_comportement'] },
    { id: 9, textAr: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ", textFr: "Crains Allah où que tu sois, fais suivre la mauvaise action par une bonne qui l'effacera et comporte-toi bien envers les gens.", source: "Tirmidhi", narrator: "Abu Dharr", tags: ['general', 'bon_comportement', 'repentir'] },
    { id: 10, textAr: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", textFr: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", source: "Bukhari", narrator: "Uthman ibn Affan", tags: ['general', 'coran', 'science'] },

    // ─── PRIÈRE ──────────────────────────────────
    { id: 11, textAr: "الصَّلاةُ عِمَادُ الدِّينِ", textFr: "La prière est le pilier de la religion.", source: "Bayhaqi", narrator: "Umar ibn al-Khattab", tags: ['priere'] },
    { id: 12, textAr: "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلاةِ", textFr: "Ce qui sépare l'homme du polythéisme et de la mécréance, c'est l'abandon de la prière.", source: "Muslim", narrator: "Jabir ibn Abdullah", tags: ['priere'] },
    { id: 13, textAr: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ", textFr: "Le serviteur est le plus proche de son Seigneur lorsqu'il est en prosternation.", source: "Muslim", narrator: "Abu Hurayra", tags: ['priere', 'dua'] },
    { id: 14, textAr: "صَلاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً", textFr: "La prière en groupe est supérieure à la prière individuelle de vingt-sept degrés.", source: "Bukhari & Muslim", narrator: "Ibn Umar", tags: ['priere'] },
    { id: 15, textAr: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ", textFr: "Celui qui prie les deux prières fraîches (Fajr et Asr) entrera au Paradis.", source: "Bukhari & Muslim", narrator: "Abu Musa al-Ash'ari", tags: ['priere', 'paradis'] },
    { id: 16, textAr: "مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ", textFr: "Celui qui maintient 4 rak'at avant et 4 après le Dhuhr, Allah lui interdit le Feu.", source: "Tirmidhi", narrator: "Umm Habiba", tags: ['priere', 'paradis'] },
    { id: 17, textAr: "إِذَا قَامَ أَحَدُكُمْ يُصَلِّي فَإِنَّهُ يُنَاجِي رَبَّهُ", textFr: "Lorsque l'un de vous se lève pour prier, il est en conversation intime avec son Seigneur.", source: "Bukhari", narrator: "Anas ibn Malik", tags: ['priere'] },

    // ─── JEÛNE ───────────────────────────────────
    { id: 18, textAr: "كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ", textFr: "Toute action du fils d'Adam lui appartient sauf le jeûne : il est pour Moi et c'est Moi qui en donne la récompense.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['jeune', 'ramadan'] },
    { id: 19, textAr: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", textFr: "Celui qui jeûne le Ramadan avec foi et espérance de la récompense, ses péchés antérieurs lui seront pardonnés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['jeune', 'ramadan', 'repentir'] },
    { id: 20, textAr: "لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ", textFr: "Le jeûneur a deux joies : une joie au moment de rompre son jeûne et une joie lorsqu'il rencontrera son Seigneur.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['jeune', 'ramadan'] },
    { id: 21, textAr: "مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا", textFr: "Quiconque jeûne un jour dans le sentier d'Allah, Allah éloigne son visage du Feu de soixante-dix automnes.", source: "Bukhari & Muslim", narrator: "Abu Sa'id al-Khudri", tags: ['jeune'] },
    { id: 22, textAr: "صَوْمُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ", textFr: "Le jeûne du jour de Arafat expie les péchés de l'année précédente et de l'année suivante.", source: "Muslim", narrator: "Abu Qatada", tags: ['jeune', 'hajj'] },
    { id: 23, textAr: "مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ", textFr: "Celui qui ne renonce pas au mensonge et à sa pratique, Allah n'a nul besoin qu'il se prive de manger et de boire.", source: "Bukhari", narrator: "Abu Hurayra", tags: ['jeune', 'ramadan', 'bon_comportement'] },

    // ─── RAMADAN ─────────────────────────────────
    { id: 24, textAr: "إِذَا جَاءَ رَمَضَانُ فُتِحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ وَصُفِّدَتِ الشَّيَاطِينُ", textFr: "Quand arrive le Ramadan, les portes du Paradis sont ouvertes, les portes de l'Enfer sont fermées et les démons sont enchaînés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['ramadan'] },
    { id: 25, textAr: "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", textFr: "Celui qui prie la nuit pendant le Ramadan avec foi et espérance, ses péchés antérieurs lui seront pardonnés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['ramadan', 'priere'] },
    { id: 26, textAr: "مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", textFr: "Celui qui prie la Nuit du Destin avec foi et espérance, ses péchés antérieurs lui seront pardonnés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['ramadan', 'repentir'] },
    { id: 27, textAr: "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ", textFr: "Cherchez la Nuit du Destin dans les dix dernières nuits du Ramadan.", source: "Bukhari", narrator: "Aisha", tags: ['ramadan'] },
    { id: 28, textAr: "مَنْ فَطَّرَ صَائِمًا كَانَ لَهُ مِثْلُ أَجْرِهِ", textFr: "Celui qui offre le repas de rupture à un jeûneur obtient une récompense équivalente.", source: "Tirmidhi", narrator: "Zayd ibn Khalid", tags: ['ramadan', 'charite'] },
    { id: 29, textAr: "عُمْرَةٌ فِي رَمَضَانَ تَعْدِلُ حَجَّةً", textFr: "Une Omra pendant le Ramadan équivaut à un pèlerinage (Hajj).", source: "Bukhari & Muslim", narrator: "Ibn Abbas", tags: ['ramadan', 'hajj'] },

    // ─── VENDREDI ────────────────────────────────
    { id: 30, textAr: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ", textFr: "Le meilleur jour sur lequel le soleil se lève est le vendredi.", source: "Muslim", narrator: "Abu Hurayra", tags: ['vendredi'] },
    { id: 31, textAr: "إِنَّ فِي الْجُمُعَةِ لَسَاعَةً لَا يُوَافِقُهَا مُسْلِمٌ يَسْأَلُ اللَّهَ فِيهَا خَيْرًا إِلَّا أَعْطَاهُ إِيَّاهُ", textFr: "Le vendredi comporte une heure durant laquelle tout musulman qui invoque Allah obtient ce qu'il demande.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['vendredi', 'dua'] },
    { id: 32, textAr: "أَكْثِرُوا الصَّلاةَ عَلَيَّ يَوْمَ الْجُمُعَةِ", textFr: "Multipliez les prières sur moi le jour du vendredi.", source: "Abu Dawud", narrator: "Aws ibn Aws", tags: ['vendredi', 'prophete'] },
    { id: 33, textAr: "مَنِ اغْتَسَلَ يَوْمَ الْجُمُعَةِ وَمَسَّ مِنْ طِيبٍ إِنْ كَانَ عِنْدَهُ وَلَبِسَ مِنْ أَحْسَنِ ثِيَابِهِ", textFr: "Celui qui se lave le vendredi, se parfume et porte ses meilleurs vêtements (pour la prière)…", source: "Ahmad", narrator: "Abu Ayyub", tags: ['vendredi'] },

    // ─── PATIENCE ────────────────────────────────
    { id: 34, textAr: "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ لَهُ خَيْرٌ", textFr: "Comme l'affaire du croyant est étonnante ! Tout ce qui lui arrive est un bien pour lui.", source: "Muslim", narrator: "Suhayb", tags: ['patience'] },
    { id: 35, textAr: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حَزَنٍ إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ", textFr: "Aucune fatigue, maladie, souci ou tristesse n'atteint le musulman sans qu'Allah ne lui expie par cela ses péchés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['patience', 'repentir'] },
    { id: 36, textAr: "إِنَّ عِظَمَ الْجَزَاءِ مَعَ عِظَمِ الْبَلاءِ", textFr: "La grandeur de la récompense est proportionnelle à la grandeur de l'épreuve.", source: "Tirmidhi", narrator: "Anas ibn Malik", tags: ['patience'] },
    { id: 37, textAr: "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ", textFr: "Et celui qui fait preuve de patience, Allah lui donnera la patience.", source: "Bukhari", narrator: "Abu Sa'id al-Khudri", tags: ['patience'] },

    // ─── SCIENCE / CONNAISSANCE ──────────────────
    { id: 38, textAr: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", textFr: "Celui qui emprunte un chemin à la recherche du savoir, Allah lui facilite un chemin vers le Paradis.", source: "Muslim", narrator: "Abu Hurayra", tags: ['science', 'paradis'] },
    { id: 39, textAr: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", textFr: "La recherche du savoir est une obligation pour tout musulman.", source: "Ibn Majah", narrator: "Anas ibn Malik", tags: ['science'] },
    { id: 40, textAr: "بَلِّغُوا عَنِّي وَلَوْ آيَةً", textFr: "Transmettez de moi, ne serait-ce qu'un verset.", source: "Bukhari", narrator: "Abdullah ibn Amr", tags: ['science', 'coran', 'prophete'] },
    { id: 41, textAr: "فَضْلُ الْعَالِمِ عَلَى الْعَابِدِ كَفَضْلِ الْقَمَرِ عَلَى سَائِرِ الْكَوَاكِبِ", textFr: "La supériorité du savant sur le dévot est comme celle de la lune sur les autres astres.", source: "Abu Dawud & Tirmidhi", narrator: "Abu Darda", tags: ['science'] },

    // ─── CORAN ───────────────────────────────────
    { id: 42, textAr: "اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لأَصْحَابِهِ", textFr: "Lisez le Coran, car il viendra le Jour de la Résurrection intercéder pour ses compagnons.", source: "Muslim", narrator: "Abu Umama", tags: ['coran'] },
    { id: 43, textAr: "الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ مَاهِرٌ بِهِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ", textFr: "Celui qui lit le Coran avec aisance sera avec les anges nobles et obéissants.", source: "Bukhari & Muslim", narrator: "Aisha", tags: ['coran', 'paradis'] },
    { id: 44, textAr: "إِنَّ اللَّهَ يَرْفَعُ بِهَذَا الْكِتَابِ أَقْوَامًا وَيَضَعُ بِهِ آخَرِينَ", textFr: "Allah élève par ce Livre des peuples et en abaisse d'autres.", source: "Muslim", narrator: "Umar ibn al-Khattab", tags: ['coran'] },

    // ─── DHIKR ───────────────────────────────────
    { id: 45, textAr: "أَحَبُّ الْكَلامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", textFr: "Les paroles les plus aimées d'Allah sont quatre : Subhan Allah, Al-Hamdulillah, La ilaha illa Allah, Allahu Akbar.", source: "Muslim", narrator: "Samurah ibn Jundub", tags: ['dhikr'] },
    { id: 46, textAr: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", textFr: "Deux paroles légères sur la langue, lourdes dans la balance : Subhan Allahi wa bihamdihi, Subhan Allahi al-Azim.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['dhikr'] },
    { id: 47, textAr: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ", textFr: "Celui qui dit Subhan Allahi wa bihamdihi 100 fois par jour, ses péchés seront effacés.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['dhikr', 'repentir'] },
    { id: 48, textAr: "أَلا أُنَبِّئُكُمْ بِخَيْرِ أَعْمَالِكُمْ وَأَرْضَاهَا عِنْدَ مَلِيكِكُمْ؟ ذِكْرُ اللَّهِ", textFr: "Voulez-vous que je vous informe de votre meilleure action, la plus agréable auprès de votre Roi ? Le dhikr d'Allah.", source: "Tirmidhi", narrator: "Abu Darda", tags: ['dhikr'] },

    // ─── MATIN / SOIR ───────────────────────────
    { id: 49, textAr: "مَنْ قَالَ حِينَ يُصْبِحُ وَحِينَ يُمْسِي: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ مِائَةَ مَرَّةٍ لَمْ يَأْتِ أَحَدٌ يَوْمَ الْقِيَامَةِ بِأَفْضَلَ مِمَّا جَاءَ بِهِ", textFr: "Celui qui dit matin et soir Subhan Allahi wa bihamdihi 100 fois, personne ne viendra le Jour du Jugement avec mieux.", source: "Muslim", narrator: "Abu Hurayra", tags: ['matin', 'soir', 'dhikr'] },
    { id: 50, textAr: "مَنْ قَالَ بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلا فِي السَّمَاءِ ثَلاثَ مَرَّاتٍ لَمْ يُصِبْهُ بَلاءٌ", textFr: "Celui qui dit 3 fois 'Bismillahi alladhi la yadurru ma' ismihi shay'un...' ne sera touché par aucun mal.", source: "Abu Dawud & Tirmidhi", narrator: "Uthman ibn Affan", tags: ['matin', 'soir', 'dua'] },

    // ─── CHARITÉ ─────────────────────────────────
    { id: 51, textAr: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", textFr: "L'aumône éteint le péché comme l'eau éteint le feu.", source: "Tirmidhi", narrator: "Mu'adh ibn Jabal", tags: ['charite', 'repentir'] },
    { id: 52, textAr: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", textFr: "L'aumône n'a jamais diminué une richesse.", source: "Muslim", narrator: "Abu Hurayra", tags: ['charite'] },
    { id: 53, textAr: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ", textFr: "Protégez-vous du Feu, ne serait-ce qu'avec la moitié d'une datte.", source: "Bukhari & Muslim", narrator: "Adi ibn Hatim", tags: ['charite'] },
    { id: 54, textAr: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", textFr: "Tout acte de bonté est une aumône.", source: "Bukhari & Muslim", narrator: "Jabir", tags: ['charite', 'bon_comportement'] },
    { id: 55, textAr: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", textFr: "Ton sourire à ton frère est une aumône pour toi.", source: "Tirmidhi", narrator: "Abu Dharr", tags: ['charite', 'fraternie', 'bon_comportement'] },
    { id: 56, textAr: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", textFr: "La main qui donne est meilleure que la main qui reçoit.", source: "Bukhari & Muslim", narrator: "Ibn Umar", tags: ['charite'] },

    // ─── PARENTS ─────────────────────────────────
    { id: 57, textAr: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدَيْنِ وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدَيْنِ", textFr: "La satisfaction du Seigneur réside dans la satisfaction des parents, et Sa colère dans leur colère.", source: "Tirmidhi", narrator: "Abdullah ibn Amr", tags: ['parents'] },
    { id: 58, textAr: "الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", textFr: "Le Paradis se trouve sous les pieds des mères.", source: "Nasa'i", narrator: "Mu'awiya ibn Jahima", tags: ['parents', 'paradis'] },
    { id: 59, textAr: "رَغِمَ أَنْفُهُ ثُمَّ رَغِمَ أَنْفُهُ مَنْ أَدْرَكَ أَبَوَيْهِ عِنْدَ الْكِبَرِ فَلَمْ يَدْخُلِ الْجَنَّةَ", textFr: "Malheur à celui qui a trouvé ses parents âgés et n'est pas entré au Paradis (par leur service).", source: "Muslim", narrator: "Abu Hurayra", tags: ['parents', 'paradis'] },

    // ─── REPENTIR ────────────────────────────────
    { id: 60, textAr: "كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ", textFr: "Tous les fils d'Adam commettent des erreurs, et les meilleurs d'entre eux sont ceux qui se repentent.", source: "Tirmidhi", narrator: "Anas ibn Malik", tags: ['repentir'] },
    { id: 61, textAr: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ", textFr: "Allah tend Sa main la nuit pour que le pécheur du jour se repente, et le jour pour que le pécheur de la nuit se repente.", source: "Muslim", narrator: "Abu Musa", tags: ['repentir'] },
    { id: 62, textAr: "لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ وَقَدْ أَضَلَّهُ فِي أَرْضِ فَلاةٍ", textFr: "Allah est plus heureux du repentir de Son serviteur que l'un de vous qui retrouve son chameau perdu dans le désert.", source: "Bukhari & Muslim", narrator: "Anas ibn Malik", tags: ['repentir'] },
    { id: 63, textAr: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لا ذَنْبَ لَهُ", textFr: "Celui qui se repent d'un péché est comme celui qui n'a jamais péché.", source: "Ibn Majah", narrator: "Ibn Mas'ud", tags: ['repentir'] },

    // ─── DUA / INVOCATION ────────────────────────
    { id: 64, textAr: "الدُّعَاءُ هُوَ الْعِبَادَةُ", textFr: "L'invocation est l'essence même de l'adoration.", source: "Tirmidhi", narrator: "Nu'man ibn Bashir", tags: ['dua'] },
    { id: 65, textAr: "مَنْ لَمْ يَسْأَلِ اللَّهَ يَغْضَبْ عَلَيْهِ", textFr: "Celui qui n'invoque pas Allah s'attire Sa colère.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['dua'] },
    { id: 66, textAr: "دَعْوَةُ الصَّائِمِ لا تُرَدُّ", textFr: "L'invocation du jeûneur ne sera pas refusée.", source: "Bayhaqi", narrator: "Abdullah ibn Amr", tags: ['dua', 'jeune'] },
    { id: 67, textAr: "ادْعُوا اللَّهَ وَأَنْتُمْ مُوقِنُونَ بِالإِجَابَةِ", textFr: "Invoquez Allah avec la certitude d'être exaucés.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['dua'] },

    // ─── PARADIS ─────────────────────────────────
    { id: 68, textAr: "فِي الْجَنَّةِ مَا لَا عَيْنٌ رَأَتْ وَلَا أُذُنٌ سَمِعَتْ وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ", textFr: "Au Paradis, il y a ce que nul œil n'a vu, nulle oreille n'a entendu, et ce qui n'a jamais traversé le cœur d'un homme.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['paradis'] },
    { id: 69, textAr: "مَنْ سَأَلَ اللَّهَ الْجَنَّةَ ثَلاثَ مَرَّاتٍ قَالَتِ الْجَنَّةُ: اللَّهُمَّ أَدْخِلْهُ الْجَنَّةَ", textFr: "Celui qui demande le Paradis 3 fois, le Paradis dit : Ô Allah, fais-le entrer au Paradis.", source: "Tirmidhi", narrator: "Anas ibn Malik", tags: ['paradis', 'dua'] },
    { id: 70, textAr: "مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلاً", textFr: "Celui qui se rend à la mosquée matin ou soir, Allah lui prépare une demeure au Paradis.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['paradis', 'priere'] },

    // ─── MORT ────────────────────────────────────
    { id: 71, textAr: "أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ: الْمَوْتِ", textFr: "Rappelez-vous souvent le destructeur des plaisirs : la mort.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['mort'] },
    { id: 72, textAr: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ", textFr: "Sois dans ce monde comme si tu étais un étranger ou un voyageur de passage.", source: "Bukhari", narrator: "Ibn Umar", tags: ['mort', 'general'] },
    { id: 73, textAr: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلاثٍ: صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ", textFr: "Quand l'homme meurt, ses actes s'interrompent sauf trois : une aumône continue, un savoir utile, ou un enfant pieux qui invoque pour lui.", source: "Muslim", narrator: "Abu Hurayra", tags: ['mort', 'charite', 'science'] },

    // ─── HAJJ ────────────────────────────────────
    { id: 74, textAr: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ", textFr: "Celui qui fait le Hajj sans commettre d'obscénité ni de péché revient comme le jour où sa mère l'a mis au monde.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['hajj'] },
    { id: 75, textAr: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ", textFr: "Le Hajj agréé n'a d'autre récompense que le Paradis.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['hajj', 'paradis'] },
    { id: 76, textAr: "أَفْضَلُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ", textFr: "La meilleure invocation est celle du jour de Arafat.", source: "Tirmidhi", narrator: "Abdullah ibn Amr", tags: ['hajj', 'dua'] },

    // ─── MUHARRAM ────────────────────────────────
    { id: 77, textAr: "أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ", textFr: "Le meilleur jeûne après le Ramadan est celui du mois sacré de Muharram.", source: "Muslim", narrator: "Abu Hurayra", tags: ['muharram', 'jeune'] },
    { id: 78, textAr: "صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ", textFr: "Le jeûne du jour de Achoura expie les péchés de l'année précédente.", source: "Muslim", narrator: "Abu Qatada", tags: ['muharram', 'jeune', 'repentir'] },

    // ─── RAJAB ───────────────────────────────────
    { id: 79, textAr: "اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ", textFr: "Ô Allah, bénis-nous en Rajab et Sha'ban, et fais-nous parvenir au Ramadan.", source: "Ahmad", narrator: "Anas ibn Malik", tags: ['rajab', 'shaban', 'ramadan', 'dua'] },

    // ─── SHA'BAN ─────────────────────────────────
    { id: 80, textAr: "كَانَ رَسُولُ اللَّهِ يَصُومُ شَعْبَانَ كُلَّهُ", textFr: "Le Messager d'Allah jeûnait tout le mois de Sha'ban.", source: "Bukhari & Muslim", narrator: "Aisha", tags: ['shaban', 'jeune'] },
    { id: 81, textAr: "ذَلِكَ شَهْرٌ يَغْفُلُ عَنْهُ النَّاسُ بَيْنَ رَجَبٍ وَرَمَضَانَ", textFr: "C'est un mois que les gens négligent entre Rajab et Ramadan.", source: "Nasa'i", narrator: "Usama ibn Zayd", tags: ['shaban'] },

    // ─── PROPHÈTE ────────────────────────────────
    { id: 82, textAr: "إِنَّمَا بُعِثْتُ لأُتَمِّمَ مَكَارِمَ الأَخْلاقِ", textFr: "J'ai été envoyé pour parfaire les belles qualités morales.", source: "Ahmad", narrator: "Abu Hurayra", tags: ['prophete', 'bon_comportement'] },
    { id: 83, textAr: "مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا", textFr: "Celui qui prie sur moi une fois, Allah priera sur lui dix fois.", source: "Muslim", narrator: "Abu Hurayra", tags: ['prophete', 'dhikr'] },
    { id: 84, textAr: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ مِنْ وَالِدِهِ وَوَلَدِهِ وَالنَّاسِ أَجْمَعِينَ", textFr: "Aucun de vous ne sera croyant tant que je ne serai plus cher à son cœur que son père, son enfant et tous les gens.", source: "Bukhari & Muslim", narrator: "Anas ibn Malik", tags: ['prophete'] },
    { id: 85, textAr: "أَنَا أَوْلَى النَّاسِ بِعِيسَى ابْنِ مَرْيَمَ فِي الأُولَى وَالآخِرَةِ", textFr: "Je suis le plus proche des gens de Issa fils de Maryam, dans ce monde et dans l'au-delà.", source: "Bukhari", narrator: "Abu Hurayra", tags: ['prophete'] },

    // ─── BON COMPORTEMENT ────────────────────────
    { id: 86, textAr: "أَثْقَلُ شَيْءٍ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ حُسْنُ الْخُلُقِ", textFr: "La chose la plus lourde dans la balance du croyant le Jour de la Résurrection est le bon caractère.", source: "Abu Dawud & Tirmidhi", narrator: "Abu Darda", tags: ['bon_comportement'] },
    { id: 87, textAr: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", textFr: "Les croyants les plus complets en foi sont ceux qui ont le meilleur caractère.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['bon_comportement'] },
    { id: 88, textAr: "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنُكُمْ أَخْلاقًا", textFr: "Ceux que j'aime le plus et les plus proches de moi le Jour de la Résurrection sont ceux qui ont le meilleur caractère.", source: "Tirmidhi", narrator: "Jabir", tags: ['bon_comportement', 'prophete'] },
    { id: 89, textAr: "مَنْ كَظَمَ غَيْظًا وَهُوَ قَادِرٌ عَلَى أَنْ يُنْفِذَهُ دَعَاهُ اللَّهُ عَلَى رُؤُوسِ الْخَلائِقِ", textFr: "Celui qui retient sa colère alors qu'il peut l'exprimer, Allah l'appellera devant toutes les créatures (pour le récompenser).", source: "Abu Dawud & Tirmidhi", narrator: "Mu'adh ibn Anas", tags: ['bon_comportement', 'patience'] },
    { id: 90, textAr: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", textFr: "Le fort n'est pas celui qui terrasse, mais celui qui se maîtrise pendant la colère.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['bon_comportement', 'patience'] },

    // ─── FRATERNITÉ ──────────────────────────────
    { id: 91, textAr: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", textFr: "Le croyant est pour le croyant comme un édifice dont les parties se soutiennent mutuellement.", source: "Bukhari & Muslim", narrator: "Abu Musa", tags: ['fraternie'] },
    { id: 92, textAr: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ", textFr: "L'exemple des croyants dans leur amour mutuel est celui d'un seul corps.", source: "Bukhari & Muslim", narrator: "Nu'man ibn Bashir", tags: ['fraternie'] },
    { id: 93, textAr: "لا تَحَاسَدُوا وَلا تَنَاجَشُوا وَلا تَبَاغَضُوا وَلا تَدَابَرُوا", textFr: "Ne vous enviez pas, ne surenchérissez pas, ne vous détestez pas et ne vous tournez pas les dos.", source: "Muslim", narrator: "Abu Hurayra", tags: ['fraternie', 'bon_comportement'] },
    { id: 94, textAr: "لَا يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ", textFr: "N'entrera pas au Paradis celui qui a dans son cœur le poids d'un atome d'orgueil.", source: "Muslim", narrator: "Abdullah ibn Mas'ud", tags: ['bon_comportement', 'paradis'] },

    // ─── PLUS GENERAL / DUA / DHIKR ─────────────
    { id: 95, textAr: "ادْعُوا اللَّهَ وَأَنْتُمْ مُوقِنُونَ بِالإِجَابَةِ وَاعْلَمُوا أَنَّ اللَّهَ لَا يَسْتَجِيبُ دُعَاءً مِنْ قَلْبٍ غَافِلٍ لَاهٍ", textFr: "Invoquez Allah avec la certitude d'être exaucés, et sachez qu'Allah n'exauce pas une invocation venant d'un cœur distrait.", source: "Tirmidhi", narrator: "Abu Hurayra", tags: ['dua'] },
    { id: 96, textAr: "مَا مِنْ مُسْلِمٍ يَدْعُو بِدَعْوَةٍ لَيْسَ فِيهَا إِثْمٌ وَلَا قَطِيعَةُ رَحِمٍ إِلَّا أَعْطَاهُ اللَّهُ بِهَا إِحْدَى ثَلَاثٍ", textFr: "Tout musulman qui fait une invocation sans péché ni rupture de lien familial, Allah lui accorde l'une de trois choses.", source: "Ahmad", narrator: "Abu Sa'id", tags: ['dua'] },
    { id: 97, textAr: "سَيِّدُ الِاسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ", textFr: "Le maître de la demande de pardon est de dire : Ô Allah, Tu es mon Seigneur, il n'y a de divinité que Toi.", source: "Bukhari", narrator: "Shaddad ibn Aws", tags: ['dhikr', 'repentir', 'matin', 'soir'] },
    { id: 98, textAr: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ", textFr: "La hawla wa la quwwata illa billah est un trésor parmi les trésors du Paradis.", source: "Bukhari & Muslim", narrator: "Abu Musa", tags: ['dhikr', 'paradis'] },
    { id: 99, textAr: "مَنْ قَرَأَ آيَةَ الْكُرْسِيِّ فِي كُلِّ لَيْلَةِ لَمْ يَزَلْ عَلَيْهِ مِنَ اللَّهِ حَافِظٌ", textFr: "Celui qui lit Ayat al-Kursi chaque soir sera sous la protection d'Allah.", source: "Bukhari", narrator: "Abu Hurayra", tags: ['coran', 'soir', 'dhikr'] },
    { id: 100, textAr: "مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ", textFr: "Celui qui lit la sourate Al-Kahf le vendredi sera illuminé entre les deux vendredis.", source: "Nasa'i & Bayhaqi", narrator: "Abu Sa'id", tags: ['coran', 'vendredi'] },

    // ─── ADDITIONAL GENERAL ─────────────────────
    { id: 101, textAr: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", textFr: "Allah est Beau et Il aime la beauté.", source: "Muslim", narrator: "Abdullah ibn Mas'ud", tags: ['general'] },
    { id: 102, textAr: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الْأَمْرِ كُلِّهِ", textFr: "Allah est Doux et Il aime la douceur en toute chose.", source: "Bukhari & Muslim", narrator: "Aisha", tags: ['general', 'bon_comportement'] },
    { id: 103, textAr: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي", textFr: "Le meilleur d'entre vous est celui qui est le meilleur avec sa famille, et je suis le meilleur avec ma famille.", source: "Tirmidhi", narrator: "Aisha", tags: ['general', 'bon_comportement', 'parents'] },
    { id: 104, textAr: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ", textFr: "Les miséricordieux, le Tout Miséricordieux leur fera miséricorde. Faites miséricorde aux gens de la terre, Celui des cieux vous fera miséricorde.", source: "Abu Dawud & Tirmidhi", narrator: "Abdullah ibn Amr", tags: ['general', 'bon_comportement'] },
    { id: 105, textAr: "الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يُسْلِمُهُ", textFr: "Le musulman est le frère du musulman : il ne l'opprime pas et ne le livre pas.", source: "Bukhari & Muslim", narrator: "Abdullah ibn Umar", tags: ['fraternie'] },
    { id: 106, textAr: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ", textFr: "Celui qui soulage un croyant d'une peine, Allah le soulagera d'une peine au Jour de la Résurrection.", source: "Muslim", narrator: "Abu Hurayra", tags: ['fraternie', 'charite'] },
    { id: 107, textAr: "إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ", textFr: "Méfiez-vous de la suspicion, car la suspicion est le plus mensonger des discours.", source: "Bukhari & Muslim", narrator: "Abu Hurayra", tags: ['bon_comportement', 'fraternie'] },
    { id: 108, textAr: "مَنْ كَانَ فِي حَاجَةِ أَخِيهِ كَانَ اللَّهُ فِي حَاجَتِهِ", textFr: "Celui qui aide son frère dans son besoin, Allah l'aidera dans le sien.", source: "Bukhari & Muslim", narrator: "Abdullah ibn Umar", tags: ['fraternie', 'charite'] },
    { id: 109, textAr: "لا يَحِلُّ لِمُسْلِمٍ أَنْ يَهْجُرَ أَخَاهُ فَوْقَ ثَلاثِ لَيَالٍ", textFr: "Il n'est pas permis au musulman de boycotter son frère plus de trois nuits.", source: "Bukhari & Muslim", narrator: "Abu Ayyub", tags: ['fraternie', 'bon_comportement'] },
    { id: 110, textAr: "انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا", textFr: "Aide ton frère qu'il soit oppresseur ou opprimé.", source: "Bukhari", narrator: "Anas ibn Malik", tags: ['fraternie'] },
];
