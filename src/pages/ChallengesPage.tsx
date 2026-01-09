import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Plus,
    Check,
    Trash2,
    Calendar,
    ChevronRight
} from 'lucide-react';
import {
    useChallengesStore,
    READING_TEMPLATES,
    type ReadingChallengeTemplate,
    type ActiveReadingChallenge
} from '../stores/challengesStore';
import './ChallengesPage.css';

// Helper to check if today is the challenge day
function isChallengeDay(challenge: ActiveReadingChallenge): boolean {
    if (challenge.frequency === 'daily') return true;
    if (challenge.frequency === 'weekly') {
        const today = new Date().getDay();
        return today === challenge.frequencyDay;
    }
    return true;
}

// Calculate progress percentage
function getProgressPercent(challenge: ActiveReadingChallenge): number {
    if (challenge.type === 'khatm') {
        return Math.round((challenge.progress / 604) * 100);
    }
    if (challenge.duration > 0) {
        return Math.round((challenge.completedDates.length / challenge.duration) * 100);
    }
    return 100; // Ongoing challenges are always "on track"
}

export function ChallengesPage() {
    const navigate = useNavigate();
    const {
        activeReadingChallenges,
        startReadingChallenge,
        markReadingChallengeComplete,
        removeReadingChallenge,
        getTodayReading
    } = useChallengesStore();

    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ReadingChallengeTemplate | null>(null);

    // Check if today's reading is done for a challenge
    const isTodayComplete = (challenge: ActiveReadingChallenge) => {
        const today = new Date().toISOString().split('T')[0];
        return challenge.completedDates.includes(today);
    };

    // Start a new challenge from template
    const handleStartChallenge = (template: ReadingChallengeTemplate) => {
        startReadingChallenge(template);
        setSelectedTemplate(null);
        setShowTemplates(false);
    };

    // Navigate to reading page for a khatm challenge
    const goToReading = (challengeId: string) => {
        const reading = getTodayReading(challengeId);
        if (reading) {
            // Could navigate to specific page, for now just go to read
            navigate('/read');
        }
    };

    return (
        <div className="challenges-page">
            {/* Header */}
            <div className="challenges-header">
                <button className="challenges-back" onClick={() => navigate(-1)}>
                    <ArrowRight size={24} />
                </button>
                <h1>🏆 Mes Défis</h1>
            </div>

            {/* Active Challenges */}
            <section className="challenges-section">
                <h2>Défis en cours</h2>

                {activeReadingChallenges.length === 0 ? (
                    <div className="challenges-empty">
                        <p>Aucun défi actif</p>
                        <button onClick={() => setShowTemplates(true)}>
                            <Plus size={16} />
                            Commencer un défi
                        </button>
                    </div>
                ) : (
                    <div className="challenges-list">
                        {activeReadingChallenges.map(challenge => {
                            const percent = getProgressPercent(challenge);
                            const todayReading = getTodayReading(challenge.id);
                            const isToday = isChallengeDay(challenge);
                            const done = isTodayComplete(challenge);

                            return (
                                <div
                                    key={challenge.id}
                                    className="challenge-card"
                                    style={{ borderColor: challenge.color }}
                                >
                                    <div className="challenge-card-header">
                                        <span className="challenge-icon">{challenge.icon}</span>
                                        <div className="challenge-info">
                                            <h3>{challenge.name}</h3>
                                            <span className="challenge-arabic">{challenge.nameArabic}</span>
                                        </div>
                                        <button
                                            className="challenge-delete"
                                            onClick={() => removeReadingChallenge(challenge.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="challenge-progress">
                                        <div className="challenge-progress-bar">
                                            <div
                                                className="challenge-progress-fill"
                                                style={{
                                                    width: `${percent}%`,
                                                    backgroundColor: challenge.color
                                                }}
                                            />
                                        </div>
                                        <span className="challenge-progress-text">
                                            {challenge.type === 'khatm'
                                                ? `${challenge.progress}/604 pages`
                                                : `Jour ${challenge.completedDates.length}${challenge.duration ? `/${challenge.duration}` : ''}`
                                            }
                                        </span>
                                    </div>

                                    {/* Today's Reading (for khatm) */}
                                    {todayReading && isToday && (
                                        <div className="challenge-today">
                                            <Calendar size={14} />
                                            <span>Aujourd'hui: Pages {todayReading.start}-{todayReading.end}</span>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div className="challenge-actions">
                                        {done ? (
                                            <button className="challenge-btn challenge-btn--done" disabled>
                                                <Check size={16} />
                                                Terminé aujourd'hui
                                            </button>
                                        ) : isToday ? (
                                            <>
                                                {challenge.type === 'khatm' && (
                                                    <button
                                                        className="challenge-btn challenge-btn--read"
                                                        onClick={() => goToReading(challenge.id)}
                                                    >
                                                        Lire
                                                        <ChevronRight size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="challenge-btn challenge-btn--complete"
                                                    style={{ backgroundColor: challenge.color }}
                                                    onClick={() => markReadingChallengeComplete(challenge.id)}
                                                >
                                                    <Check size={16} />
                                                    Marquer fait
                                                </button>
                                            </>
                                        ) : (
                                            <span className="challenge-next-day">
                                                {challenge.frequency === 'weekly' && 'Prochain: Vendredi'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Templates Catalog */}
            <section className="challenges-section">
                <div className="challenges-section-header">
                    <h2>📚 Défis disponibles</h2>
                    <button
                        className="challenges-toggle"
                        onClick={() => setShowTemplates(!showTemplates)}
                    >
                        {showTemplates ? 'Masquer' : 'Voir tout'}
                    </button>
                </div>

                {showTemplates && (
                    <div className="templates-grid">
                        {READING_TEMPLATES.map(template => {
                            const isActive = activeReadingChallenges.some(
                                c => c.templateId === template.id
                            );

                            return (
                                <button
                                    key={template.id}
                                    className={`template-card ${isActive ? 'active' : ''}`}
                                    style={{ borderColor: template.color }}
                                    onClick={() => !isActive && setSelectedTemplate(template)}
                                    disabled={isActive}
                                >
                                    <span className="template-icon">{template.icon}</span>
                                    <span className="template-name">{template.name}</span>
                                    <span className="template-arabic">{template.nameArabic}</span>
                                    {isActive && <span className="template-badge">Actif</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Template Detail Modal */}
            {selectedTemplate && (
                <div className="template-modal-overlay" onClick={() => setSelectedTemplate(null)}>
                    <div className="template-modal" onClick={e => e.stopPropagation()}>
                        <span className="template-modal-icon">{selectedTemplate.icon}</span>
                        <h3>{selectedTemplate.name}</h3>
                        <p className="template-modal-arabic">{selectedTemplate.nameArabic}</p>
                        <p className="template-modal-desc">{selectedTemplate.description}</p>

                        <div className="template-modal-details">
                            <span>
                                📅 {selectedTemplate.frequency === 'daily'
                                    ? 'Chaque jour'
                                    : selectedTemplate.frequency === 'weekly'
                                        ? 'Chaque vendredi'
                                        : 'Après chaque prière'}
                            </span>
                            {selectedTemplate.duration > 0 && (
                                <span>⏱️ {selectedTemplate.duration} jours</span>
                            )}
                        </div>

                        <div className="template-modal-actions">
                            <button
                                className="template-modal-cancel"
                                onClick={() => setSelectedTemplate(null)}
                            >
                                Annuler
                            </button>
                            <button
                                className="template-modal-start"
                                style={{ backgroundColor: selectedTemplate.color }}
                                onClick={() => handleStartChallenge(selectedTemplate)}
                            >
                                <Plus size={16} />
                                Commencer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
