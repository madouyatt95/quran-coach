export interface ThemeVerse {
    surah: number;
    ayah: number;
    textAr: string;
    textFr: string;
}

export interface QuranTheme {
    id: string;
    name: string;
    nameFr: string;
    icon: string;
    color: string;
    verses: ThemeVerse[];
}

export const QURAN_THEMES: QuranTheme[] = [
    {
        id: 'patience',
        name: 'الصبر',
        nameFr: 'Patience',
        icon: '🤲',
        color: '#4CAF50',
        verses: [
            { surah: 2, ayah: 153, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', textFr: 'Ô les croyants! Cherchez secours dans la patience et la prière.' },
            { surah: 3, ayah: 200, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا', textFr: 'Ô les croyants! Soyez endurants. Rivalisez de patience.' },
            { surah: 2, ayah: 155, textAr: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ', textFr: 'Très certainement, Nous vous éprouverons par un peu de peur, de faim...' },
            { surah: 39, ayah: 10, textAr: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ', textFr: 'Les endurants auront leur pleine récompense sans compter.' },
            { surah: 94, ayah: 5, textAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté il y a une facilité.' },
            { surah: 94, ayah: 6, textAr: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté il y a une facilité.' },
        ]
    },
    {
        id: 'mercy',
        name: 'الرحمة',
        nameFr: 'Miséricorde',
        icon: '💚',
        color: '#26C6DA',
        verses: [
            { surah: 7, ayah: 156, textAr: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ', textFr: 'Ma miséricorde embrasse toute chose.' },
            { surah: 39, ayah: 53, textAr: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', textFr: 'Ne désespérez pas de la miséricorde d\'Allah. Allah pardonne tous les péchés.' },
            { surah: 21, ayah: 107, textAr: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', textFr: 'Nous ne t\'avons envoyé qu\'en miséricorde pour l\'univers.' },
            { surah: 12, ayah: 87, textAr: 'إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ', textFr: 'Seuls les mécréants désespèrent de la miséricorde d\'Allah.' },
            { surah: 6, ayah: 54, textAr: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ', textFr: 'Votre Seigneur S\'est prescrit à Lui-même la miséricorde.' },
        ]
    },
    {
        id: 'paradise',
        name: 'الجنة',
        nameFr: 'Paradis',
        icon: '🌿',
        color: '#66BB6A',
        verses: [
            { surah: 3, ayah: 133, textAr: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ', textFr: 'Hâtez-vous vers un pardon de votre Seigneur et un Jardin large comme les cieux et la terre.' },
            { surah: 56, ayah: 27, textAr: 'وَأَصْحَابُ الْيَمِينِ مَا أَصْحَابُ الْيَمِينِ', textFr: 'Et les gens de la droite; que sont les gens de la droite ?' },
            { surah: 55, ayah: 46, textAr: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ', textFr: 'Pour celui qui aura craint la comparution devant son Seigneur, il y aura deux jardins.' },
            { surah: 76, ayah: 13, textAr: 'مُتَّكِئِينَ فِيهَا عَلَى الْأَرَائِكِ ۖ لَا يَرَوْنَ فِيهَا شَمْسًا وَلَا زَمْهَرِيرًا', textFr: 'Accoudés sur des lits, ils n\'y verront ni soleil ni froid glacial.' },
            { surah: 13, ayah: 35, textAr: 'مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ الْمُتَّقُونَ', textFr: 'Voilà la description du Paradis promis aux pieux.' },
        ]
    },
    {
        id: 'gratitude',
        name: 'الشكر',
        nameFr: 'Gratitude',
        icon: '🙏',
        color: '#FFA726',
        verses: [
            { surah: 14, ayah: 7, textAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', textFr: 'Si vous êtes reconnaissants, Je vous ajouterai.' },
            { surah: 2, ayah: 152, textAr: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', textFr: 'Souvenez-vous de Moi, Je me souviendrai de vous. Soyez reconnaissants.' },
            { surah: 31, ayah: 12, textAr: 'أَنِ اشْكُرْ لِلَّهِ ۚ وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ', textFr: 'Sois reconnaissant envers Allah. Quiconque est reconnaissant, l\'est pour lui-même.' },
            { surah: 55, ayah: 13, textAr: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', textFr: 'Lequel des bienfaits de votre Seigneur nierez-vous ?' },
        ]
    },
    {
        id: 'trust',
        name: 'التوكل',
        nameFr: 'Confiance en Allah',
        icon: '🕊️',
        color: '#42A5F5',
        verses: [
            { surah: 65, ayah: 3, textAr: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', textFr: 'Quiconque place sa confiance en Allah, Il lui suffit.' },
            { surah: 3, ayah: 159, textAr: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ', textFr: 'Lorsque tu t\'es décidé, place ta confiance en Allah.' },
            { surah: 9, ayah: 51, textAr: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا', textFr: 'Rien ne nous atteindra sauf ce qu\'Allah nous a prescrit.' },
            { surah: 8, ayah: 2, textAr: 'وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ', textFr: 'Et c\'est en leur Seigneur qu\'ils placent leur confiance.' },
        ]
    },
    {
        id: 'forgiveness',
        name: 'المغفرة',
        nameFr: 'Pardon',
        icon: '🤍',
        color: '#AB47BC',
        verses: [
            { surah: 39, ayah: 53, textAr: 'إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', textFr: 'Allah pardonne tous les péchés.' },
            { surah: 3, ayah: 135, textAr: 'وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ', textFr: 'Et ceux qui, lorsqu\'ils commettent un péché, se souviennent d\'Allah et demandent pardon.' },
            { surah: 4, ayah: 110, textAr: 'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا', textFr: 'Quiconque agit mal ou fait du tort à lui-même puis implore le pardon d\'Allah, trouvera Allah Pardonneur et Miséricordieux.' },
            { surah: 8, ayah: 33, textAr: 'وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ', textFr: 'Allah ne les châtierait pas tant qu\'ils demandent le pardon.' },
        ]
    },
    {
        id: 'knowledge',
        name: 'العلم',
        nameFr: 'Savoir',
        icon: '📖',
        color: '#5C6BC0',
        verses: [
            { surah: 96, ayah: 1, textAr: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', textFr: 'Lis, au nom de ton Seigneur qui a créé.' },
            { surah: 20, ayah: 114, textAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', textFr: 'Et dis: "Seigneur, accrois ma science."' },
            { surah: 58, ayah: 11, textAr: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', textFr: 'Allah élèvera en degrés ceux d\'entre vous qui ont cru et ceux qui ont reçu le savoir.' },
            { surah: 39, ayah: 9, textAr: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', textFr: 'Sont-ils égaux, ceux qui savent et ceux qui ne savent pas ?' },
        ]
    },
    {
        id: 'family',
        name: 'الأسرة',
        nameFr: 'Famille',
        icon: '👨‍👩‍👧‍👦',
        color: '#EC407A',
        verses: [
            { surah: 25, ayah: 74, textAr: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', textFr: 'Seigneur, fais de nos épouses et de nos descendants la joie de nos yeux.' },
            { surah: 17, ayah: 23, textAr: 'وَبِالْوَالِدَيْنِ إِحْسَانًا', textFr: 'Et une bonté envers les père et mère.' },
            { surah: 31, ayah: 14, textAr: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ', textFr: 'Nous avons fait une recommandation à l\'homme au sujet de ses parents. Sa mère l\'a porté dans la peine.' },
            { surah: 46, ayah: 15, textAr: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ', textFr: 'Seigneur, permets-moi de rendre grâce pour le bienfait que Tu m\'as accordé ainsi qu\'à mes parents.' },
        ]
    },
    {
        id: 'dua',
        name: 'الدعاء',
        nameFr: 'Invocations',
        icon: '🌙',
        color: '#d4af37',
        verses: [
            { surah: 2, ayah: 186, textAr: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ', textFr: 'Quand Mes serviteurs t\'interrogent sur Moi, Je suis tout proche. Je réponds à l\'appel de celui qui M\'invoque.' },
            { surah: 40, ayah: 60, textAr: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', textFr: 'Invoquez-Moi, Je vous répondrai.' },
            { surah: 2, ayah: 201, textAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', textFr: 'Seigneur ! Donne-nous bonne grâce en ce monde et bonne grâce dans l\'au-delà et protège-nous du feu.' },
            { surah: 3, ayah: 8, textAr: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', textFr: 'Seigneur ! Ne fais pas dévier nos cœurs après que Tu nous aies guidés.' },
        ]
    },
    {
        id: 'justice',
        name: 'العدل',
        nameFr: 'Justice',
        icon: '⚖️',
        color: '#8D6E63',
        verses: [
            { surah: 4, ayah: 135, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ', textFr: 'Ô les croyants! Observez strictement la justice.' },
            { surah: 5, ayah: 8, textAr: 'اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ', textFr: 'Soyez justes : la justice est plus proche de la piété.' },
            { surah: 16, ayah: 90, textAr: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ', textFr: 'Certes, Allah commande la justice et la bienfaisance.' },
            { surah: 49, ayah: 13, textAr: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', textFr: 'Le plus noble d\'entre vous auprès d\'Allah est le plus pieux.' },
        ]
    },
];
