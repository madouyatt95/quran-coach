// @vitest-environment jsdom
import {createMemoryStorage} from '../test/memoryStorage';
import {beforeEach,it,expect,vi} from 'vitest';
import {readBackupHealth,recordBackupHealth,BACKUP_HEALTH_EVENT} from './backupHealth';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());});
it('distinguishes an export preparation from a successful cloud synchronization',()=>{recordBackupHealth('export','2026-11-06T10:00:00Z');expect(readBackupHealth().sync).toBeUndefined();recordBackupHealth('sync','2026-11-06T10:01:00Z');expect(readBackupHealth()).toEqual({export:'2026-11-06T10:00:00Z',sync:'2026-11-06T10:01:00Z'});});
it('ignores corrupt timestamps',()=>{localStorage.setItem('qc-backup-health-v1','{"sync":"wrong","export":null}');expect(readBackupHealth()).toEqual({});});
it('does not fail a successful synchronization when storage is full',()=>{const write=vi.spyOn(localStorage,'setItem').mockImplementation(()=>{throw new Error('Quota');});const listener=vi.fn();window.addEventListener(BACKUP_HEALTH_EVENT,listener);expect(()=>recordBackupHealth('sync','2026-11-06')).not.toThrow();expect(listener).toHaveBeenCalledOnce();window.removeEventListener(BACKUP_HEALTH_EVENT,listener);write.mockRestore();});
