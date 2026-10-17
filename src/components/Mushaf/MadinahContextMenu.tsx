import React, { useEffect, useRef } from 'react';
import { Play, Pause, BookOpen, Share2, Copy, BookmarkPlus, Info, PanelTopOpen } from 'lucide-react';
import type { Ayah } from '../../types';
import './MadinahContextMenu.css';

interface MadinahContextMenuProps {
    ayah: Ayah;
    position: { x: number; y: number };
    isPlaying: boolean;
    onClose: () => void;
    onPlay: () => void;
    onTafsir: () => void;
    onAsbab: () => void;
    onHifdh: () => void;
    onVerseSheet: () => void;
    onShare: () => void;
    onCopy: () => void;
}

export function MadinahContextMenu({
    ayah,
    position,
    isPlaying,
    onClose,
    onPlay,
    onTafsir,
    onAsbab,
    onHifdh,
    onVerseSheet,
    onShare,
    onCopy
}: MadinahContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [onClose]);

    // Handle viewport overflow for position
    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        top: Math.max(12, Math.min(position.y, window.innerHeight - 390)),
        left: Math.max(12, Math.min(position.x, window.innerWidth - 252)),
        zIndex: 1000,
    };

    return (
        <>
            <div className="madinah-context-backdrop" onClick={onClose} />
            <div className="madinah-context-menu" style={menuStyle} ref={menuRef}>
                <div className="madinah-context-header">
                    <span>Verset {ayah.surah}:{ayah.numberInSurah}</span>
                </div>

                <button className="madinah-context-item" onClick={() => { onPlay(); onClose(); }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    <span>{isPlaying ? 'Mettre en pause' : 'Écouter'}</span>
                </button>

                <button className="madinah-context-item" onClick={() => { onTafsir(); onClose(); }}>
                    <BookOpen size={18} />
                    <span>Lire le Tafsir</span>
                </button>

                <button className="madinah-context-item" onClick={() => { onAsbab(); onClose(); }}>
                    <Info size={18} />
                    <span>Causes de Révélation</span>
                </button>

                <div className="madinah-context-divider" />

                <button className="madinah-context-item" onClick={() => { onVerseSheet(); onClose(); }}>
                    <PanelTopOpen size={18} />
                    <span>Fiche du verset</span>
                </button>

                <button className="madinah-context-item" onClick={() => { onHifdh(); onClose(); }}>
                    <BookmarkPlus size={18} />
                    <span>Apprendre (Hifdh)</span>
                </button>

                <button className="madinah-context-item" onClick={() => { onShare(); onClose(); }}>
                    <Share2 size={18} />
                    <span>Partager</span>
                </button>

                <button className="madinah-context-item" onClick={() => { onCopy(); onClose(); }}>
                    <Copy size={18} />
                    <span>Copier (Arabe)</span>
                </button>
            </div>
        </>
    );
}
