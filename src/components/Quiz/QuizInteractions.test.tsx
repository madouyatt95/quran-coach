// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../test/memoryStorage';
vi.mock('../../lib/supabase',()=>({supabase:{from:vi.fn(()=>({upsert:vi.fn(async()=>({error:null}))})),removeChannel:vi.fn()}}));
import {PlayingView} from './PlayingView';
import {QuizStudy} from './QuizStudy';
import {useQuizStore} from '../../stores/quizStore';
import {useQuizLearningStore} from '../../stores/quizLearningStore';
import {learningBank} from '../../lib/quizLearning';
vi.mock('../../stores/statsStore',()=>({useStatsStore:{getState:()=>({recordActivity:vi.fn()})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,div:HTMLDivElement;
const initial=useQuizStore.getState(),studyInitial=useQuizLearningStore.getState();
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));vi.stubGlobal('localStorage',createMemoryStorage());vi.spyOn(window,'scrollTo').mockImplementation(()=>{});useQuizStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuizLearningStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useQuizStore.setState(initial,true);useQuizLearningStore.setState(studyInitial,true);div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.useRealTimers();vi.restoreAllMocks();});
async function render(){await act(async()=>root.render(<MemoryRouter><PlayingView/></MemoryRouter>));}
async function advance(ms:number){await act(async()=>vi.advanceTimersByTime(ms));}
it('freezes the visible countdown, then resumes it',async()=>{useQuizStore.getState().selectTheme('fiqh');await render();const before=div.querySelector('.quiz-timer-text')?.textContent;await act(async()=>useQuizStore.getState().applyPowerUp('time-freeze'));await advance(5000);expect(div.querySelector('.quiz-timer-text')?.textContent).toBe(before);await advance(6000);expect(Number(div.querySelector('.quiz-timer-text')?.textContent)).toBeLessThan(Number(before));});
it('does not count down until the audio finishes and shows network errors explicitly',async()=>{useQuizStore.getState().startAudio();await render();expect(div.querySelector('.quiz-timer')).toBeNull();await advance(30000);expect(useQuizStore.getState().answers).toHaveLength(0);await act(async()=>div.querySelector('audio')!.dispatchEvent(new Event('error')));expect(div.textContent).toContain('n’a pas pu être chargé');await act(async()=>div.querySelector('audio')!.dispatchEvent(new Event('ended')));await advance(1000);expect(div.querySelector('.quiz-timer')).not.toBeNull();});
it('keeps Sira and revision untimed',async()=>{useQuizStore.getState().startSiraLevel(useQuizStore.getState().siraLevels[0]);await render();await advance(60000);expect(useQuizStore.getState().answers).toHaveLength(0);expect(div.querySelector('.quiz-timer')).toBeNull();});
it('grades the actual ordered sequence and retains the explanatory correction',async()=>{const q=learningBank().find(q=>q.format==='order')!;useQuizLearningStore.getState().start('Ordre',[q]);await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));for(const item of q.items!){const button=[...div.querySelectorAll('button')].find(b=>b.textContent===item)!;await act(async()=>button.click());}await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());expect(useQuizLearningStore.getState().session?.answers[0].correct).toBe(true);expect(div.textContent).toContain(q.explanation);expect(div.textContent).toContain('Voir le bilan');});

