// ─── Inline SVG Illustrations for Academy Lessons ────────
// Each illustration is a React component rendering an SVG
// All text is in French, no external dependencies

import React from 'react';

const COLORS = {
    bg: '#0d1421',
    card: '#141e30',
    gold: '#C9A84C',
    goldLight: 'rgba(201,168,76,0.15)',
    teal: '#26a69a',
    tealLight: 'rgba(38,166,154,0.15)',
    text: '#e8e4da',
    textMuted: 'rgba(255,255,255,0.5)',
    water: '#4FC3F7',
    waterLight: 'rgba(79,195,247,0.2)',
    green: '#4CAF50',
    greenLight: 'rgba(76,175,80,0.15)',
};

function IllustrationWrapper({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div style={{
            background: `linear-gradient(135deg, ${COLORS.card} 0%, ${COLORS.bg} 100%)`,
            borderRadius: 16,
            padding: '20px 16px 14px',
            marginBottom: 16,
            border: `1px solid rgba(201,168,76,0.12)`,
            textAlign: 'center',
        }}>
            {children}
            <div style={{
                marginTop: 10,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: COLORS.gold,
                letterSpacing: '0.5px',
            }}>
                {label}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// WUDU ILLUSTRATIONS — 7 étapes
// ═══════════════════════════════════════════

export function WuduStep1Mains() {
    return (
        <IllustrationWrapper label="Étape 1 — Laver les mains (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Water stream */}
                <path d="M100 10 L100 50" stroke={COLORS.water} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" opacity="0.7" />
                <ellipse cx="100" cy="52" rx="20" ry="4" fill={COLORS.waterLight} />
                {/* Left hand */}
                <ellipse cx="85" cy="72" rx="22" ry="10" fill="none" stroke={COLORS.gold} strokeWidth="2" transform="rotate(-10 85 72)" />
                <path d="M65 68 Q60 55 65 48 Q70 42 75 50" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M70 65 Q67 54 71 47 Q76 41 78 49" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M76 63 Q74 53 78 47 Q82 42 83 50" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M82 62 Q81 54 84 48 Q87 43 88 51" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M88 63 Q89 57 91 52 Q92 48 93 54" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Right hand */}
                <ellipse cx="115" cy="72" rx="22" ry="10" fill="none" stroke={COLORS.gold} strokeWidth="2" transform="rotate(10 115 72)" />
                <path d="M112 62 Q111 54 113 48 Q116 43 117 51" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M118 63 Q117 53 120 47 Q123 42 124 50" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M124 65 Q123 54 126 47 Q130 41 131 49" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M130 68 Q128 55 132 48 Q137 42 138 50" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Water drops */}
                <circle cx="80" cy="90" r="2" fill={COLORS.water} opacity="0.6" />
                <circle cx="95" cy="95" r="1.5" fill={COLORS.water} opacity="0.5" />
                <circle cx="110" cy="92" r="2" fill={COLORS.water} opacity="0.6" />
                <circle cx="120" cy="98" r="1.5" fill={COLORS.water} opacity="0.4" />
                {/* x3 badge */}
                <rect x="155" y="55" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="170" y="69" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep2Bouche() {
    return (
        <IllustrationWrapper label="Étape 2 — Rincer la bouche (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Head silhouette */}
                <circle cx="100" cy="50" r="32" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Mouth area */}
                <path d="M88 60 Q100 68 112 60" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Hand bringing water */}
                <path d="M130 80 Q140 65 135 55 Q130 48 120 52" fill="none" stroke={COLORS.teal} strokeWidth="2" />
                <ellipse cx="125" cy="58" rx="12" ry="6" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                {/* Water drops at mouth */}
                <circle cx="95" cy="72" r="2" fill={COLORS.water} opacity="0.6" />
                <circle cx="100" cy="76" r="1.5" fill={COLORS.water} opacity="0.5" />
                <circle cx="106" cy="74" r="2" fill={COLORS.water} opacity="0.6" />
                {/* Arrow showing motion */}
                <path d="M140 85 Q125 90 120 80" fill="none" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arrowW)" />
                <defs>
                    <marker id="arrowW" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.textMuted} />
                    </marker>
                </defs>
                {/* x3 badge */}
                <rect x="155" y="40" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="170" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep3Nez() {
    return (
        <IllustrationWrapper label="Étape 3 — Aspirer et expulser l'eau du nez (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Head silhouette - side view */}
                <path d="M70 30 Q100 15 120 30 Q135 45 130 65 Q125 80 110 85 Q95 88 80 85 Q65 80 60 65 Q55 45 70 30" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Nose */}
                <path d="M130 50 Q138 48 135 58" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Right hand with water */}
                <path d="M160 40 Q155 45 148 48" fill="none" stroke={COLORS.teal} strokeWidth="2" />
                <ellipse cx="150" cy="45" rx="10" ry="5" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" transform="rotate(-20 150 45)" />
                {/* Water drops */}
                <circle cx="140" cy="55" r="1.5" fill={COLORS.water} opacity="0.6" />
                <circle cx="135" cy="62" r="2" fill={COLORS.water} opacity="0.5" />
                <circle cx="142" cy="67" r="1.5" fill={COLORS.water} opacity="0.4" />
                {/* Left hand expelling (below) */}
                <path d="M55 80 Q65 72 75 75" fill="none" stroke={COLORS.teal} strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="30" y="95" fontSize="7" fill={COLORS.textMuted}>Main gauche</text>
                <text x="30" y="103" fontSize="7" fill={COLORS.textMuted}>pour expulser</text>
                {/* x3 badge */}
                <rect x="155" y="65" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="170" y="79" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep4Visage() {
    return (
        <IllustrationWrapper label="Étape 4 — Laver le visage (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Head outline */}
                <ellipse cx="100" cy="55" rx="30" ry="38" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Zone indicators - from hairline to chin */}
                <path d="M70 35 L130 35" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="3 2" />
                <text x="135" y="38" fontSize="6.5" fill={COLORS.teal}>Racine des cheveux</text>
                <path d="M70 90 L130 90" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="3 2" />
                <text x="135" y="93" fontSize="6.5" fill={COLORS.teal}>Menton</text>
                {/* Side arrows showing ear to ear */}
                <path d="M65 55 L55 55" stroke={COLORS.teal} strokeWidth="1" markerEnd="url(#arrowV)" />
                <text x="30" y="50" fontSize="6.5" fill={COLORS.teal}>D'oreille</text>
                <text x="30" y="58" fontSize="6.5" fill={COLORS.teal}>à oreille</text>
                <path d="M135 55 L145 55" stroke={COLORS.teal} strokeWidth="1" markerEnd="url(#arrowV)" />
                {/* Water flowing */}
                <path d="M95 20 Q100 30 100 38" stroke={COLORS.water} strokeWidth="2" opacity="0.6" strokeDasharray="4 3" />
                <path d="M105 22 Q102 32 104 38" stroke={COLORS.water} strokeWidth="2" opacity="0.5" strokeDasharray="4 3" />
                {/* Hands on sides of face */}
                <path d="M60 45 Q55 55 60 70" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M140 45 Q145 55 140 70" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Wash zone highlight */}
                <ellipse cx="100" cy="60" rx="27" ry="30" fill={COLORS.waterLight} opacity="0.3" />
                <defs>
                    <marker id="arrowV" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.teal} />
                    </marker>
                </defs>
                {/* x3 badge */}
                <rect x="155" y="15" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="170" y="29" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep5Bras() {
    return (
        <IllustrationWrapper label="Étape 5 — Laver les avant-bras jusqu'aux coudes (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Arm outline */}
                <path d="M30 70 Q50 68 80 65 Q110 62 140 60 Q160 58 170 60" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M30 85 Q50 83 80 80 Q110 77 140 75 Q160 73 170 75" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Hand at end */}
                <ellipse cx="175" cy="67" rx="12" ry="8" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Elbow marker */}
                <line x1="55" y1="55" x2="55" y2="95" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="3 2" />
                <text x="40" y="105" fontSize="7" fill={COLORS.teal} textAnchor="middle">Coude</text>
                {/* Wrist marker */}
                <line x1="155" y1="50" x2="155" y2="90" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="3 2" />
                <text x="155" y="100" fontSize="7" fill={COLORS.teal} textAnchor="middle">Poignet</text>
                {/* Wash zone */}
                <rect x="55" y="58" width="100" height="22" rx="8" fill={COLORS.waterLight} opacity="0.3" />
                {/* Arrow showing direction */}
                <path d="M160 45 L60 45" stroke={COLORS.water} strokeWidth="1.5" markerEnd="url(#arrowB)" />
                <text x="110" y="40" textAnchor="middle" fontSize="7" fill={COLORS.water}>Direction du lavage</text>
                {/* Water drops */}
                <circle cx="80" cy="90" r="2" fill={COLORS.water} opacity="0.5" />
                <circle cx="110" cy="92" r="1.5" fill={COLORS.water} opacity="0.4" />
                <circle cx="130" cy="88" r="2" fill={COLORS.water} opacity="0.5" />
                <defs>
                    <marker id="arrowB" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.water} />
                    </marker>
                </defs>
                {/* x3 badge */}
                <rect x="5" y="55" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="20" y="69" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep6Tete() {
    return (
        <IllustrationWrapper label="Étape 6 — Essuyer la tête et les oreilles (1 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Head top view */}
                <ellipse cx="100" cy="55" rx="40" ry="32" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Hairline */}
                <path d="M65 40 Q100 25 135 40" fill="none" stroke={COLORS.gold} strokeWidth="1" strokeDasharray="3 2" />
                {/* Hands wiping - arrows front to back */}
                <path d="M70 38 Q100 20 130 38" fill="none" stroke={COLORS.teal} strokeWidth="2" markerEnd="url(#arrowH)" />
                <text x="100" y="15" textAnchor="middle" fontSize="7" fill={COLORS.teal}>Avant → Arrière → Avant</text>
                {/* Back of head */}
                <path d="M70 72 Q100 85 130 72" fill="none" stroke={COLORS.gold} strokeWidth="1" strokeDasharray="3 2" />
                {/* Ears */}
                <ellipse cx="55" cy="58" rx="8" ry="14" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <ellipse cx="145" cy="58" rx="8" ry="14" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Ear labels */}
                <text x="30" y="58" fontSize="6" fill={COLORS.textMuted} textAnchor="middle">Index</text>
                <text x="30" y="66" fontSize="6" fill={COLORS.textMuted} textAnchor="middle">à l'intérieur</text>
                <text x="170" y="58" fontSize="6" fill={COLORS.textMuted} textAnchor="middle">Pouce</text>
                <text x="170" y="66" fontSize="6" fill={COLORS.textMuted} textAnchor="middle">derrière</text>
                {/* Finger indicators on ears */}
                <circle cx="55" cy="52" r="3" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <circle cx="145" cy="65" r="3" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <defs>
                    <marker id="arrowH" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.teal} />
                    </marker>
                </defs>
                {/* x1 badge */}
                <rect x="155" y="15" width="30" height="20" rx="10" fill={COLORS.green} />
                <text x="170" y="29" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">×1</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function WuduStep7Pieds() {
    return (
        <IllustrationWrapper label="Étape 7 — Laver les pieds jusqu'aux chevilles (3 fois)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Foot outline */}
                <path d="M60 90 Q55 70 60 55 Q65 45 75 42 Q85 40 95 42 Q100 44 105 50 Q110 60 108 75 Q106 85 100 95 Q80 100 60 90" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Toes */}
                <circle cx="80" cy="40" r="4" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <circle cx="90" cy="38" r="4" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <circle cx="98" cy="40" r="3.5" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <circle cx="104" cy="44" r="3" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <circle cx="108" cy="50" r="2.5" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Ankle marker */}
                <line x1="55" y1="88" x2="115" y2="88" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="3 2" />
                <text x="120" y="92" fontSize="7" fill={COLORS.teal}>Chevilles</text>
                {/* Water between toes arrow */}
                <path d="M75 30 Q80 35 85 32" fill="none" stroke={COLORS.water} strokeWidth="1" />
                <text x="65" y="25" fontSize="6" fill={COLORS.water}>Frotter entre</text>
                <text x="65" y="33" fontSize="6" fill={COLORS.water}>les orteils</text>
                {/* Water flowing */}
                <path d="M130 30 L130 60" stroke={COLORS.water} strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
                <circle cx="130" cy="65" r="2" fill={COLORS.water} opacity="0.5" />
                <circle cx="128" cy="72" r="1.5" fill={COLORS.water} opacity="0.4" />
                <circle cx="133" cy="78" r="2" fill={COLORS.water} opacity="0.5" />
                {/* Wash zone */}
                <path d="M55 55 Q55 45 65 42 Q75 38 95 38 Q105 40 110 48 Q115 60 112 75 Q110 85 105 88" fill={COLORS.waterLight} opacity="0.2" />
                {/* x3 badge */}
                <rect x="150" y="40" width="30" height="20" rx="10" fill={COLORS.gold} />
                <text x="165" y="54" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.bg}>×3</text>
                {/* Side note */}
                <text x="140" y="85" fontSize="6.5" fill={COLORS.textMuted}>Commencer</text>
                <text x="140" y="93" fontSize="6.5" fill={COLORS.textMuted}>par le pied</text>
                <text x="140" y="101" fontSize="6.5" fill={COLORS.textMuted}>droit</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// PRAYER POSITION ILLUSTRATIONS — 6 positions
