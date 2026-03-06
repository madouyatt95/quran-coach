import React, { useState } from 'react';
import { ACADEMY_GLOSSARY, SORTED_GLOSSARY_KEYS } from '../data/glossary';
import './GlossaryText.css';

interface GlossaryTextProps {
    text: string;
}

export function GlossaryText({ text }: GlossaryTextProps) {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Fonction pour diviser le texte et injecter les composants GlossaryItem
    const renderContent = () => {
        if (!text) return null;

        let parts: (string | React.ReactNode)[] = [text];

        // Pour chaque terme du glossaire, on l'isole
        SORTED_GLOSSARY_KEYS.forEach((term) => {
            const regex = new RegExp(`\\b(${term})\\b`, 'gi');

            parts = (parts.flatMap((part: any): any[] => {
                if (typeof part !== 'string') return [part];

                const splitText = part.split(regex);
                return splitText.map((chunk, index) => {
                    // Les morceaux pairs sont le texte normal, les impairs sont les termes matchés
                    if (index % 2 !== 0 && chunk.toLowerCase() === term.toLowerCase()) {
                        return (
                            <span
                                key={`${term}-${index}`}
                                className="glossary-term-wrapper"
                                onMouseEnter={() => setActiveTooltip(term)}
                                onMouseLeave={() => setActiveTooltip(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTooltip(activeTooltip === term ? null : term);
                                }}
                            >
                                <span className="glossary-term">{chunk}</span>
                                {activeTooltip === term && (
                                    <div className="glossary-tooltip">
                                        <strong>{chunk}</strong>
                                        <p>{ACADEMY_GLOSSARY[term]}</p>
                                    </div>
                                )}
                            </span>
                        );
                    }
                    return chunk;
                });
            }) as any[]);
        });

        // Add line breaks properly
        const finalParts = (parts.flatMap((part: any, i: number): any[] => {
            if (typeof part === 'string') {
                return part.split('\n').flatMap((line: string, j: number, arr: string[]): any[] =>
                    j < arr.length - 1 ? [line, <br key={`br-${i}-${j}`} />] : [line]
                );
            }
            return [part];
        }) as any[]);

        return finalParts;
    };

    return <>{renderContent()}</>;
}
