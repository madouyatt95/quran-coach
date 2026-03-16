import type { HadithCategory, HadithEntry, HadithCategoryInfo, BulughChapter } from '../types/hadith';
export type { HadithCategory, HadithEntry, HadithCategoryInfo, BulughChapter };

export const HADITH_CATEGORIES: HadithCategoryInfo[] = [
    { id: 'bulugh', name: 'Boulough Al-Marâm', nameAr: 'بلوغ المرام', emoji: '⚖️', color: '#8D6E63' },
    { id: 'nawawi', name: 'Les 42 An-Nawawi', nameAr: 'الأربعون النووية', emoji: '📗', color: '#2E7D32' },
    { id: 'foi', name: 'Foi & Intention', nameAr: 'الإيمان والنية', emoji: '🕌', color: '#c9a84c' },
    { id: 'qudsi', name: 'Hadiths Qudsi', nameAr: 'الأحاديث القدسية', emoji: '✨', color: '#FFD700' },
    { id: 'priere', name: 'Prière', nameAr: 'الصلاة', emoji: '🙏', color: '#4CAF50' },
    { id: 'jeune', name: 'Jeûne & Ramadan', nameAr: 'الصيام ورمضان', emoji: '🌙', color: '#7986CB' },
    { id: 'coran', name: 'Coran', nameAr: 'القرآن الكريم', emoji: '📖', color: '#26A69A' },
    { id: 'dhikr', name: 'Dhikr & Invocation', nameAr: 'الذكر والدعاء', emoji: '📿', color: '#AB47BC' },
    { id: 'comportement', name: 'Bon Comportement', nameAr: 'حسن الخلق', emoji: '🤝', color: '#FF7043' },
    { id: 'patience', name: 'Patience & Épreuves', nameAr: 'الصبر والابتلاء', emoji: '💪', color: '#78909C' },
    { id: 'charite', name: 'Charité', nameAr: 'الصدقة', emoji: '💝', color: '#E91E63' },
    { id: 'parents', name: 'Parents & Famille', nameAr: 'الوالدان والأسرة', emoji: '👨‍👩‍👧', color: '#8D6E63' },
    { id: 'mariage', name: 'Mariage & Couple', nameAr: 'الزواج', emoji: '💍', color: '#EC407A' },
    { id: 'repentir', name: 'Repentir', nameAr: 'التوبة والاستغفار', emoji: '🔄', color: '#9C27B0' },
    { id: 'science', name: 'Science & Savoir', nameAr: 'العلم', emoji: '📚', color: '#1E88E5' },
    { id: 'commerce', name: 'Commerce & Travail', nameAr: 'التجارة والعمل', emoji: '⚖️', color: '#00897B' },
    { id: 'coeur', name: 'Cœur & Spiritualité', nameAr: 'القلب والروح', emoji: '💎', color: '#CE93D8' },
    { id: 'prophete', name: 'Le Prophète ﷺ', nameAr: 'صفات النبي ﷺ', emoji: '🌹', color: '#66BB6A' },
    { id: 'vendredi', name: 'Vendredi', nameAr: 'يوم الجمعة', emoji: '🕋', color: '#5C6BC0' },
    { id: 'mort', name: 'Mort & Funérailles', nameAr: 'الموت والجنائز', emoji: '⏳', color: '#546E7A' },
    { id: 'au_dela', name: 'Paradis & Au-delà', nameAr: 'الجنة والآخرة', emoji: '🌟', color: '#FFD54F' },
    { id: 'fraternite', name: 'Fraternité', nameAr: 'الأخوة في الإسلام', emoji: '🤲', color: '#42A5F5' },
];

const S = { B: 'Bukhari', M: 'Muslim', T: 'Tirmidhi', BM: 'Bukhari & Muslim' };

import { HADITHS_PART2 } from './hadithsPart2';
import { HADITHS_PART3 } from './hadithsPart3';
import { HADITHS_PART4 } from './hadithsPart4';
import { HADITHS_NAWAWI } from './hadithsNawawi';
import { HADITHS_BULUGH } from './hadithsBulugh';

