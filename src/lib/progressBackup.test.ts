// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import {createBackup,parseBackup,mergeProgress,mergedSection,restoreBackup,undoRestore,backupPreview,RECOVERY_KEY,type BackupStore,type ProgressBackup} from './progressBackup';
const key='academy-store';
const stores:BackupStore[]=[{key,label:'Notes',version:1,defaults:{notes:{},save:()=>{}},rehydrate:vi.fn()}];
const backup=(notes:Record<string,string>):ProgressBackup=>({format:'quran-coach-progress',version:1,createdAt:new Date().toISOString(),sections:{[key]:{state:{notes},version:1}}});
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());vi.clearAllMocks();});
it('exports only registered sections and never session tokens',()=>{
 localStorage.setItem('sb-auth-token','SECRET');localStorage.setItem(key,JSON.stringify(backup({a:'note'}).sections[key]));const saved=createBackup(stores);expect(Object.keys(saved.sections)).toEqual([key]);expect(JSON.stringify(saved)).not.toContain('SECRET');expect(parseBackup(JSON.stringify(saved),stores)).toEqual(saved);
});
it('rejects unknown sections, prototype keys, methods and future versions before writing',()=>{
 const raw=backup({a:'note'});expect(()=>parseBackup(JSON.stringify({...raw,sections:{'sb-auth-token':raw.sections[key]}}),stores)).toThrow();
 expect(()=>parseBackup(JSON.stringify(raw).replace('"a":"note"','"__proto__":{"polluted":true}'),stores)).toThrow();
 expect(()=>parseBackup(JSON.stringify({...raw,sections:{[key]:{version:1,state:{save:'replace function'}}}}),stores)).toThrow();
 expect(()=>parseBackup(JSON.stringify({...raw,sections:{[key]:{version:2,state:{notes:{}}}}}),stores)).toThrow();expect(localStorage.length).toBe(0);
});
it('preserves independent notes and resolves collisions only by the chosen priority',()=>{
 const a={notes:{same:'device',local:'keep'}},b={notes:{same:'file',remote:'add'}};
 expect(mergeProgress(a,b,'device')).toEqual({notes:{same:'device',local:'keep',remote:'add'}});
 expect(mergeProgress(a,b,'file')).toEqual({notes:{same:'file',local:'keep',remote:'add'}});
});
it('unions bookmark IDs without combining contradictory versions of one bookmark',()=>{
 const a={bookmarks:[{id:'a',page:4,savedAt:10}]},b={bookmarks:[{id:'a',page:8,savedAt:20},{id:'b',page:9,savedAt:30}]};
 expect((mergeProgress(a,b,'device') as typeof a).bookmarks).toEqual([{id:'a',page:4,savedAt:10},{id:'b',page:9,savedAt:30}]);
});
it('does not fabricate a completed Khatm by merging two separate cycles',()=>{
 const a={version:0,state:{startDate:'2026-01-01',endDate:'2026-02-01',validatedPages:[1,2]}},b={version:0,state:{startDate:'2026-03-01',endDate:'2026-04-01',validatedPages:[3,4]}};
 expect(mergedSection('quran-coach-khatm',a,b,'device')).toEqual(a);
});
it('respects excluded pages when merging the same Khatm cycle',()=>{
 const a={version:0,state:{startDate:'2026-01-01',endDate:'2026-02-01',validatedPages:[1],autoExcludedPages:[2]}},b={version:0,state:{...a.state,validatedPages:[2,3],autoExcludedPages:[]}};
 expect(mergedSection('quran-coach-khatm',a,b,'device').state.validatedPages).toEqual([1,3]);
});
it('preserves both inputs and supports undo after a real storage roundtrip',async()=>{
 const before=JSON.stringify(backup({a:'original'}).sections[key]);localStorage.setItem(key,before);
 const incoming=backup({a:'changed',b:'new'});expect(backupPreview(incoming,stores)[0].conflict).toBe(true);
 await restoreBackup(incoming,stores,{[key]:'file'});expect(JSON.parse(localStorage.getItem(key)!).state.notes).toEqual({a:'changed',b:'new'});
 expect(JSON.parse(localStorage.getItem(RECOVERY_KEY)!).received).toEqual(incoming);expect(stores[0].rehydrate).toHaveBeenCalledOnce();
 await undoRestore(stores);expect(localStorage.getItem(key)).toBe(before);
});
it('does not modify a section when recovery cannot be written',async()=>{
 const original=JSON.stringify(backup({a:'original'}).sections[key]);localStorage.setItem(key,original);
 const set=localStorage.setItem.bind(localStorage);vi.spyOn(localStorage,'setItem').mockImplementation((k,v)=>{if(k===RECOVERY_KEY)throw new Error('Quota');set(k,v);});
 await expect(restoreBackup(backup({a:'incoming'}),stores,{[key]:'file'})).rejects.toThrow('Quota');expect(localStorage.getItem(key)).toBe(original);
});
it('rolls back earlier section writes if a later one fails',async()=>{
 const second={...stores[0],key:'quran-coach-test-notes'};const all=[...stores,second];const old=JSON.stringify({state:{notes:{a:'old'}},version:1});localStorage.setItem(key,old);localStorage.setItem(second.key,old);
 const incoming=backup({a:'new'});incoming.sections[second.key]=incoming.sections[key];const set=localStorage.setItem.bind(localStorage);let failed=false;
 vi.spyOn(localStorage,'setItem').mockImplementation((k,v)=>{if(k===second.key&&!failed){failed=true;throw new Error('Quota');}set(k,v);});
 await expect(restoreBackup(incoming,all,{[key]:'file',[second.key]:'file'})).rejects.toThrow();expect(localStorage.getItem(key)).toBe(old);expect(localStorage.getItem(second.key)).toBe(old);
});

