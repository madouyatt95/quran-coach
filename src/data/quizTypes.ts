// Quiz Duel — Types

export type QuizView =
    | 'home'        // Mode Selection (Solo, Duel, etc.) + Difficulty
    | 'solo-themes' // Theme selection (only for Solo)
    | 'custom-duel' // Theme selection for custom duel (Teacher mode)
    | 'daily'       // Daily Challenge
    | 'profile'     // User profile & customization
    | 'stats'       // Stats dashboard
    | 'badges'      // Badge gallery
    | 'leaderboard' // Global leaderboard
    | 'lobby'       // Waiting for opponent
    | 'join'        // Enter code to join
    | 'playing'     // Active quiz
    | 'feedback'    // Answer feedback (correct/wrong)
    | 'roundEnd'    // End of round summary
    | 'result';     // Final match result

export type QuizMode = 'solo' | 'duel' | 'sprint' | 'revision' | 'daily';

export interface QuizQuestion {
    id: string;
    theme: QuizThemeId;
    questionAr?: string;       // Arabic text (verse, dua, etc.)
    questionFr: string;        // Question text in French
    choices: string[];         // 2-4 answer choices
    correctIndex: number;      // Index of correct answer
    explanation?: string;      // Brief explanation shown after answer
    audioUrl?: string;         // Optional audio snippet URL
}

export type QuizThemeId =
    | 'prophets'
    | 'companions'
    | 'verses'
    | 'invocations'
    | 'structure'
    | 'ya-ayyuha'
    | 'stories'
    | 'geography'
    | 'virtues'
    | 'women'
    | 'pillars'
    | 'hadiths'
    | 'culture'
    | 'tawhid'
    | 'fiqh';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

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
    total_xp: number;
    level: number;
    title?: string;
    card_theme?: string; // CSS gradient string
}

export type PowerUpId = '50-50' | 'time-freeze' | 'second-chance';

export interface QuizPowerUp {
    id: PowerUpId;
    name: string;
    description: string;
    icon: string; // Emoji
    useLimit: number; // Usage count
}

export interface UserTitle {
    id: string;
    label: string;
    minLevel: number;
}

