export interface Hadith {
    arabic: string;
    translation: string;
    source: string;
}

export interface Timeline {
    birth: string;
    conversion: string;
    keyEvents: string[];
    death: string;
}

export interface Companion {
    id: string;
    nameAr: string;
    nameFr: string;
    nameEn: string;
    title: string;
    titleAr: string;
    icon: string;
    color: string;
    category: 'ashara' | 'sahabi' | 'sahabiyyah';
    summary: string;
    timeline: Timeline;
    lessons: string[];
    hadiths: Hadith[];
    keyVerses?: { arabic: string; translation: string; reference: string }[];
}

export const companions: Companion[] = [
    // ═══════════════════════════════════════════
    //  LES 10 PROMIS AU PARADIS (العشرة المبشرون بالجنة)
    // ═══════════════════════════════════════════
    {
        id: 'abu-bakr',
        nameAr: 'أبو بكر الصديق',
        nameFr: 'Abu Bakr as-Siddiq',
        nameEn: 'Abu Bakr as-Siddiq',
        title: 'Le Véridique — Premier calife',
        titleAr: 'الصديق',
        icon: '🏅',
        color: '#FFD700',
        category: 'ashara',
        summary: 'Abu Bakr ibn Abi Quhafa fut le premier homme libre à embrasser l\'Islam et le plus proche compagnon du Prophète ﷺ. Riche marchand de Quraysh, il dépensa la quasi-totalité de sa fortune pour la cause de l\'Islam, affranchissant des esclaves musulmans persécutés dont Bilal. Compagnon de la Grotte (Tawba 9:40) lors de la Hijra, il accompagna le Prophète ﷺ dans les moments les plus périlleux. À la mort du Prophète ﷺ, il calma la communauté avec son discours célèbre : « Quiconque adorait Muhammad, Muhammad est mort. Quiconque adore Allah, Allah est vivant et ne meurt pas. » Élu premier calife, il combattit l\'apostasie, unifia l\'Arabie et lança la compilation du Coran. Il mourut en 634 après seulement deux ans de califat.',
        timeline: {
            birth: 'Vers 573 à La Mecque',
            conversion: 'Premier homme libre converti, dès le début de la Révélation (~610)',
            keyEvents: [
                'Affranchit Bilal et d\'autres esclaves persécutés',
                'Compagnon de la Grotte lors de la Hijra (622)',
                'Élu premier calife après la mort du Prophète ﷺ (632)',
                'Guerres contre l\'apostasie (Ridda)',
                'Ordonna la première compilation du Coran'
            ],
            death: '634 à Médine (63 ans) — enterré à côté du Prophète ﷺ'
        },
        lessons: [
            'La loyauté indéfectible envers la vérité (d\'où son surnom as-Siddiq)',
            'La générosité sans limite pour la cause d\'Allah',
            'Le leadership calme dans les moments de crise',
            'L\'humilité malgré le rang le plus élevé'
        ],
        hadiths: [
            { arabic: 'لَوْ كُنْتُ مُتَّخِذًا خَلِيلًا لاتَّخَذْتُ أَبَا بَكْرٍ خَلِيلًا', translation: 'Si je devais prendre un ami intime (khalil), ce serait Abu Bakr.', source: 'Bukhari & Muslim' },
            { arabic: 'مَا نَفَعَنِي مَالٌ قَطُّ مَا نَفَعَنِي مَالُ أَبِي بَكْرٍ', translation: 'Aucune richesse ne m\'a autant profité que celle d\'Abu Bakr.', source: 'Ahmad & Tirmidhi' }
        ],
        keyVerses: [
            { arabic: 'إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا', translation: 'Il disait à son compagnon : Ne t\'afflige pas, car Allah est avec nous.', reference: 'At-Tawba 9:40' }
        ]
    },
    {
        id: 'umar',
        nameAr: 'عمر بن الخطاب',
        nameFr: '\'Umar ibn al-Khattab',
        nameEn: 'Umar ibn al-Khattab',
        title: 'Al-Farouq — Le Distinguant',
        titleAr: 'الفاروق',
        icon: '⚔️',
        color: '#D32F2F',
        category: 'ashara',
        summary: '\'Umar était d\'abord un farouche opposant de l\'Islam, au point de vouloir tuer le Prophète ﷺ. Sa conversion, suite à l\'écoute de sourate Taha récitée chez sa sœur Fatima, fut un tournant décisif qui renforça considérablement les musulmans. Le Prophète ﷺ l\'appela « Al-Farouq » (celui qui distingue le vrai du faux). Deuxième calife (634-644), il bâtit un empire s\'étendant de la Perse à l\'Égypte, fonda le système de Diwan (administration), établit le calendrier hégirien, et fut connu pour sa justice exemplaire. Il patrouillait la nuit dans Médine pour s\'assurer que personne ne souffrait de faim. Il fut assassiné par Abu Lu\'lu\'a en 644 alors qu\'il dirigeait la prière du Fajr.',
        timeline: {
            birth: 'Vers 584 à La Mecque',
            conversion: '616 — après avoir lu sourate Taha chez sa sœur',
            keyEvents: [
                'Sa conversion renforça la position publique des musulmans',
                'Deuxième calife (634-644)',
                'Conquête de Jérusalem, Perse, Égypte, Syrie',
                'Fonda le Diwan, le calendrier hégirien, Bayt al-Mal',
                'Justice légendaire : « Si un mulet trébuchait en Irak, \'Umar en serait responsable »'
            ],
            death: '644 à Médine — assassiné pendant la prière du Fajr (61 ans)'
        },
        lessons: [
            'La vérité peut transformer le plus farouche ennemi en plus fervent défenseur',
            'La justice (\'adl) est le pilier du gouvernement islamique',
            'L\'humilité du dirigeant : il réparait ses propres vêtements malgré son pouvoir',
            'La responsabilité du leader envers chaque citoyen'
        ],
        hadiths: [
            { arabic: 'لَوْ كَانَ نَبِيٌّ بَعْدِي لَكَانَ عُمَرَ', translation: 'S\'il y avait eu un prophète après moi, c\'aurait été \'Umar.', source: 'Tirmidhi' },
            { arabic: 'إِنَّ اللَّهَ جَعَلَ الْحَقَّ عَلَى لِسَانِ عُمَرَ وَقَلْبِهِ', translation: 'Allah a mis la vérité sur la langue et dans le cœur de \'Umar.', source: 'Tirmidhi' }
        ]
    },
    {
        id: 'uthman',
        nameAr: 'عثمان بن عفان',
        nameFr: '\'Uthman ibn \'Affan',
        nameEn: 'Uthman ibn Affan',
        title: 'Dhun-Nurayn — Possesseur des deux lumières',
        titleAr: 'ذو النورين',
        icon: '📖',
        color: '#388E3C',
        category: 'ashara',
        summary: '\'Uthman épousa deux filles du Prophète ﷺ (Ruqayya puis Umm Kulthum), d\'où son surnom « Possesseur des deux lumières ». Homme d\'une richesse immense et d\'une pudeur légendaire (les anges eux-mêmes avaient pudeur de lui). Il finança l\'équipement de l\'armée de Tabuk et acheta le puits de Ruma pour les musulmans. Troisième calife (644-656), il réalisa l\'œuvre majeure de la standardisation du Coran (le Mushaf \'Uthmani), assurant la préservation du texte coranique pour l\'éternité. Son califat vit l\'expansion maritime et la première flotte musulmane. Il fut martyrisé en 656 alors qu\'il lisait le Coran, refusant de verser le sang des musulmans pour se défendre.',
        timeline: {
            birth: 'Vers 576 à La Mecque',
            conversion: 'Parmi les premiers convertis, converti par Abu Bakr',
            keyEvents: [
                'Épousa Ruqayya puis Umm Kulthum, filles du Prophète ﷺ',
                'Deux émigrations en Abyssinie',
                'Finança l\'armée de Tabuk et acheta le puits de Ruma',
                'Troisième calife (644-656)',
                'Standardisa le Mushaf (Coran écrit)'
            ],
            death: '656 à Médine — martyrisé chez lui en lisant le Coran (80 ans)'
        },
        lessons: [
            'La pudeur (haya\') est une branche de la foi',
            'La générosité stratégique au service de la communauté',
            'La préservation du Coran est une responsabilité sacrée',
            'Le refus de la violence même pour se défendre'
        ],
        hadiths: [
            { arabic: 'أَلَا أَسْتَحِي مِنْ رَجُلٍ تَسْتَحِي مِنْهُ الْمَلَائِكَةُ', translation: 'Ne devrais-je pas avoir de la pudeur envers un homme dont les anges ont pudeur ?', source: 'Muslim' },
            { arabic: 'مَنْ حَفَرَ بِئْرَ رُومَةَ فَلَهُ الْجَنَّةُ', translation: 'Quiconque achète le puits de Ruma aura le Paradis. (\'Uthman l\'acheta)', source: 'Bukhari' }
        ]
    },
    {
        id: 'ali',
        nameAr: 'علي بن أبي طالب',
        nameFr: '\'Ali ibn Abi Talib',
        nameEn: 'Ali ibn Abi Talib',
        title: 'Bab al-\'Ilm — La porte du savoir',
        titleAr: 'باب العلم',
        icon: '🦁',
        color: '#1565C0',
        category: 'ashara',
        summary: '\'Ali, cousin et gendre du Prophète ﷺ, fut le premier enfant à embrasser l\'Islam. Il dormit dans le lit du Prophète ﷺ la nuit de la Hijra, risquant sa vie face aux assassins. Époux de Fatima az-Zahra et père de Hassan et Hussayn. Héros de Badr et de Khaybar où il arracha la porte de la forteresse. Le Prophète ﷺ dit de lui : « Je suis la cité du savoir et \'Ali en est la porte. » Réputé pour sa science du Coran, sa bravoure au combat et son éloquence (Nahj al-Balagha). Quatrième calife (656-661), il fit face à de grandes dissensions internes (Bataille du Chameau, Siffin). Il fut assassiné par un kharijite en 661 à Kufa.',
        timeline: {
            birth: 'Vers 601 à La Mecque (dans la Ka\'ba selon certaines sources)',
            conversion: 'Premier enfant converti (~610, environ 10 ans)',
            keyEvents: [
                'Dormit dans le lit du Prophète ﷺ lors de la Hijra',
                'Héros de Badr, Uhud, Khandaq et Khaybar',
                'Épousa Fatima az-Zahra, fille du Prophète ﷺ',
                'Quatrième calife (656-661)',
                'Batailles du Chameau et de Siffin'
            ],
            death: '661 à Kufa — assassiné par un kharijite (environ 60 ans)'
        },
        lessons: [
            'Le sacrifice de soi pour protéger la vérité',
            'La science et la bravoure peuvent coexister dans un seul homme',
            'La justice même envers ses adversaires',
            'L\'éloquence au service de la sagesse'
        ],
        hadiths: [
            { arabic: 'أَنَا مَدِينَةُ الْعِلْمِ وَعَلِيٌّ بَابُهَا', translation: 'Je suis la cité du savoir et \'Ali en est la porte.', source: 'Tirmidhi & Hakim' },
            { arabic: 'أَنْتَ مِنِّي بِمَنْزِلَةِ هَارُونَ مِنْ مُوسَى إِلَّا أَنَّهُ لَا نَبِيَّ بَعْدِي', translation: 'Tu es pour moi ce que Harun était pour Musa, sauf qu\'il n\'y a pas de prophète après moi.', source: 'Bukhari & Muslim' }
        ]
    },
    {
        id: 'talha',
        nameAr: 'طلحة بن عبيد الله',
        nameFr: 'Talha ibn \'Ubaydillah',
        nameEn: 'Talha ibn Ubaydillah',
        title: 'Le Vivant Martyr',
        titleAr: 'طلحة الخير',
        icon: '🛡️',
        color: '#E65100',
        category: 'ashara',
        summary: 'Talha ibn \'Ubaydillah était l\'un des huit premiers convertis. À la bataille d\'Uhud, il protégea le Prophète ﷺ de son propre corps, recevant plus de 70 blessures. Il fit un bouclier humain au-dessus du Prophète ﷺ et perdit l\'usage de deux doigts. Le Prophète ﷺ dit ce jour-là : « Quiconque veut voir un martyr marchant sur terre, qu\'il regarde Talha. » Homme d\'une grande générosité, il était surnommé « Talha le Généreux » et « Talha le Bienfaisant » par le Prophète ﷺ. Il mourut en 656 lors de la bataille du Chameau.',
        timeline: {
            birth: 'Vers 594 à La Mecque',
            conversion: 'Parmi les 8 premiers convertis, converti par Abu Bakr',
            keyEvents: [
                'Protégea le Prophète ﷺ de son corps à Uhud (70+ blessures)',
                'Participa à toutes les batailles sauf Badr',
                'Connu pour sa générosité extraordinaire'
            ],
            death: '656 — tué à la bataille du Chameau (environ 62 ans)'
        },
        lessons: [
            'Le sacrifice physique pour protéger le Prophète ﷺ',
            'La générosité comme trait de caractère constant',
            'Le courage face à la mort'
        ],
        hadiths: [
            { arabic: 'مَنْ أَرَادَ أَنْ يَنْظُرَ إِلَى شَهِيدٍ يَمْشِي عَلَى وَجْهِ الأَرْضِ فَلْيَنْظُرْ إِلَى طَلْحَة', translation: 'Quiconque veut voir un martyr marchant sur terre, qu\'il regarde Talha.', source: 'Tirmidhi' }
        ]
    },
    {
        id: 'zubayr',
        nameAr: 'الزبير بن العوام',
        nameFr: 'Az-Zubayr ibn al-\'Awwam',
        nameEn: 'Az-Zubayr ibn al-Awwam',
        title: 'Disciple du Prophète ﷺ',
        titleAr: 'حواري رسول الله',
        icon: '⚔️',
        color: '#4E342E',
        category: 'ashara',
        summary: 'Az-Zubayr, neveu de Khadija et cousin du Prophète ﷺ, se convertit à l\'âge de 15 ans et fut parmi les tout premiers musulmans. Il fut le premier à dégainer son épée pour l\'Islam quand une rumeur courut que le Prophète ﷺ avait été capturé. Le Prophète ﷺ l\'appela « Hawari » (disciple fidèle). Cavalier redoutable, il participa à toutes les batailles majeures. Il émigra deux fois en Abyssinie. Homme courageux mais aussi généreux, il laissa des dettes considérables pour avoir cautionné les biens de nombreux compagnons. Il mourut en 656.',
        timeline: {
            birth: 'Vers 594 à La Mecque',
            conversion: 'Converti à 15 ans, parmi les premiers',
            keyEvents: [
                'Premier à dégainer l\'épée pour l\'Islam',
                'Deux émigrations en Abyssinie',
                'Héros de Badr, Uhud, Khandaq',
                'Conquête de l\'Égypte'
            ],
            death: '656 — tué après la bataille du Chameau'
        },
        lessons: [
            'La promptitude à défendre la vérité',
            'La fidélité absolue (Hawari) au Prophète ﷺ',
            'Le courage dès le plus jeune âge'
        ],
        hadiths: [
            { arabic: 'إِنَّ لِكُلِّ نَبِيٍّ حَوَارِيًّا وَحَوَارِيَّ الزُّبَيْرُ', translation: 'Chaque prophète a un disciple (hawari), et mon disciple est Az-Zubayr.', source: 'Bukhari & Muslim' }
        ]
    },
    {
        id: 'abdurrahman',
        nameAr: 'عبد الرحمن بن عوف',
        nameFr: '\'Abd ar-Rahman ibn \'Awf',
        nameEn: 'Abdur-Rahman ibn Awf',
        title: 'Le Marchand Béni',
        titleAr: 'تاجر الرحمن',
        icon: '💰',
        color: '#F9A825',
        category: 'ashara',
        summary: '\'Abd ar-Rahman ibn \'Awf était l\'un des huit premiers convertis et l\'un des hommes les plus riches de Médine. En arrivant à Médine lors de la Hijra, il refusa l\'aide matérielle proposée par son frère ansari Sa\'d ibn ar-Rabi\', demandant seulement qu\'on lui indique le chemin du marché. Parti de zéro, il rebâtit une fortune immense grâce à son sens du commerce. Il donna 40 000 dinars, 500 chevaux et 1 500 chamelles en une seule donation. Le Prophète ﷺ pria derrière lui lors d\'un voyage. Il mourut en 652 à Médine.',
        timeline: {
            birth: 'Vers 580 à La Mecque',
            conversion: 'Parmi les 8 premiers convertis',
            keyEvents: [
                'Émigra en Abyssinie puis à Médine',
                'Refusa l\'aide et rebâtit sa fortune par le commerce',
                'Le Prophète ﷺ pria derrière lui',
                'Dona des sommes colossales pour la cause'
            ],
            death: '652 à Médine (environ 72 ans)'
        },
        lessons: [
            'L\'autonomie et la dignité dans la demande',
            'Le commerce halal comme voie de richesse bénie',
            'La générosité proportionnelle à la richesse'
        ],
        hadiths: [
            { arabic: 'عَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ سَيِّدٌ مِنْ سَادَاتِ الْمُسْلِمِينَ', translation: '\'Abd ar-Rahman ibn \'Awf est un seigneur parmi les seigneurs des musulmans.', source: 'Rapporté par \'Umar, Ibn Sa\'d' }
        ]
    },
    {
        id: 'saad',
        nameAr: 'سعد بن أبي وقاص',
        nameFr: 'Sa\'d ibn Abi Waqqas',
        nameEn: 'Sad ibn Abi Waqqas',
        title: 'Le Lion de l\'Islam — Premier archer',
        titleAr: 'أسد الإسلام',
        icon: '🏹',
        color: '#6A1B9A',
        category: 'ashara',
        summary: 'Sa\'d ibn Abi Waqqas se convertit à 17 ans, étant le septième converti à l\'Islam. Il fut le premier à tirer une flèche pour la cause d\'Allah et le premier à verser son sang. Sa mère fit grève de la faim pour le forcer à apostasier, mais il tint bon, et le verset « Et si tous deux te poussent à M\'associer... » (Luqman 31:15) fut révélé à son sujet. Commandant en chef à la bataille de Qadisiyyah (636), il vainquit l\'Empire perse sassanide et fonda la ville de Kufa. Le Prophète ﷺ dit que ses invocations étaient toujours exaucées. Il mourut vers 675.',
        timeline: {
            birth: 'Vers 595 à La Mecque',
            conversion: '7e converti, à l\'âge de 17 ans',
            keyEvents: [
                'Premier à tirer une flèche pour l\'Islam',
                'Verset de Luqman 31:15 révélé à son sujet',
                'Héros de Badr et Uhud (archer d\'élite)',
                'Commandant à Qadisiyyah — victoire sur l\'Empire perse (636)',
                'Fondateur de Kufa (Irak)'
            ],
            death: 'Vers 675 à Médine (~80 ans) — dernier des 10 promis à mourir'
        },
        lessons: [
            'La fermeté dans la foi face à la pression familiale',
            'Le courage militaire au service de la vérité',
            'La du\'a du croyant sincère est exaucée'
        ],
        hadiths: [
            { arabic: 'اللَّهُمَّ اسْتَجِبْ لِسَعْدٍ إِذَا دَعَاكَ', translation: 'Ô Allah, exauce Sa\'d quand il T\'invoque.', source: 'Tirmidhi' }
        ],
        keyVerses: [
            { arabic: 'وَإِن جَاهَدَاكَ عَلَىٰ أَن تُشْرِكَ بِي مَا لَيْسَ لَكَ بِهِ عِلْمٌ فَلَا تُطِعْهُمَا', translation: 'Et s\'ils te poussent à M\'associer ce dont tu n\'as aucune connaissance, ne leur obéis pas.', reference: 'Luqman 31:15' }
        ]
    },
    {
        id: 'said',
        nameAr: 'سعيد بن زيد',
        nameFr: 'Sa\'id ibn Zayd',
        nameEn: 'Said ibn Zayd',
        title: 'Le Hanif converti',
        titleAr: 'ابن الحنيف',
        icon: '🌟',
        color: '#00695C',
        category: 'ashara',
        summary: 'Sa\'id ibn Zayd était le fils de Zayd ibn \'Amr, un hanif (monothéiste) d\'avant l\'Islam qui cherchait la vraie religion d\'Ibrahim. Sa\'id et sa femme Fatima bint al-Khattab (sœur de \'Umar) furent parmi les premiers convertis. C\'est chez lui que \'Umar entendit sourate Taha et se convertit. Sa\'id participa à toutes les batailles sauf Badr (il était en mission). Il fut connu pour sa piété discrète et sa droiture. Il mourut en 671 à Médine.',
        timeline: {
            birth: 'Vers 593 à La Mecque',
            conversion: 'Très tôt, parmi les premiers convertis',
            keyEvents: [
                'Son père Zayd étant un hanif qui cherchait la religion d\'Ibrahim',
                'Conversion de \'Umar eut lieu chez lui',
                'Participa à toutes les batailles sauf Badr',
                'Participa à la conquête de la Syrie'
            ],
            death: '671 à Médine'
        },
        lessons: [
            'La quête de vérité peut être héréditaire et familiale',
            'La piété discrète est aussi précieuse que l\'héroïsme public',
            'La constance dans la foi sans rechercher la notoriété'
        ],
        hadiths: [
            { arabic: 'زَيْدُ بْنُ عَمْرِو بْنِ نُفَيْلٍ يُبْعَثُ يَوْمَ القِيَامَةِ أُمَّةً وَحْدَهُ', translation: 'Zayd ibn \'Amr (le père de Sa\'id) sera ressuscité le Jour du Jugement en tant que communauté à lui seul.', source: 'Ibn Asakir' }
        ]
    },
    {
        id: 'abu-ubayda',
        nameAr: 'أبو عبيدة بن الجراح',
        nameFr: 'Abu \'Ubayda ibn al-Jarrah',
        nameEn: 'Abu Ubayda ibn al-Jarrah',
        title: 'Amin al-Ummah — Le fiduciaire de la communauté',
        titleAr: 'أمين الأمة',
        icon: '🤝',
        color: '#2E7D32',
        category: 'ashara',
        summary: 'Abu \'Ubayda ibn al-Jarrah fut l\'un des premiers convertis et l\'un des plus humbles compagnons. Le Prophète ﷺ le surnomma « Amin al-Ummah » (le fiduciaire de la communauté), soulignant sa fiabilité absolue. À Badr, il dut affronter son propre père qui combattait du côté des polythéistes. Commandant suprême des armées du Sham sous \'Umar, il conquit la Syrie, la Palestine et le Liban. Malgré ses victoires, il vivait dans une simplicité extrême. Quand \'Umar visita le Sham et vit son logis dépouillé, il pleura. Abu \'Ubayda mourut de la peste d\'Amwas en 639.',
        timeline: {
            birth: 'Vers 583 à La Mecque',
            conversion: 'Parmi les premiers convertis, le lendemain d\'Abu Bakr',
            keyEvents: [
                'Nommé « Amin al-Ummah » par le Prophète ﷺ',
                'Affronta son propre père à Badr',
                'Arracha les anneaux du casque du Prophète ﷺ à Uhud (perdit 2 dents)',
                'Commandant suprême des armées du Sham',
                'Conquête de la Syrie et de la Palestine'
            ],
            death: '639 en Palestine — mort de la peste d\'Amwas (environ 56 ans)'
        },
        lessons: [
            'La fiabilité (amana) est la qualité la plus précieuse',
            'La foi peut exiger de s\'opposer à sa propre famille',
            'Le vrai leader vit comme le plus modeste de ses soldats',
            'L\'acceptation du qadar même face à la peste'
        ],
        hadiths: [
            { arabic: 'إِنَّ لِكُلِّ أُمَّةٍ أَمِينًا وَأَمِينُ هَذِهِ الأُمَّةِ أَبُو عُبَيْدَةَ بْنُ الْجَرَّاحِ', translation: 'Chaque communauté a un fiduciaire, et le fiduciaire de cette communauté est Abu \'Ubayda.', source: 'Bukhari & Muslim' }
        ]
    },
    // ═══════════════════════════════════════════
    //  AUTRES COMPAGNONS CÉLÈBRES
    // ═══════════════════════════════════════════
    {
        id: 'bilal',
        nameAr: 'بلال بن رباح',
        nameFr: 'Bilal ibn Rabah',
        nameEn: 'Bilal ibn Rabah',
        title: 'Premier Muezzin de l\'Islam',
        titleAr: 'مؤذن الرسول',
        icon: '🎙️',
        color: '#5D4037',
        category: 'sahabi',
        summary: 'Bilal, esclave abyssin, fut l\'un des premiers convertis et le plus célèbre symbole de l\'égalité en Islam. Son maître Umayyah ibn Khalaf le torturait sous le soleil brûlant de La Mecque, posant un rocher sur sa poitrine pour le forcer à renier l\'Islam. Bilal ne répondait qu\'un mot : « Ahad ! Ahad ! » (Un ! Un !). Abu Bakr l\'acheta et l\'affranchit. Le Prophète ﷺ le choisit comme premier muezzin de l\'Islam grâce à sa voix magnifique. Après la mort du Prophète ﷺ, Bilal ne put plus faire l\'adhan sans pleurer et quitta Médine. Il mourut à Damas vers 640.',
        timeline: {
            birth: 'Vers 580 en Abyssinie (Éthiopie)',
            conversion: 'Parmi les tout premiers convertis, esclave persécuté',
            keyEvents: [
                'Torturé par Umayyah ibn Khalaf — « Ahad, Ahad »',
                'Affranchi par Abu Bakr as-Siddiq',
                'Choisi comme premier muezzin à Médine',
                'Participa à Badr, Uhud et toutes les batailles',
                'Fit l\'adhan depuis la Ka\'ba le jour de la conquête de La Mecque'
            ],
            death: 'Vers 640 à Damas (environ 60 ans)'
        },
        lessons: [
            'La foi résiste à toutes les persécutions',
            'L\'Islam abolit toute discrimination raciale',
            'La voix au service d\'Allah est un honneur immense',
            'L\'amour du Prophète ﷺ transcende la mort'
        ],
        hadiths: [
            { arabic: 'سَمِعْتُ دَفَّ نَعْلَيْكَ بَيْنَ يَدَيَّ فِي الْجَنَّةِ', translation: 'J\'ai entendu le bruit de tes sandales devant moi au Paradis.', source: 'Bukhari & Muslim' }
        ]
    },
    {
        id: 'khalid',
        nameAr: 'خالد بن الوليد',
        nameFr: 'Khalid ibn al-Walid',
        nameEn: 'Khalid ibn al-Walid',
        title: 'Sayfullah — L\'épée d\'Allah',
        titleAr: 'سيف الله المسلول',
        icon: '⚔️',
        color: '#B71C1C',
        category: 'sahabi',
        summary: 'Khalid ibn al-Walid était le génie militaire de Quraysh avant l\'Islam. C\'est lui qui retourna la situation à Uhud contre les musulmans. Converti tardivement (629), le Prophète ﷺ le surnomma « Sayfullah » (l\'épée d\'Allah). Il ne perdit jamais aucune bataille — un exploit militaire inégalé dans l\'histoire. À Mu\'tah, face à 200 000 Byzantins avec seulement 3 000 hommes, il mena un retrait tactique brillant après la mort des trois commandants. Sous Abu Bakr et \'Umar, il conquit l\'Irak perse et la Syrie byzantine. \'Umar le destitua pour que les gens sachent que la victoire vient d\'Allah, pas de Khalid. Il mourut dans son lit, regrettant de ne pas être tombé en martyr.',
        timeline: {
            birth: 'Vers 592 à La Mecque',
            conversion: '629 — converti après le traité d\'Al-Hudaybiyyah',
            keyEvents: [
                'Surnommé « Sayfullah » par le Prophète ﷺ',
                'Héros de Mu\'tah face aux Byzantins (629)',
                'Conquête de La Mecque (630)',
                'Victoire à Yarmouk contre les Byzantins (636)',
                'Conquête de l\'Irak et de la Syrie',
                'N\'a jamais perdu une seule bataille'
            ],
            death: '642 à Homs (Syrie) — mort dans son lit (environ 50 ans)'
        },
        lessons: [
            'Le génie peut servir la vérité après avoir servi l\'erreur',
            'La victoire vient d\'Allah, pas du commandant',
            'Le courage sans limites au service de la foi',
            'Le regret du martyre montre l\'amour du sacrifice'
        ],
        hadiths: [
            { arabic: 'لَا تُؤْذُوا خَالِدًا فَإِنَّهُ سَيْفٌ مِنْ سُيُوفِ اللَّهِ سَلَّهُ عَلَى الْكُفَّارِ', translation: 'Ne faites pas de mal à Khalid, car il est une épée parmi les épées d\'Allah, dégainée contre les mécréants.', source: 'Ahmad' }
        ]
    },
    {
        id: 'abu-dharr',
        nameAr: 'أبو ذر الغفاري',
        nameFr: 'Abu Dharr al-Ghifari',
        nameEn: 'Abu Dharr al-Ghifari',
        title: 'L\'Ascète Véridique',
        titleAr: 'زاهد الأمة',
        icon: '🏜️',
        color: '#795548',
        category: 'sahabi',
        summary: 'Abu Dharr al-Ghifari fut le 4e ou 5e converti à l\'Islam. Venu de la tribu de Ghifar (brigands), il se rendit seul à La Mecque pour rencontrer le Prophète ﷺ. Converti, il proclama sa foi publiquement devant la Ka\'ba et fut violemment battu. Il retourna chez sa tribu et convertit la moitié de Ghifar. Connu pour son ascétisme radical et sa défense acharnée des pauvres contre l\'accumulation des richesses. Le Prophète ﷺ le compara à \'Isa (Jésus) dans son ascétisme. Sous \'Uthman, il fut exilé à ar-Rabadha pour ses critiques contre la richesse des gouverneurs. Il mourut seul dans le désert vers 652.',
        timeline: {
            birth: 'Date inconnue, tribu de Ghifar',
            conversion: '4e ou 5e converti, très début de la da\'wah à La Mecque',
            keyEvents: [
                'Proclama l\'Islam publiquement à La Mecque, fut battu',
                'Convertit la moitié de sa tribu Ghifar',
                'Participa aux batailles après la Hijra',
                'Défenseur des pauvres, critique des richesses',
                'Exilé à ar-Rabadha sous \'Uthman'
            ],
            death: 'Vers 652 à ar-Rabadha, seul dans le désert'
        },
        lessons: [
            'Le courage de proclamer la vérité même seul',
            'L\'ascétisme (zuhd) comme voie de proximité avec Allah',
            'La défense des pauvres est un devoir de foi',
            'La richesse mal utilisée corrompt la communauté'
        ],
        hadiths: [
            { arabic: 'مَا أَظَلَّتِ الْخَضْرَاءُ وَلَا أَقَلَّتِ الْغَبْرَاءُ أَصْدَقَ مِنْ أَبِي ذَرٍّ', translation: 'Le ciel n\'a pas ombragé et la terre n\'a pas porté homme plus véridique qu\'Abu Dharr.', source: 'Tirmidhi & Ibn Majah' }
        ]
    },
    {
        id: 'salman',
        nameAr: 'سلمان الفارسي',
        nameFr: 'Salman al-Farisi',
        nameEn: 'Salman al-Farisi',
        title: 'Le Chercheur de Vérité',
        titleAr: 'الباحث عن الحق',
        icon: '🌍',
        color: '#0277BD',
        category: 'sahabi',
        summary: 'Salman était un noble perse zoroastrien qui quitta sa famille à la recherche de la vraie religion. Il passa chez des moines chrétiens de Syrie, d\'Irak et de Mossoul, chacun lui disant avant de mourir de chercher le suivant. Le dernier moine lui décrivit le prophète attendu et ses signes. En route vers l\'Arabie, il fut trahi et vendu comme esclave. À Médine, il reconnut les signes chez le Prophète ﷺ et se convertit. Le Prophète ﷺ dit : « Salman est des nôtres, les Ahl al-Bayt. » Lors de la bataille du Khandaq, c\'est lui qui proposa de creuser la tranchée, stratégie inconnue des Arabes. Il devint gouverneur de Ctésiphon.',
        timeline: {
            birth: 'Date inconnue, à Isfahan (Perse)',
            conversion: 'À Médine, après des années de quête à travers le monde',
            keyEvents: [
                'Quitta sa famille noble perse pour chercher la vérité',
                'Passa par de nombreux moines chrétiens en Syrie et Irak',
                'Vendu comme esclave, arriva à Médine',
                'Proposa la stratégie de la tranchée (Khandaq, 627)',
                'Gouverneur de Ctésiphon sous \'Umar'
            ],
            death: 'Vers 655 à Ctésiphon (Irak)'
        },
        lessons: [
            'La quête sincère de la vérité mène toujours à Allah',
            'L\'Islam transcende les frontières et les nationalités',
            'L\'innovation stratégique au service de la communauté',
            'La patience dans l\'épreuve de l\'esclavage'
        ],
        hadiths: [
            { arabic: 'سَلْمَانُ مِنَّا أَهْلَ الْبَيْتِ', translation: 'Salman est des nôtres, les Ahl al-Bayt.', source: 'Tabarani & Hakim' }
        ]
    },
    {
        id: 'ibn-masud',
        nameAr: 'عبد الله بن مسعود',
        nameFr: 'Abdullah ibn Mas\'ud',
        nameEn: 'Abdullah ibn Masud',
        title: 'Premier récitateur public du Coran',
        titleAr: 'أول من جهر بالقرآن',
        icon: '📖',
        color: '#283593',
        category: 'sahabi',
        summary: 'Abdullah ibn Mas\'ud, jeune berger frêle, fut le 6e converti. Il fut le premier à réciter le Coran à voix haute publiquement devant les Quraysh à La Mecque, et fut battu pour cela. Le Prophète ﷺ l\'aimait profondément et dit : « Prenez le Coran de quatre personnes, et il commença par Ibn Mas\'ud. » Il portait les sandales du Prophète ﷺ, son coussin et son siwak. Le Prophète ﷺ dit que ses jambes fines pèseraient plus lourd que le mont Uhud dans la balance au Jour du Jugement. Grand savant du tafsir et du fiqh, il fut envoyé à Kufa comme enseignant par \'Umar.',
        timeline: {
            birth: 'Date inconnue à La Mecque',
            conversion: '6e converti à l\'Islam',
            keyEvents: [
                'Premier à réciter le Coran publiquement à La Mecque',
                'Porteur des sandales et du siwak du Prophète ﷺ',
                'Participa à Badr et toutes les batailles',
                'Envoyé comme enseignant à Kufa par \'Umar',
                'Expert en tafsir et fiqh'
            ],
            death: '652 à Médine'
        },
        lessons: [
            'Le courage de proclamer le Coran même face à la violence',
            'La science du Coran est le plus grand honneur',
            'La valeur d\'un homme ne se mesure pas à son apparence physique'
        ],
        hadiths: [
            { arabic: 'خُذُوا الْقُرْآنَ مِنْ أَرْبَعَةٍ : مِنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ...', translation: 'Prenez le Coran de quatre personnes : d\'Abdullah ibn Mas\'ud...', source: 'Bukhari & Muslim' }
        ]
    },
    {
        id: 'musab',
        nameAr: 'مصعب بن عمير',
        nameFr: 'Mus\'ab ibn \'Umayr',
        nameEn: 'Musab ibn Umayr',
        title: 'Premier Ambassadeur de l\'Islam',
        titleAr: 'أول سفير في الإسلام',
        icon: '🏳️',
        color: '#4527A0',
        category: 'sahabi',
        summary: 'Mus\'ab ibn \'Umayr était le jeune homme le plus beau et le plus gâté de La Mecque, habillé des meilleurs vêtements. Sa conversion secrète à l\'Islam lui coûta tout : sa mère le déshérita, et il vécut dans un dénuement total. Le Prophète ﷺ l\'envoya à Médine comme premier ambassadeur et enseignant avant la Hijra. Son da\'wah fut si efficace que la majorité de Médine embrassa l\'Islam avant l\'arrivée du Prophète ﷺ. Porte-étendard à Badr et à Uhud, il fut martyrisé à Uhud. Si pauvre, son linceul ne couvrait pas tout son corps : quand on couvrait sa tête, ses pieds se découvraient.',
        timeline: {
            birth: 'Date inconnue à La Mecque',
            conversion: 'Se convertit secrètement, puis fut déshérité',
            keyEvents: [
                'Le jeune homme le plus gâté de La Mecque devenu ascète',
                'Premier ambassadeur de l\'Islam envoyé à Médine (avant la Hijra)',
                'Convertit la majorité de Médine à l\'Islam',
                'Porte-étendard du Prophète ﷺ à Badr et Uhud'
            ],
            death: '625 — martyrisé à la bataille d\'Uhud'
        },
        lessons: [
            'Tout quitter pour Allah quand on possède tout',
            'Le da\'wah par l\'exemple et la sagesse',
            'Le sacrifice ultime pour la cause de la vérité'
        ],
        hadiths: [
            { arabic: 'رَأَيْتُ مُصْعَبَ بْنَ عُمَيْرٍ وَمَا بِمَكَّةَ فَتًى أَنْعَمُ مِنْهُ...', translation: 'J\'ai vu Mus\'ab ibn \'Umayr alors qu\'il n\'y avait à La Mecque aucun jeune plus gâté que lui...', source: 'Tirmidhi' }
        ]
    },
    {
        id: 'hamza',
        nameAr: 'حمزة بن عبد المطلب',
        nameFr: 'Hamza ibn \'Abd al-Muttalib',
        nameEn: 'Hamza ibn Abd al-Muttalib',
        title: 'Asadullah — Le Lion d\'Allah',
        titleAr: 'أسد الله',
        icon: '🦁',
        color: '#C62828',
        category: 'sahabi',
        summary: 'Hamza, oncle paternel du Prophète ﷺ et presque du même âge, était le plus fort et le plus courageux des Quraysh, célèbre chasseur. Il se convertit par indignation quand Abu Jahl insulta le Prophète ﷺ : il frappa Abu Jahl avec son arc et déclara sa foi. Sa conversion renforça considérablement les musulmans. Héros de Badr où il combattit comme un lion, il fut surnommé « Asadullah » (le Lion d\'Allah). À Uhud, il fut martyrisé par Wahshi avec un javelot. Hind bint \'Utba mutila son corps. Le Prophète ﷺ pleura abondamment en voyant son corps et l\'appela « Sayyid ash-Shuhada » (le maître des martyrs).',
        timeline: {
            birth: 'Vers 570 à La Mecque',
            conversion: '615 — par colère contre l\'injustice d\'Abu Jahl envers le Prophète ﷺ',
            keyEvents: [
                'Sa conversion renforça la position des musulmans',
                'Héros de la bataille de Badr (624)',
                'Surnommé Asadullah (le Lion d\'Allah)',
                'Combattit avec une bravoure légendaire à Uhud'
            ],
            death: '625 — martyrisé à Uhud par Wahshi (environ 55 ans)'
        },
        lessons: [
            'Défendre la vérité même tardivement est accepté par Allah',
            'La bravoure physique au service de la foi',
            'Le titre de « maître des martyrs » est le plus grand honneur'
        ],
        hadiths: [
            { arabic: 'سَيِّدُ الشُّهَدَاءِ حَمْزَةُ بْنُ عَبْدِ الْمُطَّلِبِ', translation: 'Le maître des martyrs est Hamza ibn \'Abd al-Muttalib.', source: 'Hakim' }
        ]
    },
    {
        id: 'jafar',
        nameAr: 'جعفر بن أبي طالب',
        nameFr: 'Ja\'far ibn Abi Talib',
        nameEn: 'Jafar ibn Abi Talib',
        title: 'Le Volant — Abou des pauvres',
        titleAr: 'ذو الجناحين',
        icon: '🕊️',
        color: '#1B5E20',
        category: 'sahabi',
        summary: 'Ja\'far, frère aîné de \'Ali et cousin du Prophète ﷺ, mena la première émigration musulmane en Abyssinie. Devant le roi chrétien Négus (an-Najashi), il prononça un discours magistral sur l\'Islam et récita sourate Maryam, faisant pleurer le roi qui refusa de livrer les musulmans à Quraysh. Surnommé « le père des pauvres » car il nourrissait toujours les nécessiteux. Le Prophète ﷺ dit qu\'il lui ressemblait physiquement et moralement. À Mu\'tah (629), face aux Byzantins, il prit le commandement après la mort de Zayd ibn Haritha, puis tomba en martyr. Le Prophète ﷺ dit qu\'Allah lui donna deux ailes au Paradis.',
        timeline: {
            birth: 'Vers 590 à La Mecque',
            conversion: 'Parmi les premiers convertis',
            keyEvents: [
                'Mena l\'émigration en Abyssinie',
                'Discours devant le Négus — récita sourate Maryam',
                'Surnommé « le père des pauvres »',
                'Commandant à Mu\'tah après Zayd ibn Haritha'
            ],
            death: '629 — martyrisé à Mu\'tah (environ 39 ans)'
        },
        lessons: [
            'L\'éloquence au service de la da\'wah',
            'La générosité envers les pauvres comme mode de vie',
            'Le sacrifice sur le champ de bataille pour la cause d\'Allah'
        ],
        hadiths: [
            { arabic: 'أَبْدَلَهُ اللَّهُ بِيَدَيْهِ جَنَاحَيْنِ يَطِيرُ بِهِمَا فِي الْجَنَّةِ', translation: 'Allah lui a remplacé ses deux mains par deux ailes avec lesquelles il vole au Paradis.', source: 'Bukhari' }
        ]
    },
    {
        id: 'abu-hurayra',
        nameAr: 'أبو هريرة',
        nameFr: 'Abu Hurayra',
        nameEn: 'Abu Hurayra',
        title: 'Le plus grand narrateur de hadiths',
        titleAr: 'أكثر الصحابة رواية للحديث',
        icon: '📚',
        color: '#E65100',
        category: 'sahabi',
        summary: 'Abu Hurayra (« le père du chaton ») se convertit en l\'an 7 de l\'Hégire et passa seulement 3 ans avec le Prophète ﷺ, mais devint le plus grand narrateur de hadiths : environ 5 374 hadiths lui sont attribués. Pauvre et affamé, il suivait le Prophète ﷺ partout, mémorisant chaque parole. Le Prophète ﷺ fit une invocation pour que sa mémoire soit renforcée. Après cette dua, il ne perdit jamais rien de sa mémoire. Il vivait dans le Suffah (véranda de la mosquée) avec les plus démunis. Il devint gouverneur de Bahreïn sous \'Umar puis se retira pour vivre modestement à Médine.',
        timeline: {
            birth: 'Date inconnue au Yémen (tribu de Daws)',
            conversion: 'An 7 de l\'Hégire (~629), converti par Tufayl ibn \'Amr',
            keyEvents: [
                'Vécut dans le Suffah (les gens de la véranda)',
                'Mémorisa le plus grand nombre de hadiths (5 374+)',
                'Le Prophète ﷺ invoqua Allah pour sa mémoire',
                'Gouverneur de Bahreïn sous \'Umar'
            ],
            death: '678 à Médine'
        },
        lessons: [
            'La soif du savoir compense le temps perdu',
            'La mémoire est un don d\'Allah qu\'on peut demander',
            'La pauvreté n\'empêche pas la grandeur dans la science',
            'La transmission du hadith est un acte d\'adoration'
        ],
        hadiths: [
            { arabic: 'اللَّهُمَّ حَبِّبْ عُبَيْدَكَ هَذَا إِلَى عِبَادِكَ الْمُؤْمِنِينَ', translation: 'Ô Allah, fais aimer ce serviteur à Tes serviteurs croyants.', source: 'Muslim' }
        ]
    },
    // ═══════════════════════════════════════════
    //  COMPAGNONNES (صحابيات)
    // ═══════════════════════════════════════════
    {
        id: 'khadija',
        nameAr: 'خديجة بنت خويلد',
        nameFr: 'Khadija bint Khuwaylid',
        nameEn: 'Khadija bint Khuwaylid',
        title: 'Première Croyante — Umm al-Mu\'minin',
        titleAr: 'أم المؤمنين',
        icon: '💎',
        color: '#880E4F',
        category: 'sahabiyyah',
        summary: 'Khadija était une riche marchande de Quraysh, veuve respectée, surnommée « at-Tahira » (la pure) avant l\'Islam. Elle employa Muhammad ﷺ pour gérer ses caravanes, impressionnée par son honnêteté. Elle le demanda en mariage et devint la première personne à croire en sa prophétie. Quand le Prophète ﷺ revint tremblant de la grotte de Hira après la première révélation, c\'est elle qui le rassura : « Allah ne te déshonorera jamais. » Elle dépensa toute sa fortune pour soutenir l\'Islam. Pendant les 3 années de boycott dans le défilé d\'Abu Talib, elle endura la faim et les privations. Le Prophète ﷺ ne se maria à aucune autre femme tant qu\'elle vécut. Elle mourut avant la Hijra.',
        timeline: {
            birth: 'Vers 555 à La Mecque',
            conversion: 'Première personne à embrasser l\'Islam (610)',
            keyEvents: [
                'Riche marchande, surnommée at-Tahira',
                'Employa puis épousa Muhammad ﷺ',
                'Première à croire en la Révélation',
                'Soutint financièrement l\'Islam durant toute la période mecquoise',
                'Endura le boycott de 3 ans dans le défilé d\'Abu Talib'
            ],
            death: '619 à La Mecque — « l\'année de la tristesse » (environ 64 ans)'
        },
        lessons: [
            'La première croyante était une femme',
            'Le soutien inconditionnel au Prophète ﷺ dans les moments les plus durs',
            'La richesse et le statut social au service de la vérité',
            'L\'amour conjugal exemplaire'
        ],
        hadiths: [
            { arabic: 'خَيْرُ نِسَائِهَا مَرْيَمُ بِنْتُ عِمْرَانَ وَخَيْرُ نِسَائِهَا خَدِيجَةُ بِنْتُ خُوَيْلِدٍ', translation: 'La meilleure des femmes de son temps est Maryam fille de \'Imran, et la meilleure des femmes de son temps est Khadija fille de Khuwaylid.', source: 'Bukhari & Muslim' }
        ]
    },
    {
        id: 'aicha',
        nameAr: 'عائشة بنت أبي بكر',
        nameFr: 'Aïcha bint Abi Bakr',
        nameEn: 'Aisha bint Abi Bakr',
        title: 'La Savante — Umm al-Mu\'minin',
        titleAr: 'أم المؤمنين',
        icon: '📖',
        color: '#AD1457',
        category: 'sahabiyyah',
        summary: 'Aïcha, fille d\'Abu Bakr, fut la plus savante des femmes de l\'Islam. Elle rapporta environ 2 210 hadiths et les grands compagnons la consultaient pour les questions de fiqh, de tafsir et de sunnah. Le Prophète ﷺ dit : « Prenez la moitié de votre religion de cette rousse (humayra). » Elle fut innocentée de la calomnie (ifk) par une révélation coranique (sourate An-Nur). Après la mort du Prophète ﷺ, elle devint une référence en sciences islamiques et corrigea les erreurs de transmission de nombreux compagnons. Des centaines de tabi\'in apprirent d\'elle.',
        timeline: {
            birth: 'Vers 613 à La Mecque',
            conversion: 'Née dans une famille musulmane',
            keyEvents: [
                'Épousa le Prophète ﷺ',
                'Innocentée par révélation coranique (sourate An-Nur)',
                'Rapporta ~2 210 hadiths',
                'Plus grande autorité en fiqh et sunnah parmi les femmes',
                'Enseigna des centaines de tabi\'in'
            ],
            death: '678 à Médine (environ 65 ans)'
        },
        lessons: [
            'La science islamique n\'a pas de genre',
            'La calomnie est réfutée par la patience et la confiance en Allah',
            'L\'enseignement est un héritage plus précieux que les biens',
            'La femme peut être la plus grande autorité religieuse'
        ],
        hadiths: [
            { arabic: 'خُذُوا شَطْرَ دِينِكُمْ مِنْ هَذِهِ الْحُمَيْرَاءِ', translation: 'Prenez la moitié de votre religion de cette Humayra (Aïcha).', source: 'Rapporté par de nombreuses sources' }
        ],
        keyVerses: [
            { arabic: 'إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِنكُمْ', translation: 'Ceux qui sont venus avec la calomnie sont un groupe parmi vous.', reference: 'An-Nur 24:11' }
        ]
    },
    {
        id: 'fatima',
        nameAr: 'فاطمة الزهراء',
        nameFr: 'Fatima az-Zahra',
        nameEn: 'Fatima az-Zahra',
        title: 'Sayyidat Nisa\' Ahl al-Jannah',
        titleAr: 'سيدة نساء أهل الجنة',
        icon: '🌹',
        color: '#C2185B',
        category: 'sahabiyyah',
        summary: 'Fatima, la plus jeune fille du Prophète ﷺ et de Khadija, fut celle qui lui ressembla le plus en caractère et en démarche. Le Prophète ﷺ la surnomma « Umm Abiha » (la mère de son père) tant elle prenait soin de lui. Épouse de \'Ali et mère de Hassan et Hussayn. Le Prophète ﷺ l\'appela « la maîtresse des femmes du Paradis ». Elle vécut dans une grande simplicité : quand elle demanda une servante, le Prophète ﷺ lui enseigna le tasbih (SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x). Elle fut la première de sa famille à le rejoindre après sa mort, six mois plus tard.',
        timeline: {
            birth: 'Vers 605 à La Mecque',
            conversion: 'Née et élevée dans l\'Islam',
            keyEvents: [
                'Surnommée az-Zahra (la resplendissante)',
                'Épousa \'Ali ibn Abi Talib',
                'Mère de Hassan et Hussayn',
                'Le Prophète ﷺ l\'appela maîtresse des femmes du Paradis',
                'Enseignement du tasbih de Fatima par le Prophète ﷺ'
            ],
            death: '632 à Médine — 6 mois après le Prophète ﷺ (environ 27 ans)'
        },
        lessons: [
            'La piété surpasse le confort matériel',
            'Le dhikr remplace les biens de ce monde',
            'L\'amour filial est une vertu suprême',
            'La dignité dans la simplicité'
        ],
        hadiths: [
            { arabic: 'فَاطِمَةُ سَيِّدَةُ نِسَاءِ أَهْلِ الْجَنَّةِ', translation: 'Fatima est la maîtresse des femmes du Paradis.', source: 'Bukhari' },
            { arabic: 'فَاطِمَةُ بَضْعَةٌ مِنِّي فَمَنْ أَغْضَبَهَا أَغْضَبَنِي', translation: 'Fatima est une partie de moi. Quiconque la met en colère me met en colère.', source: 'Bukhari' }
        ]
    },
];

