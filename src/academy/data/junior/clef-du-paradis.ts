// ─── Module Junior : La Clef du Paradis 🔑 ──────────────
// 13 étapes pédagogiques pour enfants

import type { JuniorModule } from './types';

export const CLEF_DU_PARADIS: JuniorModule = {
    id: 'clef-du-paradis',
    title: 'La Clef du Paradis',
    emoji: '🔑',
    description: 'Découvre les bases de la foi islamique en 13 étapes magiques !',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    badge: { emoji: '🔑', title: 'La Clef du Paradis' },
    steps: [
        // ═══════════════════════════════════════
        // ÉTAPE 1 — Qui est Allah
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-1',
            number: 1,
            title: 'Qui est Allah ?',
            emoji: '🌟',
            illustration: '🌟',
            lessonTitle: 'Allah, notre Créateur',
            lessonBody: 'Allah est Celui qui a créé tout ce qui existe : le ciel, la terre, les étoiles, les animaux, et toi aussi ! 🌍✨\n\nAllah est Unique. Il n\'a pas de papa, pas de maman, et personne ne Lui ressemble.\n\nIl nous voit, Il nous entend, et Il nous aime quand on fait le bien. 💛\n\nAllah a 99 beaux Noms connus, comme Ar-Rahman (Le Très Miséricordieux) et Al-Khaliq (Le Créateur). Mais Ses Noms sont en réalité innombrables !',
            verse: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
            versePhonetic: 'Qoul houwa Allahou ahad. Allahou s-samad. Lam yalid wa lam youlad. Wa lam yakoun lahou koufouwan ahad.',
            verseTranslation: 'Dis : « Il est Allah, l\'Unique. Allah, le Seul à être imploré. Il n\'a jamais engendré, et n\'a pas été engendré. Et nul ne Lui est égal. »',
            verseRef: 'Sourate Al-Ikhlas (112:1-4)',
            activity: {
                type: 'truefalse',
                instruction: 'Vrai ou Faux ? 🤔',
                statements: [
                    { text: 'Allah a créé le ciel et la terre', correct: true },
                    { text: 'Allah a un papa et une maman', correct: false },
                    { text: 'Allah nous voit et nous entend', correct: true },
                    { text: 'Il y a plusieurs dieux', correct: false },
                ],
            },
            quiz: [
                { question: 'Qui a créé tout ce qui existe ?', options: ['Les humains', 'Allah', 'Les anges', 'Les animaux'], answer: 1, feedback: 'C\'est Allah qui a tout créé ! 🌟' },
                { question: 'Combien de beaux Noms connus d\'Allah y a-t-il ?', options: ['10', '50', '99', '1000'], answer: 2, feedback: 'On connaît 99 beaux Noms d\'Allah (Asma ul-Husna), mais Ses Noms sont innombrables ! ✨' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 2 — Pourquoi Allah nous a créés
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-2',
            number: 2,
            title: 'Pourquoi Allah nous a créés ?',
            emoji: '🤲',
            illustration: '🤲',
            lessonTitle: 'Notre mission sur Terre',
            lessonBody: 'Allah nous a créés pour une raison très spéciale : L\'adorer ! 🤲\n\nAdorer Allah, ça veut dire :\n• Faire la prière (salat) 🕌\n• Être gentil avec les autres 🤝\n• Dire la vérité 💬\n• Aider ceux qui en ont besoin 💝\n\nQuand on adore Allah, on est heureux dans ce monde et dans l\'au-delà !',
            verse: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
            versePhonetic: 'Wa mâ khalaqtou l-jinna wal-insa illâ li ya\'boudoûn.',
            verseTranslation: 'Je n\'ai créé les djinns et les hommes que pour qu\'ils M\'adorent.',
            verseRef: 'Sourate Adh-Dhariyat (51:56)',
            activity: {
                type: 'match',
                instruction: 'Relie chaque action à sa signification ! 🔗',
                pairs: [
                    { left: '🕌 Salat', right: 'Prier Allah' },
                    { left: '🤝 Gentillesse', right: 'Aider les autres' },
                    { left: '💬 Vérité', right: 'Ne pas mentir' },
                    { left: '💝 Charité', right: 'Donner aux pauvres' },
                ],
            },
            quiz: [
                { question: 'Pourquoi Allah nous a-t-Il créés ?', options: ['Pour jouer', 'Pour L\'adorer', 'Pour dormir', 'Pour manger'], answer: 1, feedback: 'Allah nous a créés pour L\'adorer ! 🤲' },
                { question: 'Qu\'est-ce qui rend Allah content ?', options: ['Mentir', 'Être méchant', 'Faire le bien', 'Tricher'], answer: 2, feedback: 'Faire le bien rend Allah content ! 💛' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 3 — Les bienfaits d'Allah
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-3',
            number: 3,
            title: 'Les bienfaits d\'Allah',
            emoji: '🎁',
            illustration: '🎁',
            lessonTitle: 'Les cadeaux d\'Allah',
            lessonBody: 'Allah nous a donné tellement de cadeaux ! 🎁\n\n🌞 Le soleil pour nous éclairer\n💧 L\'eau pour boire\n🍎 Les fruits pour manger\n👀 Les yeux pour voir\n👂 Les oreilles pour écouter\n❤️ Un cœur pour aimer\n👨‍👩‍👧‍👦 Une famille pour nous aimer\n\nTous ces bienfaits viennent d\'Allah. On dit « Al-Hamdulillah » (Louange à Allah) pour Le remercier !',
            verse: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا',
            versePhonetic: 'Wa in ta\'ouddou ni\'mata Allahi lâ touhsoûhâ.',
            verseTranslation: 'Et si vous comptez les bienfaits d\'Allah, vous ne saurez pas les dénombrer.',
            verseRef: 'Sourate An-Nahl (16:18)',
            activity: {
                type: 'order',
                instruction: 'Remets dans l\'ordre pour dire merci à Allah ! 🙏',
                items: ['Al', 'Hamdu', 'Li', 'Llah'],
                correctOrder: [0, 1, 2, 3],
            },
            quiz: [
                { question: 'Que dit-on pour remercier Allah ?', options: ['Bismillah', 'Al-Hamdulillah', 'Allahu Akbar', 'As-Salamu Alaykum'], answer: 1, feedback: 'Al-Hamdulillah signifie "Louange à Allah" ! 🤲' },
                { question: 'Qui nous a donné les yeux, les oreilles et le cœur ?', options: ['Le docteur', 'Les parents', 'Allah', 'L\'école'], answer: 2, feedback: 'C\'est Allah qui nous a créés avec tous ces bienfaits ! 🌟' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 4 — Le Tawhid
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-4',
            number: 4,
            title: 'Le Tawhid',
            emoji: '☝️',
            illustration: '☝️',
            lessonTitle: 'Allah est Unique',
            lessonBody: 'Le Tawhid, c\'est le message le plus important de l\'Islam :\n\n☝️ Allah est UN — Il n\'y a qu\'un seul Dieu.\n\nIl n\'a pas d\'associé, pas de fils, pas de fille.\nPersonne ne peut faire ce qu\'Allah fait :\n• Créer les étoiles ⭐\n• Faire tomber la pluie 🌧️\n• Donner la vie 🌱\n\nC\'est ce que tous les prophètes ont enseigné, d\'Adam jusqu\'à Muhammad ﷺ.',
            verse: 'وَمَا أَرْسَلْنَا مِن قَبْلِكَ مِن رَّسُولٍ إِلَّا نُوحِي إِلَيْهِ أَنَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدُونِ',
            versePhonetic: 'Wa mâ arsalnâ min qablika min rasoulin illâ noûhî ilayhi annahou lâ ilâha illâ ana fa\'boudoûn.',
            verseTranslation: 'Et Nous n\'avons envoyé avant toi aucun messager à qui Nous n\'ayons révélé : « Point de divinité en dehors de Moi ; adorez-Moi donc ! »',
            verseRef: 'Sourate Al-Anbiya (21:25)',
            activity: {
                type: 'truefalse',
                instruction: 'Vrai ou Faux sur le Tawhid ? ☝️',
                statements: [
                    { text: 'Allah est Unique, il n\'y a qu\'un seul Dieu', correct: true },
                    { text: 'On peut adorer les étoiles en plus d\'Allah', correct: false },
                    { text: 'Tous les prophètes ont enseigné le Tawhid', correct: true },
                    { text: 'Allah a un fils', correct: false },
                ],
            },
            quiz: [
                { question: 'Que signifie le Tawhid ?', options: ['Le jeûne', 'L\'unicité d\'Allah', 'La prière', 'Le pèlerinage'], answer: 1, feedback: 'Le Tawhid, c\'est croire qu\'Allah est Unique ! ☝️' },
                { question: 'Combien de dieu(x) y a-t-il ?', options: ['Deux', 'Trois', 'Un seul : Allah', 'Plusieurs'], answer: 2, feedback: 'Il n\'y a qu\'un seul Dieu : Allah ! 🌟' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 5 — Les prophètes
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-5',
            number: 5,
            title: 'Les prophètes',
            emoji: '🕊️',
            illustration: '🕊️',
            lessonTitle: 'Les messagers d\'Allah',
            lessonBody: 'Allah a envoyé des prophètes pour guider les gens vers le bien ! 🕊️\n\nVoici quelques prophètes :\n• Adam — Le premier homme 🌍\n• Nouh (Noé) — Il a construit l\'arche 🚢\n• Ibrahim (Abraham) — L\'ami d\'Allah 💛\n• Moussa (Moïse) — Il a traversé la mer 🌊\n• Issa (Jésus) — Il guérissait les malades 🤲\n• Muhammad ﷺ — Le dernier prophète, le plus aimé 💚\n\nTous les prophètes ont dit : « Adorez Allah seul ! »',
            verse: 'وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَّسُولًا أَنِ اعْبُدُوا اللَّهَ',
            versePhonetic: 'Wa laqad ba\'athnâ fî koulli oummatin rasoulan ani \'boudou Allâh.',
            verseTranslation: 'Nous avons envoyé dans chaque communauté un messager (pour leur dire) : « Adorez Allah. »',
            verseRef: 'Sourate An-Nahl (16:36)',
            activity: {
                type: 'match',
                instruction: 'Relie chaque prophète à son histoire ! 📖',
                pairs: [
                    { left: 'Nouh 🚢', right: 'A construit l\'arche' },
                    { left: 'Moussa 🌊', right: 'A traversé la mer' },
                    { left: 'Ibrahim 💛', right: 'L\'ami d\'Allah' },
                    { left: 'Muhammad ﷺ', right: 'Le dernier prophète' },
                ],
            },
            quiz: [
                { question: 'Qui est le dernier prophète ?', options: ['Ibrahim', 'Moussa', 'Issa', 'Muhammad ﷺ'], answer: 3, feedback: 'Muhammad ﷺ est le dernier des prophètes ! 💚' },
                { question: 'Quel prophète a construit l\'arche ?', options: ['Adam', 'Nouh', 'Moussa', 'Issa'], answer: 1, feedback: 'C\'est le prophète Nouh (Noé) qui a construit l\'arche ! 🚢' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 6 — Le Coran
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-6',
            number: 6,
            title: 'Le Coran',
            emoji: '📖',
            illustration: '📖',
            lessonTitle: 'Le Livre d\'Allah',
            lessonBody: 'Le Coran est la parole d\'Allah ! 📖✨\n\nAllah l\'a révélé au prophète Muhammad ﷺ par l\'ange Jibril (Gabriel).\n\nLe Coran contient :\n• 114 sourates (chapitres) 📚\n• Des histoires magnifiques 📖\n• Les règles pour bien vivre ✅\n• Des invocations (douas) 🤲\n\nQuand on lit le Coran, on gagne des récompenses pour chaque lettre ! Lire « Alif Lam Mim » = 30 récompenses ! 🌟',
            verse: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
            versePhonetic: 'Wa laqad yassarnâ l-Qour\'âna li dh-dhikri fahal min mouddakir.',
            verseTranslation: 'En effet, Nous avons rendu le Coran facile pour la méditation. Y a-t-il quelqu\'un pour réfléchir ?',
            verseRef: 'Sourate Al-Qamar (54:17)',
            activity: {
                type: 'order',
                instruction: 'Remets dans l\'ordre ! Qui a transmis le Coran ? 📖',
                items: ['Allah', 'Jibril (l\'ange)', 'Muhammad ﷺ', 'Les musulmans'],
                correctOrder: [0, 1, 2, 3],
            },
            quiz: [
                { question: 'Combien de sourates y a-t-il dans le Coran ?', options: ['10', '66', '114', '200'], answer: 2, feedback: 'Le Coran contient 114 sourates ! 📖' },
                { question: 'Quel ange a transmis le Coran au Prophète ﷺ ?', options: ['Mikail', 'Israfil', 'Jibril', 'Azrail'], answer: 2, feedback: 'C\'est l\'ange Jibril (Gabriel) qui a transmis le Coran ! ✨' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 7 — Les anges
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-7',
            number: 7,
            title: 'Les anges',
            emoji: '👼',
            illustration: '👼',
            lessonTitle: 'Les serviteurs d\'Allah',
            lessonBody: 'Les anges sont des créatures d\'Allah faites de lumière ! ✨\n\nIls obéissent toujours à Allah et ne désobéissent jamais.\n\nQuelques anges importants :\n• Jibril — Transmet les messages d\'Allah 📜\n• Mikail — S\'occupe de la pluie et la nourriture 🌧️\n• Israfil — Soufflera dans la trompette le Jour Dernier 📯\n• Les anges gardiens — Ils écrivent tes bonnes et mauvaises actions 📝\n\nOn ne peut pas les voir, mais ils sont toujours là !',
            verse: 'بَلْ عِبَادٌ مُّكْرَمُونَ ۝ لَا يَسْبِقُونَهُ بِالْقَوْلِ وَهُم بِأَمْرِهِ يَعْمَلُونَ',
            versePhonetic: 'Bal \'ibâdoun moukramoûn. Lâ yasbiqoûnahou bil-qawli wa houm bi-amrihi ya\'maloûn.',
            verseTranslation: 'Ce sont plutôt des serviteurs honorés. Ils ne devancent pas Son commandement et ils agissent selon Ses ordres.',
            verseRef: 'Sourate Al-Anbiya (21:26-27)',
            activity: {
                type: 'match',
                instruction: 'Relie chaque ange à sa mission ! ✨',
                pairs: [
                    { left: 'Jibril 📜', right: 'Transmet les messages' },
                    { left: 'Mikail 🌧️', right: 'Pluie et nourriture' },
                    { left: 'Israfil 📯', right: 'Soufflera dans la trompette' },
                    { left: 'Anges gardiens 📝', right: 'Écrivent les actions' },
                ],
            },
            quiz: [
                { question: 'De quoi sont faits les anges ?', options: ['De terre', 'De feu', 'De lumière', 'D\'eau'], answer: 2, feedback: 'Les anges sont créés de lumière (nour) ! ✨' },
                { question: 'Est-ce que les anges désobéissent à Allah ?', options: ['Oui, parfois', 'Non, jamais', 'On ne sait pas', 'Oui, souvent'], answer: 1, feedback: 'Les anges n\'ont jamais désobéi à Allah ! Ils Lui obéissent toujours.' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 8 — Le Jour du jugement
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-8',
            number: 8,
            title: 'Le Jour du Jugement',
            emoji: '⚖️',
            illustration: '⚖️',
            lessonTitle: 'Le grand jour',
            lessonBody: 'Un jour, cette vie sur Terre se terminera. Ce sera le Jour du Jugement ! ⚖️\n\nCe jour-là :\n• Tout le monde sera rassemblé devant Allah\n• Nos actions seront pesées sur une grande balance ⚖️\n• Les bonnes actions d\'un côté, les mauvaises de l\'autre\n• Même les toutes petites actions comptent ! \n\nC\'est pour cela qu\'il faut toujours essayer de faire le bien ! 💪',
            verse: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ۝ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ',
            versePhonetic: 'Faman ya\'mal mithqâla dharratin khayran yarah. Wa man ya\'mal mithqâla dharratin sharran yarah.',
            verseTranslation: 'Quiconque fait un bien du poids d\'un atome le verra. Et quiconque fait un mal du poids d\'un atome le verra.',
            verseRef: 'Sourate Az-Zalzalah (99:7-8)',
            activity: {
                type: 'truefalse',
                instruction: 'Vrai ou Faux sur le Jour du Jugement ? ⚖️',
                statements: [
                    { text: 'Les bonnes actions seront pesées sur une balance', correct: true },
                    { text: 'Seules les grandes actions comptent', correct: false },
                    { text: 'Tout le monde sera rassemblé devant Allah', correct: true },
                    { text: 'On peut tricher le Jour du Jugement', correct: false },
                ],
            },
            quiz: [
                { question: 'Que se passera-t-il le Jour du Jugement ?', options: ['Rien', 'Nos actions seront pesées', 'On recommence', 'On disparaît'], answer: 1, feedback: 'Nos actions seront pesées sur la balance ! ⚖️' },
                { question: 'Est-ce que les petites actions comptent ?', options: ['Non, seulement les grandes', 'Oui, chaque petite action compte !', 'On ne sait pas', 'Non jamais'], answer: 1, feedback: 'Même les actions de la taille d\'un grain de poussière comptent ! 🌟' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 9 — Le paradis
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-9',
            number: 9,
            title: 'Le Paradis',
            emoji: '🏞️',
            illustration: '🏞️',
            lessonTitle: 'La plus belle récompense',
            lessonBody: 'Le Paradis (Al-Jannah) est la récompense d\'Allah pour ceux qui font le bien ! 🏞️💚\n\nDans le Paradis :\n• Des jardins magnifiques avec des rivières 🌳💧\n• Des fruits délicieux à volonté 🍇🍎\n• Des palais en or et en perles 🏰\n• Plus jamais de tristesse ni de maladie 😊\n• On pourra voir Allah ! C\'est le plus grand bonheur 🌟\n\nLe Paradis est éternel — ça veut dire pour toujours ! ♾️',
            verse: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ',
            versePhonetic: 'Wa sâri\'oû ilâ maghfiratin min rabbikoum wa jannatin \'ardouha s-samâwâtou wal-ardou ou\'iddat lil-mouttaqîn.',
            verseTranslation: 'Et empressez-vous vers le pardon de votre Seigneur et un Paradis aussi large que les cieux et la terre, préparé pour les pieux.',
            verseRef: 'Sourate Al-Imran (3:133)',
            activity: {
                type: 'truefalse',
                instruction: 'Vrai ou Faux sur le Paradis ? 🏞️',
                statements: [
                    { text: 'Dans le Paradis, il y a des jardins et des rivières', correct: true },
                    { text: 'Le Paradis est temporaire', correct: false },
                    { text: 'On pourra voir Allah au Paradis', correct: true },
                    { text: 'Il y a de la tristesse au Paradis', correct: false },
                ],
            },
            quiz: [
                { question: 'Comment s\'appelle le Paradis en arabe ?', options: ['Ad-Dunya', 'Al-Jannah', 'Al-Akhirah', 'Al-Ard'], answer: 1, feedback: 'Le Paradis s\'appelle Al-Jannah en arabe ! 🏞️' },
                { question: 'Le Paradis dure combien de temps ?', options: ['100 ans', '1000 ans', 'Un jour', 'Pour toujours (éternel)'], answer: 3, feedback: 'Le Paradis est éternel, pour toujours ! ♾️' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 10 — L'enfer
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-10',
            number: 10,
            title: 'L\'Enfer',
            emoji: '🔥',
            illustration: '🔥',
            lessonTitle: 'Le châtiment à éviter',
            lessonBody: 'L\'Enfer (Jahannam) est l\'endroit qu\'Allah a préparé pour ceux qui désobéissent et refusent de croire. 🔥\n\nAllah ne veut pas que Ses serviteurs y aillent !\nC\'est pour cela qu\'Il nous prévient dans le Coran.\n\nPour s\'en protéger :\n• Croire en Allah et L\'adorer ☝️\n• Faire le bien et éviter le mal ✅\n• Demander pardon à Allah quand on se trompe 🤲\n• Être gentil avec les gens 💛\n\nAllah est très Miséricordieux, Il pardonne beaucoup ! 💚',
            verse: 'يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا',
            versePhonetic: 'Yâ ayyouha l-ladhîna âmanoû qoû anfousakoum wa ahlîkoum nâran.',
            verseTranslation: 'Ô vous qui avez cru ! Préservez vos personnes et vos familles d\'un Feu.',
            verseRef: 'Sourate At-Tahrim (66:6)',
            activity: {
                type: 'order',
                instruction: 'Comment se protéger de l\'enfer ? Mets dans l\'ordre ! 🛡️',
                items: ['Croire en Allah', 'Faire le bien', 'Demander pardon', 'Être gentil'],
                correctOrder: [0, 1, 2, 3],
            },
            quiz: [
                { question: 'Comment s\'appelle l\'Enfer en arabe ?', options: ['Al-Jannah', 'Jahannam', 'Al-Ard', 'Ad-Dunya'], answer: 1, feedback: 'L\'Enfer s\'appelle Jahannam en arabe.' },
                { question: 'Comment se protéger de l\'Enfer ?', options: ['Mentir', 'Faire le bien et demander pardon', 'Ne rien faire', 'Tricher'], answer: 1, feedback: 'Faire le bien et demander pardon à Allah ! 🤲' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 11 — Les bonnes actions
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-11',
            number: 11,
            title: 'Les bonnes actions',
            emoji: '⭐',
            illustration: '⭐',
            lessonTitle: 'Chaque bonne action compte !',
            lessonBody: 'Allah aime les bonnes actions, même les plus petites ! ⭐\n\nExemples de bonnes actions :\n• 😊 Sourire — c\'est une aumône !\n• 🚰 Donner de l\'eau à quelqu\'un qui a soif\n• 📚 Apprendre et partager le savoir\n• 🗑️ Enlever un obstacle du chemin\n• 🤲 Dire « Bismillah » avant de manger\n• 💛 Être gentil avec ses parents\n• 🐱 Être bon avec les animaux\n\nLe Prophète ﷺ a dit : « Sourire à ton frère est une aumône. »',
            hadith: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ',
            hadithPhonetic: 'Tabassoumouka fî wajhi akhîka sadaqah.',
            hadithTranslation: 'Ton sourire à ton frère est une aumône.',
            hadithRef: 'Rapporté par At-Tirmidhi',
            activity: {
                type: 'truefalse',
                instruction: 'Est-ce une bonne action ? ⭐',
                statements: [
                    { text: 'Sourire à quelqu\'un', correct: true },
                    { text: 'Mentir à ses parents', correct: false },
                    { text: 'Aider un camarade', correct: true },
                    { text: 'Se moquer des autres', correct: false },
                    { text: 'Donner de l\'eau à un chat', correct: true },
                ],
            },
            quiz: [
                { question: 'Est-ce que sourire est une bonne action ?', options: ['Non', 'Oui, c\'est une aumône !', 'Ça ne compte pas', 'Seulement le vendredi'], answer: 1, feedback: 'Le Prophète ﷺ a dit que sourire est une aumône ! 😊' },
                { question: 'Que dit-on avant de manger ?', options: ['Al-Hamdulillah', 'Allahu Akbar', 'Bismillah', 'As-Salamu Alaykum'], answer: 2, feedback: 'On dit Bismillah (Au nom d\'Allah) avant de manger ! 🍽️' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 12 — Obéir à Allah
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-12',
            number: 12,
            title: 'Obéir à Allah',
            emoji: '🙏',
            illustration: '🙏',
            lessonTitle: 'L\'obéissance, la clef du bonheur',
            lessonBody: 'Obéir à Allah, c\'est suivre Ses règles pour vivre heureux ! 🙏\n\nAllah nous demande :\n• De prier 5 fois par jour 🕌\n• De jeûner pendant le Ramadan 🌙\n• D\'obéir à nos parents 👨‍👩‍👧‍👦\n• D\'être gentil avec tout le monde 💛\n• De dire la vérité 💬\n\nObéir à Allah, c\'est aussi obéir au Prophète ﷺ et à ses parents.\nC\'est comme suivre un chemin lumineux qui mène au Paradis ! ✨🏞️',
            verse: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ',
            versePhonetic: 'Yâ ayyouha l-ladhîna âmanoû atî\'oû Allâha wa atî\'oû r-rasoûla wa oulî l-amri minkoum.',
            verseTranslation: 'Ô vous qui avez cru ! Obéissez à Allah, obéissez au Messager et à ceux d\'entre vous qui détiennent le commandement.',
            verseRef: 'Sourate An-Nisa (4:59)',
            activity: {
                type: 'match',
                instruction: 'Relie chaque ordre d\'Allah à ce qu\'il signifie ! 🙏',
                pairs: [
                    { left: '🕌 Salat', right: 'Prier 5 fois par jour' },
                    { left: '🌙 Sawm', right: 'Jeûner au Ramadan' },
                    { left: '👨‍👩‍👧‍👦 Birr', right: 'Obéir aux parents' },
                    { left: '💬 Sidq', right: 'Dire la vérité' },
                ],
            },
            quiz: [
                { question: 'Combien de fois par jour doit-on prier ?', options: ['1 fois', '3 fois', '5 fois', '10 fois'], answer: 2, feedback: 'On prie 5 fois par jour : Fajr, Dhuhr, Asr, Maghrib et Isha ! 🕌' },
                { question: 'Est-ce qu\'obéir à ses parents est important en Islam ?', options: ['Non', 'Un peu', 'Oui, très important !', 'Ça dépend'], answer: 2, feedback: 'Obéir à ses parents est un des actes les plus aimés d\'Allah ! 👨‍👩‍👧‍👦' },
            ],
        },

        // ═══════════════════════════════════════
        // ÉTAPE 13 — Aimer Allah
        // ═══════════════════════════════════════
        {
            id: 'jr-clef-13',
            number: 13,
            title: 'Aimer Allah',
            emoji: '💚',
            illustration: '💚',
            lessonTitle: 'Le plus bel amour',
            lessonBody: 'Aimer Allah, c\'est le sentiment le plus beau et le plus fort ! 💚\n\nComment montrer qu\'on aime Allah ?\n• En Le mentionnant souvent (Dhikr) 📿\n• En Le remerciant pour Ses bienfaits 🤲\n• En lisant Son Livre (le Coran) 📖\n• En suivant le Prophète ﷺ 💛\n• En étant bon avec Ses créatures 🌍\n\nEt tu sais quoi ? Quand tu aimes Allah... Allah t\'aime aussi ! Et quand Allah t\'aime, Il te guide, te protège, et te prépare la plus belle place au Paradis ! 🏞️✨\n\n🔑 Voilà la clef du Paradis : croire en Allah, L\'aimer et L\'adorer !',
            verse: 'وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِّلَّهِ',
            versePhonetic: 'Wa l-ladhîna âmanoû ashaddou houbban lillâh.',
            verseTranslation: 'Et ceux qui croient ont pour Allah un amour plus intense.',
            verseRef: 'Sourate Al-Baqarah (2:165)',
            activity: {
                type: 'order',
                instruction: 'Remets dans l\'ordre la Clef du Paradis ! 🔑',
                items: ['Croire en Allah', 'L\'aimer', 'L\'adorer', 'Suivre le Prophète ﷺ'],
                correctOrder: [0, 1, 2, 3],
            },
            quiz: [
                { question: 'Quelle est la clef du Paradis ?', options: ['Être riche', 'Croire en Allah et L\'aimer', 'Être célèbre', 'Voyager'], answer: 1, feedback: 'La clef du Paradis, c\'est croire en Allah, L\'aimer et L\'adorer ! 🔑💚' },
                { question: 'Quand tu aimes Allah, que se passe-t-il ?', options: ['Rien', 'Allah t\'aime aussi !', 'Tu deviens triste', 'Tu perds tes amis'], answer: 1, feedback: 'Quand tu aimes Allah, Allah t\'aime aussi ! 💚✨' },
            ],
        },
    ],
};
