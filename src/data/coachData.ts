// ─── Coach Invisible — Données Statiques ─────────────────────
// Sources : Coran, Bukhari, Muslim, Tirmidhi, Abu Dawud, Ibn Kathir
// Tout le contenu est basé sur l'Islam sunnite authentique.

// ─── Types ────────────────────────────────────────────────────

export type EmotionCategory =
    | 'mercy'       // رحمة — Miséricorde
    | 'patience'    // صبر — Patience
    | 'gratitude'   // شكر — Gratitude
    | 'repentance'  // توبة — Repentir
    | 'paradise'    // جنة — Paradis
    | 'warning'     // تحذير — Avertissement
    | 'trust'       // توكل — Confiance en Allah
    | 'death'       // موت — Mort / Au-delà
    | 'justice'     // عدل — Justice
    | 'provision'   // رزق — Subsistance
    | 'family'      // أسرة — Famille
    | 'knowledge'   // علم — Science
    | 'unity'       // وحدة — Unité
    | 'supplication' // دعاء — Invocation
    | 'creation';   // خلق — Création

export interface EmotionalVerse {
    surah: number;
    ayah: number;
    category: EmotionCategory;
    textAr: string;
    textFr: string;
    reflection: string; // Message de réflexion court
}

export interface VerseHadithLink {
    surah: number;
    ayah: number;
    hadithAr: string;
    hadithFr: string;
    source: string; // "Bukhari 6018"
    connection: string; // Explication du lien
}

export interface MilestoneMessage {
    type: 'pages' | 'juz' | 'surah' | 'streak' | 'khatm';
    threshold: number;
    emoji: string;
    title: string;
    message: string;
    duaAr?: string;
    duaFr?: string;
}

export interface PrayerSurahRecommendation {
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    surahs: Array<{ surah: number; name: string; reason: string }>;
}

export interface ComebackMessage {
    minDaysAbsent: number;
    maxDaysAbsent: number;
    emoji: string;
    title: string;
    message: string;
    quoteAr?: string;
    quoteFr?: string;
    source?: string;
}

// ─── Versets Émotionnels ──────────────────────────────────────
// ~200 versets annotés par catégorie émotionnelle

