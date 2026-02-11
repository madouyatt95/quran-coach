import React from 'react';
import { TAJWEED_RULES } from './tajweedService';
import TajweedCanvas from '../components/Mushaf/TajweedCanvas';

/**
 * Parse Tajweed HTML from API and render as React elements.
 * Only colorizes rules that are in the enabledLayers list.
 * Hides verse number markers (span.end).
 *
 * On iOS Safari, uses TajweedCanvas (HarfBuzz WASM) for content
 * to avoid iOS WebKit's Arabic ligature-breaking bug.
 */

// Detect iOS once at module level
const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // Clean up the HTML - remove verse number markers completely
    const cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // On iOS, we use TajweedCanvas which uses HarfBuzz WASM to shape the whole verse
    // correctly. To keep line wrapping, we split the text into words and render
    // each word as its own canvas.
    if (isIOS) {
        // Simple splitting by space. Each "word" might contain <tajweed> tags.
        // We split by space but keep the space in the array to re-insert it.
        const words = cleanHtml.split(/(\s+)/);

        return words.map((word, idx) => {
            if (word.trim() === '') {
                return <span key={idx}>{word}</span>;
            }
            // Each word is rendered as a small TajweedCanvas
            return (
                <TajweedCanvas
                    key={idx}
                    tajweedHtml={word}
                    enabledLayers={enabledLayers}
                    fontSize={24} // Should match CSS font-size
                    lineHeight={1.5}
                />
            );
        });
    }

    // Default rendering for Android/Desktop using <span>
    const result: React.ReactNode[] = [];
    let key = 0;

    const tagRegex = /<tajweed\s+class=([^>]+)>([^<]*)<\/tajweed>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        if (match.index > lastIndex) {
            result.push(cleanHtml.substring(lastIndex, match.index));
        }

        const className = match[1];
        const content = match[2];
        const ruleId = className;
        const rule = TAJWEED_RULES[ruleId];
        const isEnabled = isRuleEnabled(ruleId, enabledLayers);

        if (isEnabled && rule) {
            result.push(
                <span
                    key={key++}
                    className={`tajweed-highlight tj-${ruleId}`}
                >
                    {content}
                </span>
            );
        } else {
            result.push(content);
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanHtml.length) {
        result.push(cleanHtml.substring(lastIndex));
    }

    return result;
}

/**
 * Check if a specific rule is enabled based on layer settings.
 */
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

    const category = categoryMap[ruleId];
    if (category && enabledLayers.includes(category)) return true;

    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const prefix of prefixes) {
        if (ruleId.startsWith(prefix) && enabledLayers.includes(prefix)) return true;
    }
    if (ruleId.startsWith('madda') && enabledLayers.includes('madd')) return true;

    return false;
}

/**
 * Strip all Tajweed tags and return plain text.
 */
export function stripTajweedTags(tajweedHtml: string): string {
    if (!tajweedHtml) return '';
    return tajweedHtml.replace(/<[^>]+>/g, '');
}
