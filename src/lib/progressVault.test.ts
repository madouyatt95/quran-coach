import {webcrypto} from 'node:crypto';
import {it,expect,vi,beforeEach} from 'vitest';
import {encryptProgress,decryptProgress} from './progressVault';
const backup={format:'quran-coach-progress' as const,version:1 as const,createdAt:'2026-10-17T00:00:00Z',sections:{'quran-coach-reader-notes':{version:1,state:{notes:{private:'Ma réflexion privée'}}}}};
beforeEach(()=>vi.stubGlobal('crypto',webcrypto));
it('encrypts private notes before transmission and restores the exact payload',async()=>{const encrypted=await encryptProgress(backup,'une phrase bien privée');expect(JSON.stringify(encrypted)).not.toContain('réflexion');expect(JSON.parse(await decryptProgress(encrypted,'une phrase bien privée'))).toEqual(backup);});
it('rejects incorrect phrases and tampered ciphertext',async()=>{const encrypted=await encryptProgress(backup,'une phrase bien privée');await expect(decryptProgress(encrypted,'une autre phrase secrète')).rejects.toThrow();await expect(decryptProgress({...encrypted,ciphertext:'AAAA'+encrypted.ciphertext.slice(4)},'une phrase bien privée')).rejects.toThrow();});
it('uses different salts and nonces for repeated uploads',async()=>{const a=await encryptProgress(backup,'une phrase bien privée'),b=await encryptProgress(backup,'une phrase bien privée');expect(a.salt).not.toBe(b.salt);expect(a.iv).not.toBe(b.iv);expect(a.ciphertext).not.toBe(b.ciphertext);});
