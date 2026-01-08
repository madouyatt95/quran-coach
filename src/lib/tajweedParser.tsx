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
                    style={{ color: rule.color }}
                    className="tajweed-highlight"
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
