import { useAutomaticMosqueControl } from '../../hooks/AutomaticMosqueContext';
import { activeMosque, useMosqueStore } from '../../stores/mosqueStore';
import { distanceKm, type Mosque } from '../../lib/mosques';
export function AutomaticMosqueControl({onChoose}:{onChoose:()=>void;onOpen:(m:Mosque)=>void}) {
 const automatic=useAutomaticMosqueControl(),mosque=useMosqueStore(activeMosque),favorite=useMosqueStore(s=>s.favorite);
 return <section className="automatic-mosque" aria-label="Choix de la mosquée">
  <div className="mosque-selection-modes"><button type="button" aria-pressed={automatic.mode==='nearby'} onClick={automatic.enable}>📍 Autour de moi</button><button type="button" aria-pressed={automatic.mode==='favorite'} onClick={()=>favorite?useMosqueStore.getState().setSelectionMode('favorite'):onChoose()}>★ Ma mosquée</button></div>
  <p className="mosque-caption">{automatic.mode==='nearby'?'Sélection selon votre position · actualisée lorsque vous utilisez cette page.':favorite?'Votre mosquée habituelle reste sélectionnée pendant vos déplacements.':'Activez « Autour de moi » ou choisissez votre mosquée habituelle.'}</p>
  {automatic.busy&&<p role="status">Recherche de la mosquée et de ses horaires…</p>}
  {automatic.error&&<p role="status">{automatic.error}</p>}
  {automatic.mode==='nearby'&&mosque&&<div className="mosque-selection-summary"><strong>{mosque.name}</strong>{automatic.error&&<small>Dernière sélection · actualisation nécessaire</small>}{automatic.position&&<span>{distanceKm(automatic.position,mosque).toFixed(1)} km à vol d’oiseau</span>}<button type="button" onClick={()=>automatic.lock(mosque)}>★ Garder cette mosquée</button></div>}
  {automatic.mode==='nearby'&&automatic.alternative&&<p className="mosque-caption">{automatic.alternative.name} ne publie pas de journée complète. Les horaires affichés sont ceux de {mosque?.name}, la suivante disponible par distance.</p>}

  <div className="mosque-actions">{automatic.mode==='nearby'&&<button type="button" disabled={automatic.busy} onClick={automatic.enable}>Actualiser ma position</button>}<button type="button" onClick={onChoose}>Choisir sur la carte</button></div>
 </section>;
}
