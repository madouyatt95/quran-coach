import { Sun, Moon, BookOpen, Shield, Plane, Heart } from 'lucide-react';

export interface Dhikr {
    id: number;
    arabic: string;
    translation: string;
    transliteration?: string;
    count: number;
    source?: string;
}

export interface AdhkarCategory {
    id: string;
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    color: string;
    adhkar: Dhikr[];
}

export const ADHKAR_DATA: AdhkarCategory[] = [
    {
        id: 'morning',
        name: 'Adhkar du Matin',
        nameAr: 'أذكار الصباح',
        icon: <Sun size={24} />,
        color: '#FFD54F',
        adhkar: [
            { id: 1, arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 1, source: 'Muslim' },
            { id: 2, arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au matin et c\'est par Toi que nous nous retrouvons au soir, c\'est par Toi que nous vivons et c\'est par Toi que nous mourons et c\'est vers Toi la résurrection.', count: 1, source: 'Tirmidhi' },
            { id: 3, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Gloire et pureté à Allah et louange à Lui.', count: 100, source: 'Bukhari, Muslim' },
            { id: 4, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 10, source: 'Bukhari, Muslim' },
            { id: 5, arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.', count: 3, source: 'Muslim' },
        ]
    },
    {
        id: 'evening',
        name: 'Adhkar du Soir',
        nameAr: 'أذكار المساء',
        icon: <Moon size={24} />,
        color: '#7986CB',
        adhkar: [
            { id: 1, arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 1, source: 'Muslim' },
            { id: 2, arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au soir et c\'est par Toi que nous nous retrouvons au matin, c\'est par Toi que nous vivons et c\'est par Toi que nous mourons et c\'est vers Toi le retour.', count: 1, source: 'Tirmidhi' },
            { id: 3, arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.', count: 3, source: 'Muslim' },
            { id: 4, arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', translation: 'Au nom d\'Allah, Celui dont le nom protège de tout mal sur terre et dans le ciel. Il est l\'Audient, l\'Omniscient.', count: 3, source: 'Abu Dawud, Tirmidhi' },
        ]
    },
    {
        id: 'afterPrayer',
        name: 'Après la Prière',
        nameAr: 'أذكار بعد الصلاة',
        icon: <BookOpen size={24} />,
        color: '#4CAF50',
        adhkar: [
            { id: 1, arabic: 'أَسْتَغْفِرُ اللَّهَ', translation: 'Je demande pardon à Allah.', count: 3, source: 'Muslim' },
            { id: 2, arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', translation: 'Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Plein de Majesté et de Noblesse.', count: 1, source: 'Muslim' },
            { id: 3, arabic: 'سُبْحَانَ اللَّهِ', translation: 'Gloire à Allah.', count: 33, source: 'Bukhari, Muslim' },
            { id: 4, arabic: 'الْحَمْدُ لِلَّهِ', translation: 'Louange à Allah.', count: 33, source: 'Bukhari, Muslim' },
            { id: 5, arabic: 'اللَّهُ أَكْبَرُ', translation: 'Allah est le Plus Grand.', count: 33, source: 'Bukhari, Muslim' },
            { id: 6, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.', count: 1, source: 'Bukhari, Muslim' },
        ]
    },
    {
        id: 'protection',
        name: 'Protection',
        nameAr: 'أذكار الحماية',
        icon: <Shield size={24} />,
        color: '#FF7043',
        adhkar: [
            { id: 1, arabic: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...', translation: 'Ayat Al-Kursi (Sourate Al-Baqara, verset 255) - Allah, nulle divinité sauf Lui, le Vivant, Celui qui subsiste par Lui-même...', count: 1, source: 'Bukhari' },
            { id: 2, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ (الإخلاص)', translation: 'Sourate Al-Ikhlas - Dis: Il est Allah, Unique.', count: 3, source: 'Abu Dawud, Tirmidhi' },
            { id: 3, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (الفلق)', translation: 'Sourate Al-Falaq - Dis: Je cherche refuge auprès du Seigneur de l\'aube.', count: 3, source: 'Abu Dawud, Tirmidhi' },
            { id: 4, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (الناس)', translation: 'Sourate An-Nas - Dis: Je cherche refuge auprès du Seigneur des hommes.', count: 3, source: 'Abu Dawud, Tirmidhi' },
        ]
    },
    {
        id: 'travel',
        name: 'En Voyage',
        nameAr: 'أذكار السفر',
        icon: <Plane size={24} />,
        color: '#26C6DA',
        adhkar: [
            { id: 1, arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنا لَمُنْقَلِبُونَ', translation: 'Allah est le Plus Grand (3x). Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer. Et c\'est vers notre Seigneur que nous retournerons.', count: 1, source: 'Muslim' },
            { id: 2, arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ', translation: 'Ô Allah, nous Te demandons dans ce voyage la bonté et la piété, ainsi que les actions qui Te plaisent.', count: 1, source: 'Muslim' },
        ]
    },
    {
        id: 'rabanna',
        name: 'Invocations Rabbanā',
        nameAr: 'أدعية ربنا',
        icon: <Heart size={24} />,
        color: '#E91E63',
        adhkar: [
            { id: 1, arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ", translation: "Notre Seigneur, accepte ceci de notre part ! Car c'est Toi l'Audient, l'Omniscient.", count: 1, source: "2:127" },
            { id: 2, arabic: "رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِن ذُرِّيَّتِنَا أُمَّةً مُّسْلِمَةً لَّكَ وَأَرِنَا مَنَاسِكَنَا وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ", translation: "Notre Seigneur ! Fais de nous Tes deux soumis, et de notre descendance une communauté soumise à Toi. Et montre-nous nos rites et accepte notre repentir, car c'est Toi le Repentant, le Miséricordieux.", count: 1, source: "2:128" },
            { id: 3, arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Notre Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l'au-delà ; et protège-nous du châtiment du Feu !", count: 1, source: "2:201" },
            { id: 4, arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", translation: "Notre Seigneur ! Déverse sur nous l'endurance, affermis nos pas et donne-nous la victoire sur ce peuple infidèle !", count: 1, source: "2:250" },
            { id: 5, arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا", translation: "Notre Seigneur ! Ne nous châtie pas s'il nous arrive d'oublier ou de commettre une erreur.", count: 1, source: "2:286" },
            { id: 6, arabic: "رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا", translation: "Notre Seigneur ! Ne nous charge pas d'un fardeau lourd comme Tu as chargé ceux qui vécurent avant nous.", count: 1, source: "2:286" },
            { id: 7, arabic: "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", translation: "Notre Seigneur ! Ne nous impose pas ce que nous ne pouvons supporter, efface nos fautes, pardonne-nous et fais nous miséricorde. Tu es notre Maître, accorde-nous donc la victoire sur les peuples infidèles.", count: 1, source: "2:286" },
            { id: 8, arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ", translation: "Notre Seigneur ! Ne laisse pas dévier nos cœurs après que Tu nous aies guidés, et accorde-nous Ta miséricorde. C'est Toi le Grand Donateur.", count: 1, source: "3:8" },
            { id: 9, arabic: "رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَّا رَيْبَ فِيهِ إِنَّ اللَّهَ لَا يُخْلِفُ الْمِيعَادَ", translation: "Notre Seigneur ! C'est Toi qui rassembleras les gens, un jour au sujet duquel il n'y a point de doute. Allah ne manque point à Sa promesse.", count: 1, source: "3:9" },
            { id: 10, arabic: "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ", translation: "Notre Seigneur ! Nous avons cru ; pardonne-nous donc nos péchés, et protège-nous du châtiment du Feu !", count: 1, source: "3:16" },
            { id: 11, arabic: "رَبَّنَا آمَنَّا بِمَا أَنزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ", translation: "Notre Seigneur ! Nous avons cru à ce que Tu as fait descendre et nous avons suivi le Messager. Inscris-nous donc parmi ceux qui témoignent.", count: 1, source: "3:53" },
            { id: 12, arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", translation: "Notre Seigneur ! Pardonne-nous nos péchés ainsi que nos excès dans nos comportements, affermis nos pas et donne-nous la victoire sur les gens infidèles.", count: 1, source: "3:147" },
            { id: 13, arabic: "رَبَّنَا مَا خَلَقْتَ هَٰذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ", translation: "Notre Seigneur ! Tu n'as pas créé cela en vain. Gloire à Toi ! Garde-nous du châtiment du Feu.", count: 1, source: "3:191" },
            { id: 14, arabic: "رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ", translation: "Seigneur ! Quiconque Tu fais entrer dans le Feu, Tu le couvres vraiment d'ignominie. Et pour les injustes, il n'y a pas de secoureurs.", count: 1, source: "3:192" },
            { id: 15, arabic: "رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا", translation: "Seigneur ! Nous avons entendu l'appel de celui qui appelle ainsi à la foi : \"Croyez en votre Seigneur !\" et dès lors nous avons cru.", count: 1, source: "3:193" },
            { id: 16, arabic: "رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ", translation: "Seigneur ! Pardonne-nous nos péchés, efface de nous nos méfaits, et fais nous mourir avec les gens de bien.", count: 1, source: "3:193" },
            { id: 17, arabic: "رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ", translation: "Seigneur ! Donne-nous ce que Tu nous as promis par Tes messagers. Et ne nous couvre pas d'ignominie au Jour de la Résurrection. Car Toi, Tu ne manques jamais à Ta promesse.", count: 1, source: "3:194" },
            { id: 18, arabic: "رَبَّنَا آمَنَّا فَاكْتُبْنَا مَعَ الشَّاهِدِينَ", translation: "Notre Seigneur ! Nous croyons ; inscris-nous donc parmi ceux qui témoignent.", count: 1, source: "5:83" },
            { id: 19, arabic: "رَبَّنَا أَنزِلْ عَلَيْنَا مَائِدَةً مِّنَ السَّمَاءِ تَكُونُ لَنَا عِيدًا لِّأَوَّلِنَا وَآخِرِنَا وَآيَةً مِّنكَ وَارْزُقْنَا وَأَنتَ خَيْرُ الرَّازِقِينَ", translation: "Ô Allah, notre Seigneur, fais descendre du ciel sur nous une table servie qui soit une fête pour nous, pour le premier d'entre nous, comme pour le dernier, ainsi qu'un signe de Ta part. Nourris-nous, Tu es le Meilleur des nourrisseurs.", count: 1, source: "5:114" },
            { id: 20, arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", translation: "Notre Seigneur ! Nous nous sommes fait du tort à nous-mêmes. Et si Tu ne nous pardonnes pas et ne nous fais pas miséricorde, nous serons certainement du nombre des perdants.", count: 1, source: "7:23" },
            { id: 21, arabic: "رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظَّالِمِينَ", translation: "Notre Seigneur ! Ne nous place pas avec le peuple injuste.", count: 1, source: "7:47" },
            { id: 22, arabic: "رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالْحَقِّ وَأَنتَ خَيْرُ الْفَاتِحِينَ", translation: "Notre Seigneur ! Tranche entre nous et notre peuple, en toute vérité, car Tu es le Meilleur des juges.", count: 1, source: "7:89" },
            { id: 23, arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ", translation: "Notre Seigneur ! Déverse sur nous l'endurance et fais nous mourir entièrement soumis.", count: 1, source: "7:126" },
            { id: 24, arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ ، وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ", translation: "Notre Seigneur ! Ne fais pas de nous un objet de tentation pour les gens injustes. Et délivre-nous, par Ta miséricorde, du peuple mécréant.", count: 1, source: "10:85-86" },
            { id: 25, arabic: "رَبَّنَا إِنَّكَ تَعْلَمُ مَا نُخْفِي وَمَا نُعْلِنُ وَمَا يَخْفَىٰ عَلَى اللَّهِ مِن شَيْءٍ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ", translation: "Notre Seigneur ! Tu sais, vraiment, ce que nous cachons et ce que nous divulguons : et rien n'échappe à Allah, ni sur terre, ni au ciel !", count: 1, source: "14:38" },
            { id: 26, arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", translation: "Notre Seigneur ! Pardonne-moi, ainsi qu'à mes père et mère et aux croyants, le jour de la reddition des comptes !", count: 1, source: "14:41" },
            { id: 27, arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", translation: "Notre Seigneur ! Donne-nous de Ta part une miséricorde ; et assure-nous la droiture dans tout ce qui nous concerne.", count: 1, source: "18:10" },
            { id: 28, arabic: "رَبَّنَا إِنَّنَا نَخَافُ أَن يَفْرُطَ عَلَيْنَا أَوْ أَن يَطْغَىٰ", translation: "Notre Seigneur ! Nous craignons qu'il n'use de violence envers nous, ou qu'il ne commette des excès.", count: 1, source: "20:45" },
            { id: 29, arabic: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ", translation: "Notre Seigneur ! Nous croyons ; pardonne-nous donc et fais-nous miséricorde, car Tu es le Meilleur des miséricordieux.", count: 1, source: "23:109" },
            { id: 30, arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا", translation: "Notre Seigneur ! Écarte de nous le châtiment de l'Enfer, car son châtiment est permanent.", count: 1, source: "25:65" },
            { id: 31, arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", translation: "Notre Seigneur ! Accorde-nous, en nos épouses et nos descendants, la joie des yeux, et fais de nous un guide pour les pieux.", count: 1, source: "25:74" },
            { id: 32, arabic: "رَبَّنَا لَغَفُورٌ شَكُورٌ", translation: "Notre Seigneur est certes Pardonneur et Reconnaissant.", count: 1, source: "35:34" },
            { id: 33, arabic: "رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَّحْمَةً وَعِلْمًا فَاغْفِرْ لِلَّذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْجَحِيمِ", translation: "Notre Seigneur ! Tu embrasses tout de Ta miséricorde et de Ta science. Pardonne donc à ceux qui se repentent et suivent Ton chemin et protège-les du châtiment de l'Enfer !", count: 1, source: "40:7" },
            { id: 34, arabic: "رَبَّنَا وَأَدْخِلْهُمْ جَنَّاتِ عَدْنٍ الَّتِي وَعَدتَّهُمْ وَمَن صَلَحَ مِنْ آبَائِهِمْ وَأَزْوَاجِهِمْ وَذُرِّيَّاتِهِمْ إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ", translation: "Notre Seigneur ! Fais-les entrer aux jardins d'Éden que Tu leur as promis, ainsi qu'aux vertueux parmi leurs ancêtres, leurs épouses et leurs descendants, car c'est Toi le Puissant, le Sage.", count: 1, source: "40:8" },
            { id: 35, arabic: "رَبَّنَا اكْشِفْ عَنَّا الْعَذَابَ إِنَّا مُؤْمِنُونَ", translation: "Notre Seigneur ! Éloigne de nous le châtiment. Nous sommes croyants.", count: 1, source: "44:12" },
            { id: 36, arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبَنَا غِلًّا لِّلَّذِينَ آمَنُوا", translation: "Notre Seigneur ! Pardonne-nous, ainsi qu'à nos frères qui nous ont précédés dans la foi ; et ne mets dans nos cœurs aucune rancœur pour ceux qui ont cru.", count: 1, source: "59:10" },
            { id: 37, arabic: "رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ", translation: "Notre Seigneur ! Tu es Compatissant et Très Miséricordieux.", count: 1, source: "59:10" },
            { id: 38, arabic: "رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِليك الْمَصِيرُ", translation: "Notre Seigneur ! En Toi nous plaçons notre confiance et vers Toi nous nous repentons. Et vers Toi est la destination finale.", count: 1, source: "60:4" },
            { id: 39, arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ", translation: "Notre Seigneur ! Ne fais pas de nous un sujet de tentation pour ceux qui ont mécru. Et pardonne-nous, notre Seigneur, car c'est Toi le Puissant, le Sage.", count: 1, source: "60:5" },
            { id: 40, arabic: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "Notre Seigneur ! Parfais-nous notre lumière et pardonne-nous. Car Tu es capable de toute chose.", count: 1, source: "66:8" },
        ]
    },
];
