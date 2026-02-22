/**
 * ExamResultOverlay — Displays the AI Exam results as a full-screen modal.
 * Shows overall score, word-level diff with inline highlighting, and Makharij alerts.
 */

import React from 'react';
import { X, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ExamResult } from '../../lib/deepSpeechService';

interface ExamResultOverlayProps {
    result: ExamResult;
    onRetry: () => void;
    onClose: () => void;
}

export const ExamResultOverlay: React.FC<ExamResultOverlayProps> = ({ result, onRetry, onClose }) => {
    const { accuracy, words, makharijAlerts, totalExpected, totalCorrect } = result;

    const scoreColor = accuracy >= 90 ? '#4CAF50' : accuracy >= 70 ? '#FF9800' : '#f44336';
    const scoreLabel = accuracy >= 90 ? 'Excellent !' : accuracy >= 70 ? 'Bon effort' : 'À travailler';

    return (
        <>
            <div className="exam-overlay-backdrop" onClick={onClose} />
            <div className="exam-overlay">
                {/* Header */}
                <div className="exam-overlay__header">
                    <h2 className="exam-overlay__title">Résultat de l'Examen</h2>
                    <button className="exam-overlay__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Score Card */}
                <div className="exam-score-card" style={{ borderColor: scoreColor }}>
                    <div className="exam-score-card__circle" style={{ background: scoreColor }}>
                        <span className="exam-score-card__value">{accuracy}%</span>
                    </div>
                    <div className="exam-score-card__info">
                        <span className="exam-score-card__label" style={{ color: scoreColor }}>{scoreLabel}</span>
                        <span className="exam-score-card__detail">
                            {totalCorrect} / {totalExpected} mots corrects
                        </span>
                    </div>
                </div>

                {/* Word-level Diff */}
                <div className="exam-diff-section">
                    <h3 className="exam-section-title">Détail mot par mot</h3>
                    <div className="exam-diff-grid" dir="rtl">
                        {words.map((w, i) => (
                            <span
                                key={i}
                                className={`exam-diff-word exam-diff-word--${w.state}`}
                                title={
                                    w.state === 'correct' ? 'Correct ✓' :
                                        w.state === 'missing' ? 'Mot oublié' :
                                            `Prononcé : ${w.spoken || '?'}`
                                }
                            >
                                {w.expected}
                                {w.state === 'correct' && <CheckCircle size={10} className="exam-diff-icon--correct" />}
                                {w.state === 'wrong' && w.spoken && (
                                    <span className="exam-diff-spoken">({w.spoken})</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Makharij Alerts */}
                {makharijAlerts.length > 0 && (
                    <div className="exam-makharij-section">
                        <h3 className="exam-section-title">
                            <AlertTriangle size={16} /> Alertes Makharij
                        </h3>
                        <div className="exam-makharij-list">
                            {makharijAlerts.map((alert, i) => (
                                <div key={i} className="exam-makharij-card">
                                    <div className="exam-makharij-card__letters">
                                        <span className="exam-makharij-card__wrong">{alert.spoken}</span>
                                        <span className="exam-makharij-card__arrow">→</span>
                                        <span className="exam-makharij-card__correct">{alert.expected}</span>
                                        <span className="exam-makharij-card__count">×{alert.count}</span>
                                    </div>
                                    <p className="exam-makharij-card__tip">{alert.tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="exam-overlay__actions">
                    <button className="exam-action-btn exam-action-btn--retry" onClick={onRetry}>
                        <RotateCcw size={18} /> Réessayer
                    </button>
                    <button className="exam-action-btn exam-action-btn--close" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </>
    );
};
