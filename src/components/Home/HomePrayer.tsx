import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {useFavoriteMosqueSchedule} from '../../hooks/useFavoriteMosqueSchedule';
import {usePrayerStore} from '../../stores/prayerStore';
import {publishedDay, publishedNext, prayerCountdown} from '../../lib/publishedPrayerClock';
import {calculatedHomePrayers, type HomePrayerEvent} from './homePrayerModel';
import {directionsUrl, type Mosque} from '../../lib/mosques';
import {updateNextPrayerWidget} from '../../lib/widgetService';
import './HomeHighlights.css';

export function HomePrayerCard({event, now, mosque, calculatedCity, published}: {
    event?: HomePrayerEvent; now: number; mosque?: Mosque | null; calculatedCity: string; published: boolean;
}) {
    const iqama = event?.kind === 'Iqama', friday = event?.kind === 'Jumu’a';
    return <section className={`home-prayer-focus ${iqama ? 'is-iqama' : ''}`} aria-label="Ma prochaine prière">
        <Link to="/prayers" className="home-prayer-focus-main">
            <div className="home-prayer-focus-title"><span aria-hidden="true">🕌</span><div><small>MA PROCHAINE PRIÈRE</small><h2>{event?.label || 'Mes horaires de prière'}</h2></div><span aria-hidden="true">↗</span></div>
            {event ? <>
                <div className="home-prayer-focus-countdown"><span>{iqama ? 'Iqama dans' : friday ? 'Jumu’a dans' : published ? 'Adhan dans' : 'Prière dans'}</span><strong role="timer" aria-live="off">{prayerCountdown(event.at, now)}</strong></div>
                {published && !friday ? <div className="home-prayer-stages">
                    <div className={!iqama ? 'is-current' : 'is-passed'}><span>{iqama ? 'Adhan passé' : 'Adhan'}</span><b>{event.adhan || '—'}</b></div>
                    <span aria-hidden="true">→</span>
                    <div className={iqama ? 'is-current' : ''}><span>Iqama</span><b>{event.iqama || 'Non renseignée'}</b></div>
                </div> : <p className="home-prayer-single-time">{friday ? 'Prière du vendredi' : 'Horaire calculé'} · {event.time}</p>}
                {published && !friday && !event.iqama && <p className="home-prayer-note">Horaires d’Iqama non renseignés</p>}
            </> : <p className="home-prayer-note">{published ? 'Le prochain horaire n’est pas encore renseigné.' : 'Choisissez votre ville pour retrouver vos horaires.'}</p>}
            <p className="home-prayer-place">{published && mosque ? mosque.name : calculatedCity ? `Horaires calculés · ${calculatedCity}` : 'Voir les horaires et les mosquées'} <span aria-hidden="true">›</span></p>
        </Link>
        {published && mosque && <details className="home-prayer-directions"><summary>Itinéraire vers la mosquée ↗</summary><div><a href={directionsUrl(mosque, 'apple')} target="_blank" rel="noopener noreferrer">Apple Plans ↗</a><a href={directionsUrl(mosque, 'google')} target="_blank" rel="noopener noreferrer">Google Maps ↗</a></div></details>}
    </section>;
}

export function HomePrayer() {
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const refresh = () => setNow(Date.now());
        const timer = setInterval(refresh, 1000);
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, []);
    const {timetable, favorite} = useFavoriteMosqueSchedule(now);
    const lat = usePrayerStore(s => s.lat), lng = usePrayerStore(s => s.lng), settings = usePrayerStore(s => s.settings), city = usePrayerStore(s => s.cityName);
    const today = new Date(now);
    const day = +new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const calculated = useMemo(() => calculatedHomePrayers(day, lat, lng, settings), [day, lat, lng, settings]);
    const published = !!favorite && !!publishedDay(timetable, now);
    const event = published ? publishedNext(timetable, now) : calculated.find(item => item.at > now);
    const label = event?.label, time = event?.time;
    useEffect(() => { if (label && time) void updateNextPrayerWidget(label, time).catch(() => {}); }, [label, time]);
    return <HomePrayerCard event={event} now={now} mosque={favorite} calculatedCity={city} published={published}/>;
}
