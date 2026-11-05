import {expect,it} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import {scopedStorage,createLocalProfile,readProfiles,readActiveProfile,PROFILE_ACTIVE} from './profileStorage';
it('preserves default progress while isolating two family members',()=>{
 const disk=createMemoryStorage(),owner=scopedStorage(disk,'default'),a=scopedStorage(disk,'a'),b=scopedStorage(disk,'b');
 owner.setItem('academy-store','original');a.setItem('academy-store','child');
 expect(owner.getItem('academy-store')).toBe('original');expect(a.getItem('academy-store')).toBe('child');expect(b.getItem('academy-store')).toBeNull();
 a.removeItem('academy-store');expect(owner.getItem('academy-store')).toBe('original');
});
it('keeps downloaded resources shared without sharing notes',()=>{const disk=createMemoryStorage(),a=scopedStorage(disk,'a'),b=scopedStorage(disk,'b');a.setItem('quran-coach-downloads-v1','pack');expect(b.getItem('quran-coach-downloads-v1')).toBe('pack');a.setItem('qc-book-notebook-v1','note');expect(b.getItem('qc-book-notebook-v1')).toBeNull();});
it('creates an empty profile without copying credentials or default records',()=>{const disk=createMemoryStorage();disk.setItem('sb-token','private');const p=createLocalProfile('Amina','child','beginner',disk);disk.setItem(PROFILE_ACTIVE,p.id);expect(readActiveProfile(disk)).toMatchObject({name:'Amina',kind:'child'});expect(readProfiles(disk)).toHaveLength(2);expect(scopedStorage(disk,p.id).getItem('sb-token')).toBeNull();expect(disk.getItem('sb-token')).toBe('private');});
it('enumerates only the selected space and refuses global clear',()=>{const disk=createMemoryStorage(),a=scopedStorage(disk,'a'),b=scopedStorage(disk,'b');a.setItem('one','1');b.setItem('two','2');expect(a.length).toBe(1);expect(a.key(0)).toBe('one');expect(()=>a.clear()).toThrow();expect(b.getItem('two')).toBe('2');});
it('falls back safely when a selected profile is missing or storage throws',()=>{const disk=createMemoryStorage();disk.setItem(PROFILE_ACTIVE,'missing');expect(readActiveProfile(disk).id).toBe('default');disk.getItem=()=>{throw new Error('blocked');};expect(readActiveProfile(disk).id).toBe('default');});
