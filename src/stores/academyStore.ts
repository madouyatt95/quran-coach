// ─── Academy Store (Premium Redesign) ────────────────────
// Tracks user progress through the 2-level Academy modules

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModuleProgress {
    completed: boolean;
    score: number; // 0-100
    completedAt?: number;
    // Feature 1: Saved position for resume
    lastContentIdx?: number;
    lastSectionIdx?: number;
    lastVisitedAt?: number;
    answers?: Record<string,number>;
    quizIdx?: number;
    // Feature 3: Spaced repetition
    reviewDue?: number; // timestamp when review is due
    reviewCount?: number;
}

interface AcademyState {
    currentModule: string | null;
    progress: Record<string, ModuleProgress>;
    unlockedModules: string[];
    totalXp: number;
    profile: {level:'beginner'|'reader'|'advanced';goal:'read'|'practice'|'understand'} | null;
    reviews: Record<string,{due:number;interval:number;mistakes:number}>;
    notes: Record<string,string>;
    activities: Record<string,{index:number;chosen:number|null;correct:number}>;
    lessonStages: Record<string,number>;
    practice: Record<string,{choice?:number;order?:number[];done?:boolean}>;
    notebook: Record<string,{understood:string;distinction:string;example:string;review:string;updatedAt:number}>;
    mastery: Record<string,{due:number;confirmedAt?:number;attempts:number}>;
    saveActivity:(key:string,value:{index:number;chosen:number|null;correct:number})=>void;
    saveLessonStage:(key:string,stage:number)=>void;
    savePractice:(key:string,value:{choice?:number;order?:number[];done?:boolean})=>void;
    saveNotebook:(module:string,field:'understood'|'distinction'|'example'|'review',text:string)=>void;
    startNotebook:(module:string,seed:{understood?:string;example?:string;review?:string})=>void;
    answerMastery:(module:string,correct:boolean)=>void;
    setProfile: (profile: NonNullable<AcademyState['profile']>)=>void;
    recordAnswer: (module:string,key:string,answer:number,correct:boolean)=>void;
    resetAttempt: (module:string)=>void;
    saveQuiz: (module:string,content:number,question:number)=>void;
    reviewAnswer: (key:string,correct:boolean)=>void;
    saveNote: (key:string,text:string)=>void;

    // Actions
    completeModule: (moduleId: string, score: number) => void;
    unlockModule: (moduleId: string) => void;
    setCurrentModule: (moduleId: string | null) => void;
    resetProgress: () => void;
    // Feature 1: Save & resume position
    savePosition: (moduleId: string, contentIdx: number, sectionIdx: number) => void;
    // Feature 3: Spaced repetition
    markReviewed: (moduleId: string) => void;
    getModulesForReview: () => string[];
}

// Initial unlocked modules (Level 1 = fully open, Level 2 = locked until prerequisites)
const INITIAL_UNLOCKED = [
    'bases-islam',
    'wudu-fondamental',
    'priere-pas-a-pas',
    'alphabet-arabe',
    'sourates-courtes',
];

// Spaced repetition intervals (in days): 1, 3, 7, 14, 30
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

