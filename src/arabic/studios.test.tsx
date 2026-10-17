// @vitest-environment jsdom
import {beforeEach,afterEach,it,expect} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useArabicPracticeStore as practice} from '../stores/arabicPracticeStore';
import {TRANSFORMATIONS,REPAIRS,TRANSLATION_TASKS,acceptsTranslation} from './studioData';
import {SURAH_JOURNEYS,SEGMENT_TASKS,canonicalWords,wordSegmentsFor} from './journeyData';
import {buildDailyPlan,completeDailyStep,localDay} from './dailyPlan';
import {ARABIC_QUESTIONS} from './reviewData';
import {grammarCheckId,lessonById} from './data';
import {updateRecall,RECALL_DELAY} from '../lib/fahm/recall';
import {RepairExercise,ProgressiveStudio} from './ConstructionStudio';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let storage:Storage,div:HTMLDivElement,root:Root;
beforeEach(()=>{div=document.createElement('div');document.body.append(div);root=createRoot(div);storage=createMemoryStorage();practice.persist.setOptions({storage:createJSONStorage(()=>storage)});practice.setState({workshops:{},evidence:{}});});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
const button=(text:string)=>Array.from(div.querySelectorAll('button')).find(b=>b.textContent===text)!;
const click=async(el:Element)=>{expect(el).toBeTruthy();await act(async()=>(el as HTMLButtonElement).click());};
it('offers correct forms, including feminine kana and defined genitive adjective',()=>{
 for(const t of TRANSFORMATIONS)for(const form of Object.values(t.forms)){expect(form.words).toHaveLength(form.choices.length);form.words.forEach((w,i)=>expect(form.choices[i]).toContain(w));form.changed.forEach(i=>expect(form.words[i]).toBeTruthy());}
 expect(TRANSFORMATIONS[2].forms.kana.words.join(' ')).toBe('كَانَتِ الْغُرْفَةُ نَظِيفَةً');
 expect(TRANSFORMATIONS[0].forms.preposition.words.join(' ')).toBe('فِي الْبَيْتِ الْكَبِيرِ');
});
it('preserves every original Quran character when splitting eight words',()=>{
 expect(SEGMENT_TASKS).toHaveLength(8);
 for(const t of SEGMENT_TASKS){const parts=wordSegmentsFor(t);expect(parts.join('')).toBe(canonicalWords(t.key)[t.position-1]);expect(parts.every(Boolean)).toBe(true);expect(parts).toHaveLength(t.labels.length);expect(t.details).toHaveLength(parts.length);}
 expect(wordSegmentsFor(SEGMENT_TASKS.find(t=>t.id==='ihdina')!)[1].replace(/\p{M}/gu,'')).toBe('نا');
});
it('covers each verse of the three surahs with a real focus word and a working lesson',()=>{
 expect(SURAH_JOURNEYS.map(j=>j.verses.length)).toEqual([4,5,6]);
 for(const j of SURAH_JOURNEYS)j.verses.forEach((v,i)=>{expect(v.key).toBe(`${j.id}:${i+1}`);expect(canonicalWords(v.key)[v.focus-1]).toBeTruthy();expect(lessonById(v.lesson)).toBeTruthy();expect(v.options[v.answer]).toBeTruthy();});
});
it('accepts authored equivalents and punctuation without accepting opposite meaning',()=>{
 for(const t of TRANSLATION_TASKS){expect(acceptsTranslation(t,t.chunks.join(' '))).toBe(true);for(const a of t.accepted)expect(acceptsTranslation(t,a.toUpperCase()+'.')).toBe(true);expect(lessonById(t.lesson)).toBeTruthy();}
 expect(acceptsTranslation(TRANSLATION_TASKS[0],'La porte est fermée')).toBe(false);
});
it('builds distinct durations, selects due reviews and genuine weaknesses, never future reviews',()=>{
 const now=new Date(2026,9,14,12),q=ARABIC_QUESTIONS.find(q=>q.lesson==='prepositions')!;
 const checks={[grammarCheckId(q.id)]:updateRecall(undefined,q.target,false,false,now.getTime()-RECALL_DELAY-1)};
 const p=buildDailyPlan(10,checks,{},now);expect(p.steps[0]).toMatchObject({kind:'recall',ref:q.id});expect(p.steps.some(s=>s.kind==='repair')).toBe(true);
 const fresh=buildDailyPlan(5,{}, {},now);expect(fresh.steps.some(s=>s.kind==='repair')).toBe(false);expect(fresh.steps[0].ref).toBe('categories');
 expect(buildDailyPlan(20,{}, {},now).steps.length).toBeGreaterThan(buildDailyPlan(10,{}, {},now).steps.length);expect(buildDailyPlan(10,{}, {},now).steps.length).toBeGreaterThan(fresh.steps.length);
 expect(buildDailyPlan(5,{[grammarCheckId(q.id)]:updateRecall(undefined,q.target,true,false,now.getTime())},{},now).steps.some(s=>s.kind==='recall')).toBe(false);
 expect(localDay(now)).toBe('2026-10-14');
});
it('resumes the exact saved step and ignores repeated or out-of-order completion',async()=>{
 let p=buildDailyPlan(10,{},{});expect(completeDailyStep(p,p.steps[1].id)).toBe(p);const first=p.steps[0].id;p=completeDailyStep(p,first);expect(completeDailyStep(p,first)).toBe(p);
 practice.getState().save('daily:plan',p);const saved=storage.getItem('qc-arabic-practice-v1')!;practice.setState({workshops:{}});storage.setItem('qc-arabic-practice-v1',saved);await practice.persist.rehydrate();expect(practice.getState().workshops['daily:plan']).toEqual(p);
 while(!p.finished)p=completeDailyStep(p,p.steps[p.index].id);expect(p.done).toHaveLength(p.steps.length);
});
it('requires correct word, form and justification before showing repair success',async()=>{
 const t=REPAIRS[0];await act(async()=>root.render(<MemoryRouter><RepairExercise task={t}/></MemoryRouter>));
 await click(button(t.words[0]));await click(button(t.options[t.answer]));await click(button(t.reasons[t.reason]));await click(button('Vérifier ma correction'));expect(div.querySelector('[role=status]')?.textContent).toContain('ailleurs');
 await click(button(t.words[t.index]));await click(button('Vérifier ma correction'));expect(div.querySelector('[role=status]')?.textContent).toContain('Phrase réparée');
});
it('restores a saved free formulation and accepts the authored equivalent',async()=>{
 practice.getState().save('translation:door:level',2);practice.getState().save('translation:door:2',{order:[],text:'La porte est ouverte.',checked:false,help:false,solved:false});
 await act(async()=>root.render(<MemoryRouter><ProgressiveStudio/></MemoryRouter>));expect(div.querySelector('textarea')?.value).toBe('La porte est ouverte.');await click(button('Comparer ma proposition'));expect(div.querySelector('[role=status]')?.textContent).toContain('Cette formulation convient');
});
