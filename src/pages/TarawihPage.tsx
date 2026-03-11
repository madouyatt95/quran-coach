import { useCallback, useEffect, useRef } from 'react';
import { Radio, ChevronLeft, ChevronRight, Mic, Volume2, Pause, Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { useTarawihStore } from '../stores/tarawihStore';
import { buildNightPlan, voiceActivityDetector, verseConfirmer, findVerseInPlan } from '../lib/tarawihService';
import { playTts, stopTts } from '../lib/ttsService';
import { JUZ_DATA } from '../data/juzData';
import './TarawihPage.css';

export function TarawihPage() {
    const store = useTarawihStore();
    const ttsAbortRef = useRef(false);
    const wakeLockRef = useRef<any>(null);

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

    // --- SETUP Actions ---

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
        store.setPhase('detecting');

        // Start VAD + verse confirmation
        startDetection();
    }, [store.nightNumber, store.numberOfPairs]);

    // --- LIVE Actions ---

    const startDetection = useCallback(async () => {
        store.setPhase('detecting');
        ttsAbortRef.current = true;
        stopTts();

        const verse = store.getCurrentVerse();
        if (!verse) return;

        // Start VAD to monitor volume
        const vadStarted = await voiceActivityDetector.start({
            onVoiceDetected: () => {
                // Voice detected — run verse detection
                detectAndTranslate();
            },
            onSilenceDetected: () => {
                // Silence while detecting — ignore, keep waiting
            },
            onVolumeUpdate: (v) => store.setVolume(v),
        });

        if (!vadStarted) {
            // Mic not available — skip detection, go straight to translation
            detectAndTranslate();
        }
    }, []);

    const detectAndTranslate = useCallback(async () => {
        voiceActivityDetector.stop();

        const plan = store.nightPlan;
        if (!plan) {
            // No plan — just start translating from current position
            startTranslationSequence();
            return;
        }

        // Listen for 6 seconds to capture what the imam is reciting
        store.setPhase('detecting');
        const transcript = await verseConfirmer.listen(6000);
        console.log('[Tarawih] Transcript captured:', transcript);

        if (transcript && transcript.trim().length > 0) {
            // Search all verses in the plan to find the best match
            const match = findVerseInPlan(plan, transcript);

            if (match && match.score >= 0.3) {
                // Found it! Jump to the matched verse
                console.log(`[Tarawih] Jumping to pair ${match.pairIndex + 1}, verse ${match.verseIndex} (${match.verse.surah}:${match.verse.ayah})`);
                store.setCurrentPair(match.pairIndex + 1);
                store.setCurrentVerseIndex(match.verseIndex);
            } else {
                console.log('[Tarawih] No strong match found, keeping current position');
            }
        } else {
            console.log('[Tarawih] No transcript captured, keeping current position');
        }

        // Start reading translations from the (possibly updated) position
        startTranslationSequence();
    }, []);

    const startTranslationSequence = useCallback(async () => {
        store.setPhase('translating');
        ttsAbortRef.current = false;

        const verses = store.getPairVerses();
        const startIdx = store.currentVerseIndex;

        for (let i = startIdx; i < verses.length; i++) {
            if (ttsAbortRef.current) break;

            store.setCurrentVerseIndex(i);
            const verse = verses[i];

            if (verse.textFrench && verse.textFrench.trim().length > 0) {
                await playTts(verse.textFrench, {
                    rate: store.ttsSpeed,
                });
            }

            if (ttsAbortRef.current) break;

            // Small pause between verses
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        if (!ttsAbortRef.current) {
            // Finished this pair — go to paused state, waiting for next pair
            store.setPhase('paused');

            // Start VAD to detect when imam resumes for next pair
            startVADForNextPair();
        }
    }, [store.ttsSpeed]);

    const startVADForNextPair = useCallback(async () => {
        const vadStarted = await voiceActivityDetector.start({
            onVoiceDetected: () => {
                voiceActivityDetector.stop();
                // Imam resumed — move to next pair
                store.nextPair();
                if (store.phase !== 'finished') {
                    startDetection();
                }
            },
            onSilenceDetected: () => { },
            onVolumeUpdate: (v) => store.setVolume(v),
        });

        if (!vadStarted) {
            // No mic — wait for manual action
        }
    }, []);

    const handlePause = useCallback(() => {
        ttsAbortRef.current = true;
        stopTts();
        voiceActivityDetector.stop();
        store.setPhase('paused');
    }, []);

    const handleResume = useCallback(() => {
        startTranslationSequence();
    }, []);

    const handleResync = useCallback(() => {
        ttsAbortRef.current = true;
        stopTts();
        voiceActivityDetector.stop();
        startDetection();
    }, []);

    const handleStop = useCallback(() => {
        ttsAbortRef.current = true;
        stopTts();
        voiceActivityDetector.stop();
        verseConfirmer.stop();
        store.reset();
    }, []);

    const handleNextPairManual = useCallback(() => {
        ttsAbortRef.current = true;
        stopTts();
        voiceActivityDetector.stop();
        store.nextPair();
        if (store.phase !== 'finished') {
            startDetection();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            ttsAbortRef.current = true;
            stopTts();
            voiceActivityDetector.stop();
            verseConfirmer.stop();
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

                    {/* Start */}
                    <button className="tarawih-start-btn" onClick={handleStart}>
                        <Radio size={22} />
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

    // Live screen (detecting / translating / paused)
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
                {store.phase === 'detecting' && (
                    <>
                        <Mic size={18} className="tarawih-mic-icon" />
                        Détection en cours... Écoutez l'imam
                    </>
                )}
                {store.phase === 'translating' && (
                    <>
                        <Volume2 size={18} />
                        🔊 Traduction en cours
                    </>
                )}
                {store.phase === 'paused' && (
                    <>
                        <Pause size={18} />
                        ⏸️ En pause — En attente de reprise
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

                <button className="tarawih-ctrl-btn" onClick={handleResync} title="Re-détecter">
                    <RotateCcw size={18} />
                </button>

                <button className="tarawih-ctrl-btn" onClick={handleNextPairManual} title="Paire suivante">
                    <ChevronRight size={14} /><ChevronRight size={14} style={{ marginLeft: -10 }} />
                </button>
            </div>

            {/* Volume indicator (during detection) */}
            {store.phase === 'detecting' && (
                <div className="tarawih-volume">
                    <Mic size={14} />
                    <div className="tarawih-volume-bar">
                        <div className="tarawih-volume-fill" style={{ width: `${Math.min(100, store.volume * 2)}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
