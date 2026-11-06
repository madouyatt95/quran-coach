import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Capacitor} from '@capacitor/core';
import {BACKUP_HEALTH_EVENT,readBackupHealth} from '../../lib/backupHealth';
import {loadAudioLibrary,downloadedAudioIds} from '../../lib/audioLibrary';
import './AppHealth.css';
const date=(value?:string)=>value?new Date(value).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'}):'Aucune confirmation enregistrée';
export function AppHealth(){
 const [backup,setBackup]=useState(readBackupHealth),[online,setOnline]=useState(navigator.onLine),[status,setStatus]=useState('Vérification à la demande'),[offline,setOffline]=useState('Non vérifié'),[busy,setBusy]=useState(false);
 useEffect(()=>{const update=()=>{setBackup(readBackupHealth());setOnline(navigator.onLine);};window.addEventListener(BACKUP_HEALTH_EVENT,update);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener(BACKUP_HEALTH_EVENT,update);window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 const check=async()=>{
  setBusy(true);setStatus('Vérification…');setOffline('Vérification…');
  await Promise.allSettled([
   (async()=>{try{
    const native=Capacitor.isNativePlatform();
    if(native){setStatus('Le contenu iOS se met à jour depuis l’App Store.');return;}
    const response=await fetch(`/version.json?t=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error();const release=await response.json();if(typeof release.builtAt!=='string'||!Number.isFinite(Date.parse(release.builtAt)))throw new Error();
    const newer=Date.parse(release.builtAt)>Date.parse(__QC_RELEASE__.builtAt);
    setStatus(newer?'Une version plus récente est disponible. Elle sera appliquée lorsque votre écoute ou séance sera terminée.':'Vous utilisez la dernière version du contenu.');
    if('serviceWorker' in navigator)await (await navigator.serviceWorker.getRegistration())?.update();
   }catch{setStatus('Version en ligne non vérifiable. Votre contenu actuel reste accessible.');}})(),
   (async()=>{try{const ids=await downloadedAudioIds(await loadAudioLibrary());setOffline(`${ids.length} fichier${ids.length>1?'s':''} de livres audio présent${ids.length>1?'s':''} sur cet appareil`);}catch{setOffline('Vérification indisponible. Consultez vos téléchargements.');}})()
  ]);setBusy(false);
 };
 return <section className="settings-section app-health" id="app-health"><h2 className="settings-section__title">État de l’application</h2><dl><div><dt>Contenu installé</dt><dd>{__QC_RELEASE__.id} · {date(__QC_RELEASE__.builtAt)}</dd></div><div><dt>Connexion</dt><dd>{online?'Connexion détectée':'Hors ligne'}</dd></div><div><dt>Dernière synchronisation réussie</dt><dd>{date(backup.sync)}</dd></div>{backup.export&&<div><dt>Dernier fichier de sauvegarde préparé</dt><dd>{date(backup.export)}<small>Vérifiez qu’il est bien enregistré dans vos fichiers.</small></dd></div>}<div><dt>Livres audio hors ligne</dt><dd>{offline}</dd></div></dl><p role="status">{status}</p><div className="app-health-actions"><button disabled={busy} onClick={()=>void check()}>{busy?'Vérification…':'Vérifier maintenant'}</button><Link to="/settings#backup">Mes sauvegardes</Link><Link to="/storage">Mes téléchargements</Link></div></section>;
}
