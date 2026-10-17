import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { BACKUP_LIMIT, type ProgressBackup } from './progressBackup';
export interface EncryptedProgress {format:'qc-encrypted-progress-v1';salt:string;iv:string;ciphertext:string}
const base64=(bytes:Uint8Array)=>{let value='';for(const b of bytes)value+=String.fromCharCode(b);return btoa(value);};
const bytes=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
async function keyFor(passphrase:string,salt:Uint8Array<ArrayBuffer>){
 if(passphrase.length<12)throw new Error('Choisissez une phrase secrète d’au moins 12 caractères.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},key,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function encryptProgress(backup:ProgressBackup,passphrase:string):Promise<EncryptedProgress>{
 const plain=new TextEncoder().encode(JSON.stringify(backup));if(plain.length>BACKUP_LIMIT)throw new Error('Sauvegarde trop volumineuse.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await keyFor(passphrase,salt);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
 return {format:'qc-encrypted-progress-v1',salt:base64(salt),iv:base64(iv),ciphertext:base64(new Uint8Array(encrypted))};
}
export async function decryptProgress(payload:EncryptedProgress,passphrase:string):Promise<string>{
 if(payload?.format!=='qc-encrypted-progress-v1'||typeof payload.ciphertext!=='string'||payload.ciphertext.length>BACKUP_LIMIT*1.4||typeof payload.salt!=='string'||payload.salt.length>32||typeof payload.iv!=='string'||payload.iv.length>24)throw new Error('Sauvegarde chiffrée invalide.');
 try{const salt=bytes(payload.salt),iv=bytes(payload.iv);if(salt.length!==16||iv.length!==12)throw new Error();const key=await keyFor(passphrase,salt);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,bytes(payload.ciphertext)));}
 catch{throw new Error('Phrase secrète incorrecte ou sauvegarde endommagée.');}
}
export class ProgressConflict extends Error {constructor(){super('Un autre appareil a modifié la sauvegarde. Récupérez cette version avant de synchroniser.');}}
// Isolated session: a progress account must not replace unrelated quiz/circle sessions.
let client:SupabaseClient|undefined;
export const progressClient=()=>client??=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY,{auth:{storageKey:'qc-private-progress-auth',detectSessionInUrl:false}});
export async function loadCloudProgress(expectedOwner?:string){
 const db=progressClient();const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user||(expectedOwner&&user.id!==expectedOwner))throw new Error('Connectez-vous pour retrouver vos progrès.');
 const {data,error}=await db.from('qc_private_progress').select('revision,payload,updated_at').eq('user_id',user.id).maybeSingle();
 if(error)throw new Error('La synchronisation est indisponible. Vos progrès restent sur cet appareil.');
 return data as {revision:number;payload:EncryptedProgress;updated_at:string}|null;
}
export async function saveCloudProgress(payload:EncryptedProgress,expectedRevision:number,expectedOwner?:string){
 const db=progressClient();const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user||(expectedOwner&&user.id!==expectedOwner))throw new Error('Reconnectez-vous avant de sauvegarder.');
 const row={user_id:user.id,revision:expectedRevision+1,payload,updated_at:new Date().toISOString()};
 if(expectedRevision===0){const {error}=await db.from('qc_private_progress').insert(row);if(error?.code==='23505')throw new ProgressConflict();if(error)throw new Error('Envoi impossible. Réessayez une fois connecté.');}
 else{const {data,error}=await db.from('qc_private_progress').update(row).eq('user_id',user.id).eq('revision',expectedRevision).select('revision');if(error)throw new Error('Envoi impossible. Vos données locales sont conservées.');if(data?.length!==1)throw new ProgressConflict();}
 return row.revision;
}
