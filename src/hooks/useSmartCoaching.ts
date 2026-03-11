import { useState, useEffect } from 'react';
import { useSmartStore } from '../stores/smartStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useStatsStore } from '../stores/statsStore';
import { getHijriDate } from '../lib/dateUtils';
import { getCurrentWeather } from '../lib/weatherService';
import type { DayTimes } from '../lib/prayerEngine';

export interface SmartCardData {
    id: string;
    type: string;
    emoji: string;
    title: string;
    textAr: string;
    textFr: string;
    phonetic?: string;
    gradient: string;
    progress?: number; // For Kahf for example
    link?: string; // App route to navigate to
}

const HIJRI_HISTORY_EVENTS: Record<string, { title: string, text: string }> = {
    '1-9': { title: 'Début du Ramadan', text: 'Le mois du Coran commence. Redouble d\'efforts dans la lecture.' },
    '17-9': { title: 'Bataille de Badr', text: 'Jour du Discernement (Yawm al-Furqan). La première grande victoire de l\'Islam.' },
    '27-9': { title: 'Nuit du Destin', text: 'Une nuit meilleure que mille mois. Multiplie les invocations.' },
    '1-10': { title: 'Eid al-Fitr', text: 'Jour de fête et de gratitude après un mois de jeûne.' },
    '9-12': { title: 'Jour d\'Arafat', text: 'Le jour le plus important du Hajj. Le jeûne expie deux années de péchés.' },
    '10-12': { title: 'Eid al-Adha', text: 'Fête du sacrifice en souvenir de la foi de Ibrahim (as).' },
    '1-1': { title: 'Nouvel An Hégirien', text: 'Début d\'une nouvelle année. L\'occasion de prendre de bonnes résolutions.' },
    '10-1': { title: 'Achoura', text: 'Le jour où Allah a sauvé Moussa (as) de Pharaon.' },
};

