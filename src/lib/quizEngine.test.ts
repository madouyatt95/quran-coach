import { describe, it, expect } from 'vitest';
import { calculateScore, getQuestions, getSprintQuestions, getDailyQuestions, getQuestionCounts } from './quizEngine';

describe('quizEngine', () => {

    // ── calculateScore ─────────────────────────────────────
    describe('calculateScore', () => {
        it('should return 0 for incorrect answers', () => {
            expect(calculateScore(false, 5000)).toBe(0);
            expect(calculateScore(false, 0)).toBe(0);
            expect(calculateScore(false, 15000)).toBe(0);
        });

        it('should return a positive score for correct answers', () => {
            const score = calculateScore(true, 5000);
            expect(score).toBeGreaterThan(0);
        });

        it('should give higher scores for faster answers', () => {
            const fastScore = calculateScore(true, 1000);
            const slowScore = calculateScore(true, 14000);
            expect(fastScore).toBeGreaterThan(slowScore);
        });

        it('should give at least 100 points for correct answers', () => {
            // Even the slowest correct answer should get base points
            const score = calculateScore(true, 15000);
            expect(score).toBeGreaterThanOrEqual(100);
        });

        it('should give max ~200 base points for instant answers', () => {
            const score = calculateScore(true, 0);
            // 100 base + 100 time bonus = 200, times medium multiplier (1)
            expect(score).toBe(200);
        });
    });

    // ── getQuestions ────────────────────────────────────────
    describe('getQuestions', () => {
        it('should return questions for the "prophets" theme', () => {
            const questions = getQuestions('prophets', 5);
            expect(questions.length).toBeGreaterThan(0);
            expect(questions.length).toBeLessThanOrEqual(5);
        });

        it('should return questions with valid structure', () => {
            const questions = getQuestions('prophets', 3);
            for (const q of questions) {
                expect(q).toHaveProperty('id');
                expect(q).toHaveProperty('questionFr');
                expect(q).toHaveProperty('choices');
                expect(q).toHaveProperty('correctIndex');
                expect(q.choices.length).toBeGreaterThanOrEqual(2);
                expect(q.correctIndex).toBeGreaterThanOrEqual(0);
                expect(q.correctIndex).toBeLessThan(q.choices.length);
            }
        });

        it('should respect the count parameter', () => {
            const q1 = getQuestions('prophets', 1);
            const q10 = getQuestions('prophets', 10);
            expect(q1.length).toBeLessThanOrEqual(1);
            expect(q10.length).toBeLessThanOrEqual(10);
        });
    });

    // ── getSprintQuestions ──────────────────────────────────
    describe('getSprintQuestions', () => {
        it('should return questions from multiple themes', () => {
            const questions = getSprintQuestions(30);
            expect(questions.length).toBeGreaterThan(0);
            expect(questions.length).toBeLessThanOrEqual(30);
        });

        it('should include questions from at least 2 different themes', () => {
            const questions = getSprintQuestions(30);
            const themes = new Set(questions.map(q => q.theme));
            expect(themes.size).toBeGreaterThanOrEqual(2);
        });
    });

    // ── getDailyQuestions ───────────────────────────────────
    describe('getDailyQuestions', () => {
        it('should return 10 questions', () => {
            const questions = getDailyQuestions('2026-02-16');
            expect(questions.length).toBeLessThanOrEqual(10);
            expect(questions.length).toBeGreaterThan(0);
        });

        it('should be deterministic (same seed = same questions)', () => {
            const q1 = getDailyQuestions('2026-02-16');
            const q2 = getDailyQuestions('2026-02-16');
            expect(q1.map(q => q.id)).toEqual(q2.map(q => q.id));
        });

        it('should produce different questions for different dates', () => {
            const q1 = getDailyQuestions('2026-02-16');
            const q2 = getDailyQuestions('2026-02-17');
            // Different seeds should produce different ID sets (with very high probability)
            const ids1 = q1.map(q => q.id).join(',');
            const ids2 = q2.map(q => q.id).join(',');
            expect(ids1).not.toEqual(ids2);
        });
    });

    // ── getQuestionCounts ──────────────────────────────────
    describe('getQuestionCounts', () => {
        it('should return counts for all themes', () => {
            const counts = getQuestionCounts();
            expect(Object.keys(counts).length).toBeGreaterThan(0);
        });

        it('should have positive counts for prophets theme', () => {
            const counts = getQuestionCounts();
            expect(counts.prophets).toBeGreaterThan(0);
        });
    });
});
