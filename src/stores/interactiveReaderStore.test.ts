// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { createMemoryStorage } from '../test/memoryStorage';

beforeEach(()=>{
 vi.resetModules();
 vi.stubGlobal('localStorage',createMemoryStorage());
});

it('starts the interactive Mushaf at 115 percent',async()=>{
 const {useInteractiveReaderStore,DEFAULT_INTERACTIVE_READER_ZOOM}=await import('./interactiveReaderStore');
 expect(useInteractiveReaderStore.getState().zoom).toBe(DEFAULT_INTERACTIVE_READER_ZOOM);
});

it('migrates the old default to 115 percent while preserving a saved custom zoom and theme',async()=>{
 const {useInteractiveReaderStore,DEFAULT_INTERACTIVE_READER_ZOOM}=await import('./interactiveReaderStore');
 useInteractiveReaderStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 localStorage.setItem('quran-coach-interactive-reader',JSON.stringify({state:{zoom:1,paper:'dark'},version:0}));
 await useInteractiveReaderStore.persist.rehydrate();
 expect(useInteractiveReaderStore.getState()).toMatchObject({zoom:DEFAULT_INTERACTIVE_READER_ZOOM,paper:'dark'});

 localStorage.setItem('quran-coach-interactive-reader',JSON.stringify({state:{zoom:1.75,paper:'light'},version:0}));
 await useInteractiveReaderStore.persist.rehydrate();
 expect(useInteractiveReaderStore.getState()).toMatchObject({zoom:1.75,paper:'light'});
});
