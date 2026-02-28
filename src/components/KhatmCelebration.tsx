import { useState, useEffect, useMemo } from 'react';
import { useQuranStore } from '../stores/quranStore';
import { RotateCcw, X } from 'lucide-react';
import './KhatmCelebration.css';

const STORAGE_KEY = 'quran-coach-khatm-count';
const DISMISSED_KEY = 'quran-coach-khatm-dismissed';

const PARTICLE_COLORS = [
    '#d4af37', '#c9a84c', '#e8c84a', '#b8943e',
    '#f5d062', '#a8893a', '#ffd700', '#daa520',
];

export function KhatmCelebration() {
    const currentPage = useQuranStore(s => s.currentPage);
    const goToPage = useQuranStore(s => s.goToPage);

    const [khatmCount, setKhatmCount] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [dismissed, setDismissed] = useState(() => {
        return localStorage.getItem(DISMISSED_KEY) === 'true';
    });
    const [hasTriggered, setHasTriggered] = useState(false);

    // Detect khatm completion
    useEffect(() => {
        if (currentPage === 604 && !hasTriggered && !dismissed) {
            const newCount = khatmCount + 1;
            setKhatmCount(newCount);
            localStorage.setItem(STORAGE_KEY, String(newCount));
            setHasTriggered(true);
            localStorage.removeItem(DISMISSED_KEY);
        }
        // Reset trigger when leaving page 604
        if (currentPage !== 604) {
            setHasTriggered(false);
            setDismissed(false);
            localStorage.removeItem(DISMISSED_KEY);
        }
    }, [currentPage, hasTriggered, dismissed, khatmCount]);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(DISMISSED_KEY, 'true');
    };

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

    // Only show on page 604 and not dismissed
    if (currentPage !== 604 || dismissed) return null;

    return (
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
            <div className="khatm-card" onClick={e => e.stopPropagation()}>
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
                        Recommencer depuis Al-Fatiha
                    </button>
                    <button className="khatm-btn-secondary" onClick={handleDismiss}>
                        <X size={14} />
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
