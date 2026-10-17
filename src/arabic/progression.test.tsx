import {applicationQuestion} from './applicationQuestions';
// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useArabicLearningStore as courses} from '../stores/arabicLearningStore';
import {useArabicPracticeStore as practice} from '../stores/arabicPracticeStore';
import {useStatsStore} from '../stores/statsStore';
import {ARABIC_LESSONS,lessonById} from './data';
import {REVIEW_VARIANTS,reviewVariant} from './reviewVariants';
import {REMEDIES} from './pedagogy';
import {ANALYSES,analysisCorrect,analysisOptions,emptyAnalysis} from './analysisData';
import {DIAGNOSTIC,diagnosticRecommendation} from './diagnosticData';
import {LISTENING_TASKS} from './listeningData';
import corpus from '../lib/fahm/context-corpus.json';
import {quranWordAudioUrl} from '../lib/interactiveMushaf/model';
let storage:Storage;
beforeEach(()=>{storage=createMemoryStorage();courses.persist.setOptions({storage:createJSONStorage(()=>storage)});practice.persist.setOptions({storage:createJSONStorage(()=>storage)});useStatsStore.persist.setOptions({storage:createJSONStorage(()=>storage)});courses.setState({drafts:{},last:null,detailed:false});practice.setState({workshops:{},evidence:{}});});
it('rereading and restarting keep earned completion and never credit it twice',()=>{
 const l=lessonById('nominal')!;courses.getState().move(l.id,2);for(const q of l.questions)courses.getState().answer(l.id,q.id,q.answer);courses.getState().verifyApplication(l.id,applicationQuestion(l.id)!.answer);
 const activity=vi.spyOn(useStatsStore.getState(),'recordActivity');courses.getState().finish(l.id);expect(activity).toHaveBeenCalledOnce();courses.getState().move(l.id,0);expect(courses.getState().drafts[l.id].complete).toBe(true);courses.getState().restart(l.id);expect(courses.getState().drafts[l.id]).toMatchObject({complete:true,answers:{},application:false});for(const q of l.questions)courses.getState().answer(l.id,q.id,q.answer);courses.getState().verifyApplication(l.id,applicationQuestion(l.id)!.answer);courses.getState().finish(l.id);expect(activity).toHaveBeenCalledOnce();activity.mockRestore();
});
it('rehydrates assembly, comparison and diagnostic without replacing older course data',async()=>{
 practice.getState().save('assembly:door-open:placed',['door',null]);practice.getState().save('sarf:compare',{word:'كَتَبَ',meaning:'il a écrit',phonetic:'kataba',radicals:[0,1,2]});practice.getState().save('diagnostic',{profile:'Je débute',answers:{categories:1},done:false});
 const snapshot=storage.getItem('qc-arabic-practice-v1')!;practice.setState({workshops:{}});storage.setItem('qc-arabic-practice-v1',snapshot);await practice.persist.rehydrate();expect(practice.getState().workshops['assembly:door-open:placed']).toEqual(['door',null]);expect(practice.getState().workshops['sarf:compare']).toMatchObject({word:'كَتَبَ'});expect(practice.getState().workshops.diagnostic).toMatchObject({answers:{categories:1}});
});
it('provides a separate transfer example for all 40 course questions without reusing their remedy',()=>{
 expect(REVIEW_VARIANTS).toHaveLength(40);expect(new Set(REVIEW_VARIANTS.map(v=>v.question.id)).size).toBe(40);
 for(const l of ARABIC_LESSONS)for(const q of l.questions){const next=reviewVariant(q,[]);expect(next.id).not.toBe(q.id);expect(next.prompt).not.toBe(q.prompt);expect(next.prompt).not.toBe(REMEDIES[q.id].check.prompt);expect(next.options[next.answer]).toBeTruthy();expect(REVIEW_VARIANTS.filter(v=>v.base===q.id)).toHaveLength(1);}
});
it('does not turn an assisted or repeated transfer into a first-try success',()=>{
 practice.getState().attempt('q','new1',false,false,true,100);practice.getState().attempt('q','new1',true,false,true,200);expect(practice.getState().evidence.q.transferAt).toBe(0);expect(practice.getState().evidence.q.seen).toEqual(['new1']);practice.getState().attempt('q','new2',true,true,true,300);expect(practice.getState().evidence.q.transferAt).toBe(0);practice.getState().attempt('q','new3',true,false,true,400);expect(practice.getState().evidence.q.transferAt).toBe(400);
});
it('validates nature, function and evidence together and requires the correct ending when requested',()=>{
 for(const task of ANALYSES){expect(task.words[task.target]).toBeTruthy();for(const field of ['role','evidence'] as const)expect(analysisOptions(task,field)).toContain(task[field]);const answer={...emptyAnalysis(),word:task.target,nature:task.nature,role:task.role,evidence:task.evidence,ending:task.ending};expect(analysisCorrect(task,answer,true)).toBe(true);expect(analysisCorrect(task,{...answer,evidence:'Au hasard'},true)).toBe(false);expect(analysisCorrect(task,{...answer,ending:''},true)).toBe(false);}
 for(const l of ARABIC_LESSONS.filter(l=>l.level===2)){expect(ANALYSES.some(a=>a.lesson===l.id)).toBe(true);expect(l.prerequisites?.every(id=>!!lessonById(id))).toBe(true);}
});
it('recommends the earliest missing prerequisite and never locks a course',()=>{
 const correct=Object.fromEntries(DIAGNOSTIC.map(q=>[q.lesson,q.answer]));expect(diagnosticRecommendation(correct)).toBe('agreement');expect(diagnosticRecommendation({...correct,nominal:3,patterns:3})).toBe('nominal');expect(diagnosticRecommendation({})).toBe('categories');
});
it('maps every listening clip to a real canonical word and a distinct comparison where present',()=>{
 for(const task of LISTENING_TASKS){expect((corpus as Record<string,string[]>)[task.verse][task.position-1]).toBeTruthy();expect(quranWordAudioUrl(task.verse,task.position)).toMatch(/^https:\/\/audio.qurancdn.com\/wbw\//);expect(task.options[task.answer]).toBeTruthy();if(task.pair!==null){const pair=LISTENING_TASKS[task.pair];expect(pair.id).not.toBe(task.id);expect(pair.pair).toBe(LISTENING_TASKS.indexOf(task));}}
});
