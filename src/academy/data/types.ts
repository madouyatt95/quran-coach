// ─── Academy Data Types ──────────────────────────────────

export type AcademyLevelId = 'fondations' | 'pratique';

export interface LessonSection {
    title: string;
    body: string;
    arabic?: string;
    phonetic?: string;
    audioHint?: string; // text to feed TTS
}

export interface QuizQuestion {
    q: string;
    options: string[];
    answer: number; // 0-indexed
    explanation: string;
}

export interface AcademyLesson {
    type: 'lesson';
    title: string;
    sections: LessonSection[];
}

export interface AcademyQuiz {
    type: 'quiz';
    title: string;
    questions: QuizQuestion[];
    passThreshold: number; // 0-100, default 80
}

export type AcademyContent = AcademyLesson | AcademyQuiz;

export interface AcademyModule {
    id: string;
    icon: string;        // emoji
    image?: string;      // optional path to image
    title: string;
    titleAr: string;
    description: string;
    category: 'alphabet' | 'quran' | 'fiqh' | 'aqidah';
    difficulty: 1 | 2 | 3;
    estimatedMinutes: number;
    linkedSurah?: number; // connects to Hifdh memorization
    content: AcademyContent[];
}

export interface AcademyLevel {
    id: AcademyLevelId;
    title: string;
    titleAr: string;
    description: string;
    icon: string;
    gradient: string;
    modules: AcademyModule[];
}
