import { useRef } from 'react';
import type { Prophet } from '../../data/prophets';
import './ProphetsTimelineBar.css';
import { motion } from 'framer-motion';

interface Props {
    prophets: Prophet[];
    onSelectProphet: (prophet: Prophet) => void;
}

export function ProphetsTimelineBar({ prophets, onSelectProphet }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="prophets-timeline-wrap">
            <h3 className="prophets-timeline-title">Chronologie Prophétique</h3>
            <div className="prophets-timeline-scroller" ref={containerRef}>
                <div className="prophets-timeline-track">
                    {prophets.map((prophet, i) => (
                        <div key={prophet.id} className="prophets-timeline-item">
                            {/* Dot/Icon */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="prophets-timeline-dot flex items-center justify-center shrink-0 w-12 h-12 rounded-full border-2 bg-[var(--color-surface)] shadow-lg"
                                style={{ borderColor: prophet.color }}
                                onClick={() => onSelectProphet(prophet)}
                            >
                                <span className="text-xl">{prophet.icon}</span>
                            </motion.button>

                            {/* Label */}
                            <div className="prophets-timeline-labels mt-2 text-center w-24">
                                <div className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{prophet.nameIslamic}</div>
                                <div className="text-[0.6rem] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis px-1">{prophet.period}</div>
                            </div>

                            {/* Connecting Line (except last) */}
                            {i < prophets.length - 1 && (
                                <div className="prophets-timeline-line absolute top-6 left-12 w-20 h-0.5 bg-gray-200/50 -z-10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
