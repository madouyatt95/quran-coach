// ─── Les 42 Hadiths de l'Imam An-Nawawi (الأربعون النووية) ─────────
// Collection complète des 42 hadiths compilés par l'Imam Yahya ibn Sharaf An-Nawawi (631-676 H)
// Textes arabes authentiques + traductions françaises

import type { HadithEntry } from '../types/hadith';

export const HADITHS_NAWAWI: HadithEntry[] = [
    // ── Hadith 1 : Les actes ne valent que par les intentions ──
    { id: 901, ar: "إنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ", fr: "Les actes ne valent que par leurs intentions, et chacun n'a pour lui que ce qu'il a eu réellement l'intention de faire. Celui dont l'émigration a été pour Allah et Son messager, son émigration est pour Allah et Son messager. Celui dont l'émigration a été pour obtenir un bien de ce monde ou pour épouser une femme, son émigration est pour ce vers quoi il a émigré.", src: "Bukhari & Muslim", nar: "Umar ibn al-Khattab", cat: 'nawawi' },

    // ── Hadith 2 : Hadith de Jibril ──
    { id: 902, ar: "أَخْبِرْنِي عَنِ الإِسْلامِ، قَالَ: الإِسْلامُ أَنْ تَشْهَدَ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً", fr: "Informe-moi sur l'Islam. Il dit : L'Islam est que tu témoignes qu'il n'y a de divinité qu'Allah et que Muhammad est le Messager d'Allah, que tu accomplisses la prière, verses la zakat, jeûnes le Ramadan et fasses le pèlerinage si tu en as la capacité.", src: "Muslim", nar: "Umar ibn al-Khattab", cat: 'nawawi' },

    // ── Hadith 3 : Les piliers de l'Islam ──
    { id: 903, ar: "بُنِيَ الإِسْلامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ", fr: "L'Islam est bâti sur cinq piliers : l'attestation qu'il n'y a de divinité qu'Allah et que Muhammad est le Messager d'Allah, l'accomplissement de la prière, le versement de la zakat, le pèlerinage à la Maison Sacrée et le jeûne du Ramadan.", src: "Bukhari & Muslim", nar: "Abdullah ibn Umar", cat: 'nawawi' },

    // ── Hadith 4 : La création de l'être humain ──
    { id: 904, ar: "إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْمًا نُطْفَةً، ثُمَّ يَكُونُ عَلَقَةً مِثْلَ ذَلِكَ، ثُمَّ يَكُونُ مُضْغَةً مِثْلَ ذَلِكَ، ثُمَّ يُرْسَلُ إِلَيْهِ الْمَلَكُ فَيَنْفُخُ فِيهِ الرُّوحَ", fr: "Chacun de vous voit sa constitution rassemblée dans le ventre de sa mère pendant quarante jours sous forme de semence, puis il est un caillot de sang pendant une durée similaire, puis une bouchée de chair pendant une durée similaire. Puis un ange lui est envoyé qui insuffle en lui l'âme.", src: "Bukhari & Muslim", nar: "Abdullah ibn Mas'ud", cat: 'nawawi' },

    // ── Hadith 5 : Le rejet des innovations ──
    { id: 905, ar: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ", fr: "Quiconque introduit dans notre religion une chose qui n'en fait pas partie, celle-ci est rejetée.", src: "Bukhari & Muslim", nar: "Aisha", cat: 'nawawi' },

    // ── Hadith 6 : Le licite et l'illicite ──
    { id: 906, ar: "إِنَّ الْحَلالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ لا يَعْلَمُهُنَّ كَثِيرٌ مِنَ النَّاسِ، فَمَنِ اتَّقَى الشُّبُهَاتِ فَقَدِ اسْتَبْرَأَ لِدِينِهِ وَعِرْضِهِ", fr: "Le licite est clair et l'illicite est clair, et entre les deux il y a des choses ambiguës que beaucoup de gens ignorent. Celui qui se prémunit contre les ambiguïtés préserve sa religion et son honneur.", src: "Bukhari & Muslim", nar: "Nu'man ibn Bashir", cat: 'nawawi' },

    // ── Hadith 7 : La religion c'est le bon conseil ──
    { id: 907, ar: "الدِّينُ النَّصِيحَةُ، قُلْنَا لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ", fr: "La religion c'est le conseil sincère. Nous dîmes : envers qui ? Il dit : envers Allah, Son Livre, Son Messager, les dirigeants des musulmans et leur masse.", src: "Muslim", nar: "Tamim ad-Dari", cat: 'nawawi' },

    // ── Hadith 8 : L'inviolabilité du sang du musulman ──
    { id: 908, ar: "أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَيُقِيمُوا الصَّلاةَ، وَيُؤْتُوا الزَّكَاةَ، فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلا بِحَقِّ الإِسْلامِ وَحِسَابُهُمْ عَلَى اللَّهِ", fr: "Il m'a été ordonné de combattre les gens jusqu'à ce qu'ils attestent qu'il n'y a de divinité qu'Allah et que Muhammad est le Messager d'Allah, accomplissent la prière et versent la zakat. S'ils le font, ils auront préservé de moi leur sang et leurs biens, sauf en vertu d'un droit de l'Islam, et leur compte sera auprès d'Allah.", src: "Bukhari & Muslim", nar: "Abdullah ibn Umar", cat: 'nawawi' },

    // ── Hadith 9 : Ce que le Prophète a interdit ──
    { id: 909, ar: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ، فَإِنَّمَا أَهْلَكَ الَّذِينَ مِنْ قَبْلِكُمْ كَثْرَةُ مَسَائِلِهِمْ وَاخْتِلافُهُمْ عَلَى أَنْبِيَائِهِمْ", fr: "Ce que je vous ai interdit, évitez-le. Ce que je vous ai ordonné, faites-le dans la mesure de vos capacités. Ce qui a causé la perte de ceux qui vous ont précédés, c'est l'abondance de leurs questions et leur opposition à leurs prophètes.", src: "Bukhari & Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 10 : Allah n'accepte que le pur ──
    { id: 910, ar: "إِنَّ اللَّهَ طَيِّبٌ لا يَقْبَلُ إِلا طَيِّبًا، وَإِنَّ اللَّهَ أَمَرَ الْمُؤْمِنِينَ بِمَا أَمَرَ بِهِ الْمُرْسَلِينَ", fr: "Allah est bon et n'accepte que ce qui est bon. Et Allah a ordonné aux croyants ce qu'Il a ordonné aux messagers.", src: "Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 11 : Laisser ce qui est douteux ──
    { id: 911, ar: "دَعْ مَا يَرِيبُكَ إِلَى مَا لا يَرِيبُكَ", fr: "Laisse ce qui te fait douter pour ce qui ne te fait pas douter.", src: "Tirmidhi & Nasa'i", nar: "Hassan ibn Ali", cat: 'nawawi' },

    // ── Hadith 12 : Délaisser ce qui ne nous concerne pas ──
    { id: 912, ar: "مِنْ حُسْنِ إسْلامِ الْمَرْءِ تَرْكُهُ مَا لا يَعْنِيهِ", fr: "Parmi les qualités d'un bon Islam, il y a le fait de délaisser ce qui ne nous concerne pas.", src: "Tirmidhi", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 13 : Aimer pour son frère ──
    { id: 913, ar: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", fr: "Aucun de vous ne sera un vrai croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.", src: "Bukhari & Muslim", nar: "Anas ibn Malik", cat: 'nawawi' },

    // ── Hadith 14 : L'inviolabilité du sang ──
    { id: 914, ar: "لا يَحِلُّ دَمُ امْرِئٍ مُسْلِمٍ إِلا بِإِحْدَى ثَلاثٍ: الثَّيِّبُ الزَّانِي، وَالنَّفْسُ بِالنَّفْسِ، وَالتَّارِكُ لِدِينِهِ الْمُفَارِقُ لِلْجَمَاعَةِ", fr: "Il n'est pas permis de verser le sang d'un musulman sauf dans trois cas : le marié adultère, une vie pour une vie, et celui qui abandonne sa religion et se sépare de la communauté.", src: "Bukhari & Muslim", nar: "Abdullah ibn Mas'ud", cat: 'nawawi' },

    // ── Hadith 15 : Parler en bien ou se taire ──
    { id: 915, ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ", fr: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise. Que celui qui croit en Allah et au Jour dernier honore son voisin. Que celui qui croit en Allah et au Jour dernier honore son hôte.", src: "Bukhari & Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 16 : Ne te mets pas en colère ──
    { id: 916, ar: "لا تَغْضَبْ، فَرَدَّدَ مِرَارًا، قَالَ: لا تَغْضَبْ", fr: "Ne te mets pas en colère. L'homme répéta sa demande plusieurs fois, et le Prophète répondit : Ne te mets pas en colère.", src: "Bukhari", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 17 : La bienfaisance en toute chose ──
    { id: 917, ar: "إِنَّ اللَّهَ كَتَبَ الإِحْسَانَ عَلَى كُلِّ شَيْءٍ، فَإِذَا قَتَلْتُمْ فَأَحْسِنُوا الْقِتْلَةَ، وَإِذَا ذَبَحْتُمْ فَأَحْسِنُوا الذِّبْحَةَ", fr: "Allah a prescrit la bienfaisance en toute chose. Lorsque vous tuez, faites-le de la meilleure façon. Lorsque vous égorgez, faites-le de la meilleure façon.", src: "Muslim", nar: "Shaddad ibn Aws", cat: 'nawawi' },

    // ── Hadith 18 : La crainte d'Allah ──
    { id: 918, ar: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ", fr: "Crains Allah où que tu sois, fais suivre la mauvaise action par une bonne qui l'effacera, et comporte-toi bien envers les gens.", src: "Tirmidhi", nar: "Abu Dharr & Mu'adh ibn Jabal", cat: 'nawawi' },

    // ── Hadith 19 : Sois dans ce monde comme un étranger ──
    { id: 919, ar: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ", fr: "Sois dans ce monde comme si tu étais un étranger ou un voyageur de passage.", src: "Bukhari", nar: "Abdullah ibn Umar", cat: 'nawawi' },

    // ── Hadith 20 : La pudeur ──
    { id: 920, ar: "إِنَّ مِمَّا أَدْرَكَ النَّاسُ مِنْ كَلامِ النُّبُوَّةِ الأُولَى: إِذَا لَمْ تَسْتَحِ فَاصْنَعْ مَا شِئْتَ", fr: "Parmi ce que les gens ont retenu de la parole prophétique ancienne : Si tu n'as pas de pudeur, fais ce que tu veux.", src: "Bukhari", nar: "Abu Mas'ud al-Badri", cat: 'nawawi' },

    // ── Hadith 21 : Dis « Je crois en Allah » puis sois droit ──
    { id: 921, ar: "قُلْ آمَنْتُ بِاللَّهِ ثُمَّ اسْتَقِمْ", fr: "Dis : « Je crois en Allah », puis sois droit.", src: "Muslim", nar: "Sufyan ibn Abdullah", cat: 'nawawi' },

    // ── Hadith 22 : Faire ce qui est obligatoire suffit ──
    { id: 922, ar: "أَرَأَيْتَ إِذَا صَلَّيْتُ الْمَكْتُوبَاتِ، وَصُمْتُ رَمَضَانَ، وَأَحْلَلْتُ الْحَلالَ، وَحَرَّمْتُ الْحَرَامَ، وَلَمْ أَزِدْ عَلَى ذَلِكَ شَيْئًا، أَأَدْخُلُ الْجَنَّةَ؟ قَالَ: نَعَمْ", fr: "Dis-moi, si j'accomplis les prières obligatoires, jeûne le Ramadan, considère comme licite ce qui est licite et comme illicite ce qui est illicite, sans rien y ajouter, entrerai-je au Paradis ? Il dit : Oui.", src: "Muslim", nar: "Abu Abdullah Jabir ibn Abdullah", cat: 'nawawi' },

    // ── Hadith 23 : La purification est la moitié de la foi ──
    { id: 923, ar: "الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ مَا بَيْنَ السَّمَاءِ وَالأَرْضِ", fr: "La purification est la moitié de la foi. Al-Hamdulillah remplit la balance. Subhan Allah et Al-Hamdulillah remplissent ce qu'il y a entre le ciel et la terre.", src: "Muslim", nar: "Abu Malik al-Ash'ari", cat: 'nawawi' },

    // ── Hadith 24 : L'interdiction de l'injustice (Hadith Qudsi) ──
    { id: 924, ar: "يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلا تَظَالَمُوا", fr: "Ô Mes serviteurs, Je Me suis interdit l'injustice et Je l'ai rendue interdite entre vous, ne soyez donc pas injustes les uns envers les autres.", src: "Muslim", nar: "Abu Dharr", cat: 'nawawi' },

    // ── Hadith 25 : Toute articulation doit une aumône ──
    { id: 925, ar: "كُلُّ سُلامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ، كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ", fr: "Chaque articulation de l'homme doit une aumône chaque jour où le soleil se lève. Réconcilier deux personnes est une aumône.", src: "Bukhari & Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 26 : Chaque bonne action est une aumône ──
    { id: 926, ar: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", fr: "Tout acte de bonté est une aumône.", src: "Bukhari & Muslim", nar: "Jabir", cat: 'nawawi' },

    // ── Hadith 27 : La piété c'est le bon comportement ──
    { id: 927, ar: "الْبِرُّ حُسْنُ الْخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ", fr: "La piété c'est le bon comportement. Le péché c'est ce qui tourmente ta poitrine et que tu détestes que les gens découvrent.", src: "Muslim", nar: "Nawwas ibn Sam'an", cat: 'nawawi' },

    // ── Hadith 28 : Suivre la Sunna et la Jama'a ──
    { id: 928, ar: "أُوصِيكُمْ بِتَقْوَى اللَّهِ وَالسَّمْعِ وَالطَّاعَةِ وَإِنْ تَأَمَّرَ عَلَيْكُمْ عَبْدٌ، فَإِنَّهُ مَنْ يَعِشْ مِنْكُمْ فَسَيَرَى اخْتِلافًا كَثِيرًا، فَعَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الْخُلَفَاءِ الرَّاشِدِينَ الْمَهْدِيِّينَ", fr: "Je vous recommande la crainte d'Allah, l'écoute et l'obéissance, même si c'est un esclave qui vous gouverne. Celui qui vivra verra beaucoup de divergences. Attachez-vous à ma Sunna et à celle des califes bien guidés.", src: "Abu Dawud & Tirmidhi", nar: "Al-'Irbad ibn Sariya", cat: 'nawawi' },

    // ── Hadith 29 : Les portes du bien ──
    { id: 929, ar: "أَلا أَدُلُّكَ عَلَى أَبْوَابِ الْخَيْرِ؟ الصَّوْمُ جُنَّةٌ، وَالصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ، وَصَلاةُ الرَّجُلِ فِي جَوْفِ اللَّيْلِ", fr: "Veux-tu que je t'indique les portes du bien ? Le jeûne est un bouclier, l'aumône éteint le péché comme l'eau éteint le feu, et la prière de l'homme au milieu de la nuit.", src: "Tirmidhi", nar: "Mu'adh ibn Jabal", cat: 'nawawi' },

    // ── Hadith 30 : Les limites d'Allah ──
    { id: 930, ar: "إِنَّ اللَّهَ فَرَضَ فَرَائِضَ فَلا تُضَيِّعُوهَا، وَحَدَّ حُدُودًا فَلا تَعْتَدُوهَا، وَحَرَّمَ أَشْيَاءَ فَلا تَنْتَهِكُوهَا، وَسَكَتَ عَنْ أَشْيَاءَ رَحْمَةً لَكُمْ غَيْرَ نِسْيَانٍ فَلا تَبْحَثُوا عَنْهَا", fr: "Allah a prescrit des obligations, ne les négligez pas. Il a fixé des limites, ne les transgressez pas. Il a interdit des choses, ne les violez pas. Et Il a tu certaines choses par miséricorde pour vous, sans oubli, ne cherchez donc pas à les connaître.", src: "Daraqutni", nar: "Abu Tha'laba al-Khushani", cat: 'nawawi' },

    // ── Hadith 31 : Le véritable renoncement ──
    { id: 931, ar: "ازْهَدْ فِي الدُّنْيَا يُحِبَّكَ اللَّهُ، وَازْهَدْ فِيمَا عِنْدَ النَّاسِ يُحِبَّكَ النَّاسُ", fr: "Renonce aux biens de ce monde, Allah t'aimera. Renonce à ce que les gens possèdent, les gens t'aimeront.", src: "Ibn Majah", nar: "Sahl ibn Sa'd as-Sa'idi", cat: 'nawawi' },

    // ── Hadith 32 : Pas de tort ni de préjudice ──
    { id: 932, ar: "لا ضَرَرَ وَلا ضِرَارَ", fr: "Pas de tort ni de préjudice.", src: "Ibn Majah & Daraqutni", nar: "Abu Sa'id al-Khudri", cat: 'nawawi' },

    // ── Hadith 33 : La charge de la preuve ──
    { id: 933, ar: "لَوْ يُعْطَى النَّاسُ بِدَعْوَاهُمْ لَادَّعَى رِجَالٌ أَمْوَالَ قَوْمٍ وَدِمَاءَهُمْ، لَكِنِ الْبَيِّنَةُ عَلَى الْمُدَّعِي وَالْيَمِينُ عَلَى مَنْ أَنْكَرَ", fr: "Si l'on donnait aux gens selon leurs simples prétentions, des hommes revendiqueraient les biens et le sang d'autrui. Mais la preuve incombe au demandeur et le serment à celui qui nie.", src: "Bayhaqi", nar: "Abdullah ibn Abbas", cat: 'nawawi' },

    // ── Hadith 34 : Changer le mal ──
    { id: 934, ar: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الإِيمَانِ", fr: "Celui d'entre vous qui voit un mal, qu'il le change par sa main. S'il ne peut pas, par sa langue. S'il ne peut pas, par son cœur, et c'est le degré le plus faible de la foi.", src: "Muslim", nar: "Abu Sa'id al-Khudri", cat: 'nawawi' },

    // ── Hadith 35 : La fraternité ──
    { id: 935, ar: "لا تَحَاسَدُوا وَلا تَنَاجَشُوا وَلا تَبَاغَضُوا وَلا تَدَابَرُوا، وَلا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا", fr: "Ne vous enviez pas, ne surenchérissez pas, ne vous haïssez pas, ne vous tournez pas le dos, ne concluez pas de vente sur la vente d'autrui, et soyez des serviteurs d'Allah, frères les uns des autres.", src: "Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 36 : Soulager un croyant ──
    { id: 936, ar: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ", fr: "Celui qui soulage un croyant d'une peine, Allah le soulagera d'une peine au Jour de la Résurrection.", src: "Muslim", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 37 : La récompense des bonnes et mauvaises actions ──
    { id: 937, ar: "إِنَّ اللَّهَ كَتَبَ الْحَسَنَاتِ وَالسَّيِّئَاتِ ثُمَّ بَيَّنَ ذَلِكَ، فَمَنْ هَمَّ بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا كَتَبَهَا اللَّهُ عِنْدَهُ حَسَنَةً كَامِلَةً", fr: "Allah a inscrit les bonnes et les mauvaises actions. Celui qui a l'intention de faire une bonne action sans la réaliser, Allah lui inscrit une bonne action complète.", src: "Bukhari & Muslim", nar: "Abdullah ibn Abbas", cat: 'nawawi' },

    // ── Hadith 38 : Les alliés d'Allah ──
    { id: 938, ar: "مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ، وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَلا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ", fr: "Quiconque montre de l'hostilité à un de Mes alliés, Je lui déclare la guerre. Mon serviteur ne se rapproche de Moi par rien de plus aimé que ce que Je lui ai imposé. Et Mon serviteur ne cesse de se rapprocher de Moi par les actes surérogatoires jusqu'à ce que Je l'aime.", src: "Bukhari", nar: "Abu Hurayra", cat: 'nawawi' },

    // ── Hadith 39 : Le pardon de l'erreur ──
    { id: 939, ar: "إِنَّ اللَّهَ تَجَاوَزَ لِي عَنْ أُمَّتِي الْخَطَأَ وَالنِّسْيَانَ وَمَا اسْتُكْرِهُوا عَلَيْهِ", fr: "Allah a pardonné pour ma communauté l'erreur, l'oubli et ce à quoi elle a été contrainte.", src: "Ibn Majah & Bayhaqi", nar: "Abdullah ibn Abbas", cat: 'nawawi' },

    // ── Hadith 40 : Profite de cinq choses ──
    { id: 940, ar: "اغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ، وَغِنَاكَ قَبْلَ فَقْرِكَ، وَفَرَاغَكَ قَبْلَ شُغْلِكَ، وَحَيَاتَكَ قَبْلَ مَوْتِكَ", fr: "Profite de cinq choses avant cinq autres : ta jeunesse avant ta vieillesse, ta santé avant ta maladie, ta richesse avant ta pauvreté, ton temps libre avant ton occupation et ta vie avant ta mort.", src: "Hakim", nar: "Abdullah ibn Abbas", cat: 'nawawi' },

    // ── Hadith 41 : Suivre le Prophète ──
    { id: 941, ar: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يَكُونَ هَوَاهُ تَبَعًا لِمَا جِئْتُ بِهِ", fr: "Aucun de vous ne sera croyant tant que ses passions ne seront pas conformes à ce que j'ai apporté.", src: "Kitab al-Hujja", nar: "Abu Muhammad Abdullah ibn Amr", cat: 'nawawi' },

    // ── Hadith 42 : L'immensité du pardon d'Allah ──
    { id: 942, ar: "يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلا أُبَالِي، يَا ابْنَ آدَمَ لَوْ بَلَغَتْ ذُنُوبُكَ عَنَانَ السَّمَاءِ ثُمَّ اسْتَغْفَرْتَنِي غَفَرْتُ لَكَ وَلا أُبَالِي، يَا ابْنَ آدَمَ لَوْ أَتَيْتَنِي بِقُرَابِ الأَرْضِ خَطَايَا ثُمَّ لَقِيتَنِي لا تُشْرِكُ بِي شَيْئًا لأَتَيْتُكَ بِقُرَابِهَا مَغْفِرَةً", fr: "Ô fils d'Adam, tant que tu M'invoques et espères en Moi, Je te pardonne quoi que tu aies fait. Ô fils d'Adam, si tes péchés atteignaient les nuages du ciel puis que tu Me demandais pardon, Je te pardonnerais. Ô fils d'Adam, si tu venais à Moi avec la terre entière de péchés, puis que tu Me rencontres sans rien M'associer, Je viendrais à toi avec autant de pardon.", src: "Tirmidhi", nar: "Anas ibn Malik", cat: 'nawawi' },
];
