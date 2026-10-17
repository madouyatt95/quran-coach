import {useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {selectHomeReminders} from '../../lib/reminderExperience';
import {ReminderOptions} from './ReminderOptions';
import type {CompanionCard} from '../../lib/companion';
import { Link } from 'react-router-dom';
import type { useSmartCoaching } from '../../hooks/useSmartCoaching';
import { useSmartStore } from '../../stores/smartStore';
import { usePrayerStore } from '../../stores/prayerStore';
import { useCompanionStore } from '../../stores/companionStore';
import './SmartSentinel.css';

type Feed = Pick<ReturnType<typeof useSmartCoaching>, 'cards' | 'upcoming' | 'now'>;
const remindersRoute = '/sentinel?space=sentinel';

export function SentinelShortcut({ feed }: { feed: Feed }) {
    const enabled = useSmartStore(s => s.globalEnabled);
    const seen = useCompanionStore(s => s.seenReminders);
    const unread = enabled && feed.cards.some(card => card.origin === 'sentinel' && card.topic !== 'location' && !seen[card.id]);
    return <Link className="home-sentinel-shortcut" to={remindersRoute}
        aria-label={`Mes rappels${unread ? ' · rappels à découvrir' : ''}`} title="Mes rappels">
        <span aria-hidden="true">🛡️</span>{unread && <span className="home-sentinel-dot" aria-hidden="true" />}
    </Link>;
}

export function SmartSentinel({ feed }: { feed: Feed }) {
    const enabled = useSmartStore(s => s.globalEnabled);
    const setEnabled = useSmartStore(s => s.setGlobalEnabled);
    const hasLocation = usePrayerStore(s => s.lat !== null && s.lng !== null);
    const markSeen = useCompanionStore(s => s.markRemindersSeen);
    const [selected,setSelected]=useState<CompanionCard|null>(null);
    const [notice,setNotice]=useState<{message:string;undo:()=>void}|null>(null);
    const track=useRef<HTMLDivElement>(null);
    const reduced=useReducedMotion();
    const current = feed.cards.filter(card => card.origin === 'sentinel' && card.topic !== 'location');
    const currentIds = new Set(current.map(card => card.id));
    const cards = selectHomeReminders(feed.cards,feed.upcoming,feed.now);
    return <section className="home-reminders" aria-label="Vos rappels">
        <div ref={track} className="home-reminders-track" tabIndex={0} aria-label="Faire défiler les rappels">
            {!enabled ? <article className="home-reminder-card">
                <span className="home-reminder-emoji" aria-hidden="true">🌙</span>
                <h3>Retrouver mes rappels</h3>
                <button className="home-reminder-action" onClick={() => setEnabled(true)}>Activer les rappels →</button>
            </article> : <>
                <AnimatePresence initial={false}>
                {cards.map(card => {
                    const upcoming = !currentIds.has(card.id);
                    return <motion.article className="home-reminder-card" key={card.id} layout={!reduced} exit={reduced?{opacity:0}:{opacity:0,scale:.96}} transition={{duration:reduced?0:.16}}>
                        <div className="home-reminder-top"><span className="home-reminder-emoji" aria-hidden="true">{card.emoji}</span>
                            {upcoming && card.startsAt && <span className="home-reminder-time">À venir · {new Date(card.startsAt).toLocaleTimeString('fr-FR', {day:'numeric',month:'short',hour:'2-digit', minute:'2-digit'})}</span>}
                            <button className="home-reminder-more" aria-label={`Options : ${card.title}`} onClick={()=>setSelected(card)}>⋯</button>
                        </div>
                        <Link className="home-reminder-link" to={card.route} onClick={() => markSeen([card.id])}>
                            <h3>{card.title}</h3>
                            {card.detail&&!(upcoming&&card.keptAt)&&<p className="home-reminder-detail">{card.detail}</p>}
                            <span className="home-reminder-action">{card.action} <span aria-hidden="true">→</span></span>
                        </Link>
                    </motion.article>;
                })}
                </AnimatePresence>
                {!hasLocation && <Link className="home-reminder-card" to="/prayers" state={{openLocation:true}}>
                    <span className="home-reminder-emoji" aria-hidden="true">📍</span>
                    <h3>Les rappels de ma ville</h3><span className="home-reminder-action">Choisir ma ville →</span>
                </Link>}
                {hasLocation && !cards.length && <Link className="home-reminder-card" to={remindersRoute}>
                    <span className="home-reminder-emoji" aria-hidden="true">🌿</span>
                    <h3>Tout est calme pour le moment</h3><span className="home-reminder-action">Retrouver mes rappels →</span>
                </Link>}
            </>}
        </div>
        {notice&&<div className="home-reminder-notice" role="status"><span>{notice.message}</span><button onClick={()=>{notice.undo();setNotice(null);}}>Annuler</button><button aria-label="Fermer la confirmation" onClick={()=>setNotice(null)}>×</button></div>}
        {selected&&<ReminderOptions card={selected} onClose={()=>{setSelected(null);requestAnimationFrame(()=>track.current?.focus({preventScroll:true}));}} onAction={(message,undo)=>setNotice({message,undo})}/>}
    </section>;
}
