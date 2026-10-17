// @vitest-environment jsdom
import {beforeEach,it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {COURSE_LEVELS} from './data/courseLibrary';
import {personalReviewTargets} from './personalReview';
import {useAcademyStore} from '../stores/academyStore';
import {useAcademyKnowledgeStore} from '../stores/academyKnowledgeStore';
import {useAcademyExperienceStore} from '../stores/academyExperienceStore';
beforeEach(()=>{useAcademyStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});useAcademyKnowledgeStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});useAcademyExperienceStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});useAcademyStore.getState().resetProgress();useAcademyKnowledgeStore.setState({concepts:{},session:null});useAcademyExperienceStore.setState({courses:{}});});
it('prioritizes the specific mistake, with questions and previously studied courses next',()=>{
 const modules=COURSE_LEVELS.flatMap(l=>l.modules);expect(personalReviewTargets(modules)).toEqual([]);
 useAcademyStore.getState().savePosition('sabirin-tawhid-1',0,0);useAcademyStore.getState().saveNote('sabirin-hadith-2:course-question','Je confonds foi et excellence.');useAcademyKnowledgeStore.getState().answer('sabirin-tawhid-1',2,'check',0,false);
 const targets=personalReviewTargets(modules);expect(targets).toHaveLength(3);expect(targets[0]).toMatchObject({id:'sabirin-tawhid-1',index:2,reason:'Une distinction à reprendre'});expect(targets[1].id).toBe('sabirin-hadith-2');
});
