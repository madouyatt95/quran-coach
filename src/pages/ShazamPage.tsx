import { Radio, Mic } from 'lucide-react';
import './ShazamPage.css';


export function ShazamPage() {
    return (
        <div className="shazam-page">
            {/* Maintenance Overlay */}
            <div className="shazam-maintenance-overlay">
                <Radio size={48} className="shazam-maintenance-icon" />
                <h2>Shazam Coran</h2>
                <div className="shazam-maintenance-badge">BIENTÔT DISPO</div>
                <p>Nous améliorons le service de reconnaissance pour vous offrir une précision optimale.</p>
                <button className="shazam-maintenance-btn" onClick={() => window.history.back()}>
                    Retour
                </button>
            </div>

            {/* Header */}
            <div className="shazam-header" style={{ opacity: 0.2, pointerEvents: 'none' }}>
                <h1 className="shazam-title">
                    <Radio size={28} />
                    Shazam Coran
                </h1>
                <p className="shazam-subtitle">Identifiez n'importe quel passage coranique</p>
            </div>

            {/* Main Content (Blurred/Disabled) */}
            <div className="shazam-content" style={{ opacity: 0.1, pointerEvents: 'none', filter: 'blur(4px)' }}>
                {/* Visualizer */}
                <div className="shazam-visualizer">
                    <div className="shazam-wave">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="shazam-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                </div>

                {/* Main Button */}
                <button className="shazam-btn">
                    <Mic size={40} />
                </button>
            </div>
        </div>
    );
}
