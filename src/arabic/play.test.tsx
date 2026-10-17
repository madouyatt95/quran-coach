// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useArabicAdventureStore as game,freshMission,canAdvanceMission} from '../stores/arabicAdventureStore';
import {useArabicPracticeStore as practice} from '../stores/arabicPracticeStore';
import {useStatsStore} from '../stores/statsStore';
import {MISSIONS,MISSION_ANALYSES,DUELS,INQUIRIES} from './playData';
import {canonicalWords} from './journeyData';
import {SARF_FAMILIES} from './sarfData';
import {lessonById} from './data';
import {DuelRound,InquiryRound} from './ArabicChallenges';
import {TouchTransformation} from './TouchTransformation';
import {ArabicAdventure} from './ArabicAdventure';
import {WordCollection} from './WordCollection';
import {buildDailyPlan} from './dailyPlan';
vi.mock('../lib/fahm/content',()=>({loadFahmVerse:vi.fn().mockResolvedValue({ayah:{number:6222},translation:'Traduction de test'})}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let div:HTMLDivElement,root:Root,storage:Storage;
beforeEach(()=>{storage=createMemoryStorage();game.persist.setOptions({storage:createJSONStorage(()=>storage)});practice.persist.setOptions({storage:createJSONStorage(()=>storage)});useStatsStore.persist.setOptions({storage:createJSONStorage(()=>storage)});game.setState({missions:{},wins:{},motion:true,haptics:false});practice.setState({workshops:{},evidence:{}});div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.restoreAllMocks();});
const button=(name:string)=>Array.from(div.querySelectorAll('button')).find(b=>b.textContent===name||b.getAttribute('aria-label')===name)!;
const click=async(el:Element)=>{expect(el).toBeTruthy();await act(async()=>(el as HTMLButtonElement).click());};
it('gates every mission stage and cannot reward a skipped, wrong or duplicate submission',()=>{
 const id='112:1';expect(game.getState().advance(id,4)).toBe(false);expect(canAdvanceMission(id,freshMission())).toBe(false);
 game.getState().patch(id,{read:true});expect(game.getState().advance(id,0)).toBe(true);expect(game.getState().advance(id,0)).toBe(false);
 game.getState().patch(id,{spot:2});expect(game.getState().advance(id,1)).toBe(false);game.getState().patch(id,{spot:1});game.getState().advance(id,1);
 game.getState().patch(id,{order:[2,1,0]});expect(game.getState().advance(id,2)).toBe(false);game.getState().patch(id,{order:[0,1,2]});game.getState().advance(id,2);
 expect(game.getState().advance(id,3)).toBe(false);game.getState().patch(id,{compared:true});game.getState().advance(id,3);
 game.getState().patch(id,{recall:2});expect(game.getState().advance(id,4)).toBe(false);const activity=vi.spyOn(useStatsStore.getState(),'recordActivity');game.getState().patch(id,{recall:0});expect(game.getState().advance(id,4)).toBe(true);game.getState().advance(id,4);expect(activity).toHaveBeenCalledOnce();expect(game.getState().missions[id].completeAt).toBeGreaterThan(0);
});
it('rehydrates exact mission, earned words and comfort preferences without replacing legacy progress',async()=>{
 game.getState().patch('112:1',{read:true,note:'Mon observation'});game.getState().advance('112:1',0);game.getState().preferences({motion:false,haptics:true});game.getState().win('duel','voice',1,false);
 practice.getState().save('journey:112:1',{complete:true});const saved=storage.getItem('qc-arabic-adventure-v1')!;game.setState({missions:{},wins:{},motion:true,haptics:false});storage.setItem('qc-arabic-adventure-v1',saved);await game.persist.rehydrate();expect(game.getState().missions['112:1']).toMatchObject({stage:1,note:'Mon observation'});expect(game.getState().wins['duel:voice']).toBeTruthy();expect(game.getState().motion).toBe(false);expect(practice.getState().workshops['journey:112:1']).toEqual({complete:true});
});
it('keeps Quran display canonical and all mission, clue and family references valid',()=>{
 expect(MISSIONS).toHaveLength(15);for(const m of MISSIONS){expect(canonicalWords(m.key)[m.focus-1]).toBeTruthy();expect(MISSION_ANALYSES[m.key].parts).toHaveLength(3);expect(MISSION_ANALYSES[m.key].parts).not.toContain(MISSION_ANALYSES[m.key].decoy);}
 for(const d of DUELS){expect(lessonById(d.lesson)).toBeTruthy();expect(d.words[d.answer].length).toBeGreaterThan(0);if(d.family)expect(SARF_FAMILIES.find(f=>f.id===d.family)).toBeTruthy();}
 for(const t of INQUIRIES){expect(lessonById(t.lesson)).toBeTruthy();for(const n of t.required){expect(t.words[n]).toBeTruthy();expect(t.clues.find(c=>c.word===n)).toBeTruthy();}}
});
it('requires decisive clues before an investigation can be answered',async()=>{
 const t=INQUIRIES[0];await act(async()=>root.render(<MemoryRouter><InquiryRound task={t}/></MemoryRouter>));expect(button(t.solutions[t.answer]).disabled).toBe(true);await click(button(t.words[1]));expect(button(t.solutions[t.answer]).disabled).toBe(true);await click(button(t.words[2]));await click(button(t.solutions[t.answer]));expect(div.querySelector('[role=status]')?.textContent).toContain('Enquête résolue');expect(game.getState().wins['inquiry:subject']).toBeTruthy();
});
it('a wrong duel unlocks nothing; corrected answer is recorded with help and only once',async()=>{
 await act(async()=>root.render(<MemoryRouter><DuelRound task={DUELS[0]}/></MemoryRouter>));await click(button('Choisir la phrase A'));expect(game.getState().wins).toEqual({});await click(button('Choisir la phrase B'));expect(game.getState().wins['duel:voice'].assisted).toBe(true);const at=game.getState().wins['duel:voice'].at;game.getState().win('duel','voice',1,false);expect(game.getState().wins['duel:voice'].at).toBe(at);expect(game.getState().wins['duel:voice'].assisted).toBe(true);
});
it('touch construction validates every word, including the unchanged attribute',async()=>{
 await act(async()=>root.render(<TouchTransformation/>));await click(div.querySelector('.arabic-particle')!);await click(button('الْبَيْتُ'));await click(button('الْبَيْتَ'));await click(button('كَبِيرٌ'));await click(button('كَبِيرًا'));await click(button('Observer le résultat'));expect(div.querySelector('[role=status]')?.textContent).toContain('reste à ajuster');await click(button('كَبِيرٌ'));await click(button('Observer le résultat'));expect(div.querySelector('[role=status]')?.textContent).toContain('nouvelle construction');
});
it('collection starts empty and shows only earned families',async()=>{
 await act(async()=>root.render(<MemoryRouter><WordCollection/></MemoryRouter>));expect(div.textContent).toContain('Votre premier mot');await act(async()=>game.getState().win('duel','person',0,false));expect(div.textContent).toContain('Entendre');expect(div.textContent).not.toContain('Votre premier mot');expect(div.querySelectorAll('.arabic-word-shelf>button')).toHaveLength(1);
});
it('new longer sessions alternate activities while old step kinds remain available',()=>{
 const short=buildDailyPlan(5,{},{}),medium=buildDailyPlan(10,{},{}),long=buildDailyPlan(20,{},{});expect(short.steps.some(s=>s.kind==='verse')).toBe(true);expect(medium.steps.some(s=>s.kind==='duel')).toBe(true);expect(long.steps.some(s=>s.kind==='inquiry')).toBe(true);expect(new Set(long.steps.map(s=>s.id)).size).toBe(long.steps.length);
});

it('keeps the earned scene visible until the learner requests the next mission',async()=>{
 game.setState({missions:{'112:1':{...freshMission(),stage:4,completeAt:100,recall:0}}});await act(async()=>root.render(<MemoryRouter><ArabicAdventure/></MemoryRouter>));expect(div.textContent).toContain('Ce mot vous attend dans votre carnet');expect(div.textContent).toContain('Mission suivante');await click(button('Mission suivante →'));expect(div.textContent).toContain('112:2');expect(div.textContent).not.toContain('Ce mot vous attend dans votre carnet');
});
