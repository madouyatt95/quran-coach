// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadPage } from './ReadPage';
import { useLiveFollowStore } from '../stores/liveFollowStore';
const mocks = vi.hoisted(() => ({go:vi.fn(),page:vi.fn(),fetch:vi.fn(),view:"mushaf"}));
vi.mock('../stores/quranStore', () => ({useQuranStore:()=>({goToAyah:mocks.go,goToPage:mocks.page})}));
vi.mock('../stores/settingsStore', () => ({useSettingsStore:()=>({viewMode:mocks.view})}));
vi.mock('../lib/quranApi', () => ({fetchSurah:mocks.fetch}));
vi.mock('../components/Mushaf/MushafGestureNavigator',()=>({MushafGestureNavigator:()=>null}));
vi.mock('../components/Mushaf/LiveFollowPanel', () => ({LiveFollowPanel:()=>null}));
vi.mock('../components/Mushaf/MushafPage', () => ({MushafPage:()=>null}));
vi.mock('../components/Navigation/SideMenu', () => ({SideMenu:()=>null}));
vi.mock('../components/Navigation/SearchModal', () => ({SearchModal:()=>null}));
vi.mock('../components/VoiceSearch/VoiceSearch', () => ({VoiceSearch:()=>null}));
vi.mock('../components/Mushaf/InteractiveTajweed/InteractiveTajweedPage',()=>({InteractiveTajweedPage:()=> <div data-testid="interactive-reader"/>}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root;let container:HTMLDivElement;
beforeEach(()=>{mocks.view="mushaf";useLiveFollowStore.setState({active:false,position:null,passage:null});vi.clearAllMocks();mocks.fetch.mockResolvedValue({ayahs:[{numberInSurah:255,page:42}]});container=document.createElement('div');document.body.append(container);root=createRoot(container);});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();});
describe('recognized passage reading links',()=>{
 it('opens the exact verse and its Mushaf page while preserving the reading bookmark',async()=>{
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read?surah=2&ayah=255']}><ReadPage/></MemoryRouter>));
 expect(mocks.go).toHaveBeenLastCalledWith(2,255,42,{silent:true});
 });
 it('does not move the persistent reader when memorization is chosen',async()=>{
 await act(async()=>root.render(<MemoryRouter initialEntries={['/hifdh?surah=2&ayah=255']}><ReadPage/></MemoryRouter>));
 expect(mocks.go).not.toHaveBeenCalled();expect(mocks.fetch).not.toHaveBeenCalled();
 });
});

it('uses a saved page without network access', async () => {
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read?surah=2&ayah=255&page=42']}><ReadPage/></MemoryRouter>));
 expect(mocks.fetch).not.toHaveBeenCalled();
 expect(mocks.go).toHaveBeenCalledWith(2,255,42,{silent:true});
});
it('shows a retry instead of jumping to a wrong page when the verse cannot load', async () => {
 mocks.fetch.mockRejectedValueOnce(new Error('Offline'));
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read?surah=2&ayah=255']}><ReadPage/></MemoryRouter>));
 expect(mocks.go).not.toHaveBeenCalled(); expect(container.querySelector('[role="alert"]')).not.toBeNull();
 await act(async()=>container.querySelector('button')!.click());
 expect(mocks.go).toHaveBeenCalledWith(2,255,42,{silent:true});
 expect(container.querySelector('[role="alert"]')).toBeNull();
});

it('returns an image reader to its page without inventing a verse', async () => {
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read?page=11']}><ReadPage/></MemoryRouter>));
 expect(mocks.go).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
 expect(mocks.page).toHaveBeenCalledWith(11,{silent:true});
});

it('keeps the interactive Tajwid reader mounted when live voice following starts',async()=>{
 mocks.view='tajweed-interactive';useLiveFollowStore.setState({active:true});
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><ReadPage/></MemoryRouter>));
 await act(async()=>{await vi.dynamicImportSettled();});
 expect(container.querySelector('[data-testid="interactive-reader"]')).not.toBeNull();
});

it('uses QCF edition boundaries for a search result even when the old reader supplies another page',async()=>{
 mocks.view='tajweed-interactive';
 await act(async()=>root.render(<MemoryRouter initialEntries={['/read?surah=5&ayah=77&page=121']}><ReadPage/></MemoryRouter>));
 await act(async()=>{await vi.dynamicImportSettled();});
 expect(mocks.go).toHaveBeenLastCalledWith(5,77,120,{silent:true});
 expect(mocks.fetch).not.toHaveBeenCalled();
});