it('roundtrips personal book bookmarks and rejects invalid notes without losing legacy notebooks',()=>{
 const registry:BackupStore[]=[{key:'qc-book-notebook-v1',label:'Livres',version:0,defaults:{entries:[],bookmarks:[]},rehydrate:vi.fn()}];
 const entry={id:'adam:v1:p1',bookId:'adam',version:'v1',chapterId:'names',passageId:'p1',text:'Un passage',sources:['quran'],note:'Ma note',createdAt:1,audioId:'audio',seconds:42.5};
 localStorage.setItem(registry[0].key,JSON.stringify({version:0,state:{entries:[],bookmarks:[entry]}}));
 const exported=createBackup(registry);expect(parseBackup(JSON.stringify(exported),registry).sections[registry[0].key].state.bookmarks).toEqual([entry]);
 const invalid=JSON.parse(JSON.stringify(exported));invalid.sections[registry[0].key].state.bookmarks[0].note=123;
 expect(()=>parseBackup(JSON.stringify(invalid),registry)).toThrow();
 delete exported.sections[registry[0].key].state.bookmarks;
 expect(()=>parseBackup(JSON.stringify(exported),registry)).not.toThrow();
});

it('upgrades only the supported old book backup while preserving notes and audio positions',()=>{
 const registry:BackupStore[]=[{key:'qc-audio-library-v1',label:'Livres',version:2,defaults:{favorites:[],bookReading:{},bookReadingUpdatedAt:{},bookReadingPoints:{},bookNotes:{},positions:{}},rehydrate:vi.fn()}];
 const file={format:'quran-coach-progress',version:1,createdAt:new Date().toISOString(),sections:{'qc-audio-library-v1':{version:0,state:{favorites:['book:coeur-eprouve'],bookReading:{'coeur-eprouve':'tombe'},bookNotes:{'coeur-eprouve':'Ne pas perdre'},positions:{old:{seconds:15,updatedAt:1}}}}}};
 const restored=parseBackup(JSON.stringify(file),registry).sections['qc-audio-library-v1'];
 expect(restored.version).toBe(2);expect(restored.state.bookReading).toEqual({'coeur-eprouve':'tombe'});
 expect(restored.state.bookNotes).toEqual({'coeur-eprouve':'Ne pas perdre'});expect(restored.state.positions).toEqual(file.sections['qc-audio-library-v1'].state.positions);
 file.sections['qc-audio-library-v1'].version=3;expect(()=>parseBackup(JSON.stringify(file),registry)).toThrow();
});

it('imports the combined edition backup into independent books',()=>{
 const registry:BackupStore[]=[{key:'qc-audio-library-v1',label:'Livres',version:2,defaults:{bookReading:{},bookReadingUpdatedAt:{},bookReadingPoints:{},favorites:[]},rehydrate:vi.fn()}];
 const file={format:'quran-coach-progress',version:1,createdAt:new Date().toISOString(),sections:{'qc-audio-library-v1':{version:1,state:{bookReading:{'portes-de-misericorde':'tombe'},bookReadingUpdatedAt:{'portes-de-misericorde':10}}}}};
 expect(parseBackup(JSON.stringify(file),registry).sections['qc-audio-library-v1']).toMatchObject({version:2,state:{bookReading:{'coeur-eprouve':'tombe'}}});
});
