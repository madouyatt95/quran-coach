import React from 'react';
import { TajweedCanvas } from '../components/Mushaf/TajweedCanvas';
import { TAJWEED_RULES } from './tajweedService';

/**
 * Detect iOS
 */
const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

/**
 * Get color for a tajweed rule ID from central TAJWEED_RULES.
 */
function getTajweedColor(ruleId: string): string | null {
    const key = ruleId.toLowerCase();
    return TAJWEED_RULES[key]?.color || null;
}

/**
 * Check if a specific rule is enabled based on layer settings
 * REVERTED Logic from 7eb1354
 */
function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    // Direct match
    if (enabledLayers.includes(ruleId)) return true;

    // Category mapping - RESTORED ORIGINAL MAPPING
    const categoryMap: Record<string, string> = {
        'madda_normal': 'madd',
        'madda_permissible': 'madd',
        'madda_necessary': 'madd',
        'madda_obligatory': 'madd',
        'madd_2': 'madd',
        'madd_4': 'madd',
        'madd_6': 'madd',
        'ghunnah': 'ghunnah',
        'ghunnah_2': 'ghunnah',
        'qalqalah': 'qalqalah',
        'qalaqah': 'qalqalah',
        'idgham_ghunnah': 'idgham',
        'idgham_no_ghunnah': 'idgham',
        'idgham_wo_ghunnah': 'idgham',
        'idgham_mutajanisayn': 'idgham',
        'idgham_mutaqaribayn': 'idgham',
        'ikhfa': 'ikhfa',
        'ikhfa_shafawi': 'ikhfa',
        'ikhafa': 'ikhfa',
        'iqlab': 'iqlab',
        'izhar': 'izhar',
        'izhar_shafawi': 'izhar',
        'izhar_halqi': 'izhar',
        'ham_wasl': 'other',
        'laam_shamsiyah': 'other',
        'silent': 'other',
        'slnt': 'other',
    };

    const category = categoryMap[ruleId];
    if (category && enabledLayers.includes(category)) {
        return true;
    }

    // Prefix checks
    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const prefix of prefixes) {
        if (ruleId.startsWith(prefix) && enabledLayers.includes(prefix)) {
            return true;
        }
    }

    if (ruleId.startsWith('madda') && enabledLayers.includes('madd')) {
        return true;
    }

    return false;
}

/**
 * Main parser function
 */
export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // 1. Clean up HTML
    const cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // 2. Character-level color mapping for uniform rendering
    let plainText = '';
    const colorMap: (string | null)[] = [];
    const ruleIdMap: (string | null)[] = [];

    const tagRegex = /<tajweed\s+class=["']?([^"'>\s]+)["']?>([^<]*)<\/tajweed>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        // Text before tag
        const beforeText = cleanHtml.substring(lastIndex, match.index);
        plainText += beforeText;
        for (let i = 0; i < beforeText.length; i++) {
            colorMap.push(null);
            ruleIdMap.push(null);
        }

        // Tag content
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

    // Remaining text
    const remainingText = cleanHtml.substring(lastIndex);
    plainText += remainingText;
    for (let i = 0; i < remainingText.length; i++) {
        colorMap.push(null);
        ruleIdMap.push(null);
    }

    // 3. Render word by word
    const words = plainText.split(/(\s+)/);
    let charOffset = 0;
    const result: React.ReactNode[] = [];
    let key = 0;

    for (const word of words) {
        if (word === '') continue;

        const wordColors = colorMap.slice(charOffset, charOffset + word.length);
        const wordRuleIds = ruleIdMap.slice(charOffset, charOffset + word.length);

        if (word.trim() === '') {
            result.push(<span key={key++}>{word}</span>);
        } else if (isIOS) {
            result.push(
                <TajweedCanvas
                    key={key++}
                    text={word}
                    colors={wordColors as (string | null)[]}
                    fontSize={26}
                    lineHeight={1.6}
                />
            );
        } else {
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
