// ─── Coach Celebration — Modal de milestone ──────────────────
// Confetti CSS, stats, duaa. Pour les grandes étapes.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Star, Share2 } from 'lucide-react';
import type { Intervention } from '../../stores/invisibleCoachStore';
import './CoachCelebration.css';

interface CoachCelebrationProps {
    intervention: Intervention;
    onDismiss: () => void;
}

export function CoachCelebration({ intervention, onDismiss }: CoachCelebrationProps) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);
    const containerRef = useDialogFocus(onDismiss);
    const reducedMotion = useReducedMotion();

    // Generate confetti particles on mount
    useEffect(() => {
        const colors = ['#c9a84c', '#FFD700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96e6a1', '#dda0dd'];
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setParticles(newParticles);
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: intervention.title,
                    text: `${intervention.emoji} ${intervention.title} — ${intervention.message}`,
                });
            } catch { /* user cancelled */ }
        }
    };

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="coach-celebration-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onDismiss}
            >
            <motion.div
                ref={containerRef}
                className="coach-celebration"
                role="dialog" aria-modal="true" aria-labelledby="coach-celebration-title" tabIndex={-1}
                onClick={e => e.stopPropagation()}
                initial={{ scale: reducedMotion ? 1 : 0.96, opacity: 0, y: reducedMotion ? 0 : 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            >
                {/* Confetti */}
                <div className="coach-celebration__confetti">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="confetti-particle"
                            style={{
                                left: `${p.x}%`,
                                animationDelay: `${p.delay}s`,
                                backgroundColor: p.color,
                            }}
                        />
                    ))}
                </div>

                <button aria-label="Fermer les félicitations" className="coach-celebration__close" onClick={onDismiss}>
                    <X size={18} />
                </button>

                <div className="coach-celebration__icon">
                    <span>{intervention.emoji}</span>
                    <Star size={16} className="coach-celebration__star coach-celebration__star--1" />
                    <Star size={12} className="coach-celebration__star coach-celebration__star--2" />
                    <Star size={10} className="coach-celebration__star coach-celebration__star--3" />
                </div>

                <h2 id="coach-celebration-title" className="coach-celebration__title">{intervention.title}</h2>

                <p className="coach-celebration__message">{intervention.message}</p>

                {intervention.messageAr && (
                    <div className="coach-celebration__dua" dir="rtl">
                        {intervention.messageAr}
                    </div>
                )}

                {intervention.source && (
                    <div className="coach-celebration__source">— {intervention.source}</div>
                )}

                <div className="coach-celebration__actions">
                    <button className="coach-celebration__btn" onClick={onDismiss}>
                        Continuer
                    </button>
                    {typeof navigator.share === 'function' && (
                        <button aria-label="Partager cette étape" className="coach-celebration__share" onClick={handleShare}>
                            <Share2 size={16} />
                        </button>
                    )}
                </div>
            </motion.div>
            </motion.div>
        </AnimatePresence>, document.body
    );
}
