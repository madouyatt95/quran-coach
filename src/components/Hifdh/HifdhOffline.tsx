import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TilawaPackCard } from '../Learning/TilawaPackCard';
import { useDownloadStore } from '../../stores/downloadStore';
import { fetchSurah, getAudioUrl } from '../../lib/quranApi';
import type { JourneyExercise } from '../../lib/hifdhJourney';
import { tilawaPackStatus } from '../../lib/tilawa/assets';
const base = 'https://api.alquran.cloud/v1';
export function HifdhOffline({ exercises }: {
    exercises: JourneyExercise[];
}) {
    const tasks = useDownloadStore(s => s.tasks);
    const [busy, setBusy] = useState(false), [error, setError] = useState(''), [status, setStatus] = useState(''), [bytes, setBytes] = useState<number | null>(null);
    const generation = useRef(0);
    const refs = [...new Set(exercises.map(e => `${e.surah}:${e.ayah}`))].sort().join(',');
    useEffect(() => { const request = generation; setStatus(''); setBusy(false); return () => { ++request.current; }; }, [refs]);
    useEffect(() => { void navigator.storage?.estimate?.().then(e => setBytes(e.usage ?? null)).catch(() => { }); }, [busy]);
    async function prepare() {
        const request = ++generation.current;
        setBusy(true);
        setError('');
        setStatus('Préparation du texte et des audios…');
        try {
            if (!exercises.length)
                throw Error('Choisissez d’abord un passage.');
            const chapters = [...new Set(exercises.map(e => e.surah))];
            for (const surah of chapters) {
                if (request !== generation.current)
                    return;
                const textId = `text-${surah}`, textUrls = [`${base}/surah`, `${base}/surah/${surah}/quran-uthmani`, `${base}/surah/${surah}/fr.hamidullah`, `${base}/surah/${surah}/en.transliteration`];
                await useDownloadStore.getState().startDownload(textId, `Sourate ${surah} · texte et traduction`, textUrls, 'text');
                if (useDownloadStore.getState().tasks[textId]?.status !== 'completed')
                    throw Error(useDownloadStore.getState().tasks[textId]?.error || 'Texte incomplet. Réessayez.');
                const data = await fetchSurah(surah);
                const verses = data.ayahs.filter(a => exercises.some(e => e.surah === surah && (e.ayah === a.numberInSurah || (e.kind === 'transition' && e.ayah + 1 === a.numberInSurah))));
                const id = `hifdh-audio-${surah}-${verses.map(a => a.numberInSurah).join('-')}`;
                await useDownloadStore.getState().startDownload(id, `Ma séance · sourate ${surah}`, verses.map(a => getAudioUrl('ar.alafasy', a.number)));
                if (useDownloadStore.getState().tasks[id]?.status !== 'completed')
                    throw Error(useDownloadStore.getState().tasks[id]?.error || 'Audios incomplets. Réessayez.');
                // Timing downloads are optional. Whole-verse playback remains available without them.
                const urls = [`https://api.quran.com/api/v4/chapter_recitations/7/${surah}?segments=true`, ...verses.map(a => `https://api.quran.com/api/v4/verses/by_key/${surah}:${a.numberInSurah}?words=true&word_fields=text_uthmani,text_uthmani_tajweed`)];
                await useDownloadStore.getState().startDownload(`hifdh-timings-${id}`, `Repères de récitation · ${surah}`, urls, 'text');
            }
            if (request !== generation.current)
                return;
            const pack = await tilawaPackStatus();
            const shell = !!navigator.serviceWorker?.controller;
            setStatus(`Textes et audios de la séance téléchargés. ${pack.ready ? 'Pack vocal vérifié.' : 'Téléchargez aussi le pack vocal ci-dessous pour le micro hors ligne.'}${shell ? '' : ' Ouvrez une fois la version installée en ligne pour préparer son lancement hors connexion.'}`);
        }
        catch (e) {
            if (request === generation.current) {
                setError(e instanceof Error ? e.message : 'Stockage indisponible.');
                setStatus('Préparation incomplète. Les fichiers déjà téléchargés sont conservés.');
            }
        }
        finally {
            if (request === generation.current)
                setBusy(false);
        }
    }
    const downloads = Object.values(tasks).filter(t => t.status === 'downloading');
    return <section className="journey-card"><h3>Ma séance, même hors connexion</h3><p>Téléchargez vos passages et le pack vocal pour réviser sans connexion. Votre récitation reste privée.</p>
    <button className="journey-primary" disabled={busy || !exercises.length} onClick={() => void prepare()}>{busy ? 'Téléchargement…' : 'Télécharger les contenus de ma séance'}</button>
    {downloads.map(t => <div key={t.id}><p>{t.title} · {t.progress} %</p><progress max={100} value={t.progress}/><button onClick={() => useDownloadStore.getState().pauseDownload(t.id)}>Mettre en pause</button></div>)}
    {status && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}
    {bytes !== null && <small>Stockage du site : {(bytes / 1048576).toFixed(1)} Mio</small>}
    <TilawaPackCard />
    <p className="journey-muted">Les performances du micro dépendent de l’appareil. Sans repères audio, l’écoute porte sur le verset entier. Les fichiers peuvent être libérés par le navigateur.</p>
    <Link to="/storage">Gérer et supprimer mes packs</Link>
  </section>;
}
