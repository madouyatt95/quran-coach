// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadPage } from './ReadPage';
const mocks = vi.hoisted(() => ({go:vi.fn(),fetch:vi.fn()}));
vi.mock('../stores/quranStore', () => ({useQuranStore:()=>({goToAyah:mocks.go})}));
vi.mock('../stores/settingsStore', () => ({useSettingsStore:()=>({viewMode:'mushaf'})}));
vi.mock('../lib/quranApi', () => ({fetchSurah:mocks.fetch}));
vi.mock('../components/Mushaf/LiveFollowPanel', () => ({LiveFollowPanel:()=>null}));
vi.mock('../components/Mushaf/MushafPage', () => ({MushafPage:()=>null}));
vi.mock('../components/Navigation/SideMenu', () => ({SideMenu:()=>null}));
vi.mock('../components/Navigation/SearchModal', () => ({SearchModal:()=>null}));
vi.mock('../components/VoiceSearch/VoiceSearch', () => ({VoiceSearch:()=>null}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root;let container:HTMLDivElement;
beforeEach(()=>{vi.clearAllMocks();mocks.fetch.mockResolvedValue({ayahs:[{numberInSurah:255,page:42}]});container=document.createElement('div');document.body.append(container);root=createRoot(container);});
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
