// @vitest-environment jsdom
import {useSettingsStore} from '../stores/settingsStore';
import {useReaderCoachStore} from '../stores/readerCoachStore';
import { act,useEffect } from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter,useNavigate} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useInvisibleCoach} from './useInvisibleCoach';
import {useInvisibleCoachStore as coach} from '../stores/invisibleCoachStore';
import {useCompanionStore as companion,useCompanionRuntimeStore as runtime} from '../stores/companionStore';
import {useQuranStore} from '../stores/quranStore';
import {useAudioPlayerStore} from '../stores/audioPlayerStore';
import {useLiveFollowStore} from '../stores/liveFollowStore';
let root:Root,div:HTMLDivElement;
const harness:{result?:ReturnType<typeof useInvisibleCoach>;navigate?:ReturnType<typeof useNavigate>}={};
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
function Harness(){const result=useInvisibleCoach(),navigate=useNavigate();useEffect(()=>{harness.result=result;harness.navigate=navigate;});return result.currentIntervention?.level==='celebration'?<div className="coach-celebration" aria-modal="true"/>:null;}
const current=()=>harness.result!;
const tick=()=>act(async()=>{await vi.advanceTimersByTimeAsync(2000);});
beforeEach(async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date(2026,9,9,12));const storage=createMemoryStorage();vi.stubGlobal('localStorage',storage);
 coach.persist.setOptions({storage:createJSONStorage(()=>storage)});
 companion.persist.setOptions({storage:createJSONStorage(()=>storage)});
 useQuranStore.persist.setOptions({storage:createJSONStorage(()=>storage)});
 useSettingsStore.persist.setOptions({storage:createJSONStorage(()=>storage)});
 useReaderCoachStore.persist.setOptions({storage:createJSONStorage(()=>storage)});
 useSettingsStore.setState({viewMode:'mushaf'});useReaderCoachStore.setState({suggestions:[],returnPoint:null});
 Object.defineProperty(document,'hidden',{configurable:true,value:false});
 const triggers=Object.fromEntries(Object.keys(coach.getState().enabledTriggers).map(key=>[key,false]));
 coach.setState({enabled:true,enabledTriggers:{...triggers,long_reading:true},history:[],triggerCooldowns:{},suppressedUntil:null,totalShown:0,totalDismissed:0});
 companion.setState({done:{},later:{},muted:[],evidence:[],pace:'balanced'});runtime.setState({busy:{},activeMs:16*60000,lastInteraction:Date.now()-20000});
 useQuranStore.setState({currentSurah:1,currentAyah:1,currentPage:1});useAudioPlayerStore.setState({isPlaying:false});useLiveFollowStore.setState({active:false});
 companion.getState().record({surah:1,ayah:1,page:1});
 div=document.createElement('div');document.body.append(div);root=createRoot(div);await act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>));
});
afterEach(async()=>{if(root)await act(async()=>root.unmount());div?.remove();harness.result=undefined;harness.navigate=undefined;vi.useRealTimers();vi.unstubAllGlobals();});
it('counts a passive expiry separately from an explicit dismissal',async()=>{
 await tick();expect(current().currentIntervention?.trigger).toBe('long_reading');const before=coach.getState().totalDismissed;
 await act(async()=>current().expire());expect(current().currentIntervention).toBeNull();expect(coach.getState().totalDismissed).toBe(before);
});
it('blocks prompts during audio, background time and another route',async()=>{
 runtime.getState().setBusy('audio',true);await tick();expect(current().currentIntervention).toBeNull();
 runtime.getState().setBusy('audio',false);Object.defineProperty(document,'hidden',{configurable:true,value:true});await tick();expect(current().currentIntervention).toBeNull();
 Object.defineProperty(document,'hidden',{configurable:true,value:false});await act(async()=>harness.navigate!('/hifdh'));await tick();expect(current().currentIntervention).toBeNull();
});
it('does not count a final-verse jump as a whole surah and keeps an earned celebration open',async()=>{
 coach.setState({enabledTriggers:{...coach.getState().enabledTriggers,long_reading:false,surah_complete:true}});useQuranStore.setState({currentAyah:7});companion.getState().record({surah:1,ayah:7,page:1});await tick();expect(current().currentIntervention).toBeNull();
 for(let ayah=2;ayah<=6;ayah++)companion.getState().record({surah:1,ayah,page:1});
 // Last qualified verse must still match the actual current verse.
 companion.setState(s=>({evidence:[...s.evidence.filter(e=>e.ayah!==7),s.evidence.find(e=>e.ayah===7)!]}));
 await tick();expect(current().currentIntervention?.level).toBe('celebration');await tick();expect(current().currentIntervention?.level).toBe('celebration');
});

it('queues interactive advice instead of showing a timed overlay, with page-level context',async()=>{
 useSettingsStore.setState({viewMode:'tajweed-interactive'});
 companion.getState().record({page:1,surah:1,ayah:7});
 await tick();expect(current().currentIntervention).toBeNull();
 expect(useReaderCoachStore.getState().suggestions[0]?.trigger).toBe('long_reading');
});
it('does not enqueue advice while an interactive exercise is busy',async()=>{
 useSettingsStore.setState({viewMode:'tajweed-interactive'});runtime.getState().setBusy('interactive-reader-study',true);
 await tick();expect(useReaderCoachStore.getState().suggestions).toHaveLength(0);
});
