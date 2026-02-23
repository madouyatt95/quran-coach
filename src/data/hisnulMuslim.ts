export interface HisnDua {
    id: number;
    arabic: string;
    phonetic?: string;
    translation: string;
    count: number;
    source: string;
}

export interface HisnChapter {
    id: string;
    title: string;
    titleAr: string;
    icon: string;
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
    {
        "id": "daily",
        "name": "Quotidien",
        "nameAr": "الأذكار اليومية",
        "emoji": "🌅",
        "color": "#FFD54F",
        "chapters": [
            {
                "id": "chap_1",
                "title": "Au réveil",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 14,
                        "arabic": "«الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ».",
                        "phonetic": "Al-ḥamdu lillāhi al-ladhī aḥyānā ba'da mā amātanā wa ilayhi an-nushūr.",
                        "translation": "Louange à Allah qui nous a rendu la vie après nous avoir fait mourir (sommeil), et c'est vers Lui que se fera le retour.",
                        "count": 1,
                        "source": "البخاري مع الفتح 11/113، مسلم 4/2083"
                    },
                    {
                        "id": 15,
                        "arabic": "«الْحَمْدُ للهِ الَّذِي عَافَانِي فِي جَسَدِي وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ».",
                        "phonetic": "Al-ḥamdu lillāhi al-ladhī 'āfānī fī jasadī, wa radda 'alayya rūḥī, wa adhina lī bi-dhikrihi.",
                        "translation": "Louange à Allah qui a préservé mon corps, m'a rendu mon âme et m'a permis de Le mentionner.",
                        "count": 1,
                        "source": "الترمذي 5/ 473"
                    },
                    {
                        "id": 16,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ، اللَّهُمَّ اغْفِرْ لِي».",
                        "phonetic": "Lā ilāha illā Allāhu waḥdahu lā sharīka lahu, lahu al-mulku wa lahu al-ḥamdu wa huwa 'alā kulli shay'in qadīr. Subḥāna Allāhi, wal-ḥamdu lillāhi, wa lā ilāha illā Allāhu, wa Allāhu akbar, wa lā ḥawla wa lā quwwata illā billāhi al-'Aliyyi al-'Aẓīm. Allāhumma ghfir lī.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, Seul sans associé. À Lui la royauté et la louange, et Il est Omnipotent. Gloire à Allah, louange à Allah, il n'y a de divinité qu'Allah, Allah est le Plus Grand, et il n'y a de force ni de puissance que par Allah le Très-Haut. Ô Allah, pardonne-moi.",
                        "count": 1,
                        "source": "البخاري مع الفتح 11/ 113"
                    },
                    {
                        "id": 17,
                        "arabic": "«إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِأُولِي الْأَلْبَابِ * الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ * رَبَّنَا إِنَّكَ مَنْ تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ ۖ وَمَا لِلظَّالِمِينَ مِنْ أَنْصَارٍ * رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ * رَبَّنَا وَآتِنَا مَا وَعَدْتَنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ ۗ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ * فَاسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّي لَا أُضِيعُ عَمَلَ عَامِلٍ مِنْكُمْ مِنْ ذَكَرٍ أَوْ أُنْثَىٰ ۖ بَعْضُكُمْ مِنْ بَعْضٍ ۖ فَالَّذِينَ هَاجَرُوا وَأُخْرِجُوا مِنْ دِيَارِهِمْ وَأُوذُوا فِي سَبِيلِي وَقَاتَلُوا وَقُتِلُوا لَأُكَفِّرَنَّ عَنْهُمْ سَيِّئَاتِهِمْ وَلأُدْخِلَنَّهُمْ جَنَّاتٍ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ ثَوَابًا مِنْ عِنْدِ اللَّهِ ۗ وَاللَّهُ عِنْدَهُ حُسْنُ الثَّوَابِ * لَا يَغُرَّنَّكَ تَقَلُّبُ الَّذِينَ كَفَرُوا فِي الْبِلَادِ * مَتَاعٌ قَلِيلٌ ثُمَّ مَأْوَاهُمْ جَهَنَّمُ ۚ وَبِئْسَ الْمِهَادُ * لَٰكِنِ الَّذِينَ اتَّقَوْا رَبَّهُمْ لَهُمْ جَنَّاتٌ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ خَالِدِينَ فِيهَا نُزُلًا مِنْ عِنْدِ اللَّهِ ۗ وَمَا عِنْدَ اللَّهِ خَيْرٌ لِلْأَبْرَارِ * وَإِنَّ مِنْ أَهْلِ الْكِتَابِ لَمَنْ يُؤْمِنُ بِاللَّهِ وَمَا أُنْزِلَ إِلَيْكُمْ وَمَا أُنْزِلَ إِلَيْهِمْ خَاشِعِينَ لِلَّهِ لَا يَشْتَرُونَ بِآيَاتِ اللَّهِ ثَمَنًا قَلِيلًا ۗ أُولَٰئِكَ لَهُمْ أَجْرُهُمْ عِنْدَ رَبِّهِمْ ۗ إِنَّ اللَّهَ سَرِيعُ الْحِسَابِ * يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ».",
                        "phonetic": "Inna fī khalqi as-samāwāti wal-arḍi wa-khtilāfi al-layli wan-nahāri la-āyātin li-ulī al-albāb. Al-ladhīna yadhkurūna Allāha qiyāman wa-qu'ūdan wa-'alā junūbihim wa-yatafakkurūna fī khalqi as-samāwāti wal-arḍi rabbanā mā khalaqta hādhā bāṭilan subḥānaka fa-qinā 'adhāba an-nār. Rabbanā innaka man tudkhili an-nāra faqad akhzaytahu wa-mā liẓ-ẓālimīna min anṣār. Rabbanā innanā sami'nā munādiyan yunādī lil-īmāni an āminū bi-rabbikum fa-āmannā rabbanā fa-ghfir lanā dhunūbanā wa-kaffir 'annā sayyi'ātinā wa-tawaffanā ma'al-abrār. Rabbanā wa-ātinā mā wa'adtanā 'alā rusulika walā tukhzinā yawma al-qiyāmati innaka lā tukhlifu al-mī'ād. Fa-stajāba lahum rabbuhum annī lā uḍī'u 'amala 'āmilin minkum min dhakarin aw unthā ba'ḍukum min ba'ḍ. Fal-ladhīna hājarū wa-ukhrijū min diyārihim wa-ūdhū fī sabīlī wa-qātalū wa-qutilū la-ukaffiranna 'anhum sayyi'ātihim wa-la-udkhilannahum jannātin tajrī min taḥtihā al-anhāru thawāban min 'indi Allāhi wal-lāhu 'indahu ḥusnu ath-thawāb. Lā yaghurrannaka taqallubu al-ladhīna kafarū fī al-bilād. Matā'un qalīlun thumma ma'wāhum jahannamu wa-bi'sa al-mihād. Lākinil-ladhīna ittaqaw rabbahum lahum jannātun tajrī min taḥtihā al-anhāru khālidīna fīhā nuzulan min 'indi Allāhi wa-mā 'inda Allāhi khayrun lil-abrār. Wa-inna min ahli al-kitābi laman yu'minu billāhi wa-mā unzila ilaykum wa-mā unzila ilayhim khāshi'īna lillāhi lā yashtarūna bi-āyāti Allāhi thamanan qalīlan ulā'ika lahum ajruhum 'inda rabbihim inna Allāha sarī'u al-ḥisāb. Yā ayyuhā al-ladhīna āmanū iṣbirū wa-ṣābirū wa-rābiṭū wa-ttaqū Allāha la'allakum tufliḥūn.",
                        "translation": "« En vérité, dans la création des cieux et de la terre, et dans l'alternance de la nuit et du jour, il y a certes des signes pour les doués d'intelligence, qui, debout, assis, couchés sur leurs côtés, invoquent Allah et méditent sur la création des cieux et de la terre : \"Notre Seigneur ! Tu n'as pas créé cela en vain. Gloire à Toi ! Garde-nous du châtiment du Feu. Seigneur, quiconque Tu fais entrer dans le Feu, Tu le couvres d'ignominie. Et pour les injustes, il n'y a pas de secoureurs ! Seigneur, nous avons entendu un crieur appeler à la foi : 'Croyez en votre Seigneur !' et nous avons cru. Seigneur, pardonne-nous nos péchés, efface nos méfaits, et fais-nous mourir avec les gens de bien. Seigneur, donne-nous ce que Tu nous as promis par Tes messagers ; et ne nous couvre pas d'ignominie au Jour de la Résurrection. Car Toi, Tu ne manques jamais à Ta promesse\". Leur Seigneur les a alors exaucés : \"En vérité, Je ne laisse pas perdre l'œuvre de celui qui agit parmi vous, qu'il soit homme ou femme, car vous êtes les uns des autres. Ceux donc qui ont émigré, qui ont été expulsés de leurs demeures, qui ont été persécutés dans Mon chemin, qui ont combattu et ont été tués, Je leur effacerai certainement leurs méfaits, et Je les ferai entrer dans des Jardins sous lesquels coulent les ruisseaux, comme récompense de la part d'Allah.\" Quant à Allah, c'est auprès de Lui qu'est la plus belle récompense. Que ne t'abuse point la libre circulation dans le pays de ceux qui ne croient pas. Ce n'est qu'une jouissance éphémère ; puis leur demeure sera l'Enfer. Quelle détestable couche ! Mais ceux qui craignent leur Seigneur auront des Jardins sous lesquels coulent les ruisseaux, pour y demeurer éternellement, en tant que lieu d'accueil de la part d'Allah. Et ce qu'il y a auprès d'Allah est meilleur pour les gens de bien. Il y a certes, parmi les gens du Livre, ceux qui croient en Allah et en ce qu'on a fait descendre vers vous et en ce qu'on a fait descendre vers eux. Ils sont humbles devant Allah, et ne vendent pas les versets d'Allah à vil prix. Voilà ceux qui auront leur récompense auprès de leur Seigneur. En vérité, Allah est prompt à faire les comptes. Ô vous qui croyez ! Soyez endurants, incitez-vous à l'endurance, soyez vigilants et craignez Allah, afin que vous réussissiez ! »",
                        "count": 1,
                        "source": "سورة آل عمران، الآيات 190-200"
                    }
                ]
            },
            {
                "id": "chap_3",
                "title": "Lorsqu’on met un vêtement neuf",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 19,
                        "arabic": "«اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ».",
                        "phonetic": "Allāhumma laka al-ḥamdu Anta kasawtanīhi, as’aluka min khayrihi wa khayri mā ṣuni'a lahu, wa a'ūdhu bika min sharrihi wa sharri mā ṣuni'a lahu.",
                        "translation": "Ô Allah, à Toi la louange, c'est Toi qui m'en as revêtu. Je Te demande son bien et le bien pour lequel il a été conçu, et je cherche refuge auprès de Toi contre son mal et le mal pour lequel il a été conçu.",
                        "count": 1,
                        "source": "أبو داود والترمذي"
                    }
                ]
            },
            {
                "id": "chap_4",
                "title": "Pour la personne portant un vêtement neuf",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 20,
                        "arabic": "«إِلْبِسْ جَدِيدًا وَعِشْ حَمِيدًا وَمُتْ شَهِيدًا».",
                        "phonetic": "Ilbis jadīdan, wa 'ish ḥamīdan, wa mut shahīdan.",
                        "translation": "Puisse-tu porter des vêtements neufs, vivre loué et mourir en martyr.",
                        "count": 1,
                        "source": "ابن ماجه 2/ 1178"
                    },
                    {
                        "id": 21,
                        "arabic": "«تُبْلِي وَيُخْلِفُ اللهُ تَعَالَى».",
                        "phonetic": "Tublī wa yukhlifu Allāhu ta'ālā.",
                        "translation": "Puisse-tu l'user et qu'Allah le Très-Haut le remplace par un autre.",
                        "count": 1,
                        "source": "أبو داود 4/41، وانظر صحيح أبي داود 2/760"
                    }
                ]
            },
            {
                "id": "chap_6",
                "title": "En entrant aux toilettes",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 23,
                        "arabic": "«بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا».",
                        "phonetic": "Bismi Allāhi walajnâ, wa bismi Allāhi kharajnâ, wa 'alâ Rabbinâ tawakkalnâ.",
                        "translation": "Au nom d'Allah nous sommes entrés, au nom d'Allah nous sommes sortis, et en notre Seigneur nous avons placé notre confiance.",
                        "count": 1,
                        "source": "أبو داود 4/ 325"
                    }
                ]
            },
            {
                "id": "chap_7",
                "title": "En sortant des toilettes",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 24,
                        "arabic": "«غُفْرَانَكَ».",
                        "phonetic": "Ghufrānaka.",
                        "translation": "Je demande Ton pardon.",
                        "count": 1,
                        "source": "أخرجه أصحاب السنن، عمل اليوم والليلة للنسائي، زاد المعاد 2/387"
                    }
                ]
            },
            {
                "id": "chap_10",
                "title": "En sortant de la maison",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 29,
                        "arabic": "«بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ».",
                        "phonetic": "Bismi Allāhi, tawakkaltu 'alā Allāhi, wa lā ḥawla wa lā quwwata illā billāh.",
                        "translation": "Au nom d'Allah, je m'en remets à Allah, il n'y a de force ni de puissance que par Allah.",
                        "count": 1,
                        "source": "أبو داود 4/ 325، والترمذي 5/ 490، صحيح الترمذي 3/ 151"
                    },
                    {
                        "id": 30,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika an aḍilla aw uḍalla, aw azilla aw uzalla, aw aẓlima aw uẓlama, aw ajhala aw yujhala 'alayya.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi pour que je n'égare personne ou que je ne sois pas égaré, pour que je ne commette pas de faute ou que je n'y sois pas poussé, pour que je n'opprime personne ou que je ne sois pas opprimé, pour que je n'agisse pas avec ignorance ou que je ne sois pas victime d'ignorance.",
                        "count": 1,
                        "source": "أهل السنن، صحيح الترمذي 3/ 152، صحيح ابن ماجه 2/ 336"
                    }
                ]
            },
            {
                "id": "chap_11",
                "title": "En  entrant à la maison",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 31,
                        "arabic": "«بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا، ثُمَّ لِيُسَلِّمْ عَلَى أَهْلِهِ».",
                        "phonetic": "Bismi Allāhi walajnā, wa bismi Allāhi kharajnā, wa 'alā Rabbinā tawakkalnā, thumma liyusallim 'alā ahlihi.",
                        "translation": "Au nom d'Allah nous sommes entrés, au nom d'Allah nous sommes sortis, et en notre Seigneur nous avons placé notre confiance, puis qu'il salue sa famille.",
                        "count": 1,
                        "source": "أبو داود 4/ 325، تحفة الأخيار ص28، مسلم برقم 2018"
                    }
                ]
            },
            {
                "id": "chap_27",
                "title": "Du matin et du soir ",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 93,
                        "arabic": "«الْحَمْدُ للهِ وَحْدَهُ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى مَنْ لَا نَبِيَّ بَعْدَهُ».",
                        "phonetic": "Al-ḥamdu lillāhi waḥdahu, waṣ-ṣalātu was-salāmu 'alā man lā nabiyya ba'dahu.",
                        "translation": "Louange à Allah Seul, et que la prière et le salut soient sur celui après qui il n'y a plus de prophète.",
                        "count": 1,
                        "source": "أبو داود برقم 3667"
                    },
                    {
                        "id": 94,
                        "arabic": "﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾ [آية الكرسي].",
                        "phonetic": "Allāhu lā ilāha illā Huwa al-Ḥayyu al-Qayyūm...",
                        "translation": "Le Verset du Trône (Ayat al-Kursi).",
                        "count": 1,
                        "source": "سورة البقرة، آية 255"
                    },
                    {
                        "id": 95,
                        "arabic": "«قُلْ هُوَ اللهُ أَحَدٌ...»، «قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...»، «قُلْ أَعُوذُ بِرَبِّ النَّاسِ...» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Qul Huwa Allāhu Aḥad... Qul a'ūdhu bi-Rabbi al-Falaq... Qul a'ūdhu bi-Rabbi an-Nās.",
                        "translation": "Sourates Al-Ikhlas, Al-Falaq et An-Nas (trois fois).",
                        "count": 1,
                        "source": "أبو داود 4/ 322، الترمذي 5/ 567"
                    },
                    {
                        "id": 96,
                        "arabic": "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ».",
                        "phonetic": "Aṣbaḥnā wa aṣbaḥa al-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illā Allāhu waḥdahu lā sharīka lahu... Rabbi as'aluka khayra mā fī hādhā al-yawmi wa khayra mā ba'dahu...",
                        "translation": "Nous voici au matin et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité digne d'adoration qu'Allah, Seul et sans associé. À Lui la royauté et la louange, et Il est Capable de toute chose. Seigneur, je Te demande le bien de ce jour et le bien de ce qui suit, et je cherche protection auprès de Toi contre le mal de ce jour et le mal de ce qui suit. Seigneur, je cherche protection auprès de Toi contre la paresse et les maux de la vieillesse. Seigneur, je cherche protection auprès de Toi contre le châtiment du Feu et celui de la tombe.",
                        "count": 1,
                        "source": "مسلم 4/ 2088"
                    },
                    {
                        "id": 97,
                        "arabic": "«اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ».",
                        "phonetic": "Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu wa ilayka an-nushūr.",
                        "translation": "Ô Allah, c'est par Toi que nous sommes au matin et par Toi que nous sommes au soir. C'est par Toi que nous vivons et par Toi que nous mourons, et vers Toi est la résurrection.",
                        "count": 1,
                        "source": "الترمذي 5/ 466"
                    },
                    {
                        "id": 98,
                        "arabic": "«اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ».",
                        "phonetic": "Allāhumma Anta Rabbī lā ilāha illā Anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mā staṭa'tu...",
                        "translation": "Ô Allah, Tu es mon Seigneur, nul n'est digne d'adoration si ce n'est Toi. Tu m'as créé et je suis Ton serviteur. Je suis fidèle à Ton pacte et à Ta promesse autant que je le puis. Je cherche protection auprès de Toi contre le mal que j'ai commis. Je reconnais Tes bienfaits envers moi et je reconnais mon péché. Pardonne-moi donc, car nul ne pardonne les péchés si ce n'est Toi.",
                        "count": 1,
                        "source": "البخاري 7/ 150"
                    },
                    {
                        "id": 99,
                        "arabic": "«اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ» (أَرْبَعَ مَرَّاتٍ).",
                        "phonetic": "Allāhumma innī aṣbaḥtu ush-hiduka, wa ush-hidu ḥamalata 'arshika, wa malā'ikataka, wa jamī'a khalqika, annaka Anta Allāhu lā ilāha illā Anta waḥdaka lā sharīka laka, wa anna Muḥammadan 'abduka wa rasūluka.",
                        "translation": "Ô Allah, me voici au matin, je Te prends à témoin, ainsi que les porteurs de Ton Trône, Tes anges et toute Ta création, pour témoigner que Tu es Allah, nulle divinité n'est digne d'adoration sauf Toi, Seul et sans associé, et que Muhammad est Ton serviteur et Ton messager (4 fois).",
                        "count": 1,
                        "source": "أبو داود 4/317، البخاري في الأدب المفرد رقم 1201"
                    },
                    {
                        "id": 100,
                        "arabic": "«اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ».",
                        "phonetic": "Allāhumma mā aṣbaḥa bī min ni'matin aw bi-aḥadin min khalqika fa-minka waḥdaka lā sharīka laka, fa-laka al-ḥamdu wa laka ash-shukru.",
                        "translation": "Ô Allah, tout bienfait qui m'arrive en ce matin ou arrive à l'une de Tes créatures provient de Toi Seul, sans associé. À Toi la louange et à Toi la gratitude.",
                        "count": 1,
                        "source": "أبو داود 4/318، النسائي في عمل اليوم والليلة رقم 7"
                    },
                    {
                        "id": 101,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي».",
                        "phonetic": "Allāhumma innī as'aluka al-'afwa wal-'āfiyata fīd-dunyā wal-ākhirah. Allāhumma innī as'aluka al-'afwa wal-'āfiyata fī dīnī wa dunyāya wa ahlī wa mālī. Allāhumma-stur 'awrātī wa āmin raw'ātī. Allāhumma-ḥfaẓnī min bayni yadayya wa min khalfī wa 'an yamīnī wa 'an shimālī wa min fawqī, wa a'ūdhu bi-'aẓamatika an ughtāla min taḥtī.",
                        "translation": "Ô Allah, je Te demande le pardon et le salut dans ce monde et dans l'au-delà. Ô Allah, je Te demande le pardon et le salut pour ma religion, ma vie, ma famille et mes biens. Ô Allah, dissimule mes faiblesses et rassure-moi contre mes craintes. Ô Allah, protège-moi par devant, par derrière, sur ma droite, sur ma gauche et au-dessus de moi. Et je cherche protection auprès de Ta grandeur contre le fait d'être englouti par en dessous.",
                        "count": 1,
                        "source": "أبو داود وابن ماجه"
                    },
                    {
                        "id": 102,
                        "arabic": "«اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ».",
                        "phonetic": "Allāhumma 'ālima al-ghaybi wash-shahādati fāṭira as-samāwāti wal-arḍi, Rabba kulli shay'in wa malīkahu, ash-hadu an lā ilāha illā Anta, a'ūdhu bika min sharri nafsī, wa min sharri ash-shayṭāni wa shirkihi, wa an aqtarifa 'alā nafsī sū'an, aw ajurrahu ilā muslim.",
                        "translation": "Ô Allah, Connaisseur de l'invisible et du visible, Créateur des cieux et de la terre, Seigneur et Maître de toute chose. J'atteste qu'il n'y a de divinité digne d'adoration que Toi. Je cherche protection auprès de Toi contre le mal de mon âme, contre le mal du Diable et de son polythéisme, et contre le fait de commettre un mal contre moi-même ou d'en causer un à un musulman.",
                        "count": 1,
                        "source": "الترمذي وأبو داود"
                    },
                    {
                        "id": 103,
                        "arabic": "«بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Bismi-Llāhi alladhī lā yaḍurru ma'a ismihi shay'un fīl-arḍi wa lā fīs-samā'i wa Huwa as-Samī'u al-'Alīm.",
                        "translation": "Au nom d'Allah, tel qu'en compagnie de Son Nom rien ne peut nuire sur terre ni dans le ciel, et Il est l'Audient, l'Omniscient (3 fois).",
                        "count": 1,
                        "source": "أبو داود والترمذي"
                    },
                    {
                        "id": 104,
                        "arabic": "«رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Raḍītu bi-Llāhi Rabban wa bil-Islāmi dīnan wa bi-Muḥammadin ﷺ nabiyyan.",
                        "translation": "J'agrée Allah comme Seigneur, l'Islam comme religion et Muhammad ﷺ comme Prophète (3 fois).",
                        "count": 1,
                        "source": "أحمد والترمذي"
                    },
                    {
                        "id": 105,
                        "arabic": "«يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ».",
                        "phonetic": "Yā Ḥayyu yā Qayyūmu bi-raḥmatika astaghīthu aṣliḥ lī sha'nī kullahu wa lā takilnī ilā nafsī ṭarfata 'ayn.",
                        "translation": "Ô Vivant, ô Celui qui subsiste par Lui-même, par Ta miséricorde j'appelle au secours. Améliore ma situation dans sa totalité et ne me confie pas à moi-même, ne serait-ce que le temps d'un clin d'œil.",
                        "count": 1,
                        "source": "الحاكم وصححه الذهبي"
                    },
                    {
                        "id": 106,
                        "arabic": "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ للهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ».",
                        "phonetic": "Aṣbaḥnā wa aṣbaḥa al-mulku lillāhi Rabbi al-'ālamīn. Allāhumma innī as'aluka khayra hādhā al-yawm: fatḥahu, wa naṣrahu, wa nūrahu, wa barakatahu, wa hudāhu, wa a'ūdhu bika min sharri mā fīhi wa sharri mā ba'dahu.",
                        "translation": "Nous sommes au matin et la royauté appartient à Allah, Seigneur des mondes. Ô Allah, je Te demande le bien de ce jour : son succès, son secours, sa lumière, sa bénédiction et sa guidée. Et je cherche protection auprès de Toi contre le mal qu'il contient et le mal qui suit.",
                        "count": 1,
                        "source": "أبو داود"
                    },
                    {
                        "id": 107,
                        "arabic": "«أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ».",
                        "phonetic": "Aṣbaḥnā 'alā fiṭrati al-islāmi wa 'alā kalimati al-ikhlāṣ, wa 'alā dīni nabiyyinā Muḥammadin ﷺ wa 'alā millati abīnā Ibrāhīma, ḥanīfan musliman wa mā kāna mina al-mushrikīn.",
                        "translation": "Nous voici au matin sur la saine nature de l'Islam, sur la parole de la sincérité, sur la religion de notre Prophète Muhammad ﷺ et sur la religion de notre père Ibrahim, qui était un pur monothéiste musulman et n'était point du nombre des polythéistes.",
                        "count": 1,
                        "source": "أحمد"
                    },
                    {
                        "id": 108,
                        "arabic": "«أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ» (ثَلَاثَ مَرَّاتٍ إِذَا أَمْسَى).",
                        "phonetic": "A'ūdhu bi-kalimāti Llāhi at-tāmmāti min sharri mā khalaq.",
                        "translation": "Je cherche protection auprès des paroles parfaites d'Allah contre le mal de ce qu'Il a créé (3 fois le soir).",
                        "count": 1,
                        "source": "مسلم 4/ 2080"
                    },
                    {
                        "id": 109,
                        "arabic": "«اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ» (عَشْرَ مَرَّاتٍ).",
                        "phonetic": "Allāhumma ṣalli wa sallim 'alā nabiyyinā Muḥammad.",
                        "translation": "Ô Allah, prie sur notre Prophète Muhammad et accorde-lui Ton salut (10 fois).",
                        "count": 1,
                        "source": "الطبراني، صحيح الترغيب والترهيب 1/ 273"
                    }
                ]
            },
            {
                "id": "chap_28",
                "title": "Avant de dormir",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 110,
                        "arabic": "«يَجْمَعُ كَفَّيْهِ ثُمَّ يَنْفُثُ فِيهِمَا فَيَقْرَأُ: {قُلْ هُوَ اللهُ أَحَدٌ}، {قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ}، {قُلْ أَعُوذُ بِرَبِّ النَّاسِ} ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ...» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Yajma'u kaffayhi thumma yanfuthu fīhimā fa-yaqra'u: Qul Huwa Allāhu Aḥad, Qul a'ūdhu bi-Rabbi al-Falaq, Qul a'ūdhu bi-Rabbi an-Nās...",
                        "translation": "Joindre les mains, souffler dedans et réciter les sourates Al-Ikhlas, Al-Falaq et An-Nas, puis essuyer ce qui est possible du corps en commençant par la tête et le visage (3 fois).",
                        "count": 1,
                        "source": "البخاري مع الفتح 9/62"
                    },
                    {
                        "id": 111,
                        "arabic": "آيَةُ الْكُرْسِيِّ: ﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾.",
                        "phonetic": "Allāhu lā ilāha illā Huwa al-Ḥayyu al-Qayyūm...",
                        "translation": "Réciter le Verset du Trône (Ayat al-Kursi) avant de dormir.",
                        "count": 1,
                        "source": "البخاري مع الفتح 4/487"
                    },
                    {
                        "id": 112,
                        "arabic": "﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ...﴾ [سُورَةُ الْبَقَرَةِ: 285-286].",
                        "phonetic": "Āmana ar-Rasūlu bi-mā unzila ilayhi min Rabbihi wal-mu'minūn...",
                        "translation": "Réciter les deux derniers versets de la sourate Al-Baqara.",
                        "count": 1,
                        "source": "البخاري ومسلم"
                    },
                    {
                        "id": 113,
                        "arabic": "«بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ».",
                        "phonetic": "Bismika Rabbī waḍa'tu janbī wa bika arfa'uhu. In amsakta nafsī far-ḥamhā, wa in arsaltahā fa-ḥfaẓhā bimā taḥfaẓu bihi 'ibādaka aṣ-ṣāliḥīn.",
                        "translation": "En Ton Nom, mon Seigneur, je pose mon flanc et par Toi je le relève. Si Tu reprends mon âme, fais-lui miséricorde, et si Tu la renvoies, protège-la comme Tu protèges Tes serviteurs vertueux.",
                        "count": 1,
                        "source": "البخاري 11/126، مسلم 4/2084"
                    },
                    {
                        "id": 114,
                        "arabic": "«اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ».",
                        "phonetic": "Allāhumma khalaqta nafsī wa Anta tawaffāhā, laka mamātuhā wa maḥyāhā. In aḥyaytahā fa-ḥfaẓhā wa in amattahā faghfir lahā. Allāhumma innī as'aluka al-'āfiyah.",
                        "translation": "Ô Allah, Tu as créé mon âme et c'est Toi qui la fais mourir. À Toi appartiennent sa mort et sa vie. Si Tu lui donnes la vie, protège-la, et si Tu lui donnes la mort, pardonne-lui. Ô Allah, je Te demande le salut.",
                        "count": 1,
                        "source": "مسلم 4/2083"
                    },
                    {
                        "id": 115,
                        "arabic": "«اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Allāhumma qinī 'adhābaka yawma tab'athu 'ibādak.",
                        "translation": "Ô Allah, préserve-moi de Ton châtiment le jour où Tu ressusciteras Tes serviteurs (3 fois).",
                        "count": 1,
                        "source": "أبو داود 4/311"
                    },
                    {
                        "id": 116,
                        "arabic": "«بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا».",
                        "phonetic": "Bismika Allāhumma amūtu wa aḥyā.",
                        "translation": "En Ton Nom, ô Allah, je meurs et je vis.",
                        "count": 1,
                        "source": "البخاري مع الفتح 11/113"
                    },
                    {
                        "id": 117,
                        "arabic": "«سُبْحَانَ اللهِ (33)، وَالْحَمْدُ للهِ (33)، وَاللهُ أَكْبَرُ (34)».",
                        "phonetic": "Subḥāna Allāh (33x), Al-ḥamdu lillāh (33x), Allāhu akbar (34x).",
                        "translation": "Gloire à Allah (33), Louange à Allah (33), Allah est le plus Grand (34).",
                        "count": 1,
                        "source": "البخاري ومسلم"
                    },
                    {
                        "id": 118,
                        "arabic": "«اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ... اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ».",
                        "phonetic": "Allāhumma Rabba as-samāwāti as-sab'i... iqḍi 'annā ad-dayna wa aghninā mina al-faqr.",
                        "translation": "Ô Allah, Seigneur des sept cieux et du Trône immense... règle nos dettes et préserve-nous de la pauvreté.",
                        "count": 1,
                        "source": "مسلم 4/2084"
                    },
                    {
                        "id": 119,
                        "arabic": "«الْحَمْدُ للهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْوِيَ».",
                        "phonetic": "Al-ḥamdu lillāhi alladhī aṭ'amanā wa saqānā wa kafānā wa āwānā...",
                        "translation": "Louange à Allah qui nous a nourris, nous a abreuvés, nous a protégés et nous a donné refuge. Combien n'ont ni protecteur ni refuge.",
                        "count": 1,
                        "source": "مسلم 4/2085"
                    },
                    {
                        "id": 120,
                        "arabic": "«اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ... أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ...».",
                        "phonetic": "Allāhumma 'ālima al-ghaybi wash-shahādati... a'ūdhu bika min sharri nafsī...",
                        "translation": "Ô Allah, Connaisseur de l'invisible... je cherche protection contre le mal de mon âme et le mal du Diable...",
                        "count": 1,
                        "source": "أبو داود والترمذي"
                    },
                    {
                        "id": 121,
                        "arabic": "«يَقْرَأُ {ألم تَنْزِيلُ} السَّجْدَةِ، وَ {تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ}».",
                        "phonetic": "Yaqra'u: Alif-Lām-Mīm Tanzīl, wa Tabāraka alladhī bi-yadihi al-Mulk.",
                        "translation": "Réciter la sourate As-Sajda et la sourate Al-Mulk.",
                        "count": 1,
                        "source": "الترمذي والنسائي"
                    },
                    {
                        "id": 122,
                        "arabic": "«اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ... آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ».",
                        "phonetic": "Allāhumma aslamtu nafsī ilayka, wa fawwaḍtu amrī ilayka... āmantu bi-kitābika alladhī anzalta wa bi-nabiyyika alladhī arsalta.",
                        "translation": "Ô Allah, je Te soumets mon âme et je Te confie mon sort... J'ai cru en Ton Livre que Tu as descendu et en Ton Prophète que Tu as envoyé.",
                        "count": 1,
                        "source": "البخاري ومسلم"
                    }
                ]
            },
            {
                "id": "chap_29",
                "title": "quand ont se retourne pendant le sommeil ",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 123,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ الْوَاحِدُ الْقَهَّارُ، رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزِيزُ الْغَفَّارُ».",
                        "phonetic": "Lā ilāha illā Allāhu al-Wāḥidu al-Qahhāru, Rabbu as-samāwāti wal-arḍi wa mā baynahumā al-'Azīzu al-Ghaffāru.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, l'Unique, le Dominateur suprême, Seigneur des cieux et de la terre et de ce qui se trouve entre eux, le Puissant, le Grand Pardonneur.",
                        "count": 1,
                        "source": "أخرجه الحاكم 1/ 540 والنسائي في اليوم والليلة"
                    }
                ]
            },
            {
                "id": "chap_110",
                "title": "au chant du coq et au braiment de l'âne",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FFD54F",
                "duas": [
                    {
                        "id": 244,
                        "arabic": "«إِذَا سَمِعْتُمْ صِيَاحَ الدِّيَكَةِ فَاسْأَلُوا اللهَ مِنْ فَضْلِهِ؛ فَإِنَّهَا رَأَتْ مَلَكاً، وَإِذَا سَمِعْتُمْ نَهِيقَ الْحِمَارِ فَتَعَوَّذُوا بِاللهِ مِنَ الشَّيْطَانِ؛ فَإِنَّهُ رَأَى شَيْطَاناً».",
                        "phonetic": "Idhā sami'tum ṣiyāḥa-d-diyakati fa-s'alū Llāha min faḍlihi fa-innahā ra'at malakan, wa idhā sami'tum nahīqa-l-ḥimāri fa-ta'awwadhū bi-Llāhi mina-sh-shayṭāni fa-innahu ra'ā shayṭānā.",
                        "translation": "« Si vous entendez le chant du coq, demandez à Allah Ses faveurs car il a vu un ange. Si vous entendez le braiment de l'âne, cherchez protection auprès d'Allah contre le Diable car il a vu un diable. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            }
        ]
    },
    {
        "id": "prayer",
        "name": "Prière",
        "nameAr": "الصلاة",
        "emoji": "🕌",
        "color": "#4CAF50",
        "chapters": [
            {
                "id": "chap_8",
                "title": "Avant les ablutions",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 25,
                        "arabic": "«بِسْمِ اللهِ».",
                        "phonetic": "Bismi Allāh.",
                        "translation": "Au nom d'Allah.",
                        "count": 1,
                        "source": "أبو داود وابن ماجه وأحمد، إرواء الغليل 1/ 122"
                    }
                ]
            },
            {
                "id": "chap_9",
                "title": "À la fin des ablutions",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 26,
                        "arabic": "«أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ».",
                        "phonetic": "Ash-hadu an lā ilāha illā Allāhu waḥdahu lā sharīka lahu, wa ash-hadu anna Muḥammadan 'abduhu wa rasūluhu.",
                        "translation": "J'atteste qu'il n'y a de divinité digne d'adoration qu'Allah, Seul sans associé, et j'atteste que Muhammad est Son serviteur et Son messager.",
                        "count": 1,
                        "source": "رواه مسلم 1/ 209"
                    },
                    {
                        "id": 27,
                        "arabic": "«اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ».",
                        "phonetic": "Allāhumma j'alnī mina at-tawwābīna wa j'alnī mina al-mutatahhirīn.",
                        "translation": "Ô Allah, place-moi parmi ceux qui se repentent et place-moi parmi ceux qui se purifient.",
                        "count": 1,
                        "source": "الترمذي 1/ 78، صحيح الترمذي 1/ 18"
                    },
                    {
                        "id": 28,
                        "arabic": "«سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ».",
                        "phonetic": "Subḥānaka Allāhumma wa bi-ḥamdika, ash-hadu an lā ilāha illā Anta, astaghfiruka wa atūbu ilayk.",
                        "translation": "Gloire et louange à Toi ô Allah. J'atteste qu'il n'y a de divinité que Toi. Je Te demande pardon et je me repens à Toi.",
                        "count": 1,
                        "source": "النسائي في عمل اليوم والليلة ص173، إرواء الغليل 1/ 135 و2/ 94"
                    }
                ]
            },
            {
                "id": "chap_12",
                "title": "En allant à la mosquée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 32,
                        "arabic": "«اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ فِي نَفْسِي نُورًا، وَأَعْظِمْ لِي نُورًا، وَعَظِّمْ لِي نُورًا، وَاجْعَلْ لِي نُورًا، وَاجْعَلْنِي نُورًا، اللَّهُمَّ أَعْطِنِي نُورًا، وَاجْعَلْ فِي عَصَبِي نُورًا، وَفِي لَحْمِي نُورًا، وَفِي دَمِي نُورًا، وَفِي شَعْرِي نُورًا، وَفِي بَشَرِي نُورًا».",
                        "phonetic": "Allāhumma j'al fī qalbī nūran, wa fī lisānī nūran, wa fī sam'ī nūran, wa fī baṣarī nūran, wa min fawqī nūran, wa min taḥtī nūran, 'an yamīnī nūran, wa 'an shimālī nūran, wa min amāmī nūran, wa min khalfī nūran, wa j'al fī nafsī nūran, wa a'ẓim lī nūran, wa 'aẓẓim lī nūran, wa j'al lī nūran, wa j'alnī nūran. Allāhumma a'ṭinī nūran, wa j'al fī 'aṣabī nūran, wa fī laḥmī nūran, wa fī damī nūran, wa fī sha'rī nūran, wa fī basharī nūran.",
                        "translation": "Ô Allah, place de la lumière dans mon cœur, dans ma langue, dans mon ouïe, dans ma vue, au-dessus de moi, au-dessous de moi, à ma droite, à ma gauche, devant moi, derrière moi. Place de la lumière dans mon âme, intensifie-moi cette lumière, agrandis-la. Accorde-moi de la lumière, fais de moi une lumière. Ô Allah, donne-moi de la lumière, place de la lumière dans mes nerfs, dans ma chair, dans mon sang, dans mes cheveux et dans ma peau.",
                        "count": 1,
                        "source": "البخاري برقم 6316، مسلم برقم 763"
                    },
                    {
                        "id": 33,
                        "arabic": "«اللَّهُمَّ اجْعَلْ لِي نُورًا فِي قَبْرِي... وَنُورًا فِي عِظَامِي».",
                        "phonetic": "Allāhumma j'al lī nūran fī qabrī... wa nūran fī 'iẓāmī.",
                        "translation": "Ô Allah, place pour moi une lumière dans ma tombe... et une lumière dans mes os.",
                        "count": 1,
                        "source": "الترمذي برقم 3419، 5/483"
                    },
                    {
                        "id": 34,
                        "arabic": "«وَزِدْنِي نُورًا، وَزِدْنِي نُورًا، وَزِدْنِي نُورًا».",
                        "phonetic": "Wa zidnī nūran, wa zidnī nūran, wa zidnī nūran.",
                        "translation": "Et augmente ma lumière, et augmente ma lumière, et augmente ma lumière.",
                        "count": 1,
                        "source": "البخاري في الأدب المفرد برقم 695، صحيح الأدب المفرد برقم 536"
                    },
                    {
                        "id": 35,
                        "arabic": "«وَهَبْ لِي نُورًا عَلَى نُورٍ».",
                        "phonetic": "Wa hab lī nūran 'alā nūr.",
                        "translation": "Et accorde-moi lumière sur lumière.",
                        "count": 1,
                        "source": "فتح الباري 11/118، كتاب الدعاء لابن أبي عاصم"
                    }
                ]
            },
            {
                "id": "chap_13",
                "title": "En entrant à la mosquée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 36,
                        "arabic": "«(يَبْدَأُ بِرِجْلِهِ الْيُمْنَى)، وَيَقُولُ: أَعُوذُ بِاللهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ، بِسْمِ اللهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ».",
                        "phonetic": "Yabda'u bi-rijlihi al-yumnā, wa yaqūlu: A'ūdhu bi-Llāhi al-'Aẓīm, wa bi-wajhihi al-karīm, wa sulṭānihi al-qadīm, mina ash-shayṭāni ar-rajīm. Bismi Allāh, waṣ-ṣalātu was-salāmu 'alā Rasūli Allāh. Allāhumma iftaḥ lī abwāba raḥmatik.",
                        "translation": "(Il commence par le pied droit) et dit : « Je cherche protection auprès d'Allah le Très-Grand, par Son noble Visage et Son pouvoir éternel, contre le Diable banni. Au nom d'Allah, que la prière et le salut soient sur le Messager d'Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde ».",
                        "count": 1,
                        "source": "أبو داود، مسلم، الترمذي، وانظر صحيح الجامع برقم 4591"
                    }
                ]
            },
            {
                "id": "chap_14",
                "title": "En sortant de la mosquée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 37,
                        "arabic": "«يَبْدَأُ بِرِجْلِهِ الْيُسْرَى وَيَقُولُ: بِسْمِ اللهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ».",
                        "phonetic": "Yabda'u bi-rijlihi al-yusrā wa yaqūlu: Bismi Allāhi, waṣ-ṣalātu was-salāmu 'alā Rasūli Allāh. Allāhumma innī as'aluka min faḍlika, Allāhumma 'aṣimnī mina ash-shayṭāni ar-rajīm.",
                        "translation": "Il commence par le pied gauche et dit : « Au nom d'Allah, que la prière et le salut soient sur le Messager d'Allah. Ô Allah, je Te demande de Tes faveurs. Ô Allah, préserve-moi du Diable banni ».",
                        "count": 1,
                        "source": "أبو داود، ابن ماجه، انظر صحيح ابن ماجه 1/129"
                    }
                ]
            },
            {
                "id": "chap_15",
                "title": "L'appel à la prière",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 38,
                        "arabic": "«يَقُولُ مِثْلَ مَا يَقُولُ الْمُؤَذِّنُ إِلَّا فِي (حَيَّ عَلَى الصَّلَاةِ) وَ(حَيَّ عَلَى الْفَلَاحِ) فَيَقُولُ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ».",
                        "phonetic": "Yaqūlu mithla mā yaqūlu al-mu'adh-dhin illā fī « Hayya 'alāṣ-ṣalāh » wa « Hayya 'alal-falāḥ » fayaqūlu: Lā ḥawla wa lā quwwata illā billāh.",
                        "translation": "On répète les mêmes paroles que le muezzin, sauf après « Accourez à la prière » et « Accourez au succès », où l'on dit : « Il n'y a de force ni de puissance que par Allah ».",
                        "count": 1,
                        "source": "البخاري 1/ 152، مسلم 1/ 288"
                    },
                    {
                        "id": 39,
                        "arabic": "«يَقُولُ ذَلِكَ عَقِبَ تَشَهُّدِ الْمُؤَذِّنِ: وَأَنَا أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا».",
                        "phonetic": "Yaqūlu dhālika 'aqiba tashah-hudi al-mu'adh-dhin: Wa ana ash-hadu an lā ilāha illā Allāhu waḥdahu lā sharīka lahu, wa anna Muḥammadan 'abduhu wa rasūluhu, raḍītu bi-Llāhi Rabban, wa bi-Muḥammadin Rasūlan, wa bil-Islāmi dīnan.",
                        "translation": "Après l'attestation de foi du muezzin : « Et j'atteste qu'il n'y a de divinité digne d'adoration qu'Allah, Seul sans associé, et que Muhammad est Son serviteur et Son messager. J'agrée Allah comme Seigneur, Muhammad comme Messager et l'Islam comme religion ».",
                        "count": 1,
                        "source": "مسلم 1/290"
                    },
                    {
                        "id": 41,
                        "arabic": "«يُصَلِّي عَلَى النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ بَعْدَ فَرَاغِهِ مِنْ إِجَابَةِ الْمُؤَذِّنِ».",
                        "phonetic": "Yuṣallī 'alā an-Nabiyyi ṣallā Allāhu 'alayhi wa sallama ba'da farāghihi min ijābati al-mu'adh-dhin.",
                        "translation": "Puis il prie sur le Prophète (que la prière et le salut d'Allah soient sur lui) après avoir fini de répondre au muezzin.",
                        "count": 1,
                        "source": "ابن خزيمة 1/ 220"
                    },
                    {
                        "id": 42,
                        "arabic": "«اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ، [إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ]».",
                        "phonetic": "Allāhumma Rabba hādhihi ad-da'wati at-tāmmati, waṣ-ṣalāti al-qā'imati, āti Muḥammadan al-wasīlata wal-faḍīlata, wab'ath-hu maqāman maḥmūdan alladhī wa'adtahu, [innaka lā tukhlifu al-mī'ād].",
                        "translation": "Ô Allah, Seigneur de cet appel parfait et de la prière qui va être accomplie, accorde à Muhammad la place intermédiaire (au Paradis) et la précellence, et élève-le au rang louable que Tu lui as promis. [Certes, Tu ne manques jamais à Ta promesse].",
                        "count": 1,
                        "source": "البخاري 1/152، وزيادة بين القوسين للبيهقي 1/410"
                    },
                    {
                        "id": 43,
                        "arabic": "«يَدْعُو لِنَفْسِهِ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ فَإِنَّ الدُّعَاءَ حِينَئِذٍ لَا يُرَدُّ».",
                        "phonetic": "Yad'ū linafsihi bayna al-adhāni wal-iqāmati fa-inna ad-du'ā'a ḥīna'idhin lā yuraddu.",
                        "translation": "Il invoque pour lui-même entre l'appel à la prière (Adhân) et le second appel (Iqâma), car l'invocation à ce moment-là n'est pas rejetée.",
                        "count": 1,
                        "source": "الترمذي، أبو داود، أحمد، وانظر تحفة الأخيار ص 38"
                    }
                ]
            },
            {
                "id": "chap_16",
                "title": "À l'ouverture de la prière",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 44,
                        "arabic": "«اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ».",
                        "phonetic": "Allāhumma bā'id baynī wa bayna khaṭāyāya kamā bā'adta bayna al-mashriqi wal-maghribi, Allāhumma naqqinī min khaṭāyāya kamā yunaqqā ath-thawbu al-abyaḍu mina ad-danasi, Allāhumma aghsilnī min khaṭāyāya bil-mā'i wath-thalji wal-barad.",
                        "translation": "Ô Allah, éloigne-moi de mes péchés comme Tu as éloigné l'Orient de l'Occident. Ô Allah, purifie-moi de mes péchés comme on nettoie le vêtement blanc de la saleté. Ô Allah, lave-moi de mes péchés avec de l'eau, de la neige et de la grêle.",
                        "count": 1,
                        "source": "البخاري 1/ 181، مسلم 1/ 419"
                    },
                    {
                        "id": 45,
                        "arabic": "«سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ».",
                        "phonetic": "Subḥānaka Allāhumma wa bi-ḥamdika, wa tabāraka ismuka, wa ta'ālā jadduka, wa lā ilāha ghayruka.",
                        "translation": "Gloire et louange à Toi, ô Allah. Béni soit Ton Nom, exaltée soit Ta grandeur et il n'y a d'autre divinité que Toi.",
                        "count": 1,
                        "source": "أصحاب السنن الأربعة، صحيح الترمذي 1/77، صحيح ابن ماجه 1/135"
                    },
                    {
                        "id": 46,
                        "arabic": "«وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالْأَرْضَ حَنِيفًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ، إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي للهِ رَبِّ الْعَالَمِينَ، لَا شَرِيكَ لَهُ وَبِذَلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ. اللَّهُمَّ أَنْتَ الْمَلِكُ لَا إِلَهَ إِلَّا أَنْتَ، أَنْتَ رَبِّي وَأَنَا عَبْدُكَ، ظَلَمْتُ نَفْسِي وَاعْتَرَفْتُ بِذَنْبِي، فَاغْفِرْ لِي ذُنُوبِي جَمِيعًا، إِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، وَاهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ، لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا لَا يَصْرِفُ عَنِّي سَيِّئَهَا إِلَّا أَنْتَ. لَبَّيْكَ وَسَعْدَيْكَ وَالْخَيْرُ كُلُّهُ بِيَدَيْكَ، وَالشَّرُّ لَيْسَ إِلَيْكَ، أَنَا بِكَ وَإِلَيْكَ، تَبَارَكْتَ وَتَعَالَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ».",
                        "phonetic": "Wajjahtu wajhiya lilladhī faṭara as-samāwāti wal-arḍa ḥanīfan wa mā ana mina al-mushrikīn. Inna ṣalātī wa nusukī wa maḥyāya wa mamātī lillāhi Rabbi al-'ālamīn. Lā sharīka lahu wa bidhālika umirtu wa ana mina al-muslimīn. Allāhumma Anta al-Maliku lā ilāha illā Anta. Anta Rabbī wa ana 'abduka, ẓalamtu nafsī wa'taraftu bidhanbī, faghfir lī dhunūbī jamī'an, innahu lā yaghfiru adh-dhunūba illā Anta. Wahdinī li-aḥsani al-akhlāqi, lā yahdī li-aḥsanihā illā Anta. Waṣrif 'annī sayyi'ahā lā yaṣrifu 'annī sayyi'ahā illā Anta. Labbayka wa sa'dayka wal-khayru kulluhu bi-yadayka, wash-sharru laysa ilayka, ana bika wa ilayka, tabārakta wa ta'ālayta, astaghfiruka wa atūbu ilayka.",
                        "translation": "Je tourne mon visage vers Celui qui a créé les cieux et la terre, en pur monothéiste. Ma prière, mes actes de dévotion, ma vie et ma mort appartiennent à Allah, Seigneur de l'univers, sans associé. Ô Allah, Tu es le Roi, nul n'est digne d'adoration sauf Toi. Tu es mon Seigneur et je suis Ton serviteur. J'ai été injuste envers moi-même et je reconnais mon péché. Pardonne-moi tous mes péchés, car nul ne pardonne les péchés sauf Toi. Guide-moi vers les meilleurs caractères, car nul n'y guide sauf Toi. Éloigne de moi les mauvais caractères, car nul ne les éloigne sauf Toi. Me voici à Toi, tout le bien est entre Tes mains et le mal ne peut T'être attribué. J'existe par Toi et je reviens vers Toi. Béni et Exalté sois-Tu, je Te demande pardon et je me repens à Toi.",
                        "count": 1,
                        "source": "رواه مسلم 1/534"
                    },
                    {
                        "id": 47,
                        "arabic": "«اللَّهُمَّ رَبَّ جَبْرَائِيلَ وَمِيكَائِيلَ وَإِسْرَافِيلَ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، أَنْتَ تَحْكُمُ بَيْنَ عِبَادِكَ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ، اهْدِنِي لِمَا اخْتُلِفَ فِيهِ مِنَ الْحَقِّ بِإِذْنِكَ، إِنَّكَ تَهْدِي مَنْ تَشَاءُ إِلَى صِرَاطٍ مُسْتَقِيمٍ».",
                        "phonetic": "Allāhumma Rabba Jabrā'īla wa Mīkā'īla wa Isrāfīla, fāṭira as-samāwāti wal-arḍi, 'ālima al-ghaybi wash-shahādati, Anta taḥkumu bayna 'ibādika fīmā kānū fīhi yakhtalifūna, ihdinī limā akhtulifa fīhi mina al-ḥaqqi bi-idhnik, innaka tahdī man tashā'u ilā ṣirāṭin mustaqīm.",
                        "translation": "Ô Allah, Seigneur de Gabriel, de Mikaël et d'Israfil, Créateur des cieux et de la terre, Connaisseur de l'invisible et du visible, Tu juges entre Tes serviteurs sur ce quoi ils divergeaient. Guide-moi, par Ta volonté, vers la vérité sur laquelle on a divergé. Certes, Tu guides qui Tu veux vers le droit chemin.",
                        "count": 1,
                        "source": "رواه مسلم 1/ 534"
                    },
                    {
                        "id": 48,
                        "arabic": "«اللهُ أَكْبَرُ كَبِيرًا، اللهُ أَكْبَرُ كَبِيرًا، اللهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ للهِ كَثِيرًا، وَالْحَمْدُ للهِ كَثِيرًا، وَالْحَمْدُ للهِ كَثِيرًا، وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا (ثَلَاثًا). أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ: مِنْ نَفْخِهِ، وَنَفْثِهِ، وَهَمْزِهِ».",
                        "phonetic": "Allāhu akbaru kabīran (3x), wal-ḥamdu lillāhi kathīran (3x), wa subḥāna Allāhi bukratan wa aṣīlan (3x). A'ūdhu bi-Llāhi mina ash-shayṭāni ar-rajīm: min nafkhihi, wa nafthihi, wa hamzih.",
                        "translation": "Allah est le plus Grand, infiniment (3 fois). Louange à Allah, abondamment (3 fois). Gloire à Allah, matin et soir (3 fois). Je cherche protection auprès d'Allah contre le Diable banni : contre son orgueil, sa poésie (maléfique) et sa folie.",
                        "count": 1,
                        "source": "أبو داود 1/203، ابن ماجه 1/265، أحمد 4/85، مسلم 1/420"
                    },
                    {
                        "id": 49,
                        "arabic": "«كَانَ النَّبِيُّ ﷺ إِذَا قَامَ مِنَ اللَّيْلِ يَتَهَجَّدُ قَالَ: اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، [وَلَكَ الْحَمْدُ أَنْتَ رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ]، [وَلَكَ الْحَمْدُ لَكَ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ]، [وَلَكَ الْحَمْدُ أَنْتَ مَلِكُ السَّمَاوَاتِ وَالْأَرْضِ]، [وَلَكَ الْحَمْدُ] أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَقَوْلُكَ الْحَقُّ، وَلِقَاؤُكَ الْحَقُّ، وَالْجَنَّةُ حَقٌّ، وَالنَّارُ حَقٌّ، وَالنَّبِيُّونَ حَقٌّ، وَمُحَمَّدٌ ﷺ حَقٌّ، وَالسَّاعَةُ حَقٌّ، [اللَّهُمَّ لَكَ أَسْلَمْتُ، وَعَلَيْكَ تَوَكَّلْتُ، وَبِكَ آمَنْتُ، وَإِلَيْكَ أَنَبْتُ، وَبِكَ خَاصَمْتُ، وَإِلَيْكَ حَاكَمْتُ، فَاغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَأَسْرَرْتُ وَمَا أَعْلَنْتُ]، [أَنْتَ الْمُقَدِّمُ، وَأَنْتَ الْمُؤَخِّرُ لَا إِلَهَ إِلَّا أَنْتَ]، [أَنْتَ إِلَهِي لَا إِلَهَ إِلَّا أَنْتَ]».",
                        "phonetic": "Allāhumma laka al-ḥamdu Anta nūru as-samāwāti wal-arḍi wa man fīhinna... Anta al-Ḥaqqu wa wa'duka al-ḥaqqu... Allāhumma laka aslamtu wa 'alayka tawakkaltu... Anta al-Muqaddimu wa Anta al-Mu'akhkhiru lā ilāha illā Anta.",
                        "translation": "Le Prophète ﷺ disait lorsqu'il se levait la nuit pour le Tahajjud : « Ô Allah, à Toi la louange, Tu es la Lumière des cieux, de la terre et de ceux qu'ils renferment. À Toi la louange, Tu es le Soutien des cieux, de la terre et de ceux qu'ils renferment. [À Toi la louange, Tu es le Seigneur des cieux, de la terre et de ceux qu'ils renferment]. [À Toi la louange, à Toi appartient la royauté des cieux, de la terre et de ceux qu'ils renferment]. [À Toi la louange, Tu es le Roi des cieux et de la terre]. [À Toi la louange], Tu es la Vérité, Ta promesse est vérité, Ta parole est vérité, Ta rencontre est vérité, le Paradis est vérité, l'Enfer est vérité, les prophètes sont vérité, Muhammad ﷺ est vérité et l'Heure est vérité. [Ô Allah, à Toi je me suis soumis, en Toi j'ai placé ma confiance, en Toi j'ai cru, vers Toi je me suis repenti, par Toi j'ai lutté et à Toi je m'en suis remis pour jugement. Pardonne-moi mes fautes passées et futures, ce que j'ai caché et ce que j'ai divulgué]. [Tu es Celui qui avance et Tu es Celui qui recule, nul n'est digne d'adoration sauf Toi]. [Tu es mon Dieu, nul n'est digne d'adoration sauf Toi] ».",
                        "count": 1,
                        "source": "البخاري مع الفتح 3/3، 11/116، 13/371، مسلم 1/532"
                    }
                ]
            },
            {
                "id": "chap_19",
                "title": "de la prosternation ",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 58,
                        "arabic": "«سُبْحَانَ رَبِّيَ الْأَعْلَى» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Subḥāna Rabbī al-A'lā.",
                        "translation": "Gloire à mon Seigneur le Très-Haut (trois fois).",
                        "count": 1,
                        "source": "أهل السنن وأحمد، صحيح الترمذي 1/83"
                    },
                    {
                        "id": 59,
                        "arabic": "«سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي».",
                        "phonetic": "Subḥānaka Allāhumma Rabbanā wa bi-ḥamdika, Allāhumma aghfir lī.",
                        "translation": "Gloire et louange à Toi, ô Allah, notre Seigneur. Ô Allah, pardonne-moi.",
                        "count": 1,
                        "source": "البخاري ومسلم"
                    },
                    {
                        "id": 60,
                        "arabic": "«سُبُّوحٌ، قُدُّوسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ».",
                        "phonetic": "Subbūḥun, Quddūsun, Rabbu al-malā'ikati war-Rūḥ.",
                        "translation": "Parfait et Très-Saint, Seigneur des Anges et de l'Esprit.",
                        "count": 1,
                        "source": "مسلم 1/ 533"
                    },
                    {
                        "id": 61,
                        "arabic": "«اللَّهُمَّ لَكَ سَجَدْتُ وَبِكَ آمَنْتُ وَلَكَ أَسْلَمْتُ، سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ وَصَوَّرَهُ وَشَقَّ سَمْعَهُ وَبَصَرَهُ، تَبَارَكَ اللهُ أَحْسَنُ الْخَالِقِينَ».",
                        "phonetic": "Allāhumma laka sajadtu wa bika āmantu wa laka aslamtu, sajada wajhiya lilladhī khalaqahu wa ṣawwarahu wa shaqqa sam'ahu wa baṣarahu, tabāraka Allāhu aḥsanu al-khāliqīn.",
                        "translation": "Ô Allah, c'est pour Toi que je me prosterne, en Toi que j'ai cru et à Toi que je me suis soumis. Mon visage s'est prosterné devant Celui qui l'a créé, lui a donné sa forme et a ouvert son ouïe et sa vue. Béni soit Allah, le Meilleur des créateurs.",
                        "count": 1,
                        "source": "مسلم 1/ 534"
                    },
                    {
                        "id": 62,
                        "arabic": "«سُبْحَانَ ذِي الْجَبَرُوتِ، وَالْمَلَكُوتِ، وَالْكِبْرِيَاءِ، وَالْعَظَمَةِ».",
                        "phonetic": "Subḥāna dhi-l-jabarūti, wal-malakūti, wal-kibriyā'i, wal-'aẓamah.",
                        "translation": "Gloire au Possesseur de la Toute-Puissance, de la Royauté absolue, de la Grandeur et de la Majesté.",
                        "count": 1,
                        "source": "أبو داود 1/ 230، النسائي، أحمد"
                    },
                    {
                        "id": 63,
                        "arabic": "«اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ».",
                        "phonetic": "Allāhumma aghfir lī dhanbī kullahu, diqqahu wa jillahu, wa awwalahu wa ākhirahu, wa 'alāniyatahu wa sirrahu.",
                        "translation": "Ô Allah, pardonne-moi tous mes péchés : les plus petits comme les plus grands, les premiers comme les derniers, ceux commis en public comme ceux commis en secret.",
                        "count": 1,
                        "source": "مسلم 1/ 350"
                    },
                    {
                        "id": 64,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مِنْ عُقُوبَتِكَ، وَأَعُوذُ بِكَ مِنْكَ، لَا أُحْصِي ثَنَاءً عَلَيْكَ أَنْتَ كَمَا أَثْنَيْتَ عَلَى نَفْسِكَ».",
                        "phonetic": "Allāhumma innī a'ūdhu bi-riḍāka min sakhaṭika, wa bi-mu'āfātika min 'uqūbatika, wa a'ūdhu bika minka, lā uḥṣī thanā'an 'alayka Anta kamā athnayta 'alā nafsika.",
                        "translation": "Ô Allah, je cherche protection auprès de Ton agrément contre Ta colère, auprès de Ton pardon contre Ton châtiment. Et je cherche protection auprès de Toi contre Toi-même. Je ne saurais Te louer autant que Tu Te loues Toi-même.",
                        "count": 1,
                        "source": "مسلم 1/ 352"
                    }
                ]
            },
            {
                "id": "chap_20",
                "title": "entre les deux prosternations",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 65,
                        "arabic": "«رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي».",
                        "phonetic": "Rabbi aghfir lī, Rabbi aghfir lī.",
                        "translation": "Seigneur, pardonne-moi. Seigneur, pardonne-moi.",
                        "count": 1,
                        "source": "أبو داود 1/ 231، صحيح ابن ماجة 1/ 148"
                    },
                    {
                        "id": 66,
                        "arabic": "«اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَاجْبُرْنِي، وَعَافِنِي، وَارْزُقْنِي، وَارْفَعْنِي».",
                        "phonetic": "Allāhumma aghfir lī, war-ḥamnī, wah-dinī, waj-burnī, wa 'āfinī, war-zuqnī, war-fa'nī.",
                        "translation": "Ô Allah, pardonne-moi, fais-moi miséricorde, guide-moi, panse mes blessures (ou secours-moi), préserve-moi, accorde-moi ma subsistance et élève-moi.",
                        "count": 1,
                        "source": "أصحاب السنن إلا النسائي، صحيح الترمذي 1/90، صحيح ابن ماجه 1/ 148"
                    }
                ]
            },
            {
                "id": "chap_22",
                "title": "Le Tachahoud",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 69,
                        "arabic": "«التَّحِيَّاتُ للهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ».",
                        "phonetic": "At-taḥiyyātu lillāhi, waṣ-ṣalawātu waṭ-ṭayyibātu, as-salāmu 'alayka ayyuhā an-Nabiyyu wa raḥmatu Allāhi wa barakātuhu, as-salāmu 'alaynā wa 'alā 'ibādi Allāhi aṣ-ṣāliḥīn. Ash-hadu an lā ilāha illā Allāhu wa ash-hadu anna Muḥammadan 'abduhu wa rasūluhu.",
                        "translation": "Les salutations sont à Allah, ainsi que les prières et les bonnes paroles. Que le salut soit sur toi, ô Prophète, ainsi que la miséricorde d'Allah et Ses bénédictions. Que le salut soit sur nous et sur les serviteurs vertueux d'Allah. J'atteste qu'il n'y a de divinité digne d'adoration qu'Allah et j'atteste que Muhammad est Son serviteur et Son messager.",
                        "count": 1,
                        "source": "البخاري مع الفتح 1/ 13، مسلم 1/ 301"
                    }
                ]
            },
            {
                "id": "chap_23",
                "title": "Salutations prophétiques après le Tachahoud",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 70,
                        "arabic": "«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ».",
                        "phonetic": "Allāhumma ṣalli 'alā Muḥammadin wa 'alā āli Muḥammadin, kamā ṣallayta 'alā Ibrāhīma wa 'alā āli Ibrāhīma, innaka Ḥamīdun Majīd. Allāhumma bārik 'alā Muḥammadin wa 'alā āli Muḥammadin kamā bārakta 'alā Ibrāhīma wa 'alā āli Ibrāhīma, innaka Ḥamīdun Majīd.",
                        "translation": "Ô Allah, prie sur Muhammad et sur la famille de Muhammad comme Tu as prié sur Ibrahim et sur la famille d'Ibrahim, Tu es certes digne de louange et de gloire. Ô Allah, bénis Muhammad et la famille de Muhammad comme Tu as béni Ibrahim et la famille d'Ibrahim, Tu es certes digne de louange et de gloire.",
                        "count": 1,
                        "source": "البخاري مع الفتح 6/ 408"
                    },
                    {
                        "id": 71,
                        "arabic": "«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ».",
                        "phonetic": "Allāhumma ṣalli 'alā Muḥammadin wa 'alā azwājihi wa dhurriyyatihi, kamā ṣallayta 'alā āli Ibrāhīma, wa bārik 'alā Muḥammadin wa 'alā azwājihi wa dhurriyyatihi kamā bārakta 'alā āli Ibrāhīma innaka Ḥamīdun Majīd.",
                        "translation": "Ô Allah, prie sur Muhammad, ses épouses et sa descendance, comme Tu as prié sur la famille d'Ibrahim. Et bénis Muhammad, ses épouses et sa descendance, comme Tu as béni la famille d'Ibrahim, Tu es certes digne de louange et de gloire.",
                        "count": 1,
                        "source": "البخاري مع الفتح 6/ 407، مسلم 1/ 306"
                    }
                ]
            },
            {
                "id": "chap_24",
                "title": "Dernier Tachahoud avant les salutations finales",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 72,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika min 'adhābi al-qabri, wa min 'adhābi jahannama, wa min fitnati al-maḥyā wal-mamāti, wa min sharri fitnati al-masīḥi ad-dajjāl.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi contre le châtiment de la tombe, contre le châtiment de l'Enfer, contre les épreuves de la vie et de la mort, et contre le mal de l'épreuve de l'Antéchrist.",
                        "count": 1,
                        "source": "البخاري 2/102، مسلم 1/412"
                    },
                    {
                        "id": 73,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْمَأْثَمِ وَالْمَغْرَمِ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika min 'adhābi al-qabri, wa a'ūdhu bika min fitnati al-masīḥi ad-dajjāl, wa a'ūdhu bika min fitnati al-maḥyā wal-mamāti, Allāhumma innī a'ūdhu bika mina al-ma'thami wal-maghram.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi contre le châtiment de la tombe, contre l'épreuve de l'Antéchrist, contre les épreuves de la vie et de la mort. Ô Allah, je cherche protection auprès de Toi contre le péché et les dettes.",
                        "count": 1,
                        "source": "البخاري 1/202، مسلم 1/412"
                    },
                    {
                        "id": 74,
                        "arabic": "«اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ».",
                        "phonetic": "Allāhumma innī ẓalamtu nafsī ẓulman kathīran, wa lā yaghfiru adh-dhunūba illā Anta, faghfir lī maghfiratan min 'indika war-ḥamnī innaka Anta al-Ghafūru ar-Raḥīm.",
                        "translation": "Ô Allah, j'ai été très injuste envers moi-même et nul ne pardonne les péchés si ce n'est Toi. Accorde-moi un pardon venant de Toi et fais-moi miséricorde, car Tu es certes le Pardonneur, le Très-Miséricordieux.",
                        "count": 1,
                        "source": "البخاري 8/168، مسلم 4/2078"
                    },
                    {
                        "id": 75,
                        "arabic": "«اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ وَمَا أَسْرَفْتُ وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ لَا إِلَهَ إِلَّا أَنْتَ».",
                        "phonetic": "Allāhumma aghfir lī mā qaddamtu wa mā akhkhartu wa mā asrartu wa mā a'lantu wa mā asraftu wa mā Anta a'lamu bihi minnī, Anta al-Muqaddimu wa Anta al-Mu'akhkhiru lā ilāha illā Anta.",
                        "translation": "Ô Allah, pardonne-moi mes fautes passées et futures, ce que j'ai caché et ce que j'ai divulgué, mes excès et ce que Tu connais mieux que moi. Tu es Celui qui avance et Tu es Celui qui recule, nul n'est digne d'adoration sauf Toi.",
                        "count": 1,
                        "source": "مسلم 1/534"
                    },
                    {
                        "id": 76,
                        "arabic": "«اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ».",
                        "phonetic": "Allāhumma a'innī 'alā dhikrika, wa shukrika, wa ḥusni 'ibādatika.",
                        "translation": "Ô Allah, aide-moi à T'évoquer, à Te remercier et à T'adorer de la meilleure manière.",
                        "count": 1,
                        "source": "أبو داود 2/86، النسائي 3/53"
                    },
                    {
                        "id": 77,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ وَأَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ مِنْ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika mina al-bukhli wa a'ūdhu bika mina al-jubni, wa a'ūdhu bika min an uradda ilā ardhalil-'umuri, wa a'ūdhu bika min fitnati ad-dunyā wa a'ūdhu bika min 'adhābi al-qabri.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi contre l'avarice et la lâcheté. Je cherche protection auprès de Toi contre la décrépitude de la vieillesse, contre les épreuves de ce monde et contre le châtiment de la tombe.",
                        "count": 1,
                        "source": "البخاري 6/35"
                    },
                    {
                        "id": 78,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ».",
                        "phonetic": "Allāhumma innī as'aluka al-jannata wa a'ūdhu bika mina an-nār.",
                        "translation": "Ô Allah, je Te demande le Paradis et je cherche protection auprès de Toi contre l'Enfer.",
                        "count": 1,
                        "source": "أبو داود، صحيح ابن ماجه 2/328"
                    },
                    {
                        "id": 79,
                        "arabic": "«اللَّهُمَّ بِعِلْمِكَ الْغَيْبَ وَقُدْرَتِكَ عَلَى الْخَلْقِ أَحْيِنِي مَا عَلِمْتَ الْحَيَاةَ خَيْرًا لِي وَتوفَّنِي إِذَا عَلِمْتَ الْوَفَاةَ خَيْرًا لِي...» (الدعاء بطوله).",
                        "phonetic": "Allāhumma bi-'ilmika al-ghayba wa qudratika 'alā al-khalqi aḥyinī mā 'alimta al-ḥayāta khayran lī...",
                        "translation": "Ô Allah, par Ta connaissance de l'invisible et Ton pouvoir sur la création, fais-moi vivre tant que la vie est un bien pour moi et fais-moi mourir si la mort est un bien pour moi...",
                        "count": 1,
                        "source": "النسائي 4/54، أحمد 4/364"
                    },
                    {
                        "id": 80,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ يَا اللهُ بِأَنَّكَ الْوَاحِدُ الْأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ أَنْ تَغْفِرَ لِي ذُنُوبِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ».",
                        "phonetic": "Allāhumma innī as'aluka yā Allāhu bi-annaka al-Wāḥidu al-Aḥadu aṣ-Ṣamadu alladhī lam yalid wa lam yūlad wa lam yakun lahu kufuwan aḥadun an taghfira lī dhunūbī innaka Anta al-Ghafūru ar-Raḥīm.",
                        "translation": "Ô Allah, je Te demande, ô Allah, car Tu es l'Unique, le Seul à être imploré pour ce que l'on désire, qui n'a jamais engendré et n'a pas été engendré, et que nul n'égale, de me pardonner mes péchés, car Tu es certes le Pardonneur, le Très-Miséricordieux.",
                        "count": 1,
                        "source": "النسائي 3/52، أحمد 4/338"
                    },
                    {
                        "id": 81,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدُ، لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، الْمَنَّانُ، يَا بَدِيعَ السَّمَاوَاتِ وَالْأَرْضِ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا حَيُّ يَا قَيُّومُ إِنَِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ».",
                        "phonetic": "Allāhumma innī as'aluka bi-anna laka al-ḥamdu, lā ilāha illā Anta waḥdaka lā sharīka laka, al-Mannānu, yā Badī'a as-samāwāti wal-arḍi yā Dha-l-jalāli wal-ikrām, yā Ḥayyu yā Qayyūmu innī as'aluka al-jannata wa a'ūdhu bika mina an-nār.",
                        "translation": "Ô Allah, je Te demande, car à Toi appartient la louange, il n'y a de divinité digne d'adoration que Toi Seul, sans associé, le Grand Bienfaiteur, Créateur des cieux et de la terre, ô Détenteur de la majesté et de la générosité, ô Vivant, ô Celui qui subsiste par Lui-même, je Te demande le Paradis et je cherche protection auprès de Toi contre l'Enfer.",
                        "count": 1,
                        "source": "رواه أهل السنن، صحيح ابن ماجه 2/329"
                    },
                    {
                        "id": 82,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللهُ لَا إِلَهَ إِلَّا أَنْتَ، الْأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ».",
                        "phonetic": "Allāhumma innī as'aluka bi-annī ash-hadu annaka Anta Allāhu lā ilāha illā Anta, al-Aḥadu aṣ-Ṣamadu alladhī lam yalid wa lam yūlad wa lam yakun lahu kufuwan aḥad.",
                        "translation": "Ô Allah, je Te demande par le fait que j'atteste que Tu es Allah, nulle divinité n'est digne d'adoration sauf Toi, l'Unique, le Seul à être imploré, qui n'a jamais engendré et n'a pas été engendré, et auquel nul n'est égal.",
                        "count": 1,
                        "source": "أبو داود 2/62، الترمذي 5/515"
                    }
                ]
            },
            {
                "id": "chap_25",
                "title": "À la fin de la prière",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 83,
                        "arabic": "«أَسْتَغْفِرُ اللهَ (ثَلَاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ».",
                        "phonetic": "Astaghfiru Allāh (3x). Allāhumma Anta as-Salāmu wa minka as-salāmu, tabārakta yā Dha-l-jalāli wal-ikrām.",
                        "translation": "Je demande pardon à Allah (3 fois). Ô Allah, Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.",
                        "count": 1,
                        "source": "مسلم 1/ 414"
                    },
                    {
                        "id": 84,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ».",
                        "phonetic": "Lā ilāha illā Allāhu waḥdahu lā sharīka lahu, lahu al-mulku wa lahu al-ḥamdu wa Huwa 'alā kulli shay'in qadīr. Allāhumma lā māni'a limā a'ṭayta, wa lā mu'ṭiya limā mana'ta, wa lā yanfa'u dha-l-jaddi minka al-jaddu.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, Seul et sans associé. À Lui la royauté et la louange, et Il est Capable de toute chose. Ô Allah, nul ne peut retenir ce que Tu as donné, et nul ne peut donner ce que Tu as retenu. Et la fortune du riche ne lui sert à rien contre Toi.",
                        "count": 1,
                        "source": "البخاري 1/ 255، مسلم 1/ 414"
                    },
                    {
                        "id": 85,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ، لَا إِلَهَ إِلَّا اللهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَهَ إِلَّا اللهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ».",
                        "phonetic": "Lā ilāha illā Allāhu waḥdahu lā sharīka lahu... Lā ḥawla wa lā quwwata illā bi-Llāhi... mukhliṣīna lahu ad-dīna wa law kariha al-kāfirūn.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, Seul et sans associé. À Lui la royauté et la louange, et Il est Capable de toute chose. Il n'y a de force ni de puissance que par Allah. Nulle divinité sauf Allah, et nous n'adorons que Lui. À Lui les bienfaits, la grâce et les plus beaux éloges. Nulle divinité sauf Allah, Lui vouant un culte exclusif malgré l'aversion des mécréants.",
                        "count": 1,
                        "source": "مسلم 1/ 415"
                    },
                    {
                        "id": 86,
                        "arabic": "«سُبْحَانَ اللهِ (33)، وَالْحَمْدُ للهِ (33)، وَاللهُ أَكْبَرُ (33)، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ».",
                        "phonetic": "Subḥāna Allāh, wal-ḥamdu lillāh, wa Allāhu akbar (33x). Lā ilāha illā Allāhu waḥdahu lā sharīka lahu...",
                        "translation": "Gloire à Allah (33 fois), Louange à Allah (33 fois), Allah est le plus Grand (33 fois). Il n'y a de divinité digne d'adoration qu'Allah, Seul et sans associé. À Lui la royauté et la louange, et Il est Capable de toute chose.",
                        "count": 1,
                        "source": "مسلم 1/ 418"
                    },
                    {
                        "id": 87,
                        "arabic": "«قُلْ هُوَ اللهُ أَحَدٌ...»، «قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...»، «قُلْ أَعُوذُ بِرَبِّ النَّاسِ...» (مرة بعد كل صلاة، و3 بعد الفجر والمغرب).",
                        "phonetic": "Qul Huwa Allāhu Aḥad... Qul a'ūdhu bi-Rabbi al-Falaq... Qul a'ūdhu bi-Rabbi an-Nās.",
                        "translation": "Sourates Al-Ikhlas, Al-Falaq et An-Nas (1 fois après chaque prière, 3 fois après le Fajr et le Maghrib).",
                        "count": 1,
                        "source": "أبو داود 2/ 86، النسائي 3/ 68"
                    },
                    {
                        "id": 88,
                        "arabic": "آيَةُ الْكُرْسِيِّ: «اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...» (عَقِبَ كُلِّ صَلَاةٍ).",
                        "phonetic": "Allāhu lā ilāha illā Huwa al-Ḥayyu al-Qayyūm...",
                        "translation": "Le Verset du Trône (Ayat al-Kursi) après chaque prière.",
                        "count": 1,
                        "source": "النسائي في عمل اليوم والليلة رقم 100"
                    },
                    {
                        "id": 89,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ» (10 مَرَّاتٍ بَعْدَ الْمَغْرِبِ وَالصُّبْحِ).",
                        "phonetic": "Lā ilāha illā Allāhu waḥdahu lā sharīka lahu... yuḥyī wa yumītu wa Huwa 'alā kulli shay'in qadīr.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, Seul et sans associé. À Lui la royauté et la louange, Il donne la vie et la mort, et Il est Capable de toute chose (10 fois après le Maghrib et le Subh).",
                        "count": 1,
                        "source": "الترمذي 5/515، أحمد 4/227"
                    },
                    {
                        "id": 90,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا» (بَعْدَ صَلَاةِ الْفَجْرِ).",
                        "phonetic": "Allāhumma innī as'aluka 'ilman nāfi'an, wa rizqan ṭayyiban, wa 'amalan mutaqabbalan.",
                        "translation": "Ô Allah, je Te demande une science utile, une subsistance licite et une œuvre agréée (après la prière du Fajr).",
                        "count": 1,
                        "source": "ابن ماجه، صحيح ابن ماجه 1/ 152"
                    }
                ]
            },
            {
                "id": "chap_26",
                "title": "La prière de consultation (Al-Istikhâra)",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 91,
                        "arabic": "«اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ -وَيُسَمِّي حَاجَتَهُ- خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ».",
                        "phonetic": "Allāhumma innī astakhīruka bi-'ilmika, wa astaqdiruka bi-qudratika, wa as'aluka min faḍlika al-'aẓīm... Allāhumma in kunta ta'lamu anna hādhā al-amra khayrun lī... faqdurhu lī wa yassirhu lī... wa in kunta ta'lamu anna hādhā al-amra sharrun lī... fa-ṣrifhu 'annī wa-ṣrifnī 'anhu.",
                        "translation": "Ô Allah, je Te demande de me guider dans mon choix par Ta science, je Te demande de m'en donner la capacité par Ta puissance et je Te demande de Ta grâce immense. Car Tu es Capable et je ne le suis pas, Tu sais et je ne sais pas, et Tu es le Connaisseur de l'invisible. Ô Allah, si Tu sais que cette affaire [citer l'affaire] est un bien pour moi dans ma religion, ma vie et mon avenir, alors décrète-la moi, facilite-la moi et bénis-la moi. Mais si Tu sais que cette affaire est un mal pour moi dans ma religion, ma vie et mon avenir, alors écarte-la de moi, écarte-moi d'elle, et décrète-moi le bien là où il se trouve, puis rends-m'en satisfait.",
                        "count": 1,
                        "source": "البخاري 7/ 162"
                    },
                    {
                        "id": 92,
                        "arabic": "﴿وَشَاوِرْهُمْ فِي الأَمْرِ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللّهِ﴾.",
                        "phonetic": "Wa shāwirhum fī al-amri fa-idhā 'azamta fa-tawakkal 'alā Allāh.",
                        "translation": "« Et consulte-les à propos de l'affaire. Puis une fois que tu t'es décidé, confie-toi donc à Allah. »",
                        "count": 1,
                        "source": "سورة آل عمران، آية 159"
                    }
                ]
            },
            {
                "id": "chap_32",
                "title": "Qunut lors de la prière du Witr",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 130,
                        "arabic": "«اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، إِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، [وَلَا يَعِزُّ مَنْ عَادَيْتَ]، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ».",
                        "phonetic": "Allāhumma ihdinī fīman hadayt, wa 'āfinī fīman 'āfayt, wa tawallanī fīman tawallayt, wa bārik lī fīmā a'ṭayt, wa qinī sharra mā qaḍayt, fa-innaka taqḍī wa lā yuqḍā 'alayk, innahu lā yadhillu man wālayt, [wa lā ya'izzu man 'ādayt], tabārakta Rabbanā wa ta'ālayt.",
                        "translation": "Ô Allah, guide-moi parmi ceux que Tu as guidés, préserve-moi parmi ceux que Tu as préservés, prends-moi en charge parmi ceux que Tu as pris en charge, bénis ce que Tu m'as donné et épargne-moi le mal que Tu as décrété. Car c'est Toi qui décides et nul ne décide pour Toi. Celui que Tu prends sous Ta protection ne sera jamais humilié [et celui que Tu prends comme ennemi ne sera jamais honoré]. Tu es béni, ô notre Seigneur, et exalté.",
                        "count": 1,
                        "source": "أبو داود، والترمذي، وابن ماجه"
                    },
                    {
                        "id": 131,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مِنْ عُقُوبَتِكَ، وَأَعُوذُ بِكَ مِنْكَ، لَا أُحْصِي ثَنَاءً عَلَيْكَ، أَنْتَ كَمَا أَثْنَيْتَ عَلَى نَفْسِكَ».",
                        "phonetic": "Allāhumma innī a'ūdhu bi-riḍāka min sakhaṭik, wa bi-mu'āfātika min 'uqūbatik, wa a'ūdhu bika minka, lā uḥṣī thanā'an 'alayk, Anta kamā athnayta 'alā nafsik.",
                        "translation": "Ô Allah, je cherche protection auprès de Ta satisfaction contre Ta colère, auprès de Ton pardon contre Ton châtiment, et je cherche protection auprès de Toi contre Toi-même. Je ne saurais Te louer autant que Tu l'as fait pour Toi-même.",
                        "count": 1,
                        "source": "أخرجه أصحاب السنن الأربعة وأحمد"
                    },
                    {
                        "id": 132,
                        "arabic": "«اللَّهُمَّ إِيَّاكَ نَعْبُدُ، وَلَكَ نُصَلِّي وَنَسْجُدُ، وَإِلَيْكَ نَسْعَى وَنَحْفِدُ، نَرْجُو رَحْمَتَكَ، وَنَخْشَى عَذَابَكَ، إِنَّ عَذَابَكَ بِالْكَافِرِينَ مُلْحَقٌ. اللَّهُمَّ إِنَّا نَسْتَعِينُكَ، وَنَسْتَغْفِرُكَ، وَنُثْنِي عَلَيْكَ الْخَيْرَ، وَلَا نَكْفُرُكَ، وَنُؤْمِنُ بِكَ وَنَخْضَعُ لَكَ، وَنَخْلَعُ مَنْ يَكْفُرُكَ».",
                        "phonetic": "Allāhumma iyyāka na'budu, wa laka nuṣallī wa nasjudu, wa ilayka nas'ā wa naḥfidu, narjū raḥmataka wa nakhshā 'adhābaka...",
                        "translation": "Ô Allah, c'est Toi que nous adorons, pour Toi que nous prions et nous nous prosternons, vers Toi que nous accourons et que nous nous empressons de servir. Nous espérons Ta miséricorde et nous craignons Ton châtiment, car Ton châtiment atteindra sûrement les mécréants. Ô Allah, nous implorons Ton aide et Ton pardon, nous T'adressons les meilleurs éloges, nous ne sommes pas ingrats envers Toi, nous croyons en Toi, nous nous soumettons à Toi et nous nous désavouons de quiconque Te méconnaît.",
                        "count": 1,
                        "source": "البيهقي في السنن الكبرى 2/211"
                    }
                ]
            },
            {
                "id": "chap_33",
                "title": "Après la prière du Witr",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 133,
                        "arabic": "«سُبْحَانَ الْمَلِكِ الْقُدُّوسِ» (ثَلَاثَ مَرَّاتٍ، وَيَرْفَعُ صَوْتَهُ فِي الثَّالِثَةِ وَيَمُدُّ بِهَا صَوْتَهُ: رَبِّ الْمَلَائِكَةِ وَالرُّوحِ).",
                        "phonetic": "Subḥāna al-Maliki al-Quddūs (3x). Rabbi al-malā'ikati war-rūḥ.",
                        "translation": "Gloire au Souverain, le Saint (3 fois). Il élève la voix à la troisième fois [et ajoute : Seigneur des Anges et de l'Esprit].",
                        "count": 1,
                        "source": "النسائي 3/244، الدارقطني 2/31"
                    }
                ]
            },
            {
                "id": "chap_42",
                "title": "Contre les distractions durant la prière ou la lecture",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 153,
                        "arabic": "«أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ» (وَاتْفُلْ عَلَى يَسَارِكَ ثَلَاثاً).",
                        "phonetic": "A'ūdhu bi-Llāhi mina ash-shayṭāni ar-rajīm.",
                        "translation": "Je cherche protection auprès d'Allah contre le Diable banni (puis postillonne sans salive trois fois à ta gauche).",
                        "count": 1,
                        "source": "مسلم 4/1729"
                    }
                ]
            },
            {
                "id": "chap_55",
                "title": "Lors de la prière funéraire",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 171,
                        "arabic": "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ، وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوبَ الأَبْيَضَ مِنَ الدَّنَسِ، وَأَبْدِلْهُ دَاراً خَيْراً مِنْ دَارِهِ، وَأَهْلاً خَيْراً مِنْ أَهْلِهِ، وَزَوْجاً خَيْراً مِنْ زَوْجِهِ، وَأَدْخِلْهُ الْجَنَّةَ، وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ وَعَذَابِ النَّارِ",
                        "phonetic": "Allāhumma-ghfir lahu wa-rḥamhu, wa 'āfihi, wa-'fu 'anhu, wa akrim nuzulahu, wa wassi' mudkhalahu, wa-ghsilhu bi-l-mā'i wa-th-thalji wa-l-baradi, wa naqqihi mina-l-khaṭāyā kamā naqqayta-th-thawba-l-abyaḍa mina-d-danasi, wa abdilhu dāran khayran min dārih, wa ahlan khayran min ahlih, wa zawjan khayran min zawjih, wa adkhilhu-l-jannata, wa a'idhu min 'adhābi-l-qabri wa 'adhābi-n-nār.",
                        "translation": "Ô Allah, pardonne-lui et fais-lui miséricorde. Préserve-le et fais-lui grâce. Accueille-le dignement et élargis sa tombe. Lave-le avec l'eau, la neige et la grêle. Purifie-le de ses péchés comme on nettoie un vêtement blanc de sa saleté. Accorde-lui en échange une demeure meilleure que la sienne, une famille meilleure que la sienne et une épouse meilleure que la sienne. Admets-le au Paradis et protège-le du châtiment de la tombe et du châtiment du Feu.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 172,
                        "arabic": "اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا، وَشَاهِدِنَا وَغَائِبِنَا، وَصَغِيرِنَا وَكَبِيرِنَا، وَذَكَرِنَا وَأُنْثَانَا. اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ، وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ. اللَّهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تُضِلَّنَا بَعْدَهُ",
                        "phonetic": "Allāhumma-ghfir li-ḥayyinā wa mayyitinā, wa shāhidinā wa ghā'ibinā, wa ṣaghīrinā wa kabīrinā, wa dhakarinā wa unthānā. Allāhumma man aḥyaytahu minnā fa-aḥyihi 'alā-l-islām, wa man tawaffaytahu minnā fa-tawaffahu 'alā-l-īmān. Allāhumma lā taḥrimnā ajrahu wa lā tuḍillanā ba'dah.",
                        "translation": "Ô Allah, pardonne à nos vivants et à nos morts, à ceux qui sont présents et à ceux qui sont absents, à nos jeunes et à nos vieillards, ainsi qu'à nos hommes et à nos femmes. Ô Allah, celui d'entre nous que Tu maintiens en vie, fais-le vivre dans l'Islam, et celui d'entre nous que Tu fais mourir, fais-le mourir dans la foi. Ô Allah, ne nous prive pas de sa récompense et ne nous égare pas après lui.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 173,
                        "arabic": "اللَّهُمَّ إِنَّ فُلَانَ بْنَ فُلَانٍ فِي ذِمَّتِكَ، وَحَبْلِ جِوَارِكَ، فَقِهِ مِنْ فِتْنَةِ الْقَبْرِ وَعَذَابِ النَّارِ، وَأَنْتَ أَهْلُ الْوَفَاءِ وَالْحَقِّ. فَاغْفِرْ لَهُ وَارْحَمْهُ إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
                        "phonetic": "Allāhumma inna [fulān bna fulān] fī dhimmatik, wa ḥabli jiwārik, fa-qihi min fitnati-l-qabri wa 'adhābi-n-nār, wa Anta ahlu-l-wafā'i wa-l-ḥaqq. Fa-ghfir lahu wa-rḥamhu innaka Anta-l-Ghafūru-r-Raḥīm.",
                        "translation": "Ô Allah, [un tel fils d'un tel] est sous Ta protection et placé sous Ton pacte de bon voisinage. Préserve-le donc de l'épreuve de la tombe et du châtiment du Feu. Tu es digne de loyauté et de vérité. Pardonne-lui donc et fais-lui miséricorde, car Tu es certes le Pardonneur, le Très Miséricordieux.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 174,
                        "arabic": "اللَّهُمَّ عَبْدُكَ وَابْنُ عَبْدِكَ وَابْنُ أَمَتِكَ احْتَاجَ إِلَى رَحْمَتِكَ، وَأَنْتَ غَنِيٌّ عَنْ عَذَابِهِ، إِنْ كَانَ مُحْسِناً فَزِدْ فِي حَسَنَاتِهِ، وَإِنْ كَانَ مُسِيئاً فَتَجَاوَزْ عَنْهُ",
                        "phonetic": "Allāhumma 'abduka wa-bnu 'abdika wa-bnu amatik-aḥtāja ilā raḥmatik, wa Anta ghaniyyun 'an 'adhābih, in kāna muḥsinan fa-zid fī ḥasanātih, wa in kāna musī'an fa-tajāwaz 'anh.",
                        "translation": "Ô Allah, Ton serviteur, fils de Ton serviteur et fils de Ta servante a besoin de Ta miséricorde, alors que Tu peux Te passer de son châtiment. S'il était bienfaisant, augmente ses bonnes actions, et s'il était fautif, alors passe outre ses péchés.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_56",
                "title": "Prière funéraire pour le mort-né ou prématuré",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 175,
                        "arabic": "اللَّهُمَّ أَعِذْهُ مِنْ عَذَابِ الْقَبْرِ",
                        "phonetic": "Allāhumma a'idhu min 'adhābi-l-qabr.",
                        "translation": "Ô Allah, protège-le du châtiment de la tombe.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 176,
                        "arabic": "اللَّهُمَّ اجْعَلْهُ فَرَطاً وَذُخْراً لِوَالِدَيْهِ، وَشَفِيعاً مُجَاباً. اللَّهُمَّ ثَقِّلْ بِهِ مَوَازِينَهُمَا وَأَعْظِمْ بِهِ أُجُورَهُمَا، وَأَلْحِقْهُ بِصَالِحِ الْمُؤْمِنِينَ، وَاجْعَلْهُ فِي كَفَالَةِ إِبْرَاهِيمَ، وَقِهِ بِرَحْمَتِكَ عَذَابَ الْجَحِيمِ، وَأَبْدِلْهُ دَاراً خَيْراً مِنْ دَارِهِ، وَأَهْلاً خَيْراً مِنْ أَهْلِهِ، اللَّهُمَّ اغْفِرْ لِأَسْلَافِنَا، وَأَفْرَاطِنَا، وَمَنْ سَبَقَنَا بِالْإِيمَانِ",
                        "phonetic": "Allāhumma-j'alhu faraṭan wa dhukhran li-wālidayh, wa shafī'an mujāban. Allāhumma thaqqil bihi mawāzīnahumā wa a'ẓim bihi ujūrahumā, wa al-ḥiqhu bi-ṣāliḥi-l-mu'minīn, wa-j'alhu fī kafālati Ibrāhīm, wa qihi bi-raḥmatika 'adhāba-l-jaḥīm, wa abdilhu dāran khayran min dārih, wa ahlan khayran min ahlih. Allāhumma-ghfir li-aslāfinā, wa afrāṭinā, wa man sabaqanā bi-l-īmān.",
                        "translation": "Ô Allah, fais de lui un prédécesseur, un trésor pour ses parents et un intercesseur exaucé. Ô Allah, alourdis par lui la balance de leurs bonnes actions et augmente leurs récompenses. Joins-le aux pieux croyants et place-le sous la garde d'Ibrahim. Préserve-le, par Ta miséricorde, du châtiment de l'Enfer. Accorde-lui une demeure meilleure que la sienne et une famille meilleure que la sienne. Ô Allah, pardonne à nos ancêtres, à nos prédécesseurs et à ceux qui nous ont précédés dans la foi.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 177,
                        "arabic": "اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطاً، وَسَلَفاً وَأَجْراً",
                        "phonetic": "Allāhumma-j'alhu lanā faraṭan, wa salafan wa ajran.",
                        "translation": "Ô Allah, fais de lui pour nous un prédécesseur, un devancier et une source de récompense.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_107",
                "title": "Mérite des salutations sur le Prophète",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 235,
                        "arabic": "«مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللهُ بِهَا عَلَيْهِ عَشْراً».",
                        "phonetic": "Man ṣallā 'alayya ṣalātan ṣallā Llāhu bihā 'alayhi 'ashrā.",
                        "translation": "« Quiconque prie sur moi une fois, Allah priera sur lui dix fois en retour. »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 236,
                        "arabic": "«لَا تَجْعَلُوا قَبْرِي عِيداً، وَصَلُّوا عَلَيَّ؛ فَإِنَّ صَلَاتَكُمْ تَبْلُغُنِي حَيْثُ كُنْتُمْ».",
                        "phonetic": "Lā taj'alū qabrī 'īdan, wa ṣallū 'alayya; fa-inna ṣalātakum tablughunī ḥaythu kuntum.",
                        "translation": "« Ne faites pas de ma tombe un lieu de fête, et priez sur moi, car vos prières me parviennent où que vous soyez. »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 237,
                        "arabic": "«الْبَخِيلُ مَنْ ذُكِرْتُ عِنْدَهُ فَلَمْ يُصَلِّ عَلَيَّ».",
                        "phonetic": "Al-bakhīlu man dhukirtu 'indahu falam yuṣalli 'alayya.",
                        "translation": "« L'avare est celui auprès de qui je suis mentionné et qui ne prie pas sur moi. »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 238,
                        "arabic": "«إِنَّ للهِ مَلَائِكَةً سَيَّاحِينَ فِي الْأَرْضِ يُبَلِّغُونِي مِنْ أُمَّتِي السَّلَامَ».",
                        "phonetic": "Inna li-Llāhi malā'ikatan sayyāḥīna fī-l-arḍi yuballighūnī min ummatī-s-salām.",
                        "translation": "« Allah a des anges qui parcourent la terre pour me transmettre le salut de ma communauté. »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 239,
                        "arabic": "«مَا مِنْ أَحَدٍ يُسَلِّمُ عَلَيَّ إِلَّا رَدَّ اللهُ عَلَيَّ رُوحِي حَتَّى أَرُدَّ عَلَيْهِ السَّلَامَ».",
                        "phonetic": "Mā min aḥadin yusallimu 'alayya illā radda Llāhu 'alayya rūḥī ḥattā arudda 'alayhi-s-salām.",
                        "translation": "« Il n'est pas une personne qui me salue sans qu'Allah ne me rende mon âme pour que je lui rende son salut. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_108",
                "title": "Les salutations",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#4CAF50",
                "duas": [
                    {
                        "id": 240,
                        "arabic": "«لَا تَدْخُلُوا الْجَنَّةَ حَتَّى تُؤْمِنُوا، وَلَا تُؤْمِنُوا حَتَّى تَحَابُّوا، أَوَلَا أَدُلُّكُمْ عَلَى شَيْءٍ إِذَا فَعَلْتُمُوهُ تَحَابَبْتُمْ؟ أَفْشُوا السَّلَامَ بَيْنَكُمْ».",
                        "phonetic": "Lā tadkhulū-l-jannata ḥattā tu'minū, wa lā tu'minū ḥattā taḥābbū. A-lā adullukum 'alā shay'in idhā fa'altumūhu taḥābabtum? Afshū-s-salāma baynakum.",
                        "translation": "« Vous n'entrerez pas au Paradis tant que vous ne croirez pas, et vous ne croirez pas tant que vous ne vous aimerez pas. Ne vous indiquerai-je pas une chose qui, si vous la faites, vous fera vous aimer ? Saluez-vous les uns les autres (répandez le Salam). »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 241,
                        "arabic": "«ثَلَاثٌ مَنْ جَمَعَهُنَّ فَقَدْ جَمَعَ الْإِيمَانَ: الْإِنْصَافُ مِنْ نَفْسِكَ، وَبَذْلُ السَّلَامِ لِلْعَالَمِ، وَالْإِنْفَاقُ مِنَ الْإِقْتَارِ».",
                        "phonetic": "Thalāthun man jama'ahunna faqad jama'a-l-īmān: al-inṣāfu min nafsik, wa badhlu-s-salāmi li-l-'ālam, wal-infāqu mina-l-iqtār.",
                        "translation": "« Trois choses, celui qui les réunit possède la foi complète : l'équité envers soi-même, saluer tout le monde, et dépenser malgré la pauvreté. »",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 242,
                        "arabic": "عَنْ عَبْدِ اللهِ بْنِ عُمَرَ: أَنَّ رَجُلاً سَأَلَ النَّبِيَّ ﷺ: أَيُّ الْإِسْلَامِ خَيْرٌ؟ قَالَ: «تُطْعِمُ الطَّعَامَ، وَتَقْرَأُ السَّلَامَ عَلَى مَنْ عَرَفْتَ وَمَنْ لَمْ تَعْرِفْ».",
                        "phonetic": "An 'Abdi Llāhi bni 'Umar: anna rajulan sa'ala-n-Nabiyya: ayyu-l-islāmi khayrun? Qāla: Tuṭ'imu-ṭ-ṭa'āma, wa taqra'u-s-salāma 'alā man 'arafta wa man lam ta'rif.",
                        "translation": "Un homme demanda au Prophète ﷺ : « Quel aspect de l'Islam est le meilleur ? » Il répondit : « Offrir à manger, et saluer ceux que tu connais et ceux que tu ne connais pas. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            }
        ]
    },
    {
        "id": "protection",
        "name": "Protection",
        "nameAr": "الحماية والرقية",
        "emoji": "🛡️",
        "color": "#FF7043",
        "chapters": [
            {
                "id": "chap_45",
                "title": "Chasser le Diable et ses insufflations",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 156,
                        "arabic": "«الِاسْتِعَاذَةُ بِاللهِ مِنْهُ».",
                        "phonetic": "Al-isti'ādhatu bi-Llāhi minhu.",
                        "translation": "Chercher la protection d'Allah contre lui (le Diable).",
                        "count": 1,
                        "source": "أبو داود 1/206، الترمذي 1/77"
                    },
                    {
                        "id": 157,
                        "arabic": "«الأَذَانُ».",
                        "phonetic": "Al-adhān.",
                        "translation": "L'appel à la prière (Adhân).",
                        "count": 1,
                        "source": "مسلم 1/291، البخاري 1/151"
                    },
                    {
                        "id": 158,
                        "arabic": "«الْأَذْكَارُ وَقِرَاءَةُ الْقُرْآنِ».",
                        "phonetic": "Al-adhkāru wa qirā'atu al-Qur'ān.",
                        "translation": "Les évocations (Adhkâr) et la lecture du Coran (notamment la sourate Al-Baqara).",
                        "count": 1,
                        "source": "مسلم 1/539"
                    }
                ]
            },
            {
                "id": "chap_48",
                "title": "Protection pour les enfants",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 161,
                        "arabic": "«أُعِيذُكُمَا بِكَلِمَاتِ اللهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ».",
                        "phonetic": "U'īdhukumā bi-kalimāti Llāhi at-tāmmati, min kulli shayṭānin wa hāmmatin, wa min kulli 'aynin lāmmah.",
                        "translation": "Je cherche pour vous protection auprès des paroles parfaites d'Allah contre tout démon, tout animal venimeux et contre tout mauvais œil.",
                        "count": 1,
                        "source": "البخاري 4/119"
                    }
                ]
            },
            {
                "id": "chap_82",
                "title": "Contre la colère",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 210,
                        "arabic": "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
                        "phonetic": "A'ūdhu bi-Llāhi mina-sh-shayṭāni-r-rajīm.",
                        "translation": "Je cherche protection auprès d'Allah contre le Diable banni.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_111",
                "title": "Lors des aboiements de chiens la nuit",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 245,
                        "arabic": "«إِذَا سَمِعْتُمْ نُبَاحَ الْكِلَابِ وَنَهِيقَ الْحَمِيرِ بِاللَّيْلِ فَتَعَوَّذُوا بِاللهِ مِنْهُنَّ؛ فَإِنَّهُنَّ يَرَيْنَ مَا لَا تَرَوْنَ».",
                        "phonetic": "Idhā sami'tum nubāḥa-l-kilābi wa nahīqa-l-ḥamīri bi-l-layli fa-ta'awwadhū bi-Llāhi minhunna fa-innahunna yarayna mā lā tarawn.",
                        "translation": "« Si vous entendez les aboiements des chiens et les braiments des ânes la nuit, cherchez protection auprès d'Allah contre eux car ils voient ce que vous ne voyez pas. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_125",
                "title": "Contre le risque de porter le mauvais œil",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 258,
                        "arabic": "«إِذَا رَأَى أَحَدُكُمْ مِنْ أَخِيهِ، أَوْ مِنْ نَفْسِهِ، أَوْ مِنْ مَالِهِ مَا يُعْجِبُهُ فَلْيَدْعُ لَهُ بِالْبَرَكَةِ فَإِنَّ الْعَيْنَ حَقٌّ».",
                        "phonetic": "Idhā ra'ā aḥadukum min akhīhi, aw min nafsihi, aw min mālihi mā yu'jibuhu fal-yad'u lahu bi-l-barakati fa-inna-l-'ayna ḥaqq.",
                        "translation": "« Si l'un de vous voit chez son frère, chez lui-même ou dans ses biens ce qui lui plaît, qu'il invoque la bénédiction d'Allah pour lui, car le mauvais œil est une vérité. »",
                        "count": 1,
                        "source": "أحمد 4/447، صحيح الجامع 1/212"
                    }
                ]
            },
            {
                "id": "chap_128",
                "title": "Pour repousser les ruses des démons rebelles",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#FF7043",
                "duas": [
                    {
                        "id": 261,
                        "arabic": "«أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلَا فَاجِرٌ مِنْ شَرِّ مَا خَلَقَ، وَبَرَأَ وَذَرَأَ، وَمِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ، وَمِنْ شَرِّ مَا يَعْرُجُ فِيهَا، وَمِنْ شَرِّ مَا ذَرَأَ فِي الْأَرْضِ، وَمِنْ شَرِّ مَا يَخْرُجُ مِنْهَا، وَمِنْ شَرِّ فِتنِ اللَّيْلِ وَالنَّهَارِ، وَمِنْ شَرِّ كُلِّ طَارِقٍ إِلَّا طَارِقاً يَطْرُقُ بِخَيْرٍ يَا رَحْمَنُ».",
                        "phonetic": "A'ūdhu bi-kalimāti Llāhi-t-tāmmāti allatī lā yujāwizuhunna barrun wa lā fājirun min sharri mā khalaqa, wa bara'a wa dhara'a, wa min sharri mā yanzilu mina-s-samā'i, wa min sharri mā ya'ruju fīhā, wa min sharri mā dhara'a fī-l-arḍi, wa min sharri mā yakhruju minhā, wa min sharri fitani-l-layli wa-n-nahāri, wa min sharri kulli ṭāriqin illā ṭāriqan yaṭruqu bi-khayrin yā Raḥmān.",
                        "translation": "« Je cherche protection auprès des paroles parfaites d'Allah, que nul vertueux ni pervers ne peut transgresser, contre le mal de ce qu'Il a créé, conçu et multiplié, contre le mal de ce qui descend du ciel et ce qui y monte, contre le mal de ce qu'Il a multiplié sur terre et ce qui en sort, contre le mal des tentations de la nuit et du jour, et contre le mal de tout visiteur nocturne, sauf celui qui apporte le bien, ô Tout-Miséricordieux. »",
                        "count": 1,
                        "source": "أحمد 3/419، ابن السني 637"
                    }
                ]
            }
        ]
    },
    {
        "id": "meals",
        "name": "Repas & Social",
        "nameAr": "الطعام والمعاشرة",
        "emoji": "🍽️",
        "color": "#26C6DA",
        "chapters": [
            {
                "id": "chap_49",
                "title": "Visite du malade",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": []
            },
            {
                "id": "chap_50",
                "title": "Mérite de la visite d'un malade",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 164,
                        "arabic": "قَالَ صلى الله عليه وسلم : «إِذَا عَادَ الرَّجُلُ أَخَاهُ الْمُسْلِمَ مَشَى فِي خِرَافَةِ الْجَنَّةِ حَتَّى يَجْلِسَ، فَإِذَا جَلَسَ غَمَرَتْهُ الرَّحْمَةُ، فَإِنْ كَانَ غُدْوَةً صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُمْسِيَ، وَإِنْ كَانَ مَسَاءً صَلَّى عَلَيْهِ سَبْعُونَ أَلْفَ مَلَكٍ حَتَّى يُصْبِحَ».",
                        "phonetic": "Idhā 'āda ar-rajulu akhāhu al-muslima mashā fī khirāfati al-jannati ḥattā yajlisa, fa-idhā jalasa ghamarat-hu ar-raḥmatu, fa-in kāna ghudwatan ṣallā 'alayhi sab'ūna alfa malakin ḥattā yumsiya, wa-in kāna masā'an ṣallā 'alayhi sab'ūna alfa malakin ḥattā yuṣbiḥa.",
                        "translation": "Le Prophète ﷺ a dit : « Quand un homme rend visite à son frère musulman malade, il marche dans les vergers du Paradis jusqu'à ce qu'il s'assoie. Une fois assis, la miséricorde l'enveloppe. Si c'est le matin, soixante-dix mille anges prient pour lui jusqu'au soir, et si c'est le soir, soixante-dix mille anges prient pour lui jusqu'au matin. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_51",
                "title": "Du malade perdant espoir de guérir",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 165,
                        "arabic": "«اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَأَلْحِقْنِي بِالرَّفِيقِ الأَعْلَى».",
                        "phonetic": "Allāhumma-ghfir lī wa-rḥamnī wa alḥiqnī bi-r-rafīqi-l-a'lā.",
                        "translation": "Ô Allah, pardonne-moi, fais-moi miséricorde et fais-moi rejoindre le Compagnon Suprême.",
                        "count": 1,
                        "source": "البخاري 7/10، مسلم 4/1893"
                    },
                    {
                        "id": 166,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ، إِنَّ لِلْمَوْتِ لَسَكَرَاتٍ».",
                        "phonetic": "Lā ilāha illā Llāhu, inna li-l-mawti la-sakarāt.",
                        "translation": "Il n'y a de divinité qu'Allah. Certes, l'agonie de la mort comporte des tourments.",
                        "count": 1,
                        "source": "البخاري مع الفتح 8/144"
                    },
                    {
                        "id": 167,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَا إِلَهَ إِلَّا اللهُ لَهُ المُلْكُ وَلَهُ الحَمْدُ، لَا إِلَهَ إِلَّا اللهُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ».",
                        "phonetic": "Lā ilāha illā Llāhu wa Llāhu Akbar, Lā ilāha illā Llāhu waḥdah, Lā ilāha illā Llāhu waḥdahu lā sharīka lah, Lā ilāha illā Llāhu lahu-l-mulku wa lahu-l-ḥamd, Lā ilāha illā Llāhu wa lā ḥawla wa lā quwwata illā bi-Llāh.",
                        "translation": "Il n'y a de divinité qu'Allah et Allah est le plus Grand. Il n'y a de divinité qu'Allah l'Unique. Il n'y a de divinité qu'Allah l'Unique sans associé. Il n'y a de divinité qu'Allah, à Lui la royauté et la louange. Il n'y a de divinité qu'Allah, et il n'y a de force ni de puissance que par Allah.",
                        "count": 1,
                        "source": "الترمذي وابن ماجه"
                    }
                ]
            },
            {
                "id": "chap_68",
                "title": "Lors de la rupture du jeûne",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 193,
                        "arabic": "ذَهَبَ الظَّمأُ، وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللهُ",
                        "phonetic": "Dhahaba-ẓ-ẓama'u, wa-btallati-l-'urūqu wa thabata-l-ajru in shā'a Llāh.",
                        "translation": "La soif est dissipée, les veines sont abreuvées et la récompense est confirmée, si Allah le veut.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 194,
                        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي",
                        "phonetic": "Allāhumma innī as'aluka bi-raḥmatika-llatī wasi'at kulla shay'in an taghfira lī.",
                        "translation": "Ô Allah, je Te demande, par Ta miséricorde qui embrasse toute chose, de me pardonner.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_69",
                "title": "Avant de manger",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 195,
                        "arabic": "بِسْمِ اللهِ، [فَإِنْ نَسِيَ فِي أَوَّلِهِ فَلْيَقُلْ:] بِسْمِ اللهِ فِي أَوَّلِهِ وَآخِرِهِ",
                        "phonetic": "Bismi Llāh. [Bismi Llāhi fī awwalihi wa ākhirih].",
                        "translation": "Au nom d'Allah. [S'il oublie au début, qu'il dise :] Au nom d'Allah au début et à la fin.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 196,
                        "arabic": "اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْراً مِنْهُ. [وَلِلَّبَنِ:] اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
                        "phonetic": "Allāhumma bārik lanā fīhi wa aṭ'imnā khayran minh. [Allāhumma bārik lanā fīhi wa zidnā minh].",
                        "translation": "Ô Allah, bénis-le pour nous et nourris-nous d'un aliment meilleur encore. [Pour le lait :] Ô Allah, bénis-le pour nous et augmente-le-nous.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_70",
                "title": "Après avoir fini de manger",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 197,
                        "arabic": "الْحَمْدُ للهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
                        "phonetic": "Al-ḥamdu li-Llāhi alladhī aṭ'amanī hādhā, wa razaqanīhi, min ghayri ḥawlin minnī wa lā quwwah.",
                        "translation": "Louange à Allah qui m'a nourri de cela et me l'a accordé sans aucune force ni puissance de ma part.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 198,
                        "arabic": "الْحَمْدُ للهِ حَمْداً كَثِيراً طَيِّباً مُبَارَكاً فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ، وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا",
                        "phonetic": "Al-ḥamdu li-Llāhi ḥamdan kathīran ṭayyiban mubārakan fīh, ghayra makfiyyin wa lā muwadda'in, wa lā mustaghnan 'anhu Rabbanā.",
                        "translation": "Louange à Allah, une louange abondante, pure et bénie. On ne pourra jamais Le remercier assez, ni prendre congé de Lui, ni se passer de Lui, ô notre Seigneur.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_71",
                "title": "De l'invité pour son hôte",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 199,
                        "arabic": "اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ",
                        "phonetic": "Allāhumma bārik lahum fī mā razaqtahum, wa-ghfir lahum wa-rḥamhum.",
                        "translation": "Ô Allah, bénis-les dans ce que Tu leur as accordé, pardonne-leur et fais-leur miséricorde.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_73",
                "title": "En rompant le jeûne chez des hôtes",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 201,
                        "arabic": "أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ",
                        "phonetic": "Afṭara 'indakumu-ṣ-ṣā'imūn, wa akala ṭa'āmakumu-l-abrār, wa ṣallat 'alaykumu-l-malā'ikah.",
                        "translation": "Que les jeûneurs rompent leur jeûne chez vous, que les pieux mangent votre nourriture et que les Anges prient pour vous.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_74",
                "title": "Du jeûneur face au repas s'il ne rompt pas son jeûne",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 202,
                        "arabic": "«إِذَا دُعِيَ أَحَدُكُمْ فَلْيُجِبْ، فَإِنْ كَانَ صَائِماً فَلْيُصَلِّ، وَإِنْ كَانَ مُفْطِراً فَلْيَطْعَمْ» وَمَعْنَى فَلْيُصَلِّ أَيْ فَلْيَدْعُ.",
                        "phonetic": "Idhā du'iya aḥadukum fal-yujib, fa-in kāna ṣā'iman fal-yuṣalli, wa-in kāna mufṭiran fal-yaṭ'am. Wa ma'nā fal-yuṣalli ay fal-yad'u.",
                        "translation": "« Si l'un de vous est invité, qu'il réponde à l'invitation. S'il jeûne, qu'il prie (invoque en faveur de l'hôte), et s'il ne jeûne pas, qu'il mange. » Le sens de « qu'il prie » signifie ici qu'il doit invoquer.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_77",
                "title": "Quand on éternue",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 205,
                        "arabic": "إِذَا عَطَسَ أَحَدُكُم فَلْيَقُلِ الْحَمْدُ لِلَّهِ، وَلْيَقُلْ لَهُ أَخُوهُ أَوْ صَاحِبُهُ: يَرْحَمُكَ اللَّهُ، فَإِذَا قَالَ لَهُ: يَرْحَمُكَ اللَّهُ، فَلْيَقُلْ: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
                        "phonetic": "Idhā 'aṭaṣa aḥadukum fal-yaqul: Al-ḥamdu li-Llāh. Wal-yaqul lahu akhūhu aw ṣāḥibuhu: Yarḥamuka Llāh. Fa-idhā qāla lahu: Yarḥamuka Llāh, fal-yaqul: Yahdīkumu Llāhu wa yuṣliḥu bālakum.",
                        "translation": "Si l'un de vous éternue, qu'il dise : \"Louange à Allah\". Que son frère ou son compagnon lui réponde alors : \"Qu'Allah te fasse miséricorde\". Et s'il lui dit cela, qu'il réponde à son tour : \"Qu'Allah vous guide et améliore votre situation\".",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_78",
                "title": "Ce que l'on dit au non-musulman s'il éternue et loue Allah",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 206,
                        "arabic": "يَهْدِيكُمُ اللهُ وَيُصْلِحُ بَالَكُمْ",
                        "phonetic": "Yahdīkumu Llāhu wa yuṣliḥu bālakum.",
                        "translation": "Qu'Allah vous guide et améliore votre situation.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_84",
                "title": "Durant une assemblée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 212,
                        "arabic": "عَنِ ابْنِ عُمَرَ قَالَ: كَانَ يُعَدُّ لِرَسُولِ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فِي الْمَجْلِسِ الْوَاحِدِ مِائَةُ مَرَّةٍ مِنْ قَبْلِ أَنْ يَقُومَ: «رَبِّ اغْفِرْ لِي، وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الْغَفُورُ».",
                        "phonetic": "‘An Ibni ‘Umara qāla: kāna yu‘addu li-Rasūli Llāhi ṣallā Llāhu ‘alayhi wa sallama fī-l-majlisi-l-wāḥidi mi’ata marratin min qabli an yaqūma: «Rabbi-ghfir lī, wa tub ‘alayya, innaka Anta-t-Tawwābu-l-Ghafūr».",
                        "translation": "Selon Ibn 'Umar : On comptait au Messager d'Allah ﷺ, au cours d'une même assise et avant qu'il ne se lève, cent répétitions de : « Seigneur, pardonne-moi et accepte mon repentir, car Tu es certes Celui qui accepte le repentir, le Pardonneur. »",
                        "count": 1,
                        "source": "الترمذي 3/153، ابن ماجه 2/321"
                    }
                ]
            },
            {
                "id": "chap_85",
                "title": "À la fin d'une assemblée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#26C6DA",
                "duas": [
                    {
                        "id": 213,
                        "arabic": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
                        "phonetic": "Subḥānaka Allāhumma wa bi-ḥamdika, ash-hadu an lā ilāha illā Anta, astaghfiruka wa atūbu ilayk.",
                        "translation": "Gloire et louange à Toi, ô Allah. J'atteste qu'il n'y a de divinité que Toi. Je Te demande pardon et je me repens à Toi.",
                        "count": 1,
                        "source": ""
                    }
                ]
            }
        ]
    },
    {
        "id": "travel",
        "name": "Voyage",
        "nameAr": "السفر",
        "emoji": "✈️",
        "color": "#42A5F5",
        "chapters": [
            {
                "id": "chap_61",
                "title": "Du vent",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 183,
                        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا",
                        "phonetic": "Allāhumma innī as'aluka khayrahā, wa a'ūdhu bika min sharrihā.",
                        "translation": "Ô Allah, je Te demande son bien et je cherche protection auprès de Toi contre son mal (en parlant du vent).",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 184,
                        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا فِيهَا، وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فِيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ",
                        "phonetic": "Allāhumma innī as'aluka khayrahā, wa khayra mā fīhā, wa khayra mā ursilat bihi, wa a'ūdhu bika min sharrihā wa sharri mā fīhā wa sharri mā ursilat bih.",
                        "translation": "Ô Allah, je Te demande son bien, le bien de ce qu'il contient et le bien de ce qui lui a été envoyé ; et je cherche protection auprès de Toi contre son mal, le mal de ce qu'il contient et le mal de ce qui lui a été envoyé.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_62",
                "title": "Du tonnerre",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 185,
                        "arabic": "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ",
                        "phonetic": "Subḥāna alladhī yusabbiḥu-r-ra'du bi-ḥamdihi wa-l-malā'ikatu min khīfatih.",
                        "translation": "Gloire à Celui dont le tonnerre célèbre la louange, ainsi que les Anges, par crainte de Lui.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_63",
                "title": "Demande de pluie",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 186,
                        "arabic": "اللَّهُمَّ اسْقِنَا غَيْثاً مُغِيثاً مَرِيئاً مَرِيعاً نَافِعاً غَيْرَ ضَارٍّ، عَاجِلاً غَيْرَ آجِلٍ",
                        "phonetic": "Allāhumma-sqinā ghaythan mughīthan marī'an marī'an nāfi'an ghayra ḍārr, 'ājilan ghayra ājil.",
                        "translation": "Ô Allah, accorde-nous une pluie salvatrice, bienfaisante, fertile, utile et non nuisible, immédiate et non tardive.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 187,
                        "arabic": "اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا",
                        "phonetic": "Allāhumma aghithnā, Allāhumma aghithnā, Allāhumma aghithnā.",
                        "translation": "Ô Allah, secours-nous ! Ô Allah, secours-nous ! Ô Allah, secours-nous !",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 188,
                        "arabic": "اللَّهُمَّ اسْقِ عِبَادَكَ وَبَهَائِمَكَ، وَانْشُرْ رَحْمَتَكَ وَأَحْيِي بَلَدَكَ الْمَيِّتَ",
                        "phonetic": "Allāhumma-sqi 'ibādaka wa bahā'imaka, wa-nshur raḥmataka wa aḥyi baladaka-l-mayyit.",
                        "translation": "Ô Allah, abreuve Tes serviteurs et Tes bestiaux, répands Ta miséricorde et redonne vie à Ta terre morte.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_64",
                "title": "Quand la pluie tombe",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 189,
                        "arabic": "اللَّهُمَّ صَيِّباً نَافِعاً",
                        "phonetic": "Allāhumma ṣayyiban nāfi'ā.",
                        "translation": "Ô Allah, fais que ce soit une pluie bénéfique.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_65",
                "title": "Après la pluie",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 190,
                        "arabic": "مُطِرْنَا بِفَضْلِ اللهِ وَرَحْمَتِهِ",
                        "phonetic": "Muṭirnā bi-faḍli Llāhi wa raḥmatih.",
                        "translation": "Nous avons reçu la pluie par la grâce d'Allah et Sa miséricorde.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_66",
                "title": "Contre les tempêtes de pluies",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 191,
                        "arabic": "اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا، اللَّهُمَّ عَلَى الْآكَامِ وَالظِّرَابِ وَبُطُونِ الْأَوْدِيَةِ، وَمَنَابِتِ الشَّجَرِ",
                        "phonetic": "Allāhumma ḥawālaynā wa lā 'alaynā. Allāhumma 'alā-l-ākāmi wa-ẓ-ẓirābi wa buṭūni-l-awdiyati wa manābiti-sh-shajar.",
                        "translation": "Ô Allah, que la pluie tombe autour de nous et non sur nous. Ô Allah, sur les collines, les monticules, les fonds de vallées et les lieux où poussent les arbres.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_67",
                "title": "Le nouveau croissant de lune",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 192,
                        "arabic": "اللهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ رَبَّنَا وَتَرْضَى، رَبُّنَا وَرَبُّكَ اللهُ",
                        "phonetic": "Allāhu akbaru. Allāhumma ahillahu 'alaynā bi-l-amni wa-l-īmān, wa-s-salāmati wa-l-islām, wa-t-tawfīqi limā tuḥibbu Rabbanā wa tarḍā. Rabbunā wa Rabbuka Llāh.",
                        "translation": "Allah est le plus Grand. Ô Allah, fais que ce croissant se lève sur nous avec la sécurité et la foi, le salut et l'Islam, ainsi que la réussite dans ce que Tu aimes, ô notre Seigneur, et ce que Tu agrées. Notre Seigneur et ton Seigneur est Allah.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_80",
                "title": "Du marié et lors de l'acquisition d'une monture",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 208,
                        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ",
                        "phonetic": "Allāhumma innī as'aluka khayrahā wa khayra mā jabaltahā 'alayh, wa a'ūdhu bika min sharrihā wa sharri mā jabaltahā 'alayh.",
                        "translation": "Ô Allah, je Te demande son bien et le bien de la nature dont Tu l'as pourvue, et je cherche protection auprès de Toi contre son mal et le mal de la nature dont Tu l'as pourvue.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_96",
                "title": "Du voyage",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 224,
                        "arabic": "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ. (وعند الرجوع): آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ.",
                        "phonetic": "Allāhu Akbar (x3), Subḥāna-lladhī sakhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā la-munqalibūn. Allāhumma innā nas’aluka fī safarinā hādhā al-birra wa-ttaqwā, wa minal-‘amali mā tarḍā. Allāhumma hawwin ‘alaynā safaranā hādhā wa-ṭwi ‘annā bu‘dah. Allāhumma Anta-ṣ-ṣāḥibu fi-ssafar, wal-khalīfatu fil-ahl. Allāhumma innī a‘ūdhu bika min wa‘thā’i-ssafar, wa ka’ābata-l-manẓar, wa sū’i-l-munqalabi fil-māli wal-ahl. (Au retour) : Āyibūn, tā’ibūn, ‘ābidūn, li-rabbinā ḥāmidūn.",
                        "translation": "Allah est le Plus Grand (x3). Gloire à Celui qui a mis ceci à notre service alors que nous n'y étions pas capables, et c'est vers notre Seigneur que nous retournerons. Ô Allah, nous Te demandons dans ce voyage la piété, la crainte et les œuvres qui Te satisfont. Ô Allah, facilite-nous ce voyage et raccourcis-en la distance. Ô Allah, Tu es le Compagnon de voyage et le Gardien de la famille. Ô Allah, je cherche protection auprès de Toi contre les fatigues du voyage, les paysages affligeants et une issue malheureuse pour mes biens et ma famille. (Au retour) : Nous revenons, repentants, adorateurs et louant notre Seigneur.",
                        "count": 1,
                        "source": "مسلم 2/978"
                    }
                ]
            },
            {
                "id": "chap_97",
                "title": "À l'entrée d'une ville ou d'un village",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 225,
                        "arabic": "اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَما أَظْلَلْنَ، وَرَبَّ الأَرَاضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا، وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا، وَشَرِّ مَا فِيهَا",
                        "phonetic": "Allāhumma Rabba-s-samāwāti-s-sab'i wa mā aẓlaln, wa Rabba-l-arāḍīna-s-sab'i wa mā aqlaln, wa Rabba-sh-shayāṭīni wa mā aḍlaln, wa Rabba-r-riyāḥi wa mā dharayn. As'aluka khayra hādhihi-l-qaryati wa khayra ahlihā, wa khayra mā fīhā, wa a'ūdhu bika min sharrihā wa sharri ahlihā, wa sharri mā fīhā.",
                        "translation": "« Ô Allah, Seigneur des sept cieux et de ce qu'ils couvrent, Seigneur des sept terres et de ce qu'elles portent, Seigneur des diables et de ceux qu'ils égarent, Seigneur des vents et de ce qu'ils éparpillent. Je Te demande le bien de cette cité, le bien de ses habitants et le bien qu'elle contient ; et je cherche protection auprès de Toi contre son mal, le mal de ses habitants et le mal qu'elle contient. »",
                        "count": 1,
                        "source": "الحاكم 2/100، ابن السني 524"
                    }
                ]
            },
            {
                "id": "chap_98",
                "title": "À l'entrée au marché",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 226,
                        "arabic": "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                        "phonetic": "Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamd, yuḥyī wa yumīt, wa Huwa ḥayyun lā yamūt, bi-yadihi-l-khayr, wa Huwa 'alā kulli shay'in qadīr.",
                        "translation": "Il n'y a de divinité qu'Allah, l'Unique, sans associé. À Lui la royauté et à Lui la louange. Il donne la vie et donne la mort, alors qu'Il est le Vivant qui ne meurt jamais. Le bien est dans Sa main et Il est capable de toute chose.",
                        "count": 1,
                        "source": "الترمذي 5/491، الحاكم 1/538"
                    }
                ]
            },
            {
                "id": "chap_99",
                "title": "Quand la monture ou le véhicule défaille",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 227,
                        "arabic": "بِسْمِ اللهِ",
                        "phonetic": "Bismi Llāh.",
                        "translation": "Au nom d'Allah.",
                        "count": 1,
                        "source": "أبو داود 4/296"
                    }
                ]
            },
            {
                "id": "chap_100",
                "title": "Du voyageur au résident",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 228,
                        "arabic": "«أَسْتَوْدِعُكَ اللهَ الَّذِي لَا تَضِيعُ وَدَائِعُهُ».",
                        "phonetic": "Astawdi'uka Llāha alladhī lā taḍī'u wadā'i'uh.",
                        "translation": "« Je te confie à Allah, Lui dont les dépôts ne se perdent jamais. »",
                        "count": 1,
                        "source": "أحمد 2/403، ابن ماجه 2/943"
                    }
                ]
            },
            {
                "id": "chap_101",
                "title": "Du résident au voyageur",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": []
            },
            {
                "id": "chap_103",
                "title": "À l'approche de l'aube pendant le voyage",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 232,
                        "arabic": "«سَمِعَ سَامِعٌ بِحَمْدِ اللهِ وَحُسْنِ بَلَائِهِ عَلَيْنَا، رَبَّنَا صَاحِبْنَا، وَأَفْضِلْ عَلَيْنَا، عَائِذاً بِاللهِ مِنَ النَّارِ».",
                        "phonetic": "Sami'a sāmi'un bi-ḥamdi Llāhi wa ḥusni balā'ihi 'alaynā. Rabbanā ṣāḥibnā wa afḍil 'alaynā, 'ā'idhan bi-Llāhi mina-n-nār.",
                        "translation": "« Puisse un témoin témoigner que nous louons Allah pour Ses bienfaits et Ses bonnes épreuves envers nous. Ô notre Seigneur, accompagne-nous, accorde-nous Tes faveurs. Je cherche protection auprès d'Allah contre le Feu. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_104",
                "title": "Lors d'une halte (voyage ou autre)",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 233,
                        "arabic": "«أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ».",
                        "phonetic": "A'ūdhu bi-kalimāti Llāhi-t-tāmmāti min sharri mā khalaq.",
                        "translation": "« Je cherche protection auprès des paroles parfaites d'Allah contre le mal de ce qu'Il a créé. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_105",
                "title": "Lors du retour de voyage",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#42A5F5",
                "duas": [
                    {
                        "id": 234,
                        "arabic": "يُكَبِّرُ عَلَى كُلِّ شَرَفٍ ثَلَاثَ تَكْبِيرَاتٍ ثُمَّ يَقُولُ: «لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ، صَدَقَ اللهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ».",
                        "phonetic": "Allāhu Akbar (3). Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu wa Huwa 'alā kulli shay'in qadīr. Ā'ibūna, tā'ibūna, 'ābidūna, li-Rabbinā ḥāmidūn. Ṣadaqa Llāhu wa'dah, wa naṣara 'abdah, wa hazama-l-aḥzāba waḥdah.",
                        "translation": "Il dit Allahu Akbar trois fois sur chaque hauteur, puis : « Il n'y a de divinité qu'Allah, l'Unique, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose. Nous voici de retour, repentants, adorateurs et célébrant les louanges de notre Seigneur. Allah a tenu Sa promesse, secouru Son serviteur et a vaincu Seul les coalisés. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            }
        ]
    },
    {
        "id": "dhikr",
        "name": "Dhikr & Doua",
        "nameAr": "الذكر والدعاء",
        "emoji": "📿",
        "color": "#AB47BC",
        "chapters": [
            {
                "id": "chap_2",
                "title": "Lorsqu’on s’habille",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 18,
                        "arabic": "«الْحَمْدُ للهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ».",
                        "phonetic": "Al-ḥamdu lillāhi al-ladhī kasānī hadhā (ath-thawba) wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwatin.",
                        "translation": "Louange à Allah qui m'a revêtu de ce vêtement et me l'a accordé sans aucune force ni puissance de ma part.",
                        "count": 1,
                        "source": "أهل السنن"
                    }
                ]
            },
            {
                "id": "chap_5",
                "title": "En se déshabillant",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 22,
                        "arabic": "«بِسْمِ اللهِ».",
                        "phonetic": "Bismi Allāh.",
                        "translation": "Au nom d'Allah.",
                        "count": 1,
                        "source": "الترمذي 2/505، صحيح الجامع 3/203، إرواء الغليل 50"
                    }
                ]
            },
            {
                "id": "chap_17",
                "title": "À l'inclinaison.",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 50,
                        "arabic": "«سُبْحَانَ رَبِّيَ الْعَظِيمِ» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Subḥāna Rabbī al-'Aẓīm.",
                        "translation": "Gloire à mon Seigneur le Très-Grand (trois fois).",
                        "count": 1,
                        "source": "أهل السنن وأحمد، صحيح الترمذي 1/83"
                    },
                    {
                        "id": 51,
                        "arabic": "«سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ، اللَّهُمَّ اغْفِرْ لِي».",
                        "phonetic": "Subḥānaka Allāhumma Rabbanā wa bi-ḥamdika, Allāhumma aghfir lī.",
                        "translation": "Gloire et louange à Toi, ô Allah, notre Seigneur. Ô Allah, pardonne-moi.",
                        "count": 1,
                        "source": "البخاري 1/199، مسلم 1/350"
                    },
                    {
                        "id": 52,
                        "arabic": "«سُبُّوحٌ، قُدُّوسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ».",
                        "phonetic": "Subbūḥun, Quddūsun, Rabbu al-malā'ikati war-Rūḥ.",
                        "translation": "Parfait et Très-Saint, Seigneur des Anges et de l'Esprit (Gabriel).",
                        "count": 1,
                        "source": "مسلم 1/353، أبو داود 1/230"
                    },
                    {
                        "id": 53,
                        "arabic": "«اللَّهُمَّ لَكَ رَكَعْتُ، وَبِكَ آمَنْتُ، وَلَكَ أَسْلَمْتُ، خَشَعَ لَكَ سَمْعِي، وَبَصَرِي، وَمُخِّي، وَعَظْمِي، وَعَصَبِي، وَمَا اسْتَقَلَّتْ بِهِ قَدَمِي».",
                        "phonetic": "Allāhumma laka raka'tu, wa bika āmantu, wa laka aslamtu, khasha'a laka sam'ī, wa baṣarī, wa mukhkhī, wa 'aẓmī, wa 'aṣabī, wa mā istaqallat bihi qadamī.",
                        "translation": "Ô Allah, c'est pour Toi que je me prosterne, en Toi que j'ai cru et à Toi que je me suis soumis. Mon ouïe, ma vue, mon cerveau, mes os, mes nerfs et tout ce que mes pieds transportent sont humiliés devant Toi.",
                        "count": 1,
                        "source": "مسلم 1/534، والأربعة إلا ابن ماجه"
                    },
                    {
                        "id": 54,
                        "arabic": "«سُبْحَانَ ذِي الْجَبَرُوتِ، وَالْمَلَكُوتِ، وَالْكِبْرِيَاءِ، وَالْعَظَمَةِ».",
                        "phonetic": "Subḥāna dhi-l-jabarūti, wal-malakūti, wal-kibriyā'i, wal-'aẓamah.",
                        "translation": "Gloire au Possesseur de la Toute-Puissance, de la Royauté absolue, de la Grandeur et de la Majesté.",
                        "count": 1,
                        "source": "أبو داود 1/230، النسائي، أحمد"
                    }
                ]
            },
            {
                "id": "chap_18",
                "title": "En se relevant de l'inclinaison",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 55,
                        "arabic": "«سَمِعَ اللهُ لِمَنْ حَمِدَهُ».",
                        "phonetic": "Sami'a Allāhu liman ḥamidah.",
                        "translation": "Allah a entendu celui qui L'a loué.",
                        "count": 1,
                        "source": "البخاري مع الفتح 2/ 282"
                    },
                    {
                        "id": 56,
                        "arabic": "«رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ».",
                        "phonetic": "Rabbanā wa laka al-ḥamd, ḥamdan kathīran ṭayyiban mubārakan fīh.",
                        "translation": "Notre Seigneur, à Toi la louange, une louange abondante, pure et bénie.",
                        "count": 1,
                        "source": "البخاري مع الفتح 2/ 282"
                    },
                    {
                        "id": 57,
                        "arabic": "«...مِلْءَ السَّمَاوَاتِ وَمِلْءَ الْأَرْضِ وَمَا بَيْنَهُمَا، وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ. أَهْلَ الثَّنَاءِ وَالْمَجْدِ، أَحَقُّ مَا قَالَ الْعَبْدُ، وَكُلُّنَا لَكَ عَبْدٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ».",
                        "phonetic": "Mil'a as-samāwāti wa mil'a al-arḍi wa mā baynahumā, wa mil'a mā shi'ta min shay'in ba'du. Ahla ath-thanā'i wal-majdi, aḥaqqu mā qāla al-'abdu, wa kullunā laka 'abdun. Allāhumma lā māni'a limā a'ṭayta wa lā mu'ṭiya limā mana'ta wa lā yanfa'u dha-l-jaddi minka al-jaddu.",
                        "translation": "[J'implore Ta louange] autant que l'espace des cieux, de la terre et de ce qui les sépare, et autant que Tu voudras d'autre chose après cela. Ô Toi qui mérites éloges et gloire, c'est là la parole la plus véridique que puisse prononcer un serviteur, et nous sommes tous Tes serviteurs. Ô Allah, nul ne peut retenir ce que Tu as donné, et nul ne peut donner ce que Tu as retenu. Et la fortune du riche ne lui sert à rien contre Toi.",
                        "count": 1,
                        "source": "مسلم 1/ 346"
                    }
                ]
            },
            {
                "id": "chap_21",
                "title": "Prosternation de la lecture du Coran",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 67,
                        "arabic": "«سَجَدَ وَجْهِي لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ بِحَوْلِهِ وَقُوَّتِهِ، {فَتَبَارَكَ اللهُ أَحْسَنُ الْخَالِقِينَ}».",
                        "phonetic": "Sajada wajhiya lilladhī khalaqahu, wa shaqqa sam'ahu wa baṣarahu bi-ḥawlihi wa quwwatihi, {fatabāraka Allāhu aḥsanu al-khāliqīn}.",
                        "translation": "Mon visage s'est prosterné devant Celui qui l'a créé et a ouvert son ouïe et sa vue par Sa force et Sa puissance. {Béni soit donc Allah, le Meilleur des créateurs}.",
                        "count": 1,
                        "source": "الترمذي 2/474، أحمد 6/30، الحاكم 1/220"
                    },
                    {
                        "id": 68,
                        "arabic": "«اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْرًا، وَضَعْ عَنِّي بِهَا وِزْرًا، وَاجْعَلْهَا لِي عِنْدَكَ ذُخْرًا، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مِنْ عَبْدِكَ دَاوُدَ».",
                        "phonetic": "Allāhumma aktub lī bihā 'indaka ajran, wa ḍa' 'annī bihā wizran, waj'al-hā lī 'indaka dhukhran, wa taqabbal-hā minnī kamā taqabbaltahā min 'abdika Dāwūda.",
                        "translation": "Ô Allah, inscris-moi grâce à elle (cette prosternation) une récompense auprès de Toi, décharge-moi d'un péché, fais-en pour moi un trésor auprès de Toi et accepte-la de ma part comme Tu l'as acceptée de Ton serviteur David.",
                        "count": 1,
                        "source": "الترمذي 2/473، الحاكم 1/219"
                    }
                ]
            },
            {
                "id": "chap_30",
                "title": "Contre la terreur nocturne et la solitude",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 124,
                        "arabic": "«أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ».",
                        "phonetic": "A'ūdhu bi-kalimāti Llāhi at-tāmmati min ghaḍabihi wa 'iqābihi, wa sharri 'ibādihi, wa min hamazāti ash-shayāṭīni wa an yaḥḍurūn.",
                        "translation": "Je cherche protection auprès des paroles parfaites d'Allah contre Sa colère, Son châtiment, le mal de Ses serviteurs, ainsi que contre les incitations des diables et leur présence auprès de moi.",
                        "count": 1,
                        "source": "أبو داود 4/12، صحيح الترمذي 3/ 171"
                    }
                ]
            },
            {
                "id": "chap_31",
                "title": "Après un songe ou un cauchemar",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 125,
                        "arabic": "«يَنْفُثُ عَنْ يَسَارِهِ (ثَلَاثًا)».",
                        "phonetic": "Yanfuthu 'an yasārihi (thalāthan).",
                        "translation": "Postillonner (sans salive) vers sa gauche (3 fois).",
                        "count": 1,
                        "source": "مسلم 4/1772"
                    },
                    {
                        "id": 126,
                        "arabic": "«يَسْتَعِيذُ بِاللهِ مِنَ الشَّيْطَانِ وَمِنْ شَرِّ مَا رَأَى (ثَلَاثَ مَرَّاتٍ)».",
                        "phonetic": "Yasta'īdhu bi-Llāhi mina ash-shayṭāni wa min sharri mā ra'ā (thalātha marrāt).",
                        "translation": "Chercher protection auprès d'Allah contre le Diable et contre le mal de ce qu'il a vu (3 fois).",
                        "count": 1,
                        "source": "مسلم 4/1773"
                    },
                    {
                        "id": 127,
                        "arabic": "«لَا يُحَدِّثُ بِهَا أَحَدًا».",
                        "phonetic": "Lā yuḥaddithu bihā aḥadan.",
                        "translation": "N'en parler à personne.",
                        "count": 1,
                        "source": "مسلم 4/1772"
                    },
                    {
                        "id": 128,
                        "arabic": "«يَتَحَوَّلُ عَنْ جَنْبِهِ الَّذِي كَانَ عَلَيْهِ».",
                        "phonetic": "Yataḥawwalu 'an janbihi alladhī kāna 'alayhi.",
                        "translation": "Changer de côté par rapport à celui sur lequel on dormait.",
                        "count": 1,
                        "source": "مسلم 4/1773"
                    },
                    {
                        "id": 129,
                        "arabic": "«يَقُومُ يُصَلِّي إِنْ أَرَادَ ذَلِكَ».",
                        "phonetic": "Yaqūmu yuṣallī in arāda dhālika.",
                        "translation": "Se lever pour prier si on le souhaite.",
                        "count": 1,
                        "source": "مسلم 4/1773"
                    }
                ]
            },
            {
                "id": "chap_35",
                "title": "Invocation en cas d'affliction (grande détresse)",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 136,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ».",
                        "phonetic": "Lā ilāha illā Allāhu al-'Aẓīmu al-Ḥalīmu, lā ilāha illā Allāhu Rabbu al-'arshi al-'aẓīm, lā ilāha illā Allāhu Rabbu as-samāwāti wa Rabbu al-arḍi wa Rabbu al-'arshi al-karīm.",
                        "translation": "Il n'y a de divinité digne d'adoration qu'Allah, l'Immense, le Longanime. Il n'y a de divinité digne d'adoration qu'Allah, le Seigneur du Trône immense. Il n'y a de divinité digne d'adoration qu'Allah, le Seigneur des cieux, de la terre et du noble Trône.",
                        "count": 1,
                        "source": "البخاري 7/154، مسلم 4/2092"
                    },
                    {
                        "id": 137,
                        "arabic": "«اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لَا إِلَهَ إِلَّا أَنْتَ».",
                        "phonetic": "Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata 'aynin, wa aṣliḥ lī sha'nī kullahu lā ilāha illā Anta.",
                        "translation": "Ô Allah, c'est Ta miséricorde que j'espère. Ne me confie donc pas à moi-même, ne serait-ce que le temps d'un clin d'œil, et améliore ma situation dans sa totalité. Nulle divinité sauf Toi.",
                        "count": 1,
                        "source": "أبو داود 4/324، أحمد 5/42"
                    },
                    {
                        "id": 138,
                        "arabic": "«لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ».",
                        "phonetic": "Lā ilāha illā Anta subḥānaka innī kuntu mina aẓ-ẓālimīn.",
                        "translation": "Nulle divinité sauf Toi ! Pureté à Toi ! J'ai été certes du nombre des injustes.",
                        "count": 1,
                        "source": "الترمذي 5/529، الحاكم 1/505"
                    },
                    {
                        "id": 139,
                        "arabic": "«اللهُ اللهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا».",
                        "phonetic": "Allāhu Allāhu Rabbī lā ushriku bihi shay'ā.",
                        "translation": "Allah, Allah est mon Seigneur, je ne Lui associe rien.",
                        "count": 1,
                        "source": "أبو داود 2/87، صحيح ابن ماجه 2/335"
                    }
                ]
            },
            {
                "id": "chap_37",
                "title": "Pour celui qui craint l'oppression d'un dirigeant ",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 143,
                        "arabic": "«اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ، وَرَبَّ الْعَرْشِ الْعَظِيمِ، كُنْ لِي جَاراً مِنْ فُلَانِ بْنِ فُلَانٍ، وَأَحْزَابِهِ مِنْ خَلَائِقِكَ؛ أَنْ يَفْرُطَ عَلَيَّ أَحَدٌ مِنْهُمْ أَوْ يَطْغَى، عَزَّ جَارُكَ، وَجَلَّ ثَنَاؤُكَ، وَلَا إِلَهَ إِلَّا أَنْتَ».",
                        "phonetic": "Allāhumma Rabba as-samāwāti as-sab'i, wa Rabba al-'arshi al-'aẓīm, kun lī jāran min fulāni bni fulān, wa aḥzābihi min khalā'iqika...",
                        "translation": "Ô Allah, Seigneur des sept cieux et Seigneur du Trône immense. Sois pour moi un protecteur contre untel fils d'untel et ses alliés parmi Tes créatures, afin qu'aucun d'eux ne soit injuste envers moi ou ne me内 opprime. Ta protection est puissante, Ta louange est immense et il n'y a de divinité que Toi.",
                        "count": 1,
                        "source": "البخاري في الأدب المفرد رقم 707"
                    },
                    {
                        "id": 144,
                        "arabic": "«اللهُ أَكْبَرُ، اللهُ أَعَزُّ مِنْ خَلْقِهِ جَمِيعاً، اللهُ أَعَزُّ مِمَّا أَخَافُ وَأَحْذَرُ، أَعُوذُ بِاللهِ الَّذِي لَا إِلَهَ إِلَّا هُوَ، الْمُمْسِكِ السَّمَاوَاتِ السَّبْعِ أَنْ يَقَعْنَ عَلَى الْأَرْضِ إِلَّا بِإِذْنِهِ، مِنْ شَرِّ عَبْدِكَ فُلَانٍ، وَجُنُودِهِ وَأَتْبَاعِهِ وَأَشْيَاعِهِ، مِنَ الْجِنِّ وَالْإِنْسِ، اللَّهُمَّ كُنْ لِي جَاراً مِنْ شَرِّهِمْ، جَلَّ ثَنَاؤُكَ وَعَزَّ جَارُكَ، وَتَبَارَكَ اسْمُكَ، وَلَا إِلَهَ غَيْرُكَ» (ثَلَاثَ مَرَّاتٍ).",
                        "phonetic": "Allāhu Akbar, Allāhu a'azzu min khalqihi jamī'an, Allāhu a'azzu mimmā akhāfu wa aḥdharu, a'ūdhu bi-Llāhi alladhī lā ilāha illā Huwa...",
                        "translation": "Allah est le plus Grand, Allah est plus Puissant que toute Sa création, Allah est plus Puissant que ce que je crains et ce que je redoute. Je cherche protection auprès d'Allah... contre le mal de Ton serviteur untel, de ses soldats et ses partisans parmi les djinns et les hommes. Ô Allah, sois mon protecteur contre leur mal... (3 fois).",
                        "count": 1,
                        "source": "البخاري في الأدب المفرد رقم 708"
                    }
                ]
            },
            {
                "id": "chap_39",
                "title": "Quand on craint un groupe de gens",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 146,
                        "arabic": "«اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ».",
                        "phonetic": "Allāhumma-kfinīhim bimā shi'ta.",
                        "translation": "Ô Allah, protège-moi d'eux par ce que Tu voudras.",
                        "count": 1,
                        "source": "مسلم 4/2300"
                    }
                ]
            },
            {
                "id": "chap_40",
                "title": "Contre les suggestions insufflées concernant la foi",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 147,
                        "arabic": "«يَسْتَعِيذُ بِاللهِ».",
                        "phonetic": "Yasta'īdhu bi-Llāh.",
                        "translation": "Chercher protection auprès d'Allah (contre le doute).",
                        "count": 1,
                        "source": "البخاري مع الفتح 6/336"
                    },
                    {
                        "id": 148,
                        "arabic": "«يَنْتَهِي عَمَّا شَكَّ فِيهِ».",
                        "phonetic": "Yantahī 'ammā shakka fīhi.",
                        "translation": "Cesser de ressasser ce qui cause le doute.",
                        "count": 1,
                        "source": "مسلم 1/120"
                    },
                    {
                        "id": 149,
                        "arabic": "«آمَنْتُ بِاللهِ وَرُسُلِهِ».",
                        "phonetic": "Āmantu bi-Llāhi wa rusulihi.",
                        "translation": "Je crois en Allah et en Ses messagers.",
                        "count": 1,
                        "source": "مسلم 1/120"
                    },
                    {
                        "id": 150,
                        "arabic": "﴿هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ﴾.",
                        "phonetic": "Huwa al-Awwalu wal-Ākhiru waẓ-Ẓāhiru wal-Bāṭinu wa Huwa bikulli shay'in 'Alīm.",
                        "translation": "C'est Lui le Premier et le Dernier, l'Apparent et le Caché et Il est Omniscient sur toute chose.",
                        "count": 1,
                        "source": "سورة الحديد، آية 3"
                    }
                ]
            },
            {
                "id": "chap_44",
                "title": "Que doit dire et faire celui qui a commis un péché",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 155,
                        "arabic": "«مَا مِنْ عَبْدٍ يُذْنِبُ ذَنْباً فَيُحْسِنُ الطُّهُورَ، ثُمَّ يَقُومُ فَيُصَلِّي رَكْعَتَيْنِ، ثُمَّ يَسْتَغْفِرُ اللهَ إِلَّا غَفَرَ اللهُ لَهُ».",
                        "phonetic": "Mā min 'abdin yudhnibu dhanban fa-yuḥsinu aṭ-ṭuhūra, thumma yaqūmu fa-yuṣallī rak'atayni, thumma yastaghfiru Llāha illā ghafara Llāhu lahu.",
                        "translation": "Tout serviteur qui commet un péché, puis fait soigneusement ses ablutions, se lève pour accomplir deux rak'as et demande pardon à Allah, Allah lui pardonnera.",
                        "count": 1,
                        "source": "أبو داود 2/86، الترمذي 2/257"
                    }
                ]
            },
            {
                "id": "chap_46",
                "title": "face à l'imprévu ou quand on est dépassé par les événements",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 159,
                        "arabic": "«قَدَرُ اللهِ وَمَا شَاءَ فَعَلَ».",
                        "phonetic": "Qadaru Llāhi wa mā shā'a fa'ala.",
                        "translation": "C'est un décret d'Allah et Il fait ce qu'Il veut.",
                        "count": 1,
                        "source": "مسلم 4/2052"
                    }
                ]
            },
            {
                "id": "chap_47",
                "title": "Félicitations pour une naissance et leur réponse",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 160,
                        "arabic": "«بَارَكَ اللهُ لَكَ فِي المَوْهُوبِ لَكَ، وَشَكَرْتَ الوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ». وَيَرُدُّ المُهَنَّأُ: «بَارَكَ اللهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللهُ خَيْرًا، وَرَزَقَكَ اللهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ».",
                        "phonetic": "Bāraka Llāhu laka fī-l-mawhūbi lak, wa shakarta-l-Wāhib, wa balagha ashuddah, wa ruziqta birrah. Réponse : Bāraka Llāhu laka wa bāraka 'alayk, wa jazāka Llāhu khayran, wa razaqaka Llāhu mithlahu, wa ajzala thawabak.",
                        "translation": "Puisse Allah bénir ce qu'Il t'a donné, puisses-tu remercier le Donateur, qu'il (l'enfant) atteigne sa maturité et que tu sois comblé par sa piété filiale. Le félicité répond : Qu'Allah te bénisse, qu'Il déverse Sa bénédiction sur toi, qu'Il te récompense par un bien, qu'Il t'accorde la même chose et multiplie ta récompense.",
                        "count": 1,
                        "source": "الأذكار للنووي ص349"
                    }
                ]
            },
            {
                "id": "chap_52",
                "title": "L'exhortation de l'agonisant",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 168,
                        "arabic": "«مَنْ كَانَ آخِرُ كَلَامِهِ لَا إِلَهَ إِلَّا اللهُ دَخَلَ الْجَنَّةَ».",
                        "phonetic": "Man kāna ākhiru kalāmihi Lā ilāha illā Llāhu dakhala al-jannah.",
                        "translation": "Celui dont la dernière parole est « Il n'y a de divinité qu'Allah » entrera au Paradis.",
                        "count": 1,
                        "source": "أبو داود 3/190"
                    }
                ]
            },
            {
                "id": "chap_60",
                "title": "Lors de la visite du cimetière",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 182,
                        "arabic": "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ، مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللهُ بِكُمْ لَاحِقُونَ [وَيَرْحَمُ اللهُ الْمُسْتَقْدِمِينَ مِنَّا وَالْمُسْتَأْخِرِينَ] أَسْأَلُ اللهَ لَنَا وَلَكُمُ الْعَافِيَةَ",
                        "phonetic": "As-salāmu 'alaykum ahla-d-diyār, mina-l-mu'minīna wa-l-muslimīn, wa innā in shā'a Llāhu bikum lāḥiqūn. [Wa yarḥamu Llāhu-l-mustaqdimīna minnā wa-l-musta'khirīn]. As'alu Llāha lanā wa lakumu-l-'āfiyah.",
                        "translation": "Que le salut soit sur vous, habitants de ces demeures, parmi les croyants et les musulmans. Nous allons, si Allah le veut, vous rejoindre. [Qu'Allah fasse miséricorde à ceux d'entre nous qui sont partis les premiers et à ceux qui suivront]. Je demande à Allah pour nous et pour vous le salut.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_72",
                "title": "Pour solliciter de la nourriture ou de la boisson",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 200,
                        "arabic": "اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي وَأَسْقِ مَنْ سَقَانِي",
                        "phonetic": "Allāhumma aṭ'im man aṭ'amanī wa-sqi man saqānī.",
                        "translation": "Ô Allah, nourris celui qui m'a nourri et abreuve celui qui m'a abreuvé.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_75",
                "title": "Réponse du jeûneur quand on l'insulte",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 203,
                        "arabic": "إِنِّي صَائِمٌ، إِنِّي صَائِمٌ",
                        "phonetic": "Innī ṣā'im, innī ṣā'im.",
                        "translation": "Je jeûne, je jeûne.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_76",
                "title": "À la vue des premiers fruits de la saison",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 204,
                        "arabic": "اللَّهُمَّ بَارِكْ لَنَا فِي ثَمَرِنَا، وَبَارِكْ لَنَا فِي مَدِينَتِنَا، وَبَارِكْ لَنَا فِي صَاعِنَا، وَبَارِكْ لَنَا فِي مُدِّنَا",
                        "phonetic": "Allāhumma bārik lanā fī thamarinā, wa bārik lanā fī madīnatinā, wa bārik lanā fī ṣā'inā, wa bārik lanā fī muddinā.",
                        "translation": "Ô Allah, bénis-nous dans nos fruits, bénis-nous dans notre ville, bénis-nous dans notre 'Sa' (mesure) et bénis-nous dans notre 'Mudd' (mesure).",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_79",
                "title": "Pour le nouveau marié",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 207,
                        "arabic": "بَارَكَ اللهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
                        "phonetic": "Bāraka Llāhu laka, wa bāraka 'alayka, wa jama'a baynakumā fī khayr.",
                        "translation": "Qu'Allah te bénisse, qu'Il déverse Sa bénédiction sur toi et qu'Il vous unisse dans le bien.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_81",
                "title": "Avant les rapports conjugaux",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 209,
                        "arabic": "بِسْمِ اللهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ، وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا",
                        "phonetic": "Bismi Llāh. Allāhumma jannibnā-sh-shayṭān, wa jannibi-sh-shayṭāna mā razaqtanā.",
                        "translation": "Au nom d'Allah. Ô Allah, écarte de nous le Diable et écarte le Diable de ce que Tu nous accorderas.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_83",
                "title": "En voyant une personne éprouvée",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 211,
                        "arabic": "الْحَمْدُ للهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ، وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلاً",
                        "phonetic": "Al-ḥamdu li-Llāhi alladhī 'āfānī mimmā-btalāka bihi, wa faḍḍalanī 'alā kathīrin mimman khalaqa tafḍīlā.",
                        "translation": "Louange à Allah qui m'a préservé de ce dont Il t'a éprouvé et m'a grandement favorisé par rapport à beaucoup de Ses créatures.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_86",
                "title": "Pour celui qui vous dit : Qu'Allah te pardonne",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 214,
                        "arabic": "«وَلَكَ».",
                        "phonetic": "Wa laka.",
                        "translation": "et à toi aussi.",
                        "count": 1,
                        "source": "أحمد 5/28، النسائي في عمل اليوم والليلة 421"
                    }
                ]
            },
            {
                "id": "chap_87",
                "title": "Pour celui qui vous a rendu service",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 215,
                        "arabic": "جَزَاكَ اللهُ خَيْراً",
                        "phonetic": "Jazāka Llāhu khayrā.",
                        "translation": "Qu'Allah te rétribue par un bien.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_88",
                "title": "Ce par quoi Allah préserve de l'Antéchrist",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 216,
                        "arabic": "«مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ»، وَالِاسْتِعَاذَةُ بِاللَّهِ مِنْ فِتْنَتِهِ عَقِبَ التَّشَهُّدِ الْأَخِيرِ مِنْ كُلِّ صَلَاةٍ.",
                        "phonetic": "«Man ḥafiẓa ‘ashra āyātin min awwali sūrati-l-Kahfi ‘uṣima mina-d-Dajjāl», wal-isti‘ādhatu bi-Llāhi min fitnatihi ‘aqiba-t-tashahhudi-l-akhīri min kulli ṣalāh.",
                        "translation": "« Celui qui retient par cœur les dix premiers versets de la sourate La Caverne (Al-Kahf) sera préservé de l'Antéchrist (Ad-Dajjal). » Il convient également de chercher protection auprès d'Allah contre sa tentation après le dernier témoignage (Tashahhud) de chaque prière.",
                        "count": 1,
                        "source": "مسلم 1/555"
                    }
                ]
            },
            {
                "id": "chap_89",
                "title": "Pour celui qui vous dit : Je t'aime en Allah",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 217,
                        "arabic": "أَحَبَّكَ الَّذِي أَحْبَبْتَنِي لَهُ",
                        "phonetic": "Ahabbaka alladhī ahhabtani lahu.",
                        "translation": "Puisse Celui pour qui tu m'as aimé t'aimer en retour.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_90",
                "title": "Pour celui qui propose ses biens",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 218,
                        "arabic": "بَارَكَ اللهُ لَكَ فِي أَهْلِكَ وَمَالِكَ إِنَّمَا جَزَاءُ السَّلَفِ الْحَمْدُ وَالْأَدَاءُ",
                        "phonetic": "Bāraka Llāhu laka fī ahlika wa mālik, innamā jazā'u-s-salafi-l-ḥamdu wa-l-adā'.",
                        "translation": "Qu'Allah bénisse ta famille et tes biens. Certes, la récompense du prêt est la louange et le remboursement.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_91",
                "title": "Pour le prêteur lors du remboursement",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 219,
                        "arabic": "«بَارَكَ اللهُ لَكَ فِي أَهْلِكَ وَمَالِكَ، إِنَّمَا جَزَاءُ السَّلَفِ الْحَمْدُ وَالْأَدَاءُ».",
                        "phonetic": "Bāraka Llāhu laka fī ahlika wa mālik, innamā jazā'u-s-salafi-l-ḥamdu wa-l-adā'.",
                        "translation": "« Qu'Allah bénisse ta famille et tes biens. Certes, la récompense du prêt est la louange et le remboursement. »",
                        "count": 1,
                        "source": "النسائي في عمل اليوم والليلة 300، ابن ماجه 2/809"
                    }
                ]
            },
            {
                "id": "chap_92",
                "title": "",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 220,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أُشْرِكَ بِكَ وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika an ushrika bika wa anā a'lamu, wa astaghfiruka limā lā a'lam.",
                        "translation": "« Ô Allah, je cherche protection auprès de Toi contre le fait de T'associer quoi que ce soit alors que je le sais, et je Te demande pardon pour ce que j'ignore. »",
                        "count": 1,
                        "source": "أحمد 4/403، صحيح الجامع 3/233"
                    }
                ]
            },
            {
                "id": "chap_93",
                "title": "Pour celui qui vous dit : Qu'Allah te bénisse",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 221,
                        "arabic": "وَفِيكَ بَارَكَ اللهُ",
                        "phonetic": "Wa fīka bāraka Llāh.",
                        "translation": "Et que la bénédiction d'Allah soit sur toi.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_94",
                "title": "Contre la superstition (mauvais augure)",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 222,
                        "arabic": "اللَّهُمَّ لَا طَيْرَ إِلَّا طَيْرُكَ، وَلَا خَيْرَ إِلَّا خَيْرُكَ، وَلَا إِلَهَ غَيْرُكَ",
                        "phonetic": "Allāhumma lā ṭayra illā ṭayruka, wa lā khayra illā khayruka, wa lā ilāha ghayruka.",
                        "translation": "Ô Allah, il n'y a de présage que le Tien, il n'y a de bien que le Tien, et il n'y a de divinité que Toi.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_95",
                "title": "Quand on monte dans un véhicule",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 223,
                        "arabic": "بِسْمِ اللهِ، الْحَمْدُ للهِ، {سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ} الْحَمْدُ للهِ (3)، اللهُ أَكْبَرُ (3)، سُبْحَانَكَ اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
                        "phonetic": "Bismi Llāh. Al-ḥamdu li-Llāh. {Subḥāna alladhī sakhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā Rabbinā la-munqalibūn}. Al-ḥamdu li-Llāh (3), Allāhu akbar (3), subḥānaka Allāhumma innī ẓalamtu nafsī fa-ghfir lī, fa-innahu lā yaghfiru-dh-dhunūba illā Ant.",
                        "translation": "Au nom d'Allah. Louange à Allah. {Gloire à Celui qui a mis ceci à notre service alors que nous n'étions pas capables de le dominer. Et c'est vers notre Seigneur que nous retournerons}. Louange à Allah (3 fois). Allah est le plus Grand (3 fois). Gloire à Toi, ô Allah, je me suis fait du tort à moi-même, pardonne-moi donc, car nul ne pardonne les péchés à part Toi.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_102",
                "title": "Les glorifications durant le trajet",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 231,
                        "arabic": "قَالَ جَابِرٌ رَضِيَ اللهُ عَنْهُ: «كُنَّا إِذَا صَعِدْنَا كَبَّرْنَا، وَإِذَا نَزَلْنَا سَبَّحْنَا».",
                        "phonetic": "Qāla Jābirun: Kunnā idhā ṣa'idnā kabbarnā, wa idhā nazalnā sabbaḥnā.",
                        "translation": "Jabir dit : « Quand nous montions (une pente), nous disions : \"Allah est le plus Grand\" (Allāhu Akbar), et quand nous descendions, nous disions : \"Gloire à Allah\" (Subḥāna Llāh). »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_106",
                "title": "Ce que dit celui à qui arrive une chose joyeuse ou détestable",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 234,
                        "arabic": "كَانَ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ إِذَا أَتَاهُ الْأَمْرُ يَسُرُّهُ قَالَ: «الْحَمْدُ للهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ» وَإِذَا أَتَاهُ أَمْرٌ يَكْرَهُهُ قَالَ: «الْحَمْدُ للهِ عَلَى كُلِّ حَالٍ».",
                        "phonetic": "Al-ḥamdu li-Llāhi alladhī bi-ni'matihi tatimmu-ṣ-ṣāliḥāt. / Al-ḥamdu li-Llāhi 'alā kulli ḥāl.",
                        "translation": "Le Prophète ﷺ disait, face à une chose joyeuse : « Louange à Allah par la grâce de qui s'accomplissent les bonnes œuvres », et face à une chose contrariante : « Louange à Allah en toute circonstance. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_109",
                "title": "Rendre le salut au non-musulman s'il passe le salam",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 243,
                        "arabic": "«إِذَا سَلَّمَ عَلَيْكُمْ أَهْلُ الْكِتَابِ فَقُولُوا: وَعَلَيْكُمْ».",
                        "phonetic": "Idhā sallama 'alaykum ahlu-l-kitābi fa-qūlū: Wa 'alaykum.",
                        "translation": "« Si les gens du Livre vous saluent, dites : \"Et sur vous aussi\". »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_112",
                "title": "En faveur de celui que vous avez insulté",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 246,
                        "arabic": "«اللَّهُمَّ فَأَيُّمَا مُؤْمِنٍ سَبَبْتُهُ فَاجْعَلْ ذَلِكَ لَهُ قُرْبَةً إِلَيْكَ يَوْمَ الْقِيَامَةِ».",
                        "phonetic": "Allāhumma fa-ayyumā mu'minin sababtuhu fa-j'al dhālika lahu qurbatan ilayka yawma-l-qiyāmah.",
                        "translation": "« Ô Allah, tout croyant que j'ai insulté, fais que cela soit pour lui une source de rapprochement vers Toi au Jour de la Résurrection. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_113",
                "title": "Ce que dit le musulman quand il fait l'éloge d'un autre",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 247,
                        "arabic": "قَالَ النَّبِيُّ ﷺ: «إِذَا كَانَ أَحَدُكُم مَادِحاً صَاحِبَهُ لَا مَحَالَةَ فَلْيَقُلْ: أَحْسِبُ فُلَاناً وَاللَّهُ حَسِيبُهُ، وَلَا أُزَكِّي عَلَى اللهِ أَحَداً، أَحْسِبُهُ – إِنْ كَانَ يَعْلَمُ ذَاكَ – كَذَا وَكَذَا».",
                        "phonetic": "Qāla-n-Nabiyyu ﷺ: «Idhā kāna aḥadukum mādiḥan ṣāḥibahu lā maḥālata fal-yaqul: Aḥsibu fulānan wa Llāhu ḥasībuh, wa lā uzakkī ‘alā Llāhi aḥadan, aḥsibuhu in kāna ya‘lamu dhāka – kadhā wa kadhā».",
                        "translation": "Le Prophète ﷺ a dit : « Si l'un de vous doit absolument faire l'éloge de son compagnon, qu'il dise : \"Je considère un tel ainsi – et c'est Allah qui le juge, et je ne porte de jugement définitif sur personne devant Allah – je le considère comme ceci et cela\" (s'il sait cela de lui). »",
                        "count": 1,
                        "source": "مسلم 4/2296"
                    }
                ]
            },
            {
                "id": "chap_114",
                "title": "Lorsque le musulman reçoit des éloges",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 248,
                        "arabic": "«اللَّهُمَّ لَا تُؤَاخِذْنِي بِمَا يَقُولُونَ، وَاغْفِرْ لِي مَا لَا يَعْلَمُونَ، [وَاجْعَلْنِي خَيْراً مِمَّا يَظُنُّونَ]».",
                        "phonetic": "Allāhumma lā tu'ākhidhnī bi-mā yaqūlūn, wa-ghfir lī mā lā ya'lamūn, [wa-j'alnī khayran mimmā yaẓunnūn].",
                        "translation": "« Ô Allah, ne me tiens pas rigueur de ce qu'ils disent, pardonne-moi ce qu'ils ignorent [et rends-moi meilleur que ce qu'ils pensent]. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_115",
                "title": "Comment le pèlerin prononce la Talbiya au Hajj & 'Omra",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 249,
                        "arabic": "«لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ».",
                        "phonetic": "Labbayka Allāhumma labbayk, labbayka lā sharīka laka labbayk. Inna-l-ḥamda wa-n-ni'mata laka wal-mulk, lā sharīka lak.",
                        "translation": "« Me voici, ô Allah, me voici. Me voici, Tu n'as aucun associé, me voici. Certes la louange, le bienfait et la royauté T'appartiennent, Tu n'as aucun associé. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_116",
                "title": "Le Takbir en arrivant au niveau de la Pierre Noire",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 250,
                        "arabic": "«طَافَ النَّبِيُّ ﷺ بِالْبَيْتِ عَلَى بَعِيرٍ كُلَّمَا أَتَى الرُّكْنَ أَشَارَ إِلَيْهِ بِشَيْءٍ عِنْدَهُ وَكَبَّرَ».",
                        "phonetic": "Ṭāfa-n-Nabiyyu ﷺ bi-l-Bayti ‘alā ba‘īrin kullamā atā-r-rukna ashāra ilayhi bi-shay’in ‘indahu wa kabbara.",
                        "translation": "« Le Prophète ﷺ a fait les tournées rituelles autour de la Maison (la Ka'ba) sur un chameau. Chaque fois qu'il passait devant l'Angle (la Pierre Noire), il pointait vers elle un objet qu'il tenait à la main et disait : \"Allah est le plus Grand\". »",
                        "count": 1,
                        "source": "البخاري 3/476"
                    }
                ]
            },
            {
                "id": "chap_117",
                "title": "Invocation entre le Coin Yéménite et la Pierre Noire",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 251,
                        "arabic": "«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ».",
                        "phonetic": "Rabbanā ātinā fī-d-dunyā ḥasanatan wa fī-l-ākhirati ḥasanatan wa qinā 'adhāba-n-nār.",
                        "translation": "« Notre Seigneur, accorde-nous un bienfait ici-bas et un bienfait dans l'au-delà, et protège-nous du châtiment du Feu. »",
                        "count": 1,
                        "source": "أبو داود 2/179، أحمد 3/411، سورة البقرة 2:201"
                    }
                ]
            },
            {
                "id": "chap_118",
                "title": "Sur les monts As-Safa et Al-Marwa",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 252,
                        "arabic": "«إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللهِ. أَبْدَأُ بِمَا بَدَأَ اللهُ بِهِ. لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ».",
                        "phonetic": "Inna-ṣ-Ṣafā wal-Marwata min sha'ā'iri Llāh. Abda'u bi-mā bada'a Llāhu bih. Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu wa Huwa 'alā kulli shay'in qadīr. Lā ilāha illā Llāhu waḥdahu, anjaza wa'dah, wa naṣara 'abdah, wa hazama-l-aḥzāba waḥdah.",
                        "translation": "« Certes As-Safa et Al-Marwa sont parmi les rites d'Allah. Je commence par ce par quoi Allah a commencé. Il n'y a de divinité qu'Allah, l'Unique, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose. Il n'y a de divinité qu'Allah, l'Unique. Il a tenu Sa promesse, secouru Son serviteur et vaincu Seul les coalisés. »",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_119",
                "title": "Le jour de Arafat",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 253,
                        "arabic": "«خَيْرُ الدُّعَاءِ دُعَاءُ يَوْمِ عَرَفَةَ، وَخَيْرُ مَا قُلْتُ أَنَا وَالنَّبِيُّونَ مِنْ قَبْلِي: لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ».",
                        "phonetic": "Khayru-d-du‘ā’i du‘ā’u yawmi ‘Arafah, wa khayru mā qultu anā wa-n-nabiyyūna min qablī: Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa Huwa ‘alā kulli shay’in qadīr.",
                        "translation": "« La meilleure des invocations est celle du jour d'Arafa. La meilleure parole que j'ai prononcée, ainsi que les prophètes avant moi, est : Il n'y a de divinité qu'Allah, l'Unique, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose. »",
                        "count": 1,
                        "source": "الترمذي 3/184، السلسلة الصحيحة 4/6"
                    }
                ]
            },
            {
                "id": "chap_120",
                "title": "A Muzdalifah (Al-Mash'ar Al-Haram)",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 254,
                        "arabic": "رَكِبَ ﷺ الْقَصْوَاءَ حَتَّى أَتَى الْمَشْعَرَ الْحَرَامَ فَاسْتَقْبَلَ الْقِبْلَةَ (فَدَعَاهُ، وَكَبَّرَهُ، وَهَلَّلَهُ، وَوَحَّدَهُ) فَلَمْ يَزَلْ وَاقِفاً حَتَّى أَسْفَرَ جِدّاً فَدَفَعَ قَبْلَ أَنْ تَطْلُعَ الشَّمْسُ.",
                        "phonetic": "Rakiba ﷺ al-Qaṣwā'a ḥattā atā-l-Mash'ara-l-Ḥarāma fa-staqbala-l-qiblata (fa-da'āhu, wa kabbārahu, wa hallalahu, wa waḥḥadahu), falam yazal wāqifan ḥattā asfara jiddan fa-dafa'a qabla an taṭlu'a-sh-shams.",
                        "translation": "Le Prophète ﷺ monta sa chamelle Al-Qaswa jusqu'à atteindre Al-Mash'ar Al-Haram. Il fit face à la Qibla, invoqua Allah, proclama Sa grandeur, Son unicité et Sa divinité. Il resta debout jusqu'à ce que la clarté de l'aube soit bien visible, puis il partit avant le lever du soleil.",
                        "count": 1,
                        "source": "مسلم 2/891"
                    }
                ]
            },
            {
                "id": "chap_121",
                "title": "Lors du lancer des stèles à chaque caillou",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 255,
                        "arabic": "«يُكَبِّرُ كُلَّمَا رَمَى بِحَصَاةٍ عِنْدَ الْجِمَارِ الثَّلَاثِ ثُمَّ يَتَقَدَّمُ، وَيَقِفُ يَدْعُو مُسْتَقْبَلَ الْقِبْلَةِ، رَافِعاً يَدَيْهِ بَعْدَ الْجَمْرَةِ الْأُولَى وَالثَّانِيَةِ، أَمَّا جَمْرَةُ الْعَقَبَةِ فَيَرْمِيهَا وَيُكَبِّرُ عِنْدَ كُلِّ حَصَاةٍ وَيَنْصَرِفُ وَلَا يَقِفُ عِنْدَهَا».",
                        "phonetic": "Yukabbiru kullamā ramā bi-ḥaṣātin ‘inda-l-jimāri-th-thalāth, thumma yataqaddamu, wa yaqifu yad‘ū mustaqbala-l-qiblati, rāfi‘an yadayhi ba‘da-l-jamrati-l-ūlā wa-th-thāniyah. Ammā jamratu-l-‘aqabati fa-yarmīhā wa yukabbiru ‘inda kulli ḥaṣātin wa yanṣarifu wa lā yaqifu ‘indahā.",
                        "translation": "Il dit « Allahu Akbar » à chaque lancer de caillou aux trois stèles (Jamarat). Après la première et la deuxième, il s'avance, fait face à la Qibla et invoque les mains levées. Quant à la stèle d'Al-Aqaba, il lance les cailloux en disant « Allahu Akbar » à chaque fois, puis s'en va sans s'y arrêter.",
                        "count": 1,
                        "source": "البخاري مع الفتح 3/583"
                    }
                ]
            },
            {
                "id": "chap_122",
                "title": "Face à l'étonnement ou à une joyeuse nouvelle",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 256,
                        "arabic": "«سُبْحَانَ اللهِ».",
                        "phonetic": "Subḥāna Llāh.",
                        "translation": "« Gloire à Allah. »",
                        "count": 1,
                        "source": "البخاري 1/210، مسلم 4/1857"
                    },
                    {
                        "id": 257,
                        "arabic": "«اللهُ أَكْبَرُ».",
                        "phonetic": "Allāhu Akbar.",
                        "translation": "« Allah est le plus Grand. »",
                        "count": 1,
                        "source": "البخاري 8/441"
                    }
                ]
            },
            {
                "id": "chap_123",
                "title": "Celui qui reçoit une nouvelle réjouissante",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 258,
                        "arabic": "كَانَ النَّبِيُّ ﷺ إِذَا أَتَاهُ أَمْرٌ يَسُرُّهُ خَرَّ سَاجِداً شُكْراً للهِ تَبَارَكَ وَتَعَالَى.",
                        "phonetic": "Kāna-n-Nabiyyu ﷺ idhā atāhu amrun yasurruhu kharra sājidan shukran li-Llāhi Tabāraka wa Ta'ālā.",
                        "translation": "Lorsque le Prophète ﷺ recevait une nouvelle joyeuse, il se prosternait pour remercier Allah le Très-Haut.",
                        "count": 1,
                        "source": "صحيح ابن ماجه 1/233"
                    }
                ]
            },
            {
                "id": "chap_126",
                "title": "En cas de frayeur",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 259,
                        "arabic": "«لَا إِلَهَ إِلَّا اللهُ».",
                        "phonetic": "Lā ilāha illā Llāh.",
                        "translation": "« Il n'y a de divinité qu'Allah. » (À dire si l'on est effrayé ou face à une calamité).",
                        "count": 1,
                        "source": "البخاري 6/181"
                    }
                ]
            },
            {
                "id": "chap_127",
                "title": "Lors de l'abattage ou du sacrifice",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 260,
                        "arabic": "«بِسْمِ اللهِ وَاللهُ أَكْبَرُ [اللَّهُمَّ مِنْكَ وَلَكَ] اللَّهُمَّ تَقَبَّلْ مِنِّي».",
                        "phonetic": "Bismi Llāhi wa Llāhu Akbar. [Allāhumma minka wa lak]. Allāhumma taqabbal minnī.",
                        "translation": "« Au nom d'Allah, Allah est le plus Grand. [Ô Allah, ceci vient de Toi et T'est destiné]. Ô Allah, accepte de ma part. » (Lors du sacrifice).",
                        "count": 1,
                        "source": "مسلم 3/1557، البيهقي 9/287"
                    }
                ]
            },
            {
                "id": "chap_129",
                "title": "La demande de pardon et le repentir",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 262,
                        "arabic": "قَالَ رَسُولُ اللَّهِ ﷺ: «وَاللَّهِ إِنِّي لَأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً».",
                        "phonetic": "Qāla Rasūlu Llāhi ﷺ: «Wa Llāhi innī la-astaghfiru Llāha wa atūbu ilayhi fī-l-yawmi akthara min sab'īna marrah».",
                        "translation": "Le Messager d'Allah ﷺ a dit : « Par Allah, je demande pardon à Allah et je me repens à Lui plus de soixante-dix fois par jour. »",
                        "count": 1,
                        "source": "البخاري مع الفتح 11/101"
                    },
                    {
                        "id": 263,
                        "arabic": "وَقَالَ ﷺ: «يَا أَيُّهَا النَّاسُ تُوبُوا إِلَى اللهِ فَإِنِّي أَتُوبُ فِي الْيَوْمِ إِلَيْهِ مِائَةَ مَرَّةٍ».",
                        "phonetic": "Wa qāla ﷺ: «Yā ayyuhā-n-nāsu tūbū ilā Llāhi fa-innī atūbu fī-l-yawmi ilayhi mi'ata marrah».",
                        "translation": "Le Prophète ﷺ a dit : « Ô gens ! Repentez-vous à Allah, car je me repens à Lui cent fois par jour. »",
                        "count": 1,
                        "source": "رواه مسلم 4/2076"
                    },
                    {
                        "id": 264,
                        "arabic": "وَقَالَ ﷺ: «مَنْ قَالَ: أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ، غَفَرَ اللهُ لَهُ وَإِنْ كَانَ فَرَّ مِنَ الزَّحْفِ».",
                        "phonetic": "Wa qāla ﷺ: «Man qāla: Astaghfiru Llāha-l-'Aẓīma alladhī lā ilāha illā Huwa-l-Ḥayyu-l-Qayyūmu wa atūbu ilayh, ghafara Llāhu lahu wa in kāna farra mina-z-zaḥf».",
                        "translation": "Le Prophète ﷺ a dit : « Quiconque dit : \"Je demande pardon à Allah l'Immense, en dehors de qui il n'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même, et je me repens à Lui\", Allah lui pardonnera, même s'il avait fui du champ de bataille. »",
                        "count": 1,
                        "source": "أبو داود 2/85، الترمذي 5/569"
                    },
                    {
                        "id": 265,
                        "arabic": "وَقَالَ ﷺ: «أَقْرَبُ مَا يَكُونُ الرَّبُّ مِنَ الْعَبْدِ فِي جَوْفِ اللَّيْلِ الْآخِرِ، فَإِنِ اسْتَطَعْتَ أَنْ تَكُونَ مِمَّنْ يَذْكُرُ اللهَ فِي تِلْكَ السَّاعَةِ فَكُنْ».",
                        "phonetic": "Wa qāla ﷺ: «Aqrabu mā yakūnu-r-Rabbu mina-l-'abdi fī jawfi-l-layli-l-ākhiri, fa-ini-staṭa'ta an takūna mimman yadhkuru Llāha fī tilka-s-sā'ati fakun».",
                        "translation": "Le Prophète ﷺ a dit : « Le moment où le Seigneur est le plus proche de Son serviteur est au cœur de la dernière partie de la nuit. Si tu peux être de ceux qui invoquent Allah à cette heure-là, fais-le. »",
                        "count": 1,
                        "source": "الترمذي والنسائي 1/279"
                    },
                    {
                        "id": 266,
                        "arabic": "وَقَالَ ﷺ: «أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ».",
                        "phonetic": "Wa qāla ﷺ: «Aqrabu mā yakūnu-l-'abdu min Rabbihi wa huwa sājidun, fa-akthirū-d-du'ā'».",
                        "translation": "Le Prophète ﷺ a dit : « C’est en étant prosterné que le serviteur est le plus proche de son Seigneur. Redoublez donc d’invocations (dans cette position). »",
                        "count": 1,
                        "source": "مسلم 1/350"
                    },
                    {
                        "id": 267,
                        "arabic": "وَقَالَ ﷺ: «إِنَّهُ لَيُغَانُ عَلَى قَلْبِي، وَإِنِّي لَأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ».",
                        "phonetic": "Wa qāla ﷺ: «Innahu layughānu 'alā qalbī, wa innī la-astaghfiru Llāha fī-l-yawmi mi'ata marrah».",
                        "translation": "Le Prophète ﷺ a dit : « Il m'arrive d'avoir le cœur distrait, c'est pourquoi je demande pardon à Allah cent fois par jour. »",
                        "count": 1,
                        "source": "مسلم 4/2075"
                    }
                ]
            },
            {
                "id": "chap_130",
                "title": "Mérite du Tasbih, Tahmid, Tahlil et Takbir",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 268,
                        "arabic": "قَالَ ﷺ: «مَنْ قَالَ: (سُبْحَانَ اللهِ وَبِحَمْدِهِ) فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَلَوْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ».",
                        "phonetic": "Qāla ﷺ: «Man qāla: (Subḥāna Llāhi wa bi-ḥamdih) fī yawmin mi'ata marrah ḥuṭṭat khaṭāyāhu wa law kānat mithla zabadi-l-baḥr».",
                        "translation": "Le Prophète ﷺ a dit : « Quiconque dit : \"Gloire et louange à Allah\" cent fois par jour, ses péchés seront effacés, fussent-ils comme l'écume de la mer. »",
                        "count": 1,
                        "source": "البخاري 7/168، مسلم 4/2071"
                    },
                    {
                        "id": 269,
                        "arabic": "وَقَالَ ﷺ: «مَنْ قَالَ: (لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ) عَشْرَ مِرَارٍ، كَانَ كَمَنْ أَعْتَقَ أَرْبَعَةَ أَنْفُسٍ مِنْ وَلَدِ إِسْمَاعِيلَ».",
                        "phonetic": "Wa qāla ﷺ: «Man qāla: (Lā ilāha illā Llāhu waḥdahu lā sharīka lah, lahu-l-mulku wa lahu-l-ḥamdu, wa Huwa ‘alā kulli shay’in qadīr) ‘ashra mirār, kāna kaman a‘taqa arba‘ata anfusin min waladi Ismā‘īl».",
                        "translation": "Le Prophète ﷺ a dit : « Quiconque dit dix fois : \"Il n'y a de divinité qu'Allah, l'Unique, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose\", est semblable à celui qui a affranchi quatre descendants d'Ismaël. »",
                        "count": 1,
                        "source": "البخاري 7/67، مسلم 4/2071"
                    },
                    {
                        "id": 270,
                        "arabic": "وَقَالَ ﷺ: «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ».",
                        "phonetic": "Wa qāla ﷺ: «Kalimatāni khafīfatāni ‘alā-l-lisān, thaqīlatāni fī-l-mīzān, ḥabībatāni ilā-r-Raḥmān: Subḥāna Llāhi wa bi-ḥamdih, Subḥāna Llāhi-l-‘Aẓīm».",
                        "translation": "Le Prophète ﷺ a dit : « Deux paroles sont légères sur la langue, lourdes dans la balance et aimées du Tout-Miséricordieux : \"Gloire et louange à Allah\", \"Gloire à Allah l'Immense\". »",
                        "count": 1,
                        "source": "البخاري 7/167، مسلم 4/2072"
                    },
                    {
                        "id": 271,
                        "arabic": "وَقَالَ ﷺ: «لَأَنْ أَقُولَ: (سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ)، أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمْسُ».",
                        "phonetic": "Wa qāla ﷺ: «La-an aqūla: (Subḥāna Llāhi, wal-ḥamdu li-Llāhi, wa lā ilāha illā Llāhu, wa Llāhu Akbaru), aḥabbu ilayya mimmā ṭala'at 'alayhi-sh-shams».",
                        "translation": "Le Prophète ﷺ a dit : « Dire : \"Gloire à Allah, Louange à Allah, Il n'y a de divinité qu'Allah et Allah est le plus Grand\" m'est plus cher que tout ce sur quoi le soleil se lève. »",
                        "count": 1,
                        "source": "مسلم 4/2072"
                    },
                    {
                        "id": 272,
                        "arabic": "وَقَالَ ﷺ: «أَيَعْجِزُ أَحَدُكُمْ أَنْ يَكْسِبَ كُلَّ يَوْمٍ أَلْفَ حَسَنَةٍ؟» فَسَأَلَهُ سَائِلٌ مِنْ جُلَسَائِهِ: كَيْفَ يَكْسِبُ أَحَدُنَا أَلْفَ حَسَنَةٍ؟ قَالَ: «يُسَبِّحُ مِائَةَ تَسْبِيحَةٍ، فَيُكْتَبُ لَهُ أَلْفُ حَسَنَةٍ أَوْ يُحَطُّ عَنْهُ أَلْفُ خَطِيئَةٍ».",
                        "phonetic": "Wa qāla ﷺ: «A-ya'jizu aḥadukum an yaksiba kulla yawmin alfa ḥasanatin?» Fasa'alahu sā'ilun min julasā'ihi: Kayfa yaksibu aḥadunā alfa ḥasanah? Qāla: «Yusabbiḥu mi'ata tasbīḥatin, fayuktabu lahu alfu ḥasanatin aw yuḥaṭṭu 'anhu alfu khaṭī'ah».",
                        "translation": "Le Prophète ﷺ a dit : « L'un de vous serait-il capable de gagner chaque jour mille bonnes actions ? » Quelqu'un demanda : « Comment l'un de nous peut-il gagner mille bonnes actions ? » Il répondit : « En proclamant la gloire d'Allah (Subhan Allah) cent fois ; il lui sera alors inscrit mille bonnes actions ou on lui effacera mille péchés. »",
                        "count": 1,
                        "source": "مسلم 4/2073"
                    },
                    {
                        "id": 273,
                        "arabic": "«مَنْ قَالَ: (سُبْحَانَ اللهِ الْعَظِيمِ وَبِحَمْدِهِ) غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ».",
                        "phonetic": "Man qāla: (Subḥāna Llāhi-l-'Aẓīmi wa bi-ḥamdih) ghurisat lahu nakhlatun fī-l-jannah.",
                        "translation": "« Quiconque dit : \"Gloire et louange à Allah l'Immense\", un palmier lui sera planté au Paradis. »",
                        "count": 1,
                        "source": "الترمذي 5/511، الحاكم 1/501"
                    },
                    {
                        "id": 274,
                        "arabic": "وَقَالَ ﷺ: «يَا عَبْدَ اللهِ بْنَ قَيْسٍ، أَلَا أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ؟» فَقُلْتُ: بَلَى يَا رَسُولَ اللهِ، قَالَ: «قُلْ: (لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ)».",
                        "phonetic": "Wa qāla ﷺ: «Yā 'Abdallāhi bna Qaysin, alā adulluka 'alā kanzin min kunūzi-l-jannah?» Faqultu: Balā yā Rasūla Llāh, qāla: «Qul: (Lā ḥawla wa lā quwwata illā bi-Llāh)».",
                        "translation": "Le Prophète ﷺ a dit : « Ô 'Abdullah bin Qays ! Ne t'indiquerais-je pas l'un des trésors du Paradis ? » J'ai répondu : « Bien sûr, ô Messager d'Allah ! » Il dit : « Dis : \"Il n'y a de force ni de puissance que par Allah\". »",
                        "count": 1,
                        "source": "البخاري 11/213، مسلم 4/2076"
                    },
                    {
                        "id": 275,
                        "arabic": "وَقَالَ ﷺ: «أَحَبُّ الْكَلَامِ إِلَى اللهِ أَرْبَعٌ: (سُبْحَانَ اللهِ)، وَ(الْحَمْدُ للهِ)، وَ(لَا إِلَهَ إِلَّا اللهُ)، وَ(اللهُ أَكْبَرُ)، لَا يَضُرُّكَ بِأَيِّهِنَّ بَدَأْتَ».",
                        "phonetic": "Wa qāla ﷺ: «Aḥabbu-l-kalāmi ilā Llāhi arba‘un: (Subḥāna Llāh), wal-ḥamdu li-Llāh, wa lā ilāha illā Llāhu, wa Llāhu Akbar, lā yaḍurruka bi-ayyihinna bada’t».",
                        "translation": "Le Prophète ﷺ a dit : « Les paroles les plus aimées d'Allah sont au nombre de quatre : \"Gloire à Allah\", \"Louange à Allah\", \"Il n'y a de divinité qu'Allah\" et \"Allah est le plus Grand\". Peu importe par laquelle tu commences. »",
                        "count": 1,
                        "source": "مسلم 3/1685"
                    },
                    {
                        "id": 276,
                        "arabic": "جَاءَ أَعْرَابِيٌّ إِلَى رَسُولِ اللهِ ﷺ فَقَالَ: عَلِّمْنِي كَلَامًا أَقُولُهُ، قَالَ: «قُلْ: لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، اللهُ أَكْبَرُ كَبِيراً، وَالْحَمْدُ للهِ كَثِيراً، سُبْحَانَ اللهِ رَبِّ الْعَالَمِينَ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَزِيزِ الْحَكِيمِ»، قَالَ: فَهَؤُلَاءِ لِرَبِّي، فَمَا لِي؟ قَالَ: «قُلْ: اللهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي».",
                        "phonetic": "Jā'a a'rābiyyun ilā Rasūli Llāhi ﷺ faqāla: 'Allimnī kalāman aqūluh. Qāla: «Qul: Lā ilāha illā Llāhu waḥdahu lā sharīka lah, Allāhu Akbaru kabīran, wa-l-ḥamdu li-Llāhi kathīran, Subḥāna Llāhi Rabbi-l-'ālamīn, lā ḥawla wa lā quwwata illā bi-Llāhi-l-'Azīzi-l-Ḥakīm». Qāla: Fa-hā'ulā'i li-Rabbī, famā lī? Qāla: «Qul: Allāhumma-ghfir lī, wa-rḥamnī, wa-hdinī, wa-rzuqnī».",
                        "translation": "Un bédouin vint voir le Messager d'Allah ﷺ et dit : « Enseigne-moi une parole à dire. » Il répondit : « Dis : Il n'y a de divinité qu'Allah, l'Unique sans associé, Allah est le plus Grand dans toute Sa grandeur, louange abondante à Allah, gloire à Allah Seigneur de l'univers, il n'y a de force ni de puissance que par Allah, le Puissant, le Sage. » Le bédouin dit : « Ces paroles sont pour mon Seigneur, mais qu'en est-il pour moi ? » Il répondit : « Dis : Ô Allah, pardonne-moi, fais-moi miséricorde, guide-moi et accorde-moi ma subsistance. »",
                        "count": 1,
                        "source": "مسلم 4/2072، وأبو داود"
                    },
                    {
                        "id": 276,
                        "arabic": "كَانَ الرَّجُلُ إِذَا أَسْلَمَ عَلَّمَهُ النَّبِيُّ ﷺ الصَّلَاةَ ثُمَّ أَمَرَهُ أَنْ يَدْعُوَ بِهَؤُلَاءِ الْكَلِمَاتِ: «اللهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي وَارْزُقْنِي».",
                        "phonetic": "Kāna-r-rajulu idhā aslama 'allamahu-n-Nabiyyu ﷺ aṣ-ṣalāta thumma amarahu an yad'uwa bi-hā'ulā'i-l-kalimāt: «Allāhumma-ghfir lī, wa-rḥamnī, wa-hdinī, wa 'āfinī wa-rzuqnī».",
                        "translation": "Lorsqu'un homme embrassait l'Islam, le Prophète ﷺ lui enseignait la prière, puis lui ordonnait d'invoquer avec ces paroles : « Ô Allah, pardonne-moi, fais-moi miséricorde, guide-moi, accorde-moi la santé (et le salut) et attribue-moi ma subsistance. »",
                        "count": 1,
                        "source": "رواه مسلم 4/2073"
                    },
                    {
                        "id": 277,
                        "arabic": "«إِنَّ أَفْضَلَ الدُّعَاءِ: (الْحَمْدُ للهِ)، وَأَفْضَلَ الذِّكْرِ: (لَا إِلَهَ إِلَّا اللهُ)».",
                        "phonetic": "«Inna afḍala-d-du'ā'i: (Al-ḥamdu li-Llāh), wa afḍala-dh-dhikri: (Lā ilāha illā Llāh)».",
                        "translation": "« Certes, la meilleure invocation est : \"Louange à Allah\", et le meilleur rappel est : \"Il n'y a de divinité qu'Allah\". »",
                        "count": 1,
                        "source": "الترمذي 5/462، وابن ماجه 2/1249، والحاكم 1/503"
                    },
                    {
                        "id": 278,
                        "arabic": "الْبَاقِيَاتُ الصَّالِحَاتُ: (سُبْحَانَ اللهِ)، وَ(الْحَمْدُ للهِ)، وَ(لَا إِلَهَ إِلَّا اللهُ)، وَ(اللهُ أَكْبَرُ)، وَ(لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ).",
                        "phonetic": "Al-bāqiyātu-ṣ-ṣāliḥātu: (Subḥāna Llāhi), wal-ḥamdu li-Llāhi, wa lā ilāha illā Llāhu, wa Llāhu Akbaru, wa lā ḥawla wa lā quwwata illā bi-Llāh.",
                        "translation": "Les bonnes œuvres durables sont : « Gloire à Allah », « Louange à Allah », « Il n'y a de divinité qu'Allah », « Allah est le plus Grand » et « Il n'y a de force ni de puissance que par Allah ».",
                        "count": 1,
                        "source": "أحمد (رقم 513) بسند صحيح"
                    }
                ]
            },
            {
                "id": "chap_131",
                "title": "Comment le Prophète glorifiait-il Allah ?",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 279,
                        "arabic": "عَنْ عَبْدِ اللهِ بْنِ عَمْرٍو رَضِيَ اللهُ عَنْهُمَا قَالَ: «رَأَيْتُ النَّبِيَّ ﷺ يَعْقِدُ التَّسْبِيحَ بِيَمِينِهِ».",
                        "phonetic": "‘An ‘Abdillāhi bni ‘Amrin raḍiya Llāhu ‘anhumā qāla: «Ra’aytu-n-Nabiyya ﷺ ya‘qidu-t-tasbīḥa bi-yamīnih».",
                        "translation": "D'après 'Abdullah bin 'Amr رضي الله عنهما : « J'ai vu le Prophète ﷺ compter les glorifications sur (les phalanges de) sa main droite. »",
                        "count": 1,
                        "source": "أبو داود 2/81، والترمذي 5/521"
                    }
                ]
            },
            {
                "id": "chap_132",
                "title": "Des types de biens et de bienséances",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#AB47BC",
                "duas": [
                    {
                        "id": 280,
                        "arabic": "قَالَ ﷺ: «إِذَا كَانَ جُنْحُ اللَّيْلِ – أَوْ أَمْسَيْتُمْ – فَكُفُّوا صِبْيَانَكُمْ، فَإِنَّ الشَّيَاطِينَ تَنْتَشِرُ حِينَئِذٍ، فَإِذَا ذَهَبَ سَاعَةٌ مِنَ اللَّيْلِ فَخَلُّوهُمْ، وَأَغْلِقُوا الْأَبْوَابَ وَاذْكُرُوا اسْمَ اللهِ؛ فَإِنَّ الشَّيْطَانَ لَا يَفْتَحُ بَابًا مُغْلَقًا، وَأَوْكُوا قِرَبَكُمْ وَاذْكُرُوا اسْمَ اللهِ، وَخَمِّرُوا آنِيَتَكُمْ وَاذْكُرُوا اسْمَ اللهِ وَلَوْ أَنْ تَعْرُضُوا عَلَيْهَا شَيْئًا، وَأَطْفِئُوا مَصَابِيحَكُمْ».",
                        "phonetic": "Qāla ﷺ: «Idhā kāna junḥu-l-layli – aw amsaytum – fa-kuffū ṣibyānakum, fa-inna-sh-shayāṭīna tantashiru ḥīna'idhin, fa-idhā dhahaba sā'atun mina-l-layli fa-khallūhum, wa aghliqū-l-abwāba wa-dhkurū-sma Llāh; fa-inna-sh-shayṭāna lā yaftaḥu bāban mughlaqan, wa awkū qirabakum wa-dhkurū-sma Llāh, wa khammirū āniyatakum wa-dhkurū-sma Llāh wa law an ta'ruḍū 'alayhā shay'an, wa aṭfi'ū maṣābīḥakum».",
                        "translation": "Le Prophète ﷺ a dit : « À la tombée de la nuit, retenez vos enfants, car les diables se déploient à ce moment-là. Une fois qu'une heure de la nuit est passée, laissez-les. Fermez vos portes en mentionnant le nom d'Allah, car le diable n'ouvre pas une porte fermée. Fermez vos outres en mentionnant le nom d'Allah, couvrez vos récipients en mentionnant le nom d'Allah — ne serait-ce qu'en posant quelque chose dessus — et éteignez vos lampes. »",
                        "count": 1,
                        "source": "البخاري 10/88، مسلم 3/1595"
                    }
                ]
            }
        ]
    },
    {
        "id": "trials",
        "name": "Épreuves",
        "nameAr": "الابتلاءات",
        "emoji": "🤲",
        "color": "#78909C",
        "chapters": [
            {
                "id": "chap_34",
                "title": "Contre l'angoisse et la tristesse",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 134,
                        "arabic": "«اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي وَذَهَابَ هَمِّي».",
                        "phonetic": "Allāhumma innī 'abduka ibnu 'abdika ibnu amatika, nāṣiyatī bi-yadika, māḍin fiyya ḥukmuka, 'adlun fiyya qaḍā'uka...",
                        "translation": "Ô Allah, je suis Ton serviteur, fils de Ton serviteur et de Ta servante, mon sort est entre Tes mains. Ton jugement sur moi s'accomplit, Ton décret sur moi est juste. Je Te demande par chaque nom qui T'appartient, par lequel Tu T'es nommé, que Tu as révélé dans Ton Livre, que Tu as enseigné à l'une de Tes créatures ou que Tu as gardé caché dans la science de l'invisible, de faire du Coran le printemps de mon cœur, la lumière de ma poitrine, la fin de ma tristesse et la dissipation de mes soucis.",
                        "count": 1,
                        "source": "أحمد 1/391"
                    },
                    {
                        "id": 135,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika mina al-hammi wal-ḥazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa ḍala'i ad-dayni wa ghalabati ar-rijāl.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi contre les soucis et la tristesse, l'impuissance et la paresse, l'avarice et la lâcheté, le poids de la dette et la domination des hommes.",
                        "count": 1,
                        "source": "البخاري 7/158"
                    }
                ]
            },
            {
                "id": "chap_36",
                "title": "Contre l'ennemi ou une autorité injuste",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 140,
                        "arabic": "«اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ».",
                        "phonetic": "Allāhumma innā naj'aluka fī nuḥūrihim, wa na'ūdhu bika min shurūrihim.",
                        "translation": "Ô Allah, nous Te mettons face à leurs gorges et nous cherchons protection auprès de Toi contre leur mal.",
                        "count": 1,
                        "source": "أبو داود 2/89"
                    },
                    {
                        "id": 141,
                        "arabic": "«اللَّهُمَّ أَنْتَ عَضُدِي وَأَنْتَ نَصِيرِي، بِكَ أَحُولُ، وَبِكَ أَصُولُ، وَبِكَ أُقَاتِلُ».",
                        "phonetic": "Allāhumma Anta 'aḍudī wa Anta naṣīrī, bika aḥūlu, wa bika aṣūlu, wa bika uqātil.",
                        "translation": "Ô Allah, Tu es mon soutien et mon défenseur. C'est par Toi que je me déplace, par Toi que je bondis et par Toi que je combats.",
                        "count": 1,
                        "source": "الترمذي 5/572"
                    },
                    {
                        "id": 142,
                        "arabic": "«حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيلُ».",
                        "phonetic": "Ḥasbunā Allāhu wa ni'ma al-wakīl.",
                        "translation": "Allah nous suffit, et quel excellent Protecteur !",
                        "count": 1,
                        "source": "البخاري 5/172"
                    }
                ]
            },
            {
                "id": "chap_38",
                "title": "Invocation contre l'ennemi",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 145,
                        "arabic": "«اللَّهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اهْزِمِ الْأَحْزَابَ، اللَّهُمَّ اهْزِمْهُمْ وَزَلْزِلْهُمْ».",
                        "phonetic": "Allāhumma munzila al-kitāb, sarī'a al-ḥisāb, ihzimi al-aḥzāb. Allāhumma ihzimhum wa zalzilhum.",
                        "translation": "Ô Allah, Toi qui as fait descendre le Livre et qui es prompt dans Tes comptes, vaincs les coalisés. Ô Allah, vaincs-les et fais-les trembler.",
                        "count": 1,
                        "source": "مسلم 3/1362"
                    }
                ]
            },
            {
                "id": "chap_41",
                "title": "Pour l'acquittement des dettes",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 151,
                        "arabic": "«اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ».",
                        "phonetic": "Allāhumma akfinī bi-ḥalālika 'an ḥarāmika, wa aghninī bi-faḍlika 'amman siwāka.",
                        "translation": "Ô Allah, accorde-moi de Tes biens licites pour m'épargner Tes interdits, et accorde-moi de Ta grâce pour me passer de tout autre que Toi.",
                        "count": 1,
                        "source": "الترمذي 5/560"
                    },
                    {
                        "id": 152,
                        "arabic": "«اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ».",
                        "phonetic": "Allāhumma innī a'ūdhu bika mina al-hammi wal-ḥazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa ḍala'i ad-dayni wa ghalabati ar-rijāl.",
                        "translation": "Ô Allah, je cherche protection auprès de Toi contre les soucis et la tristesse, l'impuissance et la paresse, l'avarice et la lâcheté, le poids de la dette et la domination des hommes.",
                        "count": 1,
                        "source": "البخاري 7/158"
                    }
                ]
            },
            {
                "id": "chap_43",
                "title": "Pour celui qui rencontre une difficulté",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 154,
                        "arabic": "«اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً».",
                        "phonetic": "Allāhumma lā sahla illā mā ja'altahu sahlan, wa Anta taj'alu al-ḥazna idhā shi'ta sahlan.",
                        "translation": "Ô Allah, rien n'est facile sauf ce que Tu as rendu facile, et Tu es capable de rendre facile une difficulté si Tu le veux.",
                        "count": 1,
                        "source": "ابن حبان في صحيحه برقم 2427"
                    }
                ]
            },
            {
                "id": "chap_53",
                "title": "Celui qui est frappé par une épreuve",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 169,
                        "arabic": "«إِنَّا للهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْراً مِنْهَا».",
                        "phonetic": "Innā li-Llāhi wa innā ilayhi rāji'ūn. Allāhumma-jurnī fī muṣībatī, wa-khluf lī khayran minhā.",
                        "translation": "Nous appartenons à Allah et c'est vers Lui que nous retournerons. Ô Allah, récompense-moi dans mon malheur et remplace-le par quelque chose de meilleur.",
                        "count": 1,
                        "source": "مسلم 2/632"
                    }
                ]
            },
            {
                "id": "chap_54",
                "title": "Au moment de fermer les yeux du défunt",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 170,
                        "arabic": "اللَّهُمَّ اغْفِرْ لِفُلَانٍ (بِاسْمِهِ) وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ، وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ، وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ، وَافْسَحْ لَهُ فِي قَبْرِهِ وَنَوْرْ لَهُ فِيهِ",
                        "phonetic": "Allāhumma-ghfir li-fulān (bi-ismihi) wa-rfa' darajatahu fī-l-mahdiyyīn, wa-khlufhu fī 'aqibihi fī-l-ghābirīn, wa-ghfir lanā wa lahu yā Rabba-l-'ālamīn, wa-fsaḥ lahu fī qabrihi wa nawwir lahu fīh.",
                        "translation": "Ô Allah, pardonne à [nommer la personne], élève son rang parmi les bien-guidés, accorde-lui un successeur parmi ceux qui restent, pardonne-nous ainsi qu'à lui, ô Seigneur des mondes, et élargis sa tombe et illumine-la pour lui.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_57",
                "title": "Les condoléances",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 178,
                        "arabic": "إِنَّ لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى فَلْتَصْبِرْ وَلْتَحْتَسِبْ",
                        "phonetic": "Inna li-Llāhi mā akhadha wa lahu mā a'ṭā, wa kullu shay'in 'indahu bi-ajalin musamman, fal-taṣbir wa-l-taḥtasib.",
                        "translation": "Certes, à Allah appartient ce qu'Il a repris et à Lui appartient ce qu'Il a donné. Chaque chose auprès de Lui a un terme fixé. Sois donc patient et espère la récompense d'Allah.",
                        "count": 1,
                        "source": ""
                    },
                    {
                        "id": 179,
                        "arabic": "أَعْظَمَ اللهُ أَجْرَكَ، وَأَحْسَنَ عَزَاءَكَ وَغَفَرَ لِمَيِّتِكَ",
                        "phonetic": "A'ẓama Llāhu ajraka, wa aḥsana 'azā'aka wa ghafara li-mayyitik.",
                        "translation": "Qu'Allah augmente ta récompense, t'accorde les meilleures condoléances et pardonne à ton défunt.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_58",
                "title": "À la descente du défunt",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 180,
                        "arabic": "بِسْمِ اللهِ وَعَلَى سُنَّةِ رَسُولِ اللهِ",
                        "phonetic": "Bismi Llāhi wa 'alā sunnati Rasūli Llāh.",
                        "translation": "Au nom d'Allah et selon la tradition du Messager d'Allah.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_59",
                "title": "Après l'enterrement du défunt",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 181,
                        "arabic": "اللَّهُمَّ اغْفِرْ لَهُ، اللَّهُمَّ ثَبِّتْهُ",
                        "phonetic": "Allahoumma ghfir lahu, Allahoumma thabbithu",
                        "translation": "Ô Allah, pardonne-lui. Ô Allah, raffermis-le.",
                        "count": 1,
                        "source": ""
                    }
                ]
            },
            {
                "id": "chap_124",
                "title": "Celui qui ressent une douleur physique",
                "titleAr": "",
                "icon": "BookOpen",
                "color": "#78909C",
                "duas": [
                    {
                        "id": 259,
                        "arabic": "ضَعْ يَدَكَ عَلَى الَّذِي تَأَلَّمَ مِنْ جَسَدِكَ وَقُلْ: «بِسْمِ اللهِ» (ثَلَاثاً)، وَقُلْ (سَبْعَ مَرَّاتٍ): «أَعُوذُ بِاللهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ».",
                        "phonetic": "Bismi Llāh (3). A'ūdhu bi-Llāhi wa qudratihi min sharri mā ajidu wa uḥādhir (7).",
                        "translation": "Place ta main sur l'endroit douloureux et dis : « Au nom d'Allah » (3 fois), puis dis (7 fois) : « Je cherche protection auprès d'Allah et par Sa puissance contre le mal que je ressens et que je redoute. »",
                        "count": 1,
                        "source": "مسلم 4/1728"
                    }
                ]
            }
        ]
    }
];
