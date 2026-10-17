// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useLearningStore } from '../stores/learningStore';
import { useReadingBookmarkStore } from '../stores/readingBookmarkStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useSRSStore } from '../stores/srsStore';
import { PassagePage } from './PassagePage';

const mock = vi.hoisted(() => ({ translation: vi.fn() }));
vi.mock('../lib/quranApi', () => ({
  fetchSurah: async () => ({ ayahs: [{number:82,numberInSurah:75,surah:2,text:'نَصُّ الْآيَةِ',page:11,juz:1,hizbQuarter:1}] }),
  fetchSurahTranslation: mock.translation,
  getAudioUrl: () => 'https://audio.example/82.mp3',
}));
vi.mock('../components/Learning/VerseComparison', () => ({VerseComparison: () => <p>Comparaison ouverte</p>}));
vi.mock('../components/Learning/ComprehensionCheck', () => ({ComprehensionCheck: () => null}));
vi.mock('../components/Fahm/FahmPanel', () => ({FahmPanel: () => <p>Compréhension ouverte</p>}));

Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT:true});
let root:Root, host:HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('localStorage',createMemoryStorage());
  useFavoritesStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
  useLearningStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
  useReadingBookmarkStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
  useSettingsStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
  useSRSStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
  useFavoritesStore.setState({favorites:[]});
  useReadingBookmarkStore.setState({bookmark:null});
  useLearningStore.setState({session:null});
  mock.translation.mockResolvedValue(new Map([[82,'Traduction du verset']]));
  host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();vi.clearAllMocks();});

it('opens the exact verse and connects bookmark, favorite, understanding, comparison and reading',async()=>{
  await act(async()=>root.render(<MemoryRouter initialEntries={['/passage?surah=2&ayah=75&from=read']}><Routes><Route path="/passage" element={<PassagePage/>}/></Routes></MemoryRouter>));
  expect(host.textContent).toContain('Verset 2:75');
  expect(host.textContent).toContain('Traduction du verset');
  expect(host.querySelector('audio')?.getAttribute('src')).toBe('https://audio.example/82.mp3');
  const button=(label:string)=>Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes(label))!;
  await act(async()=>button('Signet').click());
  expect(useReadingBookmarkStore.getState().bookmark).toMatchObject({surah:2,ayah:75,page:11,precision:'verse'});
  await act(async()=>button('Favori').click());
  expect(useFavoritesStore.getState().isFavorite(82)).toBe(true);
  await act(async()=>button('Comprendre').click());
  expect(host.textContent).toContain('Compréhension ouverte');
  await act(async()=>button('Comparer').click());
  expect(host.textContent).toContain('Comparaison ouverte');
  expect(Array.from(host.querySelectorAll('a')).map(a=>a.getAttribute('href'))).toContain('/read?surah=2&ayah=75');
  expect(Array.from(host.querySelectorAll('a')).map(a=>a.getAttribute('href'))).toContain('/hifdh?surah=2&ayah=75&from=passage');
});

it('keeps the Arabic text usable when the French translation fails',async()=>{
  mock.translation.mockRejectedValueOnce(new Error('offline'));
  await act(async()=>root.render(<MemoryRouter initialEntries={['/passage?surah=2&ayah=75']}><Routes><Route path="/passage" element={<PassagePage/>}/></Routes></MemoryRouter>));
  expect(host.textContent).toContain('نَصُّ الْآيَةِ');
  expect(host.textContent).toContain('Traduction indisponible');
});