export const EXPANDED_HADITHS: HadithEntry[] = [
    // ═══ FOI & INTENTION ═══
    { id: 1, ar: "إنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى", fr: "Les actes ne valent que par leurs intentions, et chacun n'a pour lui que ce qu'il a eu réellement l'intention de faire.", src: S.BM, nar: "Umar ibn al-Khattab", cat: 'foi' },
    { id: 2, ar: "الإِسْلامُ أَنْ تَشْهَدَ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَتُقِيمَ الصَّلاةَ وَتُؤْتِيَ الزَّكَاةَ وَتَصُومَ رَمَضَانَ وَتَحُجَّ الْبَيْتَ", fr: "L'Islam c'est témoigner qu'il n'y a de divinité qu'Allah et que Muhammad est Son messager, accomplir la prière, verser la zakat, jeûner le Ramadan et faire le pèlerinage.", src: S.BM, nar: "Umar ibn al-Khattab", cat: 'foi' },
    { id: 3, ar: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", fr: "Aucun de vous ne sera un vrai croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.", src: S.BM, nar: "Anas ibn Malik", cat: 'foi' },
    { id: 4, ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", fr: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise.", src: S.BM, nar: "Abu Hurayra", cat: 'foi' },
    { id: 5, ar: "إِنَّ اللَّهَ لا يَنْظُرُ إلَى أَجْسَادِكُمْ وَلا إلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إلَى قُلُوبِكُمْ", fr: "Allah ne regarde ni vos corps ni vos apparences, mais Il regarde vos cœurs.", src: S.M, nar: "Abu Hurayra", cat: 'foi' },
    { id: 6, ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", fr: "Le musulman est celui dont les musulmans sont à l'abri de sa langue et de sa main.", src: S.BM, nar: "Abdullah ibn Amr", cat: 'foi' },
    { id: 7, ar: "الدِّينُ النَّصِيحَةُ قُلْنَا لِمَنْ قَالَ لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ", fr: "La religion c'est le bon conseil. Nous dîmes : envers qui ? Il dit : envers Allah, Son Livre, Son Messager, les dirigeants des musulmans et leur masse.", src: S.M, nar: "Tamim ad-Dari", cat: 'foi' },
    { id: 8, ar: "ذَاقَ طَعْمَ الإِيمَانِ مَنْ رَضِيَ بِاللَّهِ رَبًّا وَبِالإِسْلامِ دِينًا وَبِمُحَمَّدٍ رَسُولاً", fr: "A goûté à la saveur de la foi celui qui agrée Allah comme Seigneur, l'Islam comme religion et Muhammad comme messager.", src: S.M, nar: "Abbas ibn Abdul-Muttalib", cat: 'foi' },
    { id: 9, ar: "الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً فَأَفْضَلُهَا قَوْلُ لا إِلَهَ إِلا اللَّهُ وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ", fr: "La foi comporte plus de soixante-dix branches. La meilleure est l'attestation qu'il n'y a de divinité qu'Allah. La moindre est d'écarter un obstacle du chemin.", src: S.BM, nar: "Abu Hurayra", cat: 'foi' },
    { id: 10, ar: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ مِنْ وَالِدِهِ وَوَلَدِهِ وَالنَّاسِ أَجْمَعِينَ", fr: "Aucun de vous ne sera croyant tant que je ne serai plus cher à son cœur que son père, son enfant et tous les gens.", src: S.BM, nar: "Anas ibn Malik", cat: 'foi' },
    { id: 11, ar: "ثَلاثٌ مَنْ كُنَّ فِيهِ وَجَدَ حَلاوَةَ الإِيمَانِ أَنْ يَكُونَ اللَّهُ وَرَسُولُهُ أَحَبَّ إِلَيْهِ مِمَّا سِوَاهُمَا", fr: "Trois choses font goûter la douceur de la foi : qu'Allah et Son Messager soient plus aimés que tout le reste.", src: S.BM, nar: "Anas ibn Malik", cat: 'foi' },
    { id: 12, ar: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", fr: "Ce bas monde est la prison du croyant et le paradis du mécréant.", src: S.M, nar: "Abu Hurayra", cat: 'foi' },
    { id: 13, ar: "مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ", fr: "Celui qui aime rencontrer Allah, Allah aime le rencontrer.", src: S.BM, nar: "Aisha", cat: 'foi' },
    { id: 14, ar: "وَالَّذِي نَفْسِي بِيَدِهِ لا تَدْخُلُوا الْجَنَّةَ حَتَّى تُؤْمِنُوا وَلا تُؤْمِنُوا حَتَّى تَحَابُّوا", fr: "Par Celui qui tient mon âme, vous n'entrerez pas au Paradis tant que vous ne croirez pas, et vous ne croirez pas tant que vous ne vous aimerez pas.", src: S.M, nar: "Abu Hurayra", cat: 'foi' },

    // ═══ HADITHS QUDSI ═══
    { id: 200, ar: "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي وَأَنَا مَعَهُ إِذَا ذَكَرَنِي فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي", fr: "Allah dit : Je suis tel que Mon serviteur Me pense. Je suis avec lui quand il Me mentionne. S'il Me mentionne en lui-même, Je le mentionne en Moi-même.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 201, ar: "يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلا تَظَالَمُوا", fr: "Allah dit : Ô Mes serviteurs, Je Me suis interdit l'injustice et Je l'ai rendue interdite entre vous, ne soyez donc pas injustes les uns envers les autres.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 202, ar: "كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلا الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ", fr: "Allah dit : Toute action du fils d'Adam lui appartient sauf le jeûne : il est pour Moi et c'est Moi qui en donne la récompense.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 203, ar: "يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلا أُبَالِي", fr: "Allah dit : Ô fils d'Adam, tant que tu M'invoques et espères en Moi, Je te pardonne quoi que tu aies fait, et cela ne Me fait rien.", src: S.T, nar: "Anas ibn Malik", cat: 'qudsi' },
    { id: 204, ar: "يَا ابْنَ آدَمَ لَوْ بَلَغَتْ ذُنُوبُكَ عَنَانَ السَّمَاءِ ثُمَّ اسْتَغْفَرْتَنِي غَفَرْتُ لَكَ", fr: "Allah dit : Ô fils d'Adam, si tes péchés atteignaient les nuages du ciel puis que tu Me demandais pardon, Je te pardonnerais.", src: S.T, nar: "Anas ibn Malik", cat: 'qudsi' },
    { id: 205, ar: "يَا ابْنَ آدَمَ لَوْ أَتَيْتَنِي بِقُرَابِ الأَرْضِ خَطَايَا ثُمَّ لَقِيتَنِي لا تُشْرِكُ بِي شَيْئًا لأَتَيْتُكَ بِقُرَابِهَا مَغْفِرَةً", fr: "Allah dit : Ô fils d'Adam, si tu venais à Moi avec la terre entière de péchés, puis que tu Me rencontres sans rien M'associer, Je viendrais à toi avec la terre entière de pardon.", src: S.T, nar: "Anas ibn Malik", cat: 'qudsi' },
    { id: 206, ar: "أَعْدَدْتُ لِعِبَادِيَ الصَّالِحِينَ مَا لا عَيْنٌ رَأَتْ وَلا أُذُنٌ سَمِعَتْ وَلا خَطَرَ عَلَى قَلْبِ بَشَرٍ", fr: "Allah dit : J'ai préparé pour Mes serviteurs pieux ce que nul œil n'a vu, nulle oreille n'a entendu et ce qui n'a jamais traversé le cœur d'un homme.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 207, ar: "مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ", fr: "Allah dit : Quiconque montre de l'hostilité à un de Mes alliés, Je lui déclare la guerre. Mon serviteur ne se rapproche de Moi par rien de plus aimé que ce que Je lui ai imposé.", src: S.B, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 208, ar: "أَنَا أَغْنَى الشُّرَكَاءِ عَنِ الشِّرْكِ مَنْ عَمِلَ عَمَلاً أَشْرَكَ فِيهِ مَعِي غَيْرِي تَرَكْتُهُ وَشِرْكَهُ", fr: "Allah dit : Je suis le plus capable de Me passer d'associé. Quiconque accomplit une action en y associant autre que Moi, Je l'abandonne, lui et son association.", src: S.M, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 209, ar: "إِذَا أَحَبَّ اللَّهُ عَبْدًا نَادَى جِبْرِيلَ إِنَّ اللَّهَ يُحِبُّ فُلانًا فَأَحِبَّهُ فَيُحِبُّهُ جِبْرِيلُ ثُمَّ يُنَادِي فِي أَهْلِ السَّمَاءِ", fr: "Allah dit à Jibril : J'aime un tel, aime-le. Jibril l'aime puis annonce aux gens du ciel : Allah aime un tel, aimez-le. Puis l'acceptation est placée sur terre.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 210, ar: "يَا عِبَادِي كُلُّكُمْ ضَالٌّ إِلا مَنْ هَدَيْتُهُ فَاسْتَهْدُونِي أَهْدِكُمْ", fr: "Allah dit : Ô Mes serviteurs, vous êtes tous égarés sauf celui que J'ai guidé. Demandez-Moi la guidée, Je vous guiderai.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 211, ar: "يَا عِبَادِي كُلُّكُمْ جَائِعٌ إِلا مَنْ أَطْعَمْتُهُ فَاسْتَطْعِمُونِي أُطْعِمْكُمْ", fr: "Allah dit : Ô Mes serviteurs, vous êtes tous affamés sauf celui que J'ai nourri. Demandez-Moi la nourriture, Je vous nourrirai.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 212, ar: "يَا عِبَادِي كُلُّكُمْ عَارٍ إِلا مَنْ كَسَوْتُهُ فَاسْتَكْسُونِي أَكْسُكُمْ", fr: "Allah dit : Ô Mes serviteurs, vous êtes tous nus sauf celui que J'ai vêtu. Demandez-Moi le vêtement, Je vous vêtirai.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 213, ar: "يَا عِبَادِي إِنَّكُمْ تُخْطِئُونَ بِاللَّيْلِ وَالنَّهَارِ وَأَنَا أَغْفِرُ الذُّنُوبَ جَمِيعًا فَاسْتَغْفِرُونِي أَغْفِرْ لَكُمْ", fr: "Allah dit : Ô Mes serviteurs, vous péchez nuit et jour, et Moi Je pardonne tous les péchés. Demandez-Moi le pardon, Je vous pardonnerai.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 214, ar: "إِنَّ رَحْمَتِي سَبَقَتْ غَضَبِي", fr: "Allah dit : Ma miséricorde a précédé Ma colère.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 215, ar: "قَسَمْتُ الصَّلاةَ بَيْنِي وَبَيْنَ عَبْدِي نِصْفَيْنِ وَلِعَبْدِي مَا سَأَلَ", fr: "Allah dit : J'ai partagé la prière entre Moi et Mon serviteur en deux moitiés, et Mon serviteur aura ce qu'il demande.", src: S.M, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 216, ar: "مَا لِعَبْدِي الْمُؤْمِنِ عِنْدِي جَزَاءٌ إِذَا قَبَضْتُ صَفِيَّهُ مِنْ أَهْلِ الدُّنْيَا ثُمَّ احْتَسَبَهُ إِلا الْجَنَّةُ", fr: "Allah dit : Mon serviteur croyant n'a pas d'autre récompense auprès de Moi, quand Je prends son bien-aimé et qu'il patiente, que le Paradis.", src: S.B, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 217, ar: "يُؤْذِينِي ابْنُ آدَمَ يَسُبُّ الدَّهْرَ وَأَنَا الدَّهْرُ أُقَلِّبُ اللَّيْلَ وَالنَّهَارَ", fr: "Allah dit : Le fils d'Adam Me blesse en insultant le temps, or Je suis le Temps, Je fais alterner la nuit et le jour.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 218, ar: "أَنْفِقْ يَا ابْنَ آدَمَ أُنْفِقْ عَلَيْكَ", fr: "Allah dit : Dépense, ô fils d'Adam, et Je dépenserai pour toi.", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 219, ar: "يَقُولُ اللَّهُ عَزَّ وَجَلَّ الْكِبْرِيَاءُ رِدَائِي وَالْعَظَمَةُ إِزَارِي فَمَنْ نَازَعَنِي وَاحِدًا مِنْهُمَا قَذَفْتُهُ فِي النَّارِ", fr: "Allah dit : L'orgueil est Mon manteau et la grandeur Mon vêtement. Quiconque Me les dispute, Je le jetterai dans le Feu.", src: S.M, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 220, ar: "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ فَيَقُولُ مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ", fr: "Allah descend chaque nuit au ciel le plus proche au dernier tiers de la nuit et dit : Qui M'invoque pour que Je l'exauce ?", src: S.BM, nar: "Abu Hurayra", cat: 'qudsi' },
    { id: 221, ar: "يَا عِبَادِي لَوْ أَنَّ أَوَّلَكُمْ وَآخِرَكُمْ وَإِنْسَكُمْ وَجِنَّكُمْ كَانُوا عَلَى أَتْقَى قَلْبِ رَجُلٍ وَاحِدٍ مَا زَادَ ذَلِكَ فِي مُلْكِي شَيْئًا", fr: "Allah dit : Si les premiers et les derniers d'entre vous avaient le cœur le plus pieux, cela n'ajouterait rien à Mon royaume.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },
    { id: 222, ar: "مَنْ جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا أَوْ أَزِيدُ وَمَنْ جَاءَ بِالسَّيِّئَةِ فَجَزَاءُ سَيِّئَةٍ بِمِثْلِهَا أَوْ أَغْفِرُ", fr: "Allah dit : Celui qui fait un bien aura dix fois plus ou davantage. Celui qui fait un mal sera rétribué par son équivalent ou Je pardonnerai.", src: S.M, nar: "Abu Dharr", cat: 'qudsi' },

    // ═══ PRIÈRE ═══
    { id: 15, ar: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ", fr: "Le serviteur est le plus proche de son Seigneur lorsqu'il est en prosternation.", src: S.M, nar: "Abu Hurayra", cat: 'priere' },
    { id: 16, ar: "صَلاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً", fr: "La prière en groupe est supérieure à la prière individuelle de vingt-sept degrés.", src: S.BM, nar: "Ibn Umar", cat: 'priere' },
    { id: 17, ar: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ", fr: "Celui qui prie les deux prières fraîches (Fajr et Asr) entrera au Paradis.", src: S.BM, nar: "Abu Musa al-Ash'ari", cat: 'priere' },
    { id: 18, ar: "إِذَا قَامَ أَحَدُكُمْ يُصَلِّي فَإِنَّهُ يُنَاجِي رَبَّهُ", fr: "Lorsque l'un de vous se lève pour prier, il est en conversation intime avec son Seigneur.", src: S.B, nar: "Anas ibn Malik", cat: 'priere' },
    { id: 19, ar: "مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ وَأَرْبَعٍ بَعْدَهَا حَرَّمَهُ اللَّهُ عَلَى النَّارِ", fr: "Celui qui maintient 4 rak'at avant et 4 après le Dhuhr, Allah lui interdit le Feu.", src: S.T, nar: "Umm Habiba", cat: 'priere' },
    { id: 20, ar: "مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بَيْتٌ فِي الْجَنَّةِ", fr: "Celui qui prie douze rak'at surérogatoires en un jour et une nuit, une maison lui sera construite au Paradis.", src: S.M, nar: "Umm Habiba", cat: 'priere' },
    { id: 21, ar: "أَفْضَلُ الصَّلاةِ بَعْدَ الْفَرِيضَةِ صَلاةُ اللَّيْلِ", fr: "La meilleure prière après la prière obligatoire est la prière de nuit.", src: S.M, nar: "Abu Hurayra", cat: 'priere' },
    { id: 22, ar: "إِنَّ فِي اللَّيْلِ لَسَاعَةً لا يُوَافِقُهَا رَجُلٌ مُسْلِمٌ يَسْأَلُ اللَّهَ خَيْرًا إِلا أَعْطَاهُ إِيَّاهُ", fr: "Il y a dans la nuit une heure où tout musulman qui demande un bien à Allah l'obtiendra.", src: S.M, nar: "Jabir", cat: 'priere' },
    { id: 23, ar: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلاةُ", fr: "La première chose sur laquelle le serviteur sera jugé le Jour de la Résurrection est la prière.", src: S.T, nar: "Abu Hurayra", cat: 'priere' },
    { id: 24, ar: "مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ خَرَجَتْ خَطَايَاهُ مِنْ جَسَدِهِ حَتَّى تَخْرُجَ مِنْ تَحْتِ أَظْفَارِهِ", fr: "Celui qui fait ses ablutions parfaitement, ses péchés sortent de son corps, même de sous ses ongles.", src: S.M, nar: "Uthman ibn Affan", cat: 'priere' },
    { id: 150, ar: "الصَّلاةُ عِمَادُ الدِّينِ", fr: "La prière est le pilier de la religion.", src: S.T, nar: "Umar ibn al-Khattab", cat: 'priere' },
    { id: 151, ar: "بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلاةِ", fr: "Ce qui sépare l'homme du polythéisme et de la mécréance, c'est l'abandon de la prière.", src: S.M, nar: "Jabir ibn Abdullah", cat: 'priere' },
    { id: 152, ar: "صَلاةُ الرَّجُلِ فِي جَمَاعَةٍ تَZِيدُ عَلَى صَلاتِهِ فِي بَيْتِهِ وَصَلاتِهِ فِي سُوقِهِ خَمْسًا وَعِشْرِينَ دَرَجَةً", fr: "La prière de l'homme en groupe surpasse sa prière chez lui et au marché de vingt-cinq degrés.", src: S.B, nar: "Abu Hurayra", cat: 'priere' },
    { id: 153, ar: "مَنْ مَشَى إِلَى صَلاةٍ مَكْتُوبَةٍ فِي جَمَاعَةٍ فَهِيَ كَحَجَّةٍ", fr: "Celui qui marche vers la prière obligatoire en groupe, c'est comme un pèlerinage.", src: S.T, nar: "Abu Umama", cat: 'priere' },

    ...HADITHS_PART2,
    ...HADITHS_PART3,
    ...HADITHS_PART4,
    ...HADITHS_NAWAWI,
    ...HADITHS_BULUGH,
];