// ═══════════════════════════════════════════

export function PrayerQiyam() {
    return (
        <IllustrationWrapper label="Position 1 — Qiyam (debout)">
            <svg viewBox="0 0 200 160" style={{ width: '100%', maxWidth: 240 }}>
                {/* Standing figure */}
                <circle cx="100" cy="25" r="12" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Body */}
                <line x1="100" y1="37" x2="100" y2="95" stroke={COLORS.gold} strokeWidth="2" />
                {/* Arms crossed on chest */}
                <path d="M100 55 Q85 50 78 58" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M100 55 Q115 50 122 58" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M78 58 Q85 62 94 58" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M122 58 Q115 62 106 58" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Legs */}
                <line x1="100" y1="95" x2="88" y2="140" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="100" y1="95" x2="112" y2="140" stroke={COLORS.gold} strokeWidth="2" />
                {/* Feet */}
                <line x1="88" y1="140" x2="80" y2="142" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="112" y1="140" x2="120" y2="142" stroke={COLORS.gold} strokeWidth="2" />
                {/* Direction arrow (facing Qibla) */}
                <path d="M140 80 L160 80" stroke={COLORS.teal} strokeWidth="1.5" markerEnd="url(#arrowQ)" />
                <text x="150" y="73" fontSize="7" fill={COLORS.teal} textAnchor="middle">Qibla</text>
                {/* Labels */}
                <text x="50" y="58" fontSize="7" fill={COLORS.textMuted} textAnchor="end">Mains</text>
                <text x="50" y="66" fontSize="7" fill={COLORS.textMuted} textAnchor="end">croisées</text>
                <line x1="52" y1="60" x2="76" y2="58" stroke={COLORS.textMuted} strokeWidth="0.5" />
                <text x="50" y="30" fontSize="7" fill={COLORS.textMuted} textAnchor="end">Regard</text>
                <text x="50" y="38" fontSize="7" fill={COLORS.textMuted} textAnchor="end">au sol</text>
                <defs>
                    <marker id="arrowQ" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.teal} />
                    </marker>
                </defs>
            </svg>
        </IllustrationWrapper>
    );
}

