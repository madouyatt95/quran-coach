// ─── Level 2 — Pratique & Compréhension 🕌 ──────────────
// 4 modules: Tajwid fondamental, Makharij, Compréhension sourates, Fiqh simplifié

import type { AcademyLevel } from './types';

export const LEVEL_2_PRATIQUE: AcademyLevel = {
    id: 'pratique',
    title: 'Pratique & Compréhension',
    titleAr: 'الممارسة والفهم',
    description: 'Approfondir la récitation, la compréhension et la pratique',
    icon: '🕌',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
    modules: [
        // ════════════════════════════════════════
        // MODULE 1 — Tajwid Fondamental
        // ════════════════════════════════════════
        {
            id: 'tajweed-fondamental',
            icon: '🎨',
            image: '/academy/tajweed.png',
            title: 'Tajwid Fondamental',
            titleAr: 'التجويد الأساسي',
            description: 'Les règles de récitation avec colorisation visuelle',
            category: 'quran',
            difficulty: 2,
            estimatedMinutes: 35,
            content: [
                {
                    type: 'lesson',
                    title: 'Introduction au Tajwid',
                    sections: [
                        {
                            title: 'Qu\'est-ce que le Tajwid ?',
                            body: 'Le mot « Tajwid » (تجويد) vient de la racine arabe « jawwada » qui signifie « améliorer » ou « embellir ». C\'est la science qui enseigne la prononciation correcte de chaque lettre du Coran.\n\nAllah dit : « وَرَتِّلِ الْقُرْآنَ تَرْتِيلاً » — « Et récite le Coran lentement et clairement. » (Al-Muzzammil, 73:4)',
                            arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
                            phonetic: 'Wa rattili l-Qur\'âna tartîlâ',
                        },
                        {
                            title: 'Pourquoi apprendre le Tajwid ?',
                            body: '1. **Obligation** : Les savants considèrent que réciter le Coran avec Tajwid est un devoir.\n2. **Respect** : Le Coran est la parole d\'Allah, chaque lettre mérite d\'être prononcée correctement.\n3. **Récompense** : Le Prophète ﷺ a dit que celui qui récite le Coran avec difficulté a une double récompense.\n4. **Beauté** : Le Tajwid embellit la récitation et touche les cœurs.',
                        },
                        {
                            title: 'Les 4 règles du Noon Sakin et Tanwin',
                            body: 'Quand un Noon porte un Soukoun (نْ) ou quand il y a un Tanwin (ـًـٍـٌ), il y a 4 règles possibles selon la lettre qui suit :\n\n🟢 **Idgham** — Fusion (6 lettres : ي ر م ل و ن)\n🟠 **Ikhfa** — Dissimulation (15 lettres)\n🔵 **Iqlab** — Transformation en Mim (1 lettre : ب)\n🟣 **Izhar** — Prononciation claire (6 lettres de gorge)',
                        },
                        {
                            title: 'Règle 1 : Idgham (🟢 Fusion)',
                            body: '**Lettres** : ي ر م ل و ن (Ya, Ra, Mim, Lam, Waw, Noun)\n\n**Avec Ghunna** (nasillement) : ي ن م و\n**Sans Ghunna** : ل ر\n\nLe Noon sakin fusionne dans la lettre suivante.',
                            arabic: 'مِن يَّعْمَلْ → « miyya\'mal »',
                            image: '/academy/images/tajwid_idgham.png',
                        },
                        {
                            title: 'Règle 2 : Ikhfa (🟠 Dissimulation)',
                            body: '**15 lettres** : ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك\n\nLe Noon n\'est ni prononcé clairement ni fusionné. Il est « caché » avec un nasillement doux de 2 temps.\n\nAstuce mnémotechnique en arabe : Toutes les lettres SAUF celles d\'Izhar, d\'Idgham et du Ba.',
                            arabic: 'مِنْ ثَمَرَةٍ → nasillement doux avant le ث',
                            image: '/academy/images/tajwid_ikhfa.png',
                        },
                        {
                            title: 'Règle 3 : Iqlab (🔵 Transformation)',
                            body: '**1 seule lettre** : ب (Ba)\n\nLe Noon sakin ou Tanwin se transforme en Mim (م) avec un nasillement de 2 temps avant le Ba.',
                            arabic: 'مِنۢ بَعْدِ → « mim ba\'di »',
                            image: '/academy/images/tajwid_iqlab.png',
                        },
                        {
                            title: 'Règle 4 : Izhar (🟣 Clair)',
                            body: '**6 lettres de gorge** : ء ه ع ح غ خ\n\nLe Noon est prononcé clairement, sans nasillement, sans fusion.',
                            arabic: 'مَنْ أَنصَارِي → Noon clair avant le Hamza',
                            image: '/academy/images/tajwid_izhar.png',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'Qalqalah, Madd & Ghunna',
                    sections: [
                        {
                            title: 'La Qalqalah (🔴 Rebond)',
                            body: '**5 lettres** : ق ط ب ج د (moyen mnémotechnique : « Qoutb Jad »)\n\nQuand l\'une de ces lettres porte un Soukoun (repos), elle produit un léger rebond sonore, comme un écho.\n\n• **Petite Qalqalah** : au milieu du mot\n• **Grande Qalqalah** : à la fin du verset (pause)',
                            arabic: 'قُلْ هُوَ ٱللَّهُ أَحَدْ — rebond sur le dal final',
                            image: '/academy/images/tajwid_qalqalah.png',
                        },
                        {
                            title: 'Le Madd (🔵 Allongement)',
                            body: '**Madd Tabii** (naturel) : 2 temps — sur les lettres ا و ي sans Hamza ni Soukoun après.\n**Madd Muttasil** : 4-5 temps — Hamza dans le même mot.\n**Madd Munfasil** : 4-5 temps — Hamza dans le mot suivant.\n**Madd Lazim** : 6 temps — Soukoun fixe après la lettre de Madd.',
                            image: '/academy/images/tajwid_madd.png',
                        },
                        {
                            title: 'La Ghunna (🟠 Nasillement)',
                            body: 'Vibration nasale de 2 temps. Se produit :\n• Sur un Noon ou Mim avec Chaddah (نّ / مّ)\n• Lors de l\'Idgham avec Ghunna\n• Lors de l\'Ikhfa\n• Lors de l\'Iqlab',
                            arabic: 'إِنَّ اللَّهَ — nasillement sur le Noun doublé',
                            image: '/academy/images/tajwid_ghunna.png',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Tajwid',
                    passThreshold: 80,
                    questions: [
                        { q: 'Quand un Noon sakin est suivi de ب, quelle règle s\'applique ?', options: ['Idgham', 'Ikhfa', 'Iqlab', 'Izhar'], answer: 2, explanation: 'L\'Iqlab : le Noon se transforme en Mim devant le Ba.' },
                        { q: 'Combien de lettres d\'Ikhfa y a-t-il ?', options: ['5', '6', '15', '28'], answer: 2, explanation: 'Il y a 15 lettres d\'Ikhfa (toutes sauf les lettres d\'Izhar, d\'Idgham et le Ba).' },
                        { q: 'Quelles sont les lettres de Qalqalah ?', options: ['ي ر م ل و ن', 'ء ه ع ح غ خ', 'ق ط ب ج د', 'ا و ي'], answer: 2, explanation: 'Les 5 lettres « Qoutb Jad » : ق ط ب ج د.' },
                        { q: 'Combien de temps dure un Madd Tabii ?', options: ['1 temps', '2 temps', '4 temps', '6 temps'], answer: 1, explanation: 'Le Madd naturel (Tabii) dure exactement 2 temps.' },
                        { q: 'Les 6 lettres d\'Izhar sont des lettres de...', options: ['La langue', 'Les lèvres', 'La gorge', 'Le nez'], answer: 2, explanation: 'Les 6 lettres d\'Izhar (ء ه ع ح غ خ) sont toutes des lettres gutturales (gorge).' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 2 — Makharij al-Huruf
        // ════════════════════════════════════════
        {
            id: 'makharij-al-huruf',
            icon: '👄',
            image: '/academy/makharij.png',
            title: 'Makharij al-Huruf',
            titleAr: 'مخارج الحروف',
            description: 'Les points d\'articulation des lettres arabes',
            category: 'quran',
            difficulty: 2,
            estimatedMinutes: 30,
            content: [
                {
                    type: 'lesson',
                    title: 'Les 5 zones d\'articulation',
                    sections: [
                        {
                            title: 'Qu\'est-ce qu\'un Makhraj ?',
                            body: 'Le mot « Makhraj » (مَخرَج) signifie « point de sortie ». C\'est l\'endroit précis dans la bouche, la gorge ou les lèvres d\'où provient le son de chaque lettre arabe.\n\nMaîtriser les Makharij est essentiel pour une récitation correcte du Coran.',
                            image: '/academy/images/makharij_intro.png',
                        },
                        {
                            title: 'Zone 1 — La Gorge (الحَلْق)',
                            body: 'La gorge produit 6 lettres réparties en 3 niveaux :\n\n• **Fond de la gorge** : ء (Hamza) et ه (Ha léger)\n• **Milieu de la gorge** : ع (\'Ayn) et ح (Ha profond)\n• **Haut de la gorge** : غ (Ghayn) et خ (Kha)\n\nCes lettres sont aussi les 6 lettres d\'Izhar.',
                            arabic: 'ء ه ع ح غ خ',
                            image: '/academy/images/makharij_halq.png',
                        },
                        {
                            title: 'Zone 2 — La Langue (اللِّسان)',
                            body: 'La langue est la zone la plus productive avec 18 lettres. Les sous-zones :\n\n• **Base de la langue** : ق (Qaf touche le palais mou) et ك (Kaf un peu plus avant)\n• **Milieu de la langue** : ج (Jim), ش (Shin), ي (Ya)\n• **Bout de la langue** : ت ط د (contre les dents supérieures), ن (bout contre le palais), ل (côtés), ر (vibration)\n• **Bord de la langue** : ص س ز (air entre la langue et les dents), ث ذ ظ (langue entre les dents)',
                            image: '/academy/images/makharij_lisan.png',
                        },
                        {
                            title: 'Zone 3 — Les Lèvres (الشَّفَتَان)',
                            body: 'Les lèvres produisent 4 lettres :\n\n• **Les deux lèvres ensemble** : ب (Ba) expulsé, م (Mim) nasal, و (Waw) arrondi\n• **Lèvre inférieure + dents supérieures** : ف (Fa)',
                            arabic: 'ب م و ف',
                            image: '/academy/images/makharij_shafatayn.png',
                        },
                        {
                            title: 'Zone 4 — La Cavité Nasale (الخَيْشُوم)',
                            body: 'Le nez produit la Ghunna (nasillement) qui accompagne :\n• Le Noon et le Mim doublés (نّ / مّ)\n• L\'Idgham avec Ghunna\n• L\'Ikhfa et l\'Iqlab',
                            image: '/academy/images/makharij_khayshum.png',
                        },
                        {
                            title: 'Zone 5 — Le Vide Buccal (الجَوْف)',
                            body: 'L\'air sans obstacle produit les lettres de Madd (allongement) :\n• ا (Alif) après une Fatha\n• و (Waw) après une Damma\n• ي (Ya) après une Kasra\n\nCe sont les voyelles longues de l\'arabe.',
                            arabic: 'ا و ي',
                            image: '/academy/images/makharij_jawf.png',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Makharij',
                    passThreshold: 80,
                    questions: [
                        { q: 'Combien de zones d\'articulation principales y a-t-il ?', options: ['3', '4', '5', '6'], answer: 2, explanation: '5 zones : gorge, langue, lèvres, nez, vide buccal.' },
                        { q: 'D\'où provient le son du \'Ayn (ع) ?', options: ['Les lèvres', 'Le milieu de la gorge', 'Le bout de la langue', 'Le nez'], answer: 1, explanation: 'Le \'Ayn provient du milieu de la gorge.' },
                        { q: 'Quelle zone produit le plus de lettres ?', options: ['La gorge', 'La langue', 'Les lèvres', 'Le nez'], answer: 1, explanation: 'La langue produit 18 lettres, c\'est la zone la plus productive.' },
                        { q: 'Comment produit-on le Fa (ف) ?', options: ['Deux lèvres', 'Lèvre inférieure + dents supérieures', 'Bout de la langue', 'Gorge'], answer: 1, explanation: 'Le Fa est produit par la lèvre inférieure contre les dents supérieures.' },
                        { q: 'Que produit la cavité nasale ?', options: ['Les voyelles', 'Le Qalqalah', 'La Ghunna', 'Le Madd'], answer: 2, explanation: 'La cavité nasale produit la Ghunna (nasillement).' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 3 — Compréhension des Sourates
        // ════════════════════════════════════════
        {
            id: 'comprehension-sourates',
            icon: '💡',
            image: '/academy/comprehension.png',
            title: 'Compréhension des Sourates',
            titleAr: 'فهم السور',
            description: 'Le sens profond d\'Al-Fatiha et des sourates courtes',
            category: 'quran',
            difficulty: 2,
            estimatedMinutes: 30,
            linkedSurah: 1,
            content: [
                {
                    type: 'lesson',
                    title: 'Tafsir Al-Fatiha',
                    sections: [
                        {
                            title: 'Vue d\'ensemble',
                            body: 'Al-Fatiha est appelée « Oumm al-Kitab » (la Mère du Livre) car elle résume tout le Coran en 7 versets :\n\n• **Versets 1-3** : Louange et glorification d\'Allah\n• **Verset 4** : Le Jour Dernier\n• **Verset 5** : Le pacte entre l\'homme et Allah\n• **Versets 6-7** : La demande de guidance\n\nAllah a dit : « J\'ai divisé la prière entre Moi et Mon serviteur en deux moitiés. » (Hadith Qudsi)',
                            image: '/academy/images/tafsir_importance.png',
                        },
                        {
                            title: 'بِسْمِ اللَّهِ — Au nom d\'Allah',
                            body: '« Bismillah » contient 3 des Noms d\'Allah :\n• **Allah** (اللَّه) : Le Nom propre de Dieu, le plus grand de Ses Noms.\n• **Ar-Rahman** (الرحمن) : Le Tout Miséricordieux — Sa miséricorde englobe toute chose.\n• **Ar-Rahim** (الرحيم) : Le Très Miséricordieux — Sa miséricorde spéciale pour les croyants.\n\nCommencer par « Bismillah » signifie : je cherche la bénédiction d\'Allah pour cette action.',
                            arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                            image: '/academy/images/tafsir_fatiha.png',
                        },
                        {
                            title: 'الْحَمْدُ لِلَّهِ — La louange est à Allah',
                            body: '« Al-Hamd » n\'est pas un simple « merci ». C\'est une louange complète qui reconnaît la perfection d\'Allah en toute circonstance — dans le bonheur ET dans l\'épreuve.\n\n« Rabb al-\'Alamin » signifie qu\'Allah est le Seigneur, l\'Éducateur et le Pourvoyeur de TOUS les mondes : les humains, les djinns, les anges, les animaux, les galaxies.',
                            arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                            image: '/academy/images/tafsir_ikhlas.png',
                        },
                        {
                            title: 'إِيَّاكَ نَعْبُدُ — C\'est Toi seul que nous adorons',
                            body: 'Ce verset est le cœur d\'Al-Fatiha et de tout l\'Islam (le Tawhid) :\n\n1. **Iyyaka na\'boudou** : Nous n\'adorons que Toi (pas d\'intermédiaire, pas d\'idole).\n2. **Wa iyyaka nasta\'in** : Nous ne demandons l\'aide qu\'à Toi.\n\nAllah a dit dans un Hadith Qudsi : « Cette partie est entre Moi et Mon serviteur, et Mon serviteur aura ce qu\'il demande. »',
                            arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                            image: '/academy/images/tafsir_falaq.png',
                        },
                        {
                            title: 'اهْدِنَا الصِّرَاطَ — Guide-nous',
                            body: 'La plus grande demande qu\'un être humain puisse faire : la guidance.\n\n• **As-Sirat al-Mustaqim** : Le chemin droit, celui de l\'Islam.\n• **Ceux que Tu as comblés** : Les prophètes, les véridiques, les martyrs, les pieux.\n• **Non pas ceux qui ont encouru Ta colère** : Ceux qui connaissent la vérité mais ne l\'appliquent pas.\n• **Ni des égarés** : Ceux qui se sont écartés du chemin par ignorance.\n\nNous faisons cette invocation au minimum 17 fois par jour (dans les 5 prières obligatoires).',
                            arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                            image: '/academy/images/tafsir_nas.png',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'Vocabulaire Coranique Essentiel',
                    sections: [
                        { title: 'اللَّه — Allah', body: 'Le Nom propre de Dieu. Il n\'a pas de pluriel ni de féminin. C\'est le Nom le plus utilisé dans le Coran (plus de 2 600 fois).', image: '/academy/images/tafsir_bienfaits.png' },
                        { title: 'رَبّ — Rabb', body: 'Seigneur, Maître, Éducateur, Pourvoyeur. Ce Nom implique qu\'Allah prend soin de Sa création comme un tuteur avec amour.' },
                        { title: 'تَقْوَى — Taqwa', body: 'Piété, conscience d\'Allah. Littéralement : « se protéger » de la colère d\'Allah en obéissant à Ses commandements.' },
                        { title: 'صَبْر — Sabr', body: 'Patience. Dans le Coran, le Sabr a 3 formes : patience dans l\'obéissance, patience face aux épreuves, patience pour éviter les péchés.' },
                        { title: 'تَوْبَة — Tawbah', body: 'Repentir. Littéralement : « retour ». Revenir vers Allah après un péché. Allah aime ceux qui se repentent sincèrement.' },
                        { title: 'ذِكْر — Dhikr', body: 'Rappel, invocation d\'Allah. Inclut toute forme de glorification : Subhan Allah, Al-Hamdu li-Llah, Allahou Akbar, du\'a...' },
                        { title: 'جَنَّة — Jannah', body: 'Le Paradis. Littéralement : « jardin ». Le Coran décrit des niveaux, le plus haut étant Al-Firdaws, directement sous le Trône d\'Allah.' },
                        { title: 'دُعَاء — Du\'a', body: 'Invocation, supplication. Le Prophète ﷺ a dit : « L\'invocation est l\'essence de l\'adoration. » C\'est le lien direct avec Allah.' },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Compréhension',
                    passThreshold: 80,
                    questions: [
                        { q: 'Pourquoi Al-Fatiha est-elle appelée « Oumm al-Kitab » ?', options: ['Car c\'est la plus longue', 'Car elle résume tout le Coran', 'Car elle est la plus ancienne', 'Car elle mentionne tous les prophètes'], answer: 1, explanation: 'Al-Fatiha est la « Mère du Livre » car elle résume les thèmes essentiels du Coran.' },
                        { q: 'Que signifie « Ar-Rahman » ?', options: ['Le Créateur', 'Le Tout Miséricordieux', 'Le Puissant', 'Le Sage'], answer: 1, explanation: 'Ar-Rahman signifie « Le Tout Miséricordieux » — Sa miséricorde englobe toute chose.' },
                        { q: 'Que signifie « Taqwa » ?', options: ['La prière', 'La patience', 'La conscience d\'Allah', 'Le jeûne'], answer: 2, explanation: 'La Taqwa est la conscience d\'Allah, la piété qui pousse à obéir et à éviter les interdits.' },
                        { q: 'Combien de fois dit-on Al-Fatiha par jour dans les prières obligatoires ?', options: ['5', '10', '17', '20'], answer: 2, explanation: '17 rak\'at obligatoires par jour × 1 Fatiha = 17 fois minimum.' },
                        { q: 'Que signifie « Sabr » ?', options: ['Courage', 'Patience', 'Force', 'Sagesse'], answer: 1, explanation: 'Le Sabr est la patience sous 3 formes : dans l\'obéissance, face aux épreuves, et pour éviter les péchés.' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 4 — Fiqh Simplifié
        // ════════════════════════════════════════
        {
            id: 'fiqh-simplifie',
            icon: '⚖️',
            image: '/academy/fiqh.png',
            title: 'Fiqh Simplifié',
            titleAr: 'الفقه المبسط',
            description: 'Jeûne, Zakat, Hajj et prières spéciales',
            category: 'fiqh',
            difficulty: 2,
            estimatedMinutes: 35,
            content: [
                {
                    type: 'lesson',
                    title: 'Le Jeûne (Sawm)',
                    sections: [
                        {
                            title: 'Le jeûne du Ramadan',
                            body: 'Le jeûne du Ramadan est le 4ème pilier de l\'Islam. Il consiste à s\'abstenir de manger, boire et avoir des rapports intimes du Fajr (aube) au Maghrib (coucher du soleil), avec l\'intention de jeûner pour Allah.\n\nAllah dit : « Ô vous qui croyez ! On vous a prescrit le jeûne comme on l\'a prescrit à ceux d\'avant vous, ainsi atteindrez-vous la piété. »',
                            arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ',
                            phonetic: 'Yâ ayyouha l-ladhîna âmanou koutiba \'alaykoumou s-siyâm',
                            image: '/academy/images/fiqh_ramadan.png',
                        },
                        {
                            title: 'Ce qui annule le jeûne',
                            body: '1. Manger ou boire **volontairement**\n2. Les rapports intimes\n3. Le vomissement **provoqué**\n4. Les menstrues / lochies\n\n⚠️ Manger ou boire **par oubli** N\'annule PAS le jeûne. Le Prophète ﷺ a dit : « Celui qui mange ou boit par oubli, qu\'il complète son jeûne, car c\'est Allah qui l\'a nourri. »',
                            illustration: 'Ce qui annule le jeûne',
                        },
                        {
                            title: 'Les jeûnes surérogatoires',
                            body: '• **Lundi et Jeudi** : Le Prophète ﷺ jeûnait régulièrement ces jours, car les actes sont présentés à Allah.\n• **Jours Blancs** : 13, 14 et 15 de chaque mois lunaire\n• **6 jours de Shawwal** : Après le Ramadan, équivalent à jeûner toute l\'année\n• **Jour d\'Arafat** (9 Dhul Hijjah) : Expie les péchés de 2 années\n• **Achoura** (10 Muharram) : Expie les péchés d\'une année',
                            illustration: 'Les jeûnes surérogatoires',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'La Zakat',
                    sections: [
                        {
                            title: 'Le Nissab (seuil minimal)',
                            body: 'La Zakat est obligatoire si l\'on possède au-delà du Nissab pendant un an lunaire complet :\n\n• **Or** : 85 grammes\n• **Argent** : 595 grammes\n• **Argent liquide** : Équivalent en valeur de 85g d\'or\n\nLe taux est de **2,5%** de l\'épargne totale.',
                            image: '/academy/images/fiqh_zakat.png',
                        },
                        {
                            title: 'Les 8 bénéficiaires',
                            body: 'Allah a défini 8 catégories de bénéficiaires dans le verset 60 de Sourate At-Tawbah :\n\n1. Les pauvres (Fuqara)\n2. Les nécessiteux (Masakin)\n3. Ceux qui collectent la Zakat\n4. Ceux dont le cœur est à gagner (nouveaux musulmans)\n5. L\'affranchissement des esclaves\n6. Les endettés\n7. Pour la cause d\'Allah\n8. Les voyageurs en difficulté',
                            arabic: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ',
                            illustration: 'Les 8 bénéficiaires',
                        },
                        {
                            title: 'Zakat al-Fitr',
                            body: 'Obligatoire à la fin du Ramadan pour chaque membre de la famille. Environ 9€ par personne cette année en France (le montant peut varier, référez-vous aux autorités locales). Il est préférable de la donner sous forme de nourriture (un Saa\' ≈ 2,5 kg) si possible. Doit être payée **avant** la prière de l\'Aïd.',
                            illustration: 'Zakat al-Fitr',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'Le Pèlerinage (Hajj)',
                    sections: [
                        {
                            title: 'Les 4 Piliers du Hajj',
                            body: '1. **Al-Ihram** : L\'entrée en état de sacralisation au Miqat\n2. **Arafat** : Le stationnement le 9 Dhul Hijjah (« Le Hajj, c\'est Arafat »)\n3. **Tawaf al-Ifada** : Les 7 tours autour de la Ka\'ba\n4. **Sa\'y** : Les 7 trajets entre Safa et Marwa',
                            image: '/academy/images/fiqh_hajj.png',
                        },
                        {
                            title: 'L\'Ihram',
                            body: 'Vêtements blancs non cousus pour les hommes. Intention prononcée au Miqat.\n\n**Interdictions en état d\'Ihram** :\n✗ Se parfumer\n✗ Se couper les cheveux/ongles\n✗ Relations intimes\n✗ Chasser\n✗ Se couvrir la tête (hommes)',
                            illustration: 'L\'Ihram',
                        },
                        {
                            title: 'Le Tawaf et le Sa\'y',
                            body: '**Tawaf** : 7 tours autour de la Ka\'ba dans le sens inverse des aiguilles d\'une montre, en commençant par la Pierre Noire (Al-Hajar al-Aswad).\n\n**Sa\'y** : 7 trajets entre les collines de Safa et Marwa, en souvenir de Hajar (as) cherchant de l\'eau pour son fils Ismaël (as).',
                            illustration: 'Le Tawaf et le Sa\'y',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Fiqh',
                    passThreshold: 80,
                    questions: [
                        { q: 'Quel est le taux de la Zakat sur l\'épargne ?', options: ['1%', '2,5%', '5%', '10%'], answer: 1, explanation: 'Le taux de la Zakat est de 2,5% sur l\'épargne au-delà du Nissab.' },
                        { q: 'Que signifie « Le Hajj, c\'est Arafat » ?', options: ['Arafat est le seul pilier', 'Arafat est le pilier le plus important', 'Arafat est le premier pilier', 'Arafat est le plus facile'], answer: 1, explanation: 'Arafat est considéré comme le pilier essentiel du Hajj, sans lequel le Hajj n\'est pas valide.' },
                        { q: 'Manger par oubli annule-t-il le jeûne ?', options: ['Oui toujours', 'Non jamais', 'Seulement au Ramadan', 'Seulement le vendredi'], answer: 1, explanation: 'Manger par oubli n\'annule pas le jeûne. C\'est une miséricorde d\'Allah.' },
                        { q: 'Quand doit-on payer la Zakat al-Fitr ?', options: ['Début Ramadan', 'Milieu Ramadan', 'Avant la prière de l\'Aïd', 'Après l\'Aïd'], answer: 2, explanation: 'La Zakat al-Fitr doit être payée AVANT la prière de l\'Aïd al-Fitr.' },
                        { q: 'Combien de tours comporte le Tawaf ?', options: ['3', '5', '7', '10'], answer: 2, explanation: 'Le Tawaf comporte 7 tours autour de la Ka\'ba.' },
                    ],
                },
            ],
        },
    ],
};
