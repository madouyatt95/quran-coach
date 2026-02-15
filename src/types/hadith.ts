export type HadithCategory =
    | 'foi' | 'priere' | 'jeune' | 'coran' | 'dhikr'
    | 'comportement' | 'patience' | 'charite' | 'parents'
    | 'repentir' | 'science' | 'au_dela' | 'fraternite'
    | 'qudsi' | 'mariage' | 'commerce' | 'coeur' | 'mort'
    | 'prophete' | 'vendredi';

export interface HadithEntry {
    id: number;
    ar: string;
    fr: string;
    src: string; // 'B' = Bukhari, 'M' = Muslim, 'T' = Tirmidhi, 'BM' = both
    nar: string;
    cat: HadithCategory;
}

export interface HadithCategoryInfo {
    id: HadithCategory;
    name: string;
    nameAr: string;
    emoji: string;
    color: string;
}
