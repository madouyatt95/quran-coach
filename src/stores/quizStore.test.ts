// @vitest-environment jsdom
import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
vi.mock('../lib/supabase',()=>({supabase:{from:vi.fn(()=>({upsert:vi.fn(async()=>({error:null}))})),removeChannel:vi.fn()}}));
import {useQuizStore} from './quizStore';
import {stableQuestionId} from '../lib/quizEngine';
const memoryStorage=(()=>{const values=new Map<string,string>();return {getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);},clear:()=>values.clear()};})();
vi.stubGlobal('localStorage',memoryStorage);
useQuizStore.persist.setOptions({storage:{getItem:key=>{const raw=memoryStorage.getItem(key);return raw?JSON.parse(raw):null;},setItem:(key,value)=>memoryStorage.setItem(key,JSON.stringify(value)),removeItem:key=>memoryStorage.removeItem(key)}});
const initial=useQuizStore.getState();
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));localStorage.clear();useQuizStore.setState(initial,true);});
afterEach(()=>vi.useRealTimers());
describe('quiz reliability',()=>{
 it('does not inject unrelated audio into solo themes',()=>{useQuizStore.getState().selectTheme('fiqh');expect(useQuizStore.getState().questions.every(q=>q.theme==='fiqh'&&!q.audioUrl)).toBe(true);});
 it('keeps daily draft through reload, consumes only upon completion and awards only once',async()=>{const s=()=>useQuizStore.getState();s().startDaily();expect(s().dailyChallengeLastDate).toBeNull();expect(s().dailyDraft).not.toBeNull();const first=s().questions[0];s().submitAnswer(first.correctIndex);const xp=s().totalXP;s().submitAnswer(first.correctIndex);expect(s().totalXP).toBe(xp);s().resetQuiz();await useQuizStore.persist.rehydrate();s().startDaily();expect(s().view).toBe('feedback');expect(s().answers).toHaveLength(1);await s().nextQuestion();expect(s().dailyDraft?.currentIndex).toBe(1);for(let i=1;i<s().questions.length;i++){s().submitAnswer(s().questions[i].correctIndex);await s().nextQuestion();}expect(s().dailyChallengeLastDate).toBe('2026-10-15');expect(s().dailyDraft).toBeNull();const played=s().totalPlayed;await s().nextQuestion();expect(s().totalPlayed).toBe(played);});
 it('second chance rejects the first incorrect attempt without scoring it',()=>{const s=()=>useQuizStore.getState();s().selectTheme('fiqh');s().applyPowerUp('second-chance');const q=s().questions[0];s().submitAnswer((q.correctIndex+1)%q.choices.length);expect(s().view).toBe('playing');expect(s().answers).toHaveLength(0);expect(s().secondChance).toBe(false);s().submitAnswer(q.correctIndex);expect(s().answers).toHaveLength(1);});
 it('freeze has an actual ten-second duration and cannot be stacked',()=>{const s=()=>useQuizStore.getState();s().selectTheme('fiqh');const timer=s().timerStart;s().applyPowerUp('time-freeze');expect(s().freezeUntil).toBe(Date.now()+10000);expect(s().timerStart).toBe(timer);s().applyPowerUp('time-freeze');expect(s().powerUps['time-freeze']).toBe(2);});
 it('a corrected mistake is retained for spaced review and old IDs do not duplicate it',()=>{const s=()=>useQuizStore.getState();s().selectTheme('fiqh');const q=s().questions[0];useQuizStore.setState({wrongQuestions:[{...q,id:'old-random-id'}]});s().submitAnswer(-1);expect(s().wrongQuestions).toHaveLength(1);s().startRevision();s().submitAnswer(q.correctIndex);expect(s().wrongQuestions).toHaveLength(1);expect(s().reviewSchedule[stableQuestionId(q)].successes).toBe(0);});
 it('finishes the sprint after its last question rather than counting it repeatedly',()=>{const s=()=>useQuizStore.getState();s().startSprint();useQuizStore.setState({questions:s().questions.slice(0,1)});s().submitAnswer(s().questions[0].correctIndex);expect(s().view).toBe('result');const count=s().totalCorrect;s().submitAnswer(0);expect(s().totalCorrect).toBe(count);});
 it('migrates stats without wiping accumulated progress',async()=>{localStorage.setItem('quiz-store',JSON.stringify({version:1,state:{totalXP:24000,totalPlayed:42,level:25,title:'Hafidh',wrongQuestions:[],siraProgression:{sira_1:{completed:true,stars:3}}}}));await useQuizStore.persist.rehydrate();expect(useQuizStore.getState().totalXP).toBe(24000);expect(useQuizStore.getState().totalPlayed).toBe(42);expect(useQuizStore.getState().title).toBe('Persévérant');expect(useQuizStore.getState().siraProgression.sira_1.completed).toBe(true);});
});

it('persists audio as the last mode and replays it after reload without mixing in the previous theme',async()=>{
 const s=()=>useQuizStore.getState();s().selectTheme('fiqh');s().startAudio();s().resetQuiz();
 await useQuizStore.persist.rehydrate();expect(s().lastGame?.kind).toBe('audio');s().replayLast();
 expect(s().view).toBe('playing');expect(s().questions.every(q=>q.audioUrl)).toBe(true);expect(s().theme).toBeNull();
});
it('replays solo with its original difficulty and theme',()=>{
 const s=()=>useQuizStore.getState();s().setDifficulty('easy');s().selectTheme('fiqh');s().resetQuiz();s().setDifficulty('hard');s().replayLast();
 expect(s().difficulty).toBe('easy');expect(s().theme).toBe('fiqh');expect(s().questions.every(q=>q.choices.length===2)).toBe(true);
});
