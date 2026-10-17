// @vitest-environment jsdom
import { createMemoryStorage } from '../test/memoryStorage';
import { createJSONStorage } from 'zustand/middleware';
import { beforeEach,it,expect,vi } from 'vitest';
import { useCompanionStore as store } from './companionStore';
import { useInvisibleCoachStore as coach } from './invisibleCoachStore';
import type { CompanionCard } from '../lib/companion';
beforeEach(()=>{vi.stubGlobal("localStorage",createMemoryStorage());store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});coach.persist.setOptions({storage:createJSONStorage(()=>localStorage)});store.setState({evidence:[],done:{},later:{},saved:[],muted:[],pace:'balanced',journey:null});coach.setState({enabled:true,sessionInterventionCount:0,lastInterventionTime:0,suppressedUntil:null,receptivityScore:0});vi.restoreAllMocks();});
it('keeps separate identities for same-length card IDs',()=>{
 const card:CompanionCard={id:'rain',topic:'weather',title:'Pluie',emoji:'🌧️',message:'',reason:'',minutes:1,route:'/adhkar',action:'Lire',kind:'Invocation',priority:1,origin:'sentinel'};
 store.getState().save(card);store.getState().save({...card,id:'wind'});expect(store.getState().saved).toHaveLength(2);
 store.getState().save(card);expect(store.getState().saved.map(c=>c.id)).toEqual(['wind']);
});
it('counts one consultation per verse per local day, retaining later visits',()=>{
 const now=+new Date(2026,9,9,12),e={page:293,surah:18,ayah:1};
 store.getState().record(e,now);store.getState().record(e,now+100);store.getState().record(e,now+86400000);
 expect(store.getState().evidence).toHaveLength(2);
});
it('supports completion undo, snooze and explicit topic preferences',()=>{
 store.getState().complete('morning');expect(store.getState().done.morning).toBeTruthy();store.getState().undo('morning');expect(store.getState().done.morning).toBeUndefined();
 store.getState().snooze('morning');expect(store.getState().later.morning).toBeGreaterThan(Date.now());
 store.getState().mute('weather');store.getState().mute('weather');expect(store.getState().muted).toEqual(['weather']);store.getState().unmute('weather');expect(store.getState().muted).toEqual([]);
});
it('uses the chosen pace rather than the legacy receptivity score',()=>{
 store.getState().setPace('discreet');coach.setState({sessionInterventionCount:1});expect(coach.getState().canShowIntervention()).toBe(false);
 store.getState().setPace('guided');expect(coach.getState().canShowIntervention()).toBe(true);
 coach.setState({lastInterventionTime:Date.now()});expect(coach.getState().canShowIntervention()).toBe(false);
});
it('keeps the need chosen by the user and advances only explicitly',()=>{
 store.getState().startJourney('peace');expect(store.getState().journey?.step).toBe(0);
 for(let i=0;i<8;i++)store.getState().advance();expect(store.getState().journey).toMatchObject({need:'peace',step:4});
 store.getState().startJourney('gratitude');expect(store.getState().journey).toMatchObject({need:'gratitude',step:0});
});
