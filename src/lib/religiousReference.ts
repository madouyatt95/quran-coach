export type ReligiousKind = 'Verset' | 'Hadith' | 'Invocation' | 'Récit' | 'Conseil pédagogique';

export interface ReligiousReference {
    kind: ReligiousKind;
    label: string;
    url?: string;
    pending: boolean;
}

/** A collection name alone is not an exact hadith citation. Never infer its number. */
export function religiousReference(kind: ReligiousKind, source?: string, sourceUrl?: string): ReligiousReference {
    const label = source?.trim() || 'Source non précisée';
    const verse = (kind === 'Verset' || kind === 'Invocation' ? /(?:^|\s)(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?$/ : /^(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?$/).exec(label);
    if (verse && Number(verse[1]) >= 1 && Number(verse[1]) <= 114 && Number(verse[2]) >= 1 && Number(verse[2]) <= 286)
        return { kind, label: `Coran · ${label}`, url: `https://quran.com/${verse[1]}/${verse[2]}`, pending: false };
    if (sourceUrl) {
        try {
            const url = new URL(sourceUrl);
            if (url.protocol === 'https:' && ['sunnah.com', 'quran.com', 'www.quran.com'].includes(url.hostname))
                return { kind, label, url: url.href, pending: false };
        } catch { /* Keep the source as an unverified bibliographic label. */ }
    }
    return { kind, label, pending: true };
}
