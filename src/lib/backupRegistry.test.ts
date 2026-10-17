// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
it('registers all supported stores and roundtrips persisted default data without credentials',async()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());vi.stubGlobal('sessionStorage',createMemoryStorage());
 const {backupRegistry,BACKUP_LABELS,createBackup,parseBackup}=await import('./progressBackup');
 const stores=await backupRegistry();expect(new Set(stores.map(s=>s.key)).size).toBe(Object.keys(BACKUP_LABELS).length);
 for(const s of stores){const state=Object.fromEntries(Object.entries(s.defaults).filter(([,v])=>typeof v!=='function'&&v!==undefined));localStorage.setItem(s.key,JSON.stringify({state,version:s.version}));}
 const saved=createBackup(stores);expect(parseBackup(JSON.stringify(saved),stores)).toEqual(saved);
 expect(stores.some(s=>/circle|^quiz-store|prayer|notifications|downloads/.test(s.key))).toBe(false);
});

it('roundtrips real bookmarks, favorites, SRS cards and notes through the application stores',async()=>{
 const {backupRegistry,createBackup,parseBackup,restoreBackup}=await import('./progressBackup');
 const {useFavoritesStore}=await import('../stores/favoritesStore');
 const {useReadingBookmarkStore}=await import('../stores/readingBookmarkStore');
 const {useSRSStore}=await import('../stores/srsStore');
 const {useReaderNotesStore}=await import('../stores/readerNotesStore');
 useFavoritesStore.getState().addFavorite({number:160,surah:2,numberInSurah:153,text:'Texte de test',page:23});
 useReadingBookmarkStore.getState().save({surah:2,ayah:153,page:23,view:'tajweed-interactive',precision:'verse'});
 useSRSStore.getState().addCard(2,153);
 useReaderNotesStore.getState().save({surah:2,ayah:153,page:23,kind:'personal',text:'Note privée de test'});
 const stores=await backupRegistry(),file=parseBackup(JSON.stringify(createBackup(stores)),stores);
 useFavoritesStore.setState({favorites:[]});useReadingBookmarkStore.setState({bookmark:null,bookmarks:[]});useSRSStore.setState({cards:{}});useReaderNotesStore.setState({notes:{}});
 await restoreBackup(file,stores,Object.fromEntries(stores.map(s=>[s.key,'file'])));
 expect(useFavoritesStore.getState().favorites.some(f=>f.number===160)).toBe(true);
 expect(useReadingBookmarkStore.getState().bookmark?.ayah).toBe(153);
 expect(useSRSStore.getState().cards['2:153']).toBeDefined();
 expect(useReaderNotesStore.getState().notes['2:153']?.text).toBe('Note privée de test');
});
