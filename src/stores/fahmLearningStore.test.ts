// @vitest-environment jsdom
import {beforeEach,it,expect,vi,afterEach} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useFahmLearningStore as store} from './fahmLearningStore';
import {useFahmStore as legacy} from './fahmStore';
import {useStatsStore as stats} from './statsStore';
let storage:Storage;
beforeEach(()=>{vi.useFakeTimers();storage=createMemoryStorage();store.persist.setOptions({storage:createJSONStorage(()=>storage)});legacy.persist.setOptions({storage:createJSONStorage(()=>storage)});stats.persist.setOptions({storage:createJSONStorage(()=>storage)});store.setState({records:{},positions:{},studied:{},session:null,lastLesson:null,words:{}});legacy.setState({learnedWords:{},totalWordsLearned:0,totalReviews:0,pathProgress:{}});stats.setState({activeDays:{},activityHistory:{},readingStreak:0});});
afterEach(()=>vi.useRealTimers());
it('opening and moving through a lesson never completes it or awards an active day',()=>{store.getState().move('discover/1',3);expect(legacy.getState().pathProgress).toEqual({});expect(store.getState().studied).toEqual({});expect(stats.getState().readingStreak).toBe(0);});
it('does not finish a personal session until every assigned verse has been studied',()=>{store.getState().begin([{surah:1,ayah:1},{surah:1,ayah:2}],10,'Séance');const id=store.getState().session!.id;store.getState().finishSession();expect(store.getState().session!.finished).toBe(false);store.getState().study(id,{surah:1,ayah:1});store.getState().finishSession();expect(store.getState().session!.finished).toBe(false);store.getState().study(id,{surah:1,ayah:2});store.getState().finishSession();expect(store.getState().session!.finished).toBe(true);expect(stats.getState().readingStreak).toBe(1);});
it('retains mistakes after correction and preserves notes and position on reload',async()=>{store.getState().answer({surah:2,ayah:75},false);store.getState().answer({surah:2,ayah:75},true);store.getState().note({surah:2,ayah:75},'Ma formulation personnelle.',true);store.getState().move('baqarah/3',4);const saved=storage.getItem('quran-coach-fahm-learning-v1');store.setState({records:{},positions:{}});storage.setItem('quran-coach-fahm-learning-v1',saved!);await store.persist.rehydrate();expect(store.getState().positions['baqarah/3']).toBe(4);expect(store.getState().records['2:75']).toMatchObject({mistakes:1,attempts:2,correct:true,compared:true,note:'Ma formulation personnelle.'});});
it('keeps a forgotten word at level zero in the due review queue',()=>{legacy.getState().markWordReviewed(1,false);vi.advanceTimersByTime(4*3600000);expect(legacy.getState().getWordsForReview()).toContain(1);});
