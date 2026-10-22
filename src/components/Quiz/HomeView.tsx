import {GAME_CATALOG} from '../../data/quizGames';
import {useQuizGamesStore} from '../../stores/quizGamesStore';
import './Games/QuizGames.css';
import {QUIZ_ACTIVITIES} from '../../lib/quizLaunch';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../stores/quizStore';
import { useQuizLearningStore } from '../../stores/quizLearningStore';
import { buildLearningSession, learningCandidates } from '../../lib/quizLearning';
import { QUIZ_THEMES, DIFFICULTY_CONFIG, type QuizDifficulty } from '../../data/quizTypes';

export function HomeView() {
    const q = useQuizStore();
    const games = useQuizGamesStore(s=>s.games);
    const study = useQuizLearningStore();
    const navigate = useNavigate();
    const recentStudy = study.session && (study.session.startedAt || 0) > (q.lastGame?.at || 0);
    const hasSession = study.session && !study.session.finished;
    const daily = () => {
        if (!hasSession) {
            study.start('Ma séance du jour', buildLearningSession({ recalls: study.recalls, count: 8 }), 'learn', [], {
                poolIds: learningCandidates({ recalls: study.recalls }).map(question => question.id),
            });
        }
        q.setView('study');
    };
    const modes = [
        { icon: '🎯', title: 'Quiz solo', description: 'Choisir un thème', action: q.startSolo },
        { icon: '⚔️', title: 'Duel', description: 'Sur un téléphone ou en ligne', action: () => q.setView('duel-choice') },
        { icon: '⚡', title: 'Sprint', description: '60 secondes pour jouer', action: q.startSprint },
        { icon: '🎧', title: 'Quiz audio', description: 'Reconnaître une sourate', action: q.startAudio },
        { icon: '📅', title: 'Défi du jour', description: '10 questions communes', action: () => q.setView('daily') },
        { icon: '🗺️', title: 'Parcours Sira', description: 'Avancer étape par étape', action: () => q.setView('sira-map') },
    ];

    return (
        <main className="quiz-container qx qx-home">
            <header className="qx-header qx-home-header">
                <button aria-label="Retour" onClick={() => navigate(-1)}>←</button>
                <h1>Quiz & défis</h1>
            </header>

            <section aria-labelledby="quiz-modes-title">
                <h2 id="quiz-modes-title">À quoi veux-tu jouer ?</h2>
                <div className="qx-mode-grid">
                    {modes.map(mode => (
                        <button key={mode.title} onClick={mode.action}>
                            <span className="qx-mode-icon" aria-hidden="true">{mode.icon}</span>
                            <strong>{mode.title}</strong>
                            <small>{mode.description}</small>
                        </button>
                    ))}
                </div>
                <div className="qx-row qx-duel-links">
                    <button onClick={() => q.setView('join')}>🔑 Rejoindre avec un code</button>
                    <button onClick={() => q.setView('custom-duel')}>🎓 Duel sur mesure</button>
                </div>
            </section>

            {(hasSession || recentStudy || q.lastGame) && <section className="qx-last-game" aria-label="Ma dernière partie">
                {hasSession ? <><span>En pause : {study.session!.title}</span><button onClick={()=>q.setView('study')}>Continuer →</button></>
                    : recentStudy ? <><span>Dernière partie : {study.session!.title}</span><button onClick={()=>{const s=study.session!;study.start(s.title,[...new Map(s.questions.map(item=>[item.id,item])).values()],s.mode,s.names,{adaptive:s.adaptive,poolIds:s.poolIds,returnTo:s.returnTo});q.setView('study');}}>Rejouer →</button></>
                    : <><span>Dernière partie : {{solo:'Quiz solo',audio:'Quiz audio',sprint:'Sprint',daily:'Défi du jour',sira:'Parcours Sira',revision:'Révision',duel:'Duel'}[q.lastGame!.kind]}</span><button onClick={q.replayLast}>Rejouer →</button></>}
            </section>}

            <section className="qx-card qx-progress-links" aria-labelledby="quiz-progress-title">
                <div className="qx-section-heading">
                    <h2 id="quiz-progress-title">Ma progression</h2>
                    <span>Niveau {q.level} · {q.totalXP} XP</span>
                </div>
                <div className="qx-progress-grid">
                    {([
                        ['stats', '📊', 'Statistiques'],
                        ['badges', '🏅', 'Badges'],
                        ['leaderboard', '🏆', 'Classement'],
                        ['history', '📜', 'Historique'],
                        ['profile', '👤', 'Profil'],
                        ['error-review', '↻', `Mes erreurs (${q.wrongQuestions.length})`],
                    ] as const).map(([view, icon, label]) => (
                        <button key={view} onClick={() => q.setView(view)}><span aria-hidden="true">{icon}</span>{label}</button>
                    ))}
                </div>
                <p className="qx-muted">Les niveaux représentent ton expérience dans le jeu.</p>
            </section>

            <section className="qx-hero qx-daily-compact" aria-labelledby="quiz-session-title">
                <div>
                    <h2 id="quiz-session-title">{hasSession ? 'Reprends ta séance' : 'Ta séance du jour'}</h2>
                    <p>5 minutes pour découvrir, comprendre et retenir.</p>
                    <small>{study.completed} séance{study.completed > 1 ? 's' : ''} terminée{study.completed > 1 ? 's' : ''}</small>
                </div>
                <button className="qx-primary" onClick={daily}>{hasSession ? 'Reprendre' : 'C’est parti'} →</button>
            </section>

            <section aria-labelledby="quiz-games-title"><h2 id="quiz-games-title">Jouer autrement</h2><div className="qx-game-grid">{GAME_CATALOG.map(game=><button key={game.id} onClick={()=>navigate(`/quiz?game=${game.id}`)}><span aria-hidden="true">{game.icon}</span><strong>{game.title}</strong><small>{game.description}</small><em>{games[game.id]&&!games[game.id]?.finished?'▶ Partie en cours':game.tag}</em></button>)}</div></section>
            <section aria-labelledby="quiz-formats-title"><h2 id="quiz-formats-title">Une autre façon de jouer</h2><div className="qx-activity-grid">{QUIZ_ACTIVITIES.map(activity=><button key={activity.id} onClick={()=>navigate(`/quiz?exercise=${activity.id}`)}><span aria-hidden="true">{activity.icon}</span><strong>{activity.title}</strong><small>{activity.description}</small></button>)}</div></section>
            <section aria-labelledby="quiz-learn-title">
                <h2 id="quiz-learn-title">Apprendre à mon rythme</h2>
                <button className="qx-card qx-launch" onClick={() => q.setView('studio')}>
                    📚 <span><strong>Composer ma séance</strong><small>Mes lectures · niveaux · formats variés</small></span><b aria-hidden="true">→</b>
                </button>
                <button className="qx-card qx-launch" onClick={() => q.setView('investigations')}>
                    🧭 <span><strong>Les enquêtes du savoir</strong><small>Observer, trouver l’indice, justifier</small></span><b aria-hidden="true">→</b>
                </button>
                <button className="qx-card qx-launch" onClick={() => q.setView('studio')}>
                    📱 <span><strong>Un téléphone, plusieurs joueurs</strong><small>À tour de rôle ou objectif commun</small></span><b aria-hidden="true">→</b>
                </button>
                <p className="qx-muted">À la fin d’une séance, partage les mêmes questions par lien.</p>
            </section>

            <section aria-labelledby="quiz-themes-title">
                <h2 id="quiz-themes-title">Explorer un thème</h2>
                <div className="qx-themes">{QUIZ_THEMES.map(theme => (
                    <button key={theme.id} onClick={() => q.selectTheme(theme.id)}>
                        <span aria-hidden="true">{theme.emoji}</span><strong>{theme.name}</strong><small>Défi rapide</small>
                    </button>
                ))}</div>
                <details className="qx-card">
                    <summary>Réglages du défi chronométré · {DIFFICULTY_CONFIG[q.difficulty].label}</summary>
                    <div className="qx-tabs">{(Object.keys(DIFFICULTY_CONFIG) as QuizDifficulty[]).map(difficulty => (
                        <button key={difficulty} aria-pressed={q.difficulty === difficulty} onClick={() => q.setDifficulty(difficulty)}>
                            {DIFFICULTY_CONFIG[difficulty].label} · {DIFFICULTY_CONFIG[difficulty].timerSeconds}s
                        </button>
                    ))}</div>
                </details>
            </section>
        </main>
    );
}
