import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, ChevronRight, Heart, Play, Pause, Square, Repeat, Minus, Plus, Mic, Volume2, Loader2, Search, X, Gauge } from 'lucide-react';
import { HISNUL_MUSLIM_DATA, type HisnMegaCategory, type HisnChapter } from '../data/hisnulMuslim';
import { useFavoritesStore } from '../stores/favoritesStore';
import { formatDivineNames } from '../lib/divineNames';
import './AdhkarPage.css';

interface Dhikr {
    id: number;
    arabic: string;
    translation: string;
    transliteration?: string;
    count: number;
    source?: string;
}

interface AdhkarCategory {
    id: string;
    name: string;
    nameAr: string;
    icon: React.ReactNode;
    color: string;
    adhkar: Dhikr[];
}

const ADHKAR_DATA: AdhkarCategory[] = [
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
            { id: 33, arabic: "رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَّحْمَةً وَعِلْمًا فَاغْفِرْ لِلذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْجَحِيمِ", translation: "Notre Seigneur ! Tu embrasses tout de Ta miséricorde et de Ta science. Pardonne donc à ceux qui se repentent et suivent Ton chemin et protège-les du châtiment de l'Enfer !", count: 1, source: "40:7" },
            { id: 34, arabic: "رَبَّنَا وَأَدْخِلْهُمْ جَنَّاتِ عَدْنٍ الَّتِي وَعَدتَّهُمْ وَمَن صَلَحَ مِنْ آبَائِهِمْ وَأَزْوَاجِهِمْ وَذُرِّيَّاتِهِمْ إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ", translation: "Notre Seigneur ! Fais-les entrer aux jardins d'Éden que Tu leur as promis, ainsi qu'aux vertueux parmi leurs ancêtres, leurs épouses et leurs descendants, car c'est Toi le Puissant, le Sage.", count: 1, source: "40:8" },
            { id: 35, arabic: "رَبَّنَا اكْشِفْ عَنَّا الْعَذَابَ إِنَّا مُؤْمِنُونَ", translation: "Notre Seigneur ! Éloigne de nous le châtiment. Nous sommes croyants.", count: 1, source: "44:12" },
            { id: 36, arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبَنَا غِلًّا لِّلَّذِينَ آمَنُوا", translation: "Notre Seigneur ! Pardonne-nous, ainsi qu'à nos frères qui nous ont précédés dans la foi ; et ne mets dans nos cœurs aucune rancœur pour ceux qui ont cru.", count: 1, source: "59:10" },
            { id: 37, arabic: "رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ", translation: "Notre Seigneur ! Tu es Compatissant et Très Miséricordieux.", count: 1, source: "59:10" },
            { id: 38, arabic: "رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِليك الْمَصِيرُ", translation: "Notre Seigneur ! En Toi nous plaçons notre confiance et vers Toi nous nous repentons. Et vers Toi est la destination finale.", count: 1, source: "60:4" },
            { id: 39, arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ", translation: "Notre Seigneur ! Ne fais pas de nous un sujet de tentation pour ceux qui ont mécru. Et pardonne-nous, notre Seigneur, car c'est Toi le Puissant, le Sage.", count: 1, source: "60:5" },
            { id: 40, arabic: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "Notre Seigneur ! Parfais-nous notre lumière et pardonne-nous. Car Tu es capable de toute chose.", count: 1, source: "66:8" },
        ]
    },
    // ── 99 Noms d'Allah ──
    {
        id: 'asma_husna',
        name: 'Les 99 Noms d\'Allah',
        nameAr: 'الأسماء الحسنى',
        icon: <Heart size={24} />,
        color: '#FFD700',
        adhkar: [
            { id: 101, arabic: "ٱللَّهُ", transliteration: "Allâh", translation: "Allah — Le Dieu unique, le seul qui mérite l'adoration", count: 1, source: "Bukhari & Muslim" },
            { id: 102, arabic: "ٱلرَّحْمَٰنُ", transliteration: "Ar-Rahmân", translation: "Ar-Rahman — Le Tout Miséricordieux (miséricorde universelle)", count: 1, source: "1:1" },
            { id: 103, arabic: "ٱلرَّحِيمُ", transliteration: "Ar-Rahîm", translation: "Ar-Rahim — Le Très Miséricordieux (miséricorde envers les croyants)", count: 1, source: "1:1" },
            { id: 104, arabic: "ٱلْمَلِكُ", transliteration: "Al-Malik", translation: "Al-Malik — Le Roi, le Souverain", count: 1, source: "59:23" },
            { id: 105, arabic: "ٱلْقُدُّوسُ", transliteration: "Al-Quddûs", translation: "Al-Quddus — Le Saint, le Pur", count: 1, source: "59:23" },
            { id: 106, arabic: "ٱلسَّلَامُ", transliteration: "As-Salâm", translation: "As-Salam — La Paix, la Sécurité", count: 1, source: "59:23" },
            { id: 107, arabic: "ٱلْمُؤْمِنُ", transliteration: "Al-Mou'min", translation: "Al-Mu'min — Le Garant de la sécurité, le Fidèle", count: 1, source: "59:23" },
            { id: 108, arabic: "ٱلْمُهَيْمِنُ", transliteration: "Al-Mouhaymin", translation: "Al-Muhaymin — Le Dominateur suprême, le Protecteur", count: 1, source: "59:23" },
            { id: 109, arabic: "ٱلْعَزِيزُ", transliteration: "Al-'Azîz", translation: "Al-'Aziz — Le Tout Puissant, l'Invincible", count: 1, source: "59:23" },
            { id: 110, arabic: "ٱلْجَبَّارُ", transliteration: "Al-Jabbâr", translation: "Al-Jabbar — Celui qui contraint, le Réparateur", count: 1, source: "59:23" },
            { id: 111, arabic: "ٱلْمُتَكَبِّرُ", transliteration: "Al-Moutakabbir", translation: "Al-Mutakabbir — L'Orgueilleux (en toute légitimité), le Superbe", count: 1, source: "59:23" },
            { id: 112, arabic: "ٱلْخَالِقُ", transliteration: "Al-Khâliq", translation: "Al-Khaliq — Le Créateur", count: 1, source: "59:24" },
            { id: 113, arabic: "ٱلْبَارِئُ", transliteration: "Al-Bâri'", translation: "Al-Bari' — Le Producteur, Celui qui donne un commencement", count: 1, source: "59:24" },
            { id: 114, arabic: "ٱلْمُصَوِّرُ", transliteration: "Al-Mousawwir", translation: "Al-Musawwir — Le Façonneur, Celui qui donne les formes", count: 1, source: "59:24" },
            { id: 115, arabic: "ٱلْغَفَّارُ", transliteration: "Al-Ghaffâr", translation: "Al-Ghaffar — Celui qui pardonne abondamment", count: 1, source: "20:82" },
            { id: 116, arabic: "ٱلْقَهَّارُ", transliteration: "Al-Qahhâr", translation: "Al-Qahhar — Le Dominateur suprême", count: 1, source: "13:16" },
            { id: 117, arabic: "ٱلْوَهَّابُ", transliteration: "Al-Wahhâb", translation: "Al-Wahhab — Le Grand Donateur", count: 1, source: "3:8" },
            { id: 118, arabic: "ٱلرَّزَّاقُ", transliteration: "Ar-Razzâq", translation: "Ar-Razzaq — Celui qui pourvoit, le Grand Pourvoyeur", count: 1, source: "51:58" },
            { id: 119, arabic: "ٱلْفَتَّاحُ", transliteration: "Al-Fattâh", translation: "Al-Fattah — Celui qui ouvre, le Juge suprême", count: 1, source: "34:26" },
            { id: 120, arabic: "ٱلْعَلِيمُ", transliteration: "Al-'Alîm", translation: "Al-'Alim — L'Omniscient, le Très Savant", count: 1, source: "2:158" },
            { id: 121, arabic: "ٱلْقَابِضُ", transliteration: "Al-Qâbid", translation: "Al-Qabid — Celui qui retient, qui resserre", count: 1, source: "2:245" },
            { id: 122, arabic: "ٱلْبَاسِطُ", transliteration: "Al-Bâsit", translation: "Al-Basit — Celui qui étend, qui déploie", count: 1, source: "2:245" },
            { id: 123, arabic: "ٱلْخَافِضُ", transliteration: "Al-Khâfid", translation: "Al-Khafid — Celui qui abaisse", count: 1, source: "56:3" },
            { id: 124, arabic: "ٱلرَّافِعُ", transliteration: "Ar-Râfi'", translation: "Ar-Rafi' — Celui qui élève", count: 1, source: "6:83" },
            { id: 125, arabic: "ٱلْمُعِزُّ", transliteration: "Al-Mou'izz", translation: "Al-Mu'izz — Celui qui honore, qui donne la puissance", count: 1, source: "3:26" },
            { id: 126, arabic: "ٱلْمُذِلُّ", transliteration: "Al-Moudhill", translation: "Al-Mudhill — Celui qui humilie", count: 1, source: "3:26" },
            { id: 127, arabic: "ٱلسَّمِيعُ", transliteration: "As-Samî'", translation: "As-Sami' — L'Audient, Celui qui entend tout", count: 1, source: "2:127" },
            { id: 128, arabic: "ٱلْبَصِيرُ", transliteration: "Al-Basîr", translation: "Al-Basir — Le Clairvoyant, Celui qui voit tout", count: 1, source: "17:1" },
            { id: 129, arabic: "ٱلْحَكَمُ", transliteration: "Al-Hakam", translation: "Al-Hakam — Le Juge, l'Arbitre", count: 1, source: "6:114" },
            { id: 130, arabic: "ٱلْعَدْلُ", transliteration: "Al-'Adl", translation: "Al-'Adl — Le Juste, l'Équitable", count: 1, source: "6:115" },
            { id: 131, arabic: "ٱللَّطِيفُ", transliteration: "Al-Latîf", translation: "Al-Latif — Le Doux, le Subtil, le Bienveillant", count: 1, source: "67:14" },
            { id: 132, arabic: "ٱلْخَبِيرُ", transliteration: "Al-Khabîr", translation: "Al-Khabir — Le Parfaitement Informé", count: 1, source: "6:18" },
            { id: 133, arabic: "ٱلْحَلِيمُ", transliteration: "Al-Halîm", translation: "Al-Halim — Le Longanime, le Très Clément", count: 1, source: "2:225" },
            { id: 134, arabic: "ٱلْعَظِيمُ", transliteration: "Al-'Azîm", translation: "Al-'Azim — L'Immense, le Magnifique", count: 1, source: "2:255" },
            { id: 135, arabic: "ٱلْغَفُورُ", transliteration: "Al-Ghafour", translation: "Al-Ghafur — Le Tout Pardonnant", count: 1, source: "2:173" },
            { id: 136, arabic: "ٱلشَّكُورُ", transliteration: "Ash-Shakoûr", translation: "Ash-Shakur — Le Reconnaissant, le Très Remerciant", count: 1, source: "35:30" },
            { id: 137, arabic: "ٱلْعَلِيُّ", transliteration: "Al-'Aliyy", translation: "Al-'Aliyy — Le Très Haut, le Sublime", count: 1, source: "2:255" },
            { id: 138, arabic: "ٱلْكَبِيرُ", transliteration: "Al-Kabîr", translation: "Al-Kabir — Le Très Grand, l'Infiniment Grand", count: 1, source: "13:9" },
            { id: 139, arabic: "ٱلْحَفِيظُ", transliteration: "Al-Hafîz", translation: "Al-Hafiz — Le Gardien, le Préservateur", count: 1, source: "11:57" },
            { id: 140, arabic: "ٱلْمُقِيتُ", transliteration: "Al-Mouqît", translation: "Al-Muqit — Le Nourricier, Celui qui donne la subsistance", count: 1, source: "4:85" },
            { id: 141, arabic: "ٱلْحَسِيبُ", transliteration: "Al-Hasîb", translation: "Al-Hasib — Celui qui suffit, le Compteur", count: 1, source: "4:6" },
            { id: 142, arabic: "ٱلْجَلِيلُ", transliteration: "Al-Jalîl", translation: "Al-Jalil — Le Majestueux, le Sublime", count: 1, source: "55:27" },
            { id: 143, arabic: "ٱلْكَرِيمُ", transliteration: "Al-Karîm", translation: "Al-Karim — Le Généreux, le Noble", count: 1, source: "27:40" },
            { id: 144, arabic: "ٱلرَّقِيبُ", transliteration: "Ar-Raqîb", translation: "Ar-Raqib — Le Vigilant, l'Observateur attentif", count: 1, source: "5:117" },
            { id: 145, arabic: "ٱلْمُجِيبُ", transliteration: "Al-Moujîb", translation: "Al-Mujib — Celui qui exauce, qui répond aux invocations", count: 1, source: "11:61" },
            { id: 146, arabic: "ٱلْوَاسِعُ", transliteration: "Al-Wâsi'", translation: "Al-Wasi' — L'Immense, Celui dont la capacité est infinie", count: 1, source: "2:268" },
            { id: 147, arabic: "ٱلْحَكِيمُ", transliteration: "Al-Hakîm", translation: "Al-Hakim — Le Sage, le Très Sage", count: 1, source: "2:129" },
            { id: 148, arabic: "ٱلْوَدُودُ", transliteration: "Al-Wadoûd", translation: "Al-Wadud — Le Tout Affectueux, le Bien-Aimant", count: 1, source: "85:14" },
            { id: 149, arabic: "ٱلْمَجِيدُ", transliteration: "Al-Majîd", translation: "Al-Majid — Le Très Glorieux", count: 1, source: "11:73" },
            { id: 150, arabic: "ٱلْبَاعِثُ", transliteration: "Al-Bâ'ith", translation: "Al-Ba'ith — Celui qui ressuscite", count: 1, source: "22:7" },
            { id: 151, arabic: "ٱلشَّهِيدُ", transliteration: "Ash-Shahîd", translation: "Ash-Shahid — Le Témoin", count: 1, source: "4:166" },
            { id: 152, arabic: "ٱلْحَقُّ", transliteration: "Al-Haqq", translation: "Al-Haqq — La Vérité, le Vrai", count: 1, source: "22:6" },
            { id: 153, arabic: "ٱلْوَكِيلُ", transliteration: "Al-Wakîl", translation: "Al-Wakil — Le Garant, le Gérant", count: 1, source: "3:173" },
            { id: 154, arabic: "ٱلْقَوِيُّ", transliteration: "Al-Qawiyy", translation: "Al-Qawiyy — Le Très Fort, le Puissant", count: 1, source: "22:40" },
            { id: 155, arabic: "ٱلْمَتِينُ", transliteration: "Al-Matîn", translation: "Al-Matin — Le Ferme, l'Inébranlable", count: 1, source: "51:58" },
            { id: 156, arabic: "ٱلْوَلِيُّ", transliteration: "Al-Waliyy", translation: "Al-Waliyy — L'Allié, le Protecteur proche", count: 1, source: "42:28" },
            { id: 157, arabic: "ٱلْحَمِيدُ", transliteration: "Al-Hamîd", translation: "Al-Hamid — Le Digne de louange", count: 1, source: "14:8" },
            { id: 158, arabic: "ٱلْمُحْصِي", transliteration: "Al-Mouhsî", translation: "Al-Muhsi — Celui qui dénombre tout", count: 1, source: "72:28" },
            { id: 159, arabic: "ٱلْمُبْدِئُ", transliteration: "Al-Moubdi'", translation: "Al-Mubdi' — Celui qui initie la création", count: 1, source: "10:4" },
            { id: 160, arabic: "ٱلْمُعِيدُ", transliteration: "Al-Mou'îd", translation: "Al-Mu'id — Celui qui recrée, qui fait revenir", count: 1, source: "10:4" },
            { id: 161, arabic: "ٱلْمُحْيِي", transliteration: "Al-Mouhyî", translation: "Al-Muhyi — Celui qui donne la vie", count: 1, source: "30:50" },
            { id: 162, arabic: "ٱلْمُمِيتُ", transliteration: "Al-Moumît", translation: "Al-Mumit — Celui qui fait mourir", count: 1, source: "3:156" },
            { id: 163, arabic: "ٱلْحَيُّ", transliteration: "Al-Hayy", translation: "Al-Hayy — Le Vivant", count: 1, source: "2:255" },
            { id: 164, arabic: "ٱلْقَيُّومُ", transliteration: "Al-Qayyoûm", translation: "Al-Qayyum — Celui qui subsiste par Lui-même", count: 1, source: "2:255" },
            { id: 165, arabic: "ٱلْوَاجِدُ", transliteration: "Al-Wâjid", translation: "Al-Wajid — Celui qui trouve, l'Opulent", count: 1, source: "38:44" },
            { id: 166, arabic: "ٱلْمَاجِدُ", transliteration: "Al-Mâjid", translation: "Al-Majid — Le Noble, le Glorieux", count: 1, source: "11:73" },
            { id: 167, arabic: "ٱلْوَاحِدُ", transliteration: "Al-Wâhid", translation: "Al-Wahid — L'Unique", count: 1, source: "13:16" },
            { id: 168, arabic: "ٱلصَّمَدُ", transliteration: "As-Samad", translation: "As-Samad — L'Absolu, Celui dont tout dépend", count: 1, source: "112:2" },
            { id: 169, arabic: "ٱلْقَادِرُ", transliteration: "Al-Qâdir", translation: "Al-Qadir — Le Capable, le Puissant", count: 1, source: "6:65" },
            { id: 170, arabic: "ٱلْمُقْتَدِرُ", transliteration: "Al-Mouqtadir", translation: "Al-Muqtadir — Le Tout-Puissant, le Déterminant", count: 1, source: "54:42" },
            { id: 171, arabic: "ٱلْمُقَدِّمُ", transliteration: "Al-Mouqaddim", translation: "Al-Muqaddim — Celui qui met en avant", count: 1, source: "Bukhari" },
            { id: 172, arabic: "ٱلْمُؤَخِّرُ", transliteration: "Al-Mou'akhkhir", translation: "Al-Mu'akhkhir — Celui qui met en arrière", count: 1, source: "Bukhari" },
            { id: 173, arabic: "ٱلْأَوَّلُ", transliteration: "Al-Awwal", translation: "Al-Awwal — Le Premier, sans commencement", count: 1, source: "57:3" },
            { id: 174, arabic: "ٱلْآخِرُ", transliteration: "Al-Âkhir", translation: "Al-Akhir — Le Dernier, sans fin", count: 1, source: "57:3" },
            { id: 175, arabic: "ٱلظَّاهِرُ", transliteration: "Az-Zâhir", translation: "Az-Zahir — L'Apparent, le Manifeste", count: 1, source: "57:3" },
            { id: 176, arabic: "ٱلْبَاطِنُ", transliteration: "Al-Bâtin", translation: "Al-Batin — Le Caché, l'Intérieur", count: 1, source: "57:3" },
            { id: 177, arabic: "ٱلْوَالِي", transliteration: "Al-Wâlî", translation: "Al-Wali — Le Maître absolu, le Gouverneur", count: 1, source: "13:11" },
            { id: 178, arabic: "ٱلْمُتَعَالِ", transliteration: "Al-Mouta'âlî", translation: "Al-Muta'ali — Le Très Élevé, le Transcendant", count: 1, source: "13:9" },
            { id: 179, arabic: "ٱلْبَرُّ", transliteration: "Al-Barr", translation: "Al-Barr — Le Bienfaisant, le Source de tout bien", count: 1, source: "52:28" },
            { id: 180, arabic: "ٱلتَّوَّابُ", transliteration: "At-Tawwâb", translation: "At-Tawwab — Celui qui accepte le repentir", count: 1, source: "2:128" },
            { id: 181, arabic: "ٱلْمُنْتَقِمُ", transliteration: "Al-Mountaqim", translation: "Al-Muntaqim — Le Vengeur", count: 1, source: "32:22" },
            { id: 182, arabic: "ٱلْعَفُوُّ", transliteration: "Al-'Afouww", translation: "Al-'Afuww — Celui qui efface les péchés, l'Indulgent", count: 1, source: "4:99" },
            { id: 183, arabic: "ٱلرَّءُوفُ", transliteration: "Ar-Ra'oûf", translation: "Ar-Ra'uf — Le Très Compatissant", count: 1, source: "3:30" },
            { id: 184, arabic: "مَالِكُ ٱلْمُلْكِ", transliteration: "Mâlik-oul-Moulk", translation: "Malik-ul-Mulk — Le Possesseur de la royauté", count: 1, source: "3:26" },
            { id: 185, arabic: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ", transliteration: "Dhoul-Jalâli wal-Ikrâm", translation: "Dhul-Jalali wal-Ikram — Plein de Majesté et de Munificence", count: 1, source: "55:27" },
            { id: 186, arabic: "ٱلْمُقْسِطُ", transliteration: "Al-Mouqsit", translation: "Al-Muqsit — L'Équitable", count: 1, source: "21:47" },
            { id: 187, arabic: "ٱلْجَامِعُ", transliteration: "Al-Jâmi'", translation: "Al-Jami' — Celui qui rassemble", count: 1, source: "3:9" },
            { id: 188, arabic: "ٱلْغَنِيُّ", transliteration: "Al-Ghaniyy", translation: "Al-Ghaniyy — Le Riche, Celui qui se suffit à Lui-même", count: 1, source: "2:263" },
            { id: 189, arabic: "ٱلْمُغْنِي", transliteration: "Al-Moughnî", translation: "Al-Mughni — Celui qui enrichit", count: 1, source: "9:74" },
            { id: 190, arabic: "ٱلْمَانِعُ", transliteration: "Al-Mâni'", translation: "Al-Mani' — Celui qui empêche, le Protecteur", count: 1, source: "Bukhari" },
            { id: 191, arabic: "ٱلضَّارُّ", transliteration: "Ad-Dârr", translation: "Ad-Darr — Celui qui peut nuire (pour éprouver)", count: 1, source: "6:17" },
            { id: 192, arabic: "ٱلنَّافِعُ", transliteration: "An-Nâfi'", translation: "An-Nafi' — Celui qui profite, le Bienfaiteur", count: 1, source: "48:11" },
            { id: 193, arabic: "ٱلنُّورُ", transliteration: "An-Noûr", translation: "An-Nur — La Lumière", count: 1, source: "24:35" },
            { id: 194, arabic: "ٱلْهَادِي", transliteration: "Al-Hâdî", translation: "Al-Hadi — Le Guide", count: 1, source: "22:54" },
            { id: 195, arabic: "ٱلْبَدِيعُ", transliteration: "Al-Badî'", translation: "Al-Badi' — Le Créateur originel, l'Incomparable", count: 1, source: "2:117" },
            { id: 196, arabic: "ٱلْبَاقِي", transliteration: "Al-Bâqî", translation: "Al-Baqi — Le Permanent, Celui qui subsiste", count: 1, source: "20:73" },
            { id: 197, arabic: "ٱلْوَارِثُ", transliteration: "Al-Wârith", translation: "Al-Warith — L'Héritier de toute chose", count: 1, source: "15:23" },
            { id: 198, arabic: "ٱلرَّشِيدُ", transliteration: "Ar-Rashîd", translation: "Ar-Rashid — Le Guide par excellence", count: 1, source: "11:87" },
            { id: 199, arabic: "ٱلصَّبُورُ", transliteration: "As-Saboûr", translation: "As-Sabur — Le Patient, le Très Endurant", count: 1, source: "Bukhari & Muslim" },
        ]
    },
    // ── Du'as du Coran (hors Rabbana) ──
    {
        id: 'duas_coran',
        name: 'Du\'as du Coran',
        nameAr: 'أدعية من القرآن',
        icon: <BookOpen size={24} />,
        color: '#26A69A',
        adhkar: [
            { id: 301, arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ", transliteration: "Rabbi-ghfir warham wa anta khayrour-râhimîn", translation: "Seigneur ! Pardonne et fais miséricorde, car Tu es le Meilleur des miséricordieux.", count: 1, source: "23:118" },
            { id: 302, arabic: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ", transliteration: "Rabbi a'oûdhou bika min hamazâti-sh-shayâtîn, wa a'oûdhou bika rabbi an yahdouroûn", translation: "Seigneur ! Je cherche refuge auprès de Toi contre les incitations des diables. Et je cherche refuge auprès de Toi, Seigneur, pour qu'ils ne m'approchent pas.", count: 1, source: "23:97-98" },
            { id: 303, arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidnî 'ilmâ", translation: "Seigneur ! Augmente-moi en savoir.", count: 3, source: "20:114" },
            { id: 304, arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي", transliteration: "Rabbi-shrah lî sadrî, wa yassir lî amrî, wahloul 'ouqdatan min lisânî, yafqahoû qawlî", translation: "Seigneur ! Ouvre-moi ma poitrine, facilite-moi ma tâche, et dénoue un nœud en ma langue, afin qu'ils comprennent mes paroles.", count: 1, source: "20:25-28" },
            { id: 305, arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", transliteration: "Rabbi innî limâ anzalta ilayya min khayrin faqîr", translation: "Seigneur ! J'ai vraiment besoin de tout bien que Tu feras descendre vers moi. (Du'a de Mûsa)", count: 1, source: "28:24" },
            { id: 306, arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ", transliteration: "Rabbi lâ tadharnî fardan wa anta khayrou-l-wârithîn", translation: "Seigneur ! Ne me laisse pas seul, et Tu es le Meilleur des héritiers. (Du'a de Zakariyya)", count: 1, source: "21:89" },
            { id: 307, arabic: "رَبِّ هَبْ لِي مِن لَّدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ", transliteration: "Rabbi hab lî min ladounka dhourriyyatan tayyibah, innaka samî'ou-d-dou'â'", translation: "Seigneur ! Accorde-moi une descendance bonne, car Tu es Celui qui entend les invocations. (Du'a de Zakariyya)", count: 1, source: "3:38" },
            { id: 308, arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ", transliteration: "Rabbij'alnî mouqîma-s-salâti wa min dhourriyyatî, rabbanâ wa taqabbal dou'â'", translation: "Seigneur ! Fais que j'accomplisse la prière ainsi qu'une partie de ma descendance. Seigneur, exauce mon invocation. (Du'a d'Ibrahim)", count: 1, source: "14:40" },
            { id: 309, arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ", transliteration: "Rabbi awzi'nî an ashkoura ni'mataka-l-latî an'amta 'alayya wa 'alâ wâlidayya wa an a'mala sâlihan tardâh", translation: "Seigneur ! Inspire-moi pour que je sois reconnaissant du bienfait que Tu m'as accordé ainsi qu'à mes parents, et pour que je fasse une bonne œuvre que Tu agréeras. (Du'a de Sulayman)", count: 1, source: "27:19" },
            { id: 310, arabic: "رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ", transliteration: "Rabbi najjinî mina-l-qawmi-z-zâlimîn", translation: "Seigneur ! Sauve-moi du peuple injuste. (Du'a de Mûsa)", count: 1, source: "28:21" },
            { id: 311, arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي", transliteration: "Rabbi innî zalamtou nafsî fa-ghfir lî", translation: "Seigneur ! Je me suis fait du tort à moi-même, pardonne-moi. (Du'a de Mûsa)", count: 1, source: "28:16" },
            { id: 312, arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", transliteration: "Hasbiya-Llâhou lâ ilâha illâ houwa, 'alayhi tawakkaltou wa houwa rabbou-l-'arshi-l-'azîm", translation: "Allah me suffit. Il n'y a de divinité que Lui. En Lui je place ma confiance et Il est le Seigneur du Trône immense.", count: 7, source: "9:129" },
            { id: 313, arabic: "رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا", transliteration: "Rabbi adkhilnî moudkhala sidqin wa akhrijnî moukhraja sidqin waj'al lî min ladounka soultânan nasîrâ", translation: "Seigneur ! Fais-moi entrer par une entrée de vérité et fais-moi sortir par une sortie de vérité, et accorde-moi de Ta part un pouvoir secourable.", count: 1, source: "17:80" },
            { id: 314, arabic: "رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ", transliteration: "Rabbi hab lî houkman wa alhiqnî bi-s-sâlihîn", translation: "Seigneur ! Accorde-moi sagesse et fais-moi rejoindre les gens de bien. (Du'a d'Ibrahim)", count: 1, source: "26:83" },
            { id: 315, arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", transliteration: "Lâ ilâha illâ anta, soubhânaka innî kountu mina-z-zâlimîn", translation: "Pas de divinité à part Toi ! Pureté à Toi ! J'ai été du nombre des injustes. (Du'a de Yunus)", count: 3, source: "21:87" },
            { id: 316, arabic: "رَبِّ أَنزِلْنِي مُنزَلًا مُّبَارَكًا وَأَنتَ خَيْرُ الْمُنزِلِينَ", transliteration: "Rabbi anzilnî mounzalan moubârakan wa anta khayrou-l-mounzilîn", translation: "Seigneur ! Débarque-moi d'un débarquement béni, car Tu es le Meilleur des accueillants. (Du'a de Nuh)", count: 1, source: "23:29" },
            { id: 317, arabic: "رَبِّ ابْنِ لِي عِندَكَ بَيْتًا فِي الْجَنَّةِ", transliteration: "Rabbi-bni lî 'indaka baytan fi-l-jannah", translation: "Seigneur ! Construis-moi auprès de Toi une maison au Paradis. (Du'a de la femme de Pharaon)", count: 1, source: "66:11" },
            { id: 318, arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ", transliteration: "Rabbanâ lâ touzigh qouloûbanâ ba'da idh hadaytanâ wa hab lanâ min ladounka rahmah, innaka anta-l-Wahhâb", translation: "Seigneur ! Ne fais pas dévier nos cœurs après que Tu nous aies guidés. Accorde-nous Ta miséricorde. Tu es le Grand Donateur.", count: 1, source: "3:8" },
        ]
    },
    // ── Formules de Salawat ──
    {
        id: 'salawat',
        name: 'Formules de Salawat',
        nameAr: 'صيغ الصلاة على النبي ﷺ',
        icon: <Heart size={24} />,
        color: '#66BB6A',
        adhkar: [
            { id: 401, arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ", transliteration: "Allâhoumma salli 'alâ Muhammadin wa 'alâ âli Muhammadin kamâ sallayta 'alâ Ibrâhîma wa 'alâ âli Ibrâhîma innaka hamîdoun majîd. Allâhoumma bârik 'alâ Muhammadin wa 'alâ âli Muhammadin kamâ bârakta 'alâ Ibrâhîma wa 'alâ âli Ibrâhîma innaka hamîdoun majîd", translation: "Ô Allah ! Prie sur Muhammad et sur la famille de Muhammad comme Tu as prié sur Ibrahim et la famille d'Ibrahim, Tu es Digne de louange et de gloire. Ô Allah ! Bénis Muhammad et la famille de Muhammad comme Tu as béni Ibrahim et la famille d'Ibrahim, Tu es Digne de louange et de gloire. (As-Salât al-Ibrâhîmiyya — dans le Tashahhud)", count: 10, source: "Bukhari & Muslim" },
            { id: 402, arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ", transliteration: "Allâhoumma salli 'alâ Muhammadin wa 'alâ azwâjihi wa dhourriyyatihi kamâ sallayta 'alâ Ibrâhîm, wa bârik 'alâ Muhammadin wa 'alâ azwâjihi wa dhourriyyatihi kamâ bârakta 'alâ Ibrâhîma innaka hamîdoun majîd", translation: "Ô Allah ! Prie sur Muhammad, ses épouses et sa descendance, comme Tu as prié sur Ibrahim. Et bénis Muhammad, ses épouses et sa descendance, comme Tu as béni Ibrahim. Tu es Digne de louange et de gloire.", count: 10, source: "Bukhari & Muslim" },
            { id: 403, arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", transliteration: "Salla-Llâhou 'alayhi wa sallam", translation: "Qu'Allah prie sur lui et le salue. (Formule courte, à dire chaque fois qu'on mentionne le Prophète ﷺ)", count: 10, source: "33:56" },
            { id: 404, arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", transliteration: "Allâhoumma salli wa sallim 'alâ nabiyyinâ Muhammad", translation: "Ô Allah ! Prie et accorde la paix à notre prophète Muhammad. (Formule simple)", count: 10, source: "33:56" },
            { id: 405, arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ النَّبِيِّ الأُمِّيِّ وَعَلَى آلِهِ وَسَلِّمْ تَسْلِيمًا", transliteration: "Allâhoumma salli 'alâ Muhammadin-in-nabiyyi-l-oummiyyi wa 'alâ âlihi wa sallim taslîmâ", translation: "Ô Allah ! Prie sur Muhammad, le Prophète illettré, sur sa famille, et accorde-leur une paix abondante.", count: 10, source: "Muslim" },
            { id: 406, arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَآلِ إِبْرَاهِيمَ", transliteration: "Allâhoumma salli 'alâ Muhammadin 'abdika wa rasoûlika kamâ sallayta 'alâ Ibrâhîm, wa bârik 'alâ Muhammadin wa 'alâ âli Muhammadin kamâ bârakta 'alâ Ibrâhîma wa âli Ibrâhîm", translation: "Ô Allah ! Prie sur Muhammad, Ton serviteur et Ton messager, comme Tu as prié sur Ibrahim. Et bénis Muhammad et la famille de Muhammad comme Tu as béni Ibrahim et la famille d'Ibrahim.", count: 10, source: "Bukhari" },
            { id: 407, arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ", transliteration: "Allâhoumma salli 'alâ Muhammadin wa 'alâ âli Muhammad", translation: "Ô Allah ! Prie sur Muhammad et sur la famille de Muhammad. (Formule essentielle)", count: 10, source: "Muslim" },
            { id: 408, arabic: "سَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", transliteration: "Salâmoun 'ala-l-moursalîn, wa-l-hamdou li-Llâhi rabbi-l-'âlamîn", translation: "Paix sur les messagers, et louange à Allah, Seigneur des mondes.", count: 3, source: "37:181-182" },
        ]
    },
    // ── Formules d'Istighfar ──
    {
        id: 'istighfar',
        name: 'Formules d\'Istighfar',
        nameAr: 'صيغ الاستغفار',
        icon: <Heart size={24} />,
        color: '#AB47BC',
        adhkar: [
            { id: 501, arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirou-Llâh", translation: "Je demande pardon à Allah. (La formule la plus simple et la plus fréquente)", count: 100, source: "Muslim" },
            { id: 502, arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirou-Llâha wa atoûbou ilayh", translation: "Je demande pardon à Allah et je me repens vers Lui. (Le Prophète ﷺ la disait plus de 70 fois par jour)", count: 100, source: "Bukhari" },
            { id: 503, arabic: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ", transliteration: "Allâhoumma anta rabbî, lâ ilâha illâ ant, khalaqtanî wa ana 'abdouk, wa ana 'alâ 'ahdika wa wa'dika ma-stata't, a'oûdhou bika min sharri mâ sana't, aboû'ou laka bi ni'matika 'alayya, wa aboû'ou laka bi dhanbî, fa-ghfir lî fa innahou lâ yaghfirou-dh-dhounoûba illâ ant", translation: "Ô Allah ! Tu es mon Seigneur, il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur. Je suis fidèle à mon engagement envers Toi autant que je le peux. Je me réfugie auprès de Toi contre le mal que j'ai commis. Je reconnais Tes bienfaits envers moi et je reconnais mes péchés, pardonne-moi car nul ne pardonne les péchés hormis Toi. (Sayyid al-Istighfar — le maître de la demande de pardon)", count: 3, source: "Bukhari" },
            { id: 504, arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لا إِلَهَ إِلا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirou-Llâha-l-ladhî lâ ilâha illâ houwa-l-Hayyou-l-Qayyoûm wa atoûbou ilayh", translation: "Je demande pardon à Allah, il n'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même, et je me repens vers Lui.", count: 3, source: "Abu Dawud & Tirmidhi" },
            { id: 505, arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الْغَفُورُ", transliteration: "Rabbi-ghfir lî wa toub 'alayya innaka anta-t-Tawwâbou-l-Ghafour", translation: "Seigneur ! Pardonne-moi et accepte mon repentir, car Tu es le Repentant, le Pardonneur.", count: 3, source: "Abu Dawud & Tirmidhi" },
            { id: 506, arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ", transliteration: "Allâhoumma innî zalamtou nafsî zoulman kathîran, wa lâ yaghfirou-dh-dhounoûba illâ ant, fa-ghfir lî maghfiratan min 'indik, warhamnî innaka anta-l-Ghafourou-r-Rahîm", translation: "Ô Allah ! Je me suis fait beaucoup de tort à moi-même et nul ne pardonne les péchés sauf Toi. Accorde-moi un pardon venant de Toi et fais-moi miséricorde, car Tu es le Pardonneur, le Très Miséricordieux. (Du'a d'Abu Bakr)", count: 3, source: "Bukhari & Muslim" },
            { id: 507, arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لا إِلَهَ إِلا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ", transliteration: "Soubhânaka-Llâhoumma wa bihamdik, ash-hadou an lâ ilâha illâ ant, astaghfirouka wa atoûbou ilayk", translation: "Gloire et louange à Toi, ô Allah ! J'atteste qu'il n'y a de divinité que Toi. Je Te demande pardon et je me repens vers Toi. (Kaffârat al-Majlis — expiation de l'assemblée)", count: 3, source: "Abu Dawud & Tirmidhi" },
            { id: 508, arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ دِقَّهُ وَجِلَّهُ وَأَوَّلَهُ وَآخِرَهُ وَعَلانِيَتَهُ وَسِرَّهُ", transliteration: "Allâhoumma-ghfir lî dhanbî koullahi, diqqahou wa jillahou, wa awwalahou wa âkhirahou, wa 'alâniyatahou wa sirrah", translation: "Ô Allah ! Pardonne-moi tous mes péchés, petits et grands, les premiers et les derniers, ceux faits en public et ceux faits en secret.", count: 3, source: "Muslim" },
        ]
    },
    // ── Les 10 Du'as exaucées ──
    {
        id: 'duas_exaucees',
        name: 'Les 10 Du\'as exaucées',
        nameAr: 'أدعية مستجابة',
        icon: <Heart size={24} />,
        color: '#5C6BC0',
        adhkar: [
            { id: 601, arabic: "لا إِلَهَ إِلا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", transliteration: "Lâ ilâha illâ anta, soubhânaka innî kountu mina-z-zâlimîn", translation: "Pas de divinité à part Toi ! Pureté à Toi ! J'étais du nombre des injustes. (Du'a de Yunus — aucun musulman n'invoque avec cette formule sans être exaucé)", count: 3, source: "Tirmidhi — 21:87" },
            { id: 602, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لا إِلَهَ إِلا أَنْتَ الْمَنَّانُ بَدِيعُ السَّمَاوَاتِ وَالأَرْضِ يَا ذَا الْجَلالِ وَالإِكْرَامِ يَا حَيُّ يَا قَيُّومُ", transliteration: "Allâhoumma innî as'alouka bi anna laka-l-hamd, lâ ilâha illâ anta-l-Mannânou badî'ou-s-samâwâti wa-l-ard, yâ Dha-l-Jalâli wa-l-Ikrâm, yâ Hayyou yâ Qayyoûm", translation: "Ô Allah ! Je Te demande car à Toi appartient la louange, il n'y a de divinité que Toi, le Bienfaiteur, Créateur originel des cieux et de la terre, ô Plein de Majesté et de Munificence, ô Vivant, ô Subsistant.", count: 3, source: "Abu Dawud & Nasa'i" },
            { id: 603, arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ لا إِلَهَ إِلا أَنْتَ الأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", transliteration: "Allâhoumma innî as'alouka bi annî ash-hadou annaka anta-Llâh, lâ ilâha illâ anta-l-Ahadou-s-Samad, alladhî lam yalid wa lam yoûlad wa lam yakoun lahou koufouwan ahad", translation: "Ô Allah ! Je Te demande en attestant que Tu es Allah, pas de divinité sauf Toi, l'Unique, l'Absolu, qui n'a pas engendré et n'a pas été engendré, et dont nul n'est l'égal.", count: 3, source: "Abu Dawud & Tirmidhi" },
            { id: 604, arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", transliteration: "Yâ Hayyou yâ Qayyoûm, bi rahmatika astaghîth", translation: "Ô Vivant, ô Subsistant ! Par Ta miséricorde, je demande secours. (À dire dans les moments de détresse)", count: 3, source: "Tirmidhi" },
            { id: 605, arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لا إِلَهَ إِلا أَنْتَ", transliteration: "Allâhoumma rahmataka arjoû, falâ takilnî ilâ nafsî tarfata 'ayn, wa aslih lî sha'nî koullahou, lâ ilâha illâ ant", translation: "Ô Allah ! C'est Ta miséricorde que j'espère, ne me laisse pas à moi-même le temps d'un clin d'œil et arrange toutes mes affaires. Pas de divinité sauf Toi.", count: 3, source: "Abu Dawud" },
            { id: 606, arabic: "اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ نَاصِيَتِي بِيَدِكَ مَاضٍ فِيَّ حُكْمُكَ عَدْلٌ فِيَّ قَضَاؤُكَ أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي وَجَلاءَ حُزْنِي وَذَهَابَ هَمِّي", transliteration: "Allâhoumma innî 'abdouk, ibnou 'abdik, ibnou amatik, nâsiyatî biyadik, mâdin fiyya houkmok, 'adloun fiyya qadâ'ouk, as'alouka bi koulli ismin houwa lak, sammayta bihi nafsak, an taj'ala-l-Qur'âna rabî'a qalbî, wa noûra sadrî, wa jalâ'a hoznî, wa dhahâba hammî", translation: "Ô Allah ! Je suis Ton serviteur, fils de Ton serviteur, fils de Ta servante, mon front est dans Ta main, Ton jugement s'applique sur moi et Ton décret me concernant est juste. Je Te demande par chaque nom qui T'appartient de faire du Coran le printemps de mon cœur, la lumière de ma poitrine, la disparition de ma tristesse et la fin de mes soucis.", count: 1, source: "Ahmad" },
            { id: 607, arabic: "اللَّهُمَّ اكْفِنِي بِحَلالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", transliteration: "Allâhoumma-kfinî bi halâlika 'an harâmik, wa aghninî bi fadlika 'amman siwâk", translation: "Ô Allah ! Donne-moi suffisance par le licite pour me passer de l'illicite, et enrichis-moi par Ta grâce pour me passer de quiconque autre que Toi.", count: 3, source: "Tirmidhi" },
            { id: 608, arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbounâ-Llâhou wa ni'ma-l-wakîl", translation: "Allah nous suffit, quel excellent Protecteur ! (Parole d'Ibrahim et de Muhammad ﷺ dans les moments les plus difficiles)", count: 7, source: "Bukhari — 3:173" },
            { id: 609, arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْجُبْنِ وَالْبُخْلِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", transliteration: "Allâhoumma innî a'oûdhou bika mina-l-hammi wa-l-hazan, wa-l-'ajzi wa-l-kasal, wa-l-joubni wa-l-boukhl, wa dala'i-d-dayni wa ghalabati-r-rijâl", translation: "Ô Allah ! Je cherche refuge auprès de Toi contre le souci, la tristesse, l'incapacité, la paresse, la lâcheté, l'avarice, le poids des dettes et la domination des hommes.", count: 3, source: "Bukhari" },
            { id: 610, arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbanâ âtinâ fi-d-dounyâ hassanah, wa fi-l-âkhirati hassanah, wa qinâ 'adhâba-n-nâr", translation: "Notre Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l'au-delà, et protège-nous du châtiment du Feu ! (Du'a la plus fréquente du Prophète ﷺ)", count: 7, source: "Bukhari & Muslim — 2:201" },
        ]
    },
];

export function AdhkarPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { toggleFavoriteDua, isFavoriteDua } = useFavoritesStore();

    const [searchParams] = useSearchParams();

    // ═══ Mega-category navigation layer ═══
    const [viewLevel, setViewLevel] = useState<'mega' | 'chapters' | 'category'>(() => {
        if (searchParams.has('cat')) return 'category';
        if (searchParams.has('mega')) return 'chapters';
        const saved = localStorage.getItem('adhkar_view_level');
        return (saved as 'mega' | 'chapters' | 'category') || 'mega';
    });
    const [selectedMega, setSelectedMega] = useState<HisnMegaCategory | null>(() => {
        const megaParam = searchParams.get('mega');
        if (megaParam) {
            return HISNUL_MUSLIM_DATA.find(m => m.id === megaParam) || null;
        }
        const id = localStorage.getItem('adhkar_mega_id');
        return id ? HISNUL_MUSLIM_DATA.find(m => m.id === id) || null : null;
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { localStorage.setItem('adhkar_view_level', viewLevel); }, [viewLevel]);
    useEffect(() => { localStorage.setItem('adhkar_mega_id', selectedMega?.id || ''); }, [selectedMega]);

    // Search across all Hisnul Muslim chapters + original ADHKAR_DATA
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { hisnChapters: [] as { mega: HisnMegaCategory; chapter: HisnChapter }[], legacyCats: [] as AdhkarCategory[] };
        const q = searchQuery.toLowerCase();
        const hisnChapters: { mega: HisnMegaCategory; chapter: HisnChapter }[] = [];
        for (const mega of HISNUL_MUSLIM_DATA) {
            for (const ch of mega.chapters) {
                if (ch.title.toLowerCase().includes(q) || ch.titleAr.includes(q)) {
                    hisnChapters.push({ mega, chapter: ch });
                }
            }
        }
        const legacyCats = ADHKAR_DATA.filter(c => c.name.toLowerCase().includes(q) || c.nameAr.includes(q));
        return { hisnChapters, legacyCats };
    }, [searchQuery]);

    // Convert a HisnChapter to an AdhkarCategory for the existing player/list
    const hisnChapterToCategory = (chapter: HisnChapter): AdhkarCategory => ({
        id: `hisn_${chapter.id}`,
        name: chapter.title,
        nameAr: chapter.titleAr,
        icon: <BookOpen size={24} />,
        color: chapter.color,
        adhkar: chapter.duas.map(d => ({
            id: d.id,
            arabic: d.arabic,
            transliteration: d.phonetic,
            translation: d.translation,
            count: d.count,
            source: d.source
        })),
    });

    // Load persisted state
    const [selectedCategory, setSelectedCategory] = useState<AdhkarCategory | null>(() => {
        const catParam = searchParams.get('cat');
        if (catParam) {
            // Check original data first
            const found = ADHKAR_DATA.find(c => c.id === catParam);
            if (found) return found;
            // Check Hisnul Muslim chapters
            if (catParam.startsWith('hisn_')) {
                const chId = catParam.replace('hisn_', '');
                for (const mega of HISNUL_MUSLIM_DATA) {
                    const ch = mega.chapters.find(c => c.id === chId);
                    if (ch) return hisnChapterToCategory(ch);
                }
            }
        }

        const savedCatId = localStorage.getItem('adhkar_category_id');
        if (savedCatId) {
            // Check original data first
            const found = ADHKAR_DATA.find(c => c.id === savedCatId);
            if (found) return found;
            // Check Hisnul Muslim chapters
            if (savedCatId.startsWith('hisn_')) {
                const chId = savedCatId.replace('hisn_', '');
                for (const mega of HISNUL_MUSLIM_DATA) {
                    const ch = mega.chapters.find(c => c.id === chId);
                    if (ch) return hisnChapterToCategory(ch);
                }
            }
        }
        return null;
    });

    const [currentDhikrIndex, setCurrentDhikrIndex] = useState(() => {
        const savedIndex = localStorage.getItem('adhkar_dhikr_index');
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });

    const [repetitions, setRepetitions] = useState<Record<string, number>>({});

    // Default to list view when a category is selected, unless a specific dhikr was active
    const [showList, setShowList] = useState(() => {
        const savedView = localStorage.getItem('adhkar_view_state');
        // If we have a category but no specific view saved, default to list
        return savedView === 'list' || !savedView;
    });

    // Persist state changes
    useEffect(() => {
        if (selectedCategory) {
            localStorage.setItem('adhkar_category_id', selectedCategory.id);
        } else {
            localStorage.removeItem('adhkar_category_id');
        }
    }, [selectedCategory]);

    useEffect(() => {
        localStorage.setItem('adhkar_dhikr_index', currentDhikrIndex.toString());
    }, [currentDhikrIndex]);

    useEffect(() => {
        localStorage.setItem('adhkar_view_state', showList ? 'list' : 'player');
    }, [showList]);

    const handleCategoryClick = (category: AdhkarCategory) => {
        setSelectedCategory(category);
        setCurrentDhikrIndex(0);
        setRepetitions({});
        stopAudioLoop();
        setShowList(true); // Always start with List View
        setViewLevel('category');
    };

    const handleHisnChapterClick = (chapter: HisnChapter) => {
        handleCategoryClick(hisnChapterToCategory(chapter));
        setSearchQuery('');
    };

    const handleBackClick = () => {
        if (viewLevel === 'category' && selectedCategory) {
            if (!showList) {
                // If in Player, go back to List
                stopAudioLoop();
                setShowList(true);
            } else {
                // If in List, go back to previous level
                stopAudioLoop();
                setSelectedCategory(null);
                setShowList(true);
                setCurrentDhikrIndex(0);
                // If came from a Hisnul Muslim chapter, go back to chapters
                if (selectedCategory.id.startsWith('hisn_') && selectedMega) {
                    setViewLevel('chapters');
                } else {
                    setViewLevel('mega');
                }
            }
        } else if (viewLevel === 'chapters') {
            setSelectedMega(null);
            setViewLevel('mega');
        } else {
            navigate(-1);
        }
    };

    // ===== Audio Loop Player (via ttsService) =====
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioLoopCount, setAudioLoopCount] = useState(3);
    const [currentLoop, setCurrentLoop] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

    const togglePlaybackSpeed = () => {
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex] || 1.0);
    };

    const incrementCount = useCallback((dhikrId: number, maxCount: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        const current = repetitions[key] || 0;

        if (current < maxCount) {
            setRepetitions(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

            // Auto-advance to next dhikr when complete
            if (current + 1 >= maxCount && selectedCategory) {
                setTimeout(() => {
                    if (currentDhikrIndex < selectedCategory.adhkar.length - 1) {
                        setCurrentDhikrIndex(prev => prev + 1);
                    }
                }, 500);
            }
        }
    }, [selectedCategory, repetitions, currentDhikrIndex]);

    const getProgress = (dhikrId: number, maxCount: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        const current = repetitions[key] || 0;
        return (current / maxCount) * 100;
    };

    const getCurrentCount = (dhikrId: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        return repetitions[key] || 0;
    };

    const playDhikrOnce = useCallback(async (text: string, dhikrId: number, categoryId: string, source?: string) => {
        setIsAudioLoading(true);
        try {
            const { playAdhkarAudio } = await import('../lib/adhkarAudioService');
            await playAdhkarAudio(text, dhikrId, categoryId, source, { rate: playbackSpeed });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAudioLoading(false);
        }
    }, [playbackSpeed]);

    const playAudioLoop = useCallback(async () => {
        if (!selectedCategory) return;
        const dhikr = selectedCategory.adhkar[currentDhikrIndex];
        if (!dhikr) return;

        setIsAudioPlaying(true);
        setIsAudioLoading(true);
        setCurrentLoop(0);

        try {
            const { playAdhkarAudioLoop } = await import('../lib/adhkarAudioService');
            await playAdhkarAudioLoop(dhikr.arabic, dhikr.id, selectedCategory.id, audioLoopCount, dhikr.source, {
                rate: playbackSpeed,
                onLoop: (i) => setCurrentLoop(i),
                onEnd: () => {
                    // Auto-increment counter when loop finishes
                    incrementCount(dhikr.id, dhikr.count);
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAudioPlaying(false);
            setIsAudioLoading(false);
            setCurrentLoop(0);
        }
    }, [selectedCategory, currentDhikrIndex, audioLoopCount, incrementCount, playbackSpeed]);

    const pauseAudioLoop = useCallback(async () => {
        const { stopAdhkarAudio } = await import('../lib/adhkarAudioService');
        stopAdhkarAudio();
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
    }, []);

    const stopAudioLoop = useCallback(async () => {
        const { stopAdhkarAudio } = await import('../lib/adhkarAudioService');
        stopAdhkarAudio();
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
        setCurrentLoop(0);
    }, []);

    // Stop audio when dhikr changes
    useEffect(() => {
        stopAudioLoop();
    }, [currentDhikrIndex, stopAudioLoop]);

    // ═══════════════════════════════════════
    // VIEW: Mega Categories (home)
    // ═══════════════════════════════════════
    if (viewLevel === 'mega' && !selectedCategory) {
        return (
            <div className="adhkar-page">
                <div className="adhkar-header">
                    <button className="adhkar-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="adhkar-title">{t('sideMenu.adhkar')}</h1>
                    <div style={{ width: 44 }} />
                </div>

                <div className="adhkar-subtitle">
                    <span className="adhkar-subtitle-ar">حصن المسلم</span>
                    <span>{t('adhkar.hisnSubtitle', 'La Citadelle du Musulman')}</span>
                </div>

                {/* Search */}
                <div className="adhkar-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('adhkar.searchPlaceholder', 'Rechercher une invocation...')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="adhkar-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {searchQuery.trim() ? (
                    <div className="adhkar-categories">
                        {searchResults.hisnChapters.map(({ chapter }) => (
                            <button key={chapter.id} className="adhkar-category-card" onClick={() => handleHisnChapterClick(chapter)}>
                                <div className="category-icon" style={{ color: chapter.color }}>📿</div>
                                <div className="category-info">
                                    <span className="category-name">{chapter.title}</span>
                                    <span className="category-name-ar">{chapter.titleAr}</span>
                                </div>
                                <div className="category-count">{chapter.duas.length} {t('adhkar.dua', 'dua')}</div>
                                <ChevronRight size={20} className="category-arrow" />
                            </button>
                        ))}
                        {searchResults.legacyCats.map(cat => (
                            <button key={cat.id} className="adhkar-category-card" onClick={() => handleCategoryClick(cat)}>
                                <div className="category-icon" style={{ color: cat.color }}>{cat.icon}</div>
                                <div className="category-info">
                                    <span className="category-name">{t(`adhkar.categories.${cat.id}`, cat.name)}</span>
                                    <span className="category-name-ar">{cat.nameAr}</span>
                                </div>
                                <div className="category-count">{cat.adhkar.length} {t('adhkar.dhikrCount', 'dhikr')}</div>
                                <ChevronRight size={20} className="category-arrow" />
                            </button>
                        ))}
                        {searchResults.hisnChapters.length === 0 && searchResults.legacyCats.length === 0 && (
                            <div className="adhkar-empty">{t('adhkar.noResults', `Aucun résultat pour "${searchQuery}"`, { query: searchQuery })}</div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mega categories grid (Hisnul Muslim) */}
                        <div className="adhkar-mega-grid">
                            {HISNUL_MUSLIM_DATA.map(mega => (
                                <button key={mega.id} className="adhkar-mega-card" onClick={() => { setSelectedMega(mega); setViewLevel('chapters'); }}>
                                    <span className="mega-emoji">{mega.emoji}</span>
                                    <span className="mega-name">{mega.name}</span>
                                    <span className="mega-count">{mega.chapters.length}</span>
                                </button>
                            ))}
                        </div>

                        {/* Original categories (including Rabbanā — untouched) */}
                        <div className="adhkar-section-label">{t('adhkar.collections', 'Collections')}</div>
                        <div className="adhkar-categories">
                            {ADHKAR_DATA.map((category) => (
                                <button
                                    key={category.id}
                                    className={`adhkar-category-card ${category.id === 'rabanna' ? 'rabbana-card' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <div className="category-icon" style={{ color: category.color }}>
                                        {category.icon}
                                    </div>
                                    <div className="category-info">
                                        <span className="category-name">{t(`adhkar.categories.${category.id}`, category.name)}</span>
                                        <span className="category-name-ar">{category.nameAr}</span>
                                    </div>
                                    <div className="category-count">
                                        {category.adhkar.length} {t('adhkar.dhikrCount', 'dhikr')}
                                    </div>
                                    <ChevronRight size={20} className="category-arrow" />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════
    // VIEW: Chapters (inside a mega-category)
    // ═══════════════════════════════════════
    if (viewLevel === 'chapters' && selectedMega && !selectedCategory) {
        return (
            <div className="adhkar-page">
                <div className="adhkar-header">
                    <button className="adhkar-back-btn" onClick={handleBackClick}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="adhkar-title">{selectedMega.emoji} {selectedMega.name}</h1>
                    <div style={{ width: 44 }} />
                </div>
                <div className="adhkar-subtitle">
                    <span className="adhkar-subtitle-ar">{selectedMega.nameAr}</span>
                    <span>{selectedMega.chapters.length} {t('adhkar.chapters', 'chapitres')}</span>
                </div>
                <div className="adhkar-categories">
                    {selectedMega.chapters.map(chapter => (
                        <button key={chapter.id} className="adhkar-category-card" onClick={() => handleHisnChapterClick(chapter)}>
                            <div className="category-icon" style={{ color: chapter.color }}>📿</div>
                            <div className="category-info">
                                <span className="category-name">{chapter.title}</span>
                                <span className="category-name-ar">{chapter.titleAr}</span>
                            </div>
                            <div className="category-count">{chapter.duas.length} {t('adhkar.dua', 'dua')}</div>
                            <ChevronRight size={20} className="category-arrow" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Detail / List View
    if (!selectedCategory) return null;
    const currentDhikr = selectedCategory.adhkar[currentDhikrIndex];

    return (
        <div className="adhkar-page">
            <div className="adhkar-category-header" style={{ '--accent-color': selectedCategory.color } as any}>
                <button className="back-button" onClick={handleBackClick}>
                    <ArrowLeft size={24} />
                </button>
                <div className="header-titles">
                    <h1>{t(`adhkar.categories.${selectedCategory.id}`, selectedCategory.name)}</h1>
                    <span className="arabic-text">{selectedCategory.nameAr}</span>
                </div>
                <div className="progress-pill">
                    {currentDhikrIndex + 1} / {selectedCategory.adhkar.length}
                </div>
            </div>

            {showList ? (
                <div className="adhkar-list-view">
                    {selectedCategory.adhkar.map((dhikr, index) => (
                        <div
                            key={dhikr.id}
                            className={`adhkar-list-item ${index === currentDhikrIndex ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentDhikrIndex(index);
                                setShowList(false);
                            }}
                        >
                            <div className="list-item-header">
                                <span className="item-number">#{index + 1}</span>
                                <button
                                    className="list-item-tts-btn"
                                    onClick={(e) => { e.stopPropagation(); playDhikrOnce(dhikr.arabic, dhikr.id, selectedCategory.id, dhikr.source); }}
                                    title={t('common.listen', 'Écouter')}
                                >
                                    {isAudioLoading ? <Loader2 size={14} className="spin" /> : <Volume2 size={14} />}
                                </button>
                                <button
                                    className={`list-item-fav-btn ${isFavoriteDua(selectedCategory.id, dhikr.id) ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavoriteDua({
                                            chapterId: selectedCategory.id,
                                            duaId: dhikr.id,
                                            arabic: dhikr.arabic,
                                            translation: dhikr.translation,
                                            source: dhikr.source || '',
                                            chapterTitle: t(`adhkar.categories.${selectedCategory.id}`, selectedCategory.name),
                                        });
                                    }}
                                    title={isFavoriteDua(selectedCategory.id, dhikr.id) ? t('common.removeFromFavs', 'Retirer des favoris') : t('common.addToFavs', 'Ajouter aux favoris')}
                                >
                                    <Heart size={14} fill={isFavoriteDua(selectedCategory.id, dhikr.id) ? 'currentColor' : 'none'} />
                                </button>
                                {dhikr.source && <span className="item-source">{dhikr.source}</span>}
                            </div>
                            <p className="item-arabic">{dhikr.arabic}</p>
                            {dhikr.transliteration && (
                                <p className="item-phonetic" style={{ fontStyle: 'italic', opacity: 0.8, marginBottom: '6px' }}>
                                    {formatDivineNames(dhikr.transliteration)}
                                </p>
                            )}
                            <p className="item-translation">{formatDivineNames(dhikr.translation)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="adhkar-player">
                    {/* Dhikr Card */}
                    <div className="dhikr-container">
                        <div className="dhikr-card">
                            <div className="dhikr-arabic">
                                {currentDhikr.arabic}
                            </div>
                            {currentDhikr.transliteration && (
                                <div className="dhikr-phonetic" style={{ fontStyle: 'italic', opacity: 0.8, marginTop: '1rem', textAlign: 'center' }}>
                                    {formatDivineNames(currentDhikr.transliteration)}
                                </div>
                            )}
                            <div className="dhikr-translation">
                                {formatDivineNames(currentDhikr.translation)}
                            </div>
                            {currentDhikr.source && (
                                <div className="dhikr-source">
                                    📚 {currentDhikr.source}
                                </div>
                            )}
                            <button
                                className={`dhikr-fav-btn ${isFavoriteDua(selectedCategory.id, currentDhikr.id) ? 'active' : ''}`}
                                onClick={() => {
                                    toggleFavoriteDua({
                                        chapterId: selectedCategory.id,
                                        duaId: currentDhikr.id,
                                        arabic: currentDhikr.arabic,
                                        translation: currentDhikr.translation,
                                        source: currentDhikr.source || '',
                                        chapterTitle: t(`adhkar.categories.${selectedCategory.id}`, selectedCategory.name),
                                    });
                                }}
                            >
                                <Heart size={18} fill={isFavoriteDua(selectedCategory.id, currentDhikr.id) ? 'currentColor' : 'none'} />
                                {isFavoriteDua(selectedCategory.id, currentDhikr.id) ? t('common.inFavs', 'En favoris') : t('common.addToFavs', 'Ajouter aux favoris')}
                            </button>
                        </div>

                        {/* Audio Loop Player */}
                        <div className="dhikr-audio-player">
                            <div className="dhikr-audio-player__controls">
                                <button
                                    className="dhikr-audio-player__btn"
                                    onClick={isAudioPlaying ? pauseAudioLoop : playAudioLoop}
                                >
                                    {isAudioPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                {isAudioPlaying && (
                                    <button className="dhikr-audio-player__stop" onClick={stopAudioLoop}>
                                        <Square size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="dhikr-audio-player__loop">
                                <Repeat size={14} />
                                <button
                                    className="dhikr-audio-player__loop-btn"
                                    onClick={() => setAudioLoopCount(Math.max(1, audioLoopCount - 1))}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="dhikr-audio-player__loop-count">
                                    {isAudioPlaying ? `${currentLoop + 1}/${audioLoopCount}` : `${audioLoopCount}×`}
                                </span>
                                <button
                                    className="dhikr-audio-player__loop-btn"
                                    onClick={() => setAudioLoopCount(Math.min(20, audioLoopCount + 1))}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <button
                                className="dhikr-hifdh-link dhikr-speed-btn"
                                onClick={togglePlaybackSpeed}
                                title={t('common.playbackSpeed', 'Vitesse de lecture')}
                                style={{ marginLeft: 'auto', padding: '6px 12px', minWidth: '70px', justifyContent: 'center' }}
                            >
                                <Gauge size={16} />
                                <span>{playbackSpeed}x</span>
                            </button>

                            {/* Hifdh Studio Link for Rabbana */}
                            {selectedCategory.id === 'rabanna' && currentDhikr.source && (
                                <button
                                    className="dhikr-hifdh-link"
                                    title={t('adhkar.memorizeTooltip', 'Pratiquer dans le Hifdh Studio')}
                                    onClick={() => {
                                        const [s, a] = currentDhikr.source!.split(':').map(Number);
                                        if (s && a) {
                                            navigate('/hifdh', { state: { surah: s, ayah: a } });
                                        }
                                    }}
                                >
                                    <Mic size={18} />
                                    <span>{t('adhkar.memorize', 'Mémoriser')}</span>
                                </button>
                            )}
                        </div>

                        {/* Counter */}
                        <button
                            className="dhikr-counter"
                            onClick={() => incrementCount(currentDhikr.id, currentDhikr.count)}
                            style={{ borderColor: selectedCategory.color }}
                        >
                            <svg className="counter-progress" viewBox="0 0 100 100">
                                <circle className="counter-bg" cx="50" cy="50" r="45" />
                                <circle
                                    className="counter-fill"
                                    cx="50" cy="50" r="45"
                                    style={{
                                        strokeDasharray: `${getProgress(currentDhikr.id, currentDhikr.count) * 2.83} 283`,
                                        stroke: selectedCategory.color
                                    }}
                                />
                            </svg>
                            <div className="counter-text">
                                <span className="counter-current">{getCurrentCount(currentDhikr.id)}</span>
                                <span className="counter-total">/ {currentDhikr.count}</span>
                            </div>
                        </button>

                        {/* Navigation */}
                        <div className="dhikr-nav">
                            <button
                                className="dhikr-nav-btn"
                                onClick={() => setCurrentDhikrIndex(Math.max(0, currentDhikrIndex - 1))}
                                disabled={currentDhikrIndex === 0}
                            >
                                {t('common.previous', 'Précédent')}
                            </button>
                            <button
                                className="dhikr-nav-btn"
                                onClick={() => setCurrentDhikrIndex(Math.min(selectedCategory.adhkar.length - 1, currentDhikrIndex + 1))}
                                disabled={currentDhikrIndex === selectedCategory.adhkar.length - 1}
                            >
                                {t('common.next', 'Suivant')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

