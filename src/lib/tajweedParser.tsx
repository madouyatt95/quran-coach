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
 * Get color for a tajweed rule ID from central TAJWEED_RULES.
 */
function getTajweedColor(ruleId: string): string | null {
    const key = ruleId.toLowerCase();
    return TAJWEED_RULES[key]?.color || null;
}

/**
 * Check if a specific rule or its category is enabled.
 */
function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    if (enabledLayers.includes(ruleId)) return true;

    // Check categories (madd, ghunnah, etc.)
    const key = ruleId.toLowerCase();
    if (key.startsWith('madda') && enabledLayers.includes('madd')) return true;
    if ((key.startsWith('ghunnah') || key.startsWith('ikhfa')) && (enabledLayers.includes('ghunnah') || enabledLayers.includes('ikhfa'))) return true;
    if (key.startsWith('qalqalah') && enabledLayers.includes('qalqalah')) return true;
    if (key.startsWith('idgham') && enabledLayers.includes('idgham')) return true;
    if (key.startsWith('izhar') && enabledLayers.includes('izhar')) return true;
    if (key === 'iqlab' && enabledLayers.includes('iqlab')) return true;

    // Fallback for "other" category
    const otherRules = ['ham_wasl', 'laam_shamsiyah', 'silent', 'slnt'];
    if (otherRules.includes(key) && enabledLayers.includes('other')) return true;

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
            colorMap.push(null);
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
                    fontSize={24}
                    lineHeight={1.4}
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
