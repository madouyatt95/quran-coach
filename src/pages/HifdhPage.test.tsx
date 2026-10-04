// @vitest-environment jsdom
import {act} from 'react';import {createRoot,type Root} from 'react-dom/client';import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';import {useQuranStore} from '../stores/quranStore';import {useSRSStore} from '../stores/srsStore';import {useSettingsStore} from '../stores/settingsStore';
import {HifdhPage} from './HifdhPage';import {HIFDH_SESSION_KEY} from '../lib/hifdhSession';
const m=vi.hoisted(()=>({fetch:vi.fn(),play:vi.fn(),pause:vi.fn(),timings:vi.fn(),coach:{isCoachMode:false,allCoachWords:[],wordStates:new Map(),selectCoachMode:vi.fn(),stopCoachListening:vi.fn(),setDuoPhase:vi.fn(),coachTotalProcessed:0}}));
vi.mock('../hooks/useCoach',()=>({useCoach:()=>m.coach}));vi.mock('../components/Coach/CoachOverlay',()=>({CoachOverlay:()=>null}));
vi.mock('../lib/quranApi',()=>({fetchSurah:m.fetch,fetchSurahTranslation:()=>Promise.reject(new Error('offline translation')),fetchSurahTransliteration:()=>Promise.reject(new Error('offline phonetics')),getAudioUrl:(_r:string,n:number)=>`https://audio.example/${n}.mp3`}));
vi.mock('../lib/wordTimings',()=>({fetchWordTimings:m.timings,getCurrentWordIndex:()=>-1}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(_k:string,f:string)=>f})}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let root:Root,host:HTMLDivElement;
const click=async(text:string)=>act(async()=>{const el=Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.startsWith(text));if(!el)throw Error(`missing ${text}`);el.click();});
const mount=async()=>act(async()=>root.render(<MemoryRouter><HifdhPage/></MemoryRouter>));
beforeEach(()=>{
 vi.clearAllMocks();vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 for(const store of [useQuranStore,useSRSStore,useSettingsStore])store.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useSRSStore.setState({cards:{}});useQuranStore.setState({surahs:[1,2,3].map(n=>({number:n,name:`سورة ${n}`,englishName:`Sourate ${n}`,englishNameTranslation:'',revelationType:'Meccan',numberOfAyahs:n===1?7:100}))});
 m.fetch.mockImplementation(async(n:number)=>({surah:{numberOfAyahs:100},ayahs:Array.from({length:n===1?7:100},(_,i)=>({number:n*1000+i+1,numberInSurah:i+1,surah:n,text:`آية ${i+1}`,page:1,juz:1,hizbQuarter:1}))}));
 m.timings.mockResolvedValue(null);m.play.mockResolvedValue(undefined);vi.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(m.play);vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(m.pause);vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('loads Arabic independently of failed translations and opens every SRS card at its exact verse',async()=>{
 for(let i=20;i<=26;i++)useSRSStore.getState().addCard(2,i);await mount();expect(host.querySelectorAll('.hifdh-verse-card').length).toBe(5);
 await click('Mes révisions');expect(host.querySelectorAll('.hifdh-review-list button')).toHaveLength(7);await click('Sourate 2 · 26');
 expect((host.querySelector('[aria-label="Premier verset"]') as HTMLSelectElement).value).toBe('26');expect((host.querySelector('[aria-label="Dernier verset"]') as HTMLSelectElement).value).toBe('26');expect(host.querySelectorAll('.hifdh-verse-card')).toHaveLength(1);
});
it('resumes the saved range at the exact audio verse and preserves settings',async()=>{
 localStorage.setItem(HIFDH_SESSION_KEY,JSON.stringify({surah:2,start:70,end:75,ayah:73,speed:1.25,repeats:3,phonetics:true,focus:false,step:'listen'}));await mount();await click('Reprendre ma séance');
 expect(host.querySelector('audio')?.src).toContain('/2073.mp3');expect(host.querySelectorAll('.hifdh-verse-card')).toHaveLength(6);expect(useSettingsStore.getState().playbackSpeed).toBe(1.25);
});
it('advances the due queue only after rating a verse and leaves the next exact selection intact',async()=>{
 useSRSStore.getState().addCard(2,20);useSRSStore.getState().addCard(3,40);await mount();await click('Mes révisions');await click('Commencer les 2 révisions');
 const rating=host.querySelector('.srs-review__btn') as HTMLButtonElement;await act(async()=>rating.click());
 expect(host.textContent).toContain('Passage 2 sur 2');expect((host.querySelector('[aria-label="Premier verset"]') as HTMLSelectElement).value).toBe('40');expect(host.querySelector('audio')?.src).toContain('/3040.mp3');
});
it('stops at the last verse when looping is off and shows recitation as the next step',async()=>{
 useSRSStore.getState().addCard(2,20);await mount();await click('Mes révisions');await click('Sourate 2 · 20');
 await act(async()=>{(host.querySelector('.hifdh-player__btn') as HTMLButtonElement).click();});const played=m.play.mock.calls.length;
 await act(async()=>host.querySelector('audio')!.dispatchEvent(new Event('ended')));
 expect(m.play).toHaveBeenCalledTimes(played);expect(m.pause).toHaveBeenCalled();expect(host.textContent).toContain('Commencer ma récitation');
});
it('handles rejected playback visibly, with a working retry and session persistence',async()=>{
 await mount();m.play.mockRejectedValueOnce(new Error('NotAllowedError'));await click('Écouter le passage');expect(host.textContent).toContain('Lecture audio indisponible');
 await click('Écouter le passage');expect(host.textContent).not.toContain('Lecture audio indisponible');expect(JSON.parse(localStorage.getItem(HIFDH_SESSION_KEY)!)).toMatchObject({surah:1,start:1,end:5,ayah:1});
});

it('waits for the new verse metadata before seeking a word in another verse',async()=>{
 m.timings.mockResolvedValue({words:[{text:'آية',timestampFrom:2000,timestampTo:3000}]});await mount();const audio=host.querySelector('audio')!;
 audio.currentTime=9;await act(async()=>{(host.querySelectorAll('.hifdh-verse-card')[1].querySelector('.hifdh-word') as HTMLElement).click();});
 expect(audio.src).toContain('/1002.mp3');expect(audio.currentTime).toBe(9);expect(m.play).not.toHaveBeenCalled();
 await act(async()=>audio.dispatchEvent(new Event('loadedmetadata')));expect(audio.currentTime).toBe(2);expect(m.play).toHaveBeenCalledTimes(1);
});
