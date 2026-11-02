import {Capacitor} from '@capacitor/core';
import {Link} from 'react-router-dom';
import {useNotificationStore} from '../../stores/notificationStore';
export function CarPlaySettings(){
 const prefs=useNotificationStore();
 if(!Capacitor.isNativePlatform()||Capacitor.getPlatform()!=='ios')return null;
 return <section className="settings-section" id="carplay">
  <h2 className="settings-section__title">CarPlay · Mon trajet</h2>
  <div className="settings-item">
   <div className="settings-item__label"><span className="settings-item__title" id="car-iqama-label">Annonce avant l’Iqama</span><span className="settings-item__description" id="car-iqama-description">Une annonce courte pendant l’écoute CarPlay, uniquement pour une Iqama publiée récente. La récitation baisse puis retrouve son volume.</span></div>
   <button type="button" className={`toggle ${prefs.carIqamaReminderEnabled?'active':''}`} role="switch" aria-checked={prefs.carIqamaReminderEnabled} aria-labelledby="car-iqama-label" aria-describedby="car-iqama-description" onClick={()=>prefs.setCarIqamaReminder(!prefs.carIqamaReminderEnabled)}><span className="toggle__knob"/></button>
  </div>
  {prefs.carIqamaReminderEnabled&&<div className="settings-item"><label htmlFor="car-iqama-minutes">Prévenir avant l’Iqama</label><select className="reciter-select" id="car-iqama-minutes" value={prefs.carIqamaMinutes} onChange={e=>prefs.setCarIqamaReminder(true,Number(e.target.value) as 5|10|15)}>{[5,10,15].map(n=><option key={n} value={n}>{n} minutes avant</option>)}</select></div>}
  <Link className="settings-link" to="/prayers"><span className="settings-link__text">Choisir ma mosquée et consulter ses horaires</span><span aria-hidden="true">→</span></Link>
  <p className="settings-item__description">Pendant un trajet, CarPlay garde la mosquée retenue au départ. Un changement reste possible depuis l’onglet Prières.</p>
 </section>;
}
