import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuranStore } from '../../stores/quranStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { fetchSurah, getAudioUrl } from '../../lib/quranApi';
import type { Ayah } from '../../types';
import './FocusMode.css';

interface FocusModeProps {
    surah: number;
    startAyah?: number;
    onClose?: () => void;
}

export function FocusMode({ surah, startAyah = 1, onClose }: FocusModeProps) {
    const { surahs } = useQuranStore();
    const { arabicFontSize, selectedReciter } = useSettingsStore();

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio] = useState(new Audio());

    const currentSurah = surahs.find(s => s.number === surah);

    useEffect(() => {
        setIsLoading(true);
        fetchSurah(surah).then(({ ayahs: surahAyahs }) => {
            setAyahs(surahAyahs);
            const startIndex = surahAyahs.findIndex(a => a.numberInSurah === startAyah);
            setCurrentIndex(startIndex >= 0 ? startIndex : 0);
            setIsLoading(false);
        });
    }, [surah, startAyah]);

    useEffect(() => {
        if (ayahs.length > 0 && currentIndex < ayahs.length) {
            const ayah = ayahs[currentIndex];
            audio.src = getAudioUrl(selectedReciter, ayah.number);
            audio.load();
        }
    }, [ayahs, currentIndex, selectedReciter, audio]);

    useEffect(() => {
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [audio]);

    const currentAyah = ayahs[currentIndex];

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsPlaying(false);
            audio.pause();
        }
    };

    const handleNext = () => {
        if (currentIndex < ayahs.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsPlaying(false);
            audio.pause();
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (isLoading) {
        return (
            <div className="focus-mode">
                <div className="focus-mode__loading">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="focus-mode" data-arabic-size={arabicFontSize}>
            <div className="focus-mode__header">
                {currentSurah && (
                    <span className="focus-mode__surah">{currentSurah.name}</span>
                )}
                <span className="focus-mode__counter">
                    {currentIndex + 1} / {ayahs.length}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="focus-mode__content"
                >
                    {currentAyah && (
                        <>
                            <div className="focus-mode__ayah">
                                {currentAyah.text}
                            </div>
                            <div className="focus-mode__ayah-number">
                                ﴿ {currentAyah.numberInSurah} ﴾
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="focus-mode__controls">
                <button
                    className="focus-mode__btn"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ChevronRight size={28} />
                </button>

                <button
                    className="focus-mode__btn focus-mode__btn--primary"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>

                <button
                    className="focus-mode__btn"
                    onClick={handleNext}
                    disabled={currentIndex === ayahs.length - 1}
                >
                    <ChevronLeft size={28} />
                </button>
            </div>

            {onClose && (
                <button className="focus-mode__close" onClick={onClose}>
                    Retour à la lecture
                </button>
            )}
        </div>
    );
}
