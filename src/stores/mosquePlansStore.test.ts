import { beforeEach, expect, it } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { emptyPlan } from '../lib/mosquePlanning';
import { useMosquePlansStore } from './mosquePlansStore';
const mosque={id:'test',name:'Test',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://pray.zone'};
beforeEach(()=>{const storage=createMemoryStorage();useMosquePlansStore.persist.setOptions({storage:createJSONStorage(()=>storage)});useMosquePlansStore.setState({plans:{}});});
it('persists several independent mosque calendars and removes only the selected one',async()=>{const p=emptyPlan(mosque,'Europe/Paris');p.source='Test';p.prayers.asr.iqama='16:30';useMosquePlansStore.getState().save(p);useMosquePlansStore.getState().save({...p,mosque:{...mosque,id:'second'}});await useMosquePlansStore.persist.rehydrate();expect(Object.keys(useMosquePlansStore.getState().plans)).toHaveLength(2);expect(useMosquePlansStore.getState().plans.test.confirmedAt).toBeGreaterThan(0);useMosquePlansStore.getState().remove('test');expect(Object.keys(useMosquePlansStore.getState().plans)).toEqual(['second']);});
it('rejects invalid calendars without replacing valid saved data',()=>{const p=emptyPlan(mosque,'Europe/Paris');expect(()=>useMosquePlansStore.getState().save(p)).toThrow();expect(useMosquePlansStore.getState().plans).toEqual({});});
