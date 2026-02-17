import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// SM-2 Algorithm for Spaced Repetition
// Quality ratings: 0-5 (0-2 = fail, 3-5 = pass)

export interface SRSCard {
    id: string; // Format: "surah:ayah" or "surah:ayahStart-ayahEnd"
    surah: number;
    ayah: number;
    ayahEnd?: number; // Optional end ayah for segments (undefined = single ayah)
    easeFactor: number; // >= 1.3, starts at 2.5
    interval: number; // Days until next review
    repetitions: number; // Consecutive correct reviews
    nextReviewDate: string; // ISO date string
    lastReviewDate: string | null;
    addedDate: string;
}

export interface SRSState {
    cards: Record<string, SRSCard>;

    // Actions
    addCard: (surah: number, ayah: number) => void;
    addSegmentCard: (surah: number, ayahStart: number, ayahEnd: number) => void;
    reviewCard: (cardId: string, quality: number) => void;
    removeCard: (cardId: string) => void;
    getDueCards: () => SRSCard[];
    getCardsBysurah: (surah: number) => SRSCard[];
    isCardDue: (cardId: string) => boolean;
    getNextReviewDate: (cardId: string) => string | null;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

// SM-2 Algorithm implementation
function calculateNextReview(card: SRSCard, quality: number): Partial<SRSCard> {
    // Quality: 0=complete blackout, 1=wrong, 2=wrong but recognized, 
    //          3=correct with difficulty, 4=correct, 5=perfect

    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
        // Failed - reset
        repetitions = 0;
        interval = 1;
    } else {
        // Passed
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 3;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
    }

    // Update ease factor (minimum 1.3)
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
        easeFactor,
        interval,
        repetitions,
        nextReviewDate: nextDate.toISOString().split('T')[0],
        lastReviewDate: getTodayDate(),
    };
}

export const useSRSStore = create<SRSState>()(
    persist(
        (set, get) => ({
            cards: {},

            addCard: (surah, ayah) => {
                const id = `${surah}:${ayah}`;
                const today = getTodayDate();

                if (get().cards[id]) return; // Already exists

                const newCard: SRSCard = {
                    id,
                    surah,
                    ayah,
                    easeFactor: 2.5,
                    interval: 0,
                    repetitions: 0,
                    nextReviewDate: today, // Due immediately
                    lastReviewDate: null,
                    addedDate: today,
                };

                set((state) => ({
                    cards: { ...state.cards, [id]: newCard }
                }));
            },

            addSegmentCard: (surah, ayahStart, ayahEnd) => {
                const id = `${surah}:${ayahStart}-${ayahEnd}`;
                const today = getTodayDate();

                if (get().cards[id]) return; // Already exists

                const newCard: SRSCard = {
                    id,
                    surah,
                    ayah: ayahStart,
                    ayahEnd,
                    easeFactor: 2.5,
                    interval: 0,
                    repetitions: 0,
                    nextReviewDate: today,
                    lastReviewDate: null,
                    addedDate: today,
                };

                set((state) => ({
                    cards: { ...state.cards, [id]: newCard }
                }));
            },

            reviewCard: (cardId, quality) => {
                const card = get().cards[cardId];
                if (!card) return;

                const updates = calculateNextReview(card, quality);

                set((state) => ({
                    cards: {
                        ...state.cards,
                        [cardId]: { ...card, ...updates }
                    }
                }));
            },

            removeCard: (cardId) => {
                set((state) => {
                    const { [cardId]: _, ...rest } = state.cards;
                    return { cards: rest };
                });
            },

            getDueCards: () => {
                const today = getTodayDate();
                return Object.values(get().cards)
                    .filter(card => card.nextReviewDate <= today)
                    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
            },

            getCardsBysurah: (surah) => {
                return Object.values(get().cards)
                    .filter(card => card.surah === surah)
                    .sort((a, b) => a.ayah - b.ayah);
            },

            isCardDue: (cardId) => {
                const card = get().cards[cardId];
                if (!card) return false;
                return card.nextReviewDate <= getTodayDate();
            },

            getNextReviewDate: (cardId) => {
                const card = get().cards[cardId];
                return card?.nextReviewDate || null;
            },
        }),
        {
            name: 'quran-coach-srs',
        }
    )
);

// Helper to get quality label
export const QUALITY_LABELS = [
    { value: 0, label: 'Oublié', emoji: '😵', color: '#ef4444' },
    { value: 1, label: 'Erreur', emoji: '😟', color: '#f97316' },
    { value: 2, label: 'Difficile', emoji: '😓', color: '#eab308' },
    { value: 3, label: 'Passable', emoji: '🤔', color: '#84cc16' },
    { value: 4, label: 'Bien', emoji: '😊', color: '#22c55e' },
    { value: 5, label: 'Parfait', emoji: '🌟', color: '#10b981' },
];
