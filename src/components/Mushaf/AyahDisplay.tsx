import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { playWordAudio } from '../../lib/wordAudioService';
import { fetchTajweedVerse } from '../../lib/tajweedService';
import { renderTajweedText } from '../../lib/tajweedParser';
import type { Ayah } from '../../types';

interface AyahDisplayProps {
    ayah: Ayah;
    showNumber?: boolean;
    isFocused?: boolean;
    onClick?: () => void;
    enableWordAudio?: boolean;
}

export function AyahDisplay({
    ayah,
    showNumber = true,
    isFocused = false,
    onClick,
    enableWordAudio = true
}: AyahDisplayProps) {
    const { tajwidEnabled, tajwidLayers } = useSettingsStore();
    const [playingWordIndex, setPlayingWordIndex] = useState<number | null>(null);
    const [tajweedHtml, setTajweedHtml] = useState<string | null>(null);

    // Fetch Tajweed text when ayah changes and Tajweed is enabled
    useEffect(() => {
        if (tajwidEnabled && tajwidLayers.length > 0) {
            fetchTajweedVerse(ayah.surah, ayah.numberInSurah)
                .then(setTajweedHtml)
                .catch(() => setTajweedHtml(null));
        } else {
            setTajweedHtml(null);
        }
    }, [ayah.surah, ayah.numberInSurah, tajwidEnabled, tajwidLayers.length]);

    // Split text into words for interactive playback
    const words = ayah.text.split(' ');

    const handleWordClick = async (wordIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!enableWordAudio) return;

        setPlayingWordIndex(wordIndex);

        try {
            await playWordAudio(
                ayah.surah,
                ayah.numberInSurah,
                wordIndex + 1, // 1-indexed
                () => setPlayingWordIndex(null)
            );
        } catch {
            setPlayingWordIndex(null);
        }
    };

    // Render content with Tajweed coloring from API
    const renderContent = () => {
        // If Tajweed is enabled and we have the HTML from API
        if (tajwidEnabled && tajwidLayers.length > 0 && tajweedHtml) {
            return renderTajweedText(tajweedHtml, tajwidLayers);
        }

        // Fallback: render plain text with word-level interactivity
        return words.map((word, index) => {
            const isPlaying = playingWordIndex === index;

            return (
                <span
                    key={index}
                    className={`ayah__word ${isPlaying ? 'ayah__word--playing' : ''} ${enableWordAudio ? 'ayah__word--clickable' : ''}`}
                    onClick={(e) => handleWordClick(index, e)}
                >
                    {word}
                    {index < words.length - 1 ? ' ' : ''}
                </span>
            );
        });
    };

    return (
        <span
            className={`ayah ${isFocused ? 'ayah--focused' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <span className="ayah__text">{renderContent()}</span>
            {showNumber && (
                <span className="ayah__number">{ayah.numberInSurah}</span>
            )}
        </span>
    );
}