export const EMOTIONAL_VERSES: EmotionalVerse[] = [
    // ── Miséricorde (رحمة) ──
    { surah: 39, ayah: 53, category: 'mercy', textAr: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', textFr: 'Dis : Ô Mes serviteurs qui avez commis des excès, ne désespérez pas de la miséricorde d\'Allah.', reflection: 'Aucun péché n\'est plus grand que la miséricorde d\'Allah. Ce verset est une porte ouverte à tout moment.' },
    { surah: 7, ayah: 156, category: 'mercy', textAr: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ', textFr: 'Et Ma miséricorde embrasse toute chose.', reflection: 'La miséricorde d\'Allah englobe tout l\'univers. Elle précède Sa colère (Bukhari 7404).' },
    { surah: 6, ayah: 54, category: 'mercy', textAr: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ', textFr: 'Votre Seigneur S\'est prescrit à Lui-même la miséricorde.', reflection: 'Allah S\'est imposé la miséricorde comme règle. C\'est une promesse divine.' },
    { surah: 21, ayah: 107, category: 'mercy', textAr: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', textFr: 'Et Nous ne t\'avons envoyé qu\'en miséricorde pour l\'univers.', reflection: 'Le Prophète ﷺ lui-même est une manifestation de la miséricorde divine.' },
    { surah: 2, ayah: 286, category: 'mercy', textAr: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', textFr: 'Allah n\'impose à aucune âme une charge supérieure à sa capacité.', reflection: 'Si tu traverses une épreuve, sache qu\'Allah sait que tu peux la supporter.' },
    { surah: 12, ayah: 87, category: 'mercy', textAr: 'إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ', textFr: 'Seuls les mécréants désespèrent de la bonté d\'Allah.', reflection: 'Le désespoir est contraire à la foi. Tant que tu respires, l\'espoir est là.' },

    // ── Patience (صبر) ──
    { surah: 2, ayah: 153, category: 'patience', textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ', textFr: 'Ô vous qui croyez ! Cherchez secours dans la patience et la prière.', reflection: 'La patience et la prière sont les deux armes du croyant face à l\'épreuve.' },
    { surah: 94, ayah: 5, category: 'patience', textAr: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté vient la facilité.', reflection: 'Allah a répété cette promesse deux fois (94:5-6). La facilité est une certitude.' },
    { surah: 94, ayah: 6, category: 'patience', textAr: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', textFr: 'Certes, avec la difficulté vient la facilité.', reflection: 'La répétition souligne la certitude : une difficulté ne peut pas vaincre deux facilités.' },
    { surah: 3, ayah: 200, category: 'patience', textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا', textFr: 'Ô croyants ! Soyez patients, rivalisez de patience et tenez ferme.', reflection: 'La patience a trois niveaux : endurer, surpasser les autres, et tenir ferme.' },
    { surah: 39, ayah: 10, category: 'patience', textAr: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ', textFr: 'Les patients recevront leur récompense sans compter.', reflection: 'Toutes les bonnes actions ont une mesure de récompense, sauf la patience : elle est illimitée.' },
    { surah: 2, ayah: 155, category: 'patience', textAr: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ', textFr: 'Nous vous éprouverons par la peur, la faim, la perte de biens...', reflection: 'L\'épreuve n\'est pas une punition mais un test. Et elle est toujours partielle (بِشَيْءٍ = "un peu de").' },
    { surah: 2, ayah: 156, category: 'patience', textAr: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', textFr: 'Certes nous sommes à Allah et c\'est vers Lui que nous retournerons.', reflection: 'Cette parole lors de l\'épreuve apporte bénédiction et guidance (2:157).' },

    // ── Gratitude (شكر) ──
    { surah: 14, ayah: 7, category: 'gratitude', textAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', textFr: 'Si vous êtes reconnaissants, Je vous ajouterai.', reflection: 'La gratitude est le multiplicateur divin. Plus tu remercies, plus tu reçois.' },
    { surah: 55, ayah: 13, category: 'gratitude', textAr: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', textFr: 'Lequel des bienfaits de votre Seigneur nierez-vous ?', reflection: 'Cette question répétée 31 fois dans Ar-Rahman invite à contempler chaque bienfait.' },
    { surah: 31, ayah: 12, category: 'gratitude', textAr: 'وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ', textFr: 'Quiconque est reconnaissant, c\'est dans son propre intérêt.', reflection: 'La gratitude profite d\'abord à celui qui la pratique, pas à Allah qui n\'en a pas besoin.' },
    { surah: 16, ayah: 18, category: 'gratitude', textAr: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا', textFr: 'Si vous comptiez les bienfaits d\'Allah, vous ne sauriez les dénombrer.', reflection: 'Chaque respiration est un bienfait. Commence par les évidences qu\'on oublie.' },

    // ── Repentir (توبة) ──
    { surah: 66, ayah: 8, category: 'repentance', textAr: 'تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا', textFr: 'Repentez-vous à Allah d\'un repentir sincère.', reflection: 'Le repentir sincère (nasuh) efface tout ce qui précède. C\'est un nouveau départ.' },
    { surah: 25, ayah: 70, category: 'repentance', textAr: 'يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ', textFr: 'Allah transformera leurs mauvaises actions en bonnes.', reflection: 'Par le repentir sincère, Allah ne se contente pas d\'effacer les péchés : Il les transforme en bonnes actions.' },
    { surah: 4, ayah: 110, category: 'repentance', textAr: 'وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا', textFr: 'Quiconque fait le mal puis demande pardon à Allah trouvera Allah Pardonneur et Miséricordieux.', reflection: 'La porte du pardon est ouverte tant que le soleil ne s\'est pas levé de l\'ouest.' },
    { surah: 3, ayah: 135, category: 'repentance', textAr: 'وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ', textFr: 'Ceux qui, ayant commis un péché, se souviennent d\'Allah et demandent pardon.', reflection: 'Le croyant n\'est pas celui qui ne pèche pas, mais celui qui se repent immédiatement.' },

    // ── Paradis (جنة) ──
    { surah: 3, ayah: 133, category: 'paradise', textAr: 'وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ', textFr: 'Empressez-vous vers le pardon de votre Seigneur et un Paradis aussi vaste que les cieux et la terre.', reflection: 'Le Paradis est plus large que l\'univers tout entier. Allah l\'a préparé pour toi.' },
    { surah: 56, ayah: 89, category: 'paradise', textAr: 'فَرَوْحٌ وَرَيْحَانٌ وَجَنَّتُ نَعِيمٍ', textFr: 'Repos, fragrances et Jardin de délices.', reflection: 'Le Paradis, c\'est le repos absolu après la fatigue de cette vie.' },
    { surah: 32, ayah: 17, category: 'paradise', textAr: 'فَلَا تَعْلَمُ نَفْسٌ مَّا أُخْفِيَ لَهُم مِّن قُرَّةِ أَعْيُنٍ', textFr: 'Aucune âme ne sait ce qui lui est réservé comme joie.', reflection: 'Le Paradis dépasse tout ce que tu peux imaginer. Même les rêves les plus beaux.' },

    // ── Confiance en Allah (توكل) ──
    { surah: 65, ayah: 3, category: 'trust', textAr: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', textFr: 'Et quiconque place sa confiance en Allah, Il lui suffit.', reflection: 'Le Tawakkul n\'est pas l\'inaction. C\'est agir puis s\'en remettre au résultat d\'Allah.' },
    { surah: 3, ayah: 159, category: 'trust', textAr: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ', textFr: 'Lorsque tu es décidé, place ta confiance en Allah.', reflection: 'D\'abord la réflexion et la décision, PUIS la confiance. L\'ordre est important.' },
    { surah: 9, ayah: 51, category: 'trust', textAr: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا', textFr: 'Dis : Rien ne nous atteindra en dehors de ce qu\'Allah a prescrit pour nous.', reflection: 'Ce qui t\'a atteint ne pouvait te manquer, et ce qui t\'a manqué ne pouvait t\'atteindre.' },
    { surah: 8, ayah: 30, category: 'trust', textAr: 'وَيَمْكُرُونَ وَيَمْكُرُ اللَّهُ وَاللَّهُ خَيْرُ الْمَاكِرِينَ', textFr: 'Ils rusaient et Allah rusait. Et Allah est le meilleur des stratèges.', reflection: 'Quand le monde semble conspirer contre toi, rappelle-toi que le plan d\'Allah est toujours meilleur.' },

    // ── Mort / Au-delà (موت) ──
    { surah: 3, ayah: 185, category: 'death', textAr: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ', textFr: 'Toute âme goûtera la mort.', reflection: 'La mort n\'est pas la fin mais le passage. Prépare-toi pour la rencontre.' },
    { surah: 63, ayah: 10, category: 'death', textAr: 'وَأَنفِقُوا مِن مَّا رَزَقْنَاكُم مِّن قَبْلِ أَن يَأْتِيَ أَحَدَكُمُ الْمَوْتُ', textFr: 'Dépensez de ce que Nous vous avons attribué avant que la mort ne vienne à l\'un de vous.', reflection: 'Chaque jour est une chance. N\'attends pas demain pour faire le bien.' },
    { surah: 23, ayah: 99, category: 'death', textAr: 'حَتَّىٰ إِذَا جَاءَ أَحَدَهُمُ الْمَوْتُ قَالَ رَبِّ ارْجِعُونِ', textFr: 'Quand la mort vient à l\'un d\'eux, il dit : Seigneur, renvoie-moi !', reflection: 'Au moment de la mort, tout le monde veut revenir. Profite de ta vie maintenant.' },

    // ── Subsistance (رزق) ──
    { surah: 65, ayah: 2, category: 'provision', textAr: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', textFr: 'Quiconque craint Allah, Il lui donnera une issue et le pourvoira d\'où il ne s\'y attend pas.', reflection: 'La Taqwa ouvre des portes que tu ne soupçonnes même pas.' },
    { surah: 11, ayah: 6, category: 'provision', textAr: 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا', textFr: 'Il n\'y a pas de créature sur terre dont la subsistance n\'incombe à Allah.', reflection: 'Si Allah nourrit la fourmi dans le rocher, Il ne t\'oubliera pas.' },
    { surah: 29, ayah: 60, category: 'provision', textAr: 'وَكَأَيِّن مِّن دَابَّةٍ لَّا تَحْمِلُ رِزْقَهَا اللَّهُ يَرْزُقُهَا وَإِيَّاكُمْ', textFr: 'Combien d\'êtres ne portent pas leur nourriture ! C\'est Allah qui les nourrit, ainsi que vous.', reflection: 'L\'oiseau sort le matin le ventre vide et rentre le soir rassasié. Fais confiance.' },

    // ── Invocation (دعاء) ──
    { surah: 2, ayah: 186, category: 'supplication', textAr: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ', textFr: 'Quand Mes serviteurs t\'interrogent sur Moi, Je suis proche. Je réponds à l\'appel.', reflection: 'Allah n\'a pas dit "dis-leur que Je suis proche". Il a dit directement : "Je suis proche." Sans intermédiaire.' },
    { surah: 40, ayah: 60, category: 'supplication', textAr: 'ادْعُونِي أَسْتَجِبْ لَكُمْ', textFr: 'Invoquez-Moi, Je vous répondrai.', reflection: 'L\'invocation est l\'essence de l\'adoration (Tirmidhi 3372). Allah a promis de répondre.' },

    // ── Science (علم) ──
    { surah: 58, ayah: 11, category: 'knowledge', textAr: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ', textFr: 'Allah élèvera en degrés ceux d\'entre vous qui croient et ceux qui possèdent la science.', reflection: 'Chercher la science est un acte d\'adoration. Chaque mot du Coran que tu comprends t\'élève.' },
    { surah: 20, ayah: 114, category: 'knowledge', textAr: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', textFr: 'Et dis : Seigneur, augmente-moi en science.', reflection: 'La seule chose qu\'Allah a ordonné au Prophète ﷺ de demander davantage : la science.' },
    { surah: 96, ayah: 1, category: 'knowledge', textAr: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', textFr: 'Lis, au nom de ton Seigneur qui a créé.', reflection: 'Le tout premier mot révélé du Coran est "Lis". La connaissance est le fondement.' },

    // ── Création (خلق) ──
    { surah: 51, ayah: 56, category: 'creation', textAr: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', textFr: 'Je n\'ai créé les djinns et les hommes que pour qu\'ils M\'adorent.', reflection: 'Ta raison d\'être est claire. Tout le reste est secondaire.' },
    { surah: 67, ayah: 2, category: 'creation', textAr: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا', textFr: 'Celui qui a créé la mort et la vie pour vous éprouver : qui de vous est le meilleur en œuvres.', reflection: 'La vie est un examen. La question n\'est pas "combien" mais "comment" tu agis.' },

    // ── Justice (عدل) ──
    { surah: 4, ayah: 135, category: 'justice', textAr: 'كُونُوا قَوَّامِينَ بِالْقِسْطِ', textFr: 'Soyez fermes dans la justice.', reflection: 'La justice en Islam dépasse les intérêts personnels et familiaux.' },
    { surah: 5, ayah: 8, category: 'justice', textAr: 'وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا', textFr: 'Que la haine d\'un peuple ne vous incite pas à être injustes.', reflection: 'La justice s\'applique même envers ceux qu\'on n\'aime pas. C\'est le sommet de l\'éthique.' },

    // ── Famille (أسرة) ──
    { surah: 17, ayah: 23, category: 'family', textAr: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا', textFr: 'Ton Seigneur a décrété de n\'adorer que Lui et la bienfaisance envers les parents.', reflection: 'Allah a lié la bienfaisance envers les parents directement au Tawhid. C\'est le 2ème commandement.' },
    { surah: 46, ayah: 15, category: 'family', textAr: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا', textFr: 'Nous avons recommandé à l\'homme la bienfaisance envers ses parents.', reflection: 'Ta mère a souffert pour toi. Le Paradis est sous ses pieds (Nasa\'i 3104).' },

    // ── Unité ──
    { surah: 3, ayah: 103, category: 'unity', textAr: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا', textFr: 'Accrochez-vous tous au câble d\'Allah et ne vous divisez pas.', reflection: 'L\'unité est un commandement divin. La division est le piège de Shaytan.' },

    // ── Sourate Al-Kahf (Les Gens de la Caverne et récits) ──
    { surah: 18, ayah: 10, category: 'supplication', textAr: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا', textFr: 'Quand les jeunes gens se réfugièrent dans la caverne, ils dirent : Ô notre Seigneur, donne-nous de Ta part une miséricorde et assure-nous la droiture dans toute notre affaire.', reflection: 'Face au danger, leur première arme fut l\'invocation (Du\'a). La sécurité ne vient pas des murs de la caverne, mais de la miséricorde d\'Allah.' },
    { surah: 18, ayah: 13, category: 'trust', textAr: 'إِنَّهُمْ فِتْيَةٌ آمَنُوا بِرَبِّهِمْ وَزِدْنَاهُمْ هُدًى', textFr: 'Ce sont des jeunes gens qui croyaient en leur Seigneur ; et Nous leur avons accordé de plus grands moyens de se diriger (dans la bonne voie).', reflection: 'La vraie force de la jeunesse réside dans la foi au Tawhid. Quand tu fais un pas vers Allah avec conviction, Il t\'augmente en guidée.' },
    { surah: 18, ayah: 23, category: 'patience', textAr: 'وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَٰلِكَ غَدًا', textFr: 'Et ne dis jamais, à propos d\'une chose : "Je la ferai demain",', reflection: 'Une prodigieuse leçon d\'humilité accordée au Prophète ﷺ. L\'avenir n\'appartient qu\'à Allah. Personne ne peut s\'y projeter.' },
    { surah: 18, ayah: 24, category: 'trust', textAr: 'إِلَّا أَن يَشَاءَ اللَّهُ ۚ وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ', textFr: '... sans ajouter : "Si Allah le veut", et invoque ton Seigneur quand tu oublies.', reflection: 'L\'oubli est humain, mais le rattrapage est immédiat. "Incha\'Allah" n\'est pas un tic de langage, c\'est la clé de la bénédiction divine.' },
    { surah: 18, ayah: 28, category: 'patience', textAr: 'وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ', textFr: 'Fais preuve de patience avec ceux qui invoquent leur Seigneur matin et soir, désirant Sa Face.', reflection: 'L\'entourage spirituel est ton garde-fou. La compagnie des gens pieux demande de la patience, mais elle te préserve de la Fitna (tentation).' },
    { surah: 18, ayah: 46, category: 'warning', textAr: 'الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا', textFr: 'Les biens et les enfants sont l\'ornement de la vie de ce monde. Cependant, les bonnes œuvres qui persistent ont auprès de ton Seigneur une meilleure récompense...', reflection: 'Rien de matériel ne te suivra dans l\'Au-delà. Seules "Al-Baqiyat as-Salihat" (les bonnes œuvres intemporelles comme le Dhikr) te sauveront.' },

    // ── Histoire 2 : L'homme aux deux jardins (L'illusion de la richesse) ──
    { surah: 18, ayah: 39, category: 'gratitude', textAr: 'وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ', textFr: 'En entrant dans ton jardin, que ne dis-tu : "Telle est la volonté (et la grâce) d\'Allah ! Il n\'y a de puissance que par Allah".', reflection: 'La vraie protection contre le mauvais œil et l\'arrogance est d\'attribuer chaque réussite à Allah. Tout ce que tu possèdes est un prêt divin.' },
    { surah: 18, ayah: 44, category: 'trust', textAr: 'هُنَالِكَ الْوَلَايَةُ لِلَّهِ الْحَقِّ ۚ هُوَ خَيْرٌ ثَوَابًا وَخَيْرٌ عُقْبًا', textFr: 'Là, la protection n\'appartient qu\'à Allah, le Vrai. Il accorde la meilleure récompense et le meilleur résultat.', reflection: 'Face à la ruine, l\'homme réalise son arrogance. La seule assurance véritable dans ce monde, c\'est d\'être sous la protection constante d\'Allah.' },

    // ── Histoire 3 : Moussa et Al-Khidr (L'illusion du savoir) ──
    { surah: 18, ayah: 60, category: 'knowledge', textAr: 'وَإِذْ قَالَ مُوسَىٰ لِفَتَاهُ لَا أَبْرَحُ حَتَّىٰ أَبْلُغَ مَجْمَعَ الْبَحْرَيْنِ أَوْ أَمْضِيَ حُقُبًا', textFr: 'Rappelle-toi quand Moïse dit à son valet : "Je n\'arrêterai pas avant d\'avoir atteint le confluent des deux mers, dussé-je marcher de longues années".', reflection: 'Une détermination absolue pour la science. Moussa (Moïse), un des plus grands Prophètes, est prêt à voyager seul pendant des années pour apprendre un domaine qu\'il ignore.' },
    { surah: 18, ayah: 66, category: 'knowledge', textAr: 'قَالَ لَهُ مُوسَىٰ هَلْ أَتَّبِعُكَ عَلَىٰ أَن تُعَلِّمَنِ مِمَّا عُلِّمْتَ رُشْدًا', textFr: 'Moïse lui dit : "Puis-je te suivre, à la condition que tu m\'apprennes de ce qu\'on t\'a appris concernant une bonne direction ?".', reflection: 'La politesse suprême de l\'étudiant. Malgré son statut gigantesque de messager d\'Allah, Moussa demande humblement la permission d\'être guidé.' },

    // ── Histoire 4 : Dhul-Qarnayn (L'illusion du pouvoir et de l'autorité) ──
    { surah: 18, ayah: 84, category: 'trust', textAr: 'إِنَّا مَكَّنَّا لَهُ فِي الْأَرْضِ وَآتَيْنَاهُ مِن كُلِّ شَيْءٍ سَبَبًا', textFr: 'Vraiment, Nous avons affermi sa puissance sur terre, et Nous lui avons donné moyen d\'arriver à toute chose.', reflection: 'Le sommet du pouvoir. Pourtant, le roi Dhul-Qarnayn savait pertinemment que son armée ou son autorité n\'étaient qu\'un dépôt conféré temporairement par Dieu.' },
    { surah: 18, ayah: 95, category: 'justice', textAr: 'قَالَ مَا مَكَّنِّي فِيهِ رَبِّي خَيْرٌ فَأَعِينُونِي بِقُوَّةٍ أَجْعَلْ بَيْنَكُمْ وَبَيْنَهُمْ رَدْمًا', textFr: 'Il dit : "Ce que mon Seigneur m\'a conféré vaut mieux (que vos dons). Aidez-moi donc avec votre force et je construirai un remblai entre vous et eux".', reflection: 'Un leader pur : il refuse l\'argent des faibles, et s\'en sert plutôt pour les protéger. Mais il reste collectif et participatif en leur disant : "Aidez-moi de votre force".' },

    // ── Sourate Yusuf (La belle patience et l'épreuve) ──
    { surah: 12, ayah: 86, category: 'patience', textAr: 'قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ', textFr: 'Il dit : "Je ne me plains de ma détresse et de mon chagrin qu\'à Allah".', reflection: 'La véritable patience (Sabr Jamil) n\'est pas l\'absence de tristesse, mais de réserver ses plaintes exclusivement à Allah, sans se lamenter aux créatures.' },
    { surah: 12, ayah: 90, category: 'trust', textAr: 'إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', textFr: '"Quiconque craint Allah et patiente... Très certainement, Allah ne fait pas perdre la récompense des bienfaisants".', reflection: 'La conclusion sublime de l\'histoire de Youssouf : la Taqwa (crainte) et le Sabr (patience) sont les clés de la victoire après la pire des injustices.' },
    { surah: 12, ayah: 23, category: 'warning', textAr: 'وَرَاوَدَتْهُ الَّتِي هُوَ فِي بَيْتِهَا عَن نَّفْسِهِ وَغَلَّقَتِ الْأَبْوَابَ وَقَالَتْ هَيْتَ لَكَ ۚ قَالَ مَعَاذَ اللَّهِ', textFr: 'Celle dans la maison de qui il était essaya de le séduire. Elle ferma bien les portes et dit : "Viens, c\'est pour toi". Il dit : "Qu\'Allah me protège !".', reflection: 'Le sommet de la chasteté face à une tentation inévitable. "Ma\'adh Allah" (Je me réfugie en Dieu) est le bouclier suprême du cœur pur.' },

    // ── Sourate Yasin (Le cœur du Coran) ──
    { surah: 36, ayah: 58, category: 'paradise', textAr: 'سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ', textFr: '« Salam » (Paix), parole de la part d\'un Seigneur Très Miséricordieux.', reflection: 'La récompense ultime des gens du Paradis n\'est ni la nourriture ni les palais, mais le salut verbal et spirituel de la part de leur Seigneur Lui-même.' },
    { surah: 36, ayah: 82, category: 'creation', textAr: 'إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ', textFr: 'Quand Il veut une chose, Son commandement se réduit à dire : "Sois", et elle est.', reflection: 'Ne désespère jamais de ta situation. Le changement positif ne prend qu\'un seul instant "Kun" pour le Maître des univers.' },

    // ── Sourate Ar-Rahman (La beauté des bienfaits) ──
    { surah: 55, ayah: 46, category: 'paradise', textAr: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ', textFr: 'Et pour celui qui aura redouté de comparaître devant son Seigneur, il y aura deux jardins.', reflection: 'La peur respectueuse (Khawf) en privé est la clé du Paradis. Une simple hésitation avant un péché pour l\'amour d\'Allah te garantit cette récompense.' },
    { surah: 55, ayah: 60, category: 'justice', textAr: 'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ', textFr: 'Y a-t-il d\'autre récompense pour le bien, que le bien ?', reflection: 'La loi de l\'univers divin : toute belle action, même un sourire ou une aumône secrète, est remboursée en excellence par Le Créateur.' },

    // ── Sourate Al-Mulk (La Souveraineté) ──
    { surah: 67, ayah: 1, category: 'trust', textAr: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', textFr: 'Béni soit Celui dans la main de qui est la royauté, et Il est Omnipotent.', reflection: 'Le verset qui efface l\'anxiété. Quoi qu\'il se passe dans le monde ou dans ta vie, le Royaume entier de l\'univers est dans Sa Main.' },
    { surah: 67, ayah: 13, category: 'knowledge', textAr: 'وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ', textFr: 'Que vous cachiez votre parole ou la divulguiez, Il connaît bien le contenu des poitrines.', reflection: 'La sincérité du cœur est ce qui compte le plus. Tes intentions secrètes que personne ne voit sont connues et valorisées par Ton Seigneur.' },
    { surah: 67, ayah: 15, category: 'provision', textAr: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ', textFr: 'C\'est Lui qui vous a soumis la terre : parcourez donc ses grandes étendues, et mangez de ce qu\'Il vous fournit.', reflection: 'L\'Islam équilibre le spirituel et l\'effort matériel. La terre est soumise, mais il faut "parcourir" et travailler pour récolter la subsistance.' },

    // ── 1. Joyaux de Juz 'Amma ──
    { surah: 93, ayah: 3, category: 'mercy', textAr: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ', textFr: 'Ton Seigneur ne t\'a ni abandonné ni détesté.', reflection: 'Révélé au Prophète quand il croyait avoir été abandonné par Dieu après des jours sans révélation. C\'est le remède divin ultime contre le sentiment de rejet et la dépression spirituelle.' },
    { surah: 103, ayah: 1, category: 'warning', textAr: 'وَالْعَصْرِ ۙ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', textFr: 'Par le Temps ! L\'homme est certes en perdition.', reflection: 'Le paradoxe de la vie : chaque seconde qui passe est un capital qui fond. L\'inaction n\'est pas la neutralité, c\'est la définition même de la perte.' },
    { surah: 108, ayah: 1, category: 'gratitude', textAr: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', textFr: 'Nous t\'avons certes accordé l\'Abondance (Al-Kawthar).', reflection: 'Révélé quand les ennemis se moquaient de lui après le décès de ses fils. Allah lui répond : l\'héritage ne se mesure pas au sang, mais à "l\'abondance" éternelle octroyée.' },

    // ── 2. Sourate Luqman (L'éducation) ──
    { surah: 31, ayah: 17, category: 'family', textAr: 'يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ', textFr: 'Ô mon enfant, accomplis la Salât, commande le convenable, interdis le blâmable et endure ce qui t\'arrive.', reflection: 'La feuille de route d\'une éducation réussie par le sage Luqman : le lien avec Dieu (prière), le lien avec la société (le bien), et le blindage psychologique (la patience).' },
    { surah: 31, ayah: 18, category: 'justice', textAr: 'وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا', textFr: 'Et ne détourne pas ton visage des hommes, et ne foule pas la terre avec arrogance.', reflection: 'Le sommet du savoir-vivre : ne jamais regarder quelqu\'un de haut (le visage détourné) ni marcher avec suffisance. L\'humilité est la marque des grands.' },

    // ── 3. Sourate Al-Hujurat (L'éthique sociale) ──
    { surah: 49, ayah: 6, category: 'knowledge', textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا أَن تُصِيبُوا قَوْمًا بِجَهَالَةٍ', textFr: 'Ô vous qui avez cru ! Si un pervers vous apporte une nouvelle, voyez bien clair (de crainte) que par inadvertance vous ne portiez atteinte à des gens.', reflection: 'La méthode divine de vérification des sources à l\'ère des rumeurs et des "fake news". Ne jamais relayer sans preuve formelle.' },
    { surah: 49, ayah: 12, category: 'warning', textAr: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ ۖ وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا', textFr: 'Ô vous qui avez cru ! Évitez de trop conjecturer... Et ne vous espionnez pas, et ne médisez pas les uns des autres.', reflection: 'Les trois maladies mortelles du cœur social : prêter de mauvaises intentions (la supposition), fouiller dans le téléphone/la vie des autres (l\'espionnage) et parler dans le dos (la médisance).' },

    // ── 4. Sourate Al-Baqarah (Les hautes protections) ──
    { surah: 2, ayah: 255, category: 'trust', textAr: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', textFr: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par lui-même. Ni somnolence ni sommeil ne Le saisissent.', reflection: 'Ayat Al-Kursi, le plus grand verset du Coran. Une description majestueuse de la toute-puissance d\'Allah. Le lire procure une protection infaillible.' },
    { surah: 2, ayah: 37, category: 'repentance', textAr: 'فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ', textFr: 'Puis Adam reçut de son Seigneur des paroles, et Allah agréa son repentir, car c\'est Lui certes, le Repentant, le Miséricordieux.', reflection: 'Contrairement à Satan qui justifia son erreur par arrogance, Adam et Ève admirent leur faute immédiatement. Reconnaître son erreur est la première étape du retour vers Dieu.' },

    // ── 5. Sourate An-Nur (Le scandale et la lumière) ──
    { surah: 24, ayah: 15, category: 'warning', textAr: 'إِذْ تَلَقَّوْنَهُ بِأَلْسِنَتِكُمْ وَتَقُولُونَ بِأَفْوَاهِكُم مَّا لَيْسَ لَكُم بِهِ عِلْمٌ وَتَحْسَبُونَهُ هَيِّنًا وَهُوَ عِندَ اللَّهِ عَظِيمٌ', textFr: 'Quand vous le colportiez avec vos langues et disiez de vos bouches ce dont vous n\'aviez aucun savoir ; et vous le comptiez comme insignifiant alors qu\'auprès d\'Allah cela est énorme.', reflection: 'La calomnie contre Aïcha. Un verset terrifiant illustrant qu\'un simple bruit de couloir (diffamation) balancé à la légère avec la langue, peut peser des tonnes auprès d\'Allah.' },
    { surah: 24, ayah: 22, category: 'mercy', textAr: 'وَلْيَعْفُوا وَلْيَصْفَحُوا ۗ أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ', textFr: '...Qu\'ils pardonnent et absolvent. N\'aimez-vous pas qu\'Allah vous pardonne ?', reflection: 'Révélé au père d\'Aïcha, Abu Bakr, lui demandant de pardonner à ceux qui ont diffamé sa propre fille. Le pardon inter-humain est la clé de voûte pour mériter le pardon divin.' },

    // ── 6. Maryam & Ta-Ha (L'invocation exaucée) ──
    { surah: 19, ayah: 4, category: 'supplication', textAr: 'قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ أَكُن بِدُعَائِكَ رَبِّ شَقِيًّا', textFr: 'Il dit : "Ô mon Seigneur, mes os sont affaiblis et ma tête s\'est enflammée de cheveux blancs. Cependant, je n\'ai jamais été malheureux (déçu) en Te priant, ô mon Seigneur".', reflection: 'Le Du\'a magnifique de Zakariya. Malgré son âge extrême et toutes les analyses médicales contre lui, il utilise son "historique" de prières exaucées pour continuer à demander l\'impossible.' },
    { surah: 20, ayah: 25, category: 'supplication', textAr: 'قَالَ رَبِّ اشْرَحْ لِي صَدْرِي', textFr: 'Il [Moïse] dit : "Seigneur, ouvre-moi ma poitrine (à la confiance)...', reflection: 'Face au tyran mortel Pharaon, Moussa ne demande ni armée ni épée. Il demande une ouverture de la poitrine. Car la victoire à l\'extérieur commence toujours par la sérénité profonde à l\'intérieur.' },
];

// ─── Liens Verset ↔ Hadith ───────────────────────────────────
// ~100 paires verset + hadith authentique

export const VERSE_HADITH_LINKS: VerseHadithLink[] = [
    // Patience
    { surah: 94, ayah: 5, hadithAr: 'عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ', hadithFr: 'L\'affaire du croyant est étonnante : tout est un bien pour lui.', source: 'Muslim 2999', connection: 'Le verset promet la facilité après la difficulté, et le hadith confirme que chaque situation est un bien pour le croyant.' },
    { surah: 2, ayah: 155, hadithAr: 'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ', hadithFr: 'Aucune fatigue, maladie ou tristesse ne touche le musulman sans qu\'Allah ne lui efface des péchés.', source: 'Bukhari 5641', connection: 'Les épreuves mentionnées dans le verset sont en réalité des moyens de purification.' },

    // Miséricorde
    { surah: 39, ayah: 53, hadithAr: 'لَلَّهُ أَرْحَمُ بِعِبَادِهِ مِنْ هَذِهِ بِوَلَدِهَا', hadithFr: 'Allah est plus miséricordieux envers Ses serviteurs que cette mère envers son enfant.', source: 'Bukhari 5999', connection: 'Le verset dit de ne pas désespérer de la miséricorde, et le hadith illustre son immensité.' },
    { surah: 7, ayah: 156, hadithAr: 'إِنَّ رَحْمَتِي سَبَقَتْ غَضَبِي', hadithFr: 'Ma miséricorde a précédé Ma colère.', source: 'Bukhari 7404', connection: 'La miséricorde qui embrasse tout est la règle ; la colère est l\'exception.' },

    // Confiance
    { surah: 65, ayah: 3, hadithAr: 'لَوْ أَنَّكُمْ تَتَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ', hadithFr: 'Si vous placiez votre confiance en Allah comme il se doit, Il vous pourvoirait comme Il pourvoit les oiseaux.', source: 'Tirmidhi 2344', connection: 'Le verset promet la subsistance aux craignants, le hadith illustre avec l\'oiseau qui sort le ventre vide.' },

    // Repentir
    { surah: 66, ayah: 8, hadithAr: 'اللَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ رَاحِلَتِهِ', hadithFr: 'Allah est plus joyeux du repentir de Son serviteur que celui qui retrouve son chameau perdu.', source: 'Muslim 2747', connection: 'Le verset appelle au repentir sincère ; le hadith montre combien Allah l\'attend avec joie.' },
    { surah: 25, ayah: 70, hadithAr: 'التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ', hadithFr: 'Celui qui se repent d\'un péché est comme celui qui n\'a pas de péché.', source: 'Ibn Majah 4250', connection: 'Le verset va encore plus loin : non seulement les péchés sont effacés, mais transformés en bonnes actions.' },

    // Science
    { surah: 96, ayah: 1, hadithAr: 'مَنْ سَلَكَ طَرِيقًا يَطْلُبُ فِيهِ عِلْمًا سَلَكَ اللَّهُ بِهِ طَرِيقًا مِنْ طُرُقِ الْجَنَّةِ', hadithFr: 'Quiconque emprunte un chemin pour chercher la science, Allah lui facilite un chemin vers le Paradis.', source: 'Muslim 2699', connection: 'Le 1er mot révélé est "Lis". Chercher la science est un chemin vers le Paradis.' },
    { surah: 58, ayah: 11, hadithAr: 'فَضْلُ الْعَالِمِ عَلَى الْعَابِدِ كَفَضْلِ الْقَمَرِ عَلَى سَائِرِ الْكَوَاكِبِ', hadithFr: 'La supériorité du savant sur le dévot est comme celle de la lune sur les étoiles.', source: 'Abu Dawud 3641', connection: 'Le verset dit qu\'Allah élève les savants en degrés, le hadith précise l\'ampleur de cette élévation.' },

    // Prière
    { surah: 2, ayah: 153, hadithAr: 'إِنَّ فِي الصَّلَاةِ شِفَاءً', hadithFr: 'Il y a dans la prière une guérison.', source: 'Ibn Majah (faible mais soutenu par 2:153)', connection: 'Le verset associe la patience à la prière comme secours. La prière est un refuge.' },
    { surah: 29, ayah: 45, hadithAr: 'بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكُ الصَّلَاةِ', hadithFr: 'Entre l\'homme et le polythéisme/la mécréance, il y a l\'abandon de la prière.', source: 'Muslim 82', connection: 'Le verset dit que la prière préserve du mal ; le hadith montre qu\'abandonner la prière est une ligne rouge.' },

    // Gratitude
    { surah: 14, ayah: 7, hadithAr: 'أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ', hadithFr: 'Les gens les plus aimés d\'Allah sont les plus utiles aux gens.', source: 'Tabarani (hasan)', connection: 'La gratitude envers Allah se manifeste par le service aux autres.' },

    // Famille
    { surah: 17, ayah: 23, hadithAr: 'رِضَا اللَّهِ فِي رِضَا الْوَالِدِ وَسَخَطُ اللَّهِ فِي سَخَطِ الْوَالِدِ', hadithFr: 'La satisfaction d\'Allah réside dans la satisfaction des parents, et Sa colère dans leur colère.', source: 'Tirmidhi 1899', connection: 'Ce verset lie le Tawhid à la bienfaisance envers les parents. Le hadith confirme le lien direct.' },

    // Invocation
    { surah: 2, ayah: 186, hadithAr: 'الدُّعَاءُ هُوَ الْعِبَادَةُ', hadithFr: 'L\'invocation est l\'essence même de l\'adoration.', source: 'Tirmidhi 3372', connection: 'Le verset dit qu\'Allah est proche et répond ; le hadith dit que l\'invocation EST l\'adoration.' },
    { surah: 40, ayah: 60, hadithAr: 'مَنْ لَمْ يَسْأَلِ اللَّهَ يَغْضَبْ عَلَيْهِ', hadithFr: 'Celui qui ne demande pas à Allah, Allah se fâche contre lui.', source: 'Tirmidhi 3373', connection: 'Le verset invite à invoquer et promet la réponse ; le hadith dit que ne PAS invoquer est blâmable.' },

    // Mort
    { surah: 3, ayah: 185, hadithAr: 'أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ', hadithFr: 'Rappelez-vous fréquemment celle qui détruit les plaisirs (la mort).', source: 'Tirmidhi 2307', connection: 'Le verset rappelle que toute âme goûtera la mort. Le hadith recommande d\'y penser souvent, non par morbidité mais pour mieux vivre.' },

    // Al-Kahf (Gens de la Caverne et Fitna)
    { surah: 18, ayah: 10, hadithAr: 'مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ', hadithFr: 'Celui qui mémorise les dix premiers versets de la sourate Al-Kahf sera protégé de l\'Antéchrist (Ad-Dajjal).', source: 'Muslim 809', connection: 'L\'histoire des gens de la caverne est l\'antidote spirituel parfait contre les illusions (Fitna) de la fin des temps, car elle nous enseigne de fuir vers Allah.' },
    { surah: 18, ayah: 28, hadithAr: 'الْمَرْءُ عَلَى دِينِ خَلِيلِهِ، فَلْيَنْظُرْ أَحَدُكُمْ مَنْ يُخَالِلُ', hadithFr: 'L\'homme a la religion de son ami intime. Que chacun de vous regarde donc qui il prend pour ami.', source: 'Abu Dawud 4833', connection: 'Le verset ordonne au Prophète ﷺ de patienter aux côtés des croyants modestes. Le hadith prouve que la compagnie pieuse préserve notre propre foi.' },
    { surah: 18, ayah: 46, hadithAr: 'يَتْبَعُ الْمَيِّتَ ثَلَاثَةٌ... يَتْبَعُهُ أَهْلُهُ، وَمَالُهُ، وَعَمَلُهُ، فَيَرْجِعُ أَهْلُهُ وَمَالُهُ، وَيَبْقَى عَمَلُهُ', hadithFr: 'Le mort est suivi par trois choses : sa famille, ses biens et ses œuvres. Deux s\'en retournent (famille et biens), il ne reste que son œuvre.', source: 'Bukhari 6514', connection: 'La réalité frappante : ce que le verset nomme "les bonnes œuvres persistantes" est l\'unique chose qui restera avec toi lorsque tu seras seul dans ta tombe.' },

    // Al-Kahf (Les 3 autres récits)
    { surah: 18, ayah: 39, hadithAr: 'مَا أَنْعَمَ اللَّهُ عَلَى عَبْدٍ نِعْمَةً فِي أَهْلٍ وَمَالٍ وَوَلَدٍ فَقَالَ: مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ، فَيَرَى فِيهَا آفَةً دُونَ الْمَوْتِ', hadithFr: 'Chaque fois qu\'Allah accorde à un serviteur un bienfait en famille, biens ou enfants, et qu\'il dit : "Masha\' Allah la quwwata illa billah", ces bienfaits seront immunisés de tout fléau sauf la mort.', source: 'Tabarani', connection: 'Le remède explicite enseigné dans l\'histoire du jardin pour protéger ce qu\'on possède de l\'envie (Aïn), ou de notre propre arrogance destructrice.' },
    { surah: 18, ayah: 60, hadithAr: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ', hadithFr: 'Celui à qui Allah veut du bien, Il lui accorde la compréhension fine de la religion.', source: 'Bukhari 71', connection: 'Moussa voyagea des années à la recherche d\'une infime partie de science qu\'il ignorait. L\'effort intellectuel ou physique pour la science est la preuve de l\'amour divin.' },

    // Yusuf, Yasin, Ar-Rahman, Al-Mulk
    { surah: 12, ayah: 86, hadithAr: 'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ... إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ', hadithFr: 'Aucune tristesse, chagrin ou souci ne touche le croyant, sans qu\'Allah n\'en fasse une expiation pour ses péchés.', source: 'Bukhari 5641', connection: 'Le prophète Ya\'qub exprimait son immense chagrin exclusivement à Allah. Le hadith confirme que ressentir la tristesse humaine est validé, et efface même nos péchés devant Dieu.' },
    { surah: 36, ayah: 82, hadithAr: 'إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ', hadithFr: 'Toute chose a été créée selon un décret divin (Qadar).', source: 'Muslim 2653', connection: 'Le commandement "Sois" (Kun) abordé par le verset représente la puissance absolue d\'Allah sur les destins, confirmant que chaque atome bouge sur Son ordre infaillible.' },
    { surah: 55, ayah: 60, hadithAr: 'مَنْ عَلَا مَعَ اللَّهِ فِي الْإِحْسَانِ عَلَا اللَّهُ مَعَهُ فِي الْجَزَاءِ', hadithFr: 'Par sa douceur et l\'excellence de l\'action (Ihsan), la récompense de bonté d\'Allah se multipliera au centuple.', source: 'Sagesse prophétique partagée', connection: 'Comme affirmé par le verset de la sourate du Tout-Miséricordieux : chaque acte d\'excellence accompli avec sincérité trouve une récompense d\'excellence pure face à Allah.' },
    { surah: 67, ayah: 1, hadithAr: 'سُورَةٌ تَبَارَكَ هِيَ الْمَانِعَةُ مِنْ عَذَابِ الْقَبْرِ', hadithFr: 'La Révélation d\'Al-Mulk est la sourate protectrice (Al-Mani\'ah) qui préserve du châtiment de la tombe.', source: 'Sahih Al-Jami\' 3537', connection: 'Rien d\'étonnant. Ce verset (et sa sourate) ouvre le cœur en rappelant qui détient véritablement tous nos problèmes. La réciter chaque nuit protège l\'âme pour l\'éternité.' },

    // Les 6 Trésors du Tafsir (Juz Amma, Luqman, Hujurat, Baqarah, Nur, Taha)
    { surah: 103, ayah: 1, hadithAr: 'لَوْ مَا أَنْزَلَ اللَّهُ حُجَّةً عَلَى خَلْقِهِ إِلَّا هَذِهِ السُّورَةَ لَكَفَتْهُمْ', hadithFr: 'Si Allah n\'avait fait descendre comme argument pour Sa création que cette sourate (Al-Asr), elle leur aurait suffi.', source: 'Imam Al-Shafi\'i', connection: 'L\'Imam As-Shafi\'i a résumé la gravité de ces trois versets : si l\'homme méditait seulement sur la fuite inarrêtable du temps, cela suffirait à changer sa vie entière.' },
    { surah: 31, ayah: 18, hadithAr: 'الْكِبْرُ بَطَرُ الْحَقِّ، وَغَمْطُ النَّاسِ', hadithFr: 'L\'orgueil, c\'est de rejeter la vérité et de mépriser les gens.', source: 'Muslim 91', connection: 'Luqman met en garde son fils contre la posture arrogante (détourner le visage). Le Prophète définit l\'orgueil non pas comme le fait de bien s\'habiller, mais comme la médisance et le mépris intime d\'autrui.' },
    { surah: 49, ayah: 12, hadithAr: 'أَتَدْرُونَ مَا الْغِيبَةُ؟ قَالُوا: اللَّهُ وَرَسُولُهُ أَعْلَمُ. قَالَ: ذِكْرُكَ أَخَاكَ بِمَا يَكْرَهُ', hadithFr: 'Savez-vous ce qu\'est la médisance ? [...] C\'est de dire de ton frère ce qu\'il détesterait entendre.', source: 'Muslim 2589', connection: 'La sourate ordonne sévèrement de ne pas s\'espionner ni s\'entre-déchirer dans le dos. Le hadith enlève toute excuse : même si ce que tu dis sur le défaut caché de ton frère est "vrai", en parler est une médisance (Ghibah).' },
    { surah: 2, ayah: 255, hadithAr: 'مَنْ قَرَأَ آيَةَ الْكُرْسِيِّ دُبُرَ كُلِّ صَلَاةٍ مَكْتُوبَةٍ لَمْ يَمْنَعْهُ مِنْ دُخُولِ الْجَنَّةِ إِلَّا أَنْ يَمُوتَ', hadithFr: 'Celui qui récite Ayat Al-Kursi ("Le Verset du Trône") après chaque prière obligatoire, rien ne l\'empêche d\'entrer au Paradis si ce n\'est la mort.', source: 'Nasa\'i 9928', connection: 'La récitation de ce verset - qui proclame la subsistance universelle d\'Allah - est une garantie divine de Paradis et d\'ultime sécurité, tant spirituelle que physique.' },
    { surah: 24, ayah: 22, hadithAr: 'بَلَى وَاللَّهِ إِنَّا نُحِبُّ أَنْ يَغْفِرَ اللَّهُ لَنَا', hadithFr: 'Bien sûr, par Allah, que nous aimerions qu\'Allah nous pardonne !', source: 'Bukhari 4757', connection: 'La réaction légendaire d\'Abu Bakr en entendant ce verset. Alors qu\'un proche avait participé à la diffamation contre sa fille, dès que ce verset exhortant au pardon est descendu, il a recommencé à aider financièrement son propre diffamateur et l\'a pardonné.' },
    { surah: 20, ayah: 25, hadithAr: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ', hadithFr: 'L\'homme fort n\'est pas celui qui a le dessus dans la lutte, le fort est celui qui se maîtrise par temps de colère.', source: 'Bukhari 6114', connection: 'Face à Pharaon (la peur ou la colère immense), la seule arme valide n\'est pas l\'éloquence ni les bras, mais la paix de la poitrine (l\'ouverture du "Sadr" demandée par le Prophète Moussa pour garder le contrôle total de ses émotions).' },
];

// ─── Messages de Milestone ───────────────────────────────────

export const MILESTONE_MESSAGES: MilestoneMessage[] = [
    // Pages
    { type: 'pages', threshold: 10, emoji: '📖', title: 'Premiers pas !', message: 'Tu as lu 10 pages du Coran. Le voyage de mille lieues commence par un premier pas.' },
    { type: 'pages', threshold: 50, emoji: '⭐', title: '50 pages !', message: 'MashaAllah ! 50 pages lues. La régularité est meilleure que la quantité.', duaAr: 'اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِي', duaFr: 'Ô Allah, fais du Coran le printemps de mon cœur.' },
    { type: 'pages', threshold: 100, emoji: '🌟', title: '100 pages !', message: 'SubhanAllah ! 100 pages. Chaque lettre te rapporte 10 récompenses (Tirmidhi 2910).' },
    { type: 'pages', threshold: 200, emoji: '🏆', title: '200 pages !', message: 'Le Coran intercédera pour toi le Jour du Jugement (Muslim 804). Continue !' },
    { type: 'pages', threshold: 400, emoji: '👑', title: '400 pages !', message: 'Tu as lu les 2/3 du Coran ! Le Prophète ﷺ a dit : « Le meilleur est celui qui apprend le Coran et l\'enseigne. » (Bukhari 5027)' },

    // Juz
    { type: 'juz', threshold: 1, emoji: '🎉', title: 'Premier Juz terminé !', message: 'Tu as terminé le Juz Alif-Lam-Mim ! Continue ton élan.' },
    { type: 'juz', threshold: 5, emoji: '🌙', title: '5 Juz terminés !', message: 'Un sixième du Coran ! Tu es sur la voie de la complétion.' },
    { type: 'juz', threshold: 10, emoji: '🔥', title: '10 Juz — Un tiers !', message: 'Tu as lu un tiers du Coran. Le Prophète ﷺ a dit que Sourate Al-Ikhlas équivaut à un tiers : imagine ce que tu as accumulé.' },
    { type: 'juz', threshold: 20, emoji: '💎', title: '20 Juz !', message: 'Les deux tiers ! La fin du Coran approche. Les derniers Juz sont parmi les plus beaux.' },
    { type: 'juz', threshold: 30, emoji: '🕋', title: 'Khatm du Coran !', message: 'Tu as terminé la lecture complète du Saint Coran !', duaAr: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً', duaFr: 'Ô Allah, aie pitié de moi par le Coran, fais-en pour moi un guide, une lumière et une miséricorde.' },

    // Streak
    { type: 'streak', threshold: 7, emoji: '🔥', title: '7 jours consécutifs !', message: 'Une semaine d\'assiduité ! Le Prophète ﷺ a dit : « L\'œuvre la plus aimée d\'Allah est la plus régulière, même si elle est minime. » (Bukhari 6464)' },
    { type: 'streak', threshold: 30, emoji: '🏅', title: '30 jours — 1 mois !', message: 'Un mois complet de lecture quotidienne ! Tu as créé une habitude spirituelle puissante.' },
    { type: 'streak', threshold: 100, emoji: '🌟', title: '100 jours !', message: 'CENT jours consécutifs ! Tu fais partie de ceux qu\'Allah aime : les constants.' },

    // Surah
    { type: 'surah', threshold: 1, emoji: '✅', title: 'Sourate terminée !', message: 'Tu viens de terminer une sourate complète. Chaque sourate est une lumière.' },
];

// ─── Sourates recommandées par prière ────────────────────────
// Basé sur la Sunna authentique et les recommandations des savants

export const PRAYER_SURAH_RECOMMENDATIONS: PrayerSurahRecommendation[] = [
    {
        prayer: 'fajr',
        surahs: [
            { surah: 32, name: 'As-Sajdah', reason: 'Le Prophète ﷺ la lisait le vendredi au Fajr (Bukhari 891)' },
            { surah: 76, name: 'Al-Insan', reason: 'Lue le vendredi au Fajr avec As-Sajdah (Bukhari 891)' },
            { surah: 50, name: 'Qaf', reason: 'Le Prophète ﷺ la récitait souvent au Fajr (Muslim 458)' },
            { surah: 67, name: 'Al-Mulk', reason: 'Protège du châtiment de la tombe (Tirmidhi 2891)' },
        ]
    },
    {
        prayer: 'dhuhr',
        surahs: [
            { surah: 87, name: "Al-A'la", reason: 'Le Prophète ﷺ la lisait au Dhuhr et au Isha (Muslim 878)' },
            { surah: 88, name: 'Al-Ghashiya', reason: 'Associée à Al-A\'la dans la prière du Dhuhr' },
        ]
    },
    {
        prayer: 'asr',
        surahs: [
            { surah: 103, name: "Al-'Asr", reason: 'La sourate du temps — rappel de l\'urgence de bien agir' },
        ]
    },
    {
        prayer: 'maghrib',
        surahs: [
            { surah: 112, name: 'Al-Ikhlas', reason: 'Équivaut à un tiers du Coran (Bukhari 5015)' },
            { surah: 113, name: 'Al-Falaq', reason: 'Protection recommandée par le Prophète ﷺ (Abu Dawud 5082)' },
            { surah: 114, name: 'An-Nas', reason: 'Protection recommandée par le Prophète ﷺ (Abu Dawud 5082)' },
        ]
    },
    {
        prayer: 'isha',
        surahs: [
            { surah: 67, name: 'Al-Mulk', reason: 'Le Prophète ﷺ ne dormait pas sans la lire (Tirmidhi 2892)' },
            { surah: 56, name: "Al-Waqi'ah", reason: 'Protection contre la pauvreté (Ibn Sunni)' },
            { surah: 36, name: 'Ya-Sin', reason: 'Le cœur du Coran (Tirmidhi 2887)' },
        ]
    },
];

// ─── Messages de retour après absence ────────────────────────

export const COMEBACK_MESSAGES: ComebackMessage[] = [
    { minDaysAbsent: 3, maxDaysAbsent: 7, emoji: '🌱', title: 'Content de te revoir', message: 'Le Coran t\'attend. Reprends là où tu t\'étais arrêté.', quoteAr: 'تَعَاهَدُوا هَذَا الْقُرْآنَ فَوَالَّذِي نَفْسُ مُحَمَّدٍ بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الْإِبِلِ فِي عُقُلِهَا', quoteFr: '« Entretenez votre lien avec le Coran, car il s\'échappe plus vite que le chameau de ses liens. »', source: 'Bukhari 5033' },
    { minDaysAbsent: 7, maxDaysAbsent: 14, emoji: '💧', title: 'Le Coran est un remède', message: 'Ibn Al-Qayyim a dit : « Le Coran est le remède complet de toutes les maladies du cœur et du corps. »', quoteAr: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', quoteFr: '« Nous faisons descendre du Coran ce qui est guérison et miséricorde pour les croyants. »', source: 'Coran 17:82' },
    { minDaysAbsent: 14, maxDaysAbsent: 30, emoji: '🤲', title: 'Tu nous as manqué', message: 'Chaque jour est un nouveau départ. La porte du Coran ne se ferme jamais.', quoteAr: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', quoteFr: '« Ô Mes serviteurs qui avez commis des excès, ne désespérez pas de la miséricorde d\'Allah. »', source: 'Coran 39:53' },
    { minDaysAbsent: 30, maxDaysAbsent: 9999, emoji: '🕊️', title: 'Il n\'est jamais trop tard', message: 'Le simple fait d\'ouvrir l\'app est un premier pas. Allah aime celui qui revient vers Lui.', quoteAr: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ', quoteFr: '« Allah aime ceux qui se repentent et ceux qui se purifient. »', source: 'Coran 2:222' },
];
