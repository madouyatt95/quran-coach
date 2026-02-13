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
            { surah: 2, ayah: 45, textAr: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', textFr: 'Cherchez secours dans la patience et la prière.' },
            { surah: 2, ayah: 153, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', textFr: 'Ô les croyants! Cherchez secours dans la patience et la prière.' },
            { surah: 2, ayah: 155, textAr: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ', textFr: 'Très certainement, Nous vous éprouverons par un peu de peur, de faim...' },
            { surah: 2, ayah: 156, textAr: 'الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', textFr: 'Ceux qui, lorsqu\'un malheur les atteint, disent : "Nous sommes à Allah et c\'est à Lui que nous retournons."' },
            { surah: 2, ayah: 157, textAr: 'أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ', textFr: 'Ceux-là reçoivent des bénédictions et une miséricorde de leur Seigneur.' },
            { surah: 3, ayah: 200, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا', textFr: 'Ô les croyants! Soyez endurants. Rivalisez de patience.' },
            { surah: 16, ayah: 127, textAr: 'وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ', textFr: 'Endure ! Ton endurance ne vient que d\'Allah.' },
            { surah: 39, ayah: 10, textAr: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ', textFr: 'Les endurants auront leur pleine récompense sans compter.' },
            { surah: 94, ayah: 5, textAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté il y a une facilité.' },
            { surah: 94, ayah: 6, textAr: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté il y a une facilité.' },
            { surah: 11, ayah: 115, textAr: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', textFr: 'Et sois patient, car Allah ne laisse pas perdre la récompense des bienfaisants.' },
            { surah: 103, ayah: 3, textAr: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', textFr: 'Sauf ceux qui croient, accomplissent de bonnes œuvres, s\'enjoignent mutuellement la vérité et s\'enjoignent la patience.' },
        ]
    },
    {
        id: 'mercy',
        name: 'الرحمة',
        nameFr: 'Miséricorde',
        icon: '💚',
        color: '#26C6DA',
        verses: [
            { surah: 6, ayah: 12, textAr: 'كَتَبَ عَلَىٰ نَفْسِهِ الرَّحْمَةَ', textFr: 'Il S\'est prescrit à Lui-même la miséricorde.' },
            { surah: 6, ayah: 54, textAr: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ', textFr: 'Votre Seigneur S\'est prescrit à Lui-même la miséricorde.' },
            { surah: 7, ayah: 156, textAr: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ', textFr: 'Ma miséricorde embrasse toute chose.' },
            { surah: 10, ayah: 58, textAr: 'قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا', textFr: 'Dis : "C\'est de la grâce d\'Allah et de Sa miséricorde qu\'ils devraient se réjouir."' },
            { surah: 12, ayah: 87, textAr: 'إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ', textFr: 'Seuls les mécréants désespèrent de la miséricorde d\'Allah.' },
            { surah: 15, ayah: 49, textAr: 'نَبِّئْ عِبَادِي أَنِّي أَنَا الْغَفُورُ الرَّحِيمُ', textFr: 'Informe Mes serviteurs que c\'est Moi le Pardonneur, le Miséricordieux.' },
            { surah: 21, ayah: 107, textAr: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', textFr: 'Nous ne t\'avons envoyé qu\'en miséricorde pour l\'univers.' },
            { surah: 39, ayah: 53, textAr: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', textFr: 'Ne désespérez pas de la miséricorde d\'Allah. Allah pardonne tous les péchés.' },
            { surah: 17, ayah: 24, textAr: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', textFr: 'Seigneur, fais-leur miséricorde comme ils m\'ont élevé tout petit.' },
            { surah: 36, ayah: 58, textAr: 'سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ', textFr: '"Paix !" Parole d\'un Seigneur Miséricordieux.' },
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
            { surah: 3, ayah: 185, textAr: 'فَمَن زُحْزِحَ عَنِ النَّارِ وَأُدْخِلَ الْجَنَّةَ فَقَدْ فَازَ', textFr: 'Quiconque est écarté du Feu et introduit au Paradis a certes réussi.' },
            { surah: 13, ayah: 35, textAr: 'مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ الْمُتَّقُونَ', textFr: 'Voilà la description du Paradis promis aux pieux.' },
            { surah: 29, ayah: 58, textAr: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَنُبَوِّئَنَّهُم مِّنَ الْجَنَّةِ غُرَفًا', textFr: 'Ceux qui croient et font de bonnes œuvres, Nous les installerons dans des appartements au Paradis.' },
            { surah: 55, ayah: 46, textAr: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ', textFr: 'Pour celui qui aura craint la comparution devant son Seigneur, il y aura deux jardins.' },
            { surah: 56, ayah: 27, textAr: 'وَأَصْحَابُ الْيَمِينِ مَا أَصْحَابُ الْيَمِينِ', textFr: 'Et les gens de la droite; que sont les gens de la droite ?' },
            { surah: 56, ayah: 89, textAr: 'فَرَوْحٌ وَرَيْحَانٌ وَجَنَّتُ نَعِيمٍ', textFr: 'Alors repos, parfum et Jardin de délices.' },
            { surah: 76, ayah: 13, textAr: 'مُتَّكِئِينَ فِيهَا عَلَى الْأَرَائِكِ ۖ لَا يَرَوْنَ فِيهَا شَمْسًا وَلَا زَمْهَرِيرًا', textFr: 'Accoudés sur des lits, ils n\'y verront ni soleil ni froid glacial.' },
            { surah: 76, ayah: 21, textAr: 'عَالِيَهُمْ ثِيَابُ سُندُسٍ خُضْرٌ وَإِسْتَبْرَقٌ', textFr: 'Ils porteront des vêtements de soie fine verte et de brocart.' },
            { surah: 9, ayah: 72, textAr: 'وَرِضْوَانٌ مِّنَ اللَّهِ أَكْبَرُ', textFr: 'Et l\'agrément d\'Allah est plus grand encore.' },
        ]
    },
    {
        id: 'gratitude',
        name: 'الشكر',
        nameFr: 'Gratitude',
        icon: '🙏',
        color: '#FFA726',
        verses: [
            { surah: 2, ayah: 152, textAr: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ', textFr: 'Souvenez-vous de Moi, Je me souviendrai de vous. Soyez reconnaissants.' },
            { surah: 14, ayah: 7, textAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', textFr: 'Si vous êtes reconnaissants, Je vous ajouterai.' },
            { surah: 16, ayah: 18, textAr: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا', textFr: 'Si vous comptiez les bienfaits d\'Allah, vous ne sauriez les dénombrer.' },
            { surah: 27, ayah: 40, textAr: 'هَٰذَا مِن فَضْلِ رَبِّي لِيَبْلُوَنِي أَأَشْكُرُ أَمْ أَكْفُرُ', textFr: 'C\'est de la grâce de mon Seigneur, pour me tester si je suis reconnaissant ou ingrat.' },
            { surah: 31, ayah: 12, textAr: 'أَنِ اشْكُرْ لِلَّهِ ۚ وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ', textFr: 'Sois reconnaissant envers Allah. Quiconque est reconnaissant, l\'est pour lui-même.' },
            { surah: 34, ayah: 13, textAr: 'اعْمَلُوا آلَ دَاوُودَ شُكْرًا ۚ وَقَلِيلٌ مِّنْ عِبَادِيَ الشَّكُورُ', textFr: 'Travaillez, ô famille de David, en reconnaissance! Peu de Mes serviteurs sont reconnaissants.' },
            { surah: 55, ayah: 13, textAr: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', textFr: 'Lequel des bienfaits de votre Seigneur nierez-vous ?' },
            { surah: 93, ayah: 11, textAr: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ', textFr: 'Et quant au bienfait de ton Seigneur, proclame-le.' },
        ]
    },
    {
        id: 'trust',
        name: 'التوكل',
        nameFr: 'Confiance en Allah',
        icon: '🕊️',
        color: '#42A5F5',
        verses: [
            { surah: 3, ayah: 159, textAr: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ', textFr: 'Lorsque tu t\'es décidé, place ta confiance en Allah.' },
            { surah: 3, ayah: 173, textAr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', textFr: 'Allah nous suffit ; Il est notre meilleur protecteur.' },
            { surah: 8, ayah: 2, textAr: 'وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ', textFr: 'Et c\'est en leur Seigneur qu\'ils placent leur confiance.' },
            { surah: 9, ayah: 51, textAr: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا', textFr: 'Rien ne nous atteindra sauf ce qu\'Allah nous a prescrit.' },
            { surah: 12, ayah: 67, textAr: 'إِنِ الْحُكْمُ إِلَّا لِلَّهِ ۖ عَلَيْهِ تَوَكَّلْتُ', textFr: 'Le jugement n\'appartient qu\'à Allah. En Lui je place ma confiance.' },
            { surah: 14, ayah: 12, textAr: 'وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُتَوَكِّلُونَ', textFr: 'Et c\'est en Allah que les confiants doivent placer leur confiance.' },
            { surah: 33, ayah: 3, textAr: 'وَتَوَكَّلْ عَلَى اللَّهِ ۚ وَكَفَىٰ بِاللَّهِ وَكِيلًا', textFr: 'Place ta confiance en Allah, Allah suffit comme protecteur.' },
            { surah: 65, ayah: 3, textAr: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', textFr: 'Quiconque place sa confiance en Allah, Il lui suffit.' },
            { surah: 67, ayah: 29, textAr: 'قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا', textFr: 'Dis : "C\'est le Tout Miséricordieux, nous croyons en Lui et c\'est en Lui que nous plaçons notre confiance."' },
        ]
    },
    {
        id: 'forgiveness',
        name: 'المغفرة',
        nameFr: 'Pardon',
        icon: '🤍',
        color: '#AB47BC',
        verses: [
            { surah: 3, ayah: 135, textAr: 'وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ', textFr: 'Et ceux qui, lorsqu\'ils commettent un péché, se souviennent d\'Allah et demandent pardon.' },
            { surah: 4, ayah: 110, textAr: 'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا', textFr: 'Quiconque agit mal puis implore le pardon d\'Allah, trouvera Allah Pardonneur et Miséricordieux.' },
            { surah: 8, ayah: 33, textAr: 'وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ', textFr: 'Allah ne les châtierait pas tant qu\'ils demandent le pardon.' },
            { surah: 11, ayah: 3, textAr: 'وَأَنِ اسْتَغْفِرُوا رَبَّكُمْ ثُمَّ تُوبُوا إِلَيْهِ', textFr: 'Demandez pardon à votre Seigneur puis revenez à Lui.' },
            { surah: 39, ayah: 53, textAr: 'إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا', textFr: 'Allah pardonne tous les péchés.' },
            { surah: 42, ayah: 25, textAr: 'وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ وَيَعْفُو عَنِ السَّيِّئَاتِ', textFr: 'C\'est Lui qui accepte le repentir de Ses serviteurs et pardonne les mauvaises actions.' },
            { surah: 66, ayah: 8, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا', textFr: 'Ô vous qui avez cru ! Repentez-vous à Allah d\'un repentir sincère.' },
            { surah: 71, ayah: 10, textAr: 'فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا', textFr: 'Demandez pardon à votre Seigneur, car Il est le Grand Pardonneur.' },
            { surah: 110, ayah: 3, textAr: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', textFr: 'Glorifie la louange de ton Seigneur et implore Son pardon. Il est le Grand Accueillant au repentir.' },
        ]
    },
    {
        id: 'knowledge',
        name: 'العلم',
        nameFr: 'Savoir',
        icon: '📖',
        color: '#5C6BC0',
        verses: [
            { surah: 2, ayah: 269, textAr: 'يُؤْتِي الْحِكْمَةَ مَن يَشَاءُ ۚ وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا', textFr: 'Il donne la sagesse à qui Il veut. Et quiconque reçoit la sagesse, a reçu un grand bien.' },
            { surah: 20, ayah: 114, textAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', textFr: 'Et dis: "Seigneur, accrois ma science."' },
            { surah: 35, ayah: 28, textAr: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ', textFr: 'Parmi les serviteurs d\'Allah, seuls les savants Le craignent.' },
            { surah: 39, ayah: 9, textAr: 'هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', textFr: 'Sont-ils égaux, ceux qui savent et ceux qui ne savent pas ?' },
            { surah: 58, ayah: 11, textAr: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', textFr: 'Allah élèvera en degrés ceux d\'entre vous qui ont cru et ceux qui ont reçu le savoir.' },
            { surah: 96, ayah: 1, textAr: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', textFr: 'Lis, au nom de ton Seigneur qui a créé.' },
            { surah: 96, ayah: 4, textAr: 'الَّذِي عَلَّمَ بِالْقَلَمِ', textFr: 'Celui qui a enseigné par la plume.' },
            { surah: 96, ayah: 5, textAr: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ', textFr: 'Il a enseigné à l\'homme ce qu\'il ne savait pas.' },
        ]
    },
    {
        id: 'family',
        name: 'الأسرة',
        nameFr: 'Famille',
        icon: '👨‍👩‍👧‍👦',
        color: '#EC407A',
        verses: [
            { surah: 17, ayah: 23, textAr: 'وَبِالْوَالِدَيْنِ إِحْسَانًا', textFr: 'Et une bonté envers les père et mère.' },
            { surah: 17, ayah: 24, textAr: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', textFr: 'Seigneur, fais-leur miséricorde comme ils m\'ont élevé tout petit.' },
            { surah: 25, ayah: 74, textAr: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', textFr: 'Seigneur, fais de nos épouses et de nos descendants la joie de nos yeux.' },
            { surah: 29, ayah: 8, textAr: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حُسْنًا', textFr: 'Nous avons enjoint à l\'homme la bonté envers ses parents.' },
            { surah: 31, ayah: 14, textAr: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ', textFr: 'Nous avons fait une recommandation à l\'homme au sujet de ses parents. Sa mère l\'a porté dans la peine.' },
            { surah: 31, ayah: 17, textAr: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ', textFr: 'Ô mon fils, accomplis la prière, commande le bien, interdis le mal et endure ce qui t\'arrive.' },
            { surah: 46, ayah: 15, textAr: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ', textFr: 'Seigneur, permets-moi de rendre grâce pour le bienfait accordé à moi et à mes parents.' },
            { surah: 66, ayah: 6, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا', textFr: 'Ô vous qui avez cru ! Préservez vos personnes et vos familles d\'un Feu.' },
        ]
    },
    {
        id: 'dua',
        name: 'الدعاء',
        nameFr: 'Invocations',
        icon: '🌙',
        color: '#d4af37',
        verses: [
            { surah: 1, ayah: 6, textAr: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', textFr: 'Guide-nous dans le droit chemin.' },
            { surah: 2, ayah: 127, textAr: 'رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', textFr: 'Seigneur ! Accepte de nous, Tu es l\'Audient, l\'Omniscient.' },
            { surah: 2, ayah: 186, textAr: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ', textFr: 'Quand Mes serviteurs t\'interrogent sur Moi, Je suis tout proche. Je réponds à l\'appel de celui qui M\'invoque.' },
            { surah: 2, ayah: 201, textAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', textFr: 'Seigneur ! Donne-nous bonne grâce en ce monde et dans l\'au-delà et protège-nous du feu.' },
            { surah: 3, ayah: 8, textAr: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', textFr: 'Seigneur ! Ne fais pas dévier nos cœurs après que Tu nous aies guidés.' },
            { surah: 3, ayah: 26, textAr: 'قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ', textFr: 'Dis : "Ô Allah, Maître de la royauté ! Tu donnes la royauté à qui Tu veux."' },
            { surah: 23, ayah: 118, textAr: 'رَّبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ', textFr: 'Seigneur ! Pardonne et fais miséricorde. Tu es le Meilleur des miséricordieux.' },
            { surah: 25, ayah: 65, textAr: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ', textFr: 'Seigneur, écarte de nous le châtiment de l\'Enfer.' },
            { surah: 40, ayah: 60, textAr: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', textFr: 'Invoquez-Moi, Je vous répondrai.' },
            { surah: 113, ayah: 1, textAr: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', textFr: 'Dis : "Je cherche refuge auprès du Seigneur de l\'aube naissante."' },
        ]
    },
    {
        id: 'justice',
        name: 'العدل',
        nameFr: 'Justice',
        icon: '⚖️',
        color: '#8D6E63',
        verses: [
            { surah: 4, ayah: 58, textAr: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا', textFr: 'Allah vous commande de rendre les dépôts à leurs propriétaires.' },
            { surah: 4, ayah: 135, textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ', textFr: 'Ô les croyants! Observez strictement la justice.' },
            { surah: 5, ayah: 8, textAr: 'اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ', textFr: 'Soyez justes : la justice est plus proche de la piété.' },
            { surah: 6, ayah: 152, textAr: 'وَإِذَا قُلْتُمْ فَاعْدِلُوا وَلَوْ كَانَ ذَا قُرْبَىٰ', textFr: 'Et quand vous parlez, soyez justes même s\'il s\'agit d\'un proche parent.' },
            { surah: 16, ayah: 90, textAr: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ', textFr: 'Certes, Allah commande la justice et la bienfaisance.' },
            { surah: 42, ayah: 15, textAr: 'وَأُمِرْتُ لِأَعْدِلَ بَيْنَكُمُ', textFr: 'Et il m\'a été commandé d\'être juste entre vous.' },
            { surah: 49, ayah: 13, textAr: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', textFr: 'Le plus noble d\'entre vous auprès d\'Allah est le plus pieux.' },
            { surah: 57, ayah: 25, textAr: 'لَقَدْ أَرْسَلْنَا رُسُلَنَا بِالْبَيِّنَاتِ... لِيَقُومَ النَّاسُ بِالْقِسْطِ', textFr: 'Nous avons envoyé Nos messagers avec des preuves... afin que les gens établissent la justice.' },
        ]
    },
    {
        id: 'death',
        name: 'الموت',
        nameFr: 'Mort et Au-delà',
        icon: '⏳',
        color: '#78909C',
        verses: [
            { surah: 3, ayah: 185, textAr: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ', textFr: 'Toute âme goûtera la mort.' },
            { surah: 6, ayah: 32, textAr: 'وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا لَعِبٌ وَلَهْوٌ', textFr: 'La vie d\'ici-bas n\'est que jeu et amusement.' },
            { surah: 23, ayah: 115, textAr: 'أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا', textFr: 'Pensiez-vous que Nous vous avions créés sans but ?' },
            { surah: 29, ayah: 57, textAr: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ ۖ ثُمَّ إِلَيْنَا تُرْجَعُونَ', textFr: 'Toute âme goûtera la mort. Ensuite, c\'est à Nous que vous serez ramenés.' },
            { surah: 31, ayah: 34, textAr: 'وَمَا تَدْرِي نَفْسٌ مَّاذَا تَكْسِبُ غَدًا ۖ وَمَا تَدْرِي نَفْسٌ بِأَيِّ أَرْضٍ تَمُوتُ', textFr: 'Aucune âme ne sait ce qu\'elle acquerra demain, et aucune ne sait en quelle terre elle mourra.' },
            { surah: 50, ayah: 19, textAr: 'وَجَاءَتْ سَكْرَةُ الْمَوْتِ بِالْحَقِّ', textFr: 'L\'agonie de la mort apporte la vérité.' },
            { surah: 57, ayah: 20, textAr: 'اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ', textFr: 'Sachez que la vie d\'ici-bas n\'est que jeu, amusement...' },
            { surah: 62, ayah: 8, textAr: 'قُلْ إِنَّ الْمَوْتَ الَّذِي تَفِرُّونَ مِنْهُ فَإِنَّهُ مُلَاقِيكُمْ', textFr: 'La mort que vous fuyez vous rencontrera.' },
        ]
    },
    {
        id: 'rizq',
        name: 'الرزق',
        nameFr: 'Subsistance',
        icon: '🌾',
        color: '#FF7043',
        verses: [
            { surah: 2, ayah: 212, textAr: 'وَاللَّهُ يَرْزُقُ مَن يَشَاءُ بِغَيْرِ حِسَابٍ', textFr: 'Allah donne Ses biens sans compter à qui Il veut.' },
            { surah: 11, ayah: 6, textAr: 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا', textFr: 'Il n\'est point de créature sur terre dont la subsistance n\'incombe à Allah.' },
            { surah: 17, ayah: 30, textAr: 'إِنَّ رَبَّكَ يَبْسُطُ الرِّزْقَ لِمَن يَشَاءُ وَيَقْدِرُ', textFr: 'Ton Seigneur étend la subsistance à qui Il veut et la restreint.' },
            { surah: 29, ayah: 60, textAr: 'وَكَأَيِّن مِّن دَابَّةٍ لَّا تَحْمِلُ رِزْقَهَا اللَّهُ يَرْزُقُهَا وَإِيَّاكُمْ', textFr: 'Combien de bêtes ne portent pas leur subsistance ! C\'est Allah qui les nourrit, vous aussi.' },
            { surah: 51, ayah: 58, textAr: 'إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ', textFr: 'Allah est le Grand Pourvoyeur, le Détenteur de la force et de la puissance.' },
            { surah: 62, ayah: 10, textAr: 'فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ', textFr: 'Quand la prière est achevée, dispersez-vous sur terre et recherchez la grâce d\'Allah.' },
            { surah: 65, ayah: 2, textAr: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', textFr: 'Quiconque craint Allah, Il lui donnera une issue.' },
            { surah: 65, ayah: 3, textAr: 'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', textFr: 'Et Il lui accordera sa subsistance d\'où il ne s\'y attendait pas.' },
        ]
    },
];
