// ─── Parcours Thématiques de Lecture du Coran ────────────────
// Conçus pour comprendre le Coran par thème plutôt que dans l'ordre.
// Chaque parcours guide l'utilisateur vers des passages sélectionnés.

export interface ReadingPath {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    emoji: string;
    durationDays: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    days: Array<{
        day: number;
        title: string;
        surah: number;
        startAyah: number;
        endAyah: number;
        fahmNote: string; // Note de compréhension pour ce passage
    }>;
}

export const READING_PATHS: ReadingPath[] = [
    {
        id: 'discover',
        title: 'Découvrir le Coran',
        titleAr: 'اكْتِشَافُ الْقُرْآنِ',
        description: 'Les passages essentiels pour comprendre les fondements du message coranique.',
        emoji: '🌟',
        durationDays: 7,
        difficulty: 'beginner',
        days: [
            { day: 1, title: 'L\'ouverture — Al-Fatiha', surah: 1, startAyah: 1, endAyah: 7, fahmNote: 'La Fatiha est le résumé de tout le Coran : louange, unicité, guidance et invocation.' },
            { day: 2, title: 'Le trône — Ayat Al-Kursi', surah: 2, startAyah: 255, endAyah: 257, fahmNote: 'Le plus grand verset du Coran. Il décrit la majesté absolue d\'Allah et Sa connaissance infinie.' },
            { day: 3, title: 'La pureté — Al-Ikhlas, Al-Falaq, An-Nas', surah: 112, startAyah: 1, endAyah: 4, fahmNote: 'Ces 3 sourates courtes sont la base de la foi : unicité d\'Allah et protection divine.' },
            { day: 4, title: 'La guidance — Début d\'Al-Baqarah', surah: 2, startAyah: 1, endAyah: 20, fahmNote: 'Les 20 premiers versets classent l\'humanité en 3 groupes : croyants, mécréants, hypocrites.' },
            { day: 5, title: 'La miséricorde — Début d\'Ar-Rahman', surah: 55, startAyah: 1, endAyah: 30, fahmNote: 'Sourate de la miséricorde : catalogue des bienfaits d\'Allah, avec la question répétée "Lequel des bienfaits nierez-vous ?"' },
            { day: 6, title: 'La création de l\'homme', surah: 76, startAyah: 1, endAyah: 22, fahmNote: 'Sourate Al-Insan : de la goutte de sperme au Paradis, le parcours de l\'homme reconnaissant.' },
            { day: 7, title: 'Le sens de la vie', surah: 67, startAyah: 1, endAyah: 15, fahmNote: 'Sourate Al-Mulk : la mort et la vie sont un test. La question centrale : "Qui agit le mieux ?"' },
        ]
    },
    {
        id: 'al-kahf-stories',
        title: 'Les 4 Histoires d\'Al-Kahf',
        titleAr: 'قِصَصُ سُورَةِ الْكَهْفِ',
        description: 'Chaque vendredi, les musulmans lisent Sourate Al-Kahf. Comprends ses 4 histoires fondamentales.',
        emoji: '🏔️',
        durationDays: 4,
        difficulty: 'beginner',
        days: [
            { day: 1, title: 'Les jeunes de la caverne — L\'épreuve de la foi', surah: 18, startAyah: 9, endAyah: 26, fahmNote: 'Des jeunes qui sacrifient tout pour leur foi. Leçon : la foi peut isoler, mais Allah protège les sincères.' },
            { day: 2, title: 'Le propriétaire des deux jardins — L\'épreuve de la richesse', surah: 18, startAyah: 32, endAyah: 44, fahmNote: 'La richesse peut aveugler. Le compagnon pauvre avait raison : tout vient d\'Allah et peut disparaître.' },
            { day: 3, title: 'Moussa et Al-Khidr — L\'épreuve de la connaissance', surah: 18, startAyah: 60, endAyah: 82, fahmNote: 'Même le plus savant des hommes ne peut tout comprendre. La sagesse divine dépasse notre logique.' },
            { day: 4, title: 'Dhul-Qarnayn — L\'épreuve du pouvoir', surah: 18, startAyah: 83, endAyah: 98, fahmNote: 'Le pouvoir juste : utiliser l\'autorité pour protéger les faibles et glorifier Allah.' },
        ]
    },
    {
        id: 'mercy',
        title: 'La Miséricorde dans le Coran',
        titleAr: 'الرَّحْمَةُ فِي الْقُرْآنِ',
        description: 'Un parcours de 7 jours sur la miséricorde d\'Allah à travers les versets les plus touchants.',
        emoji: '🤲',
        durationDays: 7,
        difficulty: 'beginner',
        days: [
            { day: 1, title: 'L\'étendue de la miséricorde', surah: 7, startAyah: 154, endAyah: 157, fahmNote: 'La miséricorde d\'Allah embrasse toute chose. Elle est le fondement de Sa relation avec les créatures.' },
            { day: 2, title: 'Ne désespère jamais', surah: 39, startAyah: 53, endAyah: 55, fahmNote: 'Le verset le plus porteur d\'espoir du Coran : aucun péché n\'est trop grand pour le pardon d\'Allah.' },
            { day: 3, title: 'Le Prophète, miséricorde pour les mondes', surah: 21, startAyah: 107, endAyah: 112, fahmNote: 'Muhammad ﷺ est la manifestation vivante de la miséricorde divine pour toute l\'humanité.' },
            { day: 4, title: 'Allah est plus proche que la jugulaire', surah: 50, startAyah: 16, endAyah: 22, fahmNote: 'Allah est plus proche de toi que ta propre veine jugulaire. Il connaît chaque pensée.' },
            { day: 5, title: 'La miséricorde envers les parents', surah: 17, startAyah: 23, endAyah: 25, fahmNote: 'La bienfaisance envers les parents est le 2ème commandement après le Tawhid.' },
            { day: 6, title: 'Il répond à l\'angoissé', surah: 27, startAyah: 62, endAyah: 65, fahmNote: 'Quand tu es en détresse, Allah répond. Il est le Secoureur de celui qui n\'a personne.' },
            { day: 7, title: 'L\'invocation exaucée', surah: 2, startAyah: 186, endAyah: 187, fahmNote: 'La proximité divine est directe : "Je suis proche" — sans intermédiaire, sans délai.' },
        ]
    },
    {
        id: 'trials',
        title: 'Face à l\'épreuve',
        titleAr: 'مُوَاجَهَةُ الِابْتِلَاءِ',
        description: 'Les versets qui te réconfortent et te renforcent dans les moments difficiles.',
        emoji: '💪',
        durationDays: 7,
        difficulty: 'beginner',
        days: [
            { day: 1, title: 'Avec la difficulté vient la facilité', surah: 94, startAyah: 1, endAyah: 8, fahmNote: 'Sourate Ash-Sharh : la promesse double (répétée 2 fois) que chaque difficulté est accompagnée de facilité.' },
            { day: 2, title: 'L\'épreuve est une purification', surah: 2, startAyah: 155, endAyah: 157, fahmNote: 'Les épreuves ne sont pas des punitions mais des tests. La réponse : "Inna lillahi wa inna ilayhi raji\'un."' },
            { day: 3, title: 'La patience est récompensée sans compter', surah: 39, startAyah: 10, endAyah: 12, fahmNote: 'Toutes les bonnes actions ont une mesure de récompense, sauf la patience : elle est illimitée.' },
            { day: 4, title: 'Allah n\'impose jamais au-delà de ta capacité', surah: 2, startAyah: 286, endAyah: 286, fahmNote: 'Si tu traverses une épreuve, c\'est qu\'Allah sait que tu peux la supporter. C\'est une preuve de Sa confiance en toi.' },
            { day: 5, title: 'La subsistance viendra de là où tu ne t\'y attends pas', surah: 65, startAyah: 2, endAyah: 3, fahmNote: 'La Taqwa ouvre des portes invisibles : une issue et une subsistance inattendues.' },
            { day: 6, title: 'L\'histoire de Yusuf — Du puits au palais', surah: 12, startAyah: 1, endAyah: 18, fahmNote: 'Yusuf passe de la trahison au puits à la prison puis au sommet du pouvoir. La patience a toujours une fin heureuse.' },
            { day: 7, title: 'L\'affaire du croyant est étonnante', surah: 64, startAyah: 11, endAyah: 13, fahmNote: 'Toute situation est un bien : la gratitude dans l\'aisance, la patience dans l\'épreuve.' },
        ]
    },
    {
        id: 'prophets',
        title: 'Les Prophètes dans le Coran',
        titleAr: 'الْأَنْبِيَاءُ فِي الْقُرْآنِ',
        description: 'Parcours de 14 jours à travers les grandes histoires prophétiques du Coran.',
        emoji: '📜',
        durationDays: 14,
        difficulty: 'intermediate',
        days: [
            { day: 1, title: 'Adam — La création et la chute', surah: 2, startAyah: 30, endAyah: 39, fahmNote: 'L\'histoire fondatrice : l\'homme comme vicaire, le refus d\'Iblis, et la porte du repentir toujours ouverte.' },
            { day: 2, title: 'Nuh — L\'appel de 950 ans', surah: 71, startAyah: 1, endAyah: 28, fahmNote: 'La persévérance absolue dans la da\'wa. Nuh a appelé son peuple pendant presque un millénaire.' },
            { day: 3, title: 'Ibrahim — L\'ami intime d\'Allah', surah: 37, startAyah: 83, endAyah: 113, fahmNote: 'Ibrahim brise les idoles, est jeté dans le feu, et accepte de sacrifier son fils. La foi à l\'état pur.' },
            { day: 4, title: 'Isma\'il — Le sacrifice', surah: 37, startAyah: 100, endAyah: 111, fahmNote: 'Le père et le fils acceptent tous deux le décret divin. C\'est la soumission parfaite : l\'Islam.' },
            { day: 5, title: 'Yusuf — La plus belle des histoires (Partie 1)', surah: 12, startAyah: 1, endAyah: 35, fahmNote: 'Du rêve prophétique à la trahison des frères puis à la séduction de Zulaykha. La foi comme bouclier.' },
            { day: 6, title: 'Yusuf — Du cachot au trône (Partie 2)', surah: 12, startAyah: 36, endAyah: 76, fahmNote: 'La patience en prison, l\'interprétation des rêves, et l\'ascension au pouvoir par la confiance en Allah.' },
            { day: 7, title: 'Yusuf — Les retrouvailles (Partie 3)', surah: 12, startAyah: 77, endAyah: 111, fahmNote: 'Le pardon de Yusuf envers ses frères est l\'un des moments les plus émouvants du Coran.' },
            { day: 8, title: 'Moussa — Face à Pharaon', surah: 26, startAyah: 10, endAyah: 68, fahmNote: 'Le bégaiement, la peur, puis le courage. Moussa montre qu\'Allah choisit qui Il veut, pas les "parfaits".' },
            { day: 9, title: 'Moussa — La traversée de la mer', surah: 26, startAyah: 52, endAyah: 68, fahmNote: 'Le moment où tout semble perdu : la mer devant, Pharaon derrière. "Non ! Mon Seigneur est avec moi."' },
            { day: 10, title: 'Dawud et Sulayman — La sagesse et le pouvoir', surah: 27, startAyah: 15, endAyah: 44, fahmNote: 'Le pouvoir au service de la gratitude. Sulayman parlait aux animaux mais restait humble devant Allah.' },
            { day: 11, title: 'Ayyub — La patience dans la maladie', surah: 21, startAyah: 83, endAyah: 84, fahmNote: 'L\'archétype de la patience : tout perdu (santé, famille, biens) mais jamais la foi.' },
            { day: 12, title: 'Yunus — Du ventre de la baleine', surah: 21, startAyah: 87, endAyah: 88, fahmNote: 'L\'invocation de Yunus dans les ténèbres est l\'une des plus puissantes du Coran.' },
            { day: 13, title: 'Maryam et \'Isa', surah: 19, startAyah: 16, endAyah: 36, fahmNote: 'La naissance miraculeuse de \'Isa. Maryam : la femme la plus mentionnée du Coran, modèle de piété.' },
            { day: 14, title: 'Muhammad ﷺ — Le sceau des prophètes', surah: 33, startAyah: 40, endAyah: 48, fahmNote: 'Le dernier messager, porteur du message final. Son exemple est une miséricorde pour l\'humanité.' },
        ]
    },
    {
        id: 'justice',
        title: 'Justice et Éthique',
        titleAr: 'الْعَدْلُ وَالْأَخْلَاقُ',
        description: 'Les principes de justice, d\'équité et d\'éthique sociale dans le Coran.',
        emoji: '⚖️',
        durationDays: 10,
        difficulty: 'intermediate',
        days: [
            { day: 1, title: 'La justice même envers l\'ennemi', surah: 5, startAyah: 8, endAyah: 10, fahmNote: 'La justice est un absolu : même ta haine pour un peuple ne justifie pas l\'injustice.' },
            { day: 2, title: 'Soyez fermes dans la justice', surah: 4, startAyah: 135, endAyah: 136, fahmNote: 'La justice contre toi-même ou tes parents si nécessaire. L\'Islam place la vérité au-dessus des liens.' },
            { day: 3, title: 'Les droits des orphelins', surah: 4, startAyah: 1, endAyah: 10, fahmNote: 'Protéger les orphelins est un commandement majeur. Dévorer leur bien est un des 7 péchés capitaux.' },
            { day: 4, title: 'Pas de contrainte en religion', surah: 2, startAyah: 256, endAyah: 257, fahmNote: 'La liberté de conscience est un principe fondamental. La foi ne peut être imposée.' },
            { day: 5, title: 'L\'éthique du commerce', surah: 83, startAyah: 1, endAyah: 6, fahmNote: 'Le tricheur dans la mesure est maudit. L\'honnêteté commerciale est un acte d\'adoration.' },
            { day: 6, title: 'Le bon comportement', surah: 49, startAyah: 11, endAyah: 13, fahmNote: 'Ne vous moquez pas, ne médisez pas, ne vous espionnez pas. La dignité humaine est sacrée.' },
            { day: 7, title: 'L\'entraide et la piété', surah: 5, startAyah: 2, endAyah: 3, fahmNote: 'Entraidez-vous dans le bien et la piété, pas dans le péché et l\'agression.' },
            { day: 8, title: 'La responsabilité individuelle', surah: 6, startAyah: 164, endAyah: 165, fahmNote: 'Personne ne portera le fardeau d\'autrui. Chacun est responsable de ses actes.' },
            { day: 9, title: 'La justice d\'Allah', surah: 21, startAyah: 47, endAyah: 48, fahmNote: 'La balance sera installée au Jour du Jugement. Même le poids d\'un atome comptera.' },
            { day: 10, title: 'L\'appel à la bonté', surah: 16, startAyah: 90, endAyah: 91, fahmNote: 'Allah commande la justice, la bienfaisance et la générosité envers les proches.' },
        ]
    },
    {
        id: 'baqarah',
        title: 'Sourate Al-Baqarah Complète',
        titleAr: 'سُورَةُ الْبَقَرَةِ كَامِلَةً',
        description: 'La plus longue sourate du Coran en 21 jours. 286 versets décomposés par thème.',
        emoji: '📖',
        durationDays: 21,
        difficulty: 'advanced',
        days: [
            { day: 1, title: 'Les 3 groupes humains', surah: 2, startAyah: 1, endAyah: 20, fahmNote: 'Croyants (3-5), mécréants (6-7), hypocrites (8-20). Le Coran commence par classer l\'humanité.' },
            { day: 2, title: 'La création d\'Adam', surah: 2, startAyah: 21, endAyah: 39, fahmNote: 'Le vicaire sur terre, la connaissance des noms, la chute et le repentir.' },
            { day: 3, title: 'Les Fils d\'Israël — Rappel des bienfaits', surah: 2, startAyah: 40, endAyah: 74, fahmNote: 'Allah rappelle Ses bienfaits envers les Fils d\'Israël malgré leur ingratitude répétée.' },
            { day: 4, title: 'Ibrahim et la construction de la Ka\'ba', surah: 2, startAyah: 124, endAyah: 141, fahmNote: 'Ibrahim, le patriarche commun, construit la Maison d\'Allah à La Mecque.' },
            { day: 5, title: 'Le changement de Qibla', surah: 2, startAyah: 142, endAyah: 157, fahmNote: 'Le tournant historique : la communauté musulmane se distingue avec sa propre direction de prière.' },
            { day: 6, title: 'As-Safa et Al-Marwa + les signes', surah: 2, startAyah: 158, endAyah: 177, fahmNote: 'La vraie piété n\'est pas de tourner le visage vers l\'Est ou l\'Ouest mais de croire et agir (2:177).' },
            { day: 7, title: 'Le jeûne du Ramadan', surah: 2, startAyah: 183, endAyah: 187, fahmNote: 'L\'institution du jeûne. Le Coran est descendu pendant le Ramadan.' },
            { day: 8, title: 'Le combat et le Hajj', surah: 2, startAyah: 190, endAyah: 203, fahmNote: 'Les règles du combat : ne pas transgresser. Le Hajj et les rites d\'Ibrahim.' },
            { day: 9, title: 'Le mariage et le divorce', surah: 2, startAyah: 221, endAyah: 242, fahmNote: 'Législation familiale : mariage interreligieux, divorce, allaitement, période d\'attente.' },
            { day: 10, title: 'Les récits des rois', surah: 2, startAyah: 243, endAyah: 253, fahmNote: 'Talut (Saül), Dawud et Jalut (Goliath). La victoire par la foi, pas par le nombre.' },
            { day: 11, title: 'Ayat Al-Kursi — Le Trône', surah: 2, startAyah: 255, endAyah: 257, fahmNote: 'Le sommet du Coran : la description la plus majestueuse d\'Allah en un seul verset.' },
            { day: 12, title: 'Ibrahim et la résurrection', surah: 2, startAyah: 258, endAyah: 261, fahmNote: 'Le dialogue d\'Ibrahim avec Nimrod et la démonstration divine de la résurrection.' },
            { day: 13, title: 'L\'aumône et l\'usure', surah: 2, startAyah: 261, endAyah: 274, fahmNote: 'L\'aumône est comme un grain qui donne 700 épis. L\'usure est une guerre contre Allah.' },
            { day: 14, title: 'Les règles de l\'usure', surah: 2, startAyah: 275, endAyah: 281, fahmNote: 'L\'interdiction ferme de la riba (usure/intérêt). Un des rares cas où Allah déclare la "guerre".' },
            { day: 15, title: 'Le plus long verset — La dette', surah: 2, startAyah: 282, endAyah: 283, fahmNote: 'Le verset le plus long du Coran ! Les règles détaillées de la documentation des dettes.' },
            { day: 16, title: 'La conclusion d\'Al-Baqarah', surah: 2, startAyah: 284, endAyah: 286, fahmNote: 'Les 2 derniers versets protègent celui qui les lit la nuit. "Allah n\'impose rien au-delà de la capacité."' },
            { day: 17, title: 'Révision — Les fondations (v.1-39)', surah: 2, startAyah: 1, endAyah: 39, fahmNote: 'Relecture avec compréhension : les 3 groupes et la création d\'Adam.' },
            { day: 18, title: 'Révision — Les récits (v.40-141)', surah: 2, startAyah: 40, endAyah: 74, fahmNote: 'Relecture : les Fils d\'Israël et les leçons de leur histoire.' },
            { day: 19, title: 'Révision — La législation (v.142-203)', surah: 2, startAyah: 183, endAyah: 203, fahmNote: 'Relecture : Qibla, jeûne, Hajj — les piliers pratiques.' },
            { day: 20, title: 'Révision — La société (v.221-281)', surah: 2, startAyah: 255, endAyah: 261, fahmNote: 'Relecture : Ayat Al-Kursi, dette, aumône — la société juste.' },
            { day: 21, title: 'Célébration — Al-Baqarah terminée !', surah: 2, startAyah: 284, endAyah: 286, fahmNote: 'Tu as complété la plus longue sourate du Coran. Le Prophète ﷺ a dit : "Récitez Al-Baqarah, c\'est une bénédiction."' },
        ]
    },
    {
        id: 'ramadan',
        title: 'Ramadan — 30 Passages Essentiels',
        titleAr: 'رَمَضَانُ — ٣٠ مَقْطَعًا',
        description: 'Un passage clé par jour pendant le mois béni. Lecture + compréhension.',
        emoji: '🌙',
        durationDays: 30,
        difficulty: 'beginner',
        days: [
            { day: 1, title: 'Al-Fatiha — L\'ouverture', surah: 1, startAyah: 1, endAyah: 7, fahmNote: 'Le mois du Coran commence par son résumé : louange, soumission, invocation.' },
            { day: 2, title: 'Le jeûne prescrit', surah: 2, startAyah: 183, endAyah: 185, fahmNote: 'L\'institution du Ramadan. Le Coran a été révélé pendant ce mois.' },
            { day: 3, title: 'La nuit du Destin', surah: 97, startAyah: 1, endAyah: 5, fahmNote: 'Une nuit meilleure que mille mois. Cherche-la dans les 10 dernières nuits.' },
            { day: 4, title: 'Les pieux', surah: 2, startAyah: 2, endAyah: 5, fahmNote: 'Les caractéristiques de ceux qui reçoivent la guidance.' },
            { day: 5, title: 'La patience', surah: 94, startAyah: 1, endAyah: 8, fahmNote: 'Avec la difficulté vient la facilité. Deux fois promis.' },
            { day: 6, title: 'La miséricorde universelle', surah: 7, startAyah: 156, endAyah: 157, fahmNote: 'La miséricorde d\'Allah embrasse toute chose.' },
            { day: 7, title: 'L\'invocation exaucée', surah: 2, startAyah: 186, endAyah: 186, fahmNote: 'Allah est proche et répond. Multiplie les du\'as en ce mois.' },
            { day: 8, title: 'Ayat Al-Kursi', surah: 2, startAyah: 255, endAyah: 255, fahmNote: 'Le plus grand verset. Récite-le chaque nuit.' },
            { day: 9, title: 'Le repentir sincère', surah: 66, startAyah: 8, endAyah: 8, fahmNote: 'Le Ramadan est le mois du repentir. Tawba nasuh = repentir sincère.' },
            { day: 10, title: 'Ya-Sin — Le cœur du Coran', surah: 36, startAyah: 1, endAyah: 12, fahmNote: 'Le début de la sourate appelée "le cœur du Coran".' },
            { day: 11, title: 'L\'unicité d\'Allah', surah: 112, startAyah: 1, endAyah: 4, fahmNote: 'Équivaut à un tiers du Coran. La base du Tawhid.' },
            { day: 12, title: 'La protection divine', surah: 113, startAyah: 1, endAyah: 5, fahmNote: 'Refuge auprès d\'Allah contre le mal extérieur.' },
            { day: 13, title: 'Le refuge en Allah', surah: 114, startAyah: 1, endAyah: 6, fahmNote: 'Refuge contre le mal intérieur : les murmures de Shaytan.' },
            { day: 14, title: 'La gratitude', surah: 14, startAyah: 7, endAyah: 8, fahmNote: 'La gratitude augmente les bienfaits, l\'ingratitude apporte un châtiment sévère.' },
            { day: 15, title: 'La subsistance divine', surah: 65, startAyah: 2, endAyah: 3, fahmNote: 'La Taqwa ouvre des portes et apporte la subsistance d\'où tu ne l\'attends pas.' },
            { day: 16, title: 'La lumière d\'Allah', surah: 24, startAyah: 35, endAyah: 35, fahmNote: 'Le verset de la Lumière : la plus belle métaphore du Coran.' },
            { day: 17, title: 'Le rappel d\'Allah apaise', surah: 13, startAyah: 28, endAyah: 29, fahmNote: 'C\'est par le rappel d\'Allah que les cœurs se tranquillisent.' },
            { day: 18, title: 'La confiance en Allah', surah: 65, startAyah: 3, endAyah: 3, fahmNote: 'Quiconque place sa confiance en Allah, Il lui suffit.' },
            { day: 19, title: 'Al-Mulk — Le Royaume', surah: 67, startAyah: 1, endAyah: 5, fahmNote: 'Protège du châtiment de la tombe. Récite-la chaque nuit.' },
            { day: 20, title: 'Al-Waqi\'ah — L\'événement', surah: 56, startAyah: 1, endAyah: 14, fahmNote: 'Le Jour du Jugement et les 3 catégories de gens.' },
            { day: 21, title: 'Les dernières nuits commencent', surah: 44, startAyah: 1, endAyah: 8, fahmNote: 'La nuit bénie où tout décret est décidé.' },
            { day: 22, title: 'Ar-Rahman — Le Tout Miséricordieux', surah: 55, startAyah: 1, endAyah: 16, fahmNote: 'Le catalogue des bienfaits d\'Allah. Médite chaque verset.' },
            { day: 23, title: 'Multiplie les bonnes actions', surah: 99, startAyah: 1, endAyah: 8, fahmNote: 'Le poids d\'un atome de bien sera vu. Chaque geste compte.' },
            { day: 24, title: 'La course vers le pardon', surah: 3, startAyah: 133, endAyah: 136, fahmNote: 'Empressez-vous vers le pardon et un Paradis vaste comme les cieux.' },
            { day: 25, title: 'Le Paradis décrit', surah: 56, startAyah: 15, endAyah: 40, fahmNote: 'La description détaillée des délices du Paradis.' },
            { day: 26, title: 'La nuit du Destin (rappel)', surah: 97, startAyah: 1, endAyah: 5, fahmNote: 'Cherche Laylat Al-Qadr dans les nuits impaires des 10 dernières nuits.' },
            { day: 27, title: 'Le pardon transforme', surah: 25, startAyah: 68, endAyah: 71, fahmNote: 'Allah transforme les péchés en bonnes actions pour ceux qui se repentent.' },
            { day: 28, title: 'Le voyage nocturne', surah: 17, startAyah: 1, endAyah: 1, fahmNote: 'Le miracle de l\'Isra et du Mi\'raj. La prière a été prescrite cette nuit-là.' },
            { day: 29, title: 'Les derniers versets d\'Al-Baqarah', surah: 2, startAyah: 285, endAyah: 286, fahmNote: 'Le Prophète ﷺ a dit : ces 2 versets suffisent à celui qui les récite la nuit.' },
            { day: 30, title: 'La fin du Ramadan — Gratitude', surah: 2, startAyah: 185, endAyah: 186, fahmNote: 'Le but du Ramadan : "Afin que vous soyez reconnaissants." Alhamdulillah.' },
        ]
    },
];
