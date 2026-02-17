import {
    Palette,
    Languages,
    Type,
    Layout,
    Mic,
    CheckCircle2,
    Circle,
    X,
    Eye,
    EyeOff,
    MicOff
} from 'lucide-react';
import { getTajweedCategories } from '../../lib/tajweedService';
import type { MaskMode } from './mushafConstants';

const tajweedCategories = getTajweedCategories();

interface MushafToolbarProps {
    // Toolbar visibility
    showToolbar: boolean;
    isMobile: boolean;
    // Tajweed
    showTajweedSheet: boolean;
    setShowTajweedSheet: (v: boolean) => void;
    tajwidEnabled: boolean;
    toggleTajwid: () => void;
    tajwidLayers: string[];
    toggleTajwidLayer: (id: string) => void;
    // Translation / Transliteration
    showTranslation: boolean;
    toggleTranslation: () => void;
    showTransliteration: boolean;
    toggleTransliteration: () => void;
    // Font
    showFontSheet: boolean;
    setShowFontSheet: (v: boolean) => void;
    arabicFontSize: 'sm' | 'md' | 'lg' | 'xl';
    setArabicFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
    // Mask
    showMaskSheet: boolean;
    setShowMaskSheet: (v: boolean) => void;
    maskMode: MaskMode;
    setMaskMode: (mode: MaskMode) => void;
    // Coach
    isCoachMode: boolean;
    toggleCoachMode: () => void;
    // Page validation
    isPageValidated: boolean;
    togglePageValidation: () => void;
}

