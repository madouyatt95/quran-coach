// ─── Coach Nudge — Carte contextuelle (bottom sheet partiel) ─
// Pour les interventions de niveau 'nudge' — plus visuel qu'un whisper.

import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BellOff } from 'lucide-react';
import type { Intervention } from '../../stores/invisibleCoachStore';
import './CoachNudge.css';

interface CoachNudgeProps {
    intervention: Intervention;
    onDismiss: () => void;
    onAction: () => void;
    onSnooze: (minutes: number) => void;
}

export function CoachNudge({ intervention, onDismiss, onAction, onSnooze }: CoachNudgeProps) {
    const navigate = useNavigate();
    const [exiting, setExiting] = useState(false);

    const handleAction = () => {
        if (intervention.action) {
            navigate(intervention.action.route);
        }
        onAction();
    };

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(onDismiss, 300);
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 80) {
            handleDismiss();
        }
    };

    return (
        <AnimatePresence>
            {!exiting && (
                <>
                    <motion.div
                        className="coach-nudge-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                    />
                    <motion.div
                        className="coach-nudge"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 200 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="coach-nudge__handle" />

                        <div className="coach-nudge__header">
                            <div className="coach-nudge__badge">
                                <span className="coach-nudge__emoji">{intervention.emoji}</span>
                                <span className="coach-nudge__title">{intervention.title}</span>
                            </div>
                            <button className="coach-nudge__close" onClick={handleDismiss}>
                                <X size={18} />
                            </button>
                        </div>

                        {intervention.messageAr && (
                            <div className="coach-nudge__arabic" dir="rtl">
                                {intervention.messageAr}
                            </div>
                        )}

                        <div className="coach-nudge__message">
                            {intervention.message}
                        </div>

                        {intervention.source && (
                            <div className="coach-nudge__source">
                                — {intervention.source}
                            </div>
                        )}

                        <div className="coach-nudge__actions">
                            {intervention.action && (
                                <button className="coach-nudge__btn coach-nudge__btn--primary" onClick={handleAction}>
                                    {intervention.action.label}
                                </button>
                            )}
                            <button className="coach-nudge__btn coach-nudge__btn--snooze" onClick={() => onSnooze(30)}>
                                <BellOff size={14} />
                                <span>Plus tard</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
