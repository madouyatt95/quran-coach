import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, BookOpen, Shield, ChevronRight, Plane, Heart, Play, Pause, Square, Repeat, Minus, Plus } from 'lucide-react';
import './AdhkarPage.css';
import { ADHKAR_DATA, type AdhkarCategory } from '../data/adhkarData';

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

    const incrementCount = useCallback((dhikrId: number, maxCount: number) => {
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

                // Auto-increment the manual counter when loop is finished
                const dhikr = selectedCategory?.adhkar[currentDhikrIndex];
                if (dhikr) {
                    incrementCount(dhikr.id, dhikr.count);
                }

                loopCounterRef.current = 0;
                setCurrentLoop(0);
            }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [selectedCategory, currentDhikrIndex, incrementCount]);

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
