import type { HadithEntry } from '../types/hadith';

const S = { B: 'Bukhari', M: 'Muslim', T: 'Tirmidhi', BM: 'Bukhari & Muslim' };

export const HADITHS_PART2: HadithEntry[] = [
    // ═══ JEÛNE & RAMADAN (Expansion) ═══
    { id: 25, ar: "كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلا الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ", fr: "Toute action du fils d'Adam lui appartient sauf le jeûne : il est pour Moi et c'est Moi qui en donne la récompense.", src: S.BM, nar: "Abu Hurayra", cat: 'jeune' },
    { id: 26, ar: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", fr: "Celui qui jeûne le Ramadan avec foi et espérance, ses péchés antérieurs lui seront pardonnés.", src: S.BM, nar: "Abu Hurayra", cat: 'jeune' },
    { id: 27, ar: "لِلصَّائِمِ فَرْحَتَانِ فَرْحَةٌ عِنْدَ فِطْرِهِ وَفَرْحَةٌ عِنْدَ لِقَاءَ رَبِّهِ", fr: "Le jeûneur a deux joies : une au moment de la rupture et une lorsqu'il rencontrera son Seigneur.", src: S.BM, nar: "Abu Hurayra", cat: 'jeune' },
    { id: 28, ar: "إِذَا جَاءَ رَمَضَانُ فُتِحَتْ أَبْوَابُ الْجَنَّةِ وَغُلِّقَتْ أَبْوَابُ النَّارِ وَصُفِّدَتِ الشَّيَاطِينُ", fr: "Quand arrive le Ramadan, les portes du Paradis sont ouvertes, les portes de l'Enfer fermées et les démons enchaînés.", src: S.BM, nar: "Abu Hurayra", cat: 'jeune' },
    { id: 32, ar: "مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا", fr: "Quiconque jeûne un jour pour Allah, Allah éloigne son visage du Feu de soixante-dix automnes.", src: S.BM, nar: "Abu Sa'id al-Khudri", cat: 'jeune' },
    { id: 33, ar: "صَوْمُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ", fr: "Le jeûne du jour de Arafat expie les péchés de l'année précédente et de l'année suivante.", src: S.M, nar: "Abu Qatada", cat: 'jeune' },
    { id: 300, ar: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً", fr: "Prenez le repas de l'aube (suhur), car il y a certes dans le suhur une bénédiction.", src: S.BM, nar: "Anas ibn Malik", cat: 'jeune' },
    { id: 301, ar: "لا يَزَالُ النَّاسُ بِخَيْرٍ مَا عَجَّلُوا الْفِطْرَ", fr: "Les gens ne cesseront d'être dans le bien tant qu'ils s'empresseront de rompre le jeûne.", src: S.BM, nar: "Sahl ibn Sa'd", cat: 'jeune' },
    { id: 302, ar: "إِذَا أَفْطَرَ أَحَدُكُمْ فَلْيُفْطِرْ عَلَى تَمْرٍ فَإِنَّهُ بَرَكَةٌ فَإِنْ لَمْ يَجِدْ فَمَاءٌ فَإِنَّهُ طَهُورٌ", fr: "Quand l'un de vous rompt le jeûne, qu'il le fasse avec des dattes, car c'est une bénédiction. S'il n'en trouve pas, alors avec de l'eau car elle est purifiante.", src: S.T, nar: "Salman ibn Amir", cat: 'jeune' },
    { id: 303, ar: "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ ... وَصَوْمِ رَمَضَانَ", fr: "L'Islam est bâti sur cinq piliers... dont le jeûne du mois de Ramadan.", src: S.BM, nar: "Ibn Umar", cat: 'jeune' },
    { id: 304, ar: "مَنْ نَسِيَ وَهُوَ صَائِمٌ فَأَكَلَ أَوْ شَرِبَ فَلْيُتِمَّ صَوْمَهُ فَإِنَّمَا أَطْعَمَهُ اللَّهُ وَسَقَاهُ", fr: "Celui qui oublie qu'il jeûne et mange ou boit, qu'il poursuive son jeûne, car c'est Allah qui l'a nourri et abreuvé.", src: S.BM, nar: "Abu Hurayra", cat: 'jeune' },
    { id: 305, ar: "فِي الْجَنَّةِ بَابٌ يُقَالُ لَهُ الرَّيَّانُ يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ", fr: "Il y a au Paradis une porte appelée 'Ar-Rayyan' par laquelle seuls les jeûneurs entreront le Jour de la Résurrection.", src: S.BM, nar: "Sahl ibn Sa'd", cat: 'jeune' },

    // ═══ CORAN (Expansion) ═══
    { id: 37, ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", fr: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.", src: S.B, nar: "Uthman ibn Affan", cat: 'coran' },
    { id: 38, ar: "اقْرَؤُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لأَصْحَابِهِ", fr: "Lisez le Coran, car il viendra le Jour de la Résurrection intercéder pour ses compagnons.", src: S.M, nar: "Abu Umama", cat: 'coran' },
    { id: 41, ar: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا", fr: "Celui qui lit une lettre du Livre d'Allah obtient une bonne action, et la bonne action est multipliée par dix.", src: S.T, nar: "Abdullah ibn Mas'ud", cat: 'coran' },
    { id: 46, ar: "بَلِّغُوا عَنِّي وَلَوْ آيَةً", fr: "Transmettez de moi, ne serait-ce qu'un verset.", src: S.B, nar: "Abdullah ibn Amr", cat: 'coran' },
    { id: 310, ar: "إِنَّ الَّذِي لَيْسَ فِي جَوْفِهِ شَيْءٌ مِنَ الْقُرْآنِ كَالْبَيْتِ الْخَرِبِ", fr: "Celui qui n'a rien du Coran dans son cœur est comme une maison en ruine.", src: S.T, nar: "Ibn Abbas", cat: 'coran' },
    { id: 311, ar: "مَنْ قَرَأَ بِمِائَةِ آيَةٍ فِي لَيْلَةٍ كُتِبَ لَهُ قُنُوتُ لَيْلَةٍ", fr: "Celui qui lit cent versets dans une nuit, il lui sera inscrit la prière de toute une nuit.", src: S.T, nar: "Tamim ad-Dari", cat: 'coran' },
    { id: 312, ar: "مَنْ قَرَأَ سُورَةَ الإِخْلاصِ عَشْرَ مَرَّاتٍ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ", fr: "Celui qui lit la sourate Al-Ikhlas dix fois, Allah lui construit une maison au Paradis.", src: S.T, nar: "Mu'adh ibn Anas", cat: 'coran' },
    { id: 313, ar: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تَقْرَؤُوا الْقُرْآنَ كَمَا عُلِّمْتُمْ", fr: "Allah vous ordonne de lire le Coran comme on vous l'a enseigné.", src: S.T, nar: "Zayd ibn Thabit", cat: 'coran' },
    { id: 314, ar: "تَعَاهَدُوا هَذَا الْقُرْآنَ فَوَالَّذِي نَفْسُ مُحَمَّدٍ بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الإِبِلِ فِي عُقُلِهَا", fr: "Révisez régulièrement le Coran, car il s'échappe plus vite que le chameau de ses entraves.", src: S.BM, nar: "Abu Musa al-Ash'ari", cat: 'coran' },

    // ═══ DHIKR & INVOCATION (Expansion) ═══
    { id: 48, ar: "أَحَبُّ الْكَلامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلا إِلَهَ إِلا اللَّهُ وَاللَّهُ أَكْبَرُ", fr: "Les paroles les plus aimées d'Allah sont : Subhan Allah, Al-Hamdulillah, La ilaha illa Allah, Allahu Akbar.", src: S.M, nar: "Samurah ibn Jundub", cat: 'dhikr' },
    { id: 49, ar: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", fr: "Deux paroles légères sur la langue, lourdes dans la balance : Subhan Allahi wa bihamdihi, Subhan Allahi al-Azim.", src: S.BM, nar: "Abu Hurayra", cat: 'dhikr' },
    { id: 50, ar: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ", fr: "Celui qui dit Subhan Allahi wa bihamdihi 100 fois par jour, ses péchés seront effacés même s'ils sont comme l'écume de la mer.", src: S.BM, nar: "Abu Hurayra", cat: 'dhikr' },
    { id: 320, ar: "مَنْ سَرَّهُ أَنْ يَسْتَجِيبَ اللَّهُ لَهُ عِنْدَ الشَّدَائِدِ وَالْكُرَبِ فَلْيُكْثِرِ الدُّعَاءَ فِي الرَّخَاءِ", fr: "Celui qui veut qu'Allah l'exauce dans les moments difficiles, qu'il multiplie les invocations dans l'aisance.", src: S.T, nar: "Abu Hurayra", cat: 'dhikr' },
    { id: 321, ar: "مَا عَلَى الأَرْضِ مُسْلِمٌ يَدْعُو اللَّهَ بِدَعْوَةٍ إِلا آتَاهُ اللَّهُ إِيَّاهَا أَوْ صَرَفَ عَنْهُ مِنَ السُّوءِ مِثْلَهَا", fr: "Tout musulman qui invoque Allah verra son vœu exaucé ou un mal équivalent être écarté de lui.", src: S.T, nar: "Ubada ibn as-Samit", cat: 'dhikr' },
    { id: 322, ar: "أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الآخِرِ", fr: "Le Seigneur est le plus proche de Son serviteur au milieu de la dernière partie de la nuit.", src: S.T, nar: "Amr ibn Abasah", cat: 'dhikr' },
    { id: 323, ar: "مَنْ لَزِمَ الاسْتِغْفَارَ جَعَلَ اللَّهَ لَهُ مِنْ كُلِّ هَمٍّ فَرَجًا وَمِنْ كُلِّ ضِيقٍ مَخْرَجًا", fr: "Celui qui s'attache à la demande de pardon (istighfar), Allah lui accorde une issue pour chaque souci.", src: S.T, nar: "Ibn Abbas", cat: 'dhikr' },

    // ═══ BON COMPORTEMENT (Expansion) ═══
    { id: 58, ar: "إِنَّمَا بُعِثْتُ لأُتَمِّمَ مَكاَرِمَ الأَخْلاقِ", fr: "J'ai été envoyé pour parfaire les nobles caractères.", src: S.T, nar: "Abu Hurayra", cat: 'comportement' },
    { id: 61, ar: "لا تَغْضَبْ", fr: "Ne te mets pas en colère.", src: S.B, nar: "Abu Hurayra", cat: 'comportement' },
    { id: 63, ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", fr: "Ton sourire à ton frère est une aumône pour toi.", src: S.T, nar: "Abu Dharr", cat: 'comportement' },
    { id: 68, ar: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", fr: "Allah est Beau et Il aime la beauté.", src: S.M, nar: "Abdullah ibn Mas'ud", cat: 'comportement' },
    { id: 330, ar: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ", fr: "Certes Allah aime que lorsque l'un de vous accomplit un travail, il le fasse avec perfection (itqan).", src: S.T, nar: "Aisha", cat: 'comportement' },
    { id: 331, ar: "خِيارُكُمْ أَحاسِنُكُمْ أَخْلاقاً", fr: "Les meilleurs d'entre vous sont ceux qui ont le meilleur caractère.", src: S.BM, nar: "Abdullah ibn Amr", cat: 'comportement' },
    { id: 332, ar: "لا يَدْخُلُ الْجَنَّةَ نَمَّامٌ", fr: "N'entrera pas au Paradis celui qui pratique la calomnie (nammaam).", src: S.BM, nar: "Hudhayfa", cat: 'comportement' },
    { id: 333, ar: "إِيَّاكُمْ وَالْحَسَدَ فَإِنَّ الْحَسَدَ يَأْكُلُ الْحَسَنَاتِ كَمَا تَأْكُلُ النَّارُ الْحَطَبَ", fr: "Méfiez-vous de l'envie, car l'envie dévore les bonnes actions comme le feu dévore le bois.", src: S.T, nar: "Abu Hurayra", cat: 'comportement' },

    // ═══ PATIENCE & ÉPREUVES (Expansion) ═══
    { id: 131, ar: "إِنَّ عِظَمَ الْجَزَاءِ مَعَ عِظَمِ الْبَلاءِ", fr: "La grandeur de la récompense est proportionnelle à la grandeur de l'épreuve.", src: S.T, nar: "Anas ibn Malik", cat: 'patience' },
    { id: 132, ar: "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ", fr: "Celui qui fait preuve de patience, Allah lui donnera la patience.", src: S.B, nar: "Abu Sa'id al-Khudri", cat: 'patience' },
    { id: 340, ar: "النَّصْرُ مَعَ الصَّبْرِ وَالْفَرَجُ مَعَ الْكَرْبِ وَإِنَّ مَعَ الْعُسْرِ يُسْرًا", fr: "La victoire vient avec la patience, l'issue avec l'affliction, et certes avec la difficulté vient la facilité.", src: S.T, nar: "Ibn Abbas", cat: 'patience' },
    { id: 341, ar: "إِذَا أَرَادَ اللَّهُ بِعَبْدِهِ الْخَيْرَ عَجَّلَ لَهُ الْعُقُوبَةَ فِي الدُّنْيَا", fr: "Quand Allah veut du bien pour Son serviteur, Il hâte son châtiment ici-bas (pour l'en purifier).", src: S.T, nar: "Anas ibn Malik", cat: 'patience' },
    { id: 342, ar: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُصِبْ مِنْهُ", fr: "Celui à qui Allah veut du bien, Il l'éprouve par des malheurs.", src: S.B, nar: "Abu Hurayra", cat: 'patience' },
];
