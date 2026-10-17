// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceSearchPage } from './VoiceSearchPage';
import { BottomNav } from '../components/Navigation/BottomNav';
import type { SearchCallbacks, FreeCallbacks } from '../lib/tilawa/service';
const mocks = vi.hoisted(() => ({status:vi.fn(),download:vi.fn(),start:vi.fn(),free:vi.fn(),confirm:vi.fn(),stop:vi.fn(),pause:vi.fn()}));
vi.mock('react-i18next', () => ({useTranslation:() => ({t:(s:string)=>s})}));
vi.mock('../stores/audioPlayerStore', () => ({useAudioPlayerStore:{getState:() => ({isPlaying:true,togglePlay:mocks.pause})}}));
vi.mock('../lib/tilawa/assets', () => ({tilawaPackStatus:mocks.status,downloadTilawaPack:mocks.download}));
vi.mock('../lib/tilawa/service', () => ({tilawaService:{startSearch:mocks.start,startFreeRecitation:mocks.free,confirmFreePassage:mocks.confirm,stop:mocks.stop}}));
vi.mock('../stores/quranStore', () => ({useQuranStore:() => [{number:112,englishName:'Al-Ikhlas'}]}));
vi.mock('../lib/quranApi', () => ({fetchSurah:vi.fn().mockResolvedValue({ayahs:[{number:6222,numberInSurah:1,text:'قل هو الله أحد'}]}),fetchSurahTranslation:vi.fn().mockResolvedValue(new Map([[6222,'Dis : Il est Allah, Unique.']]))}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root;let container:HTMLDivElement;
const button=()=>container.querySelector('.voice-search-trigger') as HTMLButtonElement;
beforeEach(async()=>{
 vi.clearAllMocks();mocks.status.mockResolvedValue({ready:true});mocks.download.mockResolvedValue(undefined);mocks.start.mockResolvedValue(true);mocks.free.mockResolvedValue(true);mocks.stop.mockResolvedValue(undefined);
 container=document.createElement('div');document.body.append(container);root=createRoot(container);
 await act(async()=>root.render(<MemoryRouter><VoiceSearchPage/></MemoryRouter>));
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
describe('one-button voice search',()=>{
 it('opens from the global menu in StrictMode and waits for manual activation',async()=>{
 await act(async()=>root.render(<StrictMode><MemoryRouter initialEntries={['/quiz']}><Routes><Route path="/quiz" element={<div>Quiz</div>}/><Route path="/voice-search" element={<VoiceSearchPage/>}/></Routes><BottomNav/></MemoryRouter></StrictMode>));
 expect(mocks.start).not.toHaveBeenCalled();
 await act(async()=>{(container.querySelector('[aria-label="Identifier un verset avec le micro"]') as HTMLAnchorElement).click();});
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,20));});
 expect(mocks.start).not.toHaveBeenCalled();expect(mocks.status).not.toHaveBeenCalled();expect(mocks.download).not.toHaveBeenCalled();expect(mocks.pause).not.toHaveBeenCalled();
 expect(button().textContent).toBe('Réciter');
 expect(container.querySelector('a[href="/quiz"]')?.getAttribute('aria-label')).toBe('Retour');
 await act(async()=>button().click());
 expect(mocks.start).toHaveBeenCalledOnce();expect(button().textContent).toBe('Annuler');
 await act(async()=>button().click());
 expect(mocks.start).toHaveBeenCalledOnce();
 });
 it('does not activate microphone or download just by opening the page',()=>{
 expect(mocks.start).not.toHaveBeenCalled();expect(mocks.download).not.toHaveBeenCalled();expect(button().textContent).toBe('Réciter');
 expect(mocks.free).not.toHaveBeenCalled();
 });
 it('ignores a legacy navigation state that requested automatic activation',async()=>{
 await act(async()=>root.render(<MemoryRouter key="legacy-entry" initialEntries={[{pathname:'/voice-search',state:{startVoiceSearch:true}}]}><VoiceSearchPage/></MemoryRouter>));
 await act(async()=>{await new Promise(resolve=>setTimeout(resolve,20));});
 expect(mocks.start).not.toHaveBeenCalled();expect(mocks.free).not.toHaveBeenCalled();expect(mocks.download).not.toHaveBeenCalled();expect(mocks.pause).not.toHaveBeenCalled();
 });
 it('downloads on the first tap then starts automatically without visiting storage',async()=>{
 mocks.status.mockResolvedValue({ready:false});await act(async()=>button().click());
 expect(mocks.download).toHaveBeenCalledOnce();expect(mocks.start).toHaveBeenCalledOnce();expect(button().textContent).toBe('Annuler');
 expect(container.textContent).not.toContain('Terminer et analyser');
 });
 it('reuses the installed pack and renders a recognized verse directly',async()=>{
 await act(async()=>button().click());expect(mocks.download).not.toHaveBeenCalled();
 const callbacks=mocks.start.mock.calls[0][0] as SearchCallbacks;
 await act(async()=>{callbacks.onVerse({surah:112,ayah:1});callbacks.onEnd();});
 expect(container.textContent).toContain('قل هو الله أحد');expect(container.textContent).toContain('Dis : Il est Allah, Unique.');
 expect(button().textContent).toBe('Identifier un autre passage');
 expect(Array.from(container.querySelectorAll('a')).find(a => a.textContent === 'Ouvrir dans le Mushaf')?.getAttribute('href')).toBe('/read?surah=112&ayah=1');
 expect(Array.from(container.querySelectorAll('a')).find(a => a.textContent === 'Mémoriser ce verset')?.getAttribute('href')).toBe('/hifdh?surah=112&ayah=1');
 expect(mocks.pause).toHaveBeenCalledOnce();
 });
 it('cancel during download prevents delayed microphone activation',async()=>{
 let complete!:()=>void;mocks.status.mockResolvedValue({ready:false});mocks.download.mockImplementation(()=>new Promise<void>(resolve=>{complete=resolve;}));
 await act(async()=>button().click());const signal=mocks.download.mock.calls[0][1] as AbortSignal;
 await act(async()=>button().click());expect(signal.aborted).toBe(true);
 await act(async()=>complete());expect(mocks.start).not.toHaveBeenCalled();expect(button().textContent).toBe('Réciter');
 });
 it('does not listen after failed setup and offers the same retry action',async()=>{
 mocks.status.mockResolvedValue({ready:false});mocks.download.mockRejectedValue(new Error('Connexion interrompue'));
 await act(async()=>button().click());expect(container.textContent).toContain('Connexion interrompue');expect(button().textContent).toBe('Réciter');expect(mocks.start).not.toHaveBeenCalled();
 });
});

