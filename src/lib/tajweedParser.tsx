import React from 'react';
import TajweedCanvas from '../components/Mushaf/TajweedCanvas';

/**
 * Detect iOS once at module level
 */
const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

interface TextSegment {
    text: string;
    color: string | null;
    ruleId: string | null;
}

/**
 * Get CSS color for a tajweed rule ID.
 */
function getCssColor(ruleId: string): string {
    const colors: Record<string, string> = {
        madda_normal: '#537FFF', madda_permissible: '#4169E1', madda_necessary: '#00008B', madda_obligatory: '#1E90FF',
        madd_2: '#537FFF', madd_4: '#4169E1', madd_6: '#00008B', madd_246: '#537FFF', madd_munfasil: '#4169E1', madd_muttasil: '#1E90FF',
        ghunnah: '#169200', ghunnah_2: '#169200',
        qalqalah: '#DD0008', qalaqah: '#DD0008',
        idgham_ghunnah: '#FF7F00', idgham_no_ghunnah: '#FF6347', idgham_wo_ghunnah: '#FF6347',
        idgham_mutajanisayn: '#FFA07A', idgham_mutaqaribayn: '#FFB347', idgham_shafawi: '#FF8C00',
        ikhfa: '#9400D3', ikhfa_shafawi: '#BA55D3', ikhafa: '#9400D3', ikhafa_shafawi: '#BA55D3',
        iqlab: '#26BFBF', izhar: '#8B0000', izhar_shafawi: '#A52A2A', izhar_halqi: '#8B0000',
        ham_wasl: '#AAAAAA', laam_shamsiyah: '#FF69B4', silent: '#AAAAAA', slnt: '#AAAAAA',
    };
    return colors[ruleId] || '#1a1a2e';
}

function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    if (enabledLayers.includes(ruleId)) return true;
    const categoryMap: Record<string, string> = {
        madda_normal: 'madd', madda_permissible: 'madd', madda_necessary: 'madd', madda_obligatory: 'madd',
        madd_2: 'madd', madd_4: 'madd', madd_6: 'madd', madd_246: 'madd', madd_munfasil: 'madd', madd_muttasil: 'madd',
        ghunnah: 'ghunnah', ghunnah_2: 'ghunnah',
        qalqalah: 'qalqalah', qalaqah: 'qalqalah',
        idgham_ghunnah: 'idgham', idgham_no_ghunnah: 'idgham', idgham_wo_ghunnah: 'idgham',
        idgham_mutajanisayn: 'idgham', idgham_mutaqaribayn: 'idgham', idgham_shafawi: 'idgham',
        ikhfa: 'ikhfa', ikhfa_shafawi: 'ikhfa', ikhafa: 'ikhfa', ikhafa_shafawi: 'ikhfa',
        iqlab: 'iqlab',
        izhar: 'izhar', izhar_shafawi: 'izhar', izhar_halqi: 'izhar',
        ham_wasl: 'other', laam_shamsiyah: 'other', silent: 'other', slnt: 'other',
    };
    const cat = categoryMap[ruleId];
    if (cat && enabledLayers.includes(cat)) return true;
    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const prefix of prefixes) {
        if (ruleId.startsWith(prefix) && enabledLayers.includes(prefix)) return true;
    }
    return ruleId.startsWith('madda') && enabledLayers.includes('madd');
}

/**
 * Main parser function
 */
export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // 1. Clean up
    const cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // 2. Parse into segments
    const segments: TextSegment[] = [];
    const tagRegex = /<tajweed\s+class=([^>]+)>([^<]*)<\/tajweed>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ text: cleanHtml.substring(lastIndex, match.index), color: null, ruleId: null });
        }
        const ruleId = match[1];
        const content = match[2];
        const enabled = isRuleEnabled(ruleId, enabledLayers);
        segments.push({
            text: content,
            color: enabled ? getCssColor(ruleId) : null,
            ruleId: enabled ? ruleId : null
        });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < cleanHtml.length) {
        segments.push({ text: cleanHtml.substring(lastIndex), color: null, ruleId: null });
    }

    // 3. Render
    let key = 0;
    const result: React.ReactNode[] = [];

    for (const seg of segments) {
        // Split segment into words to allow line wrapping
        const words = seg.text.split(/(\s+)/);

        for (const word of words) {
            if (word === '') continue;
            if (word.trim() === '') {
                result.push(<span key={key++}>{word}</span>);
                continue;
            }

            if (isIOS) {
                // iOS: Each word gets its own Canvas for shaping
                result.push(
                    <TajweedCanvas
                        key={key++}
                        text={word}
                        color={seg.color || '#1a1a2e'}
                        fontSize={24}
                        lineHeight={1.5}
                    />
                );
            } else {
                // Other: Standard <span>
                result.push(
                    <span
                        key={key++}
                        className={seg.ruleId ? `tajweed-highlight tj-${seg.ruleId}` : ''}
                        style={seg.color ? { color: seg.color } : {}}
                    >
                        {word}
                    </span>
                );
            }
        }
    }

    return result;
}

export function stripTajweedTags(tajweedHtml: string): string {
    if (!tajweedHtml) return '';
    return tajweedHtml.replace(/<[^>]+>/g, '');
}
