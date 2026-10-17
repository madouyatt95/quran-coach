import { prepareReaderCoachTask } from '../../lib/readerCoach';
import { Link } from 'react-router-dom';
import { useCompanionStore } from '../../stores/companionStore';
import { useQuranStore } from '../../stores/quranStore';
import { useKhatmStore } from '../../stores/khatmStore';
import { useReadingBookmarkStore, resumeReadingBookmark } from '../../stores/readingBookmarkStore';
import type { CompanionCard as Card } from '../../lib/companion';
import './Companion.css';
export function CompanionCard({card,completed=false,upcoming=false,compact=false}:{card:Card;completed?:boolean;upcoming?:boolean;compact?:boolean}) {
    const c=useCompanionStore();
    const saved=c.saved.some(v=>v.id===card.id);
    const reviewTarget=card.origin==='coach'&&card.topic==='review'?new URLSearchParams(card.route.split('?')[1]):null;
    const route=reviewTarget?`/read?surah=${reviewTarget.get('surah')}&ayah=${reviewTarget.get('ayah')}&coach=practice`:card.route;
    const open=()=>{
        if(reviewTarget)prepareReaderCoachTask('practice',Number(reviewTarget.get('surah')),Number(reviewTarget.get('ayah')));
        if(card.topic==='khatm'){const k=useKhatmStore.getState();useQuranStore.getState().goToAyah(k.lastKhatmSurah,k.lastKhatmAyah,k.lastKhatmPage,{silent:true,khatm:true});}
        if(['reading','comeback'].includes(card.topic)){const b=useReadingBookmarkStore.getState().bookmark;if(b)resumeReadingBookmark(b);}
    };
    return <article className={`companion-card ${compact?'companion-card--compact':''}`}>
        <div className="companion-card__eyebrow"><span aria-hidden="true">{card.emoji}</span><span>{card.origin==='coach'?'Mon coach':'Mes rappels'} · {card.minutes} min</span><button className="companion-icon" aria-label={saved?'Retirer des rappels enregistrés':'Enregistrer ce rappel'} aria-pressed={saved} onClick={()=>c.save(card)}>{saved?'★':'☆'}</button></div>
        <h3>{card.title}</h3><p>{card.message}</p>
        {card.arabic && <p className="companion-arabic" lang="ar" dir="rtl">{card.arabic}</p>}
        {card.progress!==undefined && <div><progress value={card.progress} max={100} aria-label={card.title}/><small>{card.progress} % · {card.topic==='al-kahf'?'consultation du texte':'pages validées'}</small></div>}
        {upcoming && card.startsAt && <p>À partir de {new Date(card.startsAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p>}
        <div className="companion-card__actions"><Link className="companion-primary" to={route} state={card.topic==='location'?{openLocation:true}:undefined} onClick={open}>{card.action} <span aria-hidden="true">→</span></Link>{completed?<button onClick={()=>c.undo(card.id)}>Annuler « accompli »</button>:!upcoming && <button onClick={()=>c.complete(card.id,card)}>Déjà fait ✓</button>}</div>
        <details className="companion-details"><summary>Pourquoi ce conseil ?</summary><p>{card.reason}</p><p><strong>{card.kind}</strong>{card.source && <> · {card.sourceUrl?<a href={card.sourceUrl} target="_blank" rel="noopener noreferrer">{card.source}</a>:card.source}</>}{card.referencePending && <span> · À confirmer</span>}</p><p>« Déjà fait » est votre déclaration. Ouvrir une carte ne la valide pas.</p>{!completed && <div className="companion-card__actions"><button onClick={()=>c.snooze(card.id)}>Plus tard · 30 min</button><button onClick={()=>c.mute(card.topic)}>Moins de ce type</button></div>}</details>
    </article>;
}
