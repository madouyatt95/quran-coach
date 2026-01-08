import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { playWordAudio } from '../../lib/wordAudioService';
import type { Ayah } from '../../types';

// Tajwid rules with Arabic patterns for detection
const TAJWID_RULES = [
    {
        id: 'madd',
        color: '#FF6B6B',
        patterns: ['آ', 'ا۟', 'وٓ', 'يٓ', 'ىٰ']
    },
    {
        id: 'ghunna',
        color: '#4ECDC4',
        patterns: ['نّ', 'مّ']
    },
    {
        id: 'qalqala',
        color: '#FFE66D',
        patterns: ['قْ', 'طْ', 'بْ', 'جْ', 'دْ']
    },
    {
        id: 'idgham',
        color: '#95E1D3',
        patterns: ['نْي', 'نْر', 'نْم', 'نْل', 'نْو', 'نْن']
    },
    {
        id: 'ikhfa',
        color: '#DDA0DD',
        patterns: ['نْت', 'نْث', 'نْج', 'نْد', 'نْذ', 'نْز', 'نْس', 'نْش', 'نْص', 'نْض', 'نْط', 'نْظ', 'نْف', 'نْق', 'نْك']
    },
    {
        id: 'iqlab',
        color: '#87CEEB',
        patterns: ['نْب', 'مۢب']
    },
    {
        id: 'izhar',
        color: '#98D8C8',
        patterns: ['نْء', 'نْه', 'نْع', 'نْح', 'نْغ', 'نْخ']
    },
    {
        id: 'waqf',
        color: '#F7DC6F',
        patterns: ['ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۚ', 'ۛ', 'ۜ', '۩']
    }
];

interface AyahDisplayProps {
    ayah: Ayah;
    showNumber?: boolean;
    isFocused?: boolean;
    onClick?: () => void;
    enableWordAudio?: boolean;
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

        // Try matching patterns of different lengths (longest first)
        for (let len = 3; len >= 1; len--) {
            if (i + len <= text.length) {
                const substr = text.substring(i, i + len);
                for (const rule of activeRules) {
                    // Use exact match instead of includes to avoid false positives
                    if (rule.patterns.includes(substr)) {
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

        if (!matched) {
            result.push(text[i]);
            i++;
        }
    }

    return result;
}

export function AyahDisplay({
    ayah,
    showNumber = true,
    isFocused = false,
    onClick,
    enableWordAudio = true
}: AyahDisplayProps) {
    const { tajwidEnabled, tajwidLayers } = useSettingsStore();
    const [playingWordIndex, setPlayingWordIndex] = useState<number | null>(null);

    // Split text into words for interactive playback
    const words = ayah.text.split(' ');

    const handleWordClick = async (wordIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!enableWordAudio) return;

        setPlayingWordIndex(wordIndex);

        try {
            await playWordAudio(
                ayah.surah,
                ayah.numberInSurah,
                wordIndex + 1, // 1-indexed
                () => setPlayingWordIndex(null)
            );
        } catch {
            setPlayingWordIndex(null);
        }
    };

    // Render words with optional interactive playback
    const renderWords = () => {
        return words.map((word, index) => {
            const isPlaying = playingWordIndex === index;
            const wordContent = tajwidEnabled && tajwidLayers.length > 0
                ? applyTajwidColors(word, tajwidLayers)
                : word;

            return (
                <span
                    key={index}
                    className={`ayah__word ${isPlaying ? 'ayah__word--playing' : ''} ${enableWordAudio ? 'ayah__word--clickable' : ''}`}
                    onClick={(e) => handleWordClick(index, e)}
                >
                    {wordContent}
                    {index < words.length - 1 ? ' ' : ''}
                </span>
            );
        });
    };

    return (
        <span
            className={`ayah ${isFocused ? 'ayah--focused' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <span className="ayah__text">{renderWords()}</span>
            {showNumber && (
                <span className="ayah__number">{ayah.numberInSurah}</span>
            )}
        </span>
    );
}
