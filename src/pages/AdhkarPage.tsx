import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, BookOpen, Shield, ChevronRight, Plane, Heart, Play, Pause, Square, Repeat, Minus, Plus } from 'lucide-react';
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

// Adhkar from Hisnul Muslim (La Citadelle du Musulman)
const ADHKAR_DATA: AdhkarCategory[] = [
    {
        id: 'morning',
        name: 'Adhkar du Matin',
        nameAr: 'أذكار الصباح',
        icon: <Sun size={24} />,
        color: '#FFD54F',
        adhkar: [
            {
                id: 1,
                arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
                translation: 'Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 2,
                arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
                translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au matin et c\'est par Toi que nous nous retrouvons au soir, c\'est par Toi que nous vivons et c\'est par Toi que nous mourons et c\'est vers Toi la résurrection.',
                count: 1,
                source: 'Tirmidhi'
            },
            {
                id: 3,
                arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
                translation: 'Gloire et pureté à Allah et louange à Lui.',
                count: 100,
                source: 'Bukhari, Muslim'
            },
            {
                id: 4,
                arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
                translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.',
                count: 10,
                source: 'Bukhari, Muslim'
            },
            {
                id: 5,
                arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
                translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.',
                count: 3,
                source: 'Muslim'
            },
        ]
    },
    {
        id: 'evening',
        name: 'Adhkar du Soir',
        nameAr: 'أذكار المساء',
        icon: <Moon size={24} />,
        color: '#7986CB',
        adhkar: [
            {
                id: 1,
                arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
                translation: 'Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 2,
                arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
                translation: 'Ô Allah, c\'est par Toi que nous nous retrouvons au soir et c\'est par Toi que nous nous retrouvons au matin, c\'est par Toi que nous vivons et c\'est par Toi que nous mourons et c\'est vers Toi le retour.',
                count: 1,
                source: 'Tirmidhi'
            },
            {
                id: 3,
                arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
                translation: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.',
                count: 3,
                source: 'Muslim'
            },
            {
                id: 4,
                arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
                translation: 'Au nom d\'Allah, Celui dont le nom protège de tout mal sur terre et dans le ciel. Il est l\'Audient, l\'Omniscient.',
                count: 3,
                source: 'Abu Dawud, Tirmidhi'
            },
        ]
    },
    {
        id: 'afterPrayer',
        name: 'Après la Prière',
        nameAr: 'أذكار بعد الصلاة',
        icon: <BookOpen size={24} />,
        color: '#4CAF50',
        adhkar: [
            {
                id: 1,
                arabic: 'أَسْتَغْفِرُ اللَّهَ',
                translation: 'Je demande pardon à Allah.',
                count: 3,
                source: 'Muslim'
            },
            {
                id: 2,
                arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
                translation: 'Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Plein de Majesté et de Noblesse.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 3,
                arabic: 'سُبْحَانَ اللَّهِ',
                translation: 'Gloire à Allah.',
                count: 33,
                source: 'Bukhari, Muslim'
            },
            {
                id: 4,
                arabic: 'الْحَمْدُ لِلَّهِ',
                translation: 'Louange à Allah.',
                count: 33,
                source: 'Bukhari, Muslim'
            },
            {
                id: 5,
                arabic: 'اللَّهُ أَكْبَرُ',
                translation: 'Allah est le Plus Grand.',
                count: 33,
                source: 'Bukhari, Muslim'
            },
            {
                id: 6,
                arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
                translation: 'Nulle divinité sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.',
                count: 1,
                source: 'Bukhari, Muslim'
            },
        ]
    },
    {
        id: 'protection',
        name: 'Protection',
        nameAr: 'أذكار الحماية',
        icon: <Shield size={24} />,
        color: '#FF7043',
        adhkar: [
            {
                id: 1,
                arabic: 'آيَةُ الْكُرْسِيِّ: اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...',
                translation: 'Ayat Al-Kursi (Sourate Al-Baqara, verset 255) - Allah, nulle divinité sauf Lui, le Vivant, Celui qui subsiste par Lui-même...',
                count: 1,
                source: 'Bukhari'
            },
            {
                id: 2,
                arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ (الإخلاص)',
                translation: 'Sourate Al-Ikhlas - Dis: Il est Allah, Unique.',
                count: 3,
                source: 'Abu Dawud, Tirmidhi'
            },
            {
                id: 3,
                arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (الفلق)',
                translation: 'Sourate Al-Falaq - Dis: Je cherche refuge auprès du Seigneur de l\'aube.',
                count: 3,
                source: 'Abu Dawud, Tirmidhi'
            },
            {
                id: 4,
                arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (الناس)',
                translation: 'Sourate An-Nas - Dis: Je cherche refuge auprès du Seigneur des hommes.',
                count: 3,
                source: 'Abu Dawud, Tirmidhi'
            },
        ]
    },
    {
        id: 'travel',
        name: 'En Voyage',
        nameAr: 'أذكار السفر',
        icon: <Plane size={24} />,
        color: '#26C6DA',
        adhkar: [
            {
                id: 1,
                arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
                translation: 'Allah est le Plus Grand (3x). Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer. Et c\'est vers notre Seigneur que nous retournerons.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 2,
                arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ',
                translation: 'Ô Allah, nous Te demandons dans ce voyage la bonté et la piété, ainsi que les actions qui Te plaisent.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 3,
                arabic: 'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ',
                translation: 'Ô Allah, facilite-nous ce voyage et raccourcis-en la distance.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 4,
                arabic: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ',
                translation: 'Ô Allah, Tu es le Compagnon de voyage et le Protecteur de la famille.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 5,
                arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ',
                translation: 'Ô Allah, je cherche refuge auprès de Toi contre les difficultés du voyage, la tristesse du retour, et le mauvais sort dans les biens et la famille.',
                count: 1,
                source: 'Muslim'
            },
            {
                id: 6,
                arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
                translation: 'Nous voilà de retour, repentants, adorant et louant notre Seigneur. (À dire au retour)',
                count: 1,
                source: 'Muslim'
            },
        ]
    },
    {
        id: 'rabanna',
        name: 'Invocations Rabbanā',
        nameAr: 'أدعية ربنا',
        icon: <Heart size={24} />,
        color: '#E91E63',
        adhkar: [
            {
                id: 1,
                arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                translation: 'Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l\'au-delà ; et protège-nous du châtiment du Feu.',
                count: 3,
                source: 'Al-Baqarah 2:201'
            },
            {
                id: 2,
                arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
                translation: 'Ô notre Seigneur ! Accepte ceci de notre part, car c\'est Toi l\'Audient, l\'Omniscient.',
                count: 3,
                source: 'Al-Baqarah 2:127'
            },
            {
                id: 3,
                arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ',
                translation: 'Seigneur ! Ne laisse pas dévier nos cœurs après que Tu nous aies guidés ; et accorde-nous Ta miséricorde. C\'est Toi le Grand Donateur.',
                count: 3,
                source: 'Āl-Imrān 3:8'
            },
            {
                id: 4,
                arabic: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ',
                translation: 'Seigneur ! Nous avons cru ; pardonne-nous donc nos péchés et protège-nous du châtiment du Feu.',
                count: 3,
                source: 'Āl-Imrān 3:16'
            },
            {
                id: 5,
                arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
                translation: 'Ô notre Seigneur ! Nous nous sommes fait du tort à nous-mêmes. Et si Tu ne nous pardonnes pas et ne nous fais pas miséricorde, nous serons certainement du nombre des perdants.',
                count: 3,
                source: 'Al-A\'rāf 7:23'
            },
            {
                id: 6,
                arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
                translation: 'Seigneur ! Déverse sur nous l\'endurance et fais nous mourir entièrement soumis.',
                count: 3,
                source: 'Al-A\'rāf 7:126'
            },
            {
                id: 7,
                arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ',
                translation: 'Seigneur ! Ne fais pas de nous un objet de tentation pour les gens injustes, et délivre-nous par Ta miséricorde du peuple mécréant.',
                count: 3,
                source: 'Yūnus 10:85-86'
            },
            {
                id: 8,
                arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
                translation: 'Ô notre Seigneur ! Pardonne-moi, ainsi qu\'à mes père et mère et aux croyants, le jour de la reddition des comptes.',
                count: 3,
                source: 'Ibrāhīm 14:41'
            },
            {
                id: 9,
                arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
                translation: 'Seigneur ! Donne-nous, en nos épouses et nos descendants, la joie des yeux, et fais de nous un guide pour les pieux.',
                count: 3,
                source: 'Al-Furqān 25:74'
            },
            {
                id: 10,
                arabic: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
                translation: 'Notre Seigneur ! Accorde-nous de Ta part une miséricorde ; et assure-nous la droiture dans notre affaire.',
                count: 3,
                source: 'Al-Kahf 18:10'
            },
        ]
    },
];

