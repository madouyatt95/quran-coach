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

it('adds text framing to old preferences without discarding the theme or custom zoom',async()=>{
 const {useInteractiveReaderStore}=await import('./interactiveReaderStore');
 useInteractiveReaderStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 localStorage.setItem('quran-coach-interactive-reader',JSON.stringify({state:{zoom:1.75,paper:'dark'},version:2}));
 await useInteractiveReaderStore.persist.rehydrate();
 expect(useInteractiveReaderStore.getState()).toMatchObject({framing:'text',zoom:1.75,paper:'dark'});
 useInteractiveReaderStore.getState().setFraming('page');
 await useInteractiveReaderStore.persist.rehydrate();
 expect(useInteractiveReaderStore.getState()).toMatchObject({framing:'page',zoom:1.15,paper:'dark'});
});
it('keeps screen wake opt-in across reloads without enabling it for existing users',async()=>{
 const {useInteractiveReaderStore}=await import('./interactiveReaderStore');
 expect(useInteractiveReaderStore.getState().keepScreenAwake).toBe(false);
 useInteractiveReaderStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useInteractiveReaderStore.getState().setKeepScreenAwake(true);
 await useInteractiveReaderStore.persist.rehydrate();
 expect(useInteractiveReaderStore.getState().keepScreenAwake).toBe(true);
});
it('remembers independent phone, spread and desk comfort settings after reload',async()=>{
 const {useInteractiveReaderStore:s}=await import('./interactiveReaderStore');
 s.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 s.getState().setZoom(1.4);
 s.getState().activateComfort('desk');s.getState().setFraming('page');s.getState().setZoom(1.8);
 // An unconfigured profile inherits the current view. Set this profile's
 // framing explicitly; the check here concerns saved choices, not new defaults.
 s.getState().activateComfort('spread');expect(s.getState().zoom).toBe(1.8);s.getState().setFraming('text');s.getState().setZoom(1.3);
 await s.persist.rehydrate();expect(s.getState()).toMatchObject({zoom:1.4,framing:'text',comfortProfile:'single'});
 s.getState().activateComfort('desk');expect(s.getState()).toMatchObject({zoom:1.8,framing:'page'});
 s.getState().activateComfort('spread');expect(s.getState()).toMatchObject({zoom:1.3,framing:'text'});
});
it('toggles accompanied Tajwid without changing the saved Mushaf dimensions or framing',async()=>{
 const {useInteractiveReaderStore:s}=await import('./interactiveReaderStore');
 s.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 s.getState().setZoom(1.7);s.getState().setTajweedCompanion(true);
 await s.persist.rehydrate();expect(s.getState()).toMatchObject({zoom:1.7,framing:'text',tajweedCompanion:true});
 s.getState().setTajweedCompanion(false);expect(s.getState().zoom).toBe(1.7);
});
