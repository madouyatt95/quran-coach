import {profileStorage} from './profileStorage';
export const BACKUP_HEALTH_EVENT='qc-backup-health';
export function readBackupHealth():{sync?:string;export?:string}{
 try{const data=JSON.parse(profileStorage.getItem('qc-backup-health-v1')||'{}');return Object.fromEntries(['sync','export'].filter(k=>typeof data?.[k]==='string'&&Number.isFinite(Date.parse(data[k]))).map(k=>[k,data[k]]));}catch{return {};}
}
export function recordBackupHealth(kind:'sync'|'export',date:string){
 if(!Number.isFinite(Date.parse(date)))return;
 try{profileStorage.setItem('qc-backup-health-v1',JSON.stringify({...readBackupHealth(),[kind]:date}));}catch{/* A full disk must not turn a successful backup into a failure. */}
 if(typeof window!=='undefined')window.dispatchEvent(new Event(BACKUP_HEALTH_EVENT));
}
