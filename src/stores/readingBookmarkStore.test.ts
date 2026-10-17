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
 useSettingsStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useReadingBookmarkStore.setState({bookmark:null,bookmarks:[]});});
it.each<BookmarkView>(['mushaf','madinah','tajweed','tajweed-interactive'])('keeps and restores an exact %s bookmark after navigation and rehydration',async view=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:255,page:42,view,precision:'verse'});
 const saved=useReadingBookmarkStore.getState().bookmark!;
 useQuranStore.getState().goToAyah(36,5,440,{silent:true});
 useQuranStore.getState().goToPage(100);
 expect(useReadingBookmarkStore.getState().bookmark).toEqual(saved);
 useReadingBookmarkStore.setState({bookmark:null,bookmarks:[]});
 localStorage.setItem('quran-coach-reading-bookmark',JSON.stringify({state:{bookmark:saved},version:0}));
 await useReadingBookmarkStore.persist.rehydrate();
 resumeReadingBookmark(useReadingBookmarkStore.getState().bookmark!);
 // Removed image modes migrate to the interactive reader; the exact bookmark survives.
 expect(useSettingsStore.getState().viewMode).toBe(view==='madinah'||view==='tajweed'?'tajweed-interactive':view);
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
it('removes a bookmark persistently without changing the reading position',async()=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:13,page:3,view:'tajweed-interactive',precision:'verse'});
 useQuranStore.setState({currentPage:42,currentSurah:2,currentAyah:255});
 useReadingBookmarkStore.getState().remove();
 await useReadingBookmarkStore.persist.rehydrate();
 expect(useReadingBookmarkStore.getState().bookmark).toBeNull();
 expect(useQuranStore.getState()).toMatchObject({currentPage:42,currentSurah:2,currentAyah:255});
});
it('keeps named signets alongside the home resume marker and removes only the chosen one',()=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:13,page:3,view:'tajweed-interactive',precision:'verse'});
 const resume=useReadingBookmarkStore.getState().bookmark;
 useReadingBookmarkStore.getState().saveNamed({surah:18,ayah:10,page:293,view:'tajweed-interactive',precision:'verse'},'À mémoriser');
 const named=useReadingBookmarkStore.getState().bookmarks.find(item=>item.label==='À mémoriser')!;
 expect(useReadingBookmarkStore.getState().bookmark).toEqual(resume);
 expect(useReadingBookmarkStore.getState().bookmarks).toHaveLength(2);
 useReadingBookmarkStore.getState().remove(named.id);
 expect(useReadingBookmarkStore.getState().bookmarks).toHaveLength(1);
 expect(useReadingBookmarkStore.getState().bookmark).toEqual(resume);
});
it('removing the home resume marker preserves separately named signets',()=>{
 useReadingBookmarkStore.getState().save({surah:2,ayah:13,page:3,view:'tajweed-interactive',precision:'verse'});
 useReadingBookmarkStore.getState().saveNamed({surah:18,ayah:10,page:293,view:'tajweed-interactive',precision:'verse'},'À mémoriser');
 useReadingBookmarkStore.getState().remove();
 expect(useReadingBookmarkStore.getState().bookmark).toBeNull();
 expect(useReadingBookmarkStore.getState().bookmarks.map(item=>item.label)).toEqual(['À mémoriser']);
});
it('migrates the former single bookmark into the named signet list',async()=>{
 const old={surah:2,ayah:255,page:42,view:'mushaf' as const,precision:'verse' as const,savedAt:123};
 localStorage.setItem('quran-coach-reading-bookmark',JSON.stringify({state:{bookmark:old},version:0}));
 await useReadingBookmarkStore.persist.rehydrate();
 expect(useReadingBookmarkStore.getState().bookmark).toMatchObject({...old,id:'resume-reading',label:'Reprendre ma lecture'});
 expect(useReadingBookmarkStore.getState().bookmarks).toEqual([useReadingBookmarkStore.getState().bookmark]);
});
