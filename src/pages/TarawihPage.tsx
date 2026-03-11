import { useCallback, useEffect, useRef } from 'react';
import { Radio, ChevronLeft, ChevronRight, Mic, Volume2, Pause, Play, ArrowLeft, SkipForward } from 'lucide-react';
import { useTarawihStore } from '../stores/tarawihStore';
import { buildNightPlan, voiceActivityDetector } from '../lib/tarawihService';
import { playTts, stopTts } from '../lib/ttsService';
import { JUZ_DATA } from '../data/juzData';
import './TarawihPage.css';

export function TarawihPage() {
    const store = useTarawihStore();
    const ttsAbortRef = useRef(false);
    const wakeLockRef = useRef<any>(null);
    const isTranslatingRef = useRef(false);

    // Wake Lock — keep screen on during live session
    useEffect(() => {
        if (store.phase !== 'setup' && store.phase !== 'finished') {
            if ('wakeLock' in navigator) {
                (navigator as any).wakeLock.request('screen')
                    .then((lock: any) => { wakeLockRef.current = lock; })
                    .catch(() => { });
            }
        }
        return () => {
            wakeLockRef.current?.release?.();
            wakeLockRef.current = null;
        };
    }, [store.phase]);

    // Get juz info for current night
    const currentJuz = JUZ_DATA.find(j => j.number === store.nightNumber);

    // --- SETUP ---

    const handleStart = useCallback(async () => {
        store.setPhase('loading');
        const plan = await buildNightPlan(
            store.nightNumber,
            store.numberOfPairs,
            (msg) => store.setLoadingMessage(msg)
        );

        if (!plan || plan.totalVerses === 0) {
            store.setLoadingMessage('Erreur: aucun verset trouvé');
            setTimeout(() => store.setPhase('setup'), 2000);
            return;
        }

        store.setNightPlan(plan);
        store.setCurrentPair(1);

        // Start translating immediately — no detection needed!
        startTranslating();
    }, [store.nightNumber, store.numberOfPairs]);

    // --- CORE: Sequential Translation ---
    // The app simply reads FR translations one by one.
    // VAD handles auto-pause (silence = ruku) and auto-resume (voice = imam resumed).

    const startTranslating = useCallback(async () => {
        // IMPORTANT: Read fresh state from Zustand, not from stale React closure
        const s = useTarawihStore.getState();
        s.setPhase('translating');
        ttsAbortRef.current = false;
        isTranslatingRef.current = true;

        // Start VAD in background — it will auto-pause on silence, auto-resume on voice
        startVAD();

        const allPairs = s.nightPlan?.pairs || [];
        let pairIdx = s.currentPair - 1;
        let verseIdx = s.currentVerseIndex;

        console.log(`[Tarawih] Starting translation: ${allPairs.length} pairs, starting at pair ${pairIdx + 1}, verse ${verseIdx}`);

        if (allPairs.length === 0) {
            console.error('[Tarawih] No pairs found! nightPlan:', s.nightPlan);
            isTranslatingRef.current = false;
            s.setPhase('setup');
            return;
        }

        while (pairIdx < allPairs.length) {
            const pair = allPairs[pairIdx];
            useTarawihStore.getState().setCurrentPair(pairIdx + 1);

            for (let i = verseIdx; i < pair.verses.length; i++) {
                if (ttsAbortRef.current) {
                    isTranslatingRef.current = false;
                    return;
                }

                // Wait if paused (by VAD or manual)
                while (useTarawihStore.getState().phase === 'paused' && !ttsAbortRef.current) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                if (ttsAbortRef.current) {
                    isTranslatingRef.current = false;
                    return;
                }

                useTarawihStore.getState().setCurrentVerseIndex(i);
                const verse = pair.verses[i];

                if (verse.textFrench && verse.textFrench.trim().length > 0) {
                    try {
                        const currentSpeed = useTarawihStore.getState().ttsSpeed;
                        await playTts(verse.textFrench, {
                            rate: currentSpeed,
                            lang: 'fr',
                        });
                    } catch {
                        // TTS failed — continue to next verse
                    }
                }

                if (ttsAbortRef.current) {
                    isTranslatingRef.current = false;
                    return;
                }

                // Small pause between verses
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Finished pair
            pairIdx++;
            verseIdx = 0;

            if (pairIdx < allPairs.length && !ttsAbortRef.current) {
                // Auto-pause between pairs — wait for resume
                useTarawihStore.getState().setPhase('paused');
                console.log(`[Tarawih] Pair ${pairIdx} done, waiting for resume...`);

                while (useTarawihStore.getState().phase === 'paused' && !ttsAbortRef.current) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                if (ttsAbortRef.current) {
                    isTranslatingRef.current = false;
                    return;
                }
            }
        }

        // All pairs done
        isTranslatingRef.current = false;
        voiceActivityDetector.stop();
        useTarawihStore.getState().setPhase('finished');
    }, []);

    // --- VAD: Auto-pause on silence, auto-resume on voice ---

    const startVAD = useCallback(async () => {
        const vadStarted = await voiceActivityDetector.start({
            onVoiceDetected: () => {
                const currentPhase = useTarawihStore.getState().phase;
                if (currentPhase === 'paused') {
                    useTarawihStore.getState().setPhase('translating');
                }
            },
            onSilenceDetected: () => {
                const currentPhase = useTarawihStore.getState().phase;
                if (currentPhase === 'translating') {
                    stopTts();
                    useTarawihStore.getState().setPhase('paused');
                }
            },
            onVolumeUpdate: (v) => useTarawihStore.getState().setVolume(v),
        });

        if (!vadStarted) {
            console.log('[Tarawih] VAD not available — manual pause/resume only');
        }
    }, []);

    // --- Manual Controls ---

    const handlePause = useCallback(() => {
        stopTts();
        store.setPhase('paused');
    }, []);

    const handleResume = useCallback(() => {
        store.setPhase('translating');
        // Re-trigger translation from current position
        if (!isTranslatingRef.current) {
            startTranslating();
        }
    }, []);

    const handleStop = useCallback(() => {
        ttsAbortRef.current = true;
        stopTts();
        voiceActivityDetector.stop();
        store.reset();
    }, []);

    const handleNextPair = useCallback(() => {
        store.nextPair();
        store.setPhase('translating');
        if (!isTranslatingRef.current) {
            startTranslating();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            ttsAbortRef.current = true;
            stopTts();
            voiceActivityDetector.stop();
        };
    }, []);

    // --- RENDER ---

    // Setup screen
    if (store.phase === 'setup') {
        return (
            <div className="tarawih-page">
                <div className="tarawih-header">
                    <h1 className="tarawih-title">
                        <Radio size={26} />
                        Tarawih Live
                    </h1>
                    <p className="tarawih-subtitle">
                        Traduction simultanée dans votre oreillette
                    </p>
                </div>

                <div className="tarawih-setup">
                    {/* Night Selector */}
                    <div className="tarawih-setup-card">
                        <h3>📅 Nuit du Ramadan</h3>
                        <div className="tarawih-night-selector">
                            <button
                                className="tarawih-night-btn"
                                onClick={() => store.setNightNumber(store.nightNumber - 1)}
                                disabled={store.nightNumber <= 1}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="tarawih-night-display">
                                <div className="tarawih-night-number">{store.nightNumber}</div>
                                <div className="tarawih-night-label">Nuit {store.nightNumber}/30</div>
                            </div>
                            <button
                                className="tarawih-night-btn"
                                onClick={() => store.setNightNumber(store.nightNumber + 1)}
                                disabled={store.nightNumber >= 30}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {currentJuz && (
                            <div className="tarawih-juz-info">
                                <strong>Juz {currentJuz.number}</strong> — {currentJuz.nameArabic}
                                <br />
                                Sourate {currentJuz.startSurah}:{currentJuz.startAyah} → {currentJuz.endSurah}:{currentJuz.endAyah}
                            </div>
                        )}
                    </div>

                    {/* Pairs selector */}
                    <div className="tarawih-setup-card">
                        <h3>🕌 Nombre de paires de raka'at</h3>
                        <div className="tarawih-pairs-selector">
                            {[2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    className={`tarawih-pair-option ${store.numberOfPairs === n ? 'active' : ''}`}
                                    onClick={() => store.setNumberOfPairs(n)}
                                >
                                    {n} × 2
                                    <small>{n * 2} raka'at</small>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TTS Speed */}
                    <div className="tarawih-setup-card">
                        <h3>🔊 Vitesse de traduction</h3>
                        <div className="tarawih-slider-row">
                            <span className="tarawih-slider-label">Lente</span>
                            <input
                                type="range"
                                min="0.6"
                                max="1.8"
                                step="0.1"
                                value={store.ttsSpeed}
                                onChange={(e) => store.setTtsSpeed(parseFloat(e.target.value))}
                            />
                            <span className="tarawih-slider-value">{store.ttsSpeed}×</span>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="tarawih-setup-card">
                        <h3>🎧 Comment ça marche</h3>
                        <div className="tarawih-juz-info" style={{ textAlign: 'left' }}>
                            1. Mettez votre oreillette<br />
                            2. L'app lit les traductions FR en continu<br />
                            3. Pause auto quand l'imam fait ruku<br />
                            4. Reprise auto quand l'imam reprend<br />
                            5. Contrôles manuels ◀ ▶ si besoin
                        </div>
                    </div>

                    {/* Start */}
                    <button className="tarawih-start-btn" onClick={handleStart}>
                        <Play size={22} />
                        Démarrer le Tarawih
                    </button>
                </div>
            </div>
        );
    }

    // Loading screen
    if (store.phase === 'loading') {
        return (
            <div className="tarawih-page">
                <div className="tarawih-loading">
                    <div className="tarawih-loading-spinner" />
                    <p>{store.loadingMessage || 'Chargement...'}</p>
                </div>
            </div>
        );
    }

    // Finished screen
    if (store.phase === 'finished') {
        return (
            <div className="tarawih-page">
                <div className="tarawih-finished">
                    <div className="tarawih-finished-icon">🕌</div>
                    <h2>Tarawih terminé !</h2>
                    <p>
                        Nuit {store.nightNumber} — Juz {store.nightNumber}
                        <br />
                        {store.nightPlan?.totalVerses || 0} versets traduits
                    </p>
                    <button className="tarawih-finished-btn" onClick={handleStop}>
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    // Live screen (translating / paused)
    const verse = store.getCurrentVerse();
    const progress = store.getPairProgress();
    const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

    return (
        <div className="tarawih-page">
            {/* Back button */}
            <button className="tarawih-back-btn" onClick={handleStop}>
                <ArrowLeft size={16} /> Arrêter
            </button>

            {/* Phase indicator */}
            <div className={`tarawih-phase-bar ${store.phase}`}>
                {store.phase === 'translating' && (
                    <>
                        <Volume2 size={18} />
                        🔊 Traduction en cours
                    </>
                )}
                {store.phase === 'paused' && (
                    <>
                        <Pause size={18} />
                        ⏸️ En pause — Appuyez ▶ ou attendez la reprise
                    </>
                )}
            </div>

            {/* Progress */}
            <div className="tarawih-progress">
                <span>Paire {store.currentPair}/{store.numberOfPairs}</span>
                <span>Verset {progress.current}/{progress.total}</span>
            </div>
            <div className="tarawih-progress-bar">
                <div className="tarawih-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Verse display */}
            {verse && (
                <div className="tarawih-verse-card">
                    <div className="tarawih-verse-ref">
                        <span>{verse.surahName}</span>
                        <span className="tarawih-verse-ref-badge">
                            {verse.surah}:{verse.ayah}
                        </span>
                    </div>

                    <div className="tarawih-arabic-text">
                        {verse.textArabic}
                    </div>

                    <div className="tarawih-french-text">
                        {verse.textFrench || '(Traduction non disponible)'}
                    </div>

                    {store.phase === 'translating' && (
                        <div className="tarawih-speaking-indicator">
                            <Volume2 size={14} />
                            Lecture en cours...
                        </div>
                    )}
                </div>
            )}

            {/* Pair dots */}
            <div className="tarawih-pair-info">
                <span>Nuit {store.nightNumber} — Juz {store.nightNumber}</span>
                <div className="tarawih-pair-dots">
                    {Array.from({ length: store.numberOfPairs }, (_, i) => (
                        <div
                            key={i}
                            className={`tarawih-pair-dot ${
                                i + 1 === store.currentPair ? 'active' :
                                i + 1 < store.currentPair ? 'done' : ''
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="tarawih-controls">
                <button className="tarawih-ctrl-btn" onClick={() => store.prevVerse()} title="Verset précédent">
                    <ChevronLeft size={22} />
                </button>

                {store.phase === 'translating' ? (
                    <button className="tarawih-ctrl-btn primary" onClick={handlePause} title="Pause">
                        <Pause size={26} />
                    </button>
                ) : (
                    <button className="tarawih-ctrl-btn primary" onClick={handleResume} title="Reprendre">
                        <Play size={26} />
                    </button>
                )}

                <button className="tarawih-ctrl-btn" onClick={() => store.nextVerse()} title="Verset suivant">
                    <ChevronRight size={22} />
                </button>

                <button className="tarawih-ctrl-btn" onClick={handleNextPair} title="Paire suivante">
                    <SkipForward size={18} />
                </button>
            </div>

            {/* Volume indicator */}
            <div className="tarawih-volume">
                <Mic size={14} />
                <div className="tarawih-volume-bar">
                    <div className="tarawih-volume-fill" style={{ width: `${Math.min(100, store.volume * 2)}%` }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {store.phase === 'translating' ? 'Silence → pause auto' : 'Voix → reprise auto'}
                </span>
            </div>
        </div>
    );
}
