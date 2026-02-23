import { Star, Lock, Play } from 'lucide-react';
import { useQuizStore } from '../../stores/quizStore';

export function SiraMapView() {
    const { siraLevels, siraProgression, setView, startSiraLevel } = useQuizStore();

    return (
        <div className="sira-map-container">
            <header className="sira-map-header">
                <button className="quiz-back-btn" onClick={() => setView('home')}>←</button>
                <h1>Parcours de la Sira</h1>
                <p>Retracez la vie du Messager ﷺ</p>
            </header>

            <div className="sira-path">
                {siraLevels.map((level, index) => {
                    const stats = siraProgression[level.id] || { completed: false, stars: 0 };
                    const isUnlocked = index === 0 || siraProgression[siraLevels[index - 1].id]?.completed;

                    return (
                        <div key={level.id} className={`sira-node-wrapper ${index % 2 === 0 ? 'left' : 'right'}`}>
                            <div className={`sira-node ${isUnlocked ? 'unlocked' : 'locked'} ${stats.completed ? 'completed' : ''}`}
                                onClick={() => isUnlocked && startSiraLevel(level)}>
                                <div className="sira-node-icon">
                                    {isUnlocked ? (stats.completed ? <Star className="star-filled" /> : <Play />) : <Lock />}
                                </div>
                                <div className="sira-node-content">
                                    <span className="sira-node-order">Étape {level.order}</span>
                                    <h3>{level.title}</h3>
                                    <span className="sira-node-year">{level.year} • {level.location}</span>
                                </div>
                            </div>
                            {index < siraLevels.length - 1 && (
                                <div className={`sira-connector ${isUnlocked && stats.completed ? 'active' : ''}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