export function AdhkarPage() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<AdhkarCategory | null>(null);
    const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
    const [repetitions, setRepetitions] = useState<Record<string, number>>({});

    const handleCategoryClick = (category: AdhkarCategory) => {
        setSelectedCategory(category);
        setCurrentDhikrIndex(0);
        setRepetitions({});
        stopAudioLoop();
    };

    const closeCategory = () => {
        stopAudioLoop();
        setSelectedCategory(null);
    };

    // ===== Audio Loop Player =====
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioLoopCount, setAudioLoopCount] = useState(3);
    const [currentLoop, setCurrentLoop] = useState(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const loopCounterRef = useRef(0);
    const maxLoopRef = useRef(3);
    const shouldPlayRef = useRef(false);

    const speakDhikr = useCallback((text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.pitch = 1;

        // Try to find an Arabic voice
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onend = () => {
            if (!shouldPlayRef.current) return;
            loopCounterRef.current++;
            setCurrentLoop(loopCounterRef.current);

            if (loopCounterRef.current < maxLoopRef.current) {
                // Small pause between repetitions
                setTimeout(() => {
                    if (shouldPlayRef.current) speakDhikr(text);
                }, 600);
            } else {
                // Done
                shouldPlayRef.current = false;
                setIsAudioPlaying(false);
                loopCounterRef.current = 0;
                setCurrentLoop(0);
            }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const playAudioLoop = useCallback(() => {
        if (!selectedCategory) return;
        const dhikr = selectedCategory.adhkar[currentDhikrIndex];
        if (!dhikr) return;

        shouldPlayRef.current = true;
        maxLoopRef.current = audioLoopCount;
        loopCounterRef.current = 0;
        setCurrentLoop(0);
        setIsAudioPlaying(true);
        speakDhikr(dhikr.arabic);
    }, [selectedCategory, currentDhikrIndex, audioLoopCount, speakDhikr]);

    const pauseAudioLoop = useCallback(() => {
        shouldPlayRef.current = false;
        window.speechSynthesis.cancel();
        setIsAudioPlaying(false);
    }, []);

    const stopAudioLoop = useCallback(() => {
        shouldPlayRef.current = false;
        window.speechSynthesis.cancel();
        setIsAudioPlaying(false);
        loopCounterRef.current = 0;
        setCurrentLoop(0);
    }, []);

    // Stop audio when dhikr changes
    useEffect(() => {
        stopAudioLoop();
    }, [currentDhikrIndex, stopAudioLoop]);

    const incrementCount = (dhikrId: number, maxCount: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        const current = repetitions[key] || 0;

        if (current < maxCount) {
            setRepetitions({ ...repetitions, [key]: current + 1 });

            // Auto-advance to next dhikr when complete
            if (current + 1 >= maxCount && selectedCategory) {
                setTimeout(() => {
                    if (currentDhikrIndex < selectedCategory.adhkar.length - 1) {
                        setCurrentDhikrIndex(currentDhikrIndex + 1);
                    }
                }, 500);
            }
        }
    };

    const getProgress = (dhikrId: number, maxCount: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        const current = repetitions[key] || 0;
        return (current / maxCount) * 100;
    };

    const getCurrentCount = (dhikrId: number) => {
        const key = `${selectedCategory?.id}-${dhikrId}`;
        return repetitions[key] || 0;
    };

    // Category List View
    if (!selectedCategory) {
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
                    <span className="adhkar-subtitle-ar">الأذكار</span>
                    <span>De la Citadelle du Musulman</span>
                </div>

                <div className="adhkar-categories">
                    {ADHKAR_DATA.map((category) => (
                        <button
                            key={category.id}
                            className="adhkar-category-card"
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
            </div>
        );
    }

    // Dhikr Detail View
    const currentDhikr = selectedCategory.adhkar[currentDhikrIndex];

    return (
        <div className="adhkar-page">
            <div className="adhkar-header">
                <button className="adhkar-back-btn" onClick={closeCategory}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="adhkar-title">{selectedCategory.name}</h1>
                <span className="adhkar-progress-text">
                    {currentDhikrIndex + 1}/{selectedCategory.adhkar.length}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="adhkar-progress-bar">
                <div
                    className="adhkar-progress-fill"
                    style={{
                        width: `${((currentDhikrIndex + 1) / selectedCategory.adhkar.length) * 100}%`,
                        backgroundColor: selectedCategory.color
                    }}
                />
            </div>

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
    );
}
