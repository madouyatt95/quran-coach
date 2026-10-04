// @vitest-environment jsdom
import {beforeEach,describe,it,expect,vi} from 'vitest';
import {useLearningStore} from './learningStore';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useLearningStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useLearningStore.setState({session:null,records:{},engine:'standard'});});
describe('learning persistence',()=>{
 it('can complete a postponed step without double counting',()=>{const store=useLearningStore.getState();store.start(10,{}, {surah:1,ayah:1});store.completeStep('understand',true);store.completeStep('understand');store.completeStep('understand');expect(useLearningStore.getState().session).toMatchObject({done:['understand'],skipped:[]});});
 it('ignores an old session and unknown steps',()=>{const store=useLearningStore.getState();store.start(5,{}, {surah:1,ayah:1});store.completeStep('unknown');expect(useLearningStore.getState().session!.done).toEqual([]);useLearningStore.setState({session:{...useLearningStore.getState().session!,date:'2000-01-01'}});store.completeStep('understand');expect(useLearningStore.getState().session!.done).toEqual([]);});
 it('records honest recall without adding an automatic certification',()=>{const store=useLearningStore.getState();store.recordRecall({surah:1,ayah:2},'assisted');store.recordRecall({surah:1,ayah:2},'independent');expect(useLearningStore.getState().records['1:2']).toMatchObject({recall:'independent',attempts:2});});
});
