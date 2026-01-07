import { useSettingsStore } from '../../stores/settingsStore';
import type { Ayah } from '../../types';

// Tajwid rules with Arabic patterns for detection
const TAJWID_RULES = [
    {
        id: 'madd',
        color: '#FF6B6B',
        // Madd: prolongation vowels (alif, waw, ya with specific markers)
        patterns: ['آ', 'ا۟', 'وٓ', 'يٓ', 'ىٰ']
    },
    {
        id: 'ghunna',
        color: '#4ECDC4',
        // Ghunna: noon and meem with shaddah
        patterns: ['نّ', 'مّ']
    },
    {
        id: 'qalqala',
        color: '#FFE66D',
        // Qalqala: ق ط ب ج د with sukoon
        patterns: ['قْ', 'طْ', 'بْ', 'جْ', 'دْ']
    },
    {
        id: 'idgham',
        color: '#95E1D3',
        // Idgham: tanwin/noon sakinah before يرملون
        patterns: ['نْي', 'نْر', 'نْم', 'نْل', 'نْو', 'نْن']
    },
    {
        id: 'ikhfa',
        color: '#DDA0DD',
        // Ikhfa: noon sakinah/tanwin before specific letters (15 letters)
        patterns: ['نْت', 'نْث', 'نْج', 'نْد', 'نْذ', 'نْز', 'نْس', 'نْش', 'نْص', 'نْض', 'نْط', 'نْظ', 'نْف', 'نْق', 'نْك']
    },
    {
        id: 'iqlab',
        color: '#87CEEB',
        // Iqlab: noon sakinah/tanwin before ب (converts to م)
        patterns: ['نْب', 'مۢب']
    },
    {
        id: 'izhar',
        color: '#98D8C8',
        // Izhar: noon sakinah before throat letters (ء ه ع ح غ خ)
        patterns: ['نْء', 'نْه', 'نْع', 'نْح', 'نْغ', 'نْخ']
    },
    {
        id: 'waqf',
        color: '#F7DC6F',
        // Waqf: stop signs in Quran
        patterns: ['ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۚ', 'ۛ', 'ۜ', '۩']
    }
];

interface AyahDisplayProps {
    ayah: Ayah;
    showNumber?: boolean;
    isFocused?: boolean;
    onClick?: () => void;
}

// Apply color highlighting to text based on active Tajwid rules
function applyTajwidColors(text: string, enabledLayers: string[]): React.ReactNode {
    if (enabledLayers.length === 0) {
        return text;
    }

    const activeRules = TAJWID_RULES.filter(r => enabledLayers.includes(r.id));
    const result: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < text.length) {
        let matched = false;

        // Check for multi-character patterns (up to 3 chars)
        for (let len = 3; len >= 2; len--) {
            if (i + len <= text.length) {
                const substr = text.substring(i, i + len);
                for (const rule of activeRules) {
                    if (rule.patterns.some(p => substr.includes(p) || p.includes(substr))) {
                        result.push(
                            <span
                                key={key++}
                                style={{ color: rule.color, fontWeight: 'bold' }}
                                title={rule.id}
                            >
                                {substr}
                            </span>
                        );
                        i += len;
                        matched = true;
                        break;
                    }
                }
                if (matched) break;
            }
        }

        // Check single character patterns
        if (!matched) {
            const char = text[i];
            for (const rule of activeRules) {
                if (rule.patterns.includes(char)) {
                    result.push(
                        <span
                            key={key++}
                            style={{ color: rule.color, fontWeight: 'bold' }}
                            title={rule.id}
                        >
                            {char}
                        </span>
                    );
                    matched = true;
                    break;
                }
            }
        }

        if (!matched) {
            result.push(text[i]);
            i++;
        }
    }

    return result;
}

export function AyahDisplay({ ayah, showNumber = true, isFocused = false, onClick }: AyahDisplayProps) {
    const { tajwidEnabled, tajwidLayers } = useSettingsStore();

    // Apply Tajwid highlighting if enabled
    const displayText = tajwidEnabled && tajwidLayers.length > 0
        ? applyTajwidColors(ayah.text, tajwidLayers)
        : ayah.text;

    return (
        <span
            className={`ayah ${isFocused ? 'ayah--focused' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <span className="ayah__text">{displayText}</span>
            {showNumber && (
                <span className="ayah__number">{ayah.numberInSurah}</span>
            )}
        </span>
    );
}
