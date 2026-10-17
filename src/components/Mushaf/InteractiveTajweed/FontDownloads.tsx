import { useEffect, useMemo, useState } from 'react';
import { Download, Pause, Trash2 } from 'lucide-react';
import { useDownloadStore } from '../../../stores/downloadStore';
import { detectFontRenderMode, FONT_PACK_ID, fontPackUrls } from '../../../lib/interactiveMushaf/fontResources';

export function FontDownloads() {
    const mode = detectFontRenderMode();
    const svg = mode === 'svg';
    const id = `${FONT_PACK_ID}-${mode==='svg'?'svg':'colr'}`;
    const urls = useMemo(()=>fontPackUrls(svg),[svg]);
    const task = useDownloadStore(s=>s.tasks[id]);
    const [removing,setRemoving]=useState(false),[error,setError]=useState('');
    useEffect(()=>{if(mode!=='unicode')void useDownloadStore.getState().verifyCacheStatus(id,urls[0]);},[id,mode,urls]);
    const busy = task?.status==='downloading';
    const done = task?.status==='completed';
    if(mode==='unicode') return <div className="iq-font-download"><strong>Polices hors ligne</strong><p>Ce navigateur ne prend pas en charge les formats de polices couleur de cette édition. Le texte arabe reste lisible et interactif ; les couleurs Tajwid nécessitent un navigateur compatible.</p></div>;
    return <details className="iq-font-download">
        <summary>Polices hors ligne {done?"· téléchargées":busy?`· ${task.progress} %`:""}</summary>
        <p>Conservez la calligraphie des 604 pages et ses trois couleurs de papier sur cet appareil.</p>
        <p className="iq-gestures-help">Ce téléchargement contient les polices uniquement. Le texte des pages et les audios nécessitent encore une connexion.</p>
        {task&&<><progress aria-label="Téléchargement des polices" max={100} value={task.progress}/><p role="status">{done?'Polices téléchargées':busy?'Téléchargement en cours':task.status==='error'?'Téléchargement interrompu':'Téléchargement en pause'} · {task.progress} %{task.bytes?` · ${(task.bytes/1048576).toFixed(1)} Mo`:''}</p></>}
        <div className="iq-detail-actions">
            {busy?<button onClick={()=>useDownloadStore.getState().pauseDownload(id)}><Pause size={18}/>Mettre en pause</button>:!done&&<button disabled={removing} onClick={()=>{setError('');void useDownloadStore.getState().startDownload(id,'Calligraphie du Mushaf Tajwid',urls,'font');}}><Download size={18}/>{task?'Reprendre le téléchargement':'Télécharger les polices'}</button>}
            {task&&!busy&&<button disabled={removing} onClick={async()=>{setRemoving(true);setError('');try {await useDownloadStore.getState().removeDownload(id,urls);}catch{setError('Impossible de libérer le stockage. Réessayez.');}finally{setRemoving(false);}}}><Trash2 size={18}/>Libérer le stockage</button>}
        </div>
        {(error||task?.status==='error')&&<p role="alert">{error||task?.error}</p>}
        <small>Polices fournies par <a href="https://quran.foundation" target="_blank" rel="noreferrer">Quran Foundation</a>.</small>
    </details>;
}
