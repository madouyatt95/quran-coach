import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export function AudioPlayer({ url }: { url: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Auto-play when URL changes (new question)
    useEffect(() => {
        setIsPlaying(false);
        setLoaded(false);
        const audio = audioRef.current;
        if (!audio) return;

        audio.load();

        const onCanPlay = () => {
            setLoaded(true);
            audio.play().then(() => setIsPlaying(true)).catch(() => {
                // Autoplay blocked by browser, user needs to tap
                setIsPlaying(false);
            });
        };
        const onError = () => setLoaded(true); // Still show button even on error

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
            gap: 10, margin: '12px 0 20px',
        }}>
            <audio
                ref={audioRef}
                src={url}
                preload="auto"
                onEnded={() => setIsPlaying(false)}
            />

            {/* Big play button */}
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
                }}
            >
                {isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
            </button>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, opacity: 0.6, color: 'var(--text-primary, #fff)',
            }}>
                <Volume2 size={14} />
                <span>{isPlaying ? 'En écoute...' : !loaded ? 'Chargement...' : '🎧 Écouter l\'extrait'}</span>
            </div>
        </div>
    );
}