export interface QuizAnswer {
    questionId: string;
    chosenIndex: number;
    correct: boolean;
    timeMs: number;          // Time taken to answer
    theme?: QuizThemeId;     // For revision tracking
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

// ─── Theme Stats ─────────────────────────────────────────
export interface ThemeStats {
    attempts: number;
    correct: number;
    bestStreak: number;
    totalTimeMs: number;
    lastPlayed: number;     // timestamp
}

// ─── Badges ──────────────────────────────────────────────
export type BadgeId =
    | 'first_quiz'       // Play first quiz
    | 'streak_5'         // 5 correct in a row
    | 'streak_10'        // 10 correct in a row
    | 'perfect_round'    // 5/5 in a round
    | 'speed_demon'      // Answer in < 3s
    | 'master_prophets'  // 90%+ on Prophets
    | 'master_companions'// 90%+ on Companions
    | 'master_verses'    // 90%+ on Verses
    | 'master_invocations'// 90%+ on Invocations
    | 'master_structure' // 90%+ on Structure
    | 'master_ya_ayyuha' // 90%+ on Ya Ayyuha
    | 'duel_winner'      // Win first duel
    | 'duel_champion'    // Win 10 duels
    | 'marathon'         // Play 50 quizzes total
    | 'sprint_30'        // 30 correct in sprint
    | 'all_themes'       // Play all 6 themes
    | 'scholar';         // 500 correct total

export interface Badge {
    id: BadgeId;
    name: string;
    nameAr: string;
    description: string;
    emoji: string;
    condition: string;     // Human-readable condition
}

export const BADGES: Badge[] = [
    { id: 'first_quiz', name: 'Première Partie', nameAr: 'البداية', description: 'Joue ta première partie', emoji: '🎮', condition: '1 quiz joué' },
    { id: 'streak_5', name: 'En Feu', nameAr: 'مشتعل', description: '5 bonnes réponses consécutives', emoji: '🔥', condition: '5 streak' },
    { id: 'streak_10', name: 'Inarrêtable', nameAr: 'لا يُوقف', description: '10 bonnes réponses consécutives', emoji: '⚡', condition: '10 streak' },
    { id: 'perfect_round', name: 'Sans Faute', nameAr: 'كامل', description: '5/5 dans une partie', emoji: '💎', condition: '5/5' },
    { id: 'speed_demon', name: 'Éclair', nameAr: 'البرق', description: 'Réponds en moins de 3 secondes', emoji: '⚡', condition: '< 3s' },
    { id: 'master_prophets', name: 'Maître Prophètes', nameAr: 'عالم الأنبياء', description: '90%+ en Prophètes (min 20 Q)', emoji: '🕌', condition: '90%+ prophets' },
    { id: 'master_companions', name: 'Maître Compagnons', nameAr: 'عالم الصحابة', description: '90%+ en Compagnons (min 20 Q)', emoji: '⭐', condition: '90%+ companions' },
    { id: 'master_verses', name: 'Maître Versets', nameAr: 'عالم الآيات', description: '90%+ en Versets (min 20 Q)', emoji: '📖', condition: '90%+ verses' },
    { id: 'master_invocations', name: 'Maître Invocations', nameAr: 'عالم الأذكار', description: '90%+ en Invocations (min 20 Q)', emoji: '🤲', condition: '90%+ invocations' },
    { id: 'master_structure', name: 'Maître Structure', nameAr: 'عالم القرآن', description: '90%+ en Structure (min 20 Q)', emoji: '🏷️', condition: '90%+ structure' },
    { id: 'master_ya_ayyuha', name: 'Maître Yā Ayyuhā', nameAr: 'عالم يا أيها', description: '90%+ en Yā Ayyuhā (min 20 Q)', emoji: '📢', condition: '90%+ ya-ayyuha' },
    { id: 'duel_winner', name: 'Victorieux', nameAr: 'المنتصر', description: 'Gagne ton premier duel', emoji: '🏆', condition: '1 duel gagné' },
    { id: 'duel_champion', name: 'Champion', nameAr: 'البطل', description: 'Gagne 10 duels', emoji: '👑', condition: '10 duels gagnés' },
    { id: 'marathon', name: 'Marathonien', nameAr: 'الماراثون', description: 'Joue 50 parties au total', emoji: '🏃', condition: '50 quizzes' },
    { id: 'sprint_30', name: 'Sprinter Pro', nameAr: 'عداء محترف', description: '30 bonnes réponses en mode Sprint', emoji: '🚀', condition: '30 en sprint' },
    { id: 'all_themes', name: 'Polyvalent', nameAr: 'متعدد', description: 'Joue les 6 thèmes', emoji: '🌟', condition: '6 thèmes joués' },
    { id: 'scholar', name: 'Érudit', nameAr: 'العالم', description: '500 bonnes réponses au total', emoji: '🎓', condition: '500 correct' },
];

// ─── Leaderboard ─────────────────────────────────────────
export interface LeaderboardEntry {
    id: string;
    pseudo: string;
    avatar_emoji: string;
    total_score: number;
    total_correct: number;
    total_played: number;
    total_wins: number;
    sprint_best: number;
    updated_at: string;
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
    {
        id: 'stories',
        name: 'Récits & Sagesse',
        nameAr: 'قصص وعبر',
        emoji: '🦁',
        color: '#795548',
        gradient: 'linear-gradient(135deg, #3e2723, #795548)',
    },
    {
        id: 'geography',
        name: 'Géographie & Nations',
        nameAr: 'الجغرافيا والأمم',
        emoji: '🗺️',
        color: '#3F51B5',
        gradient: 'linear-gradient(135deg, #1a237e, #3F51B5)',
    },
    {
        id: 'virtues',
        name: 'Vertus des Sourates',
        nameAr: 'فضائل السور',
        emoji: '📜',
        color: '#607D8B',
        gradient: 'linear-gradient(135deg, #263238, #607D8B)',
    },
    {
        id: 'women',
        name: 'Femmes du Coran',
        nameAr: 'نساء في القرآن',
        emoji: '🧕',
        color: '#AD1457',
        gradient: 'linear-gradient(135deg, #880e4f, #AD1457)',
    },
    {
        id: 'pillars',
        name: 'Piliers & Pratique',
        nameAr: 'أركان الإسلام',
        emoji: '🕋',
        color: '#1B5E20',
        gradient: 'linear-gradient(135deg, #0d3b0d, #2E7D32)',
    },
    {
        id: 'hadiths',
        name: 'Hadiths Célèbres',
        nameAr: 'أحاديث مشهورة',
        emoji: '📿',
        color: '#BF360C',
        gradient: 'linear-gradient(135deg, #7f1d00, #BF360C)',
    },
    {
        id: 'culture',
        name: 'Culture Islamique',
        nameAr: 'الثقافة الإسلامية',
        emoji: '🌙',
        color: '#F9A825',
        gradient: 'linear-gradient(135deg, #e65100, #F9A825)',
    },
    {
        id: 'tawhid',
        name: 'Tawhid & Aqidah',
        nameAr: 'التوحيد والعقيدة',
        emoji: '☝️',
        color: '#006064',
        gradient: 'linear-gradient(135deg, #00363a, #006064)',
    },
    {
        id: 'fiqh',
        name: 'Fiqh & Jurisprudence',
        nameAr: 'الفقه الإسلامي',
        emoji: '⚖️',
        color: '#2E7D32',
        gradient: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
    },
];

// ─── Difficulty Config ───────────────────────────────────
export const DIFFICULTY_CONFIG: Record<QuizDifficulty, {
    label: string;
    emoji: string;
    choiceCount: number;
    timerSeconds: number;
    questionCount: number;
    scoreMultiplier: number;
}> = {
    easy: { label: 'Facile', emoji: '😊', choiceCount: 2, timerSeconds: 20, questionCount: 5, scoreMultiplier: 0.5 },
    medium: { label: 'Moyen', emoji: '💪', choiceCount: 4, timerSeconds: 15, questionCount: 5, scoreMultiplier: 1 },
    hard: { label: 'Expert', emoji: '🧠', choiceCount: 4, timerSeconds: 10, questionCount: 7, scoreMultiplier: 1.5 },
};
