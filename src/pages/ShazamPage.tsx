import { Radio, Lock } from 'lucide-react';
import './ShazamPage.css';

export function ShazamPage() {
    return (
        <div className="shazam-page">
            {/* Header */}
            <div className="shazam-header">
                <h1 className="shazam-title">
                    <Radio size={28} />
                    Shazam Coran
                </h1>
                <p className="shazam-subtitle">Identifiez n'importe quel passage coranique</p>
            </div>

            {/* Coming Soon Content */}
            <div className="shazam-content">
                <div className="shazam-visualizer">
                    <div className="shazam-wave">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="shazam-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                    <div className="shazam-rings">
                        <div className="shazam-ring" />
                        <div className="shazam-ring" />
                        <div className="shazam-ring" />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    marginTop: '24px',
                    padding: '32px 24px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <Lock size={40} style={{ color: '#c9a84c', opacity: 0.7 }} />
                    <p style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#c9a84c',
                        margin: 0,
                    }}>
                        Bientôt disponible 🔜
                    </p>
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        textAlign: 'center',
                        margin: 0,
                        maxWidth: '280px',
                        lineHeight: 1.5,
                    }}>
                        Cette fonctionnalité est en cours de développement. Restez connecté !
                    </p>
                </div>
            </div>
        </div>
    );
}
