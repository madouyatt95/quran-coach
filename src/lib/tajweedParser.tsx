import React from 'react';
import { TAJWEED_RULES } from './tajweedService';

/**
 * Parse Tajweed HTML from API and render as React elements
 * Only colorizes rules that are in the enabledLayers list
 */
export function renderTajweedText(
    tajweedHtml: string,
    enabledLayers: string[]
): React.ReactNode {
    if (!tajweedHtml) return null;

    // Parse the HTML and extract tajweed tags
    const result: React.ReactNode[] = [];
    let key = 0;

    // Regex to match <tajweed class=X>content</tajweed> and <span class=end>n</span>
    const tagRegex = /<(tajweed|span)\s+class=([^>]+)>([^<]*)<\/\1>/g;
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(tajweedHtml)) !== null) {
        // Add text before the tag
        if (match.index > lastIndex) {
            result.push(tajweedHtml.substring(lastIndex, match.index));
        }

        const tagType = match[1];
        const className = match[2];
        const content = match[3];

        if (tagType === 'span' && className === 'end') {
            // Verse number marker - render as special element
            result.push(
                <span key={key++} className="ayah__number-inline">
                    {content}
                </span>
            );
        } else if (tagType === 'tajweed') {
            // Tajweed rule - check if it's enabled
            const ruleId = className;
            const rule = TAJWEED_RULES[ruleId];

            // Check if this rule (or its category) is enabled
            const isEnabled = isRuleEnabled(ruleId, enabledLayers);

            if (isEnabled && rule) {
                result.push(
                    <span
                        key={key++}
                        style={{ color: rule.color }}
                        title={`${rule.name} - ${rule.description}`}
                        className="tajweed-highlight"
                    >
                        {content}
                    </span>
                );
            } else {
                // Rule not enabled, render without color
                result.push(content);
            }
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last tag
    if (lastIndex < tajweedHtml.length) {
        result.push(tajweedHtml.substring(lastIndex));
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

    // Category mapping - map rule IDs to their category
    const categoryMap: Record<string, string> = {
        'madda_normal': 'madd',
        'madda_permissible': 'madd',
        'madda_necessary': 'madd',
        'madda_obligatory': 'madd',
        'ghunnah': 'ghunnah',
        'qalqalah': 'qalqalah',
        'idgham_ghunnah': 'idgham',
        'idgham_no_ghunnah': 'idgham',
        'idgham_mutajanisayn': 'idgham',
        'idgham_mutaqaribayn': 'idgham',
        'ikhfa': 'ikhfa',
        'ikhfa_shafawi': 'ikhfa',
        'iqlab': 'iqlab',
        'izhar': 'izhar',
        'izhar_shafawi': 'izhar',
        'ham_wasl': 'other',
        'laam_shamsiyah': 'other',
        'silent': 'other',
    };

    const category = categoryMap[ruleId];
    return category ? enabledLayers.includes(category) : false;
}

/**
 * Strip all Tajweed tags and return plain text
 */
export function stripTajweedTags(tajweedHtml: string): string {
    if (!tajweedHtml) return '';
    // Remove all HTML tags
    return tajweedHtml.replace(/<[^>]+>/g, '');
}
