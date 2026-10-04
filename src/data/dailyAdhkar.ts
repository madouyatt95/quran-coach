import { HISNUL_MUSLIM_DATA, type HisnDua } from './hisnulMuslim';

// Arabic prayers are traditional texts. References and evening variants checked
// against Hisn al-Muslim 75–98 (https://sunnah.com/hisn), 2026-10-04.
const evening: Record<number, Pick<HisnDua, 'arabic' | 'phonetic' | 'translation'>> = {
    77: {
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        phonetic: "Amsaynā wa amsā al-mulku lillāhi wal-ḥamdu lillāh. Lā ilāha illā Allāhu waḥdahu lā sharīka lah, lahu al-mulku wa lahu al-ḥamdu wa Huwa 'alā kulli shay'in qadīr. Rabbi as'aluka khayra mā fī hādhihi al-laylati wa khayra mā ba'dahā, wa a'ūdhu bika min sharri mā fī hādhihi al-laylati wa sharri mā ba'dahā. Rabbi a'ūdhu bika mina al-kasali wa sū'i al-kibar. Rabbi a'ūdhu bika min 'adhābin fī an-nāri wa 'adhābin fī al-qabr.",
        translation: "Nous voici au soir et la royauté appartient à Allah. Louange à Allah. Nulle divinité n'est digne d'adoration sauf Allah, seul et sans associé. À Lui la royauté et la louange ; Il est capable de toute chose. Seigneur, je Te demande le bien de cette nuit et de ce qui la suit, et je cherche refuge auprès de Toi contre le mal de cette nuit et de ce qui la suit. Seigneur, protège-moi de la paresse et des maux de la vieillesse, du châtiment du Feu et de celui de la tombe.",
    },
    78: {
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        phonetic: 'Allāhumma bika amsaynā wa bika aṣbaḥnā, wa bika naḥyā wa bika namūtu wa ilayka al-maṣīr.',
        translation: "Ô Allah, c'est par Toi que nous parvenons au soir et au matin. Par Toi nous vivons et nous mourons, et vers Toi est le retour.",
    },
    80: {
        arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
        phonetic: "Allāhumma innī amsaytu ush-hiduka wa ush-hidu ḥamalata 'arshika wa malā'ikataka wa jamī'a khalqika, annaka Anta Allāhu lā ilāha illā Anta waḥdaka lā sharīka laka, wa anna Muḥammadan 'abduka wa rasūluk.",
        translation: "Ô Allah, me voici au soir. Je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toutes Tes créatures, que Tu es Allah, seul, sans associé, que nulle divinité n'est digne d'adoration sauf Toi, et que Muhammad est Ton serviteur et Ton messager.",
    },
    81: {
        arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
        phonetic: "Allāhumma mā amsā bī min ni'matin aw bi-aḥadin min khalqika fa-minka waḥdaka lā sharīka laka, fa-laka al-ḥamdu wa laka ash-shukr.",
        translation: "Ô Allah, tout bienfait reçu en ce soir par moi ou par l'une de Tes créatures vient de Toi seul, sans associé. À Toi la louange et la gratitude.",
    },
    89: {
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا',
        phonetic: "Amsaynā wa amsā al-mulku lillāhi Rabbi al-'ālamīn. Allāhumma innī as'aluka khayra hādhihi al-laylati, fatḥahā wa naṣrahā wa nūrahā wa barakatahā wa hudāhā, wa a'ūdhu bika min sharri mā fīhā wa sharri mā ba'dahā.",
        translation: "Nous voici au soir et la royauté appartient à Allah, Seigneur des mondes. Ô Allah, je Te demande le bien de cette nuit : son succès, son secours, sa lumière, sa bénédiction et sa guidée. Je cherche refuge auprès de Toi contre le mal qu'elle contient et celui qui la suit.",
    },
    90: {
        arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
        phonetic: "Amsaynā 'alā fiṭrati al-islāmi wa 'alā kalimati al-ikhlāṣi wa 'alā dīni nabiyyinā Muḥammadin wa 'alā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna mina al-mushrikīn.",
        translation: "Nous voici au soir sur la disposition naturelle de l'Islam, la parole de sincérité, la religion de notre Prophète Muhammad ﷺ et la voie de notre père Ibrahim, fidèle au culte d'Allah seul, soumis à Lui et étranger à l'association.",
    },
};
const chapter = HISNUL_MUSLIM_DATA.flatMap(m => m.chapters).find(c => c.id === 'chap_27')!;
export function dailyAdhkar(period: 'morning' | 'evening'): HisnDua[] {
    return chapter.duas.filter(d => d.hisnReference && (d.period === 'both' || d.period === period))
        .map(d => period === 'evening' && evening[d.hisnReference!] ? {...d, ...evening[d.hisnReference!]} : d);
}
