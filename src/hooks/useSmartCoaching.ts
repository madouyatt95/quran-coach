import { useState, useEffect } from 'react';
import { useSmartStore } from '../stores/smartStore';
import { usePrayerStore } from '../stores/prayerStore';
import { getHijriDate } from '../lib/dateUtils';
import { getCurrentWeather } from '../lib/weatherService';

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

export function useSmartCoaching() {
    const smart = useSmartStore();
    const prayer = usePrayerStore();
    const [cards, setCards] = useState<SmartCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function analyzeContext() {
            if (!smart.globalEnabled) {
                setCards([]);
                setLoading(false);
                return;
            }

            const activeCards: SmartCardData[] = [];
            const now = new Date();
            const { day, month } = getHijriDate(now);
            const dayOfWeek = now.getDay();

            // 1. Weather (Météo)
            if (smart.weatherEnabled) {
                try {
                    const lat = prayer.lat || 48.8566;
                    const lng = prayer.lng || 2.3522;
                    const weather = await getCurrentWeather(lat, lng);
                    if (weather.event === 'rain') {
                        activeCards.push({
                            id: 'weather-rain',
                            type: 'weather',
                            emoji: '🌧️',
                            title: 'Il pleut à votre position',
                            textAr: 'اللَّهُمَّ صَيِّداً نَافِعاً',
                            textFr: 'Ô Allah ! Fais que ce soit une pluie utile.',
                            phonetic: "Allâhumma sayyiban nâfi'an.",
                            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            link: '/adhkar'
                        });
                    } else if (weather.event === 'thunderstorm') {
                        activeCards.push({
                            id: 'weather-thunder',
                            type: 'weather',
                            emoji: '⚡',
                            title: 'Orage & Tonnerre',
                            textAr: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
                            textFr: 'Gloire à Celui dont le tonnerre Le glorifie par Ses louanges...',
                            phonetic: "Subhâna l-ladhî yusabbihu r-ra'du...",
                            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            link: '/adhkar'
                        });
                    }
                } catch (e) {
                    console.error('Weather context failed', e);
                }
            }

            // 2. White Days (Jours Blancs)
            if (smart.whiteDaysEnabled && (day === 13 || day === 14 || day === 15)) {
                activeCards.push({
                    id: 'white-days',
                    type: 'calendar',
                    emoji: '🌕',
                    title: `Jour Blanc (${day} ${month})`,
                    textAr: 'السنة صيام الأيام البيض',
                    textFr: 'C\'est l\'un des 3 jours blancs. Le jeûne y est fortement recommandé.',
                    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
                    link: '/hadiths'
                });
            }

            // 3. Jumu'ah & Kinship (Vendredi / Parenté)
            if (smart.kinshipEnabled && dayOfWeek === 5) {
                const hour = now.getHours();
                if (hour >= 14 && hour < 18) { // After Jumu'ah
                    activeCards.push({
                        id: 'kinship',
                        type: 'social',
                        emoji: '📞',
                        title: 'Sentinelle du Vendredi',
                        textAr: 'وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ',
                        textFr: 'Et craignez Allah au nom de qui vous vous implorez les uns les autres, et craignez de rompre les liens du sang.',
                        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        link: '/hadiths'
                    });
                }
            }

            // 4. Al-Kahf (Vendredi)
            if (smart.alKahfEnabled && dayOfWeek === 5) {
                activeCards.push({
                    id: 'al-kahf',
                    type: 'reading',
                    emoji: '🏔️',
                    title: 'Lumière du Vendredi',
                    textAr: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ',
                    textFr: 'Objectif : Lire Sourate Al-Kahf avant le Maghrib.',
                    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    progress: 0,
                    link: '/read?surah=18'
                });
            }

            // 5. Fajr Booster
            if (smart.fajrBoosterEnabled) {
                // Mocking prayer times check - in real app we'd get them from prayerStore
                // For simplicity, assume 5:00 to 7:00
                const hour = now.getHours();
                if (hour >= 5 && hour <= 7) {
                    activeCards.push({
                        id: 'fajr-booster',
                        type: 'motivation',
                        emoji: '🌅',
                        title: 'Booster du Fajr',
                        textAr: 'اللهم بارك لأمتي في بكورها',
                        textFr: '« Ô Allah, bénis ma communauté dans sa prime matinée. »',
                        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                    });
                }
            }

            // 6. History Mode
            if (smart.historyEnabled) {
                const event = HIJRI_HISTORY_EVENTS[`${day}-${month}`];
                if (event) {
                    activeCards.push({
                        id: 'history-event',
                        type: 'history',
                        emoji: '📜',
                        title: event.title,
                        textAr: 'تاريخنا العظيم',
                        textFr: event.text,
                        gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
                    });
                }
            }

            // 7. Sahar (Last third)
            if (smart.saharEnabled) {
                const hour = now.getHours();
                if (hour === 4) { // Mock 4am
                    activeCards.push({
                        id: 'sahar-moment',
                        type: 'spirituality',
                        emoji: '🌌',
                        title: 'Moment Sacré (Sahar)',
                        textAr: 'وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ',
                        textFr: '« ...et aux dernières heures de la nuit, ils demandaient pardon. »',
                        gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
                    });
                }
            }

            // 8. Daily Tips (Integrated from old Today area)
            if (dayOfWeek === 1 || dayOfWeek === 4) {
                activeCards.push({
                    id: 'fasting-reminder',
                    type: 'calendar',
                    emoji: '🌙',
                    title: 'Lundi/Jeudi — Sunnah',
                    textAr: 'كَانَ النَّبِيُّ ﷺ يَتَحَرَّى صَوْمَ الِاثْنَيْنِ وَالْخَمِيسِ',
                    textFr: 'Jours recommandés pour le jeûne surérogatoire selon la Sunnah.',
                    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                });
            }

            if (dayOfWeek === 5) {
                activeCards.push({
                    id: 'salawat',
                    type: 'spirituality',
                    emoji: '🤲',
                    title: 'Salutations Prophétiques',
                    textAr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
                    textFr: 'Multipliez les salutations sur le Prophète ﷺ en ce jour béni du Vendredi.',
                    gradient: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)'
                });
            }

            // Default fallback tips if few cards active
            if (activeCards.length < 2) {
                const defaults = [
                    { id: 'def-1', emoji: '📖', title: 'Assiduité Coranique', textFr: 'Lis au moins une page du Coran aujourd\'hui pour maintenir ton lien spirituel.', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
                    { id: 'def-2', emoji: '💪', title: 'Régularité', textFr: 'La régularité est meilleure que la quantité — même un verset par jour.', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
                    { id: 'def-3', emoji: '🤲', title: 'Adhkar du Jour', textFr: 'N\'oublie pas tes adhkar du matin et du soir pour ta protection.', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
                ];
                const def = defaults[now.getDate() % defaults.length];
                activeCards.push({
                    ...def,
                    type: 'tip',
                    textAr: 'خَيْرُ الأَعْمَالِ أَدْوَمُهَا وَإِنْ قَلَّ',
                    link: '/read'
                });
            }

            // 9. Night Mode (Sunnah of sleep)
            const hour = now.getHours();
            if (hour >= 22 || hour < 4) {
                activeCards.push({
                    id: 'night-mode',
                    type: 'spirituality',
                    emoji: '🌙',
                    title: 'Repos Spirituel',
                    textAr: 'سُورَةُ الْمُلْكِ هِيَ الْمَانِعَةُ مِنَ الْعَذَابِ',
                    textFr: 'C\'est le moment de lire Sourate Al-Mulk et de faire vos invocations du soir.',
                    gradient: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
                    link: '/read?surah=67'
                });
            }

            if (mounted) {
                setCards(activeCards);
                setLoading(false);
            }
        }

        analyzeContext();
        // Refresh every 5 minutes
        const interval = setInterval(analyzeContext, 5 * 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [smart, prayer.lat, prayer.lng]);

    return { cards, loading };
}