it('pairs tactile cards by identity after shuffling, supports reassignment and grades the result',async()=>{
 const q=learningBank().find(q=>q.format==='match')!;useQuizLearningStore.getState().start('Associations',[q]);await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));
 expect(div.querySelector('select')).toBeNull();
 const link=async(left:number,right:number)=>{const a=[...div.querySelectorAll('[aria-label="Notions"] button')].find(b=>b.textContent!.endsWith(q.pairs![left][0])) as HTMLButtonElement;await act(async()=>a.click());const b=[...div.querySelectorAll('[aria-label="Explications"] button')].find(b=>b.textContent!.endsWith(q.pairs![right][1])) as HTMLButtonElement;await act(async()=>b.click());};
 await link(0,1);await link(1,1);expect(div.querySelector('[role="status"]')?.textContent).toContain('1 /');
 for(let i=0;i<q.pairs!.length;i++)await link(i,i);
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());expect(useQuizLearningStore.getState().session?.answers[0].correct).toBe(true);
});
it('shows the selected misconception and a different unscored checkpoint',async()=>{
 const q=learningBank().find(q=>q.id==='apply-sabirin-tawhid-1')!;useQuizLearningStore.getState().start('Correction',[q]);await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));
 await act(async()=>[...div.querySelectorAll('.qx-choices button')].find(b=>b.textContent!.endsWith(q.choices[0]))!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());expect(div.textContent).toContain(q.feedbacks![0]);
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Vérifier ma compréhension')!.click());const follow=learningBank().find(item=>item.id===q.checkpointId)!;expect(div.textContent).toContain(follow.questionFr);
 await act(async()=>[...div.querySelectorAll('.qx-consolidation .qx-choices button')].find(b=>b.textContent!.endsWith(follow.choices[follow.correctIndex]))!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await act(async()=>[...div.querySelectorAll('.qx-consolidation button')].find(b=>b.textContent==='Valider ma réponse')!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 expect(div.textContent).toContain('Tu as retrouvé la distinction');expect(useQuizLearningStore.getState().session?.answers).toHaveLength(1);
});
it('does not mark an answer assisted by a hint as certain',async()=>{const q=learningBank().find(q=>q.id==='apply-sabirin-tawhid-1')!;useQuizLearningStore.getState().start('Indice',[q]);await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Besoin d’un indice ?')!.click());await act(async()=>[...div.querySelectorAll('.qx-choices button')].find(b=>b.textContent!.endsWith(q.choices[q.correctIndex]))!.dispatchEvent(new MouseEvent('click',{bubbles:true})));await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());expect(useQuizLearningStore.getState().session?.answers[0].certain).toBe(false);expect(useQuizLearningStore.getState().recalls[q.id].successes).toBe(0);});

it('conceals all local duel feedback and resets the choice before the second player receives the same question',async()=>{
 const q=learningBank().find(q=>q.format==='choice')!;const s=()=>useQuizLearningStore.getState();s().start('Duel',[q],'local-duel',['A','B']);
 await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));expect(div.textContent).not.toContain(q.questionFr);
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Je suis prêt')!.click());
 await act(async()=>[...div.querySelectorAll('.qx-choices button')].find(b=>b.textContent!.endsWith(q.choices[q.correctIndex]))!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());
 expect(div.textContent).not.toContain(q.explanation);expect(div.querySelector('.qx-answer')).toBeNull();
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Continuer')!.click());expect(div.textContent).toContain('À toi, B');expect(div.textContent).not.toContain(q.questionFr);
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Je suis prêt')!.click());
 expect(div.textContent).toContain(q.questionFr);expect(div.querySelector('.qx-choices [aria-pressed=true]')).toBeNull();
 expect(([...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse') as HTMLButtonElement).disabled).toBe(true);
});

it('opens an incoming shared challenge in the actual quiz page and stays in the game when the link parameter is removed',async()=>{
 const {QuizPage}=await import('../../pages/QuizPage');const {encodeQuizShare}=await import('../../lib/quizLearning');
 const q=learningBank().find(q=>q.format==='choice')!;
 useQuizStore.setState({view:'home',player:{id:'test',pseudo:'Test',avatar_emoji:'🌙',total_wins:0,total_played:0,total_xp:0,level:1}});
 await act(async()=>root.render(<MemoryRouter initialEntries={['/quiz?challenge='+encodeURIComponent(encodeQuizShare([q]))]}><QuizPage/></MemoryRouter>));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Relever ce défi')!.click());
 expect(div.textContent).toContain(q.questionFr);expect(useQuizStore.getState().view).toBe('study');expect(useQuizLearningStore.getState().session?.mode).toBe('shared');
 expect(div.textContent).not.toContain('Besoin d’un indice');
});

it('shows authored reasons for each choice and identifies incomplete explanations honestly',async()=>{
 const {AnswerReasons}=await import('./QuizStudy');const q=learningBank().find(q=>q.id==='apply-sabirin-hadith-3')!;
 await act(async()=>root.render(<MemoryRouter><AnswerReasons q={q}/></MemoryRouter>));
 expect(div.querySelector('summary')?.textContent).toBe('Pourquoi cette réponse ?');
 for(const reason of q.feedbacks!)expect(div.textContent).toContain(reason);
 expect(div.querySelectorAll('.qx-reasons article')).toHaveLength(q.choices.length);
 await act(async()=>root.render(<MemoryRouter><AnswerReasons q={{...q,feedbacks:undefined}}/></MemoryRouter>));
 expect(div.querySelectorAll('.qx-reasons article')).toHaveLength(1);expect(div.textContent).toContain('pas encore disponible');
});
it('starts an exact Fahm bridge without a profile, preserves origin after reload and does not mark the lesson completed',async()=>{
 const {QuizPage}=await import('../../pages/QuizPage');
 await act(async()=>root.render(<MemoryRouter initialEntries={['/quiz?source=fahm&scope=1%3A2%2C1%3A6&return=%2Ffahm%2Fsurah%2F1']}><QuizPage/></MemoryRouter>));
 expect(div.textContent).toContain('2 exercices');
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Commencer les exercices')!.click());
 expect(useQuizLearningStore.getState().session?.questions).toHaveLength(2);expect(useQuizLearningStore.getState().session?.adaptive).toBe(false);
 expect(useQuizLearningStore.getState().session?.returnTo).toBe('/fahm/surah/1');
 expect(div.querySelector('a[href="/fahm/surah/1"]')?.textContent).toBe('Ma lecture');
 await act(async()=>useQuizLearningStore.persist.rehydrate());expect(useQuizLearningStore.getState().session?.returnTo).toBe('/fahm/surah/1');
});
it('requires one deliberate choice in spot-the-error and records its canonical answer despite shuffling',async()=>{
 const q=learningBank().find(q=>q.format==='spot')!;useQuizLearningStore.getState().start('Trouver l’erreur',[q]);
 await act(async()=>root.render(<MemoryRouter><QuizStudy/></MemoryRouter>));
 expect(div.textContent).toContain('Cherche la proposition');
 expect(([...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse') as HTMLButtonElement).disabled).toBe(true);
 await act(async()=>[...div.querySelectorAll('.qx-choices button')].find(b=>b.textContent!.endsWith(q.choices[q.correctIndex]))!.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 await act(async()=>[...div.querySelectorAll('button')].find(b=>b.textContent==='Valider ma réponse')!.click());
 expect(useQuizLearningStore.getState().session?.answers[0].correct).toBe(true);expect(div.textContent).toContain(q.feedbacks![q.correctIndex]);
});
it('keeps source links lightweight and carries the exact reader URL without replacing a paused session',async()=>{
 const {QuizBridge}=await import('./QuizBridge');const q=learningBank()[0];useQuizLearningStore.getState().start('En pause',[q]);
 await act(async()=>root.render(<MemoryRouter initialEntries={['/academy?module=sabirin-tawhid-1&section=2']}><QuizBridge source="academy" id="sabirin-tawhid-1"/></MemoryRouter>));
 const href=new URL(div.querySelector('a')!.href);expect(href.searchParams.get('source')).toBe('academy');expect(href.searchParams.get('scope')).toBe('sabirin-tawhid-1');expect(href.searchParams.get('return')).toBe('/academy?module=sabirin-tawhid-1&section=2');expect(useQuizLearningStore.getState().session?.title).toBe('En pause');
});
it('renders vocabulary cards in Arabic direction and keeps paired Quran examples in the correction',async()=>{
 const {QuestionForm}=await import('./QuizQuestionForm');const {AnswerReasons}=await import('./QuizStudy');const q=learningBank().find(q=>q.activity==='vocabulary')!;
 await act(async()=>root.render(<MemoryRouter><QuestionForm q={q} learning onAnswer={()=>{}}/><AnswerReasons q={q}/></MemoryRouter>));
 expect(div.querySelectorAll('.qx-word[lang="ar"][dir="rtl"]')).toHaveLength(3);for(const ref of q.pairRefs!)expect([...div.querySelectorAll('a')].map(a=>a.getAttribute('href'))).toContain(`/passage?surah=${ref.surah}&ayah=${ref.ayah}&from=quiz`);
});
it('an incoming challenge takes precedence over an already-open study session without replacing it on arrival',async()=>{
 const {QuizPage}=await import('../../pages/QuizPage');const {encodeQuizShare}=await import('../../lib/quizLearning');const q=learningBank()[0];
 useQuizLearningStore.getState().start('Ancienne séance',[q]);useQuizStore.setState({view:'study'});
 await act(async()=>root.render(<MemoryRouter initialEntries={['/quiz?challenge='+encodeURIComponent(encodeQuizShare([q]))]}><QuizPage/></MemoryRouter>));
 expect(div.textContent).toContain('Relever ce défi');expect(useQuizLearningStore.getState().session?.title).toBe('Ancienne séance');
});