const QURAN_VOCABULARY = [
    { word: 'Tawakkul', ar: 'تَوَكُّل', meaning: 'Confiance absolue en Allah.', ref: 'Al-Imran, 159', surah: 3, ayah: 159 },
    { word: 'Rahmah', ar: 'رَحْمَة', meaning: 'Miséricorde qui embrasse toute chose.', ref: 'Al-Araf, 156', surah: 7, ayah: 156 },
    { word: 'Sabr', ar: 'صَبْر', meaning: 'Patience belle et persévérance.', ref: 'Al-Baqarah, 153', surah: 2, ayah: 153 },
    { word: 'Ikhlas', ar: 'إِخْلَاص', meaning: 'Sincérité pure pour Allah seul.', ref: 'Al-Ikhlas, 1', surah: 112, ayah: 1 },
    { word: 'Shukr', ar: 'شُكْر', meaning: 'Gratitude qui augmente les bienfaits.', ref: 'Ibrahim, 7', surah: 14, ayah: 7 },
    { word: 'Taqwa', ar: 'تَقْوَى', meaning: 'Piété, conscience constante de la présence d\'Allah.', ref: 'Al-Baqarah, 197', surah: 2, ayah: 197 },
    { word: 'Huda', ar: 'هُدًى', meaning: 'La guidance divine illuminant le chemin.', ref: 'Al-Baqarah, 2', surah: 2, ayah: 2 },
    { word: 'Yaqeen', ar: 'يَقِين', meaning: 'Certitude inébranlable dans la foi.', ref: 'Al-Hijr, 99', surah: 15, ayah: 99 },
    { word: 'Ihsan', ar: 'إِحْسَان', meaning: 'L\'excellence, adorer Allah comme si on Le voyait.', ref: 'Ar-Rahman, 60', surah: 55, ayah: 60 },
    { word: 'Tawbah', ar: 'تَوْبَة', meaning: 'Repentir sincère et retour vers Allah.', ref: 'At-Tahrim, 8', surah: 66, ayah: 8 },
    { word: 'Hikmah', ar: 'حِكْمَة', meaning: 'Sagesse, compréhension profonde accordée par Allah.', ref: 'Al-Baqarah, 269', surah: 2, ayah: 269 },
    { word: 'Sakinah', ar: 'سَكِينَة', meaning: 'Sérénité et paix du cœur descendue d\'Allah.', ref: 'Al-Fath, 4', surah: 48, ayah: 4 },
    { word: 'Rida', ar: 'رِضَا', meaning: 'Satisfaction totale et acceptation du décret divin.', ref: 'Al-Bayyinah, 8', surah: 98, ayah: 8 },
    { word: 'Maghfirah', ar: 'مَغْفِرَة', meaning: 'Pardon et effacement des péchés.', ref: 'Al-Imran, 133', surah: 3, ayah: 133 },
    { word: 'Barakah', ar: 'بَرَكَة', meaning: 'Bénédiction divine qui multiplie le bien.', ref: 'Sad, 29', surah: 38, ayah: 29 },
    { word: 'Istighfar', ar: 'اسْتِغْفَار', meaning: 'Demande active du pardon d\'Allah.', ref: 'Nuh, 10', surah: 71, ayah: 10 },
    { word: 'Dhikr', ar: 'ذِكْر', meaning: 'Révocation constante d\'Allah pour apaiser le cœur.', ref: 'Ar-Ra\'d, 28', surah: 13, ayah: 28 },
    { word: 'Noor', ar: 'نُور', meaning: 'Lumière divine qui éclaire les cœurs et les mondes.', ref: 'An-Nur, 35', surah: 24, ayah: 35 },
    { word: 'Amanah', ar: 'أَمَانَة', meaning: 'Dépôt honorifique, loyauté et responsabilité.', ref: 'Al-Ahzab, 72', surah: 33, ayah: 72 },
    { word: 'Adl', ar: 'عَدْل', meaning: 'La justice absolue et l\'équité.', ref: 'An-Nahl, 90', surah: 16, ayah: 90 },
    { word: 'Afw', ar: 'عَفْو', meaning: 'Absolution totale, l\'effacement complet de la faute.', ref: 'Araf, 199', surah: 7, ayah: 199 },
    { word: 'Wadd', ar: 'وُدّ', meaning: 'Amour pur et affection profonde accordée par le Clément.', ref: 'Maryam, 96', surah: 19, ayah: 96 },
    { word: 'Rushd', ar: 'رُشْد', meaning: 'Droiture, maturité spirituelle et voie de la vérité.', ref: 'Al-Kahf, 10', surah: 18, ayah: 10 },
    { word: 'Khushu', ar: 'خُشُوع', meaning: 'Humilité profonde et concentration du cœur dans la prière.', ref: 'Al-Mu\'minun, 2', surah: 23, ayah: 2 },
    { word: 'Yusr', ar: 'يُسْر', meaning: 'La facilité qui accompagne inévitablement l\'épreuve.', ref: 'Ash-Sharh, 5', surah: 94, ayah: 5 },
    { word: 'Haqq', ar: 'حَقّ', meaning: 'La vérité absolue, le droit inaliénable.', ref: 'Yunus, 32', surah: 10, ayah: 32 },
    { word: 'Qist', ar: 'قِسْط', meaning: 'L\'équité, la part juste attribuée à chaque chose.', ref: 'Al-Ma\'idah, 8', surah: 5, ayah: 8 },
    { word: 'Ajal', ar: 'أَجَل', meaning: 'Le terme fixé, le moment décrété par la Sagesse.', ref: 'Al-An\'am, 2', surah: 6, ayah: 2 },
    { word: 'Fadl', ar: 'فَضْل', meaning: 'La grâce immense et la faveur imméritée d\'Allah.', ref: 'Al-Jumu\'ah, 4', surah: 62, ayah: 4 },
    { word: 'Bayan', ar: 'بَيَان', meaning: 'L\'éloquence, l\'explication claire et lumineuse.', ref: 'Ar-Rahman, 4', surah: 55, ayah: 4 },
    { word: 'Salaam', ar: 'سَلَام', meaning: 'La Paix, attribut divin et salutation des paradisiaques.', ref: 'Yasin, 58', surah: 36, ayah: 58 }
];

