// @vitest-environment jsdom
import {beforeEach, expect,it,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useListeningJourneyStore as store} from './listeningJourneyStore';
import {annotateJourney,chooseSessionJourney,chapterFinished,SESSION_ESTIMATE_MINUTES,SESSION_THEMES} from '../lib/listeningJourney';
import {LISTENING_JOURNEYS} from '../data/listeningJourneys';
import type {PlaylistItem} from '../types';
const j=LISTENING_JOURNEYS.find(j=>j.id==='fatiha')!;
const item:PlaylistItem={surahNumber:1,surahName:'Fatiha',surahNameAr:'',totalAyahs:7,reciterId:'ar.alafasy',verse:{number:1,globalNumber:1,text:'',translation:'',chapterFrom:1},journey:{id:'fatiha',step:0,ordinal:0,total:7}};
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});store.setState({progress:{},recent:[]});});
it('varie les séances dans le thème choisi sans revenir au même parcours',()=>{
 const recent:string[]=[];for(let i=0;i<4;i++){const id=chooseSessionJourney('hope',recent);expect(recent).not.toContain(id);recent.unshift(id);}expect(['hope','patience','forgiveness','maryam','yusuf']).toContain(chooseSessionJourney('hope',recent));
});
it('propose pour chaque thème une sélection assez longue pour 5, 10 et 20 minutes',()=>{
 for(const theme of SESSION_THEMES) for(const minutes of [5,10,20]){
  const id=chooseSessionJourney(theme.id,[],minutes);
  expect(SESSION_ESTIMATE_MINUTES[id],`${theme.id} ${minutes} min`).toBeGreaterThanOrEqual(minutes*.9);
 }
});
it('conserve position, voix et préférences après réhydratation',async()=>{
 store.getState().setPreferences({voice:'ar.husary',rate:1.25,fontSize:40,translation:false});store.getState().saveCursor(item,12,11);
 const raw=localStorage.getItem('quran-coach-listening-journeys-v1')!;
 store.setState({progress:{}});localStorage.setItem('quran-coach-listening-journeys-v1',raw);await store.persist.rehydrate();
 expect(store.getState().progress.fatiha).toMatchObject({ordinal:0,position:12,heard:11});expect(store.getState().preferences).toMatchObject({voice:'ar.husary',rate:1.25,fontSize:40,translation:false});
});
it('ne valide pas un verset sauté et déduplique les réécoutes',()=>{
 store.getState().finishVerse(item,30,1);expect(store.getState().progress.fatiha.completed).toEqual([]);
 store.getState().finishVerse(item,30,29);store.getState().finishVerse(item,30,29);
 expect(store.getState().progress.fatiha).toMatchObject({ordinal:1,position:0,completed:[0]});expect(chapterFinished(j,0,[0])).toBe(false);
});
it('conserve les index absolus quand une étape seule est préparée',()=>{
 const step=j.chapters[1];const [v]=annotateJourney([{...item,verse:{...item.verse!,number:step.from,chapterFrom:step.from}}],j);
 expect(v.journey?.ordinal).toBe(step.from-1);expect(v.journey?.step).toBe(1);
});
