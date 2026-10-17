import { useHifdhWordStudy } from './useHifdhWordStudy';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, Download, Mic, Pause, Play, Sparkles, Settings2, Lightbulb } from 'lucide-react';
import type { Ayah } from '../../types';
import { useHifdhJourneyStore } from '../../stores/hifdhJourneyStore';
import { useLearningStore } from '../../stores/learningStore';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { useSRSStore } from '../../stores/srsStore';
import { buildJourney, buildChallenge, exerciseWindow, mastery, outcomeLabels, type JourneyExercise, type RecallOutcome } from '../../lib/hifdhJourney';
import { localDay } from '../../lib/learning';
import type { CoachReviewEntry } from '../../lib/coachSession';
import { fetchSurah, getAudioUrl } from '../../lib/quranApi';
import { recitationWords } from '../../lib/recitationMatching';
import { fetchWordTimings } from '../../lib/wordTimings';
import { compatibleWords } from '../../lib/tilawa/feedback';
import { useCoach } from '../../hooks/useCoach';
import { HifdhOffline } from './HifdhOffline';
import { HifdhSimilar } from './HifdhSimilar';
import './HifdhJourney.css';
export type HifdhView = 'session' | 'training' | 'progress';
interface Props {
    view?: HifdhView;
    onView?: (view: HifdhView) => void;
    ayahs: Ayah[];
    errors: CoachReviewEntry[];
    onActive: (active: boolean) => void;
    onStart: () => void;
    onChoose?: () => void;
}
function pauseOtherPlayback() { const player=useAudioPlayerStore.getState(); if(player.isPlaying)player.togglePlay(); window.dispatchEvent(new Event('quran-stop-playback')); }
const names = { learn: 'Apprendre', repair: 'Consolider', recall: 'Rappel différé', middle: 'Départ au milieu', ending: 'Fin de verset', transition: 'Enchaînement' };
export function HifdhJourney({ ayahs, errors, onActive, onStart, onChoose, view = 'session', onView }: Props) {
    const location = useLocation();
    const { plan, attempts, setPlan } = useHifdhJourneyStore();
    const { minutes, records } = useLearningStore();
    const cards = useSRSStore(s => s.cards);
    const [duration, setDuration] = useState<5 | 10 | 20>(minutes);
    const [active, setActive] = useState(false);
    const handledResume = useRef('');
    useEffect(() => {
        if (new URLSearchParams(location.search).get('resume') !== 'journey' || handledResume.current === location.key || !plan || plan.cursor >= plan.exercises.length) return;
        handledResume.current = location.key;
        onStart(); setActive(true); onActive(true);
    // The location key prevents reopening a journey after the user leaves it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.key, location.search, plan]);
    const [panel, setPanel] = useState<'offline' | 'similar' | null>(null);
    const proposed = useMemo(() => buildJourney(duration, cards, attempts, records, ayahs, errors), [duration, cards, attempts, records, ayahs, errors]);
    const enter = () => { onStart(); setActive(true); onActive(true); setPanel(null); };
    const leave = () => { setActive(false); onActive(false); };
    const start = (exercises = proposed) => { if (!exercises.length)
        return; setPlan({ day: localDay(), minutes: duration, exercises, cursor: 0, phase: 0 }); useLearningStore.setState({ minutes: duration }); enter(); };
    const current = plan?.exercises[plan.cursor];
    const refs = useMemo(() => {
        const items = new Map(ayahs.map(a => [`${a.surah}:${a.numberInSurah}`, { surah: a.surah, ayah: a.numberInSurah }]));
        for (const a of attempts)
            items.set(`${a.surah}:${a.ayah}`, { surah: a.surah, ayah: a.ayah });
        for (const key of Object.keys(records)) {
            const [surah, ayah] = key.split(':').map(Number);
            if (surah && ayah)
                items.set(key, { surah, ayah });
        }
        for (const c of Object.values(cards))
            items.set(c.id, { surah: c.surah, ayah: c.ayah });
        return [...items.values()].sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
    }, [ayahs, attempts, records, cards]);
    if (active && plan)
        return <section className="journey" aria-label="Séance guidée">
    <div className="journey-top"><button onClick={leave}><ChevronLeft size={16}/>Quitter et conserver ma séance</button><span>{Math.min(plan.cursor + 1, plan.exercises.length)} / {plan.exercises.length}</span></div>
    <progress max={plan.exercises.length} value={plan.cursor} aria-label="Progression de séance"/>
    {current ? <JourneyExerciseView key={`${plan.cursor}-${current.surah}-${current.ayah}`} exercise={current}/> : <div className="journey-card journey-finish"><Check size={32}/><h2>Séance terminée</h2><p>Vos rappels confirmés alimentent votre carte. Les passages fragiles sont programmés en révision.</p><button className="journey-primary" onClick={() => { leave(); onView?.('progress'); }}>Voir ma progression</button></div>}
  </section>;
    const repairs = proposed.filter(p => p.kind === 'repair').length, reviews = proposed.filter(p => p.kind === 'recall').length, newCount = proposed.filter(p => p.kind === 'learn').length;
    const mapItems = refs.map(p => {
        const key = `${p.surah}:${p.ayah}`, detail = mastery(attempts, p, records[key]);
        const status = detail === 'Confirmé après plusieurs jours' ? 'Acquis' : detail === 'En apprentissage' ? 'À apprendre' : 'À consolider';
        return { ...p, key, detail, status };
    });
    const resumable = plan && plan.cursor < plan.exercises.length;
    return <section className="journey" aria-label="Coach de mémorisation">
    {view === 'session' && <>
      <div className="journey-hero">
        <div className="journey-top"><h2>Ma séance</h2><div className="journey-durations" aria-label="Durée indicative">{([5, 10, 20] as const).map(n => <button key={n} aria-pressed={duration === n} onClick={() => setDuration(n)}>{n} min</button>)}</div></div>
        {onChoose && <button className="journey-passage" onClick={onChoose}><span>Passage choisi <strong>{ayahs.length ? `${ayahs[0].surah}:${ayahs[0].numberInSurah}–${ayahs.at(-1)!.numberInSurah}` : 'Choisir un passage'}</strong></span><span>Modifier →</span></button>}
        <p className="journey-plan-counts">{repairs} à consolider · {reviews} à revoir · {newCount} à apprendre</p>
        {resumable ? <><button className="journey-primary" onClick={enter}>Reprendre la séance <span>{plan.cursor + 1}/{plan.exercises.length} <ArrowRight size={16}/></span></button><button className="journey-new-session" disabled={!proposed.length} onClick={() => start()}>Commencer une nouvelle séance</button></> : <button className="journey-primary" disabled={!proposed.length} onClick={() => start()}>Commencer ma séance <ArrowRight size={18}/></button>}
        <small>Un peu chaque jour · durée indicative</small>
      </div>
      {ayahs[0] && <div className="journey-preview"><span className="journey-kicker">Votre passage · {ayahs[0].surah}:{ayahs[0].numberInSurah}</span><p dir="rtl" lang="ar">{ayahs[0].text}</p><button onClick={onChoose}>Ouvrir le passage <ArrowRight size={15}/></button></div>}
      <div className="journey-links"><button aria-expanded={panel === 'offline'} onClick={() => setPanel(panel === 'offline' ? null : 'offline')}><Download size={15}/>Préparer hors ligne</button></div>
      {panel === 'offline' && <HifdhOffline exercises={proposed}/>}
    </>}
    {view === 'training' && <>
      <div className="journey-training-tools"><button disabled={!ayahs.length} onClick={() => start(buildChallenge(ayahs, attempts))}><Mic size={18}/><span><strong>Me tester</strong><small>Départs, fins et transitions</small></span></button><button aria-expanded={panel === 'similar'} onClick={() => { onStart(); setPanel(panel === 'similar' ? null : 'similar'); }}><Sparkles size={18}/><span><strong>Passages similaires</strong><small>Comparer et distinguer</small></span></button></div>
      {panel === 'similar' && <HifdhSimilar errors={errors}/>}
    </>}
    {view === 'progress' && <section className="journey-card journey-progress"><span className="journey-kicker">Chaque rappel compte</span><h2>Ma carte de mémorisation</h2>
      <div className="journey-stats">{['À apprendre', 'À consolider', 'Acquis'].map(status => <div key={status} data-status={status}><strong>{mapItems.filter(p => p.status === status).length}</strong><span>{status}</span></div>)}</div>
      <p className="journey-muted">Les versets acquis sont confirmés par des rappels sans aide espacés d’au moins trois jours. Touchez un verset pour le retravailler.</p>
      <div className="journey-map">{mapItems.map(p => <button key={p.key} data-status={p.status} title={p.detail} onClick={() => start([{ surah: p.surah, ayah: p.ayah, kind: p.status === 'À apprendre' ? 'learn' : p.status === 'À consolider' ? 'repair' : 'recall', reason: p.detail }])}><strong>{p.key}</strong><small>{p.status}</small><span className="journey-map-detail">{p.detail}</span></button>)}</div>
      {!mapItems.length && <p>Choisissez un passage pour commencer votre carte.</p>}
      {!!attempts.length && <details><summary>Mes derniers rappels</summary><div className="journey-history">{attempts.slice(0, 12).map(a => <div key={a.id}><strong>{a.surah}:{a.ayah}</strong><span>{outcomeLabels[a.outcome]}{a.scope === 'phrase' ? ' · portion travaillée' : ''}</span><time dateTime={a.at}>{new Date(a.at).toLocaleDateString('fr-FR')}</time></div>)}</div></details>}
    </section>}
  </section>;
}

function JourneyExerciseView({ exercise }: {
    exercise: JourneyExercise;
}) {
    const { plan, phase: setPhase, record, next, assist, reveal } = useHifdhJourneyStore();
    const phase = plan?.phase || 0;
    const [ayahs, setAyahs] = useState<Ayah[]>([]), [error, setError] = useState(''), [retry, setRetry] = useState(0);
    const review = plan?.reviewed || false, hints = plan?.hints || 0;
    const [hintText, setHintText] = useState('');
    const [playing, setPlaying] = useState(false), [audioNote, setAudioNote] = useState(''), [feedback, setFeedback] = useState<'live' | 'end'>('live');
    const [audioReady, setAudioReady] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const audio = useRef<HTMLAudioElement | null>(null), audioStop = useRef<number | null>(null), pending = useRef(0), rated = useRef(false);
    const engine = useLearningStore(s => s.engine);
    const structured = exercise.kind === 'learn' || exercise.kind === 'repair';
    const phaseNames = exercise.kind === 'repair' ? ['Écouter la portion', 'Réciter avec le texte', 'Rappeler sans aide', 'Réintégrer au verset'] : ['Écouter le verset', 'Réciter avec le texte', 'Rappeler sans aide'];
    const visible = structured && phase < 2;
    const window = ayahs[0] ? exerciseWindow(exercise, ayahs[0], phase) : { start: 0, end: 0 };
    const fragment = exercise.kind === 'repair' && phase < 3;
    // Keep full canonical verses for Tilawa alignment, even when displaying a short repair.
    const coach = useCoach({ ayahs, scoreKey: `${exercise.surah}:${exercise.ayah}-${ayahs.at(-1)?.numberInSurah || exercise.ayah}`, playingIndex: 0, continuous: true });
    const stopAudio = () => { ++pending.current; audio.current?.pause(); setPlaying(false); };
    useEffect(() => {
        let cancelled = false;
        const requestRef = pending, playerRef = audio;
        fetchSurah(exercise.surah).then(data => {
            const selected = data.ayahs.filter(a => a.numberInSurah === exercise.ayah || (exercise.kind === 'transition' && a.numberInSurah === exercise.ayah + 1));
            if (!selected.length)
                throw Error('Passage indisponible');
            if (!cancelled)
                setAyahs(selected);
        }).catch(() => { if (!cancelled)
            setError('Ce passage est indisponible. Vérifiez les packs hors ligne ou réessayez avec une connexion.'); });
        return () => { cancelled = true; ++requestRef.current; playerRef.current?.pause(); };
    }, [exercise.surah, exercise.ayah, exercise.kind, retry]);
    const wordStudy = useHifdhWordStudy(`${exercise.surah}:${exercise.ayah}:${phase}:${review}`, () => {
        stopAudio(); void coach.stopCoachListening();
        if (!visible && !review) assist();
    });
    const resetPhase = (n: number) => { stopAudio(); void coach.stopCoachListening(); reveal(false); setHintText(''); setAudioReady(false); setPhase(n); };
    async function playClip() {
        pauseOtherPlayback();
        stopAudio();
        void coach.stopCoachListening();
        setError('');
        const id = ++pending.current, a = ayahs[0];
        if (!a)
            return;
        try {
            const player = new Audio();
            audio.current = player;
            const timings = await fetchWordTimings(a.surah, a.numberInSurah).catch(() => null);
            if (id !== pending.current)
                return;
            let from = 0, to: number | null = null;
            const words = recitationWords(a.text);
            if (timings && compatibleWords(words, timings.words.map(w => w.text)) && timings.words[window.start]?.timestampTo > timings.words[window.start]?.timestampFrom && timings.words[window.end - 1]?.timestampTo > 0) {
                from = timings.words[window.start].timestampFrom / 1000;
                to = timings.words[window.end - 1].timestampTo / 1000;
                setAudioNote(fragment ? 'Écoute de la portion ciblée.' : 'Écoute du passage.');
            }
            else
                setAudioNote('Repères audio indisponibles : écoute du verset entier.');
            player.src = getAudioUrl('ar.alafasy', a.number);
            audioStop.current = to;
            player.onloadedmetadata = () => { if (id === pending.current)
                player.currentTime = from; };
            player.ontimeupdate = () => { if (id !== pending.current)
                return; if (audioStop.current !== null && player.currentTime >= audioStop.current) {
                player.pause();
                setPlaying(false);
                setAudioReady(true);
            } };
            player.onended = () => { if (id !== pending.current)
                return; setPlaying(false); setAudioReady(true); };
            player.onerror = () => { if (id !== pending.current)
                return; setError('Audio indisponible. Réessayez ou poursuivez avec le texte.'); setPlaying(false); };
            await player.play();
            if (id !== pending.current) {
                player.pause();
                return;
            }
            setPlaying(true);
            if (!visible)
                assist();
        }
        catch {
            if (id === pending.current) {
                setError('Lecture audio impossible. Réessayez.');
                setPlaying(false);
            }
        }
    }
    async function listen() {
        pauseOtherPlayback();
        stopAudio();
        setError('');
        if (coach.isStarting) {
            await coach.stopCoachListening();
            return;
        }
        if (coach.isListening) {
            await coach.finishCoachListening();
            reveal(true);
            return;
        }
        if (!navigator.onLine && engine !== 'tilawa') {
            setError('Hors connexion, sélectionnez Tilawa dans les packs vocaux. Vous pouvez aussi réciter et comparer sans micro.');
            return;
        }
        coach.selectCoachMode('solo');
        coach.setDuoPhase('student');
        await coach.startCoachListening(0, window.start);
    }
    async function compare() { stopAudio(); await coach.finishCoachListening(); reveal(true); }
    function hint() {
        const words = ayahs.flatMap(a => recitationWords(a.text));
        const found = coach.allCoachWords.findIndex(w => coach.wordStates.get(`${w.ayahIndex}-${w.wordIndex}`) === 'current');
        const index = Math.min(words.length - 1, Math.max(window.start, found >= 0 ? found : window.start + hints + (structured ? 0 : 1)));
        setHintText(words[index] || '');
        assist();
    }
    function rate(outcome: RecallOutcome) {
        if (rated.current)
            return;
        rated.current = true;
        const actual = outcome === 'independent' && hints > 0 ? 'assisted' : outcome;
        for (const a of ayahs) {
            const ref = { surah: a.surah, ayah: a.numberInSurah };
            record({ ...ref, kind: exercise.kind, outcome: actual, hints, scope: exercise.kind === 'middle' || exercise.kind === 'ending' ? 'phrase' : 'verse' });
            if (actual !== 'uncertain') {
                const recall = actual === 'independent' ? 'independent' : actual === 'assisted' ? 'assisted' : 'consolidate';
                if (exercise.kind !== 'middle' && exercise.kind !== 'ending')
                    useLearningStore.getState().recordRecall(ref, recall, 'journey');
                useSRSStore.getState().addCard(ref.surah, ref.ayah);
                // A partial recall cannot establish mastery of a whole verse.
                if (exercise.kind !== 'middle' && exercise.kind !== 'ending' || actual !== 'independent')
                    useSRSStore.getState().reviewCard(`${ref.surah}:${ref.ayah}`, actual === 'independent' ? 4 : 2);
            }
        }
        next(actual === 'review');
    }
    return <div className="journey-card journey-exercise">
    <span className="journey-kicker">{names[exercise.kind]} · Coran {exercise.surah}:{exercise.ayah}{ayahs.length > 1 ? `–${ayahs.at(-1)!.numberInSurah}` : ''}</span>
    <h2>{structured ? phaseNames[phase] : exercise.reason}</h2>
    <p className="journey-muted">{exercise.reason}{exercise.kind === 'transition' && ayahs.length === 1 ? ' · Dernier verset : révisez sa conclusion.' : ''}</p>
    {structured && <ol className="journey-phases">{phaseNames.map((s, i) => <li key={s} aria-current={phase === i ? 'step' : undefined}>{i + 1}<span>{s}</span></li>)}</ol>}
    {error && <p role="alert">{error}{!ayahs.length && <button onClick={() => { setError(''); setRetry(n => n + 1); }}>Réessayer</button>}</p>}
    {!ayahs.length && !error && <p role="status">Préparation du passage…</p>}
    {ayahs.map((a, ai) => <div className="journey-verse" key={a.number}><small>{a.surah}:{a.numberInSurah}</small><p dir="rtl" lang="ar">{recitationWords(a.text).map((w, wi) => {
                if (ai === 0 && (wi < window.start || (fragment && wi >= window.end)))
                    return null;
                const state = coach.wordStates.get(`${ai}-${wi}`), shown = visible || review || (!structured && ai === 0 && wi === window.start);
                return <span key={wi} {...wordStudy.bind(a, wi, recitationWords(a.text), shown)} data-state={feedback === 'live' || review ? state : undefined}>{shown ? w : '•••'} </span>;
            })}</p></div>)}
    {hintText && <p className="journey-hint" dir="rtl" lang="ar" role="status">{hintText}</p>}
    <div className="journey-command-bar" aria-label="Commandes de récitation">
    {!visible && !review && <button onClick={hint} disabled={!ayahs.length}><Lightbulb size={16}/>Un mot d’aide{hints ? ` · ${hints}` : ''}</button>}
    {!review && (!visible || phase > 0) && <button disabled={!ayahs.length} onClick={() => playing ? stopAudio() : void playClip()}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? 'Pause' : 'Écouter'}</button>}
    {!review && <>
      {visible && phase === 0 ? <><button className="journey-primary" disabled={!ayahs.length} onClick={() => playing ? stopAudio() : void playClip()}>{playing ? <Pause size={18}/> : <Play size={18}/>} {playing ? 'Pause' : 'Écouter'}</button><p className="journey-muted">{audioNote}</p><button onClick={() => resetPhase(1)} disabled={!ayahs.length}>{audioReady ? 'Passer à la récitation' : 'Continuer avec le texte'}</button></> : <>

        <button className="journey-primary" disabled={!ayahs.length} onClick={() => void listen()}><Mic size={18}/>{coach.isStarting ? 'Annuler la préparation' : coach.isListening ? 'Terminer ma récitation' : 'Réciter avec le micro'}</button>
        <button disabled={!ayahs.length} onClick={() => void compare()}>{structured && phase === 1 ? 'J’ai récité avec le texte' : 'J’ai terminé · comparer au texte'}</button>
        {coach.isListening && <p role="status">Écoute {engine === 'tilawa' ? 'locale' : 'standard'} en cours{fragment ? ' · répétez la portion ; terminez avec le bouton ci-dessus' : ''}.</p>}
      </>}
      {coach.coachAtEnd && !coach.isStarting && <p role="status">Fin du passage repérée. Terminez pour comparer votre rappel.</p>}
    </>}
    <button aria-expanded={showSettings} aria-controls="journey-settings" onClick={() => setShowSettings(v => !v)}><Settings2 size={16}/>Réglages</button>
    </div>
    {showSettings && <div id="journey-settings" className="journey-settings">        <div className="journey-feedback-choice"><label>Retour du coach<select value={feedback} onChange={e => setFeedback(e.target.value as 'live' | 'end')}><option value="live">Pendant la récitation</option><option value="end">Au bilan uniquement</option></select></label></div><small className="journey-muted">{engine === 'tilawa' ? 'Reconnaissance hors ligne · voix traitée sur votre appareil.' : 'Reconnaissance vocale du navigateur.'} <Link to="/storage">Réglages hors ligne</Link></small></div>}
    {coach.coachError && <p role="alert">{coach.coachError}</p>}
    {review && <section className="journey-verdict"><h3>Comparez et confirmez votre rappel</h3><p>{coach.coachTotalProcessed} mots évalués · {coach.coachMistakesCount} signalements · {coach.coachUncertainCount} incertains.</p><p className="journey-muted">Un signalement vocal peut être une erreur de reconnaissance. Confirmez votre rappel après comparaison.</p>
      {structured && phase < phaseNames.length - 1 ? <button className="journey-primary" onClick={() => resetPhase(phase + 1)}>Continuer · {phaseNames[phase + 1]}</button> : <div className="journey-ratings">{(['independent', 'assisted', 'self-corrected', 'review', 'uncertain'] as const).map(o => <button key={o} disabled={o === 'independent' && hints > 0} onClick={() => rate(o)}>{outcomeLabels[o]}</button>)}</div>}
      <button onClick={() => { reveal(false); setHintText(''); coach.resetCoach(); }}>Réessayer ce passage</button>
    </section>}
    {wordStudy.card}
  </div>;
}
