// ─── Circle Store (Cercle de Lecture Virtuel) ────────────
// Manages reading circles: create, join, track progress

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CircleMember {
    id: string;
    name: string;
    emoji: string;
    joinedAt: number;
    pagesRead: number;
    lastActivity?: number;
}

export interface CircleActivity {
    id: string;
    memberId: string;
    memberName: string;
    type: 'pages' | 'khatm' | 'join' | 'milestone';
    message: string;
    timestamp: number;
}

export interface ReadingCircle {
    id: string;
    name: string;
    emoji: string;
    createdAt: number;
    goal: string; // e.g. "Khatm en 30 jours"
    totalPages: number; // 604 for full Quran
    members: CircleMember[];
    activities: CircleActivity[];
    inviteCode: string;
}

interface CircleState {
    myCircles: ReadingCircle[];
    myName: string;
    myEmoji: string;

    // Actions
    setProfile: (name: string, emoji: string) => void;
    createCircle: (name: string, emoji: string, goal: string) => ReadingCircle;
    joinCircle: (inviteCode: string) => boolean;
    leaveCircle: (circleId: string) => void;
    logPages: (circleId: string, pages: number) => void;
    getCircle: (circleId: string) => ReadingCircle | undefined;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MEMBER_EMOJIS = ['🌙', '⭐', '🌟', '💎', '🕌', '📿', '🤲', '☪️', '🏅', '🎯'];

export const useCircleStore = create<CircleState>()(
    persist(
        (set, get) => ({
            myCircles: [],
            myName: '',
            myEmoji: '🌙',

            setProfile: (name, emoji) => set({ myName: name, myEmoji: emoji }),

            createCircle: (name, emoji, goal) => {
                const state = get();
                const memberName = state.myName || 'Moi';
                const circle: ReadingCircle = {
                    id: generateId(),
                    name,
                    emoji,
                    createdAt: Date.now(),
                    goal,
                    totalPages: 604,
                    inviteCode: generateInviteCode(),
                    members: [{
                        id: 'me',
                        name: memberName,
                        emoji: state.myEmoji,
                        joinedAt: Date.now(),
                        pagesRead: 0,
                    }],
                    activities: [{
                        id: generateId(),
                        memberId: 'me',
                        memberName,
                        type: 'join',
                        message: `${memberName} a créé le cercle "${name}"`,
                        timestamp: Date.now(),
                    }],
                };
                set((s) => ({ myCircles: [...s.myCircles, circle] }));
                return circle;
            },

            joinCircle: (inviteCode) => {
                const state = get();
                // In the local-only version, this simulates joining via code
                // With Supabase, this would look up the circle by invite code
                const existing = state.myCircles.find(c => c.inviteCode === inviteCode);
                if (existing) return false; // Already in this circle

                // Simulate joining a demo circle (in production, this would fetch from Supabase)
                const memberName = state.myName || 'Nouveau Membre';
                const demoCircle: ReadingCircle = {
                    id: generateId(),
                    name: 'Cercle ' + inviteCode,
                    emoji: '📖',
                    createdAt: Date.now() - 86400000,
                    goal: 'Khatm collectif',
                    totalPages: 604,
                    inviteCode,
                    members: [
                        { id: 'demo1', name: 'Ahmad', emoji: '🌙', joinedAt: Date.now() - 86400000, pagesRead: 45 },
                        { id: 'demo2', name: 'Fatima', emoji: '⭐', joinedAt: Date.now() - 72000000, pagesRead: 32 },
                        { id: 'me', name: memberName, emoji: state.myEmoji, joinedAt: Date.now(), pagesRead: 0 },
                    ],
                    activities: [
                        { id: generateId(), memberId: 'demo1', memberName: 'Ahmad', type: 'pages', message: 'Ahmad a lu 15 pages', timestamp: Date.now() - 3600000 },
                        { id: generateId(), memberId: 'demo2', memberName: 'Fatima', type: 'milestone', message: 'Fatima a atteint le Juz 2 !', timestamp: Date.now() - 7200000 },
                        { id: generateId(), memberId: 'me', memberName, type: 'join', message: `${memberName} a rejoint le cercle`, timestamp: Date.now() },
                    ],
                };

                set((s) => ({ myCircles: [...s.myCircles, demoCircle] }));
                return true;
            },

            leaveCircle: (circleId) => {
                set((s) => ({
                    myCircles: s.myCircles.filter(c => c.id !== circleId),
                }));
            },

            logPages: (circleId, pages) => {
                set((s) => ({
                    myCircles: s.myCircles.map(c => {
                        if (c.id !== circleId) return c;
                        const members = c.members.map(m =>
                            m.id === 'me'
                                ? { ...m, pagesRead: m.pagesRead + pages, lastActivity: Date.now() }
                                : m
                        );
                        const myMember = members.find(m => m.id === 'me');
                        const activities = [
                            {
                                id: generateId(),
                                memberId: 'me',
                                memberName: myMember?.name || 'Moi',
                                type: 'pages' as const,
                                message: `${myMember?.name || 'Moi'} a lu ${pages} page${pages > 1 ? 's' : ''}`,
                                timestamp: Date.now(),
                            },
                            ...c.activities,
                        ];
                        return { ...c, members, activities: activities.slice(0, 50) };
                    }),
                }));
            },

            getCircle: (circleId) => {
                return get().myCircles.find(c => c.id === circleId);
            },
        }),
        { name: 'circle-store' }
    )
);

export { MEMBER_EMOJIS };
