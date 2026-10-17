import { useEffect, useRef, useState } from 'react';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { FileAudio, Play, Square, Upload, X } from 'lucide-react';
import { MAX_VOICE_FILE_SECONDS, voiceFileError } from '../../lib/voiceFile';
export interface VoiceFileExcerpt { file: File; start: number; end: number }
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
export function VoiceFilePicker({ busy, onAnalyze, onCancel }: { busy: boolean; onAnalyze: (value: VoiceFileExcerpt) => void; onCancel: () => void }) {
    const [selected, setSelected] = useState<{ file: File; url: string } | null>(null);
    const [duration, setDuration] = useState(0), [start, setStart] = useState(0), [end, setEnd] = useState(0);
    const [error, setError] = useState(''), [previewing, setPreviewing] = useState(false);
    const media = useRef<HTMLVideoElement>(null), input = useRef<HTMLInputElement>(null);
    useEffect(() => { const url = selected?.url; return () => { if (url) URL.revokeObjectURL(url); }; }, [selected]);
    useEffect(() => {
        const stop = () => { media.current?.pause(); setPreviewing(false); };
        window.addEventListener('quran-stop-playback', stop);
        return () => { window.removeEventListener('quran-stop-playback', stop); };
    }, []);
    function choose(file?: File) {
        if (!file) return;
        media.current?.pause(); setPreviewing(false);
        const invalid = voiceFileError(file); setError(invalid || '');
        if (invalid) { setSelected(null); return; }
        setDuration(0); setStart(0); setEnd(0); setSelected({ file, url: URL.createObjectURL(file) });
    }
    async function preview() {
        const player = media.current; if (!player) return;
        if (previewing) { player.pause(); return; }
        window.dispatchEvent(new Event('quran-stop-playback'));
        const globalPlayer = useAudioPlayerStore.getState();
        if (globalPlayer.isPlaying) globalPlayer.togglePlay();
        player.currentTime = start;
        try { await player.play(); setPreviewing(true); } catch { setError('Lecture de cet extrait impossible. Essayez un autre fichier.'); }
    }
    return <section className="voice-file" aria-label="Identifier un fichier">
        <input ref={input} type="file" accept="audio/*,video/*,.mp3,.m4a,.mp4,.wav,.mov,.webm" aria-label="Choisir un fichier audio ou vidéo" disabled={busy} onChange={e => { choose(e.target.files?.[0]); e.target.value = ''; }}/>
        {!selected ? <button className="voice-file-pick" disabled={busy} onClick={() => input.current?.click()}><Upload size={25}/><strong>Choisir un audio ou une vidéo</strong><span>Sur cet appareil · 40 Mo et 5 minutes maximum</span></button> : <>
            <div className="voice-file-name"><FileAudio size={18}/><strong>{selected.file.name}</strong><button disabled={busy} aria-label="Retirer le fichier" onClick={() => { media.current?.pause(); setSelected(null); setError(''); }}><X size={18}/></button></div>
            <video key={selected.url} ref={media} src={selected.url} playsInline preload="metadata" className={selected.file.type.startsWith('video') ? 'voice-file-video' : 'voice-file-audio'}
                onLoadedMetadata={e => { const seconds = e.currentTarget.duration; if (!Number.isFinite(seconds) || seconds < 1 || seconds > MAX_VOICE_FILE_SECONDS) { setError('Choisissez un fichier de 1 seconde à 5 minutes.'); setDuration(0); return; } setDuration(seconds); setEnd(Math.min(seconds, 15)); }}
                onTimeUpdate={e => { if (e.currentTarget.currentTime >= end) e.currentTarget.pause(); }} onPause={() => setPreviewing(false)} onEnded={() => setPreviewing(false)}
                onError={() => { setError('Ce format ne peut pas être lu ici. Essayez un fichier MP3, M4A ou MP4 avec une piste audio.'); setDuration(0); }}/>
            {duration > 0 && <><p>Choisissez jusqu’à 30 secondes de récitation.</p>
                <label>Début <strong>{time(start)}</strong><input type="range" aria-label="Début de l’extrait" disabled={busy} min={0} max={Math.max(0, duration - 1)} step={.5} value={start} onChange={e => { media.current?.pause(); const next = Number(e.target.value); setStart(next); setEnd(Math.min(duration, next + Math.max(1, end - start))); }}/></label>
                <label>Fin <strong>{time(end)}</strong><input type="range" aria-label="Fin de l’extrait" disabled={busy} min={Math.min(duration, start + 1)} max={Math.min(duration, start + 30)} step={.5} value={end} onChange={e => { media.current?.pause(); setEnd(Number(e.target.value)); }}/></label>
                <div className="voice-file-actions"><button disabled={busy} onClick={() => void preview()}>{previewing ? <Square size={16}/> : <Play size={16}/>} {previewing ? 'Arrêter l’aperçu' : 'Écouter l’extrait'}</button><button disabled={busy} onClick={() => { media.current?.pause(); setError(''); onAnalyze({ file: selected.file, start, end }); }}>Identifier cet extrait</button></div>
            </>}
        </>}
        {error && <p role="alert">{error}</p>}
        {busy && <button className="voice-file-cancel" onClick={onCancel}>Annuler l’analyse</button>}
        <small>Le fichier reste sur votre appareil.</small>
    </section>;
}
