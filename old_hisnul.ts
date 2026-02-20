// Hisnul Muslim — La Citadelle du Musulman
// Données structurées avec traductions françaises

export interface HisnDua {
    id: number;
    arabic: string;
    translation: string;
    count: number;
    source: string;
}

export interface HisnChapter {
    id: string;
    title: string;
    titleAr: string;
    icon: string; // Lucide icon name
    color: string;
    duas: HisnDua[];
}

export interface HisnMegaCategory {
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    color: string;
    chapters: HisnChapter[];
}

export const HISNUL_MUSLIM_DATA: HisnMegaCategory[] = [
    // ═══════════════════════════════════════════
    // 1. QUOTIDIEN
    // ═══════════════════════════════════════════
    {
        id: 'daily',
        name: 'Quotidien',
        nameAr: 'الأذكار اليومية',
        emoji: '🌅',
        color: '#FFD54F',
        chapters: [
            {
                id: 'waking',
                title: 'Au Réveil',
                titleAr: 'أذكار الاستيقاظ من النوم',
                icon: 'Sunrise',
                color: '#FFD54F',
                duas: [
                    { id: 1, arabic: 'الحَمْدُ لله الذِي أحْيَانا بَعْدَ مَا أمَاتَنَا وإلَيْهِ النَشُور', translation: 'Louange à Allah qui nous a redonné la vie après nous avoir fait mourir, et c\'est vers Lui la résurrection.', count: 1, source: 'Bukhari' },
                    { id: 2, arabic: 'الحَمْدُ لله الذِي عَافَانِي في جَسَدِي ورَدَّ عَلَيَّ رُوحِي، وأَذِنَ لي بِذِكْرهِ', translation: 'Louange à Allah qui m\'a guéri dans mon corps, m\'a rendu mon âme et m\'a permis de L\'invoquer.', count: 1, source: 'Tirmidhi' },
                    { id: 3, arabic: 'لا إلَهَ إلاَّ الله وحْدَهُ لا شَرِيكَ لَهُ، لَهُ المُلْكُ ولَهُ الحَمْدُ وهُوَ على كلِّ شيءٍ قَدير، سُبْحانَ الله والحَمْدُ لله ولا إله إلا الله والله أكبر ولا حَولَ ولا قُوةَ إلا بالله العلي العظيم، اللَّهُمَّ اغْفِرْ لي', translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui le royaume, à Lui la louange. Gloire à Allah, louange à Allah, nulle divinité sauf Allah, Allah est le Plus Grand. Pas de puissance ni de force si ce n\'est par Allah. Ô Allah, pardonne-moi.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'morning',
                title: 'Adhkar du Matin',
                titleAr: 'أذكار الصباح',
                icon: 'Sun',
                color: '#FFD54F',
                duas: [
                    { id: 1, arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 1, source: 'Muslim' },
                    { id: 2, arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au matin et c\'est par Toi que nous nous retrouvons au soir, c\'est par Toi que nous vivons et c\'est par Toi que nous mourons et c\'est vers Toi la résurrection.', count: 1, source: 'Tirmidhi' },
                    { id: 3, arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', translation: 'Ô Allah, Tu es mon Seigneur, nulle divinité sauf Toi. Tu m\'as créé et je suis Ton serviteur. Je suis fidèle à Ton pacte et à Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j\'ai commis. Je reconnais Tes bienfaits envers moi et je reconnais mes péchés. Pardonne-moi car nul ne pardonne les péchés sauf Toi.', count: 1, source: 'Bukhari' },
                    { id: 4, arabic: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ', translation: 'Ô Allah, je prends à témoin, ce matin, Toi, les porteurs de Ton Trône, Tes anges et toutes Tes créatures, que Tu es Allah, nulle divinité sauf Toi, Seul sans associé, et que Muhammad est Ton serviteur et Ton messager.', count: 4, source: 'Abu Dawud' },
                    { id: 5, arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ', translation: 'Ô Allah, accorde-moi la santé dans mon corps. Ô Allah, accorde-moi la santé dans mon ouïe. Ô Allah, accorde-moi la santé dans ma vue. Nulle divinité sauf Toi.', count: 3, source: 'Abu Dawud' },
                    { id: 6, arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', translation: 'Allah me suffit. Nulle divinité sauf Lui. En Lui je place ma confiance, et Il est le Seigneur du Trône immense.', count: 7, source: 'Abu Dawud' },
                    { id: 7, arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translation: 'Au nom d\'Allah, Celui dont le nom protège de tout mal sur terre et dans le ciel. Il est l\'Audient, l\'Omniscient.', count: 3, source: 'Abu Dawud, Tirmidhi' },
                    { id: 8, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Gloire et pureté à Allah et louange à Lui.', count: 100, source: 'Muslim' },
                    { id: 9, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 10, source: 'Bukhari, Muslim' },
                    { id: 10, arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.', count: 3, source: 'Muslim' },
                    { id: 11, arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', translation: 'Ô Allah, prie et salue notre prophète Muhammad.', count: 10, source: 'Tabarani' },
                ]
            },
            {
                id: 'evening',
                title: 'Adhkar du Soir',
                titleAr: 'أذكار المساء',
                icon: 'Moon',
                color: '#7986CB',
                duas: [
                    { id: 1, arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé.', count: 1, source: 'Muslim' },
                    { id: 2, arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au soir et au matin, c\'est par Toi que nous vivons et mourons et c\'est vers Toi le retour.', count: 1, source: 'Tirmidhi' },
                    { id: 3, arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.', count: 3, source: 'Muslim' },
                    { id: 4, arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translation: 'Au nom d\'Allah, Celui dont le nom protège de tout mal sur terre et dans le ciel. Il est l\'Audient, l\'Omniscient.', count: 3, source: 'Abu Dawud, Tirmidhi' },
                    { id: 5, arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', translation: 'Ô Allah, Tu es mon Seigneur, nulle divinité sauf Toi. Tu m\'as créé et je suis Ton serviteur. Je suis fidèle à Ton pacte et à Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j\'ai commis. Pardonne-moi car nul ne pardonne les péchés sauf Toi.', count: 1, source: 'Bukhari' },
                    { id: 6, arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', translation: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion et Muhammad ﷺ comme prophète.', count: 3, source: 'Abu Dawud' },
                ]
            },
            {
                id: 'sleep',
                title: 'Avant de Dormir',
                titleAr: 'أذكار النوم',
                icon: 'BedDouble',
                color: '#5C6BC0',
                duas: [
                    { id: 1, arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translation: 'C\'est en Ton nom, ô Allah, que je meurs et que je vis.', count: 1, source: 'Bukhari' },
                    { id: 2, arabic: 'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: 'Ô Allah, Tu as créé mon âme et c\'est Toi qui la reprendra. Tu détiens sa mort et sa vie. Si Tu la maintiens en vie, protège-la, et si Tu la fais mourir, pardonne-lui. Ô Allah, je Te demande la santé.', count: 1, source: 'Muslim' },
                    { id: 3, arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'Ô Allah, préserve-moi de Ton châtiment le Jour où Tu ressusciteras Tes serviteurs.', count: 3, source: 'Abu Dawud, Tirmidhi' },
                    { id: 4, arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا، وَأَنْتَ الَّذِي تَجْمَعُ بَيْنَ الْأَرْوَاحِ', translation: 'Ô Allah, c\'est en Ton nom que je meurs et que je vis, et c\'est Toi qui rassembles les âmes.', count: 1, source: 'Muslim' },
                ]
            },
            {
                id: 'home-enter',
                title: 'Entrer à la Maison',
                titleAr: 'دعاء دخول المنزل',
                icon: 'Home',
                color: '#8D6E63',
                duas: [
                    { id: 1, arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', translation: 'Au nom d\'Allah nous entrons, au nom d\'Allah nous sortons, et en Allah notre Seigneur nous plaçons notre confiance.', count: 1, source: 'Abu Dawud' },
                ]
            },
            {
                id: 'home-exit',
                title: 'Sortir de la Maison',
                titleAr: 'دعاء الخروج من المنزل',
                icon: 'DoorOpen',
                color: '#78909C',
                duas: [
                    { id: 1, arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'Au nom d\'Allah, je place ma confiance en Allah. Il n\'y a de puissance ni de force qu\'en Allah.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                    { id: 2, arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ', translation: 'Ô Allah, je cherche refuge auprès de Toi contre l\'égarement et contre le fait d\'être égaré, contre le faux pas et le fait d\'en être victime, contre l\'injustice commise ou subie, contre l\'ignorance et le fait d\'en être victime.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
            {
                id: 'toilet',
                title: 'Entrer aux Toilettes',
                titleAr: 'دعاء دخول الخلاء',
                icon: 'DoorClosed',
                color: '#90A4AE',
                duas: [
                    { id: 1, arabic: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', translation: 'Au nom d\'Allah. Ô Allah, je cherche refuge auprès de Toi contre les démons mâles et femelles.', count: 1, source: 'Bukhari, Muslim' },
                ]
            },
            {
                id: 'garment',
                title: 'Vêtement Neuf',
                titleAr: 'دعاء لبس الثوب',
                icon: 'Shirt',
                color: '#AB47BC',
                duas: [
                    { id: 1, arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', translation: 'Louange à Allah qui m\'a vêtu de cet habit et me l\'a accordé sans effort ni force de ma part.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 2. PRIÈRE
    // ═══════════════════════════════════════════
    {
        id: 'prayer',
        name: 'Prière',
        nameAr: 'الصلاة',
        emoji: '🕌',
        color: '#4CAF50',
        chapters: [
            {
                id: 'afterPrayer',
                title: 'Après la Prière',
                titleAr: 'أذكار بعد الصلاة',
                icon: 'BookOpen',
                color: '#4CAF50',
                duas: [
                    { id: 1, arabic: 'أَسْتَغْفِرُ اللَّهَ', translation: 'Je demande pardon à Allah.', count: 3, source: 'Muslim' },
                    { id: 2, arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', translation: 'Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Plein de Majesté et de Noblesse.', count: 1, source: 'Muslim' },
                    { id: 3, arabic: 'سُبْحَانَ اللَّهِ', translation: 'Gloire à Allah.', count: 33, source: 'Muslim' },
                    { id: 4, arabic: 'الْحَمْدُ لِلَّهِ', translation: 'Louange à Allah.', count: 33, source: 'Muslim' },
                    { id: 5, arabic: 'اللَّهُ أَكْبَرُ', translation: 'Allah est le Plus Grand.', count: 33, source: 'Muslim' },
                    { id: 6, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 1, source: 'Muslim' },
                ]
            },
            {
                id: 'adhan',
                title: 'Répondre à l\'Adhan',
                titleAr: 'الذكر عند سماع الأذان',
                icon: 'Volume2',
                color: '#66BB6A',
                duas: [
                    { id: 1, arabic: 'يقول مثل ما يقول المؤذن إلا في حي على الصلاة وحي على الفلاح فيقول: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'On répète ce que dit le muezzin, sauf pour « Venez à la prière » et « Venez au succès » où l\'on dit : Il n\'y a de puissance ni de force qu\'en Allah.', count: 1, source: 'Bukhari, Muslim' },
                    { id: 2, arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ', translation: 'Ô Allah, Seigneur de cet appel parfait et de cette prière qui va s\'accomplir, accorde à Muhammad la place éminente et la grâce, et élève-le au rang louable que Tu lui as promis.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'mosque-enter',
                title: 'Entrer à la Mosquée',
                titleAr: 'دعاء دخول المسجد',
                icon: 'Building',
                color: '#43A047',
                duas: [
                    { id: 1, arabic: 'أَعُوذُ بِاللَّهِ الْعَظِيمِ وَبِوَجْهِهِ الْكَرِيمِ وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', translation: 'Je cherche refuge auprès d\'Allah le Tout-Puissant, par Son Noble Visage et Son autorité éternelle, contre Satan le maudit. Au nom d\'Allah, prière et paix sur le Messager d\'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde.', count: 1, source: 'Abu Dawud' },
                ]
            },
            {
                id: 'mosque-exit',
                title: 'Sortir de la Mosquée',
                titleAr: 'دعاء الخروج من المسجد',
                icon: 'Building',
                color: '#2E7D32',
                duas: [
                    { id: 1, arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ', translation: 'Au nom d\'Allah, prière et paix sur le Messager d\'Allah. Ô Allah, je Te demande de Ta grâce. Ô Allah, protège-moi de Satan le maudit.', count: 1, source: 'Muslim' },
                ]
            },
            {
                id: 'witr',
                title: 'Après le Witr',
                titleAr: 'الذكر عقب السلام من الوتر',
                icon: 'Star',
                color: '#1B5E20',
                duas: [
                    { id: 1, arabic: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ', translation: 'Gloire au Roi, le Saint.', count: 3, source: 'Nasai' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 3. PROTECTION
    // ═══════════════════════════════════════════
    {
        id: 'protection',
        name: 'Protection',
        nameAr: 'الحماية والرقية',
        emoji: '🛡️',
        color: '#FF7043',
        chapters: [
            {
                id: 'ruqyah',
                title: 'Protection (Ruqyah)',
                titleAr: 'أذكار الحماية',
                icon: 'Shield',
                color: '#FF7043',
                duas: [
                    { id: 1, arabic: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', translation: 'Ayat Al-Kursi — Allah, nulle divinité sauf Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent.', count: 1, source: 'Bukhari' },
                    { id: 2, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Sourate Al-Ikhlas — Dis : Il est Allah, Unique.', count: 3, source: 'Abu Dawud' },
                    { id: 3, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Sourate Al-Falaq — Dis : Je cherche refuge auprès du Seigneur de l\'aube.', count: 3, source: 'Abu Dawud' },
                    { id: 4, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Sourate An-Nas — Dis : Je cherche refuge auprès du Seigneur des hommes.', count: 3, source: 'Abu Dawud' },
                ]
            },
            {
                id: 'evil-eye',
                title: 'Contre le Mauvais Œil',
                titleAr: 'دعاء العين',
                icon: 'Eye',
                color: '#E64A19',
                duas: [
                    { id: 1, arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ', translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre tout démon, tout animal nuisible et contre tout mauvais œil.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'anger',
                title: 'En cas de Colère',
                titleAr: 'دعاء الغضب',
                icon: 'Flame',
                color: '#D32F2F',
                duas: [
                    { id: 1, arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', translation: 'Je cherche refuge auprès d\'Allah contre Satan le maudit.', count: 1, source: 'Bukhari, Muslim' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 4. REPAS & SOCIAL
    // ═══════════════════════════════════════════
    {
        id: 'meals',
        name: 'Repas & Social',
        nameAr: 'الطعام والمعاشرة',
        emoji: '🍽️',
        color: '#26C6DA',
        chapters: [
            {
                id: 'before-meal',
                title: 'Avant le Repas',
                titleAr: 'دعاء الطعام',
                icon: 'UtensilsCrossed',
                color: '#00ACC1',
                duas: [
                    { id: 1, arabic: 'بِسْمِ اللَّهِ', translation: 'Au nom d\'Allah.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                    { id: 2, arabic: 'إذا نسي أن يذكر الله في أوله فليقل: بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translation: 'Si on oublie de dire Bismillah au début : Au nom d\'Allah au début et à la fin.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
            {
                id: 'after-meal',
                title: 'Après le Repas',
                titleAr: 'الدعاء عند الفراغ من الطعام',
                icon: 'Coffee',
                color: '#0097A7',
                duas: [
                    { id: 1, arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', translation: 'Louange à Allah qui m\'a nourri de cela et me l\'a accordé sans effort ni force de ma part.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
            {
                id: 'sneezing',
                title: 'Éternuement',
                titleAr: 'دعاء العطاس',
                icon: 'Wind',
                color: '#4DD0E1',
                duas: [
                    { id: 1, arabic: 'الْحَمْدُ لِلَّهِ (يقول له أخوه: يَرْحَمُكَ اللَّهُ، فيجيب: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ)', translation: 'Celui qui éternue dit : Louange à Allah. On lui répond : Qu\'Allah te fasse miséricorde. Il répond : Qu\'Allah vous guide et améliore votre condition.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'marriage',
                title: 'Félicitations de Mariage',
                titleAr: 'الدعاء للمتزوج',
                icon: 'Heart',
                color: '#E91E63',
                duas: [
                    { id: 1, arabic: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ', translation: 'Qu\'Allah te bénisse, répande sur toi Ses bénédictions et vous unisse dans le bien.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
            {
                id: 'visiting-sick',
                title: 'Visite du Malade',
                titleAr: 'دعاء عيادة المريض',
                icon: 'Stethoscope',
                color: '#EF5350',
                duas: [
                    { id: 1, arabic: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ', translation: 'Pas de mal, c\'est une purification si Allah le veut.', count: 1, source: 'Bukhari' },
                    { id: 2, arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'Je demande à Allah le Tout-Puissant, Seigneur du Trône immense, de te guérir.', count: 7, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 5. VOYAGE
    // ═══════════════════════════════════════════
    {
        id: 'travel',
        name: 'Voyage',
        nameAr: 'السفر',
        emoji: '✈️',
        color: '#42A5F5',
        chapters: [
            {
                id: 'travel-dua',
                title: 'En Voyage',
                titleAr: 'أذكار السفر',
                icon: 'Plane',
                color: '#42A5F5',
                duas: [
                    { id: 1, arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ', translation: 'Allah est le Plus Grand (3x). Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer. Et c\'est vers notre Seigneur que nous retournerons.', count: 1, source: 'Muslim' },
                    { id: 2, arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ', translation: 'Ô Allah, nous Te demandons dans ce voyage la bonté et la piété, ainsi que les actions qui Te plaisent.', count: 1, source: 'Muslim' },
                ]
            },
            {
                id: 'rain',
                title: 'Pluie',
                titleAr: 'دعاء المطر',
                icon: 'CloudRain',
                color: '#1E88E5',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا', translation: 'Ô Allah, fais-en une pluie bénéfique.', count: 1, source: 'Bukhari' },
                    { id: 2, arabic: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ', translation: 'Nous avons reçu la pluie par la grâce d\'Allah et Sa miséricorde.', count: 1, source: 'Bukhari, Muslim' },
                ]
            },
            {
                id: 'wind',
                title: 'Vent et Orage',
                titleAr: 'دعاء الريح',
                icon: 'Wind',
                color: '#1565C0',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ', translation: 'Ô Allah, je Te demande le bien de ce vent, le bien qu\'il contient et le bien avec lequel il a été envoyé. Et je cherche refuge auprès de Toi contre son mal, le mal qu\'il contient et le mal avec lequel il a été envoyé.', count: 1, source: 'Muslim' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 6. DHIKR & DOUA
    // ═══════════════════════════════════════════
    {
        id: 'dhikr',
        name: 'Dhikr & Doua',
        nameAr: 'الذكر والدعاء',
        emoji: '📿',
        color: '#AB47BC',
        chapters: [
            {
                id: 'istikharah',
                title: 'Istikharah',
                titleAr: 'دعاء الاستخارة',
                icon: 'Compass',
                color: '#AB47BC',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ', translation: 'Ô Allah, je Te demande de m\'indiquer ce qui est bien par Ta science, de me donner les moyens par Ta puissance et de m\'accorder de Ta grâce immense. Tu es certes capable et je ne le suis pas, Tu sais et je ne sais pas, et c\'est Toi le Grand Connaisseur des choses invisibles.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'repentance',
                title: 'Repentir (Istighfar)',
                titleAr: 'الاستغفار والتوبة',
                icon: 'RotateCcw',
                color: '#9C27B0',
                duas: [
                    { id: 1, arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', translation: 'Je demande pardon à Allah et je me repens à Lui.', count: 100, source: 'Bukhari, Muslim' },
                    { id: 2, arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', translation: 'Seigneur, pardonne-moi et accepte mon repentir, Tu es certes le Repentant, le Miséricordieux.', count: 1, source: 'Abu Dawud, Tirmidhi' },
                ]
            },
            {
                id: 'general-dhikr',
                title: 'Dhikr Général',
                titleAr: 'من أنواع الخير',
                icon: 'Sparkles',
                color: '#7B1FA2',
                duas: [
                    { id: 1, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', translation: 'Nulle divinité sauf Allah.', count: 100, source: 'Tirmidhi' },
                    { id: 2, arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', translation: 'Gloire à Allah, louange à Allah, nulle divinité sauf Allah, Allah est le Plus Grand.', count: 1, source: 'Muslim' },
                    { id: 3, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', translation: 'Gloire et pureté à Allah et louange à Lui. Gloire à Allah le Tout-Puissant.', count: 1, source: 'Bukhari, Muslim' },
                    { id: 4, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'Il n\'y a de puissance ni de force qu\'en Allah.', count: 1, source: 'Bukhari, Muslim' },
                ]
            },
        ]
    },

    // ═══════════════════════════════════════════
    // 7. ÉPREUVES
    // ═══════════════════════════════════════════
    {
        id: 'trials',
        name: 'Épreuves',
        nameAr: 'الابتلاءات',
        emoji: '🤲',
        color: '#78909C',
        chapters: [
            {
                id: 'anxiety',
                title: 'Angoisse et Tristesse',
                titleAr: 'دعاء الهم والحزن',
                icon: 'HeartCrack',
                color: '#78909C',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي وَجَلَاءَ حُزْنِي وَذَهَابَ هَمِّي', translation: 'Ô Allah, je suis Ton serviteur, fils de Ton serviteur, fils de Ta servante. Mon sort est entre Tes mains. Ton jugement s\'applique sur moi, Ton décret me concernant est juste. Je Te demande par chaque nom qui T\'appartient, par lequel Tu T\'es nommé, que Tu as révélé dans Ton Livre, ou enseigné à l\'une de Tes créatures, ou que Tu as gardé dans Ta science de l\'invisible, de faire du Coran le printemps de mon cœur, la lumière de ma poitrine, le remède de ma tristesse et la dissipation de mon angoisse.', count: 1, source: 'Ahmad' },
                    { id: 2, arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', translation: 'Ô Allah, je cherche refuge auprès de Toi contre l\'angoisse et la tristesse, contre l\'impuissance et la paresse, contre l\'avarice et la lâcheté, contre le poids des dettes et la domination des hommes.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'distress',
                title: 'Détresse (Kourb)',
                titleAr: 'دعاء الكرب',
                icon: 'AlertCircle',
                color: '#546E7A',
                duas: [
                    { id: 1, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ', translation: 'Nulle divinité sauf Allah, le Tout-Puissant, le Longanime. Nulle divinité sauf Allah, Seigneur du Trône immense. Nulle divinité sauf Allah, Seigneur des cieux, de la terre et du Trône généreux.', count: 1, source: 'Bukhari, Muslim' },
                    { id: 2, arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', translation: 'Nulle divinité sauf Toi, gloire à Toi, j\'ai été parmi les injustes.', count: 1, source: 'Tirmidhi' },
                ]
            },
            {
                id: 'difficulty',
                title: 'Difficulté',
                titleAr: 'ما يقول عند الكرب',
                icon: 'Mountain',
                color: '#455A64',
                duas: [
                    { id: 1, arabic: 'اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا', translation: 'Allah, Allah est mon Seigneur, je ne Lui associe rien.', count: 1, source: 'Abu Dawud' },
                    { id: 2, arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا', translation: 'Certes, nous appartenons à Allah et c\'est vers Lui que nous retournerons. Ô Allah, récompense-moi dans mon malheur et remplace-le par quelque chose de meilleur.', count: 1, source: 'Muslim' },
                ]
            },
            {
                id: 'enemy',
                title: 'Face à l\'Adversité',
                titleAr: 'دعاء لقاء العدو',
                icon: 'ShieldAlert',
                color: '#37474F',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ', translation: 'Ô Allah, nous Te plaçons face à eux et nous cherchons refuge auprès de Toi contre leur mal.', count: 1, source: 'Abu Dawud' },
                    { id: 2, arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', translation: 'Allah nous suffit, quel excellent Protecteur.', count: 1, source: 'Bukhari' },
                ]
            },
            {
                id: 'debt',
                title: 'Contre la Dette',
                titleAr: 'دعاء الدين',
                icon: 'Wallet',
                color: '#607D8B',
                duas: [
                    { id: 1, arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', translation: 'Ô Allah, accorde-moi ce qui est licite et épargne-moi ce qui est illicite. Par Ta grâce, rends-moi indépendant de tout autre que Toi.', count: 1, source: 'Tirmidhi' },
                ]
            },
        ]
    },
];
