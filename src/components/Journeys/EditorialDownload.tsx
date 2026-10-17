import {useEffect,useState} from 'react';
import {useDownloadStore} from '../../stores/downloadStore';
import {editorialPackUrls} from '../../lib/editorialOffline';
import {narrationKey} from '../../lib/narrationText';
import type {EditorialJourney} from '../../lib/editorialJourneys';
export function EditorialDownload({journey}:{journey:EditorialJourney}){
 const [pack,setPack]=useState<{id:string;urls:string[]}|null>(null),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const task=useDownloadStore(s=>pack?s.tasks[pack.id]:undefined);
 useEffect(()=>{let cancelled=false;void editorialPackUrls(journey).then(urls=>{if(cancelled)return;const id=`editorial-${journey.id}-${narrationKey(urls.join('|'))}`;setPack({id,urls});void useDownloadStore.getState().verifyCacheStatus(id,'');}).catch(()=>{if(!cancelled)setError('La préparation du téléchargement a échoué. Réessayez.');});return()=>{cancelled=true;};},[journey,retry]);
 const download=async()=>{if(!pack)return;setBusy(true);setError('');try{await useDownloadStore.getState().startDownload(pack.id,journey.title,pack.urls,'journey');}catch(e){setError(e instanceof Error?e.message:'Téléchargement indisponible.');}finally{setBusy(false);}};
 return <details className="journey-extra-options"><summary>📥 Emporter ce récit</summary><p>Narration française, récitations et traduction des versets du parcours, sur cet appareil.</p>{task&&<p role="status">{task.status==='completed'?'✓ Disponible hors ligne':`${task.progress} % · ${task.error||'Téléchargement en cours…'}`}{task.bytes?` · ${(task.bytes/1048576).toFixed(1)} Mo`:''}</p>}{task?.status==='downloading'?<button onClick={()=>useDownloadStore.getState().pauseDownload(task.id)}>Mettre en pause</button>:task?.status==='completed'?<button onClick={()=>void useDownloadStore.getState().removeDownload(task.id,task.urls)}>Supprimer ce téléchargement</button>:<button disabled={busy||!pack} onClick={()=>void download()}>{busy||!pack?'Préparation…':task?'Reprendre le téléchargement':'Télécharger le récit complet'}</button>}{error&&<p role="alert">{error} <button onClick={()=>{setError('');setRetry(n=>n+1);}}>Réessayer</button></p>}</details>;
}
