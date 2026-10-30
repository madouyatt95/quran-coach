import {Flag,X} from 'lucide-react';
import {useReadingSession} from './readingSession';
export function ReadingSessionChoices({page,surah,onClose}:{page:number;surah:number;onClose:()=>void}){
    const {session,start,clear}=useReadingSession();
    return <div className="iq-session-choices"><p>Choisissez votre point d’arrivée. Votre séance reste disponible à la prochaine ouverture.</p><button className="iq-primary" onClick={()=>{start(page,'pages',surah);onClose();}}>Lire {Math.min(5,605-page)} pages</button><button onClick={()=>{start(page,'surah',surah);onClose();}}>Jusqu’à la fin de cette sourate</button>{session&&<button onClick={()=>{clear();onClose();}}>Retirer l’objectif actuel</button>}<small>La fin de séance se confirme à votre rythme. Le suivi du Khatm reste indépendant.</small></div>;
}
export function ReadingSessionBar({page,facingPage,onOpen,onGo}:{page:number;facingPage?:number;onOpen:()=>void;onGo:(page:number)=>void}){
    const {session,finish,clear}=useReadingSession();
    if(!session)return null;
    const atEnd=page===session.end||facingPage===session.end;
    return <section className="iq-session-bar" aria-label="Séance de lecture">
        <Flag size={13}/>{session.finishedAt?<><span role="status">Séance terminée · {session.label} · p. {session.start}–{session.end}</span><button aria-label="Fermer le bilan de lecture" onClick={clear}><X size={15}/></button></>:<><button onClick={onOpen}>{session.label} · arrivée p. {session.end}</button>{atEnd?<button onClick={finish}>J’ai terminé</button>:page<session.start||page>session.end?<button onClick={()=>onGo(session.start)}>Revenir</button>:<small>{session.end-Math.max(page,facingPage??page)} p. jusqu’à l’arrivée</small>}</>}
    </section>;
}
