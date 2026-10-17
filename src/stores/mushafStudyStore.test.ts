// @vitest-environment jsdom
import {expect,it,vi} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
it('persists exact word identity and removes only the selected word',async()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());vi.resetModules();
 const {useMushafStudyStore}=await import('./mushafStudyStore');
 const word={key:'2:13:13',verseKey:'2:13',page:3,text:'أَلَآ'};
 useMushafStudyStore.getState().toggle(word);
 useMushafStudyStore.getState().toggle({...word,key:'2:13:14',text:'إِنَّهُمْ'});
 await useMushafStudyStore.persist.rehydrate();
 expect(useMushafStudyStore.getState().words[word.key]).toMatchObject(word);
 useMushafStudyStore.getState().toggle(word);
 expect(Object.keys(useMushafStudyStore.getState().words)).toEqual(['2:13:14']);
 vi.unstubAllGlobals();
});
