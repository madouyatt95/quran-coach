// Quiz Duel — Types

export interface QuizQuestion {
    id: string;
    theme: QuizThemeId;
    questionAr?: string;       // Arabic text (verse, dua, etc.)
    questionFr: string;        // Question text in French
    choices: string[];         // 4 answer choices
    correctIndex: number;      // Index of correct answer (0-3)
    explanation?: string;      // Brief explanation shown after answer
}

export type QuizThemeId =
    | 'prophets'
    | 'companions'
    | 'verses'
    | 'invocations'
    | 'structure'
    | 'ya-ayyuha';

export interface QuizTheme {
    id: QuizThemeId;
    name: string;
    nameAr: string;
    emoji: string;
    color: string;
    gradient: string;
}

export interface QuizPlayer {
    id: string;
    pseudo: string;
    avatar_emoji: string;
    total_wins: number;
    total_played: number;
}

export interface QuizAnswer {
    questionId: string;
    chosenIndex: number;
    correct: boolean;
    timeMs: number;          // Time taken to answer
}

export interface QuizMatch {
    id: string;
    code: string;
    status: 'waiting' | 'playing' | 'finished';
    theme: QuizThemeId;
    questions: QuizQuestion[];
    round: number;
    player1_id: string | null;
    player2_id: string | null;
    player1_answers: QuizAnswer[];
    player2_answers: QuizAnswer[];
    player1_score: number;
    player2_score: number;
    winner_id: string | null;
    created_at: string;
}

export const QUIZ_THEMES: QuizTheme[] = [
    {
        id: 'prophets',
        name: 'Prophètes',
        nameAr: 'الأنبياء',
        emoji: '🕌',
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #1b5e20, #4CAF50)',
    },
    {
        id: 'companions',
        name: 'Compagnons',
        nameAr: 'الصحابة',
        emoji: '⭐',
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #e65100, #FF9800)',
    },
    {
        id: 'verses',
        name: 'Versets & Thèmes',
        nameAr: 'الآيات',
        emoji: '📖',
        color: '#2196F3',
        gradient: 'linear-gradient(135deg, #0d47a1, #2196F3)',
    },
    {
        id: 'invocations',
        name: 'Invocations',
        nameAr: 'الأذكار',
        emoji: '🤲',
        color: '#9C27B0',
        gradient: 'linear-gradient(135deg, #4a148c, #9C27B0)',
    },
    {
        id: 'structure',
        name: 'Structure du Coran',
        nameAr: 'هيكل القرآن',
        emoji: '🏷️',
        color: '#00BCD4',
        gradient: 'linear-gradient(135deg, #006064, #00BCD4)',
    },
    {
        id: 'ya-ayyuha',
        name: 'Ô vous qui croyez',
        nameAr: 'يا أيها الذين آمنوا',
        emoji: '📢',
        color: '#E91E63',
        gradient: 'linear-gradient(135deg, #880e4f, #E91E63)',
    },
];
