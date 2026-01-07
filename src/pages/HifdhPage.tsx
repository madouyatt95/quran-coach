import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Minus,
    Plus,
    RotateCcw,
    Volume2
} from 'lucide-react';
import { useQuranStore } from '../stores/quranStore';
import { useSettingsStore, RECITERS, PLAYBACK_SPEEDS } from '../stores/settingsStore';
import { useProgressStore } from '../stores/progressStore';
import { useStatsStore } from '../stores/statsStore';
import { fetchSurah, getAudioUrl } from '../lib/quranApi';
import type { Ayah } from '../types';
import './HifdhPage.css';

export function HifdhPage() {
    const { surahs } = useQuranStore();
    const { selectedReciter, repeatCount, playbackSpeed, setReciter, setPlaybackSpeed } = useSettingsStore();
    const { getSessionsForReview } = useProgressStore();
    const { recordPageRead } = useStatsStore();

    // Selection state
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [startAyah, setStartAyah] = useState(1);
    const [endAyah, setEndAyah] = useState(7);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);

    // Player state
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(true);
    const [currentRepeat, setCurrentRepeat] = useState(1);
    const [maxRepeats, setMaxRepeats] = useState(repeatCount);
    const [showReciters, setShowReciters] = useState(false);

    // Load surah ayahs
    useEffect(() => {
        fetchSurah(selectedSurah).then(({ ayahs: allAyahs }) => {
            const filtered = allAyahs.filter(
                a => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah
            );
            setAyahs(filtered);
            setCurrentAyahIndex(0);
        });
    }, [selectedSurah, startAyah, endAyah]);

    // Load audio for current ayah
    useEffect(() => {
        if (ayahs.length > 0 && audioRef.current) {
            const ayah = ayahs[currentAyahIndex];
            const audioUrl = getAudioUrl(selectedReciter, ayah.number);
            audioRef.current.src = audioUrl;
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.load();
        }
    }, [ayahs, currentAyahIndex, selectedReciter, playbackSpeed]);

    // Update playback speed when changed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = useCallback(() => {
        if (currentAyahIndex < ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
            setCurrentRepeat(1);
        } else if (isLooping) {
            setCurrentAyahIndex(0);
            setCurrentRepeat(1);
            recordPageRead(); // Count as a page read when completing a loop
        }
    }, [currentAyahIndex, ayahs.length, isLooping, recordPageRead]);

    const handlePrev = () => {
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
            setCurrentRepeat(1);
        }
    };

    const handleAudioEnded = useCallback(() => {
        if (currentRepeat < maxRepeats) {
            setCurrentRepeat(prev => prev + 1);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else {
            handleNext();
            if (audioRef.current && isPlaying) {
                setTimeout(() => audioRef.current?.play(), 100);
            }
        }
    }, [currentRepeat, maxRepeats, handleNext, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleAudioEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleAudioEnded);
        };
    }, [handleAudioEnded]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const surah = surahs.find(s => s.number === selectedSurah);
    const currentAyah = ayahs[currentAyahIndex];
    const sessionsForReview = getSessionsForReview();
    const currentReciterInfo = RECITERS.find(r => r.id === selectedReciter);

    return (
        <div className="hifdh-page">
            <h1 className="hifdh-page__header">Studio Hifdh</h1>

            {/* Selection */}
            <div className="hifdh-selection">
                <h2 className="hifdh-selection__title">Sélection du passage</h2>

                <div className="hifdh-selection__row">
                    <select
                        className="hifdh-selection__select"
                        value={selectedSurah}
                        onChange={(e) => {
                            const num = parseInt(e.target.value);
                            setSelectedSurah(num);
                            setStartAyah(1);
                            const s = surahs.find(s => s.number === num);
                            setEndAyah(Math.min(7, s?.numberOfAyahs || 7));
                        }}
                    >
                        {surahs.map((s) => (
                            <option key={s.number} value={s.number}>
                                {s.number}. {s.name} - {s.englishName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="hifdh-selection__row">
                    <input
                        type="number"
                        className="hifdh-selection__input"
                        value={startAyah}
                        min={1}
                        max={surah?.numberOfAyahs || 1}
                        onChange={(e) => setStartAyah(parseInt(e.target.value) || 1)}
                    />
                    <span style={{ color: 'var(--color-text-muted)' }}>à</span>
                    <input
                        type="number"
                        className="hifdh-selection__input"
                        value={endAyah}
                        min={startAyah}
                        max={surah?.numberOfAyahs || 1}
                        onChange={(e) => setEndAyah(parseInt(e.target.value) || 1)}
                    />
                </div>
            </div>

            {/* Audio Player */}
            <div className="hifdh-player">
                <audio ref={audioRef} />

                {currentAyah && (
                    <div className="hifdh-player__ayah">
                        {currentAyah.text}
                    </div>
                )}

                <div className="hifdh-player__progress">
                    <span className="hifdh-player__time">{formatTime(currentTime)}</span>
                    <div className="hifdh-player__progress-bar">
                        <div
                            className="hifdh-player__progress-fill"
                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                        />
                    </div>
                    <span className="hifdh-player__time">{formatTime(duration)}</span>
                </div>

                <div className="hifdh-player__controls">
                    <button className="hifdh-player__btn" onClick={handlePrev}>
                        <SkipBack size={20} />
                    </button>

                    <button
                        className="hifdh-player__btn hifdh-player__btn--primary"
                        onClick={handlePlayPause}
                    >
                        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>

                    <button className="hifdh-player__btn" onClick={handleNext}>
                        <SkipForward size={20} />
                    </button>

                    <button
                        className={`hifdh-player__btn ${isLooping ? 'hifdh-player__btn--active' : ''}`}
                        onClick={() => setIsLooping(!isLooping)}
                    >
                        <Repeat size={20} />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="hifdh-speed">
                    <Volume2 size={16} />
                    <span className="hifdh-speed__label">Vitesse:</span>
                    <div className="hifdh-speed__buttons">
                        {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                                key={speed}
                                className={`hifdh-speed__btn ${playbackSpeed === speed ? 'active' : ''}`}
                                onClick={() => setPlaybackSpeed(speed)}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reciter Selector */}
                <div className="hifdh-reciter">
                    <button
                        className="hifdh-reciter__current"
                        onClick={() => setShowReciters(!showReciters)}
                    >
                        <span className="hifdh-reciter__flag">{currentReciterInfo?.country}</span>
                        <span className="hifdh-reciter__name">{currentReciterInfo?.name}</span>
                        <span className="hifdh-reciter__arabic">{currentReciterInfo?.nameArabic}</span>
                    </button>

                    {showReciters && (
                        <div className="hifdh-reciter__list">
                            {RECITERS.map((reciter) => (
                                <button
                                    key={reciter.id}
                                    className={`hifdh-reciter__item ${selectedReciter === reciter.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setReciter(reciter.id);
                                        setShowReciters(false);
                                    }}
                                >
                                    <span className="hifdh-reciter__flag">{reciter.country}</span>
                                    <div className="hifdh-reciter__info">
                                        <span className="hifdh-reciter__name">{reciter.name}</span>
                                        <span className="hifdh-reciter__arabic">{reciter.nameArabic}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Repeat Counter */}
                <div className="hifdh-repeat">
                    <span className="hifdh-repeat__label">Répétitions</span>
                    <div className="hifdh-repeat__counter">
                        <button
                            className="hifdh-repeat__btn"
                            onClick={() => setMaxRepeats(prev => Math.max(1, prev - 1))}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="hifdh-repeat__count">{currentRepeat}/{maxRepeats}</span>
                        <button
                            className="hifdh-repeat__btn"
                            onClick={() => setMaxRepeats(prev => Math.min(20, prev + 1))}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <button
                        className="hifdh-repeat__btn"
                        onClick={() => setCurrentRepeat(1)}
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                <div className="hifdh-loop">
                    Verset {currentAyahIndex + 1} / {ayahs.length}
                </div>
            </div>

            {/* Review Sessions */}
            {sessionsForReview.length > 0 && (
                <div className="hifdh-sessions">
                    <h2 className="hifdh-sessions__title">À réviser ({sessionsForReview.length})</h2>
                    {sessionsForReview.map((session) => {
                        const s = surahs.find(s => s.number === session.surah);
                        return (
                            <div key={session.id} className="hifdh-session-item">
                                <div className="hifdh-session-item__info">
                                    <div className="hifdh-session-item__title">
                                        {s?.name} ({session.startAyah}-{session.endAyah})
                                    </div>
                                    <div className="hifdh-session-item__meta">
                                        {session.repetitions} répétitions
                                    </div>
                                </div>
                                <span className="hifdh-session-item__badge hifdh-session-item__badge--review">
                                    À réviser
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
