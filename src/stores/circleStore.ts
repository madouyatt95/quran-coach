// ─── Circle Store (Cercle de Lecture Virtuel) ────────────
// Manages reading circles via Supabase: create, join, track progress

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
    goal: string;
    totalPages: number;
    members: CircleMember[];
    activities: CircleActivity[];
    inviteCode: string;
}

interface CircleState {
    myCircles: ReadingCircle[];
    myName: string;
    myEmoji: string;
    myDeviceId: string;
    loading: boolean;
    error: string;

    // Actions
    setProfile: (name: string, emoji: string) => void;
    createCircle: (name: string, emoji: string, goal: string) => Promise<ReadingCircle | null>;
    joinCircle: (inviteCode: string) => Promise<{ success: boolean; error?: string; circleId?: string }>;
    leaveCircle: (circleId: string) => Promise<void>;
    logPages: (circleId: string, pages: number) => Promise<void>;
    refreshCircles: () => Promise<void>;
    getCircle: (circleId: string) => ReadingCircle | undefined;
}

function generateDeviceId(): string {
    const stored = localStorage.getItem('qc-device-id');
    if (stored) return stored;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('qc-device-id', id);
    return id;
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
            myDeviceId: generateDeviceId(),
            loading: false,
            error: '',

            setProfile: (name, emoji) => set({ myName: name, myEmoji: emoji }),

            createCircle: async (name, emoji, goal) => {
                const state = get();
                const memberName = state.myName || 'Moi';
                const inviteCode = generateInviteCode();
                set({ loading: true, error: '' });

                try {
                    // 1. Insert the circle
                    const { data: circleData, error: circleError } = await supabase
                        .from('reading_circles')
                        .insert({
                            name,
                            emoji,
                            goal,
                            total_pages: 604,
                            invite_code: inviteCode,
                        })
                        .select()
                        .single();

                    if (circleError) throw circleError;

                    // 2. Insert the creator as a member
                    const { error: memberError } = await supabase
                        .from('circle_members')
                        .insert({
                            circle_id: circleData.id,
                            device_id: state.myDeviceId,
                            name: memberName,
                            emoji: state.myEmoji,
                            pages_read: 0,
                        });

                    if (memberError) throw memberError;

                    // 3. Insert join activity
                    await supabase.from('circle_activities').insert({
                        circle_id: circleData.id,
                        member_device_id: state.myDeviceId,
                        member_name: memberName,
                        type: 'join',
                        message: `${memberName} a créé le cercle "${name}"`,
                    });

                    // 4. Build local circle and update store
                    const circle: ReadingCircle = {
                        id: circleData.id,
                        name,
                        emoji,
                        createdAt: Date.now(),
                        goal,
                        totalPages: 604,
                        inviteCode,
                        members: [{
                            id: state.myDeviceId,
                            name: memberName,
                            emoji: state.myEmoji,
                            joinedAt: Date.now(),
                            pagesRead: 0,
                        }],
                        activities: [{
                            id: crypto.randomUUID?.() || Date.now().toString(),
                            memberId: state.myDeviceId,
                            memberName,
                            type: 'join',
                            message: `${memberName} a créé le cercle "${name}"`,
                            timestamp: Date.now(),
                        }],
                    };

                    set((s) => ({ myCircles: [...s.myCircles, circle], loading: false }));
                    return circle;
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
                    set({ loading: false, error: msg });
                    console.error('createCircle error:', err);
                    return null;
                }
            },

            joinCircle: async (inviteCode) => {
                const state = get();
                set({ loading: true, error: '' });

                try {
                    // 1. Look up the circle by invite code
                    const { data: circleData, error: findError } = await supabase
                        .from('reading_circles')
                        .select('*')
                        .eq('invite_code', inviteCode.toUpperCase())
                        .single();

                    if (findError || !circleData) {
                        set({ loading: false });
                        return { success: false, error: 'Code invalide — aucun cercle trouvé.' };
                    }

                    // 2. Check if already a member
                    const { data: existingMember } = await supabase
                        .from('circle_members')
                        .select('id')
                        .eq('circle_id', circleData.id)
                        .eq('device_id', state.myDeviceId)
                        .maybeSingle();

                    if (existingMember) {
                        set({ loading: false });
                        return { success: false, error: 'Vous avez déjà rejoint ce cercle.' };
                    }

                    // 3. Insert as new member
                    const memberName = state.myName || 'Nouveau Membre';
                    const { error: memberError } = await supabase
                        .from('circle_members')
                        .insert({
                            circle_id: circleData.id,
                            device_id: state.myDeviceId,
                            name: memberName,
                            emoji: state.myEmoji,
                            pages_read: 0,
                        });

                    if (memberError) throw memberError;

                    // 4. Insert join activity
                    await supabase.from('circle_activities').insert({
                        circle_id: circleData.id,
                        member_device_id: state.myDeviceId,
                        member_name: memberName,
                        type: 'join',
                        message: `${memberName} a rejoint le cercle`,
                    });

                    // 5. Fetch all members to build local state
                    const { data: members } = await supabase
                        .from('circle_members')
                        .select('*')
                        .eq('circle_id', circleData.id)
                        .order('joined_at', { ascending: true });

                    const { data: activities } = await supabase
                        .from('circle_activities')
                        .select('*')
                        .eq('circle_id', circleData.id)
                        .order('created_at', { ascending: false })
                        .limit(50);

                    const circle: ReadingCircle = {
                        id: circleData.id,
                        name: circleData.name,
                        emoji: circleData.emoji,
                        createdAt: new Date(circleData.created_at).getTime(),
                        goal: circleData.goal,
                        totalPages: circleData.total_pages,
                        inviteCode: circleData.invite_code,
                        members: (members || []).map(m => ({
                            id: m.device_id,
                            name: m.name,
                            emoji: m.emoji,
                            joinedAt: new Date(m.joined_at).getTime(),
                            pagesRead: m.pages_read,
                            lastActivity: m.last_activity ? new Date(m.last_activity).getTime() : undefined,
                        })),
                        activities: (activities || []).map(a => ({
                            id: a.id,
                            memberId: a.member_device_id,
                            memberName: a.member_name,
                            type: a.type,
                            message: a.message,
                            timestamp: new Date(a.created_at).getTime(),
                        })),
                    };

                    set((s) => ({
                        myCircles: [...s.myCircles.filter(c => c.id !== circle.id), circle],
                        loading: false,
                    }));

                    return { success: true, circleId: circle.id };
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erreur lors de la connexion';
                    set({ loading: false, error: msg });
                    console.error('joinCircle error:', err);
                    return { success: false, error: msg };
                }
            },

            leaveCircle: async (circleId) => {
                const state = get();
                try {
                    await supabase
                        .from('circle_members')
                        .delete()
                        .eq('circle_id', circleId)
                        .eq('device_id', state.myDeviceId);

                    set((s) => ({
                        myCircles: s.myCircles.filter(c => c.id !== circleId),
                    }));
                } catch (err) {
                    console.error('leaveCircle error:', err);
                }
            },

            logPages: async (circleId, pages) => {
                const state = get();

                try {
                    // 1. Get current member
                    const { data: member } = await supabase
                        .from('circle_members')
                        .select('pages_read')
                        .eq('circle_id', circleId)
                        .eq('device_id', state.myDeviceId)
                        .single();

                    if (!member) return;

                    const newTotal = member.pages_read + pages;

                    // 2. Update pages
                    await supabase
                        .from('circle_members')
                        .update({ pages_read: newTotal, last_activity: new Date().toISOString() })
                        .eq('circle_id', circleId)
                        .eq('device_id', state.myDeviceId);

                    // 3. Add activity
                    const memberName = state.myName || 'Moi';
                    await supabase.from('circle_activities').insert({
                        circle_id: circleId,
                        member_device_id: state.myDeviceId,
                        member_name: memberName,
                        type: 'pages',
                        message: `${memberName} a lu ${pages} page${pages > 1 ? 's' : ''}`,
                    });

                    // 4. Update local state
                    set((s) => ({
                        myCircles: s.myCircles.map(c => {
                            if (c.id !== circleId) return c;
                            const members = c.members.map(m =>
                                m.id === state.myDeviceId
                                    ? { ...m, pagesRead: newTotal, lastActivity: Date.now() }
                                    : m
                            );
                            const activity: CircleActivity = {
                                id: crypto.randomUUID?.() || Date.now().toString(),
                                memberId: state.myDeviceId,
                                memberName,
                                type: 'pages',
                                message: `${memberName} a lu ${pages} page${pages > 1 ? 's' : ''}`,
                                timestamp: Date.now(),
                            };
                            return { ...c, members, activities: [activity, ...c.activities].slice(0, 50) };
                        }),
                    }));
                } catch (err) {
                    console.error('logPages error:', err);
                }
            },

            refreshCircles: async () => {
                const state = get();
                set({ loading: true });

                try {
                    // Fetch all circles where this device is a member
                    const { data: memberships } = await supabase
                        .from('circle_members')
                        .select('circle_id')
                        .eq('device_id', state.myDeviceId);

                    if (!memberships || memberships.length === 0) {
                        set({ myCircles: [], loading: false });
                        return;
                    }

                    const circleIds = memberships.map(m => m.circle_id);

                    const { data: circles } = await supabase
                        .from('reading_circles')
                        .select('*')
                        .in('id', circleIds);

                    if (!circles) {
                        set({ loading: false });
                        return;
                    }

                    const fullCircles: ReadingCircle[] = [];
                    for (const c of circles) {
                        const { data: members } = await supabase
                            .from('circle_members')
                            .select('*')
                            .eq('circle_id', c.id)
                            .order('joined_at', { ascending: true });

                        const { data: activities } = await supabase
                            .from('circle_activities')
                            .select('*')
                            .eq('circle_id', c.id)
                            .order('created_at', { ascending: false })
                            .limit(50);

                        fullCircles.push({
                            id: c.id,
                            name: c.name,
                            emoji: c.emoji,
                            createdAt: new Date(c.created_at).getTime(),
                            goal: c.goal,
                            totalPages: c.total_pages,
                            inviteCode: c.invite_code,
                            members: (members || []).map(m => ({
                                id: m.device_id,
                                name: m.name,
                                emoji: m.emoji,
                                joinedAt: new Date(m.joined_at).getTime(),
                                pagesRead: m.pages_read,
                                lastActivity: m.last_activity ? new Date(m.last_activity).getTime() : undefined,
                            })),
                            activities: (activities || []).map(a => ({
                                id: a.id,
                                memberId: a.member_device_id,
                                memberName: a.member_name,
                                type: a.type,
                                message: a.message,
                                timestamp: new Date(a.created_at).getTime(),
                            })),
                        });
                    }

                    set({ myCircles: fullCircles, loading: false });
                } catch (err) {
                    console.error('refreshCircles error:', err);
                    set({ loading: false });
                }
            },

            getCircle: (circleId) => {
                return get().myCircles.find(c => c.id === circleId);
            },
        }),
        { name: 'circle-store' }
    )
);

export { MEMBER_EMOJIS };
