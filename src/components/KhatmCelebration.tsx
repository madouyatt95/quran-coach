import { createPortal } from 'react-dom';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { useMemo } from 'react';
import { useKhatmStore } from '../stores/khatmStore';
import { useQuranStore } from '../stores/quranStore';
import { RotateCcw, X } from 'lucide-react';
import './KhatmCelebration.css';

const PARTICLE_COLORS = [
    '#d4af37', '#c9a84c', '#e8c84a', '#b8943e',
    '#f5d062', '#a8893a', '#ffd700', '#daa520',
];

export function KhatmCelebration() {
    const khatmCount = useKhatmStore(s => s.completionCount);
    const pending = useKhatmStore(s => s.celebrationPending);
    const handleDismiss = useKhatmStore(s => s.dismissCelebration);
    const goToPage = useQuranStore(s => s.goToPage);

    const handleRestart = () => {
        handleDismiss();
        goToPage(1);
    };

    // Generate confetti particles
    const particles = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 3}s`,
            duration: `${2.5 + Math.random() * 3}s`,
            color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            size: `${4 + Math.random() * 6}px`,
        }));
    }, []);

    const dialogRef = useDialogFocus(handleDismiss, pending);

    if (!pending) return null;

    return createPortal(
        <div className="khatm-overlay" onClick={handleDismiss}>
            {/* Confetti */}
            <div className="khatm-confetti">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="khatm-particle"
                        style={{
                            left: p.left,
                            animationDelay: p.delay,
                            animationDuration: p.duration,
                            backgroundColor: p.color,
                            width: p.size,
                            height: p.size,
                        }}
                    />
                ))}
            </div>

            {/* Card */}
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Félicitations pour votre Khatm" tabIndex={-1} className="khatm-card" onClick={e => e.stopPropagation()}>
                <div className="khatm-calligraphy">
                    ختم القرآن الكريم
                </div>
                <div className="khatm-subtitle">
                    Félicitations ! Vous avez complété le Coran ✨
                </div>

                <div className="khatm-counter">
                    <span className="khatm-counter-number">{khatmCount}</span>
                    <span className="khatm-counter-label">
                        {khatmCount === 1 ? 'Khatm\ncomplété' : 'Khatm\ncomplétés'}
                    </span>
                </div>

                <div className="khatm-message">
                    « Celui qui lit le Coran avec aisance sera avec les anges nobles et obéissants. »
                    <br />— Bukhari & Muslim
                </div>

                <div className="khatm-actions">
                    <button className="khatm-btn-primary" onClick={handleRestart}>
                        <RotateCcw size={16} />
                        Relire Al-Fatiha
                    </button>
                    <button className="khatm-btn-secondary" onClick={handleDismiss}>
                        <X size={14} />
                        Fermer
                    </button>
                </div>
            </div>
        </div>, document.body
    );
}
