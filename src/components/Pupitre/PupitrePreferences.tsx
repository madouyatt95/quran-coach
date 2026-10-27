import {type ReturnTypeOfLayout} from './Pupitre';
export function PupitrePreferences({state}:{state:ReturnTypeOfLayout}){
 const fixed=state.layout==='desk'?state.device.vertical:state.layout==='book'&&state.device.horizontal;
 return <div className="pupitre-personal-layout"><fieldset className="pupitre-layout-choices"><legend>Disposition de lecture</legend>{([
 ['auto','Automatique'],['plain','Classique'],['desk','Pupitre · haut et bas'],['book','Double espace · côte à côte'],
 ] as const).map(([value,label])=><label key={value}><input type="radio" name={`reading-layout-${state.activity}`} value={value} checked={state.choice===value} onChange={()=>state.choose(value)}/><span>{label}</span></label>)}</fieldset>
 <p>Votre choix est conservé pour cette activité.</p>
 {state.layout!=='plain'&&<label>Place pour la lecture · {fixed?'Adaptée à la pliure':`${state.ratio} %`}<input aria-label="Place pour la lecture" type="range" min="35" max="70" step="5" value={state.ratio??50} disabled={fixed} onChange={e=>state.setRatio(Number(e.target.value))}/></label>}
 {fixed&&<small>Les deux espaces suivent la pliure détectée.</small>}
 {state.choice==='auto'&&!fixed&&<small>Vous pouvez choisir le pupitre manuellement.</small>}
 {state.choice==='book'&&state.layout!=='book'&&<small>Dépliez l’écran ou tournez-le pour afficher les deux espaces.</small>}
 </div>;
}