const clickNamed = async (name:string) => act(async()=>{const b=Array.from(container.querySelectorAll('button')).find(b=>b.textContent?.trim()===name);expect(b).toBeDefined();b!.click();});
it('keeps listening after a free match, masks Arabic and translation across subsequent verses',async()=>{
 await clickNamed('Réciter librement');await clickNamed('Visible');await act(async()=>button().click());
 expect(mocks.free).toHaveBeenCalledOnce();expect(mocks.start).not.toHaveBeenCalled();
 const c=mocks.free.mock.calls[0][0] as FreeCallbacks;await act(async()=>c.onVerse({surah:112,ayah:1}));
 expect(button().textContent).toBe('Mettre en pause');expect(container.textContent).not.toContain('قل هو الله أحد');expect(container.textContent).not.toContain('Dis : Il est Allah');
 await clickNamed('Masqué');expect(container.textContent).toContain('قل هو الله أحد');
 await clickNamed('Visible');await act(async()=>c.onVerse({surah:112,ayah:2}));expect(container.textContent).toContain('À vous de réciter');expect(button().textContent).toBe('Mettre en pause');
});
it('keeps the current verse until a different proposed passage is confirmed',async()=>{
 await clickNamed('Réciter librement');await act(async()=>button().click());const c=mocks.free.mock.calls[0][0] as FreeCallbacks;
 await act(async()=>{c.onVerse({surah:112,ayah:1});c.onCandidate({surah:2,ayah:75});});
 expect(container.querySelector('[aria-label="Passage reconnu"]')?.textContent).toContain('112:1');
 mocks.confirm.mockImplementation(()=>{c.onVerse({surah:2,ayah:75});return true;});await clickNamed('C’est ce passage');
 expect(mocks.confirm).toHaveBeenCalledWith({surah:2,ayah:75});expect(container.querySelector('[aria-label="Passage reconnu"]')?.textContent).toContain('2:75');
});
it('cancels free listening and ignores callbacks that arrive after pause',async()=>{
 await clickNamed('Réciter librement');await act(async()=>button().click());const c=mocks.free.mock.calls[0][0] as FreeCallbacks;
 await act(async()=>c.onVerse({surah:112,ayah:1}));await act(async()=>button().click());
 await act(async()=>{c.onVerse({surah:2,ayah:75});c.onCandidate({surah:3,ayah:1});c.onError('stale error');});
 expect(container.querySelector('[aria-label="Passage reconnu"]')?.textContent).toContain('112:1');expect(container.querySelector('[aria-label="Passage à confirmer"]')).toBeNull();expect(container.textContent).not.toContain('stale error');expect(button().textContent).toBe('Reprendre la récitation');
});
it('switches modes with the microphone paused until another manual activation',async()=>{
 await act(async()=>button().click());const c=mocks.start.mock.calls[0][0] as SearchCallbacks;
 await clickNamed('Réciter librement');expect(mocks.stop).toHaveBeenCalled();expect(mocks.free).not.toHaveBeenCalled();
 await act(async()=>c.onVerse({surah:112,ayah:1}));expect(container.querySelector('[aria-label="Passage reconnu"]')).toBeNull();
 await act(async()=>button().click());expect(mocks.free).toHaveBeenCalledOnce();
});
it('pauses on background and never reopens the microphone automatically on return',async()=>{
 await clickNamed('Réciter librement');await act(async()=>button().click());
 const original=Object.getOwnPropertyDescriptor(document,'hidden');Object.defineProperty(document,'hidden',{configurable:true,value:true});
 await act(async()=>document.dispatchEvent(new Event('visibilitychange')));
 Object.defineProperty(document,'hidden',{configurable:true,value:false});await act(async()=>document.dispatchEvent(new Event('visibilitychange')));
 expect(mocks.free).toHaveBeenCalledOnce();expect(container.textContent).toContain('Écoute mise en pause');
 if(original)Object.defineProperty(document,'hidden',original);else Reflect.deleteProperty(document,'hidden');
});

