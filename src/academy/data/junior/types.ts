// ─── Académie Junior — Types ─────────────────────────────

export interface JuniorQuizQuestion {
    question: string;
    options: string[];
    answer: number; // 0-indexed
    feedback: string;
}

export type JuniorActivityType = 'order' | 'match' | 'fill' | 'truefalse';

export interface JuniorActivity {
    type: JuniorActivityType;
    instruction: string;
    // For 'order': items to reorder
    items?: string[];
    correctOrder?: number[];
    // For 'match': pairs to connect
    pairs?: { left: string; right: string }[];
    // For 'truefalse': statements
    statements?: { text: string; correct: boolean }[];
    // For 'fill': sentence with blank
    sentence?: string;
    blank?: string;
    options?: string[];
}

export interface JuniorStep {
    id: string;
    number: number;
    title: string;
    emoji: string;
    // Lesson
    lessonTitle: string;
    lessonBody: string;
    verse?: string;
    versePhonetic?: string;
    verseTranslation?: string;
    verseRef?: string;
    hadith?: string;
    hadithPhonetic?: string;
    hadithTranslation?: string;
    hadithRef?: string;
    illustration: string; // emoji-based illustration key
    // Interactive Activity
    activity: JuniorActivity;
    // Mini Quiz
    quiz: JuniorQuizQuestion[];
}

export interface JuniorModule {
    id: string;
    title: string;
    emoji: string;
    description: string;
    color: string; // gradient color
    steps: JuniorStep[];
    badge: {
        emoji: string;
        title: string;
    };
}
