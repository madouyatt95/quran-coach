/** A profile is a local learning space, not a separate online identity. */
export interface LocalProfile { id:string; name:string; kind:'adult'|'child'; level:'beginner'|'reader'|'advanced'; createdAt:number }
export const PROFILE_LIST='qc-household-profiles-v1', PROFILE_ACTIVE='qc-household-active-v1';
export const DEFAULT_PROFILE:LocalProfile={id:'default',name:'Mon espace',kind:'adult',level:'reader',createdAt:0};
export function readProfiles(storage:Storage=localStorage):LocalProfile[]{
 try {const value=JSON.parse(storage.getItem(PROFILE_LIST)||'[]');return [DEFAULT_PROFILE,...(Array.isArray(value)?value:[]).filter((p:LocalProfile)=>p&&/^[a-z0-9-]{1,50}$/.test(p.id)&&p.id!=='default'&&typeof p.name==='string'&&['adult','child'].includes(p.kind)&&['beginner','reader','advanced'].includes(p.level))];}catch{return [DEFAULT_PROFILE];}
}
export function readActiveProfile(storage:Storage=localStorage){try{return readProfiles(storage).find(p=>p.id===storage.getItem(PROFILE_ACTIVE))||DEFAULT_PROFILE;}catch{return DEFAULT_PROFILE;}}
// Frozen until reload: an old player/page can never write into the newly selected profile.
export const activeProfile=typeof localStorage==='undefined'?DEFAULT_PROFILE:readActiveProfile();
const shared=new Set(['quran-coach-downloads-v1','quran-coach-assets']);
export function profileKey(key:string,id=activeProfile.id){return id==='default'||shared.has(key)?key:`qc-profile:${id}:${key}`;}
function storageKeys(storage:Storage){return Array.from({length:storage.length},(_,i)=>storage.key(i)).filter((k):k is string=>k!==null);}
export function scopedStorage(storage:Storage,id:string):Storage{return {
 get length(){return storageKeys(storage).filter(k=>id==='default'?!k.startsWith('qc-profile:'):k.startsWith(`qc-profile:${id}:`)).length;},
 getItem:key=>storage.getItem(profileKey(key,id)),setItem:(key,value)=>storage.setItem(profileKey(key,id),value),removeItem:key=>storage.removeItem(profileKey(key,id)),
 key:index=>storageKeys(storage).filter(k=>id==='default'?!k.startsWith('qc-profile:'):k.startsWith(`qc-profile:${id}:`))[index]?.replace(id==='default'?'':`qc-profile:${id}:`,'')||null,
 clear:()=>{throw new Error('Effacement global interdit.');}
};}
export const profileStorage:Storage={
 get length(){return scopedStorage(localStorage,activeProfile.id).length;},getItem:key=>scopedStorage(localStorage,activeProfile.id).getItem(key),setItem:(key,value)=>scopedStorage(localStorage,activeProfile.id).setItem(key,value),removeItem:key=>scopedStorage(localStorage,activeProfile.id).removeItem(key),key:index=>scopedStorage(localStorage,activeProfile.id).key(index),clear:()=>{throw new Error('Effacement global interdit.');}
};
export function createLocalProfile(name:string,kind:LocalProfile['kind'],level:LocalProfile['level'],storage:Storage=localStorage){
 const profiles=readProfiles(storage);if(profiles.length>=8)throw new Error('Vous pouvez créer jusqu’à huit espaces.');
 if(!name.trim())throw new Error('Indiquez un prénom ou un pseudonyme.');
 const profile={id:crypto.randomUUID(),name:name.trim().slice(0,40),kind,level,createdAt:Date.now()};
 storage.setItem(PROFILE_LIST,JSON.stringify([...profiles.filter(p=>p.id!=='default'),profile]));return profile;
}