export function useSmartCoaching() {
    const smart = useSmartStore();
    const prayer = usePrayerStore();
    const stats = useStatsStore();
    const [cards, setCards] = useState<SmartCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function analyzeContext() {
            try {
                if (!smart.globalEnabled) {
                    if (mounted) {
                        setCards([]);
                        setLoading(false);
                    }
                    return;
                }

                const activeCards: SmartCardData[] = [];
                const now = new Date();
                const hijri = getHijriDate(now);
                const { day, month } = hijri;
                const dayOfWeek = now.getDay();
                const hour = now.getHours();
                const minute = now.getMinutes();

                // ─── PHASE 1: LOCAL / SYNC CARDS ─────────────────
                // (Populate everything that doesn't need network)

                // 2. Mode Khushu
                const todayResult = prayer.getTodayResult();
                if (todayResult) {
                    const nowTotalMin = hour * 60 + minute;
                    const pKeys: (keyof DayTimes)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                    const pNames: Record<string, string> = { fajr: 'Sobh', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };

                    for (const pKey of pKeys) {
                        const pDateRaw = todayResult.times[pKey];
                        if (!pDateRaw) continue;

                        // Parse date as it comes back as string from Zustand's localStorage persist
                        const pDate = new Date(pDateRaw);
                        if (isNaN(pDate.getTime())) continue;

                        const pTotalMin = pDate.getHours() * 60 + pDate.getMinutes();
                        const diff = pTotalMin - nowTotalMin;

                        if (diff > 0 && diff <= 20) {
                            activeCards.push({
                                id: `khushu-${pKey}`,
                                type: 'spirituality',
                                emoji: '🕌',
                                title: `Vers le ${pNames[pKey]}`,
                                textAr: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
                                textFr: `Plus que ${diff} min avant le début de la prière. Préparez votre cœur au Khushu.`,
                                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                link: '/adhkar?cat=hisn_chap_12'
                            });
                            break;
                        }
                    }
                }

                // 3. Jours Blancs
                if (smart.whiteDaysEnabled && (day === 13 || day === 14 || day === 15)) {
                    activeCards.push({
                        id: 'white-days', type: 'calendar', emoji: '🌕',
                        title: `Jour Blanc (${day} ${month})`,
                        textAr: 'السنة صيام الأيام البيض',
                        textFr: 'C\'est l\'un des 3 jours blancs. Le jeûne y est fortement recommandé.',
                        gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
                        link: '/hadiths?cat=jeune'
                    });
                }

                // 4. Jumu'ah & Kinship
                if (smart.kinshipEnabled && dayOfWeek === 5 && hour >= 14 && hour < 18) {
                    activeCards.push({
                        id: 'kinship', type: 'social', emoji: '📞',
                        title: 'Sentinelle du Vendredi',
                        textAr: 'وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ',
                        textFr: 'Rappel pour prendre des nouvelles de vos proches et renforcer les liens.',
                        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        link: '/hadiths?cat=fraternite'
                    });
                }

                // 5. Al-Kahf
                if (smart.alKahfEnabled && dayOfWeek === 5) {
                    activeCards.push({
                        id: 'al-kahf', type: 'reading', emoji: '🏔️',
                        title: 'Lumière du Vendredi',
                        textAr: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ',
                        textFr: 'Objectif : Lire Sourate Al-Kahf pour une lumière entre deux vendredis.',
                        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        progress: 0,
                        link: '/read?surah=18'
                    });
                }

                // 6. Booster du Fajr
                if (smart.fajrBoosterEnabled && hour >= 5 && hour <= 7) {
                    activeCards.push({
                        id: 'fajr-booster', type: 'motivation', emoji: '🌅',
                        title: 'Booster du Fajr',
                        textAr: 'اللهم بارك لأمتي في بكورها',
                        textFr: '« Ô Allah, bénis ma communauté dans sa prime matinée. »',
                        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                        link: '/adhkar?mega=daily'
                    });
                }

                // 7. Retraite Nocturne
                if (smart.saharEnabled) {
                    if (hour >= 2 && hour < 4) {
                        activeCards.push({
                            id: 'night-retreat', type: 'spirituality', emoji: '🌌',
                            title: 'Retraite Nocturne',
                            textAr: 'أَمَّنْ هُوَ قَانِتٌ آنَاءَ اللَّيْلِ سَاجِداً وَقَائِماً',
                            textFr: 'Le monde dort, mais vous êtes avec Allah. Moment idéal pour le Qiyam.',
                            gradient: 'linear-gradient(135deg, #090909 0%, #1a1a1a 100%)',
                            link: '/adhkar?cat=hisn_chap_1'
                        });
                    } else if (hour === 4) {
                        activeCards.push({
                            id: 'sahar-moment', type: 'spirituality', emoji: '🌌',
                            title: 'Moment Sacré (Sahar)',
                            textAr: 'وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
                            textFr: '« ...et aux dernières heures de la nuit, ils demandaient pardon. »',
                            gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                            link: '/adhkar?cat=hisn_chap_1'
                        });
                    }
                }

                // 8. Bouclier de l'Habitude
                if (stats.readingStreak > 0 && stats.todayPagesRead === 0 && hour >= 18) {
                    activeCards.push({
                        id: 'habit-shield', type: 'motivation', emoji: '🛡️',
                        title: 'Bouclier de l\'Habitude',
                        textAr: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا',
                        textFr: `Votre série de ${stats.readingStreak} jours est en jeu ! Une petite page pour la sauver ?`,
                        gradient: 'linear-gradient(135deg, #f44336 0%, #ff9800 100%)',
                        link: '/read'
                    });
                }

                // 9. Mot du Jour
                const wordIdx = now.getDate() % QURAN_VOCABULARY.length;
                const word = QURAN_VOCABULARY[wordIdx];
                activeCards.push({
                    id: 'vocab-day', type: 'education', emoji: '✍️',
                    title: 'Mot du Jour',
                    textAr: word.ar,
                    textFr: `${word.word} : ${word.meaning} (${word.ref})`,
                    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    link: `/read?surah=${word.surah}&ayah=${word.ayah}`
                });

                // 10. History Mode
                if (smart.historyEnabled) {
                    const event = HIJRI_HISTORY_EVENTS[`${day}-${month}`];
                    if (event) {
                        activeCards.push({
                            id: 'history-event', type: 'history', emoji: '📜',
                            title: event.title,
                            textAr: 'تاريخنا العظيم',
                            textFr: event.text,
                            gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            link: '/hadiths?cat=vendredi'
                        });
                    }
                }

                // 11. Sunnah Lundi/Jeudi
                if (dayOfWeek === 1 || dayOfWeek === 4) {
                    activeCards.push({
                        id: 'fasting-reminder', type: 'calendar', emoji: '🌙',
                        title: 'Sunnah Lundi/Jeudi',
                        textAr: 'كَانَ النَّبِيُّ ﷺ يَتَحَرَّى صَوْمَ الِاثْنَيْنِ وَالْخَمِيسِ',
                        textFr: 'Jours recommandés pour le jeûne surérogatoire selon la Sunnah.',
                        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                        link: '/hadiths?cat=jeune'
                    });
                }

                // 12. Salawat
                if (dayOfWeek === 5) {
                    activeCards.push({
                        id: 'salawat', type: 'spirituality', emoji: '🤲',
                        title: 'Salutations Prophétiques',
                        textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
                        textFr: 'Multipliez les salutations sur le Prophète ﷺ en ce jour béni.',
                        gradient: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
                        link: '/adhkar?cat=hisn_chap_108'
                    });
                }

                // Night Mode
                if (hour >= 22 || hour < 2) {
                    activeCards.push({
                        id: 'night-mode', type: 'spirituality', emoji: '🌙',
                        title: 'Repos Spirituel',
                        textAr: 'سُورَةُ الْمُلْكِ هِيَ الْمَانِعَةُ مِنَ الْعَذَابِ',
                        textFr: 'Lisez Sourate Al-Mulk avant de dormir pour être sous la protection d\'Allah.',
                        gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
                        link: '/read?surah=67'
                    });
                }

                // Fallback Tips
                if (activeCards.length < 2) {
                    const defaults = [
                        { id: 'def-1', emoji: '📖', title: 'Assiduité Coranique', textFr: 'Lis au moins une page du Coran aujourd\'hui pour ton lien spirituel.', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', link: '/read' },
                        { id: 'def-2', emoji: '💪', title: 'Régularité', textFr: 'La régularité est meilleure que la quantité — même un verset par jour.', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', link: '/read' },
                        { id: 'def-3', emoji: '🤲', title: 'Invocations du Jour', textFr: 'N\'oubliez pas vos protections du matin et du soir.', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', link: '/adhkar' }
                    ];
                    const def = defaults[now.getDate() % defaults.length];
                    activeCards.push({ ...def, type: 'tip', textAr: 'خَيْرُ الأَعْمَالِ أَدْوَمُهَا وَإِنْ قَلَّ' });
                }

                if (mounted) {
                    setCards([...activeCards]);
                    setLoading(false);
                }

                // ─── PHASE 2: ASYNC CARDS (WEATHER) ───────────────
                if (smart.weatherEnabled) {
                    const lat = prayer.lat || 48.8566;
                    const lng = prayer.lng || 2.3522;
                    getCurrentWeather(lat, lng).then(weather => {
                        if (!mounted) return;
                        const weatherCards: SmartCardData[] = [];
                        if (weather.event === 'rain' || smart.debugForceWeather) {
                            weatherCards.push({
                                id: 'weather-rain', type: 'weather', emoji: '🌧️',
                                title: smart.debugForceWeather ? 'Pluie (Mode Test)' : 'Il pleut à votre position',
                                textAr: 'اللَّهُمَّ صَيِّداً نَافِعاً',
                                textFr: '« Ô Allah ! Fais que ce soit une pluie utile. »',
                                phonetic: "Allâhumma sayyiban nâfi'an.",
                                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                link: '/adhkar?cat=hisn_chap_64'
                            });
                        } else if (weather.event === 'thunderstorm') {
                            weatherCards.push({
                                id: 'weather-thunder', type: 'weather', emoji: '⚡',
                                title: 'Orage & Tonnerre',
                                textAr: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
                                textFr: '« Gloire à Celui dont le tonnerre Le glorifie par Ses louanges... »',
                                phonetic: "Subhâna l-ladhî yusabbihu r-ra'du...",
                                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                link: '/adhkar?cat=hisn_chap_62'
                            });
                        }

                        if (weatherCards.length > 0) {
                            setCards(prev => {
                                const base = prev.filter(c => c.type !== 'weather');
                                return [...weatherCards, ...base];
                            });
                        }
                    }).catch(e => console.error('Weather task failed', e));
                }

            } catch (err) {
                console.error('Analyze context crash', err);
                if (mounted) setLoading(false);
            }
        }

        analyzeContext();
        const interval = setInterval(analyzeContext, 5 * 60 * 1000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [smart, prayer, stats]);

    return { cards, loading };
}