export function PrayerRuku() {
    return (
        <IllustrationWrapper label="Position 2 — Ruku (inclinaison)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Head */}
                <circle cx="140" cy="42" r="10" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Back - horizontal */}
                <line x1="85" y1="48" x2="130" y2="45" stroke={COLORS.gold} strokeWidth="2" />
                {/* Legs straight */}
                <line x1="85" y1="48" x2="80" y2="115" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="85" y1="48" x2="92" y2="115" stroke={COLORS.gold} strokeWidth="2" />
                {/* Feet */}
                <line x1="80" y1="115" x2="73" y2="117" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="92" y1="115" x2="99" y2="117" stroke={COLORS.gold} strokeWidth="2" />
                {/* Hands on knees */}
                <path d="M95 48 Q100 65 90 80" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M100 48 Q105 65 95 80" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* 90° marker */}
                <path d="M85 55 L85 65 L78 65" fill="none" stroke={COLORS.teal} strokeWidth="1" />
                <text x="76" y="78" fontSize="7" fill={COLORS.teal}>90°</text>
                {/* Labels */}
                <text x="155" y="30" fontSize="7" fill={COLORS.textMuted}>Dos droit</text>
                <text x="155" y="50" fontSize="7" fill={COLORS.textMuted}>Tête alignée</text>
                <text x="75" y="90" fontSize="7" fill={COLORS.textMuted} textAnchor="end">Mains sur</text>
                <text x="75" y="98" fontSize="7" fill={COLORS.textMuted} textAnchor="end">les genoux</text>
                {/* Dhikr */}
                <rect x="115" y="95" rx="8" width="75" height="28" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="0.5" />
                <text x="152" y="109" textAnchor="middle" fontSize="9" fill={COLORS.gold} fontFamily="Amiri, serif" direction="rtl">سُبْحَانَ رَبِّيَ العَظِيم</text>
                <text x="152" y="120" textAnchor="middle" fontSize="6" fill={COLORS.textMuted}>(3 fois)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function PrayerSujud() {
    return (
        <IllustrationWrapper label="Position 3 — Sujud (prosternation)">
            <svg viewBox="0 0 200 130" style={{ width: '100%', maxWidth: 260 }}>
                {/* Figure in prostration */}
                {/* Head touching ground */}
                <circle cx="150" cy="95" r="8" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Back going up */}
                <path d="M150 87 Q130 60 100 55" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Legs folded */}
                <path d="M100 55 Q90 65 85 80 Q82 95 80 100" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M80 100 Q85 105 95 100" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Hands flat */}
                <path d="M140 85 Q145 88 150 90" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M160 85 Q155 88 150 90" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <ellipse cx="140" cy="100" rx="8" ry="3" fill="none" stroke={COLORS.gold} strokeWidth="1" />
                <ellipse cx="165" cy="100" rx="8" ry="3" fill="none" stroke={COLORS.gold} strokeWidth="1" />
                {/* Ground line */}
                <line x1="30" y1="105" x2="190" y2="105" stroke={COLORS.textMuted} strokeWidth="0.5" />
                {/* 7 points labels */}
                <text x="20" y="20" fontSize="8" fill={COLORS.teal} fontWeight="bold">7 points de contact :</text>
                <text x="20" y="32" fontSize="7" fill={COLORS.textMuted}>1. Front + nez</text>
                <text x="20" y="42" fontSize="7" fill={COLORS.textMuted}>2. Deux mains</text>
                <text x="20" y="52" fontSize="7" fill={COLORS.textMuted}>3. Deux genoux</text>
                <text x="20" y="62" fontSize="7" fill={COLORS.textMuted}>4. Bouts des orteils</text>
                {/* Dhikr */}
                <rect x="30" y="75" rx="8" width="70" height="22" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="0.5" />
                <text x="65" y="88" textAnchor="middle" fontSize="8" fill={COLORS.gold} fontFamily="Amiri, serif">سُبْحَانَ رَبِّيَ الأَعْلَى</text>
                <text x="65" y="95" textAnchor="middle" fontSize="6" fill={COLORS.textMuted}>(3 fois)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function PrayerJulus() {
    return (
        <IllustrationWrapper label="Position 4 — Julûs (assis entre les 2 prosternations)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Seated figure */}
                <circle cx="100" cy="25" r="10" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Body upright */}
                <line x1="100" y1="35" x2="100" y2="75" stroke={COLORS.gold} strokeWidth="2" />
                {/* Legs folded under */}
                <path d="M100 75 Q95 90 85 100 Q80 105 75 102" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M100 75 Q105 90 115 100 Q120 105 125 102" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Feet under */}
                <path d="M75 102 Q70 105 68 100" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Hands on knees */}
                <path d="M100 55 Q90 58 85 70" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <path d="M100 55 Q110 58 115 70" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                {/* Ground */}
                <line x1="40" y1="108" x2="170" y2="108" stroke={COLORS.textMuted} strokeWidth="0.5" />
                {/* Labels */}
                <text x="145" y="55" fontSize="7" fill={COLORS.textMuted}>Dos droit</text>
                <text x="145" y="75" fontSize="7" fill={COLORS.textMuted}>Mains</text>
                <text x="145" y="83" fontSize="7" fill={COLORS.textMuted}>sur les genoux</text>
                {/* Du'a */}
                <rect x="30" y="115" rx="8" width="145" height="20" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="0.5" />
                <text x="102" y="128" textAnchor="middle" fontSize="8" fill={COLORS.gold} fontFamily="Amiri, serif">رَبِّ اغْفِرْ لِي — Seigneur, pardonne-moi</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function PrayerTachahoud() {
    return (
        <IllustrationWrapper label="Position 5 — Tachahoud (attestation finale)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Seated figure */}
                <circle cx="100" cy="25" r="10" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="100" y1="35" x2="100" y2="75" stroke={COLORS.gold} strokeWidth="2" />
                {/* Legs */}
                <path d="M100 75 Q95 90 85 100 Q80 105 75 102" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M100 75 Q105 90 115 100 Q120 105 125 102" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                {/* Right hand - index finger pointing */}
                <path d="M100 55 Q112 58 118 65" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <line x1="118" y1="65" x2="130" y2="58" stroke={COLORS.teal} strokeWidth="2" />
                <circle cx="131" cy="57" r="2" fill={COLORS.teal} />
                <text x="135" y="52" fontSize="7" fill={COLORS.teal}>Index levé</text>
                <text x="135" y="60" fontSize="7" fill={COLORS.teal}>(Tawhid)</text>
                {/* Left hand flat on knee */}
                <path d="M100 55 Q88 58 82 70" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
                <text x="50" y="65" fontSize="7" fill={COLORS.textMuted} textAnchor="end">Main gauche</text>
                <text x="50" y="73" fontSize="7" fill={COLORS.textMuted} textAnchor="end">à plat</text>
                {/* Ground */}
                <line x1="40" y1="108" x2="170" y2="108" stroke={COLORS.textMuted} strokeWidth="0.5" />
                {/* Tachahoud text */}
                <rect x="15" y="112" rx="8" width="175" height="24" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="0.5" />
                <text x="100" y="125" textAnchor="middle" fontSize="8" fill={COLORS.gold} fontFamily="Amiri, serif">التحيات لله والصلوات والطيبات</text>
                <text x="100" y="134" textAnchor="middle" fontSize="6" fill={COLORS.textMuted}>At-tahiyyatu li-llahi was-salawatu wat-tayyibat</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function PrayerSalam() {
    return (
        <IllustrationWrapper label="Position 6 — Salam (salutations finales)">
            <svg viewBox="0 0 200 130" style={{ width: '100%', maxWidth: 260 }}>
                {/* Center figure */}
                <circle cx="100" cy="35" r="10" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <line x1="100" y1="45" x2="100" y2="80" stroke={COLORS.gold} strokeWidth="2" />
                {/* Turn right arrow */}
                <path d="M115 35 Q135 30 145 40" fill="none" stroke={COLORS.teal} strokeWidth="2" markerEnd="url(#arrowS)" />
                <text x="150" y="35" fontSize="7.5" fill={COLORS.teal}>①  Tourner</text>
                <text x="150" y="44" fontSize="7.5" fill={COLORS.teal}>à droite</text>
                {/* Turn left arrow */}
                <path d="M85 35 Q65 30 55 40" fill="none" stroke={COLORS.teal} strokeWidth="2" markerEnd="url(#arrowS)" />
                <text x="15" y="35" fontSize="7.5" fill={COLORS.teal}>②  Tourner</text>
                <text x="15" y="44" fontSize="7.5" fill={COLORS.teal}>à gauche</text>
                {/* Text to say */}
                <rect x="20" y="70" rx="10" width="165" height="22" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="0.5" />
                <text x="102" y="84" textAnchor="middle" fontSize="10" fill={COLORS.gold} fontFamily="Amiri, serif">السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ</text>
                {/* Translation */}
                <text x="100" y="105" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>
                    « Que la paix et la miséricorde d'Allah soient sur vous »
                </text>
                <text x="100" y="118" textAnchor="middle" fontSize="7" fill={COLORS.textMuted} fontStyle="italic">
                    (à dire 2 fois : droite puis gauche)
                </text>
                <defs>
                    <marker id="arrowS" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.teal} />
                    </marker>
                </defs>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// ALPHABET ARABE — 5 Groupes
// ═══════════════════════════════════════════

export function AlphabetGroup1() {
    return (
        <IllustrationWrapper label="Groupe 1 — Famille du 'Ba' (en forme de bol)">
            <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 260 }}>
                {/* 4 Cards */}
                <rect x="10" y="10" width="40" height="60" rx="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="30" y="45" textAnchor="middle" fontSize="26" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ب</text>
                <text x="30" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Ba</text>

                <rect x="58" y="10" width="40" height="60" rx="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="78" y="45" textAnchor="middle" fontSize="26" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ت</text>
                <text x="78" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Ta</text>

                <rect x="106" y="10" width="40" height="60" rx="8" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="126" y="45" textAnchor="middle" fontSize="26" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">ث</text>
                <text x="126" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Tha</text>

                <rect x="154" y="10" width="40" height="60" rx="8" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="174" y="45" textAnchor="middle" fontSize="26" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">ن</text>
                <text x="174" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Noun</text>

                <text x="100" y="90" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Seuls les points changent la lettre</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function AlphabetGroup2() {
    return (
        <IllustrationWrapper label="Groupe 2 — Famille du 'Jim' (en crochet)">
            <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 260 }}>
                {/* 3 Cards centered */}
                <rect x="35" y="10" width="40" height="60" rx="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="55" y="45" textAnchor="middle" fontSize="26" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ج</text>
                <text x="55" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Jim</text>

                <rect x="85" y="10" width="40" height="60" rx="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="105" y="45" textAnchor="middle" fontSize="26" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ح</text>
                <text x="105" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Hâ</text>

                <rect x="135" y="10" width="40" height="60" rx="8" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="155" y="45" textAnchor="middle" fontSize="26" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">خ</text>
                <text x="155" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Khâ</text>

                <text x="100" y="90" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>(Point au milieu)  —  (Aucun)  —  (Point au-dessus)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function AlphabetGroup3() {
    return (
        <IllustrationWrapper label="Groupe 3 — Familles Dal et Râ (4 lettres)">
            <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="10" y="10" width="40" height="60" rx="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="30" y="45" textAnchor="middle" fontSize="26" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">د</text>
                <text x="30" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Dal</text>

                <rect x="58" y="10" width="40" height="60" rx="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="78" y="45" textAnchor="middle" fontSize="26" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ذ</text>
                <text x="78" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Dhal</text>

                <rect x="106" y="10" width="40" height="60" rx="8" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="126" y="45" textAnchor="middle" fontSize="26" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">ر</text>
                <text x="126" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Râ</text>

                <rect x="154" y="10" width="40" height="60" rx="8" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="174" y="45" textAnchor="middle" fontSize="26" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">ز</text>
                <text x="174" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Zây</text>

                <text x="100" y="90" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>⚠️ Ces lettres ne s'attachent PAS à la lettre suivante</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function AlphabetGroup4() {
    return (
        <IllustrationWrapper label="Groupe 4 — Les lettres à 'dents' (4 lettres)">
            <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="10" y="10" width="40" height="60" rx="8" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="30" y="45" textAnchor="middle" fontSize="26" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">س</text>
                <text x="30" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Sîn</text>

                <rect x="58" y="10" width="40" height="60" rx="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="78" y="45" textAnchor="middle" fontSize="26" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ش</text>
                <text x="78" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Chîn</text>

                <rect x="106" y="10" width="40" height="60" rx="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="126" y="45" textAnchor="middle" fontSize="26" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ص</text>
                <text x="126" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Sâd</text>

                <rect x="154" y="10" width="40" height="60" rx="8" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="174" y="45" textAnchor="middle" fontSize="26" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">ض</text>
                <text x="174" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Dâd</text>

                <text x="100" y="90" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Sîn/Chîn (3 dents) et Sâd/Dâd (boucle et dent)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function AlphabetGroup5() {
    return (
        <IllustrationWrapper label="Groupe 5 — Lettres uniques et profondes">
            <svg viewBox="0 0 200 100" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="23" y="10" width="40" height="60" rx="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="43" y="45" textAnchor="middle" fontSize="26" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ع</text>
                <text x="43" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>'Ayn</text>

                <rect x="78" y="10" width="40" height="60" rx="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="98" y="45" textAnchor="middle" fontSize="26" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ق</text>
                <text x="98" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Qâf</text>

                <rect x="133" y="10" width="40" height="60" rx="8" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="153" y="45" textAnchor="middle" fontSize="26" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">ط</text>
                <text x="153" y="65" textAnchor="middle" fontSize="10" fill={COLORS.text}>Tâ</text>

                <text x="100" y="90" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Quelques exemples de lettres profondes</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// TAJWID FONDAMENTAL — 8 Règles
// ═══════════════════════════════════════════

export function TajweedIdgham() {
    return (
        <IllustrationWrapper label="Règle 1 : Idgham (Fusion)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* 2 circles merging */}
                <circle cx="80" cy="50" r="25" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <circle cx="120" cy="50" r="25" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="2" />

                {/* Text inside circles */}
                <text x="80" y="55" textAnchor="middle" fontSize="16" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">نْ</text>
                <text x="120" y="55" textAnchor="middle" fontSize="14" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">ي ر م ل و ن</text>

                {/* Arrow */}
                <path d="M100 80 L100 95" stroke={COLORS.gold} strokeWidth="2" markerEnd="url(#arrowT)" />
                <rect x="50" y="100" rx="6" width="100" height="20" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="100" y="113" textAnchor="middle" fontSize="10" fill={COLORS.gold} fontWeight="bold">Fusion (Idgham)</text>

                <defs>
                    <marker id="arrowT" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.gold} />
                    </marker>
                </defs>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedIkhfa() {
    return (
        <IllustrationWrapper label="Règle 2 : Ikhfa (Dissimulation)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Hidden Noun */}
                <circle cx="100" cy="50" r="30" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="2" strokeDasharray="4 4" />
                <text x="100" y="58" textAnchor="middle" fontSize="24" fill={COLORS.water} fontWeight="bold" opacity="0.4" fontFamily="Amiri, serif">نْ</text>

                <path d="M40 70 Q100 20 160 70" fill="none" stroke={COLORS.gold} strokeWidth="3" opacity="0.8" />
                <text x="100" y="85" textAnchor="middle" fontSize="9" fill={COLORS.text}>Nasillement doux (2 temps)</text>

                <rect x="40" y="100" rx="6" width="120" height="20" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="100" y="113" textAnchor="middle" fontSize="9" fill={COLORS.gold} fontWeight="bold">15 Lettres (toutes les autres)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedIqlab() {
    return (
        <IllustrationWrapper label="Règle 3 : Iqlab (Transformation)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Noun -> Mim */}
                <rect x="30" y="30" rx="8" width="40" height="40" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <text x="50" y="58" textAnchor="middle" fontSize="22" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">نْ</text>

                <path d="M80 50 L120 50" stroke={COLORS.water} strokeWidth="2" markerEnd="url(#arrowIqlab)" />
                <text x="100" y="42" textAnchor="middle" fontSize="9" fill={COLORS.water}>Avant un</text>
                <text x="100" y="65" textAnchor="middle" fontSize="16" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ب</text>

                <rect x="130" y="30" rx="8" width="40" height="40" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <text x="150" y="58" textAnchor="middle" fontSize="22" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">م</text>

                <text x="100" y="100" textAnchor="middle" fontSize="10" fill={COLORS.text}>Le Noun (ن) se transforme en Mim (م)</text>
                <text x="100" y="112" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>avec nasillement (2 temps)</text>

                <defs>
                    <marker id="arrowIqlab" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill={COLORS.water} />
                    </marker>
                </defs>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedIzhar() {
    return (
        <IllustrationWrapper label="Règle 4 : Izhar (Clair)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Clear Noun */}
                <circle cx="100" cy="45" r="30" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="3" />
                <text x="100" y="53" textAnchor="middle" fontSize="24" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">نْ</text>

                <text x="40" y="35" fontSize="12" fill={COLORS.gold} fontFamily="Amiri, serif">ء ه</text>
                <text x="160" y="35" textAnchor="end" fontSize="12" fill={COLORS.gold} fontFamily="Amiri, serif">ع ح</text>
                <text x="100" y="95" textAnchor="middle" fontSize="12" fill={COLORS.gold} fontFamily="Amiri, serif">غ خ</text>

                <text x="100" y="115" textAnchor="middle" fontSize="9" fill={COLORS.text}>Prononciation claire et nette</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedQalqalah() {
    return (
        <IllustrationWrapper label="Qalqalah (Rebond)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                <path d="M40 80 Q100 80 100 40 Q100 80 160 80" fill="none" stroke={COLORS.gold} strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="100" cy="40" r="5" fill={COLORS.teal} />

                <text x="100" y="25" textAnchor="middle" fontSize="10" fill={COLORS.teal} fontWeight="bold">Rebond sonore</text>

                <rect x="30" y="90" rx="8" width="140" height="24" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="100" y="106" textAnchor="middle" fontSize="14" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ق ط ب ج د</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedMadd() {
    return (
        <IllustrationWrapper label="Madd (Allongement)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Wave form representing duration */}
                <path d="M20 60 Q40 40 60 60 T100 60 T140 60 T180 60" fill="none" stroke={COLORS.water} strokeWidth="3" />

                <rect x="20" y="85" width="40" height="20" rx="4" fill={COLORS.tealLight} />
                <text x="40" y="98" textAnchor="middle" fontSize="10" fill={COLORS.text}>2 Temps</text>

                <rect x="70" y="85" width="60" height="20" rx="4" fill={COLORS.tealLight} />
                <text x="100" y="98" textAnchor="middle" fontSize="10" fill={COLORS.text}>4-5 Temps</text>

                <rect x="140" y="85" width="40" height="20" rx="4" fill={COLORS.tealLight} />
                <text x="160" y="98" textAnchor="middle" fontSize="10" fill={COLORS.text}>6 Temps</text>

                <text x="100" y="30" textAnchor="middle" fontSize="14" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ا و ي</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function TajweedGhunna() {
    return (
        <IllustrationWrapper label="Ghunna (Nasillement)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Nose/Sound waves */}
                <path d="M70 50 Q100 70 130 50" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <path d="M80 65 Q100 80 120 65" fill="none" stroke={COLORS.gold} strokeWidth="2" opacity="0.6" />
                <path d="M90 80 Q100 90 110 80" fill="none" stroke={COLORS.gold} strokeWidth="2" opacity="0.3" />

                <text x="60" y="45" textAnchor="middle" fontSize="24" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">نّ</text>
                <text x="140" y="45" textAnchor="middle" fontSize="24" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">مّ</text>

                <rect x="40" y="100" rx="6" width="120" height="20" fill={COLORS.waterLight} />
                <text x="100" y="113" textAnchor="middle" fontSize="9" fill={COLORS.water} fontWeight="bold">Vibration nasale (2 temps)</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// MAKHARIJ AL-HURUF — 5 Zones
// ═══════════════════════════════════════════

export function MakharijGorge() {
    return (
        <IllustrationWrapper label="Zone 1 — La Gorge (الحَلْق)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Profile silhouette */}
                <path d="M80 20 Q110 10 130 30 Q145 45 140 65 Q135 80 120 85 L120 120" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />
                <path d="M80 20 Q70 40 75 60 L75 120" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />

                {/* Gorge highlights */}
                <circle cx="97" cy="110" r="12" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <text x="97" y="114" textAnchor="middle" fontSize="12" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ء ه</text>

                <circle cx="100" cy="85" r="12" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <text x="100" y="89" textAnchor="middle" fontSize="12" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ع ح</text>

                <circle cx="105" cy="60" r="12" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="2" />
                <text x="105" y="64" textAnchor="middle" fontSize="12" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">غ خ</text>

                <line x1="125" y1="110" x2="160" y2="110" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="2 2" />
                <text x="165" y="113" fontSize="8" fill={COLORS.text}>Fond</text>

                <line x1="125" y1="85" x2="160" y2="85" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="2 2" />
                <text x="165" y="88" fontSize="8" fill={COLORS.text}>Milieu</text>

                <line x1="125" y1="60" x2="160" y2="60" stroke={COLORS.textMuted} strokeWidth="1" strokeDasharray="2 2" />
                <text x="165" y="63" fontSize="8" fill={COLORS.text}>Haut</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function MakharijLangue() {
    return (
        <IllustrationWrapper label="Zone 2 — La Langue (اللِّسان)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Mouth & Tongue */}
                <path d="M50 70 Q100 40 150 70" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />
                <path d="M70 70 Q100 60 130 70 Q140 80 100 90 Q60 80 70 70" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />

                <text x="100" y="80" textAnchor="middle" fontSize="10" fill={COLORS.gold}>18 Lettres</text>

                {/* Arrow to tip */}
                <path d="M125 75 L155 75" stroke={COLORS.teal} strokeWidth="1.5" markerEnd="url(#arrowT)" />
                <text x="175" y="78" textAnchor="middle" fontSize="8" fill={COLORS.teal}>Bout</text>

                {/* Arrow to middle */}
                <path d="M100 70 L100 30" stroke={COLORS.teal} strokeWidth="1.5" markerEnd="url(#arrowT)" />
                <text x="100" y="25" textAnchor="middle" fontSize="8" fill={COLORS.teal}>Milieu</text>

                {/* Arrow to base */}
                <path d="M75 75 L45 75" stroke={COLORS.teal} strokeWidth="1.5" markerEnd="url(#arrowT)" />
                <text x="25" y="78" textAnchor="middle" fontSize="8" fill={COLORS.teal}>Base</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function MakharijLevres() {
    return (
        <IllustrationWrapper label="Zone 3 — Les Lèvres (الشَّفَتَان)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Lips */}
                <path d="M60 70 Q100 55 140 70 Q100 85 60 70" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="3" />
                <path d="M60 70 Q100 70 140 70" fill="none" stroke={COLORS.gold} strokeWidth="1" />

                <text x="100" y="45" textAnchor="middle" fontSize="16" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">ب م و</text>
                <text x="100" y="110" textAnchor="middle" fontSize="16" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">ف</text>

                <text x="100" y="30" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Les deux lèvres</text>
                <text x="100" y="125" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Lèvre inférieure + dents supérieures</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function MakharijNez() {
    return (
        <IllustrationWrapper label="Zone 4 — La Cavité Nasale (الخَيْشُوم)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Face Profile nose area */}
                <path d="M80 20 Q100 10 110 30 Q120 40 130 50 Q120 60 110 65 L110 90" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />

                {/* Nasal cavity highlight */}
                <ellipse cx="100" cy="45" rx="15" ry="8" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" transform="rotate(-30 100 45)" />

                <path d="M110 40 Q130 35 150 45 Q160 60 140 70" fill="none" stroke={COLORS.water} strokeWidth="2" strokeDasharray="4 4" />

                <text x="120" y="85" fontSize="10" fill={COLORS.teal} fontWeight="bold">Ghunna</text>
                <text x="120" y="100" fontSize="8" fill={COLORS.textMuted}>Nasillement (2 temps)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function MakharijVide() {
    return (
        <IllustrationWrapper label="Zone 5 — Le Vide Buccal (الجَوْف)">
            <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 260 }}>
                {/* Open mouth */}
                <path d="M60 40 Q100 20 140 40" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />
                <path d="M60 100 Q100 120 140 100" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />

                {/* Empty space waves */}
                <path d="M80 70 L160 70" stroke={COLORS.gold} strokeWidth="3" markerEnd="url(#arrowT)" />
                <path d="M90 55 L150 55" stroke={COLORS.gold} strokeWidth="2" opacity="0.6" markerEnd="url(#arrowT)" />
                <path d="M90 85 L150 85" stroke={COLORS.gold} strokeWidth="2" opacity="0.6" markerEnd="url(#arrowT)" />

                <circle cx="65" cy="70" r="20" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="65" y="75" textAnchor="middle" fontSize="14" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">ا و ي</text>

                <text x="100" y="125" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>L'air sans obstacle (Lettres de Madd)</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// COMPRÉHENSION DES SOURATES — Al-Fatiha & Vocabulaire
// ═══════════════════════════════════════════

export function CompFatihaIntro() {
    return (
        <IllustrationWrapper label="La Mère du Livre (Oumm al-Kitab)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Book icon */}
                <path d="M100 20 C60 20 40 40 40 40 L40 100 C40 100 60 80 100 80 C140 80 160 100 160 100 L160 40 C160 40 140 20 100 20 Z" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <path d="M100 20 L100 80" stroke={COLORS.teal} strokeWidth="2" />
                <path d="M50 50 L90 40 M50 65 L90 55 M150 50 L110 40 M150 65 L110 55" stroke={COLORS.teal} strokeWidth="2" opacity="0.5" strokeLinecap="round" />

                <text x="100" y="65" textAnchor="middle" fontSize="22" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">الفاتحة</text>
                <text x="100" y="115" textAnchor="middle" fontSize="9" fill={COLORS.text}>La sourate qui résume tout le Coran en 7 versets</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function CompBismillah() {
    return (
        <IllustrationWrapper label="Bismillah : Les 3 Noms d'Allah">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="20" y="40" width="50" height="40" rx="6" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="45" y="65" textAnchor="middle" fontSize="14" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">الله</text>

                <rect x="75" y="40" width="50" height="40" rx="6" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="100" y="65" textAnchor="middle" fontSize="14" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">الرحمن</text>

                <rect x="130" y="40" width="50" height="40" rx="6" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="155" y="65" textAnchor="middle" fontSize="14" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">الرحيم</text>

                <text x="100" y="25" textAnchor="middle" fontSize="14" fill={COLORS.text} fontFamily="Amiri, serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</text>

                <text x="45" y="95" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Le Dieu</text>
                <text x="100" y="95" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Le Tout Miséricordieux</text>
                <text x="155" y="95" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Le Très Miséricordieux</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function CompAlHamd() {
    return (
        <IllustrationWrapper label="Al-Hamdu lillah (La Louange absolue)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                <circle cx="100" cy="50" r="30" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="2" />
                <path d="M100 20 L100 80 M70 50 L130 50 M78 28 L122 72 M78 72 L122 28" stroke={COLORS.green} strokeWidth="1" opacity="0.3" />

                <text x="100" y="58" textAnchor="middle" fontSize="24" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">الحمد</text>

                <text x="100" y="95" textAnchor="middle" fontSize="10" fill={COLORS.text}>Dans la joie comme dans l'épreuve</text>
                <text x="100" y="110" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Remerciement + Reconnaissance de Sa perfection</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function CompIyyaka() {
    return (
        <IllustrationWrapper label="Iyyaka Na'budu (Le cœur de l'Islam)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Balance scales */}
                <path d="M100 20 L100 80 M70 40 L130 40" stroke={COLORS.gold} strokeWidth="3" />
                <path d="M70 40 L60 60 L80 60 Z M130 40 L120 60 L140 60 Z" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />

                <text x="70" y="80" textAnchor="middle" fontSize="12" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">نعبد</text>
                <text x="130" y="80" textAnchor="middle" fontSize="12" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">نستعين</text>

                <text x="70" y="95" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>L'adoration</text>
                <text x="130" y="95" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>La demande d'aide</text>

                <rect x="40" y="105" width="120" height="15" rx="4" fill={COLORS.waterLight} />
                <text x="100" y="116" textAnchor="middle" fontSize="8" fill={COLORS.water} fontWeight="bold">Exclusif à Allah (Tawhid)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function CompIhdina() {
    return (
        <IllustrationWrapper label="La plus grande demande : La guidance">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Straight path perspective */}
                <path d="M80 100 L95 30 L105 30 L120 100 Z" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <path d="M100 100 L100 30" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="4 4" />

                {/* Star at the end */}
                <circle cx="100" cy="20" r="8" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />

                <text x="50" y="60" textAnchor="middle" fontSize="14" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">اهدنا</text>
                <text x="150" y="60" textAnchor="middle" fontSize="14" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">الصراط</text>

                <text x="100" y="115" textAnchor="middle" fontSize="10" fill={COLORS.text}>Le Droit Chemin (L'Islam)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function CompVocab() {
    return (
        <IllustrationWrapper label="Mots-clés coraniques">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="10" y="10" width="85" height="45" rx="6" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="52" y="32" textAnchor="middle" fontSize="18" fill={COLORS.gold} fontWeight="bold" fontFamily="Amiri, serif">تقوى</text>
                <text x="52" y="48" textAnchor="middle" fontSize="9" fill={COLORS.text}>Piété</text>

                <rect x="105" y="10" width="85" height="45" rx="6" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="147" y="32" textAnchor="middle" fontSize="18" fill={COLORS.teal} fontWeight="bold" fontFamily="Amiri, serif">صبر</text>
                <text x="147" y="48" textAnchor="middle" fontSize="9" fill={COLORS.text}>Patience</text>

                <rect x="10" y="65" width="85" height="45" rx="6" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="52" y="87" textAnchor="middle" fontSize="18" fill={COLORS.water} fontWeight="bold" fontFamily="Amiri, serif">توبة</text>
                <text x="52" y="103" textAnchor="middle" fontSize="9" fill={COLORS.text}>Repentir</text>

                <rect x="105" y="65" width="85" height="45" rx="6" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="147" y="87" textAnchor="middle" fontSize="18" fill={COLORS.green} fontWeight="bold" fontFamily="Amiri, serif">دعاء</text>
                <text x="147" y="103" textAnchor="middle" fontSize="9" fill={COLORS.text}>Invocation</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// FIQH SIMPLIFIÉ
// ═══════════════════════════════════════════

export function FiqhJeune() {
    return (
        <IllustrationWrapper label="Le Jeûne du Ramadan">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Sun & Moon */}
                <path d="M40 60 A 20 20 0 0 1 80 60" fill="none" stroke={COLORS.gold} strokeWidth="3" />
                <circle cx="60" cy="40" r="10" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <text x="60" y="80" textAnchor="middle" fontSize="10" fill={COLORS.text}>Aube (Fajr)</text>

                <path d="M90 60 L110 60" stroke={COLORS.water} strokeWidth="2" markerEnd="url(#arrowT)" />

                <path d="M120 60 A 20 20 0 0 1 160 60" fill="none" stroke={COLORS.teal} strokeWidth="3" />
                <path d="M145 40 A 10 10 0 0 0 155 30 A 12 12 0 0 1 155 50 A 10 10 0 0 0 145 40" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="140" y="80" textAnchor="middle" fontSize="10" fill={COLORS.text}>Coucher (Maghrib)</text>

                <rect x="50" y="100" width="100" height="15" rx="4" fill={COLORS.greenLight} />
                <text x="100" y="111" textAnchor="middle" fontSize="8" fill={COLORS.green} fontWeight="bold">Abstinence totale</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhJeuneAnnule() {
    return (
        <IllustrationWrapper label="Ne pas faire exprès = Jeûne valide">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Crossed out forbidden items */}
                <circle cx="60" cy="50" r="20" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />
                <path d="M50 50 C50 40 70 40 70 50 C70 60 50 60 50 50 Z" fill={COLORS.waterLight} />
                <line x1="45" y1="35" x2="75" y2="65" stroke={COLORS.gold} strokeWidth="3" />
                <text x="60" y="85" textAnchor="middle" fontSize="9" fill={COLORS.text}>Boire (volontaire)</text>

                <circle cx="140" cy="50" r="20" fill="none" stroke={COLORS.textMuted} strokeWidth="2" />
                <path d="M130 50 Q140 40 150 50 Q140 60 130 50 Z" fill={COLORS.tealLight} />
                <line x1="125" y1="35" x2="155" y2="65" stroke={COLORS.gold} strokeWidth="3" />
                <text x="140" y="85" textAnchor="middle" fontSize="9" fill={COLORS.text}>Manger (volontaire)</text>

                <rect x="30" y="100" width="140" height="15" rx="4" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="100" y="111" textAnchor="middle" fontSize="8" fill={COLORS.green} fontWeight="bold">⚠️ Par oubli : le jeûne reste valide !</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhJeuneSur() {
    return (
        <IllustrationWrapper label="Jeûnes Surérogatoires">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Calendar / days */}
                <rect x="20" y="20" width="160" height="60" rx="4" fill="none" stroke={COLORS.textMuted} strokeWidth="1" />
                <line x1="20" y1="35" x2="180" y2="35" stroke={COLORS.textMuted} strokeWidth="1" />

                {/* Lundi Jeudi */}
                <rect x="30" y="45" width="20" height="20" rx="2" fill={COLORS.tealLight} />
                <text x="40" y="58" textAnchor="middle" fontSize="8" fill={COLORS.teal} fontWeight="bold">Lun</text>

                <rect x="70" y="45" width="20" height="20" rx="2" fill={COLORS.tealLight} />
                <text x="80" y="58" textAnchor="middle" fontSize="8" fill={COLORS.teal} fontWeight="bold">Jeu</text>

                {/* Jours blancs */}
                <circle cx="120" cy="55" r="12" fill={COLORS.waterLight} />
                <text x="120" y="58" textAnchor="middle" fontSize="9" fill={COLORS.water} fontWeight="bold">13-15</text>

                {/* Shawwal / Arafat */}
                <circle cx="160" cy="55" r="12" fill={COLORS.goldLight} />
                <text x="160" y="58" textAnchor="middle" fontSize="9" fill={COLORS.gold} fontWeight="bold">6 J</text>

                <text x="100" y="100" textAnchor="middle" fontSize="10" fill={COLORS.text}>Projets &amp; Sunnah</text>
                <text x="100" y="112" textAnchor="middle" fontSize="8" fill={COLORS.textMuted}>Lundi/Jeudi, Jours Blancs, 6 jours Shawwal...</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhZakatNissab() {
    return (
        <IllustrationWrapper label="Le Nissab (Seuil)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Gold bar */}
                <rect x="80" y="20" width="40" height="25" rx="2" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <text x="100" y="36" textAnchor="middle" fontSize="10" fill={COLORS.gold} fontWeight="bold">85g Or</text>

                {/* Percentage */}
                <circle cx="100" cy="75" r="20" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="2" />
                <text x="100" y="80" textAnchor="middle" fontSize="12" fill={COLORS.teal} fontWeight="bold">2.5%</text>

                <text x="100" y="115" textAnchor="middle" fontSize="9" fill={COLORS.text}>Gardé pendant 1 an lunaire</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhZakat8() {
    return (
        <IllustrationWrapper label="Les 8 Bénéficiaires">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* 8 small people icons in a circle or row */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
                    const r = 35;
                    const cx = 100 + r * Math.cos(angle);
                    const cy = 60 + r * Math.sin(angle);
                    return (
                        <g key={i}>
                            <circle cx={cx} cy={cy - 4} r="4" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                            <path d={`M ${cx - 6} ${cy + 8} Q ${cx} ${cy + 2} ${cx + 6} ${cy + 8}`} fill="none" stroke={COLORS.teal} strokeWidth="2" strokeLinecap="round" />
                        </g>
                    );
                })}

                <text x="100" y="65" textAnchor="middle" fontSize="16" fill={COLORS.gold} fontWeight="bold">8</text>

                <text x="100" y="115" textAnchor="middle" fontSize="9" fill={COLORS.text}>Pauvres, nécessiteux, endettés, voyageurs...</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhZakatFitr() {
    return (
        <IllustrationWrapper label="Zakat al-Fitr (Fin du Ramadan)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Bowl of food */}
                <path d="M70 60 Q100 90 130 60 Z" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <ellipse cx="100" cy="60" rx="30" ry="10" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />

                <path d="M90 55 Q100 45 110 55 Q105 50 100 55 Q95 50 90 55" fill={COLORS.teal} opacity="0.5" />
                <text x="100" y="55" textAnchor="middle" fontSize="10" fill={COLORS.teal}>2.5 kg</text>

                <rect x="50" y="95" width="100" height="18" rx="4" fill={COLORS.waterLight} />
                <text x="100" y="107" textAnchor="middle" fontSize="8" fill={COLORS.water} fontWeight="bold">AVANT la prière de l'Aïd</text>

                <text x="100" y="25" textAnchor="middle" fontSize="12" fill={COLORS.text} fontWeight="bold">Purification du jeûneur</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhHajjPillars() {
    return (
        <IllustrationWrapper label="Les 4 Piliers du Hajj">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                <rect x="30" y="20" width="65" height="40" rx="4" fill={COLORS.waterLight} stroke={COLORS.water} strokeWidth="1" />
                <text x="62" y="40" textAnchor="middle" fontSize="9" fill={COLORS.water} fontWeight="bold">1. Ihram</text>

                <rect x="105" y="20" width="65" height="40" rx="4" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="1" />
                <text x="137" y="40" textAnchor="middle" fontSize="9" fill={COLORS.gold} fontWeight="bold">2. Arafat</text>

                <rect x="30" y="70" width="65" height="40" rx="4" fill={COLORS.greenLight} stroke={COLORS.green} strokeWidth="1" />
                <text x="62" y="90" textAnchor="middle" fontSize="9" fill={COLORS.green} fontWeight="bold">3. Tawaf</text>

                <rect x="105" y="70" width="65" height="40" rx="4" fill={COLORS.tealLight} stroke={COLORS.teal} strokeWidth="1" />
                <text x="137" y="90" textAnchor="middle" fontSize="9" fill={COLORS.teal} fontWeight="bold">4. Sa'y</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhHajjIhram() {
    return (
        <IllustrationWrapper label="L'Ihram (Sacralisation)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* 2 pieces of cloth */}
                <path d="M70 30 Q100 20 130 30 L120 70 Q100 80 80 70 Z" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" />
                <path d="M60 50 Q100 40 140 50 L130 90 Q100 100 70 90 Z" fill={COLORS.goldLight} stroke={COLORS.gold} strokeWidth="2" opacity="0.8" />

                <text x="100" y="115" textAnchor="middle" fontSize="9" fill={COLORS.text}>2 étoffes blanches non cousues (Hommes)</text>
            </svg>
        </IllustrationWrapper>
    );
}

export function FiqhHajjTawaf() {
    return (
        <IllustrationWrapper label="Tawaf (Ka'ba) et Sa'y (Safa-Marwa)">
            <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 260 }}>
                {/* Ka'ba */}
                <rect x="40" y="40" width="30" height="30" fill="#2D3748" />
                <rect x="40" y="45" width="30" height="4" fill={COLORS.gold} />

                {/* 7 circles around Ka'ba */}
                <path d="M55 75 A 25 25 0 1 0 55 35" fill="none" stroke={COLORS.teal} strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrowT)" />
                <text x="55" y="95" textAnchor="middle" fontSize="9" fill={COLORS.text}>7 Tours</text>

                {/* Safa Marwa */}
                <path d="M120 40 Q145 20 170 40" fill="none" stroke={COLORS.gold} strokeWidth="2" />
                <text x="120" y="55" textAnchor="middle" fontSize="8" fill={COLORS.gold}>Safa</text>
                <text x="170" y="55" textAnchor="middle" fontSize="8" fill={COLORS.gold}>Marwa</text>

                <path d="M130 45 L160 45" stroke={COLORS.textMuted} strokeWidth="1" markerEnd="url(#arrowT)" />
                <path d="M160 52 L130 52" stroke={COLORS.textMuted} strokeWidth="1" markerEnd="url(#arrowT)" />
                <text x="145" y="70" textAnchor="middle" fontSize="9" fill={COLORS.text}>7 Trajets</text>
            </svg>
        </IllustrationWrapper>
    );
}

// ═══════════════════════════════════════════
// MAPPING — Associate illustrations to section titles
// ═══════════════════════════════════════════
export const ILLUSTRATION_MAP: Record<string, React.FC> = {
    // Wudu
    'Laver les mains': WuduStep1Mains,
    'Rincer la bouche': WuduStep2Bouche,
    'Aspirer et expulser l\'eau du nez': WuduStep3Nez,
    'Laver le visage': WuduStep4Visage,
    'Laver les avant-bras': WuduStep5Bras,
    'Essuyer la tête': WuduStep6Tete,
    'Laver les pieds': WuduStep7Pieds,
    // Prayer
    'Qiyam': PrayerQiyam,
    'Le Ruku': PrayerRuku,
    'Le Sujud': PrayerSujud,
    'L\'assise entre les deux prosternations': PrayerJulus,
    'Tachahoud': PrayerTachahoud,
    'Le Salam final': PrayerSalam,
    // Alphabet
    'Groupe 1 — Famille Ba (ب ت ث ن)': AlphabetGroup1,
    'Groupe 2 — Famille Jim (ج ح خ)': AlphabetGroup2,
    'Groupe 3 — Famille Dal (د ذ ر ز)': AlphabetGroup3,
    'Groupe 4 — Famille Sîn (س ش ص ض)': AlphabetGroup4,
    'Groupe 5 — Lettres profondes et gutturales': AlphabetGroup5,
    // Tajweed
    'Règle 1 : Idgham (🟢 Fusion)': TajweedIdgham,
    'Règle 2 : Ikhfa (🟠 Dissimulation)': TajweedIkhfa,
    'Règle 3 : Iqlab (🔵 Transformation)': TajweedIqlab,
    'Règle 4 : Izhar (🟣 Clair)': TajweedIzhar,
    'La Qalqalah (🔴 Rebond)': TajweedQalqalah,
    'Le Madd (🔵 Allongement)': TajweedMadd,
    'La Ghunna (🟠 Nasillement)': TajweedGhunna,
    // Makharij
    'Zone 1 — La Gorge (الحَلْق)': MakharijGorge,
    'Zone 2 — La Langue (اللِّسان)': MakharijLangue,
    'Zone 3 — Les Lèvres (الشَّفَتَان)': MakharijLevres,
    'Zone 4 — La Cavité Nasale (الخَيْشُوم)': MakharijNez,
    'Zone 5 — Le Vide Buccal (الجَوْف)': MakharijVide,
    // Compréhension
    'Vue d\'ensemble': CompFatihaIntro,
    'بِسْمِ اللَّهِ — Au nom d\'Allah': CompBismillah,
    'الْحَمْدُ لِلَّهِ — La louange est à Allah': CompAlHamd,
    'إِيَّاكَ نَعْبُدُ — C\'est Toi seul que nous adorons': CompIyyaka,
    'اهْدِنَا الصِّرَاطَ — Guide-nous': CompIhdina,
    'Vocabulaire Coranique Essentiel': CompVocab,
    // Fiqh
    'Le jeûne du Ramadan': FiqhJeune,
    'Ce qui annule le jeûne': FiqhJeuneAnnule,
    'Les jeûnes surérogatoires': FiqhJeuneSur,
    'Le Nissab (seuil minimal)': FiqhZakatNissab,
    'Les 8 bénéficiaires': FiqhZakat8,
    'Zakat al-Fitr': FiqhZakatFitr,
    'Les 4 Piliers du Hajj': FiqhHajjPillars,
    'L\'Ihram': FiqhHajjIhram,
    'Le Tawaf et le Sa\'y': FiqhHajjTawaf,
};