it('preserves offered passages and never automatically replaces them with a contradictory match',async()=>{
 await act(async()=>button().click());const c=mocks.start.mock.calls.at(-1)![0] as SearchCallbacks;
 await act(async()=>c.onCandidates?.([{surah:2,ayah:75}]));
 await act(async()=>c.onCandidates?.([{surah:112,ayah:1}]));
 expect(Array.from(container.querySelectorAll('.voice-candidates h3 small')).map(e=>e.textContent)).toEqual(['2:75','112:1']);
 await act(async()=>{c.onCandidates?.([]);c.onVerse({surah:112,ayah:1});c.onEnd();});
 expect(container.querySelector('.voice-result')).toBeNull();expect(mocks.stop).toHaveBeenCalled();
 expect(container.textContent).toContain('L’écoute est arrêtée');expect(button().textContent).toBe('Réciter');
 await act(async()=>c.onCandidates?.([{surah:3,ayah:1}]));
 expect(container.querySelector('.voice-candidates')?.textContent).not.toContain('3:1');
 await act(async()=>{(container.querySelector('.voice-candidates article button') as HTMLButtonElement).click();});
 expect(container.querySelector('.voice-reference')?.textContent).toBe('2:75');
 await act(async()=>c.onVerse({surah:112,ayah:1}));expect(container.querySelector('.voice-reference')?.textContent).toBe('2:75');
});
it('automatically accepts a coherent match, then ignores later results',async()=>{
 await act(async()=>button().click());const c=mocks.start.mock.calls.at(-1)![0] as SearchCallbacks;
 await act(async()=>{c.onCandidates?.([{surah:112,ayah:1}]);c.onCandidates?.([]);c.onVerse({surah:112,ayah:1});c.onEnd();});
 expect(container.querySelector('.voice-reference')?.textContent).toBe('112:1');expect(container.querySelector('.voice-candidates')).toBeNull();
 await act(async()=>c.onVerse({surah:2,ayah:75}));expect(container.querySelector('.voice-reference')?.textContent).toBe('112:1');
});
it('retains a confirmed alternative even when the three provisional choices are already full and resets on retry',async()=>{
 await act(async()=>button().click());const c=mocks.start.mock.calls.at(-1)![0] as SearchCallbacks;
 await act(async()=>{c.onCandidates?.([{surah:2,ayah:75},{surah:3,ayah:1},{surah:4,ayah:1}]);c.onVerse({surah:112,ayah:1});});
 expect(container.querySelectorAll('.voice-candidates article')).toHaveLength(4);
 await act(async()=>button().click());expect(container.querySelector('.voice-candidates')).toBeNull();
 const retry=mocks.start.mock.calls.at(-1)![0] as SearchCallbacks;await act(async()=>retry.onVerse({surah:112,ayah:1}));
 expect(container.querySelector('.voice-reference')?.textContent).toBe('112:1');
});
