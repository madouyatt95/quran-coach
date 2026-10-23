import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useAudioStudioAccess } from '../../hooks/useAudioStudioAccess';
import { progressClient } from '../../lib/progressVault';
import { getProgressSync, lockProgressSync, subscribeProgressSync, syncProgress, unlockProgressSync, type SyncChoice } from '../../lib/progressSync';

export function ProgressSyncPanel(){
 const audioStudioAccess=useAudioStudioAccess();
 const sync=useSyncExternalStore(subscribeProgressSync,getProgressSync);
 const [email,setEmail]=useState(''),[code,setCode]=useState(''),[sent,setSent]=useState(false),[account,setAccount]=useState<string|null>(null);
 const [phrase,setPhrase]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retryAt,setRetryAt]=useState(0);
 const [choices,setChoices]=useState<Record<string,SyncChoice>>({});
 useEffect(()=>{let active=true;const db=progressClient();db.auth.getSession().then(({data})=>{if(active)setAccount(data.session?.user.email||null);});const {data}=db.auth.onAuthStateChange((_event,session)=>{if(active)setAccount(session?.user.email||null);if(!session)lockProgressSync();});return()=>{active=false;data.subscription.unsubscribe();};},[]);
 const run=async(action:()=>Promise<void>)=>{setBusy(true);setError('');try{await action();}catch(e){setError(e instanceof Error?e.message:'Opération impossible. Réessayez.');}finally{setBusy(false);}};
 return <div className="progress-sync"><h3>Retrouver mes progrès partout</h3>
 <p>Connectez vos appareils au même compte et utilisez la même phrase secrète pour votre sauvegarde.</p>
 {!account?<form onSubmit={e=>{e.preventDefault();void run(async()=>{if(Date.now()<retryAt)throw new Error('Patientez une minute avant de demander un nouveau code.');const {error}=await progressClient().auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:true}});if(error)throw new Error('Le code n’a pas pu être envoyé. Vérifiez votre adresse et réessayez dans une minute.');setSent(true);setRetryAt(Date.now()+60000);});}}>
 <label>Adresse email<input type="email" required autoComplete="email" value={email} onChange={e=>{setEmail(e.target.value);setSent(false);setCode('');}}/></label>
 <button disabled={busy} type="submit">{sent?'Renvoyer un code':'Recevoir mon code de connexion'}</button>
 {sent&&<><p>Consultez votre messagerie puis saisissez le code reçu ici.</p><label>Code de connexion<input inputMode="numeric" autoComplete="one-time-code" value={code} maxLength={10} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><button type="button" disabled={busy||code.length<6} onClick={()=>void run(async()=>{const {error}=await progressClient().auth.verifyOtp({email:email.trim(),token:code,type:'email'});if(error)throw new Error('Code incorrect ou expiré. Demandez un nouveau code.');setCode('');})}>Valider le code</button></>}
 </form>:<><p>Connecté : {account}</p>
 {audioStudioAccess&&<Link className="progress-sync-studio" to="/admin/audio?tab=review"><strong>Studio audio</strong><span>Écouter et valider mes narrations →</span></Link>}
 {sync.status==='locked'&&<form onSubmit={e=>{e.preventDefault();void run(async()=>{if(!consent)throw new Error('Confirmez l’activation de la synchronisation.');await unlockProgressSync(phrase);setPhrase('');});}}>
 <label>Phrase secrète de votre sauvegarde<input type="password" minLength={12} required autoComplete="off" value={phrase} onChange={e=>setPhrase(e.target.value)}/></label>
 <p>Première utilisation : choisissez au moins 12 caractères et conservez cette phrase. Sur vos autres appareils, saisissez exactement la même. Elle ne sera pas envoyée au serveur. Sans elle, une sauvegarde chiffrée ne peut pas être récupérée.</p>
 <label className="progress-sync-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>J’active l’envoi chiffré de mes progrès, signets, favoris et notes personnelles vers mon espace privé Quran Coach.</label>
 <button disabled={busy} type="submit">Déverrouiller et synchroniser</button></form>}
 <p role="status">{sync.message}</p>{sync.lastSync&&<small>Dernière synchronisation : {new Date(sync.lastSync).toLocaleString('fr-FR')}</small>}
 {sync.status==='conflict'&&<div className="backup-preview"><h4>Choisir les versions à conserver</h4><p>Aucune de ces différences n’est remplacée automatiquement. La version reçue et l’état local sont conservés avant toute modification locale.</p>{sync.conflicts.map(c=><label key={c.key}>{c.label}<select value={choices[c.key]||''} onChange={e=>setChoices(v=>({...v,[c.key]:e.target.value as SyncChoice}))}><option value="" disabled>Choisir une version</option><option value="device">Cet appareil</option><option value="cloud">Autre appareil</option></select></label>)}<button disabled={busy||sync.conflicts.some(c=>!choices[c.key])} onClick={()=>void syncProgress(choices)}>Appliquer mes choix</button></div>}
 {sync.status!=='locked'&&<><p className="backup-private">Synchronisation toutes les 30 secondes lorsque l’app est visible, et au retour du réseau. Après fermeture ou rechargement, déverrouillez à nouveau dans les réglages. Aucun transfert en arrière-plan n’est garanti lorsque iOS suspend l’app.</p><div className="backup-actions"><button disabled={busy||sync.status==='working'||sync.status==='conflict'} onClick={()=>void syncProgress()}>Synchroniser maintenant</button><button onClick={lockProgressSync}>Verrouiller</button></div></>}
 <button disabled={busy} onClick={()=>void run(async()=>{lockProgressSync();const {error}=await progressClient().auth.signOut({scope:'local'});if(error)throw new Error('Déconnexion impossible. Réessayez.');})}>Déconnecter cet appareil</button>
 </>}{error&&<p role="alert" className="backup-error">{error}</p>}
 </div>;
}
