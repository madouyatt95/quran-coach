// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
import {useReadingBookmarkStore, resumeReadingBookmark, type BookmarkView} from './readingBookmarkStore';
import {useQuranStore} from './quranStore';
import {useSettingsStore} from './settingsStore';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
vi.mock('./challengesStore',()=>({useChallengesStore:{getState:()=>({markPageRead:vi.fn()})}}));
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 useReadingBookmarkStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useSettingsStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useReadingBookmarkStore.setState({bookmark:null});});
it.each<BookmarkView>(['mushaf','madinah','tajweed'])('keeps and restores an exact %s bookmark after navigation and rehydration',async view=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:255,page:42,view,precision:'verse'});
 const saved=useReadingBookmarkStore.getState().bookmark!;
 useQuranStore.getState().goToAyah(36,5,440,{silent:true});
 useQuranStore.getState().goToPage(100);
 expect(useReadingBookmarkStore.getState().bookmark).toEqual(saved);
 useReadingBookmarkStore.setState({bookmark:null});
 localStorage.setItem('quran-coach-reading-bookmark',JSON.stringify({state:{bookmark:saved},version:0}));
 await useReadingBookmarkStore.persist.rehydrate();
 resumeReadingBookmark(useReadingBookmarkStore.getState().bookmark!);
 expect(useSettingsStore.getState().viewMode).toBe(view);
 expect(useQuranStore.getState()).toMatchObject({currentSurah:2,currentAyah:255,currentPage:42});
 expect(JSON.parse(sessionStorage.getItem('scrollToAyah')!)).toEqual({surah:2,ayah:255});
});
it('restores page-only bookmarks without claiming a verse and rejects invalid pages',()=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:1,page:42,view:'tajweed',precision:'page'});
 const saved=useReadingBookmarkStore.getState().bookmark!;resumeReadingBookmark(saved);
 expect(useQuranStore.getState().currentPage).toBe(42);
 useReadingBookmarkStore.getState().save({...saved,page:605});
 expect(useReadingBookmarkStore.getState().bookmark).toEqual(saved);
});
