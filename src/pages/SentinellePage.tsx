import {ReminderOptions} from '../components/Home/ReminderOptions';
import type {CompanionCard as ReminderCard} from '../lib/companion';
import {ReminderPreferences} from '../components/Companion/ReminderPreferences';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSmartStore } from '../stores/smartStore';
import { useInvisibleCoachStore } from '../stores/invisibleCoachStore';
import { useCompanionStore } from '../stores/companionStore';
import { useHifdhJourneyStore } from '../stores/hifdhJourneyStore';
import { useSmartCoaching } from '../hooks/useSmartCoaching';
import { CompanionCard } from '../components/Companion/CompanionCard';
import { NeedJourney } from '../components/Companion/NeedJourney';
import { PACE, type CompanionPace } from '../lib/companion';
import '../components/Companion/Companion.css';
function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:()=>void}){return <label className="companion-toggle"><span>{label}</span><input type="checkbox" role="switch" checked={checked} onChange={onChange}/></label>;}
export function SentinellePage(){
    const [params,setParams]=useSearchParams();
    const space=params.get('space')==='sentinel'?'sentinel':'coach';
    const setSpace=(value:'coach'|'sentinel')=>setParams(previous=>{const next=new URLSearchParams(previous);next.set('space',value);return next;},{replace:true});
    const [selected,setSelected]=useState<ReminderCard|null>(null);
    const [notice,setNotice]=useState<{message:string;undo:()=>void}|null>(null);
    const [view,setView]=useState<'now'|'next'|'done'|'saved'>('now');
    const smart=useSmartStore(),coach=useInvisibleCoachStore(),c=useCompanionStore(),attempts=useHifdhJourneyStore(s=>s.attempts);
    const {cards,upcoming,completed,now}=useSmartCoaching();
    const list=(view==='now'?cards:view==='next'?upcoming:view==='done'?completed:c.saved).filter(card=>card.origin===space);
    const visibleReminderIds=JSON.stringify(space==='sentinel' && view==='now'?list.map(card=>card.id):[]);
    const markSeen=c.markRemindersSeen;
    useEffect(()=>{markSeen(JSON.parse(visibleReminderIds) as string[]);},[visibleReminderIds,markSeen]);
    const week=now-7*86400000;
    const pages=new Set(c.evidence.filter(e=>e.at>=week).map(e=>`${e.day}:${e.page}`)).size;
    const reviews=attempts.filter(a=>Date.parse(a.at)>=week && a.outcome!=='uncertain' && a.scope!=='phrase').length;
    return <div className="companion-page">
        <header className="companion-header"><Link to="/" aria-label="Retour à l’accueil">←</Link><span>VOTRE COMPAGNON</span><span className="companion-header__spacer" aria-hidden="true"/></header>
        <section className="companion-hero"><span className="companion-orb" aria-hidden="true">🌿</span><h1>Un moment pour vous.</h1><p>Le bon passage, le bon rappel, à votre rythme.</p></section>
        <nav className="companion-tabs" aria-label="Votre accompagnement"><button aria-pressed={space==='coach'} onClick={()=>setSpace('coach')}>🧠 Mon coach</button><button aria-pressed={space==='sentinel'} onClick={()=>setSpace('sentinel')}>🌙 Mes rappels</button></nav>
        <div className="companion-section"><Toggle label={space==='coach'?'Activer le coach invisible':'Activer la sentinelle spirituelle'} checked={space==='coach'?coach.enabled:smart.globalEnabled} onChange={()=>space==='coach'?coach.setEnabled(!coach.enabled):smart.setGlobalEnabled(!smart.globalEnabled)}/></div>
        {space==='sentinel'&&<ReminderPreferences now={now}/>}
        <nav className="companion-filters" aria-label="État des moments">{(['now','next','done','saved'] as const).map((v,i)=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{['Maintenant','À venir','Accompli','Enregistré'][i]}</button>)}</nav>
        <section className="companion-feed" aria-label="Vos moments">{list.length?list.map((card,i)=><div key={card.id}>{i===0 && view==='now' && <p className="companion-kicker">VOTRE PROCHAINE ACTION</p>}<CompanionCard card={card} completed={!!c.done[card.id]} upcoming={view==='next'}/>{space==='sentinel'&&!c.done[card.id]&&<button className="companion-secondary" onClick={()=>setSelected(card)}>⋯ Garder ou adapter ce rappel</button>}</div>):<div className="companion-empty"><span aria-hidden="true">☁️</span><h2>{view==='done'?'Chaque moment compte':'Tout est calme pour le moment'}</h2><p>{view==='done'?'Vos moments accomplis apparaîtront ici.':view==='saved'?'Enregistrez une carte avec son étoile pour la retrouver.':view==='next'?'Les prochains rappels horaires apparaîtront selon votre ville et vos préférences.':'Prenez ce temps pour vous. Vos prochains rappels apparaîtront ici.'}</p></div>}</section>
        {space==='coach' && <><NeedJourney/><section className="companion-section"><h2>Votre rythme</h2><div className="companion-pace">{(Object.keys(PACE) as CompanionPace[]).map(key=><button key={key} aria-pressed={c.pace===key} onClick={()=>c.setPace(key)}><strong>{PACE[key].label}</strong><small>{PACE[key].description}</small></button>)}</div><p className="companion-muted">Les conseils attendent une pause. Aucun message pendant une récitation ou un exercice.</p><button className="companion-secondary" onClick={()=>coach.snooze(60)}>Pause des interventions · 1 h</button>{coach.suppressedUntil && coach.suppressedUntil>now && <p role="status">Interventions en pause jusqu’à {new Date(coach.suppressedUntil).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}.</p>}</section>
        <section className="companion-section"><h2>Vos 7 derniers jours</h2><div className="companion-facts"><div><strong>{pages}</strong><span>consultations de pages</span></div><div><strong>{reviews}</strong><span>essais de mémorisation évalués</span></div></div><details><summary>Comprendre mon suivi</summary><p>Une page compte une fois par jour après consultation. Les essais de mémorisation peuvent être accompagnés ; ils ne valident pas à eux seuls la maîtrise d’un passage.</p></details></section></>}
        <details className="companion-settings"><summary>Personnaliser {space==='coach'?'mon coach':'mes rappels'}</summary>
            {space==='sentinel'?<>
                <Toggle label="🌧️ Météo de ma ville" checked={smart.weatherEnabled} onChange={()=>smart.setWeatherEnabled(!smart.weatherEnabled)}/>
                <Toggle label="🌕 Jours blancs" checked={smart.whiteDaysEnabled} onChange={()=>smart.setWhiteDaysEnabled(!smart.whiteDaysEnabled)}/>
                <Toggle label="🌅 Moment du matin" checked={smart.fajrBoosterEnabled} onChange={()=>smart.setFajrBoosterEnabled(!smart.fajrBoosterEnabled)}/>
                <Toggle label="🏔️ Al-Kahf le vendredi" checked={smart.alKahfEnabled} onChange={()=>smart.setAlKahfEnabled(!smart.alKahfEnabled)}/>
                <Toggle label="📞 Liens de parenté" checked={smart.kinshipEnabled} onChange={()=>smart.setKinshipEnabled(!smart.kinshipEnabled)}/>
                <Toggle label="📜 Repères du calendrier" checked={smart.historyEnabled} onChange={()=>smart.setHistoryEnabled(!smart.historyEnabled)}/>
                <Toggle label="🌌 Dernier tiers de la nuit" checked={smart.saharEnabled} onChange={()=>smart.setSaharEnabled(!smart.saharEnabled)}/>
                <Toggle label="🧳 Rappels de voyage" checked={smart.travelEnabled} onChange={()=>smart.setTravelEnabled(!smart.travelEnabled)}/>
                {smart.travelEnabled && <Toggle label="Je suis en voyage" checked={c.travel} onChange={()=>c.setTravel(!c.travel)}/>}
                <p>Le mode voyage est choisi par vous. La météo utilise la ville configurée dans les horaires de prière, sans suivi de déplacement.</p><Link to="/prayers" state={{openLocation:true}}>Configurer ma ville →</Link>
            </>:<>{[['verse_emotion','💭 Réflexions sur les versets'],['hadith_link','🔗 Liens avec les textes'],['surah_complete','🎉 Parcours de sourate accompli'],['milestone','🌟 Étapes de consultation'],['comeback','🌱 Reprise après une absence'],['page_reread','🧠 Passages souvent consultés'],['quiz_weak','📚 Révision après un quiz'],['long_reading','🌿 Pause après une lecture active'],['fahm_push','📖 Compréhension du passage']].map(([key,label])=><Toggle key={key} label={label} checked={coach.enabledTriggers[key]!==false} onChange={()=>coach.setTriggerEnabled(key,coach.enabledTriggers[key]===false)}/>)}</>}
            {c.muted.length>0 && <div><h3>Types de conseils masqués</h3>{c.muted.map(topic=><button className="companion-secondary" key={topic} onClick={()=>c.unmute(topic)}>Réactiver · {topic}</button>)}</div>}
        </details>
        {notice&&<div className="companion-section" role="status">{notice.message} <button className="companion-secondary" onClick={()=>{notice.undo();setNotice(null);}}>Annuler</button></div>}
        {selected&&<ReminderOptions card={selected} onClose={()=>setSelected(null)} onAction={(message,undo)=>setNotice({message,undo})}/>}
        <footer className="companion-footer"><Link to="/settings">Gérer mes notifications →</Link><details><summary>À propos de mon accompagnement</summary><p>Votre progression est enregistrée sur cet appareil. Les rappels apparaissent dans l’application. Les conseils vous accompagnent dans votre pratique ; les références à confirmer restent signalées.</p></details></footer>
    </div>;
}
