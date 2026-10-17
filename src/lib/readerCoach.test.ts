// @vitest-environment jsdom
import {beforeEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useReaderCoachStore as inbox} from '../stores/readerCoachStore';
import {useQuranStore} from '../stores/quranStore';
import {useSettingsStore} from '../stores/settingsStore';
import {prepareReaderCoachTask,readerCoachTarget} from './readerCoach';
beforeEach(()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());
 inbox.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useQuranStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 useSettingsStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});
 inbox.setState({suggestions:[],returnPoint:null});
});
it('validates action and chapter boundaries',()=>{
 expect(readerCoachTarget(new URLSearchParams('surah=2&ayah=75&coach=practice'))).toEqual({surah:2,ayah:75,task:'practice'});
 for(const query of ['surah=1&ayah=8&coach=repeat','surah=2&ayah=0&coach=practice','surah=2&ayah=1&coach=unknown'])expect(readerCoachTarget(new URLSearchParams(query))).toBeNull();
});
it('keeps the original reading point across successive coach actions',()=>{
 useQuranStore.setState({currentPage:4,currentSurah:2,currentAyah:17});useSettingsStore.setState({viewMode:'madinah'});
 expect(prepareReaderCoachTask('practice',2,75)).toBe('/read?surah=2&ayah=75&coach=practice');
 useQuranStore.setState({currentPage:12,currentAyah:75});prepareReaderCoachTask('understand',2,76);
 expect(inbox.getState().returnPoint).toEqual({page:4,surah:2,ayah:17,view:'madinah'});
 expect(useSettingsStore.getState().viewMode).toBe('tajweed-interactive');
});
it('retains queued advice after rehydration and deduplicates it',async()=>{
 const item={id:'one',at:Date.now(),surah:2,ayah:17,page:4,level:'whisper' as const,trigger:'page_reread',emoji:'',title:'Review',message:'Message',priority:1,cooldownMinutes:30};
 inbox.getState().enqueue(item);inbox.getState().enqueue(item);expect(inbox.getState().suggestions).toHaveLength(1);
 await inbox.persist.rehydrate();expect(inbox.getState().suggestions[0].id).toBe('one');
 inbox.getState().remove('one');expect(inbox.getState().suggestions).toHaveLength(0);
});
