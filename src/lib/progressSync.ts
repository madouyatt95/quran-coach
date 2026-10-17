import { BACKUP_LABELS, RECOVERY_KEY, backupRegistry, createBackup, parseBackup, type BackupStore, type ProgressBackup, type BackupSection } from './progressBackup';
import { decryptProgress, encryptProgress, loadCloudProgress, progressClient, saveCloudProgress } from './progressVault';

export type SyncChoice = 'device' | 'cloud';
export interface SyncConflict { key: string; label: string }
const same = (a: unknown, b: unknown): boolean => {
 if (a === b) return true;
 if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
 if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x,i)=>same(x,b[i]));
 const x=a as Record<string,unknown>,y=b as Record<string,unknown>;
 return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(k=>Object.hasOwn(y,k)&&same(x[k],y[k]));
};
export function planProgressSync(base:ProgressBackup|null,device:ProgressBackup,cloud:ProgressBackup,choices:Record<string,SyncChoice>={}) {
 const sections:Record<string,BackupSection>={}, conflicts:SyncConflict[]=[];
 for(const key of new Set([...Object.keys(base?.sections||{}),...Object.keys(device.sections),...Object.keys(cloud.sections)])) {
  const a=device.sections[key],b=cloud.sections[key],old=base?.sections[key];
  let selected:BackupSection|undefined;
  if(same(a,b)) selected=a;
  else if(base && same(a,old)) selected=b;
  else if(base && same(b,old)) selected=a;
  else if(!base && !a) selected=b;
  else if(!base && !b) selected=a;
  else if(choices[key]) selected=choices[key]==='device'?a:b;
  else {conflicts.push({key,label:BACKUP_LABELS[key]||key});continue;}
  if(selected) sections[key]=selected;
 }
 return {backup:{...device,sections},conflicts};
}
/** Exact replacement is essential: union-based imports would resurrect deleted notes/signets. */
export async function applySyncedProgress(next:ProgressBackup,stores:BackupStore[],storage:Storage=localStorage,received:ProgressBackup=next) {
 const valid=parseBackup(JSON.stringify(next),stores,true),current=createBackup(stores,storage);
 const keys=stores.map(s=>s.key).filter(k=>!same(current.sections[k],valid.sections[k]));
 if(!keys.length)return;
 const before=Object.fromEntries(keys.map(k=>[k,storage.getItem(k)]));
 storage.setItem(RECOVERY_KEY,JSON.stringify({before,received,createdAt:new Date().toISOString()}));
 const hydrate=async()=>{for(const store of stores.filter(s=>keys.includes(s.key))){if(storage.getItem(store.key)===null){store.reset?.();storage.removeItem(store.key);}else await store.rehydrate();}};
 try {for(const key of keys) {const value=valid.sections[key];if(value)storage.setItem(key,JSON.stringify(value));else storage.removeItem(key);}await hydrate();}
 catch(error) {for(const [key,value] of Object.entries(before))value===null?storage.removeItem(key):storage.setItem(key,value);await hydrate();throw error;}
}
export interface SyncState {status:'locked'|'working'|'ready'|'offline'|'conflict'|'error'; message:string; lastSync:string|null; conflicts:SyncConflict[]}
let state:SyncState={status:'locked',message:'Déverrouillez la synchronisation sur cet appareil.',lastSync:null,conflicts:[]};
const listeners=new Set<()=>void>();
export const subscribeProgressSync=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export const getProgressSync=()=>state;
const update=(next:Partial<SyncState>)=>{state={...state,...next};listeners.forEach(fn=>fn());};
let phrase='',owner='',base:ProgressBackup|null=null,stores:BackupStore[]=[],busy=false,generation=0;
let pending:{device:ProgressBackup;cloud:ProgressBackup;revision:number}|null=null;
let timer:ReturnType<typeof setInterval>|undefined;
const wake=()=>{if(document.visibilityState!=='hidden')void syncProgress();};
export function lockProgressSync(){
 generation++;phrase='';owner='';base=null;pending=null;
 if(timer)clearInterval(timer);timer=undefined;
 window.removeEventListener('online',wake);document.removeEventListener('visibilitychange',wake);
 update({status:'locked',message:'Synchronisation verrouillée. Vos progrès restent disponibles ici.',conflicts:[]});
}
export async function unlockProgressSync(passphrase:string){
 if(passphrase.length<12)throw new Error('Utilisez une phrase secrète d’au moins 12 caractères.');
 if(busy)throw new Error('Patientez pendant la synchronisation en cours.');
 lockProgressSync();
 const epoch=generation;
 const {data:{user},error}=await progressClient().auth.getUser();
 if(error||!user)throw new Error('Connectez-vous pour synchroniser.');
 const registry=await backupRegistry();if(epoch!==generation)return;
 owner=user.id;phrase=passphrase;stores=registry;
 await syncProgress();
 if(epoch!==generation)return;
 if(state.status==='error'){const message=state.message;lockProgressSync();throw new Error(message);}
 timer=setInterval(wake,30000);window.addEventListener('online',wake);document.addEventListener('visibilitychange',wake);
}
export async function syncProgress(choices?:Record<string,SyncChoice>){
 if(!phrase||busy)return;
 if(state.status==='conflict'&&!choices)return;
 if(!navigator.onLine){update({status:'offline',message:'Hors connexion : vos progrès seront synchronisés au retour du réseau.'});return;}
 busy=true;const epoch=generation,secret=phrase;
 update({status:'working',message:'Synchronisation…'});
 try {
  const {data:{user},error}=await progressClient().auth.getUser();
  if(epoch!==generation)return;
  if(error||user?.id!==owner){lockProgressSync();throw new Error('Reconnectez-vous pour reprendre la synchronisation.');}
  const remote=await loadCloudProgress(owner);if(epoch!==generation)return;
  const device=createBackup(stores);
  const cloud=remote?parseBackup(await decryptProgress(remote.payload,secret),stores,true):{...device,sections:{}};
  if(epoch!==generation)return;
  // A decision is valid only for the exact pair displayed to the user.
  if(choices&&(!pending||pending.revision!==(remote?.revision||0)||!same(pending.device.sections,device.sections))){choices=undefined;}
  const plan=planProgressSync(base,device,cloud,choices);
  if(plan.conflicts.length){pending={device,cloud,revision:remote?.revision||0};update({status:'conflict',message:'Deux appareils ont modifié les mêmes rubriques. Choisissez les versions à conserver.',conflicts:plan.conflicts});return;}
  const payload=(!remote||!same(plan.backup.sections,cloud.sections))?await encryptProgress(plan.backup,secret):null;
  if(epoch!==generation)return;
  // Never replace activity performed while the network/encryption work was in flight.
  if(!same(createBackup(stores).sections,device.sections)){update({status:'ready',message:'De nouveaux progrès sont en cours. Synchronisation au prochain passage.'});return;}
  if(payload){
   const before=Object.fromEntries(stores.map(s=>[s.key,localStorage.getItem(s.key)]));
   localStorage.setItem(RECOVERY_KEY,JSON.stringify({before,received:cloud,createdAt:new Date().toISOString()}));
   await saveCloudProgress(payload,remote?.revision||0,owner);
  }
  if(epoch!==generation)return;
  if(!same(createBackup(stores).sections,device.sections)){update({status:'ready',message:'Vos nouveaux progrès sont conservés. Une autre synchronisation va suivre.'});return;}
  await applySyncedProgress(plan.backup,stores,localStorage,cloud);
  if(epoch!==generation)return;
  base=createBackup(stores);pending=null;
  update({status:'ready',message:'Vos progrès sont à jour sur cet appareil.',lastSync:new Date().toISOString(),conflicts:[]});
 }catch(error){if(epoch===generation)update({status:navigator.onLine?'error':'offline',message:error instanceof Error?error.message:'Synchronisation impossible. Vos progrès locaux sont conservés.'});}
 finally{busy=false;}
}
export function syncAvailable(){return import.meta.env.VITE_PROGRESS_SYNC_ENABLED==='true';}
