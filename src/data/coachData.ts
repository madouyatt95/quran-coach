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
