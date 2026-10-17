// @vitest-environment jsdom
import { createMemoryStorage } from '../test/memoryStorage';
import { createJSONStorage } from 'zustand/middleware';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { useSmartCoaching } from './useSmartCoaching';
import { useMosquePlansStore } from '../stores/mosquePlansStore';
import { useMosqueStore } from '../stores/mosqueStore';
import { emptyPlan, zonedTime } from '../lib/mosquePlanning';
import { useCompanionStore } from '../stores/companionStore';
import { useSmartStore } from '../stores/smartStore';
import { usePrayerStore } from '../stores/prayerStore';
import { useInvisibleCoachStore } from '../stores/invisibleCoachStore';
import { useHifdhJourneyStore } from '../stores/hifdhJourneyStore';
import {useReminderExperienceStore} from '../stores/reminderExperienceStore';
import { useSRSStore } from '../stores/srsStore';
import { getCurrentWeather } from '../lib/weatherService';
vi.mock('../lib/weatherService',()=>({getCurrentWeather:vi.fn().mockResolvedValue({event:'none'})}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,div:HTMLDivElement,result:ReturnType<typeof useSmartCoaching>;
function Harness(){result=useSmartCoaching();return null;}
beforeEach(async()=>{vi.stubGlobal("localStorage",createMemoryStorage());
 useMosquePlansStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useMosqueStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useMosquePlansStore.setState({plans:{}});useMosqueStore.setState({favorite:null});
 useCompanionStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useSmartStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 usePrayerStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useInvisibleCoachStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useHifdhJourneyStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useSRSStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useReminderExperienceStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useReminderExperienceStore.setState({groups:{},cooldowns:{},moments:[]});

 vi.useFakeTimers();vi.setSystemTime(new Date(2026,9,9,12));vi.clearAllMocks();
 useCompanionStore.setState({done:{},later:{},muted:[],evidence:[],travel:false});useSmartStore.setState({globalEnabled:true,weatherEnabled:true,alKahfEnabled:true,saharEnabled:true,fajrBoosterEnabled:true});useInvisibleCoachStore.setState({enabled:true});usePrayerStore.setState({lat:null,lng:null});useHifdhJourneyStore.setState({attempts:[]});useSRSStore.setState({cards:{}});
 div=document.createElement('div');document.body.append(div);root=createRoot(div);await act(async()=>root.render(<Harness/>));
});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.useRealTimers();});
it('never substitutes Paris or starts a location permission request',()=>{expect(getCurrentWeather).not.toHaveBeenCalled();expect(result.cards.some(c=>c.topic==='location')).toBe(true);});
it('updates Al-Kahf after consultation and removes a completed reminder',async()=>{
 expect(result.cards.find(c=>c.topic==='al-kahf')?.progress).toBe(0);
 await act(async()=>useCompanionStore.getState().record({page:293,surah:18,ayah:1}));
 const card=result.cards.find(c=>c.topic==='al-kahf')!;expect(card.route).toContain('ayah=2');expect(card.progress).toBe(1);
 await act(async()=>useCompanionStore.getState().complete(card.id));expect(result.cards.some(c=>c.id===card.id)).toBe(false);expect(result.completed.some(c=>c.id===card.id)).toBe(true);
});
it('routes a confirmed difficulty to its exact memorization passage',async()=>{
 await act(async()=>useHifdhJourneyStore.getState().record({surah:2,ayah:75,outcome:'assisted',hints:1,kind:'recall'}));
 expect(result.cards.find(c=>c.topic==='review')?.route).toBe('/hifdh?surah=2&ayah=75');
});
it('separates future reminders using local prayer times',async()=>{
 await act(async()=>usePrayerStore.setState({lat:48.8566,lng:2.3522,cityName:'Paris'}));
 expect(result.upcoming.some(c=>c.topic==='sahar')).toBe(true);expect(result.upcoming.every(c=>c.startsAt!>Date.now())).toBe(true);
 expect(result.cards.every(c=>!c.startsAt || c.startsAt<=Date.now())).toBe(true);
});
it('preserves independent master switches and topic suppression',async()=>{
 await act(async()=>useSmartStore.getState().setGlobalEnabled(false));expect(result.cards.every(c=>c.origin==='coach')).toBe(true);
 await act(async()=>useInvisibleCoachStore.getState().setEnabled(false));expect(result.cards).toEqual([]);
});

it('uses the personally confirmed iqama for departure and respects its reminder switch',async()=>{
 const mosque={id:'test',name:'Mosquée test',city:'Paris',lat:48.85,lng:2.35,sourceUrl:'https://pray.zone'};
 const p=emptyPlan(mosque,'Europe/Paris');p.from=p.until='2026-10-09';p.source='Affiche';p.travel=12;p.margin=5;p.prayers.dhuhr.iqama='13:45';
 await act(async()=>{useMosqueStore.getState().setFavorite(mosque);useMosquePlansStore.getState().save(p);});
 const reminder=[...result.cards,...result.upcoming].find(c=>c.topic==='mosque-departure')!;
 expect(reminder.startsAt).toBe(zonedTime(p.from,'13:28',p.timezone));expect(reminder.route).toBe('/prayers');expect(reminder.reason).toContain('votre saisie');
 await act(async()=>useMosquePlansStore.getState().save({...p,remind:false}));expect([...result.cards,...result.upcoming].some(c=>c.topic==='mosque-departure')).toBe(false);
});

it('keeps an exact passage once and brings it back at its chosen time',async()=>{
 const card=result.cards.find(c=>c.topic==='al-kahf')!;const at=Date.now()+30*60000;
 await act(async()=>{useReminderExperienceStore.getState().keep(card,at);});
 expect(result.cards.some(c=>c.topic==='al-kahf')).toBe(false);
 const saved=result.upcoming.find(c=>c.originId===card.id)!;
 expect(saved.route).toBe(card.route);expect(result.upcoming.filter(c=>c.topic==='al-kahf')).toHaveLength(1);
 await act(async()=>{vi.advanceTimersByTime(30*60000);});
 expect(result.cards.find(c=>c.id===saved.id)?.route).toBe(card.route);
 await act(async()=>useCompanionStore.getState().complete(saved.id,saved));
 expect(result.cards.some(c=>c.topic==='al-kahf')).toBe(false);
});
it('filters selected themes and temporary pauses without disabling the coach',async()=>{
 await act(async()=>useReminderExperienceStore.getState().setGroup('friday',false));
 expect([...result.cards,...result.upcoming].some(c=>c.topic==='al-kahf'||c.topic==='salawat')).toBe(false);
 expect(result.cards.some(c=>c.origin==='coach')).toBe(true);
 await act(async()=>{useReminderExperienceStore.getState().setGroup('friday',true);useReminderExperienceStore.getState().setCooldown('al-kahf',Date.now()+1000);});
 expect(result.cards.some(c=>c.topic==='al-kahf')).toBe(false);
 await act(async()=>{vi.advanceTimersByTime(30000);});
 expect(result.cards.some(c=>c.topic==='al-kahf')).toBe(true);
});
