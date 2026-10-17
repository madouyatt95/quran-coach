import {useHomeClock} from './useHomeClock';
import {useState} from 'react';
import type {CompanionCard} from '../../lib/companion';
import {momentLabel,nextMoment} from '../../lib/reminderExperience';
import {useCompanionStore} from '../../stores/companionStore';
import {useReminderExperienceStore} from '../../stores/reminderExperienceStore';
import {HomeDialog} from './HomeDialog';
import './HomeExperience.css';
import './SmartSentinel.css';
export function ReminderOptions({card,onClose,onAction}:{card:CompanionCard;onClose:()=>void;onAction:(message:string,undo:()=>void)=>void}){
 const now=+useHomeClock();
 const [custom,setCustom]=useState(''),[error,setError]=useState('');
 const later=(at:number|null)=>{
  if(at===null){setError('Choisissez un créneau à venir.');return;}
  const origin=card.originId||card.id,store=useReminderExperienceStore.getState();
  const previous=store.moments.filter(m=>m.originId===origin);
  const source=previous[0]?.card||card;
  const id=store.keep(source,at,origin);
  if(!id){setError(source.expiresAt&&at>=source.expiresAt?'Ce rappel sera expiré à cette heure. Choisissez un créneau avant son échéance.':'Choisissez une date dans les 90 prochains jours.');return;}
  onAction(`Gardé pour le ${momentLabel(at)}`,()=>useReminderExperienceStore.setState(s=>({moments:[...s.moments.filter(m=>m.originId!==origin),...previous]})));onClose();
 };
 const done=()=>{
  const s=useCompanionStore.getState(),ids=[card.id,...card.originId?[card.originId]:[]];
  const previous=Object.fromEntries(ids.map(id=>[id,s.done[id]]));
  s.complete(card.id,card);if(card.originId)s.complete(card.originId);
  onAction('Rappel marqué comme accompli',()=>useCompanionStore.setState(state=>{
   const done={...state.done};for(const id of ids){if(previous[id])done[id]=previous[id];else delete done[id];}return {done};
  }));onClose();
 };
 const less=()=>{const s=useReminderExperienceStore.getState(),previous=s.cooldowns[card.topic]||0;s.setCooldown(card.topic,Date.now()+7*86400000);onAction('Ce type de rappel est en pause pendant 7 jours',()=>s.setCooldown(card.topic,previous));onClose();};
 return <HomeDialog title="Ce rappel" onClose={onClose}><div className="reminder-options">
  <h3>{card.title}</h3>
  {(!card.startsAt||card.startsAt<=now)&&<button onClick={done}>✓ Déjà fait</button>}
  <button onClick={()=>later(Date.now()+30*60000)}>Plus tard · dans 30 minutes</button>
  <button onClick={less}>Moins souvent · pause de 7 jours</button>
  {card.keptAt&&<button onClick={()=>{const store=useReminderExperienceStore.getState(),old=store.moments.find(m=>m.id===card.id);store.remove(card.id);onAction('Créneau retiré',()=>{if(old)useReminderExperienceStore.setState(s=>({moments:[...s.moments.filter(m=>m.id!==old.id),old]}));});onClose();}}>Retirer ce créneau</button>}
  <h3>Garde-moi ce moment</h3>
  <div className="reminder-preset"><button disabled={!nextMoment('tonight',now)} onClick={()=>later(nextMoment('tonight'))}>Ce soir · 20 h</button><button onClick={()=>later(nextMoment('tomorrow'))}>Demain · 9 h</button></div>
  <label>Mon créneau<input type="datetime-local" value={custom} onChange={e=>{setCustom(e.target.value);setError('');}}/></label>
  <button disabled={!custom} onClick={()=>later(+new Date(custom))}>Garder ce créneau</button>
  {error&&<p role="alert">{error}</p>}
  <p>Retrouvez ce rappel ici à l’heure choisie, avec votre passage enregistré.</p>
  {card.expiresAt&&<p>Valable jusqu’au {momentLabel(card.expiresAt)}.</p>}
 </div></HomeDialog>;
}
