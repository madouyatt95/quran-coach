import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export function AudioPlayer({ url }: { url: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Preload audio when URL changes (no auto-play — mobile blocks it)
    useEffect(() => {
        setIsPlaying(false);
        setLoaded(false);
        const audio = audioRef.current;
        if (!audio) return;
        audio.load();

        const onCanPlay = () => setLoaded(true);
        const onError = () => setLoaded(true);

        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });

        return () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            audio.pause();
        };
    }, [url]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch(() => { });
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, margin: '8px 0 16px',
        }}>
            <audio
                ref={audioRef}
                src={url}
                preload="auto"
                onEnded={() => setIsPlaying(false)}
            />

            {/* Big pulsing play button */}
            <button
                onClick={togglePlay}
                style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.2)',
                    background: isPlaying
                        ? 'linear-gradient(135deg, #f44336, #e91e63)'
                        : 'linear-gradient(135deg, #2196F3, #00BCD4)',
                    color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    animation: !isPlaying && loaded ? 'quiz-audio-pulse 1.5s ease-in-out infinite' : 'none',
                }}
            >
                {isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
            </button>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--text-primary, #fff)',
                fontWeight: 600,
                opacity: isPlaying ? 1 : 0.8,
            }}>
                <Volume2 size={14} />
                <span>{isPlaying ? '🔊 En écoute...' : !loaded ? '⏳ Chargement...' : '👆 Appuie pour écouter'}</span>
            </div>

            {/* Pulse animation */}
            <style>{`
                @keyframes quiz-audio-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(33,150,243,0.3); }
                    50% { transform: scale(1.08); box-shadow: 0 4px 30px rgba(33,150,243,0.6); }
                }
            `}</style>
        </div>
    );
}
