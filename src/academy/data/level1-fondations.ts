// ─── Level 1 — Fondations 🌱 ─────────────────────────────
// 4 modules: Bases de l'Islam, Ma première prière, Alphabet arabe, Sourates courtes

import type { AcademyLevel } from './types';

export const LEVEL_1_FONDATIONS: AcademyLevel = {
    id: 'fondations',
    title: 'Fondations',
    titleAr: 'الأسس',
    description: 'Les bases essentielles de la foi et de la pratique',
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    modules: [
        // ════════════════════════════════════════
        // MODULE 1 — Bases de l'Islam
        // ════════════════════════════════════════
        {
            id: 'bases-islam',
            icon: '☪️',
            image: '/academy/bases-islam.png',
            title: 'Bases de l\'Islam',
            titleAr: 'أساسيات الإسلام',
            description: 'Les 5 piliers, les 6 piliers de la foi et la chahada',
            category: 'aqidah',
            difficulty: 1,
            estimatedMinutes: 30,
            content: [
                {
                    type: 'lesson',
                    title: 'Les fondements de la foi',
                    sections: [
                        {
                            title: 'La Chahada — Attestation de foi',
                            body: 'La Chahada est la porte d\'entrée dans l\'Islam. Elle se compose de deux parties :\n1) « Il n\'y a de divinité digne d\'adoration qu\'Allah »\n2) « Muhammad est le Messager d\'Allah »\n\nC\'est le premier des 5 piliers et la condition pour être considéré comme musulman.',
                            arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
                            phonetic: 'Ash-hadou an lâ ilâha illa Llâh, wa ash-hadou anna Muhammadan rasoulou Llâh',
                        },
                        {
                            title: 'Les 5 Piliers de l\'Islam',
                            body: '1. **Chahada** — L\'attestation de foi\n2. **Salat** — Les 5 prières quotidiennes\n3. **Zakat** — L\'aumône obligatoire (2,5%)\n4. **Sawm** — Le jeûne du mois de Ramadan\n5. **Hajj** — Le pèlerinage à la Mecque (si possible)\n\nCes piliers sont les actes d\'adoration fondamentaux que tout musulman doit accomplir.',
                        },
                        {
                            title: 'Les 6 Piliers de la Foi (Iman)',
                            body: '1. **Croire en Allah** — Son unicité, Ses noms et attributs\n2. **Croire aux Anges** — Jibril, Mikail, Israfil, Azrail...\n3. **Croire aux Livres révélés** — Coran, Torah, Évangile, Psaumes, Feuillets\n4. **Croire aux Prophètes** — D\'Adam à Muhammad ﷺ\n5. **Croire au Jour Dernier** — Le jugement, le Paradis et l\'Enfer\n6. **Croire au Destin** — Le bien et le mal viennent d\'Allah',
                        },
                        {
                            title: 'L\'Excellence (Al-Ihsan)',
                            body: '« Que tu adores Allah comme si tu Le voyais, car si tu ne Le vois pas, Lui te voit. »\n\nL\'Ihsan est le plus haut degré de la foi. C\'est la conscience permanente de la présence divine dans chaque acte.',
                            arabic: 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ',
                            phonetic: 'An ta\'buda Llâha ka-annaka tarâhu, fa-in lam takun tarâhu fa-innahou yarâk',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Les bases de l\'Islam',
                    passThreshold: 80,
                    questions: [
                        { q: 'Combien y a-t-il de piliers en Islam ?', options: ['3', '4', '5', '6'], answer: 2, explanation: 'L\'Islam repose sur 5 piliers : Chahada, Salat, Zakat, Sawm et Hajj.' },
                        { q: 'Quel est le premier pilier de l\'Islam ?', options: ['La prière', 'Le jeûne', 'La Chahada', 'Le pèlerinage'], answer: 2, explanation: 'La Chahada (attestation de foi) est le premier et le plus fondamental des piliers.' },
                        { q: 'Combien de piliers de la foi (Iman) existe-t-il ?', options: ['4', '5', '6', '7'], answer: 2, explanation: 'Il y a 6 piliers de la foi : Allah, les Anges, les Livres, les Prophètes, le Jour Dernier, le Destin.' },
                        { q: 'Que signifie « Al-Ihsan » ?', options: ['La patience', 'L\'excellence dans l\'adoration', 'La générosité', 'Le voyage'], answer: 1, explanation: 'Al-Ihsan signifie adorer Allah comme si on Le voyait.' },
                        { q: 'La Zakat représente quel pourcentage de l\'épargne ?', options: ['1%', '2,5%', '5%', '10%'], answer: 1, explanation: 'La Zakat est de 2,5% sur l\'épargne annuelle au-delà du Nissab.' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 2 — Ma Première Prière
        // ════════════════════════════════════════
        {
            id: 'premiere-priere',
            icon: '🕌',
            image: '/academy/premiere-priere.png',
            title: 'Ma Première Prière',
            titleAr: 'صلاتي الأولى',
            description: 'Apprendre les ablutions et la prière pas à pas',
            category: 'fiqh',
            difficulty: 1,
            estimatedMinutes: 40,
            content: [
                {
                    type: 'lesson',
                    title: 'Les Ablutions (Wudu)',
                    sections: [
                        {
                            title: '',
                            body: '',
                            image: '/academy/wudu-steps.png',
                        },
                        {
                            title: 'Pourquoi les ablutions ?',
                            body: 'Les ablutions (Wudu) sont une purification rituelle indispensable avant la prière. Elles préparent le corps et l\'esprit à la rencontre avec Allah.\n\nAllah dit dans le Coran : « Ô vous qui croyez ! Lorsque vous vous levez pour la prière, lavez vos visages... »',
                            arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ',
                            phonetic: 'Yâ ayyouha l-ladhîna âmanou idhâ qumtum ila s-salati fa-ghsilou wujouhakum',
                        },
                        {
                            title: 'Étape 1 — L\'intention et le Bismillah',
                            body: 'Formulez l\'intention dans votre cœur de faire les ablutions pour Allah, puis dites « Bismillah » (Au nom d\'Allah).',
                            arabic: 'بِسْمِ اللَّهِ',
                            phonetic: 'Bismi Llâh',
                        },
                        {
                            title: 'Étape 2 — Laver les mains (×3)',
                            body: 'Lavez les deux mains jusqu\'aux poignets trois fois, en commençant par la main droite. Passez l\'eau entre les doigts.',
                        },
                        {
                            title: 'Étape 3 — Se rincer la bouche et le nez (×3)',
                            body: 'Prenez de l\'eau dans la main droite, rincez la bouche, puis aspirez de l\'eau dans le nez et expulsez-la avec la main gauche. Répétez 3 fois.',
                        },
                        {
                            title: 'Étape 4 — Laver le visage (×3)',
                            body: 'Lavez l\'intégralité du visage : du haut du front à la base du menton, d\'une oreille à l\'autre. Trois fois.',
                        },
                        {
                            title: 'Étape 5 — Laver les avant-bras (×3)',
                            body: 'Lavez le bras droit puis le gauche, des doigts jusqu\'au coude (coude inclus). Trois fois chacun.',
                        },
                        {
                            title: 'Étape 6 — Essuyer la tête et les oreilles (×1)',
                            body: 'Passez les mains mouillées sur toute la tête, d\'avant en arrière puis d\'arrière en avant, une seule fois. Puis nettoyez l\'intérieur des oreilles avec l\'index et l\'extérieur avec le pouce.',
                        },
                        {
                            title: 'Étape 7 — Laver les pieds (×3)',
                            body: 'Lavez le pied droit puis le gauche, des orteils jusqu\'à la cheville (cheville incluse). Passez l\'eau entre les orteils. Trois fois.',
                        },
                        {
                            title: 'Invocation de fin',
                            body: 'Après les ablutions, levez le regard vers le ciel et dites :',
                            arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                            phonetic: 'Ash-hadou an lâ ilâha illa Llâhu wahdahou lâ charîka lah, wa ash-hadou anna Muhammadan \'abdouhou wa rasoulou',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'La Prière pas à pas',
                    sections: [
                        {
                            title: '',
                            body: '',
                            image: '/academy/prayer-positions.png',
                        },
                        {
                            title: 'Les 5 prières obligatoires',
                            body: 'Chaque musulman doit accomplir 5 prières par jour :\n\n• **Fajr** (Sobh) — 2 rak\'at — avant le lever du soleil\n• **Dhuhr** — 4 rak\'at — après le zénith\n• **Asr** — 4 rak\'at — milieu de l\'après-midi\n• **Maghrib** — 3 rak\'at — coucher du soleil\n• **Isha** — 4 rak\'at — nuit',
                        },
                        {
                            title: 'Position 1 — Debout (Qiyam)',
                            body: 'Tenez-vous debout face à la Qibla (direction de la Ka\'ba). Levez les mains aux oreilles et dites « Allahou Akbar » (Takbirat al-Ihram). Posez la main droite sur la gauche sur la poitrine.',
                            arabic: 'اللَّهُ أَكْبَرُ',
                            phonetic: 'Allâhou Akbar',
                        },
                        {
                            title: 'Position 2 — Récitation',
                            body: 'Récitez l\'invocation d\'ouverture (optionnel), puis la Fatiha (obligatoire), puis une autre sourate (dans les 2 premières rak\'at). Dites « Amine » après la Fatiha.',
                        },
                        {
                            title: 'Position 3 — L\'inclinaison (Ruku)',
                            body: 'Dites « Allahou Akbar » et inclinez-vous, le dos droit, les mains sur les genoux. Dites 3 fois :',
                            arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
                            phonetic: 'Subhâna Rabbiya l-\'Adhîm',
                        },
                        {
                            title: 'Position 4 — Se relever du Ruku',
                            body: 'Relevez-vous en disant :',
                            arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ — رَبَّنَا وَلَكَ الْحَمْدُ',
                            phonetic: 'Sami\'a Llâhou liman hamidah — Rabbanâ wa laka l-hamd',
                        },
                        {
                            title: 'Position 5 — La prosternation (Sujud)',
                            body: 'Descendez en prosternation : le front, le nez, les deux paumes, les deux genoux et les orteils touchent le sol. Dites 3 fois :',
                            arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
                            phonetic: 'Subhâna Rabbiya l-A\'lâ',
                        },
                        {
                            title: 'Position 6 — Assis entre les deux prosternations',
                            body: 'Asseyez-vous en disant « Allahou Akbar ». Dites « Rabbi ghfir lî » (Seigneur, pardonne-moi). Puis prosternez-vous à nouveau.',
                            arabic: 'رَبِّ اغْفِرْ لِي',
                            phonetic: 'Rabbi ghfir lî',
                        },
                        {
                            title: 'Position 7 — Le Tachahoud',
                            body: 'Après chaque 2 rak\'at, asseyez-vous et récitez le Tachahoud. Levez uniquement l\'index droit en disant « illa Llâh ».',
                            arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
                            phonetic: 'At-tahiyyâtou li-Llâhi wa s-salawâtou wa t-tayyibât',
                        },
                        {
                            title: 'Position 8 — Le Salam final',
                            body: 'À la fin de la prière, tournez la tête vers la droite puis vers la gauche en disant à chaque côté :',
                            arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
                            phonetic: 'As-salâmou \'alaykoum wa rahmatou Llâh',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — La Prière',
                    passThreshold: 80,
                    questions: [
                        { q: 'Combien de prières obligatoires y a-t-il par jour ?', options: ['3', '4', '5', '7'], answer: 2, explanation: 'Les 5 prières : Fajr, Dhuhr, Asr, Maghrib, Isha.' },
                        { q: 'Par quelle phrase commence-t-on la prière ?', options: ['Bismillah', 'Allahou Akbar', 'Al-Hamdu li-Llâh', 'Subhan Allah'], answer: 1, explanation: 'La Takbirat al-Ihram (Allahou Akbar) marque le début de la prière.' },
                        { q: 'Que dit-on pendant le Ruku ?', options: ['Subhana Rabbiya l-A\'la', 'Subhana Rabbiya l-Adhim', 'Allahou Akbar', 'Amine'], answer: 1, explanation: '« Subhâna Rabbiya l-\'Adhîm » signifie « Gloire à mon Seigneur le Très Grand ».' },
                        { q: 'Combien de rak\'at comporte la prière du Fajr ?', options: ['1', '2', '3', '4'], answer: 1, explanation: 'Le Fajr (Sobh) comporte 2 rak\'at.' },
                        { q: 'Quelle sourate est récitée dans CHAQUE rak\'at ?', options: ['Al-Ikhlas', 'Al-Fatiha', 'Al-Baqarah', 'Ya Sin'], answer: 1, explanation: 'Al-Fatiha est obligatoire dans chaque rak\'at de chaque prière.' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 3 — Alphabet Arabe
        // ════════════════════════════════════════
        {
            id: 'alphabet-arabe',
            icon: '🔤',
            image: '/academy/alphabet-arabe.png',
            title: 'Alphabet Arabe',
            titleAr: 'الحروف العربية',
            description: 'Les 28 lettres : forme, prononciation et position dans le mot',
            category: 'alphabet',
            difficulty: 1,
            estimatedMinutes: 45,
            content: [
                {
                    type: 'lesson',
                    title: 'Les 28 lettres en 5 groupes',
                    sections: [
                        {
                            title: '',
                            body: '',
                            image: '/academy/arabic-groups.png',
                        },
                        { title: 'Groupe 1 — Famille Ba (ب ت ث ن)', body: 'Ces 4 lettres partagent la même forme de base (bol). Seul le nombre et la position des points changent.', arabic: 'ب ت ث ن', phonetic: 'Ba, Ta, Tha, Noun' },
                        { title: '① Alif (ا) — [a/i/u]', body: 'Trait vertical. Support de la Hamza ou voyelle longue. La première lettre de l\'alphabet.', arabic: 'أَحَد — (unique)', phonetic: 'Ahad' },
                        { title: '② Ba (ب) — [b]', body: 'Comme le B français. Un point en dessous du bol.', arabic: 'بِسْمِ — (au nom de)', phonetic: 'Bismi' },
                        { title: '③ Ta (ت) — [t]', body: 'Comme le T français. Deux points au-dessus du bol.', arabic: 'تَوْبَة — (repentir)', phonetic: 'Tawbah' },
                        { title: '④ Tha (ث) — [th]', body: 'Comme le TH anglais (think). Trois points au-dessus du bol.', arabic: 'ثَلَاثَة — (trois)', phonetic: 'Thalâthah' },

                        { title: 'Groupe 2 — Famille Jim (ج ح خ)', body: 'Même forme de base en crochet. Les points changent.', arabic: 'ج ح خ', phonetic: 'Jim, Hâ, Khâ' },
                        { title: '⑤ Jim (ج) — [j]', body: 'Comme le DJ anglais (Jump). Un point au milieu du crochet.', arabic: 'جَنَّة — (paradis)', phonetic: 'Jannah' },
                        { title: '⑥ Hâ (ح) — [ḥ]', body: 'H aspiré profond depuis la gorge. Pas de point.', arabic: 'حَمْد — (louange)', phonetic: 'Hamd' },
                        { title: '⑦ Khâ (خ) — [kh]', body: 'Comme la Jota espagnole ou le CH allemand (Bach). Un point au-dessus.', arabic: 'خَيْر — (bien)', phonetic: 'Khayr' },

                        { title: 'Groupe 3 — Famille Dal (د ذ ر ز)', body: 'Lettres courtes qui NE se lient PAS à la lettre suivante.', arabic: 'د ذ ر ز', phonetic: 'Dâl, Dhâl, Râ, Zây' },
                        { title: '⑧ Dal (د) — [d]', body: 'Comme le D français. Petit triangle arrondi.', arabic: 'دِين — (religion)', phonetic: 'Dîn' },
                        { title: '⑨ Dhal (ذ) — [dh]', body: 'Comme le TH anglais (this). Un point au-dessus du Dal.', arabic: 'ذِكْر — (rappel)', phonetic: 'Dhikr' },
                        { title: '⑩ Râ (ر) — [r]', body: 'R roulé (comme en espagnol ou en arabe). Plus petit que le Dal.', arabic: 'رَحْمَة — (miséricorde)', phonetic: 'Rahmah' },
                        { title: '⑪ Zây (ز) — [z]', body: 'Comme le Z français. Un point au-dessus du Râ.', arabic: 'زَكَاة — (aumône)', phonetic: 'Zakât' },

                        { title: 'Groupe 4 — Famille Sîn (س ش ص ض)', body: 'Lettres avec des dents (3 bosses).', arabic: 'س ش ص ض', phonetic: 'Sîn, Chîn, Sâd, Dâd' },
                        { title: '⑫ Sîn (س) — [s]', body: 'Comme le S français. Trois dents sans point.', arabic: 'سَلَام — (paix)', phonetic: 'Salâm' },
                        { title: '⑬ Chîn (ش) — [ch]', body: 'Comme le CH français (chat). Trois points au-dessus des dents.', arabic: 'شُكْر — (gratitude)', phonetic: 'Choukr' },
                        { title: '⑭ Sâd (ص) — [ṣ]', body: 'S emphatique prononcé avec la langue contre le palais. Corps arrondi.', arabic: 'صَبْر — (patience)', phonetic: 'Sabr' },
                        { title: '⑮ Dâd (ض) — [ḍ]', body: 'D emphatique. Un point au-dessus du Sâd. Lettre unique à la langue arabe !', arabic: 'ضَوْء — (lumière)', phonetic: 'Daw\'' },

                        { title: 'Groupe 5 — Lettres profondes et gutturales', body: 'Lettres avec prononciation plus profonde.', arabic: 'ط ظ ع غ ف ق ك ل م ن ه و ي', phonetic: 'Tâ, Dhâ, \'Ayn, Ghayn, Fâ, Qâf, Kâf, Lâm, Mîm, Noûn, Hâ, Wâw, Yâ' },
                        { title: '⑯ Tâ (ط) — [ṭ]', body: 'T emphatique, son lourd et profond.', arabic: 'طَهَارَة — (purification)', phonetic: 'Tahârah' },
                        { title: '⑰ Dhâ (ظ) — [ẓ]', body: 'Z emphatique. Un point au-dessus du Tâ.', arabic: 'ظُلْم — (injustice)', phonetic: 'Dhoulm' },
                        { title: '⑱ \'Ayn (ع) — [ʿ]', body: 'Son guttural unique venant du fond de la gorge. N\'existe pas en français.', arabic: 'عِلْم — (science)', phonetic: '\'Ilm' },
                        { title: '⑲ Ghayn (غ) — [gh]', body: 'R grasseyé parisien ou gargarisme léger. Point au-dessus du \'Ayn.', arabic: 'غَفُور — (pardonneur)', phonetic: 'Ghafour' },
                        { title: '⑳ Fâ (ف) — [f]', body: 'Comme le F français. Un point au-dessus.', arabic: 'فَجْر — (aube)', phonetic: 'Fajr' },
                        { title: '㉑ Qâf (ق) — [q]', body: 'K profond depuis la gorge. DEUX points au-dessus.', arabic: 'قُرْآن — (Coran)', phonetic: 'Qur\'ân' },
                        { title: '㉒ Kâf (ك) — [k]', body: 'Comme le K français.', arabic: 'كِتَاب — (livre)', phonetic: 'Kitâb' },
                        { title: '㉓ Lâm (ل) — [l]', body: 'Comme le L français. On reconnaît sa boucle.', arabic: 'لَيْلَة — (nuit)', phonetic: 'Laylah' },
                        { title: '㉔ Mîm (م) — [m]', body: 'Comme le M français.', arabic: 'مَسْجِد — (mosquée)', phonetic: 'Masjid' },
                        { title: '㉕ Noûn (ن) — [n]', body: 'Comme le N français. Un point au-dessus du bol.', arabic: 'نُور — (lumière divine)', phonetic: 'Noûr' },
                        { title: '㉖ Hâ (ه) — [h]', body: 'H léger, souffle doux. Différent du Hâ profond (ح).', arabic: 'هُدَى — (guidance)', phonetic: 'Houdâ' },
                        { title: '㉗ Wâw (و) — [w/ou]', body: 'Comme le W anglais (water) ou le OU long.', arabic: 'وَاحِد — (un/unique)', phonetic: 'Wâhid' },
                        { title: '㉘ Yâ (ي) — [y/î]', body: 'Comme le Y français ou le I long. Deux points en dessous.', arabic: 'يَوْم — (jour)', phonetic: 'Yawm' },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — L\'Alphabet Arabe',
                    passThreshold: 80,
                    questions: [
                        { q: 'Combien de lettres compte l\'alphabet arabe ?', options: ['24', '26', '28', '30'], answer: 2, explanation: 'L\'alphabet arabe compte 28 lettres.' },
                        { q: 'Quelle lettre a un son qui n\'existe pas en français ?', options: ['ب (Ba)', 'ع (\'Ayn)', 'ف (Fa)', 'ل (Lam)'], answer: 1, explanation: 'Le \'Ayn (ع) est un son guttural unique à l\'arabe.' },
                        { q: 'Comment se prononce خ (Kha) ?', options: ['Comme K', 'Comme la Jota espagnole', 'Comme G', 'Comme H'], answer: 1, explanation: 'Le Khâ se prononce comme la Jota espagnole ou le CH allemand.' },
                        { q: 'Quelle lettre est unique à la langue arabe ?', options: ['ص (Sad)', 'ض (Dad)', 'ط (Ta)', 'ظ (Dha)'], answer: 1, explanation: 'Le Dâd (ض) est considéré comme la lettre unique à l\'arabe — d\'où le surnom « la langue du Dâd ».' },
                        { q: 'Quelles lettres ne se lient PAS à la lettre suivante ?', options: ['ب ت ث', 'د ذ ر ز و', 'ج ح خ', 'س ش'], answer: 1, explanation: 'Les lettres د ذ ر ز و (et ا) ne se lient pas à la lettre qui suit.' },
                    ],
                },
            ],
        },

        // ════════════════════════════════════════
        // MODULE 4 — Sourates Courtes
        // ════════════════════════════════════════
        {
            id: 'sourates-courtes',
            icon: '📖',
            image: '/academy/sourates-courtes.png',
            title: 'Sourates Courtes',
            titleAr: 'السور القصيرة',
            description: 'Al-Fatiha et les 3 protectrices — liées à la mémorisation',
            category: 'quran',
            difficulty: 1,
            estimatedMinutes: 35,
            linkedSurah: 1, // Link to Al-Fatiha in Hifdh
            content: [
                {
                    type: 'lesson',
                    title: 'Sourate Al-Fatiha',
                    sections: [
                        {
                            title: 'Al-Fatiha — L\'Ouverture',
                            body: 'Al-Fatiha est LA sourate la plus importante du Coran. Elle est récitée dans chaque rak\'at de chaque prière. Le Prophète ﷺ a dit : « Il n\'y a pas de prière pour celui qui ne récite pas l\'Ouverture du Livre ».',
                        },
                        {
                            title: 'Verset 1',
                            body: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
                            arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                            phonetic: 'Bismi Llâhi r-Rahmâni r-Rahîm',
                        },
                        {
                            title: 'Verset 2',
                            body: 'Louange à Allah, Seigneur de l\'univers.',
                            arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                            phonetic: 'Al-hamdou li-Llâhi Rabbi l-\'âlamîn',
                        },
                        {
                            title: 'Verset 3',
                            body: 'Le Tout Miséricordieux, le Très Miséricordieux.',
                            arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
                            phonetic: 'Ar-Rahmâni r-Rahîm',
                        },
                        {
                            title: 'Verset 4',
                            body: 'Maître du Jour de la Rétribution.',
                            arabic: 'مَالِكِ يَوْمِ الدِّينِ',
                            phonetic: 'Mâliki yawmi d-dîn',
                        },
                        {
                            title: 'Verset 5',
                            body: 'C\'est Toi [seul] que nous adorons, et c\'est Toi [seul] dont nous implorons le secours.',
                            arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                            phonetic: 'Iyyâka na\'boudou wa iyyâka nasta\'în',
                        },
                        {
                            title: 'Verset 6',
                            body: 'Guide-nous dans le droit chemin.',
                            arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                            phonetic: 'Ihdinâ s-sirâta l-moustaqîm',
                        },
                        {
                            title: 'Verset 7',
                            body: 'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
                            arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                            phonetic: 'Sirâta l-ladhîna an\'amta \'alayhim, ghayri l-maghdoubi \'alayhim wa la d-dâllîn',
                        },
                    ],
                },
                {
                    type: 'lesson',
                    title: 'Les 3 Sourates Protectrices',
                    sections: [
                        {
                            title: 'Al-Ikhlas (112) — Le Monothéisme Pur',
                            body: 'Sourate qui vaut un tiers du Coran. Elle résume le Tawhid (unicité d\'Allah).',
                            arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
                            phonetic: 'Qoul houwa Llâhou ahad. Allâhou s-samad. Lam yalid wa lam youlad. Wa lam yakoun lahou koufouwan ahad.',
                        },
                        {
                            title: 'Al-Falaq (113) — L\'Aube Naissante',
                            body: 'Protection contre le mal extérieur : la nuit, la sorcellerie, l\'envie.',
                            arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
                            phonetic: 'Qoul a\'oudhou bi-Rabbi l-falaq. Min charri mâ khalaq. Wa min charri ghâsiqin idhâ waqab. Wa min charri n-naffâthâti fi l-\'ouqad. Wa min charri hâsidin idhâ hasad.',
                        },
                        {
                            title: 'An-Nas (114) — Les Hommes',
                            body: 'Protection contre le mal intérieur : les murmures de Satan.',
                            arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
                            phonetic: 'Qoul a\'oudhou bi-Rabbi n-nâs. Maliki n-nâs. Ilâhi n-nâs. Min charri l-waswâsi l-khannâs. Al-ladhî youwaswisou fî soudouri n-nâs. Mina l-jinnati wa n-nâs.',
                        },
                    ],
                },
                {
                    type: 'quiz',
                    title: 'Quiz — Sourates Courtes',
                    passThreshold: 80,
                    questions: [
                        { q: 'Que signifie « Al-Fatiha » ?', options: ['Le rappel', 'L\'ouverture', 'La lumière', 'Le pardon'], answer: 1, explanation: 'Al-Fatiha signifie « L\'Ouverture » du Livre.' },
                        { q: 'Al-Ikhlas vaut quelle portion du Coran ?', options: ['Un quart', 'Un tiers', 'La moitié', 'Deux tiers'], answer: 1, explanation: 'Le Prophète ﷺ a dit que Sourate Al-Ikhlas vaut un tiers du Coran.' },
                        { q: 'Contre quoi protège Sourate An-Nas ?', options: ['Le feu', 'Les murmures de Satan', 'La maladie', 'La pauvreté'], answer: 1, explanation: 'An-Nas protège contre « al-waswâs al-khannâs » — les murmures insidieux de Satan.' },
                        { q: 'Quel verset d\'Al-Fatiha dit « C\'est Toi seul que nous adorons » ?', options: ['Verset 2', 'Verset 3', 'Verset 5', 'Verset 7'], answer: 2, explanation: '« Iyyâka na\'boudou wa iyyâka nasta\'în » est le verset 5 d\'Al-Fatiha.' },
                        { q: 'Combien de versets a Al-Fatiha ?', options: ['5', '6', '7', '8'], answer: 2, explanation: 'Al-Fatiha comporte 7 versets (incluant la Basmala selon certains savants).' },
                    ],
                },
            ],
        },
    ],
};
