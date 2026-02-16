import { useState, useRef } from 'react';
import { Zap } from 'lucide-react';

export function AudioPlayer({ url }: { url: string }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="quiz-audio-player">
            <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} />
            <button className={`quiz-audio-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
                <Zap size={24} fill={isPlaying ? 'currentColor' : 'none'} />
                <span>{isPlaying ? 'Pause' : 'Écouter l\'extrait'}</span>
            </button>
        </div>
    );
}
