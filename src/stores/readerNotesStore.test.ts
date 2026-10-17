// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useReaderNotesStore,validReaderNote} from './readerNotesStore';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useReaderNotesStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useReaderNotesStore.setState({notes:{}});});
it('persists notes on the correct verse and restores after reload',async()=>{useReaderNotesStore.getState().save({surah:2,ayah:17,page:4,kind:'remember',text:'  À revoir  '});const raw=localStorage.getItem('quran-coach-reader-notes')!;useReaderNotesStore.setState({notes:{}});localStorage.setItem('quran-coach-reader-notes',raw);await useReaderNotesStore.persist.rehydrate();expect(useReaderNotesStore.getState().notes['2:17']).toMatchObject({text:'À revoir',page:4});});
it('rejects mismatched Quran references and corrupt saved data',async()=>{expect(validReaderNote({surah:2,ayah:17,page:604,kind:'personal',text:'bad',updatedAt:1})).toBe(false);localStorage.setItem('quran-coach-reader-notes',JSON.stringify({state:{notes:{wrong:{surah:2,ayah:17,page:604}}},version:1}));await useReaderNotesStore.persist.rehydrate();expect(useReaderNotesStore.getState().notes).toEqual({});});
