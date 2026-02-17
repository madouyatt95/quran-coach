import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Quote, BookOpen, Sparkles } from 'lucide-react';
import { THEMATIC_PATHS } from '../data/thematicPaths';
import './ThematicPathPage.css';

export function ThematicPathPage() {
    const { pathId } = useParams<{ pathId: string }>();
    const navigate = useNavigate();
    const path = THEMATIC_PATHS[pathId || ''] || THEMATIC_PATHS['serenity'];

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const currentStep = path.steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / path.steps.length) * 100;

    const handleNext = () => {
        if (currentStepIndex < path.steps.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStepIndex(prev => prev + 1);
                setIsTransitioning(false);
            }, 400);
        } else {
            navigate('/');
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStepIndex(prev => prev - 1);
                setIsTransitioning(false);
            }, 400);
        }
    };

    return (
        <div className="immersion-page" style={{ '--path-gradient': path.gradient } as any}>
            <div className="immersion-bg" style={{ backgroundImage: `url(${path.image})` }} />
            <div className="immersion-overlay" />

            <header className="immersion-header">
                <div className="immersion-header__left">
                    <span className="immersion-emoji">{path.emoji}</span>
                    <span className="immersion-title">{path.title}</span>
                </div>
                <button className="immersion-close" onClick={() => navigate('/')}>
                    <X size={24} />
                </button>
            </header>

            <div className="immersion-progress">
                <div className="immersion-progress__bar" style={{ width: `${progress}%` }} />
            </div>

            <main className={`immersion-content ${isTransitioning ? 'is-leaving' : 'is-entering'}`}>
                {currentStep.type === 'REFLECTION' && (
                    <div className="step-reflection">
                        <Sparkles className="step-icon" size={40} />
                        <p className="step-text">{currentStep.text}</p>
                    </div>
                )}

                {currentStep.type === 'VERSE' && (
                    <div className="step-verse">
                        <Quote className="step-icon step-icon--quote" size={32} />
                        <div className="arabic-text">{currentStep.textAr}</div>
                        <p className="step-text">{currentStep.text}</p>
                        {currentStep.reference && <div className="step-ref">Coran, {currentStep.reference}</div>}
                    </div>
                )}

                {currentStep.type === 'HADITH' && (
                    <div className="step-hadith">
                        <BookOpen className="step-icon" size={32} />
                        <p className="step-text">{currentStep.text}</p>
                        <div className="step-meta">
                            <strong>Rapporté par {currentStep.narrator}</strong>
                            <span>Source: {currentStep.source}</span>
                        </div>
                    </div>
                )}

                {currentStep.type === 'DUA' && (
                    <div className="step-dua">
                        <div className="arabic-text arabic-text--dua">{currentStep.textAr}</div>
                        <p className="step-text">{currentStep.text}</p>
                        <div className="step-badge">Invocation</div>
                    </div>
                )}
            </main>

            <footer className="immersion-footer">
                <button
                    className={`immersion-nav-btn ${currentStepIndex === 0 ? 'is-hidden' : ''}`}
                    onClick={handlePrev}
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="immersion-step-count">
                    {currentStepIndex + 1} / {path.steps.length}
                </div>

                <button className="immersion-nav-btn immersion-nav-btn--primary" onClick={handleNext}>
                    {currentStepIndex === path.steps.length - 1 ? 'Terminer' : <ChevronRight size={24} />}
                </button>
            </footer>
        </div>
    );
}
