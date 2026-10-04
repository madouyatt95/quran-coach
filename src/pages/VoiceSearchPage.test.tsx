// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceSearchPage } from './VoiceSearchPage';
import type { SearchCallbacks } from '../lib/tilawa/service';
const mocks = vi.hoisted(() => ({status:vi.fn(),download:vi.fn(),start:vi.fn(),stop:vi.fn()}));
vi.mock('../lib/tilawa/assets', () => ({tilawaPackStatus:mocks.status,downloadTilawaPack:mocks.download}));
vi.mock('../lib/tilawa/service', () => ({tilawaService:{startSearch:mocks.start,stop:mocks.stop}}));
vi.mock('../stores/quranStore', () => ({useQuranStore:() => [{number:112,englishName:'Al-Ikhlas'}]}));
vi.mock('../lib/quranApi', () => ({fetchSurah:vi.fn().mockResolvedValue({ayahs:[{number:6222,numberInSurah:1,text:'قل هو الله أحد'}]}),fetchSurahTranslation:vi.fn().mockResolvedValue(new Map([[6222,'Dis : Il est Allah, Unique.']]))}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root;let container:HTMLDivElement;
const button=()=>container.querySelector('.voice-search-trigger') as HTMLButtonElement;
beforeEach(async()=>{
 vi.clearAllMocks();mocks.status.mockResolvedValue({ready:true});mocks.download.mockResolvedValue(undefined);mocks.start.mockResolvedValue(true);mocks.stop.mockResolvedValue(undefined);
 container=document.createElement('div');document.body.append(container);root=createRoot(container);
 await act(async()=>root.render(<MemoryRouter><VoiceSearchPage/></MemoryRouter>));
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
describe('one-button voice search',()=>{
 it('does not activate microphone or download just by opening the page',()=>{
 expect(mocks.start).not.toHaveBeenCalled();expect(mocks.download).not.toHaveBeenCalled();expect(button().textContent).toBe('Réciter');
 expect(container.querySelectorAll('button')).toHaveLength(1);
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
 expect(button().textContent).toBe('Réciter un autre passage');
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
