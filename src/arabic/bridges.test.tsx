// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useArabicLearningStore as courses} from '../stores/arabicLearningStore';
import {useArabicPracticeStore as practice} from '../stores/arabicPracticeStore';
import {useStatsStore} from '../stores/statsStore';
import {useArabicAdventureStore as game} from '../stores/arabicAdventureStore';
import {ARABIC_LESSONS,lessonById} from './data';
import {applicationQuestion} from './applicationQuestions';
import {ApplicationCheck} from './ApplicationCheck';
import {LessonScene} from './LessonScene';
import {COURSE_OCCURRENCES,wordCourses,courseOccurrences,occurrenceHref} from './learningConnections';
import {canonicalWords} from './journeyData';
import {DUELS,INQUIRIES} from './playData';
import {nextChallenge,selectChallenge} from './challengeRotation';
import {DuelStudio,InquiryStudio} from './ArabicChallenges';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let host:HTMLDivElement,root:Root;
beforeEach(()=>{const storage=createMemoryStorage();courses.persist.setOptions({storage:createJSONStorage(()=>storage)});practice.persist.setOptions({storage:createJSONStorage(()=>storage)});game.persist.setOptions({storage:createJSONStorage(()=>storage)});useStatsStore.persist.setOptions({storage:createJSONStorage(()=>storage)});courses.setState({drafts:{},last:null});practice.setState({workshops:{},evidence:{}});game.setState({wins:{},motion:true});host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();});
const click=async(el:Element|null)=>{expect(el).toBeTruthy();await act(async()=>(el as HTMLButtonElement).click());};
const button=(text:string)=>Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes(text))!;
it('does not accept a tap or legacy incomplete application as proof of understanding',()=>{
 const lesson=lessonById('nominal')!,q=applicationQuestion(lesson.id)!;
 courses.getState().move(lesson.id,2);lesson.questions.forEach(q=>courses.getState().answer(lesson.id,q.id,q.answer));
 courses.getState().apply(lesson.id);courses.getState().finish(lesson.id);expect(courses.getState().drafts[lesson.id].complete).toBe(false);
 courses.setState({drafts:{nominal:{...courses.getState().drafts.nominal,application:true}}});courses.getState().finish(lesson.id);expect(courses.getState().drafts.nominal.complete).toBe(false);
 courses.getState().verifyApplication(lesson.id,(q.answer+1)%q.options.length);expect(courses.getState().drafts.nominal.application).toBe(false);
 courses.getState().verifyApplication(lesson.id,q.answer);courses.getState().finish(lesson.id);expect(courses.getState().drafts.nominal.complete).toBe(true);
});
it('keeps completed legacy lessons and rejects invalid answers',()=>{
 const draft={stage:2,answers:{},application:true,complete:true};courses.setState({drafts:{nominal:draft}});courses.getState().verifyApplication('nominal',99);expect(courses.getState().drafts.nominal).toEqual(draft);
 courses.getState().verifyApplication('nominal',0);expect(courses.getState().drafts.nominal.complete).toBe(true);
 for(const lesson of ARABIC_LESSONS.filter(l=>l.level!==2))expect(applicationQuestion(lesson.id)).toBeTruthy();
});
it('validates the separate application only on the correct answer',async()=>{
 const q=applicationQuestion('nominal')!;await act(async()=>root.render(<ApplicationCheck lessonId="nominal"/>));await click(button(q.options[(q.answer+1)%q.options.length]));expect(courses.getState().drafts.nominal.application).toBe(false);await click(button(q.options[q.answer]));expect(courses.getState().drafts.nominal.application).toBe(true);expect(practice.getState().evidence['nominal-1'].seen).toContain(q.id);expect(practice.getState().evidence['nominal-1'].transferAt).toBe(0);expect(button(q.options[q.answer]).disabled).toBe(true);
});
it('keeps authored Arabic intact while explaining a word and comparing constructions',async()=>{
 const l=lessonById('kana')!;await act(async()=>root.render(<LessonScene lessonId={l.id}/>));expect(Array.from(host.querySelectorAll('.arabic-scene-words button')).map(b=>b.textContent)).toEqual(l.example.map(w=>w.text));await click(button('Suivant'));expect(host.querySelector('[aria-live]')?.textContent).toContain(l.example[1].detail);await click(button('Comparer'));expect(host.querySelector('.arabic-scene-comparison')).not.toBeNull();await act(async()=>game.setState({motion:false}));expect(host.querySelector('.arabic-scene-still')).not.toBeNull();
});
it('links only exact known Quran words and prioritizes personal reading without inventing coverage',()=>{
 for(const o of COURSE_OCCURRENCES){expect(lessonById(o.lesson)).toBeTruthy();expect(o.text).toBe(canonicalWords(o.key)[o.position-1]);expect(wordCourses({verseKey:o.key,position:o.position,text:o.text,kind:'word'})).toContain(o);expect(wordCourses({verseKey:o.key,position:o.position,text:'خَطَأ',kind:'word'})).toEqual([]);expect(occurrenceHref(o)).toContain(`studyWord=${o.position}`);}
 expect(courseOccurrences('prepositions',['114:1'])[0].key).toBe('114:1');expect(wordCourses({verseKey:'2:1',position:1,text:'الم',kind:'word'})).toEqual([]);
});
it('offers genuinely different examples of the same notion and keeps persisted choices',()=>{
 expect(DUELS).toHaveLength(18);expect(INQUIRIES).toHaveLength(12);
 for(const bank of [DUELS,INQUIRIES]){expect(new Set(bank.map(t=>t.id)).size).toBe(bank.length);for(const current of bank){const next=nextChallenge(bank,current,[current.id]);expect(next.id).not.toBe(current.id);expect(next.lesson).toBe(current.lesson);}}
 const history={'challenge:duel':{seen:['voice']}};expect(selectChallenge(DUELS,'passive',history,'duel').id).toBe('voice-writing');
});
it('after an error lets the learner change example without erasing the previous attempt',async()=>{
 await act(async()=>root.render(<MemoryRouter><DuelStudio/></MemoryRouter>));await click(host.querySelector('[aria-label="Choisir la phrase A"]'));expect(practice.getState().workshops['play:duel:voice']).toMatchObject({choice:0});await click(button('Changer d’exemple'));expect(host.textContent).toContain('Le résultat ou son auteur');expect(practice.getState().workshops['play:duel:voice']).toMatchObject({choice:0});expect(host.querySelector('[aria-label="Choisir la phrase A"]')?.getAttribute('aria-pressed')).toBe('false');
});
it('new investigations retain the clue gate',async()=>{
 practice.getState().save('play:inquiry:index',4);await act(async()=>root.render(<MemoryRouter><InquiryStudio/></MemoryRouter>));const t=INQUIRIES[4];expect(button(t.solutions[t.answer]).disabled).toBe(true);for(const position of t.required)await click(button(t.words[position]));await click(button(t.solutions[t.answer]));expect(game.getState().wins[`inquiry:${t.id}`]).toBeTruthy();
});
