import React from 'react';
import { TAJWEED_RULES } from './tajweedService';

/**
 * Parse Tajweed HTML from API and render as React elements
 * Only colorizes rules that are in the enabledLayers list
 * Hides verse number markers (span.end)
 */
export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // Clean up the HTML - remove verse number markers completely
    // They appear as <span class=end>N</span> at the end
    let cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // Parse the HTML and extract tajweed tags
    const result: React.ReactNode[] = [];
    let key = 0;

    // Regex to match <tajweed class=X>content</tajweed>
    const tagRegex = /<tajweed\s+class=([^>]+)>([^<]*)<\/tajweed>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(cleanHtml)) !== null) {
        // Add text before the tag
        if (match.index > lastIndex) {
            result.push(cleanHtml.substring(lastIndex, match.index));
        }

        const className = match[1];
        const content = match[2];
        const ruleId = className;
        const rule = TAJWEED_RULES[ruleId];

        // Check if this rule (or its category) is enabled
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
            // Rule not enabled or unknown, render without color
            result.push(content);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last tag
    if (lastIndex < cleanHtml.length) {
        result.push(cleanHtml.substring(lastIndex));
    }

    return result;
}

/**
 * Render Tajweed HTML as clickable words
 * Splits the HTML by space while preserving tags
 */
export function renderTajweedWords(
    tajweedHtml: string,
    enabledLayers: string[],
    onWordClick: (wordIndex: number) => void,
    getWordClass: (wordIndex: number) => string
): React.ReactNode[] {
    if (!tajweedHtml) return [];

    // Clean up
    let cleanHtml = tajweedHtml.replace(/<span\s+class=end>[^<]*<\/span>/g, '');

    // Simple word splitting by space, but we need to keep tags intact
    // This is tricky: <tajweed class=X>word1 word2</tajweed>
    // We want: 
    // <span click index=0><tajweed class=X>word1</tajweed></span>
    // <span click index=1><tajweed class=X>word2</tajweed></span>

    const words: React.ReactNode[] = [];
    let currentWordIndex = 0;

    // First, let's tokenize the HTML into "active tags", "text", etc.
    // But a simpler way for Quran text: split the raw string by spaces.
    // If a space is inside a tag, we close the tag, add the space, and reopen the tag.

    // Normalize spaces and split
    const parts = cleanHtml.split(/(\s+)/);

    let activeTags: string[] = [];

    parts.forEach((part) => {
        if (part.trim() === '') {
            // It's a space or multiple spaces
            return;
        }

        // It's a "word" (might contain tags)
        const wordParts: React.ReactNode[] = [];
        let key = 0;

        // Regex to match tags or text
        const tokenRegex = /(<tajweed\s+class=[^>]+>)|(<\/tajweed>)|([^<]+)/g;
        let match;

        while ((match = tokenRegex.exec(part)) !== null) {
            if (match[1]) {
                // Opening tag
                const className = match[1].match(/class=([^>]+)/)?.[1] || '';
                activeTags.push(className);
            } else if (match[2]) {
                // Closing tag
                activeTags.pop();
            } else if (match[3]) {
                // Text content
                const content = match[3];
                const ruleId = activeTags.length > 0 ? activeTags[activeTags.length - 1] : null;
                const isEnabled = ruleId ? isRuleEnabled(ruleId, enabledLayers) : false;

                if (isEnabled && ruleId) {
                    wordParts.push(
                        <span key={key++} className={`tajweed-highlight tj-${ruleId}`}>
                            {content}
                        </span>
                    );
                } else {
                    wordParts.push(content);
                }
            }
        }

        // Wrap this whole word in a clickable span
        const wordIdx = currentWordIndex++;
        words.push(
            <span
                key={wordIdx}
                className={getWordClass(wordIdx)}
                onClick={(e) => {
                    e.stopPropagation();
                    onWordClick(wordIdx);
                }}
            >
                {wordParts}
                {' '}
            </span>
        );
    });

    return words;
}

/**
 * Check if a specific rule is enabled based on layer settings
 * Supports both direct rule IDs and category IDs
 */
function isRuleEnabled(ruleId: string, enabledLayers: string[]): boolean {
    // Direct match
    if (enabledLayers.includes(ruleId)) return true;

    // Category mapping - map API rule IDs to UI category IDs
    // Note: API uses different spellings for some rules
    const categoryMap: Record<string, string> = {
        // Madd (prolongation) - API uses "madda_" prefix
        'madda_normal': 'madd',
        'madda_permissible': 'madd',
        'madda_necessary': 'madd',
        'madda_obligatory': 'madd',
        'madd_2': 'madd',
        'madd_4': 'madd',
        'madd_6': 'madd',
        'madd_246': 'madd',
        'madd_munfasil': 'madd',
        'madd_muttasil': 'madd',

        // Ghunnah (nasalization)
        'ghunnah': 'ghunnah',
        'ghunnah_2': 'ghunnah',

        // Qalqalah (echo) - API uses "qalaqah" (different spelling!)
        'qalqalah': 'qalqalah',
        'qalaqah': 'qalqalah', // API spelling variant

        // Idgham (assimilation) - API uses "idgham_wo_ghunnah" not "no"
        'idgham_ghunnah': 'idgham',
        'idgham_no_ghunnah': 'idgham',
        'idgham_wo_ghunnah': 'idgham', // API spelling variant (wo = without)
        'idgham_mutajanisayn': 'idgham',
        'idgham_mutaqaribayn': 'idgham',
        'idgham_shafawi': 'idgham',

        // Ikhfa (concealment) - API uses "ikhafa" not "ikhfa"
        'ikhfa': 'ikhfa',
        'ikhfa_shafawi': 'ikhfa',
        'ikhafa': 'ikhfa', // API spelling variant
        'ikhafa_shafawi': 'ikhfa', // API spelling variant

        // Iqlab (conversion)
        'iqlab': 'iqlab',

        // Izhar (clarity)
        'izhar': 'izhar',
        'izhar_shafawi': 'izhar',
        'izhar_halqi': 'izhar',

        // Silent/other - these are minor rules, show if "other" layer is active
        'ham_wasl': 'other',
        'laam_shamsiyah': 'other',
        'silent': 'other',
        'slnt': 'other', // API uses abbreviated form
    };

    const category = categoryMap[ruleId];
    if (category && enabledLayers.includes(category)) {
        return true;
    }

    // If the rule starts with a known prefix, try to match it
    const prefixes = ['madd', 'ghunnah', 'qalqalah', 'idgham', 'ikhfa', 'iqlab', 'izhar'];
    for (const prefix of prefixes) {
        if (ruleId.startsWith(prefix) && enabledLayers.includes(prefix)) {
            return true;
        }
    }

    // Also check for madda_ prefix mapping to madd
    if (ruleId.startsWith('madda') && enabledLayers.includes('madd')) {
        return true;
    }

    return false;
}

/**
 * Strip all Tajweed tags and return plain text
 */
export function stripTajweedTags(tajweedHtml: string): string {
    if (!tajweedHtml) return '';
    // Remove all HTML tags
    return tajweedHtml.replace(/<[^>]+>/g, '');
}
