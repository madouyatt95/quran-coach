import { useEffect, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, X, ChevronUp, ChevronDown,
    ListMusic, Trash2, Repeat, Repeat1, RotateCcw, RotateCw
} from 'lucide-react';
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
        playlist,
        currentPlaylistIndex,
        playbackType,
        repeatMode,
        togglePlay,
        nextAyah,
        prevAyah,
        stop,
        setAyahs,
        getAudioRef,
        updateTime,
        currentTime,
        duration,
        seek,
        toggleRepeatMode,
        jumpToPlaylistIndex,
        removeFromQueue,
        clearQueue,
    } = useAudioPlayerStore();

    const [expanded, setExpanded] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const setupDoneRef = useRef(false);

    // Fetch ayahs when surah changes (ONLY in ayah mode)
    useEffect(() => {
        if (currentSurahNumber > 0 && ayahs.length === 0 && playbackType === 'ayah') {
            fetchSurah(currentSurahNumber).then(data => {
                setAyahs(data.ayahs.map(a => ({
                    number: a.number,
                    numberInSurah: a.numberInSurah,
                    text: a.text,
                })));
            }).catch(console.error);
        }
    }, [currentSurahNumber, ayahs.length, setAyahs, playbackType]);

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
    const upcomingSurahs = playlist.filter((_, i) => i > currentPlaylistIndex);

    const formatTime = (t: number) => {
        if (!t || isNaN(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedProgress = x / rect.width;
        seek(clickedProgress * duration);
    };

    return (
        <div className={`mini-player ${expanded ? 'expanded' : ''}`}>
            {/* Progress bar */}
            <div className="mini-player__progress" onClick={handleProgressClick}>
                <div className="mini-player__progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Compact view */}
            <div className="mini-player__main">
                <div className="mini-player__info" onClick={() => setExpanded(!expanded)}>
                    <div className="mini-player__surah">{currentSurahNameAr || currentSurahName}</div>
                    <div className="mini-player__detail">
                        {currentSurahName}
                        {playbackType === 'ayah' && ` · Verset ${currentAyahInSurah}/${totalAyahsInSurah}`}
                        {upcomingSurahs.length > 0 && <span className="mini-player__queue-badge">📋 {upcomingSurahs.length} à suivre</span>}
                    </div>
                </div>

                <div className="mini-player__controls">
                    {expanded && (
                        <>
                            <button onClick={() => seek(currentTime - 15)} className="mini-player__btn">
                                <RotateCcw size={18} />
                            </button>
                            <button onClick={toggleRepeatMode} className={`mini-player__btn ${repeatMode !== 'none' ? 'active' : ''}`}>
                                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                            </button>
                        </>
                    )}

                    <button onClick={prevAyah} className="mini-player__btn">
                        <SkipBack size={18} />
                    </button>
                    <button onClick={togglePlay} className="mini-player__btn mini-player__btn--play">
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={nextAyah} className="mini-player__btn">
                        <SkipForward size={18} />
                    </button>

                    {expanded && (
                        <button onClick={() => seek(currentTime + 15)} className="mini-player__btn">
                            <RotateCw size={18} />
                        </button>
                    )}

                    <button onClick={() => setExpanded(!expanded)} className="mini-player__btn mini-player__btn--expand">
                        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button onClick={stop} className="mini-player__btn mini-player__btn--close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded view */}
            {expanded && (
                <div className="mini-player__expanded-content">
                    <div className="mini-player__time-row">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    {/* Tab toggle: Versets vs File d'attente */}
                    <div className="mini-player__tabs">
                        <button className={`mini-player__tab ${!showQueue ? 'active' : ''}`} onClick={() => setShowQueue(false)}>
                            Versets
                        </button>
                        <button className={`mini-player__tab ${showQueue ? 'active' : ''}`} onClick={() => setShowQueue(true)}>
                            <ListMusic size={14} /> File ({playlist.length})
                        </button>
                        {showQueue && upcomingSurahs.length > 0 && (
                            <button className="mini-player__tab mini-player__tab--clear" onClick={clearQueue}>
                                <Trash2 size={14} /> Tout vider
                            </button>
                        )}
                    </div>

                    {!showQueue ? (
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
                            {ayahs.length === 0 && <div className="mini-player__empty">Chargement des versets...</div>}
                        </div>
                    ) : (
                        <div className="mini-player__scroll">
                            {playlist.map((s, idx) => (
                                <div
                                    key={`${s.surahNumber}-${idx}`}
                                    className={`mini-player__queue-item ${idx === currentPlaylistIndex ? 'active' : ''}`}
                                    onClick={() => jumpToPlaylistIndex(idx)}
                                >
                                    <div className="mini-player__queue-info">
                                        <div className="mini-player__queue-names">
                                            <span className="mini-player__queue-trans">{s.transliteration || s.surahName}</span>
                                            <span className="mini-player__queue-ar">{s.surahNameAr}</span>
                                        </div>
                                        <span className="mini-player__queue-detail">{s.surahName} · {s.totalAyahs} versets</span>
                                    </div>
                                    <button
                                        className="mini-player__queue-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromQueue(idx);
                                        }}
                                        disabled={idx <= currentPlaylistIndex}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
