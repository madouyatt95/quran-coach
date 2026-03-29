// ─── Coach Whisper — Toast discret en bas de l'écran ─────────
// S'auto-dismiss après 6 secondes. Swipe-down = dismiss.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import type { Intervention } from '../../stores/invisibleCoachStore';
import './CoachWhisper.css';

interface CoachWhisperProps {
    intervention: Intervention;
    onDismiss: () => void;
    onAction: () => void;
}

export function CoachWhisper({ intervention, onDismiss, onAction }: CoachWhisperProps) {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(true);

    // Auto-dismiss after 6 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300); // Wait for exit animation
        }, 6000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleAction = () => {
        if (intervention.action) {
            navigate(intervention.action.route);
        }
        onAction();
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 40) {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="coach-whisper"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 80 }}
                    dragElastic={0.3}
                    onDragEnd={handleDragEnd}
                >
                    <div className="coach-whisper__content" onClick={handleAction}>
                        <span className="coach-whisper__emoji">{intervention.emoji}</span>
                        <div className="coach-whisper__text">
                            <span className="coach-whisper__title">{intervention.title}</span>
                            <span className="coach-whisper__msg">{intervention.message}</span>
                        </div>
                        {intervention.action && (
                            <ChevronRight size={16} className="coach-whisper__arrow" />
                        )}
                    </div>
                    <button className="coach-whisper__close" onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(onDismiss, 300); }}>
                        <X size={14} />
                    </button>
                    <div className="coach-whisper__timer" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
