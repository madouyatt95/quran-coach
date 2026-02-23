import { useNavigate } from 'react-router-dom';
import { useSmartStore } from '../stores/smartStore';
import {
    ShieldCheck, CloudRain, Sun, Map, History, Heart, Moon, Zap, BookOpen,
    ArrowLeft, Info
} from 'lucide-react';
import './SentinellePage.css';

export function SentinellePage() {
    const navigate = useNavigate();
    const smart = useSmartStore();


    return (
        <div className="sentinel-page">
            <header className="sentinel-page__header">
                <button className="sentinel-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Sentinelle Spirituelle</h1>
            </header>

            <section className="sentinel-hero">
                <div className="sentinel-hero__icon">
                    <ShieldCheck size={48} color="#c9a84c" />
                </div>
                <h2>Votre Compagnon de Route</h2>
                <p>La Sentinelle veille sur les moments propices aux invocations et s'adapte à votre environnement en temps réel.</p>

                <div className="sentinel-master-toggle">
                    <span>Activer la Sentinelle</span>
                    <button
                        className={`toggle ${smart.globalEnabled ? 'active' : ''}`}
                        onClick={() => smart.setGlobalEnabled(!smart.globalEnabled)}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>
            </section>

            {smart.globalEnabled && (
                <div className="sentinel-options-grid">
                    {/* Météo */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <CloudRain size={20} />
                                <span>Météo & Invocations</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.weatherEnabled ? 'active' : ''}`}
                                onClick={() => smart.setWeatherEnabled(!smart.weatherEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Déclenche les invocations spécifiques lors de pluie, orages ou vents violents.</p>
                    </div>

                    {/* Jours Blancs */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Moon size={20} />
                                <span>Jours Blancs</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.whiteDaysEnabled ? 'active' : ''}`}
                                onClick={() => smart.setWhiteDaysEnabled(!smart.whiteDaysEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Rappels les 13, 14 et 15 de chaque mois lunaire pour le jeûne surérogatoire.</p>
                    </div>

                    {/* Booster Fajr */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Zap size={20} />
                                <span>Booster du Fajr</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.fajrBoosterEnabled ? 'active' : ''}`}
                                onClick={() => smart.setFajrBoosterEnabled(!smart.fajrBoosterEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Invocations et motivations après la prière de l'aube pour une journée bénie.</p>
                    </div>

                    {/* Al Kahf */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <BookOpen size={20} />
                                <span>Compteur Al-Kahf</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.alKahfEnabled ? 'active' : ''}`}
                                onClick={() => smart.setAlKahfEnabled(!smart.alKahfEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Suivi spécifique et rappels le vendredi pour la lecture de la sourate de la Caverne.</p>
                    </div>

                    {/* Parenté */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Heart size={20} />
                                <span>Lien de Parenté</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.kinshipEnabled ? 'active' : ''}`}
                                onClick={() => smart.setKinshipEnabled(!smart.kinshipEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Rappel le vendredi après-midi pour prendre des nouvelles de vos proches.</p>
                    </div>

                    {/* Histoire */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <History size={20} />
                                <span>Mode Histoire</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.historyEnabled ? 'active' : ''}`}
                                onClick={() => smart.setHistoryEnabled(!smart.historyEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Éphémérides et événements historiques marquants liés au calendrier hégirien.</p>
                    </div>

                    {/* Voyage */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Map size={20} />
                                <span>Mode Voyage</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.travelEnabled ? 'active' : ''}`}
                                onClick={() => smart.setTravelEnabled(!smart.travelEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Détecte vos trajets significatifs et suggère les invocations du voyageur.</p>
                    </div>

                    {/* Sahar */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Sun size={20} />
                                <span>Moment Sahar</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.saharEnabled ? 'active' : ''}`}
                                onClick={() => smart.setSaharEnabled(!smart.saharEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>Rappels précieux dans le dernier tiers de la nuit pour l'Istighfar et le Qiyam.</p>
                    </div>
                </div>
            )}

            <footer className="sentinel-footer">
                <div className="sentinel-info-block">
                    <Info size={16} />
                    <span>Certains modes utilisent votre position GPS de manière respectueuse pour s'activer.</span>
                </div>
            </footer>
        </div>
    );
}
