import { useNavigate } from 'react-router-dom';
import { useSmartStore } from '../stores/smartStore';
import { useInvisibleCoachStore } from '../stores/invisibleCoachStore';
import { useTranslation } from 'react-i18next';
import {
    ShieldCheck, CloudRain, Sun, Map, History, Heart, Moon, Zap, BookOpen,
    ArrowLeft, Info, Eye, Bell, Brain, BookOpenCheck, Target, MessageCircle,
    Clock, Award, Lightbulb, Swords
} from 'lucide-react';
import './SentinellePage.css';

export function SentinellePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const smart = useSmartStore();
    const coach = useInvisibleCoachStore();


    return (
        <div className="sentinel-page">
            <header className="sentinel-page__header">
                <button className="sentinel-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>{t('sentinel.title', 'Sentinelle Spirituelle')}</h1>
            </header>

            <section className="sentinel-hero">
                <div className="sentinel-hero__icon" onClick={() => smart.setDebugForceWeather(!smart.debugForceWeather)}>
                    <ShieldCheck size={48} color={smart.debugForceWeather ? "#4facfe" : "#c9a84c"} />
                </div>
                <h2>{t('sentinel.subtitle', 'Votre Compagnon de Route')}</h2>
                <p>{t('sentinel.description', "La Sentinelle veille sur les moments propices aux invocations et s'adapte à votre environnement en temps réel.")}</p>

                <div className="sentinel-master-toggle">
                    <span>{t('sentinel.enable', 'Activer la Sentinelle')}</span>
                    <button
                        className={`toggle ${smart.globalEnabled ? 'active' : ''}`}
                        onClick={() => smart.setGlobalEnabled(!smart.globalEnabled)}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                {smart.debugForceWeather && (
                    <div style={{ marginTop: '1rem', background: 'rgba(79, 172, 254, 0.2)', padding: '8px 16px', borderRadius: '8px', color: '#4facfe', fontSize: '0.85rem' }}>
                        🌧️ Mode Test Météo Activé
                    </div>
                )}
            </section>

            {smart.globalEnabled && (
                <div className="sentinel-options-grid">
                    {/* Météo */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <CloudRain size={20} />
                                <span>{t('sentinel.weather', 'Météo & Invocations')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.weatherEnabled ? 'active' : ''}`}
                                onClick={() => smart.setWeatherEnabled(!smart.weatherEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.weatherDesc', 'Déclenche les invocations spécifiques lors de pluie, orages ou vents violents.')}</p>
                    </div>

                    {/* Jours Blancs */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Moon size={20} />
                                <span>{t('sentinel.whiteDays', 'Jours Blancs')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.whiteDaysEnabled ? 'active' : ''}`}
                                onClick={() => smart.setWhiteDaysEnabled(!smart.whiteDaysEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.whiteDaysDesc', 'Rappels les 13, 14 et 15 de chaque mois lunaire pour le jeûne surérogatoire.')}</p>
                    </div>

                    {/* Booster Fajr */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Zap size={20} />
                                <span>{t('sentinel.fajrBooster', 'Booster du Fajr')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.fajrBoosterEnabled ? 'active' : ''}`}
                                onClick={() => smart.setFajrBoosterEnabled(!smart.fajrBoosterEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.fajrBoosterDesc', "Invocations et motivations après la prière de l'aube pour une journée bénie.")}</p>
                    </div>

                    {/* Al Kahf */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <BookOpen size={20} />
                                <span>{t('sentinel.alKahf', 'Compteur Al-Kahf')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.alKahfEnabled ? 'active' : ''}`}
                                onClick={() => smart.setAlKahfEnabled(!smart.alKahfEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.alKahfDesc', 'Suivi spécifique et rappels le vendredi pour la lecture de la sourate de la Caverne.')}</p>
                    </div>

                    {/* Parenté */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Heart size={20} />
                                <span>{t('sentinel.kinship', 'Lien de Parenté')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.kinshipEnabled ? 'active' : ''}`}
                                onClick={() => smart.setKinshipEnabled(!smart.kinshipEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.kinshipDesc', 'Rappel le vendredi après-midi pour prendre des nouvelles de vos proches.')}</p>
                    </div>

                    {/* Histoire */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <History size={20} />
                                <span>{t('sentinel.history', 'Mode Histoire')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.historyEnabled ? 'active' : ''}`}
                                onClick={() => smart.setHistoryEnabled(!smart.historyEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.historyDesc', 'Éphémérides et événements historiques marquants liés au calendrier hégirien.')}</p>
                    </div>

                    {/* Voyage */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Map size={20} />
                                <span>{t('sentinel.travel', 'Mode Voyage')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.travelEnabled ? 'active' : ''}`}
                                onClick={() => smart.setTravelEnabled(!smart.travelEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.travelDesc', 'Détecte vos trajets significatifs et suggère les invocations du voyageur.')}</p>
                    </div>

                    {/* Sahar */}
                    <div className="sentinel-card">
                        <div className="sentinel-card__header">
                            <div className="sentinel-card__title">
                                <Sun size={20} />
                                <span>{t('sentinel.sahar', 'Moment Sahar')}</span>
                            </div>
                            <button
                                className={`toggle sm ${smart.saharEnabled ? 'active' : ''}`}
                                onClick={() => smart.setSaharEnabled(!smart.saharEnabled)}
                            >
                                <span className="toggle__knob" />
                            </button>
                        </div>
                        <p>{t('sentinel.saharDesc', "Rappels précieux dans le dernier tiers de la nuit pour l'Istighfar et le Qiyam.")}</p>
                    </div>
                </div>
            )}

            <footer className="sentinel-footer">
                <div className="sentinel-info-block">
                    <Info size={16} />
                    <span>{t('sentinel.gpsInfo', "Certains modes utilisent votre position GPS de manière respectueuse pour s'activer.")}</span>
                </div>
            </footer>

            {/* ── Coach Invisible Section ── */}
            <section className="sentinel-hero" style={{ marginTop: '24px' }}>
                <div className="sentinel-hero__icon">
                    <Eye size={48} color="#4ecdc4" />
                </div>
                <h2>Coach Invisible</h2>
                <p>Un compagnon discret qui intervient au bon moment selon ton comportement de lecture.</p>

                <div className="sentinel-master-toggle">
                    <span>Activer le Coach</span>
                    <button
                        className={`toggle ${coach.enabled ? 'active' : ''}`}
                        onClick={() => coach.setEnabled(!coach.enabled)}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                <div className="sentinel-master-toggle" style={{ marginTop: '8px' }}>
                    <span><Bell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Notifications push</span>
                    <button
                        className={`toggle ${coach.notificationsEnabled ? 'active' : ''}`}
                        onClick={() => coach.setNotificationsEnabled(!coach.notificationsEnabled)}
                    >
                        <span className="toggle__knob" />
                    </button>
                </div>

                {coach.totalShown > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        {coach.totalShown} interventions · {coach.totalActioned} actions · Réceptivité : {coach.receptivityScore}%
                    </div>
                )}
            </section>

            {coach.enabled && (
                <div className="sentinel-options-grid">
                    {[
                        { key: 'verse_emotion', icon: MessageCircle, label: 'Versets émotionnels', desc: 'Réflexions sur les versets de miséricorde, patience, etc.' },
                        { key: 'hadith_link', icon: Swords, label: 'Liens Coran ↔ Sunna', desc: 'Hadith authentique lié au verset que tu lis.' },
                        { key: 'surah_complete', icon: Award, label: 'Fin de sourate', desc: 'Célébration quand tu termines une sourate.' },
                        { key: 'milestone', icon: Target, label: 'Milestones', desc: 'Célébrations pour les grandes étapes (50, 100 pages...).' },
                        { key: 'streak_danger', icon: Clock, label: 'Série en danger', desc: 'Alerte quand ta série de lecture est menacée.' },
                        { key: 'comeback', icon: Heart, label: 'Message de retour', desc: 'Message d\'encouragement après une absence.' },
                        { key: 'prayer_prep', icon: Moon, label: 'Préparation prière', desc: 'Sourate recommandée avant chaque prière.' },
                        { key: 'long_reading', icon: BookOpenCheck, label: 'Pause méditation', desc: 'Invitation à méditer après 15 min de lecture.' },
                        { key: 'page_reread', icon: Brain, label: 'Suggestion mémorisation', desc: 'Propose le Hifdh si tu relis souvent la même page.' },
                        { key: 'quiz_weak', icon: Lightbulb, label: 'Après un quiz', desc: 'Suggestions de révision après un score faible.' },
                        { key: 'fahm_push', icon: Eye, label: 'Vers la compréhension', desc: 'Propose le panneau Fahm sur les versets riches.' },
                    ].map(item => {
                        const Icon = item.icon;
                        const enabled = coach.enabledTriggers[item.key] !== false;
                        return (
                            <div className="sentinel-card" key={item.key}>
                                <div className="sentinel-card__header">
                                    <div className="sentinel-card__title">
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </div>
                                    <button
                                        className={`toggle sm ${enabled ? 'active' : ''}`}
                                        onClick={() => coach.setTriggerEnabled(item.key, !enabled)}
                                    >
                                        <span className="toggle__knob" />
                                    </button>
                                </div>
                                <p>{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
