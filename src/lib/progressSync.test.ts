// @vitest-environment jsdom
import { describe,it,expect,vi,beforeEach } from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import { planProgressSync,applySyncedProgress } from './progressSync';
import { RECOVERY_KEY,type ProgressBackup,type BackupStore } from './progressBackup';
const key='quran-coach-reading-bookmark';
const backup=(value:unknown):ProgressBackup=>({format:'quran-coach-progress',version:1,createdAt:'2026-10-17T00:00:00Z',sections:value===undefined?{}:{[key]:{version:0,state:{bookmark:value ? {...value as Record<string,number>,page:2,view:'tajweed-interactive',precision:'verse',savedAt:10} : null}}}});
describe('three-way progress reconciliation',()=>{
 it('uses remote edits when this device did not change',()=>{const p=planProgressSync(backup(null),backup(null),backup({surah:2,ayah:1}));expect(p.conflicts).toEqual([]);expect(p.backup).toEqual(backup({surah:2,ayah:1}));});
 it('retains local edits when remote did not change',()=>{const p=planProgressSync(backup(null),backup({surah:2,ayah:1}),backup(null));expect(p.conflicts).toEqual([]);expect(p.backup).toEqual(backup({surah:2,ayah:1}));});
 it('requires explicit decision when both changed',()=>{const p=planProgressSync(backup(null),backup({surah:2,ayah:1}),backup({surah:3,ayah:1}));expect(p.conflicts.map(c=>c.key)).toEqual([key]);const chosen=planProgressSync(backup(null),backup({surah:2,ayah:1}),backup({surah:3,ayah:1}),{[key]:'cloud'});expect(chosen.backup).toEqual(backup({surah:3,ayah:1}));});
 it('does not resurrect a removed bookmark',()=>{const p=planProgressSync(backup({surah:2,ayah:1}),backup({surah:2,ayah:1}),backup(null));expect(p.conflicts).toEqual([]);expect(p.backup).toEqual(backup(null));});
 it('preserves missing section deletions',()=>{expect(planProgressSync(backup(null),backup(null),backup(undefined)).backup.sections).toEqual({});});
 it('requires a choice on first connection for differing existing sections',()=>{expect(planProgressSync(null,backup(null),backup({surah:2,ayah:1})).conflicts).toHaveLength(1);});
 it('adds independent sections at first connection',()=>{expect(planProgressSync(null,backup(undefined),backup(null)).backup).toEqual(backup(null));});
 it('ignores object key order',()=>{const a=backup({surah:2,ayah:1}),b=backup({ayah:1,surah:2});expect(planProgressSync(null,a,b).conflicts).toEqual([]);});
});
describe('exact local sync application',()=>{
 const store:BackupStore={key,version:0,label:'Signet',defaults:{bookmark:null},rehydrate:vi.fn(),reset:vi.fn()};
 beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());vi.clearAllMocks();});
 it('backs up both original versions before replacing local progress',async()=>{localStorage.setItem(key,JSON.stringify(backup(null).sections[key]));const next=backup({surah:2,ayah:1});await applySyncedProgress(next,[store]);expect(JSON.parse(localStorage.getItem(key)!)).toEqual(next.sections[key]);expect(JSON.parse(localStorage.getItem(RECOVERY_KEY)!).received).toEqual(next);expect(store.rehydrate).toHaveBeenCalledOnce();});
 it('removes deleted sections and resets the matching runtime store',async()=>{localStorage.setItem(key,JSON.stringify(backup(null).sections[key]));await applySyncedProgress(backup(undefined),[store]);expect(localStorage.getItem(key)).toBeNull();expect(store.reset).toHaveBeenCalledOnce();});
 it('does not modify progress if recovery storage is full',async()=>{const raw=JSON.stringify(backup(null).sections[key]);localStorage.setItem(key,raw);const storage={getItem:(k:string)=>localStorage.getItem(k),setItem:()=>{throw new Error('quota');}} as unknown as Storage;await expect(applySyncedProgress(backup(undefined),[store],storage)).rejects.toThrow('quota');expect(localStorage.getItem(key)).toBe(raw);});
});
