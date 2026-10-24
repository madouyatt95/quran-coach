import {type ReturnTypeOfLayout} from './Pupitre';
export function PupitrePreferences({state}:{state:ReturnTypeOfLayout}){
 const fixed=state.device.vertical||state.device.horizontal;
 return <div className="pupitre-personal-layout"><label>Disposition<select aria-label="Disposition de lecture" value={state.choice} onChange={e=>state.choose(e.target.value as typeof state.choice)}><option value="auto">Automatique</option><option value="plain">Classique</option><option value="desk">Pupitre · haut et bas</option><option value="book">Double espace · côte à côte</option></select></label>
 <p>Votre choix est conservé pour cette activité.</p>
 {state.layout!=='plain'&&<label>Place pour la lecture · {fixed?'Adaptée à la pliure':`${state.ratio} %`}<input aria-label="Place pour la lecture" type="range" min="35" max="70" step="5" value={state.ratio??50} disabled={fixed} onChange={e=>state.setRatio(Number(e.target.value))}/></label>}
 {fixed&&<small>Les deux espaces suivent la pliure détectée.</small>}
 {state.choice==='auto'&&!fixed&&<small>Vous pouvez choisir le pupitre manuellement.</small>}
 {state.choice==='book'&&state.device.width<700&&<small>Dépliez l’écran ou tournez-le pour afficher les deux espaces.</small>}
 </div>;
}