export function MushafToolbar({
    showToolbar,
    showTajweedSheet,
    setShowTajweedSheet,
    isMobile,
    tajwidEnabled,
    toggleTajwid,
    tajwidLayers,
    toggleTajwidLayer,
    showTranslation,
    toggleTranslation,
    showTransliteration,
    toggleTransliteration,
    showFontSheet,
    setShowFontSheet,
    arabicFontSize,
    setArabicFontSize,
    showMaskSheet,
    setShowMaskSheet,
    maskMode,
    setMaskMode,
    isCoachMode,
    toggleCoachMode,
    isPageValidated,
    togglePageValidation,
}: MushafToolbarProps) {
    return (
        <>
            {/* ===== Inline Toolbar ===== */}
            {showToolbar && (
                <div className="mih-toolbar">
                    {!isMobile && (
                        <button
                            className={`mih-toolbar__btn ${showTajweedSheet ? 'active' : ''}`}
                            onClick={() => setShowTajweedSheet(true)}
                            title="Tajweed"
                        >
                            <Palette size={18} />
                        </button>
                    )}

                    <button
                        className={`mih-toolbar__btn ${showTranslation ? 'active' : ''}`}
                        onClick={toggleTranslation}
                        title="Traduction"
                    >
                        <Languages size={18} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showTransliteration ? 'active' : ''}`}
                        onClick={toggleTransliteration}
                        title="Phonétique"
                    >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>Aa</span>
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showFontSheet ? 'active' : ''}`}
                        onClick={() => setShowFontSheet(true)}
                        title="Taille police"
                    >
                        <Type size={18} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${showMaskSheet ? 'active' : ''}`}
                        onClick={() => setShowMaskSheet(true)}
                        title="Masquage"
                    >
                        <Layout size={18} />
                    </button>

                    <button
                        className={`mih-toolbar__btn ${isCoachMode ? 'active' : ''}`}
                        onClick={toggleCoachMode}
                        title={isCoachMode ? 'Désactiver le Coach' : 'Activer le Coach'}
                    >
                        {isCoachMode ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <div className="mih-toolbar__divider" />

                    <button
                        className={`mih-toolbar__validate ${isPageValidated ? 'validated' : ''}`}
                        onClick={togglePageValidation}
                        title="Valider la page"
                    >
                        {isPageValidated ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </button>
                </div>
            )}

            {/* ===== Tajweed Sheet ===== */}
            {showTajweedSheet && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setShowTajweedSheet(false)} />
                    <div className="mih-sheet">
                        <div className="mih-sheet__handle" />
                        <div className="mih-sheet__header">
                            <span className="mih-sheet__title">Règles de Tajweed</span>
                            <button className="mih-sheet__close" onClick={() => setShowTajweedSheet(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div
                            className={`mih-tajweed-toggle ${tajwidEnabled ? '' : 'off'}`}
                            onClick={toggleTajwid}
                            style={{ cursor: 'pointer' }}
                        >
                            <span>Tajweed {tajwidEnabled ? 'activé' : 'désactivé'}</span>
                            <div className={`mih-toggle-switch ${tajwidEnabled ? 'on' : ''}`} />
                        </div>

                        <div className="mih-tajweed-grid">
                            {tajweedCategories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`mih-tajweed-card ${tajwidLayers.includes(cat.id) ? 'active' : ''}`}
                                    style={{ color: cat.color, borderColor: tajwidLayers.includes(cat.id) ? cat.color : '#eee' }}
                                    onClick={() => toggleTajwidLayer(cat.id)}
                                >
                                    <span className="mih-tajweed-card__name">{cat.name.split('(')[0].trim()}</span>
                                    <span className="mih-tajweed-card__arabic">{cat.nameArabic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ===== Masquage Sheet ===== */}
            {showMaskSheet && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setShowMaskSheet(false)} />
                    <div className="mih-sheet">
                        <div className="mih-sheet__handle" />
                        <div className="mih-sheet__header">
                            <span className="mih-sheet__title">Mode Masquage (Hifz)</span>
                            <button className="mih-sheet__close" onClick={() => setShowMaskSheet(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mih-mask-grid">
                            <div
                                className={`mih-mask-card ${maskMode === 'visible' ? 'active' : ''}`}
                                onClick={() => { setMaskMode('visible'); setShowMaskSheet(false); }}
                            >
                                <Eye size={20} />
                                <span>Visible</span>
                            </div>
                            <div
                                className={`mih-mask-card ${maskMode === 'hidden' ? 'active' : ''}`}
                                onClick={() => { setMaskMode('hidden'); setShowMaskSheet(false); }}
                            >
                                <EyeOff size={20} />
                                <span>Tout caché</span>
                            </div>
                            <div
                                className={`mih-mask-card ${maskMode === 'partial' ? 'active' : ''}`}
                                onClick={() => { setMaskMode('partial'); setShowMaskSheet(false); }}
                            >
                                <Eye size={20} />
                                <span>Partiel</span>
                            </div>
                            <div
                                className={`mih-mask-card ${maskMode === 'minimal' ? 'active' : ''}`}
                                onClick={() => { setMaskMode('minimal'); setShowMaskSheet(false); }}
                            >
                                <EyeOff size={20} />
                                <span>Minimal (flou)</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== Font Size Sheet ===== */}
            {showFontSheet && (
                <>
                    <div className="mih-sheet-overlay" onClick={() => setShowFontSheet(false)} />
                    <div className="mih-sheet">
                        <div className="mih-sheet__handle" />
                        <div className="mih-sheet__header">
                            <span className="mih-sheet__title">Taille de police</span>
                            <button className="mih-sheet__close" onClick={() => setShowFontSheet(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mih-fontsize-grid">
                            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                                <button
                                    key={size}
                                    className={`mih-fontsize-btn ${arabicFontSize === size ? 'active' : ''}`}
                                    onClick={() => { setArabicFontSize(size); setShowFontSheet(false); }}
                                >
                                    <span style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '22px' : '26px', fontFamily: 'var(--font-arabic)' }}>
                                        بسم
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#999', marginTop: 4 }}>
                                        {size === 'sm' ? 'Petit' : size === 'md' ? 'Normal' : size === 'lg' ? 'Grand' : 'Très grand'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
