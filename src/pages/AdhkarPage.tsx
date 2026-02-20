import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Heart, Play, Pause, Square, Repeat, Minus, Plus, Mic, Volume2, Loader2, Search, X } from 'lucide-react';
import { HISNUL_MUSLIM_DATA, type HisnMegaCategory, type HisnChapter } from '../data/hisnulMuslim';
import { useFavoritesStore } from '../stores/favoritesStore';
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
];

export function AdhkarPage() {
    const navigate = useNavigate();
    const { toggleFavoriteDua, isFavoriteDua } = useFavoritesStore();

    // ═══ Mega-category navigation layer ═══
    const [viewLevel, setViewLevel] = useState<'mega' | 'chapters' | 'category'>(() => {
        const saved = localStorage.getItem('adhkar_view_level');
        return (saved as 'mega' | 'chapters' | 'category') || 'mega';
    });
    const [selectedMega, setSelectedMega] = useState<HisnMegaCategory | null>(() => {
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
        adhkar: chapter.duas.map(d => ({ id: d.id, arabic: d.arabic, translation: d.translation, count: d.count, source: d.source })),
    });

    // Load persisted state
    const [selectedCategory, setSelectedCategory] = useState<AdhkarCategory | null>(() => {
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
            await playAdhkarAudio(text, dhikrId, categoryId, source, { rate: 0.85 });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAudioLoading(false);
        }
    }, []);

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
                rate: 0.85,
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
    }, [selectedCategory, currentDhikrIndex, audioLoopCount, incrementCount]);

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
                    <h1 className="adhkar-title">Invocations</h1>
                    <div style={{ width: 44 }} />
                </div>

                <div className="adhkar-subtitle">
                    <span className="adhkar-subtitle-ar">حصن المسلم</span>
                    <span>La Citadelle du Musulman</span>
                </div>

                {/* Search */}
                <div className="adhkar-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une invocation..."
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
                                <div className="category-count">{chapter.duas.length} dua</div>
                                <ChevronRight size={20} className="category-arrow" />
                            </button>
                        ))}
                        {searchResults.legacyCats.map(cat => (
                            <button key={cat.id} className="adhkar-category-card" onClick={() => handleCategoryClick(cat)}>
                                <div className="category-icon" style={{ color: cat.color }}>{cat.icon}</div>
                                <div className="category-info">
                                    <span className="category-name">{cat.name}</span>
                                    <span className="category-name-ar">{cat.nameAr}</span>
                                </div>
                                <div className="category-count">{cat.adhkar.length} dhikr</div>
                                <ChevronRight size={20} className="category-arrow" />
                            </button>
                        ))}
                        {searchResults.hisnChapters.length === 0 && searchResults.legacyCats.length === 0 && (
                            <div className="adhkar-empty">Aucun résultat pour "{searchQuery}"</div>
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
                        <div className="adhkar-section-label">Collections</div>
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
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-name-ar">{category.nameAr}</span>
                                    </div>
                                    <div className="category-count">
                                        {category.adhkar.length} dhikr
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
                    <span>{selectedMega.chapters.length} chapitres</span>
                </div>
                <div className="adhkar-categories">
                    {selectedMega.chapters.map(chapter => (
                        <button key={chapter.id} className="adhkar-category-card" onClick={() => handleHisnChapterClick(chapter)}>
                            <div className="category-icon" style={{ color: chapter.color }}>📿</div>
                            <div className="category-info">
                                <span className="category-name">{chapter.title}</span>
                                <span className="category-name-ar">{chapter.titleAr}</span>
                            </div>
                            <div className="category-count">{chapter.duas.length} dua</div>
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
                    <h1>{selectedCategory.name}</h1>
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
                                    title="Écouter"
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
                                            chapterTitle: selectedCategory.name,
                                        });
                                    }}
                                    title={isFavoriteDua(selectedCategory.id, dhikr.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                >
                                    <Heart size={14} fill={isFavoriteDua(selectedCategory.id, dhikr.id) ? 'currentColor' : 'none'} />
                                </button>
                                {dhikr.source && <span className="item-source">{dhikr.source}</span>}
                            </div>
                            <p className="item-arabic">{dhikr.arabic.substring(0, 80)}...</p>
                            <p className="item-translation">{dhikr.translation.substring(0, 100)}...</p>
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
                            <div className="dhikr-translation">
                                {currentDhikr.translation}
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
                                        chapterTitle: selectedCategory.name,
                                    });
                                }}
                            >
                                <Heart size={18} fill={isFavoriteDua(selectedCategory.id, currentDhikr.id) ? 'currentColor' : 'none'} />
                                {isFavoriteDua(selectedCategory.id, currentDhikr.id) ? 'En favoris' : 'Ajouter aux favoris'}
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

                            {/* Hifdh Studio Link for Rabbana */}
                            {selectedCategory.id === 'rabanna' && currentDhikr.source && (
                                <button
                                    className="dhikr-hifdh-link"
                                    title="Pratiquer dans le Hifdh Studio (Mot à mot)"
                                    onClick={() => {
                                        const [s, a] = currentDhikr.source!.split(':').map(Number);
                                        if (s && a) {
                                            navigate('/hifdh', { state: { surah: s, ayah: a } });
                                        }
                                    }}
                                >
                                    <Mic size={18} />
                                    <span>Mémoriser</span>
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
                                Précédent
                            </button>
                            <button
                                className="dhikr-nav-btn"
                                onClick={() => setCurrentDhikrIndex(Math.min(selectedCategory.adhkar.length - 1, currentDhikrIndex + 1))}
                                disabled={currentDhikrIndex === selectedCategory.adhkar.length - 1}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

