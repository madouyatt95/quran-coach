import React from 'react';
import TajweedCanvas from '../components/Mushaf/TajweedCanvas';
import { TAJWEED_RULES } from './tajweedService';

/**
 * Detect iOS once at module level
 */
const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

/**
 * Get color for a tajweed rule ID from TAJWEED_RULES.
 * Returns null if no rule or default.
 */
function getTajweedColor(ruleId: string): string | null {
    // Map API rule IDs to our TAJWEED_RULES keys if they differ
    // API sometimes uses variations
    const mapping: Record<string, string> = {
        'ghunnah_2': 'ghunnah',
        'qalaqah': 'qalqalah',
        'idgham_wo_ghunnah': 'idgham_no_ghunnah',
        'ikhafa': 'ikhfa',
        'ikhafa_shafawi': 'ikhfa_shafawi',
        'slnt': 'silent'
    };

    const key = mapping[ruleId] || ruleId;
    return TAJWEED_RULES[key]?.color || null;
}

function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    if (enabledLayers.includes(ruleId)) return true;

    // Check if the base category is enabled (e.g., 'madd' for 'madda_normal')
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

    // Prefix match for more flexibility
    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const prefix of prefixes) {
        if (ruleId.startsWith(prefix) && enabledLayers.includes(prefix)) return true;
    }

    return false;
}

/**
 * Main parser function.
 * Sur iOS, on traite chaque mot séparément mais comme un BLOC UNIQUE pour HarfBuzz,
 * ce qui permet de garder les ligatures intactes tout en colorisant des segments.
 */
export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // 1. Clean up HTML
    const cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // 2. Map colors to characters
    let plainText = '';
    const colorMap: (string | null)[] = [];
    const ruleIdMap: (string | null)[] = [];

    // Robust Regex to handle: <tajweed class=rule>, <tajweed class="rule">, <tajweed class='rule'>
    const tagRegex = /<tajweed\s+class=["']?([^"'>\s]+)["']?>([^<]*)<\/tajweed>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        // Text before tag
        const beforeText = cleanHtml.substring(lastIndex, match.index);
        plainText += beforeText;
        for (let i = 0; i < beforeText.length; i++) {
            colorMap.push(null); // Use default theme color
            ruleIdMap.push(null);
        }

        // Inside tag
        const ruleId = match[1];
        const content = match[2];
        const enabled = isRuleEnabled(ruleId, enabledLayers);
        const color = enabled ? getTajweedColor(ruleId) : null;

        plainText += content;
        for (let i = 0; i < content.length; i++) {
            colorMap.push(color);
            ruleIdMap.push(enabled ? ruleId : null);
        }

        lastIndex = match.index + match[0].length;
    }

    // Text after last tag
    const remainingText = cleanHtml.substring(lastIndex);
    plainText += remainingText;
    for (let i = 0; i < remainingText.length; i++) {
        colorMap.push(null);
        ruleIdMap.push(null);
    }

    // 3. Render word by word
    // We split by any sequence of whitespace
    const words = plainText.split(/(\s+)/);
    let charOffset = 0;
    const result: React.ReactNode[] = [];
    let key = 0;

    for (const word of words) {
        if (word === '') continue;

        const wordColors = colorMap.slice(charOffset, charOffset + word.length);
        const wordRuleIds = ruleIdMap.slice(charOffset, charOffset + word.length);

        if (word.trim() === '') {
            // Is a space
            result.push(<span key={key++}>{word}</span>);
        } else if (isIOS) {
            // iOS: Shape the whole word as one block to preserve ligatures
            result.push(
                <TajweedCanvas
                    key={key++}
                    text={word}
                    colors={wordColors as (string | null)[]}
                    fontSize={24}
                    lineHeight={1.4}
                />
            );
        } else {
            // Non-iOS: Standard <span> rendering
            let currentContent = '';
            let currentColor = wordColors[0];
            let currentRuleId = wordRuleIds[0];

            for (let i = 0; i < word.length; i++) {
                if (wordColors[i] === currentColor && wordRuleIds[i] === currentRuleId) {
                    currentContent += word[i];
                } else {
                    result.push(
                        <span
                            key={key++}
                            className={currentRuleId ? `tajweed-highlight tj-${currentRuleId}` : ''}
                            style={currentColor ? { color: currentColor } : {}}
                        >
                            {currentContent}
                        </span>
                    );
                    currentContent = word[i];
                    currentColor = wordColors[i];
                    currentRuleId = wordRuleIds[i];
                }
            }
            // Add last segment of the word
            result.push(
                <span
                    key={key++}
                    className={currentRuleId ? `tajweed-highlight tj-${currentRuleId}` : ''}
                    style={currentColor ? { color: currentColor } : {}}
                >
                    {currentContent}
                </span>
            );
        }

        charOffset += word.length;
    }

    return result;
}

export function stripTajweedTags(tajweedHtml: string): string {
    if (!tajweedHtml) return '';
    return tajweedHtml.replace(/<[^>]+>/g, '');
}
