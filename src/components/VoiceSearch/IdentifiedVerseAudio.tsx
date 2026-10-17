import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { Passage } from '../../lib/learning';
import chapters from '../../lib/interactiveMushaf/chapters.json';
import { getAudioUrl } from '../../lib/quranApi';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
export function IdentifiedVerseAudio({ passage, onBeforePlay }: { passage: Passage; onBeforePlay: () => void }) {
    const audio = useRef<HTMLAudioElement | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    useEffect(() => {
        const stop = () => { const player = audio.current; audio.current = null; if (player) { player.onended = null; player.onplaying = null; player.onerror = null; player.pause(); } setStatus('idle'); };
        window.addEventListener('quran-stop-playback', stop);
        return () => { stop(); window.removeEventListener('quran-stop-playback', stop); };
    }, [passage.surah, passage.ayah]);
    async function toggle() {
        if (status === 'playing' || status === 'loading') { const player = audio.current; audio.current = null; player?.pause(); setStatus('idle'); return; }
        onBeforePlay(); window.dispatchEvent(new Event('quran-stop-playback'));
        const global = useAudioPlayerStore.getState(); if (global.isPlaying) global.togglePlay();
        const chapter = chapters[passage.surah - 1]; if (!chapter) return;
        const player = new Audio(getAudioUrl('ar.alafasy', chapter.offset + passage.ayah)); audio.current = player; setStatus('loading');
        const valid = () => audio.current === player;
        player.onplaying = () => { if (valid()) setStatus('playing'); };
        player.onended = () => { if (valid()) setStatus('idle'); };
        player.onerror = () => { if (valid()) setStatus('error'); };
        try { await player.play(); } catch { if (valid()) setStatus('error'); }
    }
    return <div className="voice-verse-audio"><button onClick={() => void toggle()} aria-label={status === 'playing' || status === 'loading' ? 'Arrêter le verset' : 'Écouter ce verset'}>{status === 'playing' ? <Pause size={18}/> : <Play size={18}/>} {status === 'loading' ? 'Chargement…' : status === 'playing' ? 'Arrêter le verset' : status === 'error' ? 'Réessayer l’écoute' : 'Écouter ce verset'}</button><small>Mishary Alafasy</small>{status === 'error' && <p role="alert">L’audio n’a pas pu être chargé.</p>}</div>;
}
