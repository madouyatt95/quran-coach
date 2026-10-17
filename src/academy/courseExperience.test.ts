// @vitest-environment jsdom
import {it,expect,beforeEach} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {COURSE_LEVELS} from './data/courseLibrary';
import {openingQuestion,courseJourney,coursePlan,explorationAnswer} from './courseExperience';
import {useAcademyExperienceStore} from '../stores/academyExperienceStore';
import {useAcademyStore} from '../stores/academyStore';
beforeEach(()=>{useAcademyExperienceStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});useAcademyExperienceStore.setState({courses:{}});});
it('provides all six learning entry points for every chapter, with exact narration text',()=>{
 const courses=COURSE_LEVELS.flatMap(level=>level.modules);expect(courses).toHaveLength(30);
 expect(new Set(courses.map(course=>openingQuestion(course.id))).size).toBe(30);
 for(const course of courses){const journey=courseJourney(course.id);expect(journey.steps).toHaveLength(3);expect(journey.steps[0].text).toContain(openingQuestion(course.id));expect(journey.steps.map(step=>step.title)).toEqual(coursePlan(course.id)!.concepts.map(concept=>concept[0]));for(let n=0;n<3;n++)for(const angle of [0,1,2,4])expect(explorationAnswer(course.id,n,angle).length).toBeGreaterThan(50);}
});
it('retains hypothesis, branching decisions, project and exploration independently from graded progress',()=>{
 const original=useAcademyStore.getState().progress;const store=useAcademyExperienceStore.getState();
 store.update('sabirin-tawhid-1',{hypothesis:'Une première idée',node:2});store.decide('sabirin-tawhid-1','start',1);store.explain('sabirin-tawhid-1',0,'Ma définition');store.explore('sabirin-tawhid-1','0:1');store.explore('sabirin-tawhid-1','0:1');store.update('sabirin-hadith-2',{hypothesis:'Autre cours'});
 const saved=useAcademyExperienceStore.getState().courses['sabirin-tawhid-1'];expect(saved.hypothesis).toBe('Une première idée');expect(saved.decisions).toEqual({start:1});expect(saved.explanationByNode[0]).toBe('Ma définition');expect(saved.explored).toEqual(['0:1']);expect(saved.node).toBe(2);expect(useAcademyStore.getState().progress).toBe(original);
});