export const useAcademyStore = create<AcademyState>()(
    persist(
        (set, get) => ({
            currentModule: null,
            progress: {},
            unlockedModules: INITIAL_UNLOCKED,
            totalXp: 0,
            profile:null,reviews:{},notes:{},activities:{},lessonStages:{},practice:{},notebook:{},mastery:{},
            saveActivity:(key,value)=>set(s=>({activities:{...s.activities,[key]:value}})),
            saveLessonStage:(key,stage)=>set(s=>({lessonStages:{...s.lessonStages,[key]:Math.max(0,Math.min(3,stage))}})),
            savePractice:(key,value)=>set(s=>({practice:{...s.practice,[key]:value}})),
            saveNotebook:(module,field,text)=>set(s=>({notebook:{...s.notebook,[module]:{...(s.notebook[module]||{understood:'',distinction:'',example:'',review:'',updatedAt:0}),[field]:text.slice(0,3000),updatedAt:Date.now()}}})),
            startNotebook:(module,seed)=>set(s=>s.notebook[module]?s:{notebook:{...s.notebook,[module]:{understood:(seed.understood||'').slice(0,3000),distinction:'',example:(seed.example||'').slice(0,3000),review:(seed.review||'').slice(0,3000),updatedAt:Date.now()}}}),
            answerMastery:(module,correct)=>set(s=>{const previous=s.mastery[module]||{due:s.progress[module]?.reviewDue||((s.progress[module]?.completedAt||0)+86400000),attempts:0};if(!s.progress[module]?.completed||previous.confirmedAt||previous.due>Date.now())return s;return{mastery:{...s.mastery,[module]:{due:correct?0:Date.now()+86400000,confirmedAt:correct?Date.now():undefined,attempts:previous.attempts+1}}};}),
            setProfile:profile=>set({profile}),
            saveNote:(key,text)=>set(s=>({notes:{...s.notes,[key]:text.slice(0,10000)}})),
            recordAnswer:(module,key,answer,correct)=>set(s=>({progress:{...s.progress,[module]:{...(s.progress[module]||{completed:false,score:0}),answers:{...s.progress[module]?.answers,[key]:answer}}},reviews:{...s.reviews,[key]:{due:Date.now()+(correct?3:1)*86400000,interval:correct?3:1,mistakes:(s.reviews[key]?.mistakes||0)+(correct?0:1)}}})),
            reviewAnswer:(key,correct)=>set(s=>{const old=s.reviews[key],interval=correct?Math.min(90,Math.max(3,(old?.interval||1)*2)):1;return{reviews:{...s.reviews,[key]:{due:Date.now()+interval*86400000,interval,mistakes:(old?.mistakes||0)+(correct?0:1)}}};}),
            resetAttempt:module=>set(s=>({progress:{...s.progress,[module]:{...(s.progress[module]||{completed:false,score:0}),answers:{},quizIdx:0,lastContentIdx:0,lastSectionIdx:0}},lessonStages:Object.fromEntries(Object.entries(s.lessonStages).filter(([key])=>!key.startsWith(`${module}:`))),practice:Object.fromEntries(Object.entries(s.practice).filter(([key])=>!key.startsWith(`${module}:`)))})),
            saveQuiz:(module,content,question)=>set(s=>({currentModule:module,progress:{...s.progress,[module]:{...(s.progress[module]||{completed:false,score:0}),lastContentIdx:content,lastSectionIdx:0,quizIdx:question,lastVisitedAt:Date.now()}}})),

            completeModule: (moduleId, score) => set((state) => {
                const progress = { ...state.progress };
                const existing = progress[moduleId];
                progress[moduleId] = {
                    ...existing,
                    completed: true,
                    score,
                    completedAt: Date.now(),
                    // Feature 3: Schedule first review in 1 day
                    reviewDue: Date.now() + 86400000,
                    reviewCount: 0,
                    // Clear saved position
                    lastContentIdx: undefined,
                    lastSectionIdx: undefined,
                    lastVisitedAt: existing?.lastVisitedAt,
                };

                // Auto-unlock next modules based on module map
                const newUnlocked = [...state.unlockedModules];
                const nextModules = MODULE_UNLOCK_MAP[moduleId] || [];
                for (const next of nextModules) {
                    if (!newUnlocked.includes(next)) {
                        newUnlocked.push(next);
                    }
                }

                return {
                    progress,
                    unlockedModules: newUnlocked,
                    mastery: {...state.mastery,[moduleId]:existing?.completed&&state.mastery[moduleId]?state.mastery[moduleId]:{due:Date.now()+86400000,attempts:0}},
                    totalXp: state.totalXp + (existing?.completed?0:Math.round(score * 0.5)),
                };
            }),

            unlockModule: (moduleId) => set((state) => ({
                unlockedModules: state.unlockedModules.includes(moduleId)
                    ? state.unlockedModules
                    : [...state.unlockedModules, moduleId],
            })),

            setCurrentModule: (moduleId) => set({ currentModule: moduleId }),

            resetProgress: () => set({
                progress: {},
                unlockedModules: INITIAL_UNLOCKED,
                totalXp: 0,
                currentModule: null,
                reviews:{},notes:{},profile:null,activities:{},lessonStages:{},practice:{},notebook:{},mastery:{},
            }),

            // Feature 1: Save position for resume
            savePosition: (moduleId, contentIdx, sectionIdx) => set((state) => {
                const progress = { ...state.progress };
                progress[moduleId] = {
                    ...(progress[moduleId] || { completed: false, score: 0 }),
                    quizIdx: state.progress[moduleId]?.lastContentIdx===contentIdx?state.progress[moduleId]?.quizIdx:0,
                    lastContentIdx: contentIdx,
                    lastSectionIdx: sectionIdx,
                    lastVisitedAt: Date.now(),
                };
                return { progress, currentModule:moduleId };
            }),

            // Feature 3: Mark as reviewed (schedule next review)
            markReviewed: (moduleId) => set((state) => {
                const progress = { ...state.progress };
                const p = progress[moduleId];
                if (!p) return state;
                const count = (p.reviewCount || 0) + 1;
                const intervalDays = REVIEW_INTERVALS[Math.min(count, REVIEW_INTERVALS.length - 1)];
                progress[moduleId] = {
                    ...p,
                    reviewCount: count,
                    lastContentIdx: undefined, lastSectionIdx: undefined, quizIdx: 0,
                    reviewDue: Date.now() + intervalDays * 86400000,
                };
                return { progress };
            }),

            // Feature 3: Get modules due for review
            getModulesForReview: () => {
                const { progress } = get();
                const now = Date.now();
                return Object.entries(progress)
                    .filter(([, p]) => p.completed && p.reviewDue && p.reviewDue <= now)
                    .map(([id]) => id);
            },
        }),
        {
            name: 'academy-store',
            version: 4,
            migrate: (value: unknown, version: number) => {
                const persistedState=(value||{}) as Partial<AcademyState>;
                if (version < 1) {
                    const unlocked = new Set<string>(persistedState.unlockedModules || []);
                    unlocked.add('wudu-fondamental');
                    unlocked.add('priere-pas-a-pas');
                    unlocked.delete('premiere-priere');
                    INITIAL_UNLOCKED.forEach(id => unlocked.add(id));
                    persistedState.unlockedModules = Array.from(unlocked);
                }
                // v1 → v2: no breaking changes, just new optional fields
                return {...persistedState,reviews:persistedState.reviews||{},notes:persistedState.notes||{},profile:persistedState.profile||null,activities:persistedState.activities||{},lessonStages:persistedState.lessonStages||{},practice:persistedState.practice||{},notebook:persistedState.notebook||{},mastery:persistedState.mastery||{}};
            }
        }
    )
);

// ─── Module Dependency Map ───────────────────────────────
// Level 1 modules unlock Level 2 modules

const MODULE_UNLOCK_MAP: Record<string, string[]> = {
    // Level 1 → Level 2
    'alphabet-arabe': ['tajweed-fondamental', 'makharij-al-huruf'],
    'sourates-courtes': ['comprehension-sourates'],
    'priere-pas-a-pas': ['fiqh-simplifie'],
    'wudu-fondamental': [],
    'bases-islam': [],  // foundational, no unlock needed

    // Level 2 internal
    'tajweed-fondamental': [],
    'makharij-al-huruf': [],
    'comprehension-sourates': [],
    'fiqh-simplifie': [],
};

