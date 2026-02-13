import { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { fetchSurah } from '../../lib/quranApi';
import { useState } from 'react';
import './MiniPlayer.css';

export function MiniPlayer() {
    const {
        isPlaying,
        currentSurahNumber,
        currentSurahName,
        currentSurahNameAr,
        currentAyahInSurah,
        totalAyahsInSurah,
        ayahs,
        togglePlay,
        nextAyah,
        prevAyah,
        stop,
        setAyahs,
        getAudioRef,
        updateTime,
        currentTime,
        duration,
    } = useAudioPlayerStore();

    const [expanded, setExpanded] = useState(false);
    const setupDoneRef = useRef(false);

    // Fetch ayahs when surah changes
    useEffect(() => {
        if (currentSurahNumber > 0 && ayahs.length === 0) {
            fetchSurah(currentSurahNumber).then(data => {
                setAyahs(data.ayahs.map(a => ({
                    number: a.number,
                    numberInSurah: a.numberInSurah,
                    text: a.text,
                })));
            }).catch(console.error);
        }
    }, [currentSurahNumber, ayahs.length, setAyahs]);

    // Setup audio event listeners
    useEffect(() => {
        if (setupDoneRef.current) return;
        setupDoneRef.current = true;

        const audio = getAudioRef();

        audio.addEventListener('ended', () => {
            useAudioPlayerStore.getState().nextAyah();
        });

        audio.addEventListener('timeupdate', () => {
            useAudioPlayerStore.getState().updateTime(audio.currentTime, audio.duration || 0);
        });
    }, [getAudioRef, updateTime]);

    // Don't render if no surah is active
    if (currentSurahNumber === 0) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (t: number) => {
        if (!t || isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`mini-player ${expanded ? 'expanded' : ''}`}>
            {/* Progress bar */}
            <div className="mini-player__progress">
                <div className="mini-player__progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Compact view */}
            <div className="mini-player__main">
                <div className="mini-player__info" onClick={() => setExpanded(!expanded)}>
                    <div className="mini-player__surah">{currentSurahNameAr}</div>
                    <div className="mini-player__detail">
                        {currentSurahName} · Verset {currentAyahInSurah}/{totalAyahsInSurah}
                    </div>
                </div>

                <div className="mini-player__controls">
                    <button onClick={prevAyah} className="mini-player__btn">
                        <SkipBack size={18} />
                    </button>
                    <button onClick={togglePlay} className="mini-player__btn mini-player__btn--play">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={nextAyah} className="mini-player__btn">
                        <SkipForward size={18} />
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className="mini-player__btn mini-player__btn--expand">
                        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button onClick={stop} className="mini-player__btn mini-player__btn--close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded view - ayah list */}
            {expanded && (
                <div className="mini-player__ayah-list">
                    <div className="mini-player__time-row">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="mini-player__scroll">
                        {ayahs.map(ayah => (
                            <div
                                key={ayah.number}
                                className={`mini-player__ayah ${ayah.numberInSurah === currentAyahInSurah ? 'active' : ''}`}
                                onClick={() => useAudioPlayerStore.getState().playAyah(ayah.number, ayah.numberInSurah)}
                            >
                                <span className="mini-player__ayah-num">{ayah.numberInSurah}</span>
                                <span className="mini-player__ayah-text" dir="rtl">{ayah.text.length > 80 ? ayah.text.slice(0, 80) + '…' : ayah.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
