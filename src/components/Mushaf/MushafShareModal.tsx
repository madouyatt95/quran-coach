import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Ayah } from '../../types';

interface MushafShareModalProps {
    ayah: Ayah;
    surahs: Array<{ number: number; englishName: string }>;
    translationMap: Map<number, string>;
    transliterationMap: Map<number, string>;
    showTranslation: boolean;
    showTransliteration: boolean;
    onClose: () => void;
}

export function MushafShareModal({
    ayah,
    surahs,
    translationMap,
    transliterationMap,
    showTranslation,
    showTransliteration,
    onClose,
}: MushafShareModalProps) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const surahName = surahs.find(s => s.number === ayah.surah)?.englishName || String(ayah.surah);

    const handleCopy = () => {
        const text = `${ayah.text}\n\n— ${surahName}, ${t('mushaf.verse', 'Verset')} ${ayah.numberInSurah}\n\nQuran Coach`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleShare = () => {
        const translation = showTranslation ? translationMap.get(ayah.number) : '';
        const text = `${ayah.text}\n${translation ? `\n${translation}\n` : ''}\n— ${surahName}, ${t('mushaf.verse', 'Verset')} ${ayah.numberInSurah}`;
        navigator.share({ title: `${surahName} — ${t('mushaf.verse', 'Verset')} ${ayah.numberInSurah}`, text }).catch(() => { });
        onClose();
    };

    return (
        <>
            <div className="mih-share-overlay" onClick={onClose} />
            <div className="mih-share-modal">
                <div className="mih-share-modal__header">
                    <Share2 size={18} />
                    <span>{t('mushaf.shareVerse', 'Partager le verset')}</span>
                    <button onClick={onClose}><X size={18} /></button>
                </div>
                <div className="mih-share-modal__ref">
                    {t('mushaf.surah', 'Sourate')} {surahName}, {t('mushaf.verse', 'Verset')} {ayah.numberInSurah}
                </div>
                <div className="mih-share-modal__text" dir="rtl">{ayah.text}</div>
                {showTransliteration && transliterationMap.get(ayah.number) && (
                    <div className="mih-share-modal__transliteration" style={{ fontStyle: 'italic', color: '#ab9a6c', margin: '8px 0' }}>
                        {transliterationMap.get(ayah.number)}
                    </div>
                )}
                {showTranslation && translationMap.get(ayah.number) && (
                    <div className="mih-share-modal__translation">{translationMap.get(ayah.number)}</div>
                )}
                <div className="mih-share-modal__actions">
                    <button className="mih-share-modal__btn" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? t('common.copied', 'Copié !') : t('common.copy', 'Copier')}
                    </button>
                    {'share' in navigator && (
                        <button className="mih-share-modal__btn mih-share-modal__btn--primary" onClick={handleShare}>
                            <Share2 size={16} />
                            {t('common.share', 'Partager')}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
