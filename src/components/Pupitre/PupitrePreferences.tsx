import {type ReturnTypeOfLayout} from './Pupitre';
import {useInteractiveReaderStore} from '../../stores/interactiveReaderStore';
import {useLayoutPreferences} from './usePupitreLayout';
import type {LayoutChoice} from './posture';

function LayoutPreview({mode}:{mode:string}) {
 return <svg className="layout-preview" viewBox="0 0 80 54" aria-hidden="true"><rect x="2" y="2" width="76" height="50" rx="7" className="layout-preview-frame"/>
 {mode==='desk'?<><path d="M3 28h74"/><path d="M18 12h44M18 18h34"/><rect x="28" y="34" width="24" height="10" rx="3"/></>:mode==='book'||mode==='spread'?<><path d="M40 3v48"/><path d="M11 13h21M11 20h21M11 27h21M11 34h21M48 13h21M48 20h21"/>{mode==='spread'?<path d="M48 27h21M48 34h21"/>:<rect x="49" y="28" width="18" height="13" rx="2"/>}</>:<><path d="M18 13h44M18 21h44M18 29h44M18 37h32"/>{mode==='auto'&&<circle cx="64" cy="40" r="7"/>}</>}
 </svg>;
}
export function PupitrePreferences({state}:{state:ReturnTypeOfLayout}){
 const spread=useInteractiveReaderStore(s=>s.bookSpread),setSpread=useInteractiveReaderStore(s=>s.setBookSpread);
 const reader=state.activity==='reader';
 const fixed=state.device.folded&&(state.layout==='desk'?state.device.vertical:state.layout==='book'&&state.device.horizontal);
 const selected=reader&&state.choice==='plain'&&spread?'spread':state.choice;
 const options=[
  {value:'auto',label:'Automatique',detail:'Suit la posture de l’écran'},
  {value:'plain',label:reader?'Une page':'Lecture',detail:reader?'Le Mushaf en pleine largeur':'Tout le contenu dans un espace'},
  ...(reader?[{value:'spread',label:'Livre ouvert',detail:'Deux pages sur écran large'}]:[]),
  {value:'book',label:reader?'Lecture + étude':'Contenu + outils',detail:reader?'Le passage et son explication côte à côte':'Deux espaces côte à côte'},
  {value:'desk',label:'Pupitre',detail:'Lecture en haut, commandes en bas'},
 ];
 const choose=(value:string)=>{
  if(reader&&(value==='plain'||value==='spread'))setSpread(value==='spread');
  state.choose(value==='spread'?'plain':value as LayoutChoice);
  if(reader&&value==='book')useLayoutPreferences.getState().update('reader',{tab:'understand'});
 };
 return <div className="pupitre-personal-layout"><fieldset className="pupitre-layout-choices pupitre-layout-cards"><legend>Disposition de lecture</legend>{options.map(({value,label,detail})=><label key={value}>
  <input type="radio" name={`reading-layout-${state.activity}`} value={value} checked={selected===value} onChange={()=>choose(value)}/><LayoutPreview mode={value}/><span><strong>{label}</strong><small>{detail}</small></span>
 </label>)}</fieldset>
 <p>Votre choix est conservé pour cette activité.</p>
 {reader&&selected==='spread'&&state.device.width<620&&<small>Le livre s’ouvrira sur deux pages dès que l’écran sera assez large.</small>}
 {state.layout!=='plain'&&<label>Place pour la lecture · {fixed?'Adaptée à la pliure':`${state.ratio} %`}<input aria-label="Place pour la lecture" type="range" min="35" max="70" step="5" value={state.ratio??50} disabled={fixed} onChange={e=>state.setRatio(Number(e.target.value))}/></label>}
 {fixed&&<small>Les deux espaces suivent la pliure détectée.</small>}
 {state.choice==='auto'&&!fixed&&<small>À plat, l’écran reste entier. Si la pliure n’est pas détectée, choisissez « Pupitre ».</small>}
 {state.device.folded&&state.device.horizontal&&<small>Pour poser le téléphone comme un ordinateur, autorisez la rotation puis tournez-le : les commandes passeront sous la lecture.</small>}
 {state.choice==='book'&&state.layout!=='book'&&<small>Dépliez l’écran ou tournez-le pour afficher les deux espaces.</small>}
 </div>;
}
