import { useEffect, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, X, ChevronUp, ChevronDown,
    ListMusic, Trash2, Repeat, Repeat1, RotateCcw, RotateCw
} from 'lucide-react';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { useListenStore } from '../../stores/listenStore';
import { useState } from 'react';
import './MiniPlayer.css';

export function MiniPlayer() {
    const {
        isPlaying,
        currentSurahNumber,
        currentSurahName,
        currentSurahNameAr,
        playlist,
        currentPlaylistIndex,
        repeatMode,
        togglePlay,
        nextAyah,
        prevAyah,
        stop,
        getAudioRef,
        updateTime,
        currentTime,
        duration,
        seek,
        toggleRepeatMode,
        jumpToPlaylistIndex,
        removeFromQueue,
        playbackType
    } = useAudioPlayerStore();

    const { updateLastPosition } = useListenStore();

    const [expanded, setExpanded] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const setupDoneRef = useRef(false);


    // Setup audio event listeners
    useEffect(() => {
        if (setupDoneRef.current) return;
        setupDoneRef.current = true;

        const audio = getAudioRef();

        audio.addEventListener('ended', () => {
            useAudioPlayerStore.getState().nextAyah();
        });

        audio.addEventListener('timeupdate', () => {
            const current = audio.currentTime;
            useAudioPlayerStore.getState().updateTime(current, audio.duration || 0);
        });
    }, [getAudioRef, updateTime]);

    // Persistent position sync for Listen Page (MP3 Quran)
    // Only triggers if playbackType is 'surah' (consistently with user request to not touch Mushaf/Read page)
    useEffect(() => {
        if (playbackType !== 'surah' || currentTime === 0) return;

        // Update store position (throttled/debounced via the natural gap of timeupdate or manual interval)
        // We sync if position is > 0 to avoid resetting progress on accidental load
        const timeout = setTimeout(() => {
            updateLastPosition(currentTime);
        }, 1000); // Small buffer to avoid too frequent disk writes, though localStorage is fast

        return () => clearTimeout(timeout);
    }, [currentTime, playbackType, updateLastPosition]);

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

    // ── Minimized pill view ──
    if (minimized) {
        return (
            <div className="mini-player-pill" onClick={() => setMinimized(false)}>
                <div className="mini-player-pill__progress" style={{ width: `${progress}%` }} />
                <button
                    className="mini-player-pill__play"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <span className="mini-player-pill__name">{currentSurahNameAr || currentSurahName}</span>
                <ChevronUp size={14} className="mini-player-pill__expand" />
            </div>
        );
    }

    // ── Full player view ──
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

                    <button onClick={() => { setMinimized(true); setExpanded(false); }} className="mini-player__btn mini-player__btn--minimize" title="Réduire">
                        <ChevronDown size={16} />
                    </button>
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

                    <div className="mini-player__tabs-header">
                        <ListMusic size={14} /> File d'attente ({playlist.length})
                    </div>

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
                                    <span className="mini-player__queue-detail">{s.surahName}</span>
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
                </div>
            )}
        </div>
    );
}
