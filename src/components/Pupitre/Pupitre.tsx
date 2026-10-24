import {createContext,useContext,useState,type HTMLAttributes,type ReactNode} from 'react';
import {PanelsTopLeft,X} from 'lucide-react';
import {type LayoutChoice,type ReadingLayout} from './posture';
import {usePupitreLayout} from './usePupitreLayout';
import './Pupitre.css';
import './Console.css';
const LayoutContext=createContext<ReadingLayout>('plain');
export const usePupitreMode=()=>useContext(LayoutContext);
export type PupitreActivity='reader'|'book'|'catalogue'|'memorization'|'quiz'|'course'|'arabic';
/** Stable wrappers: changing posture never reparents or remounts the activity. */
export function Pupitre({title,children,enabled=true,layoutState,activity='reader',...props}:HTMLAttributes<HTMLDivElement>&{title:string;children:ReactNode;enabled?:boolean;activity?:PupitreActivity;layoutState?:ReturnType<typeof usePupitreLayout>}){
 const own=usePupitreLayout(enabled),state=layoutState||own;const layout=enabled?state.layout:'plain';const [settings,setSettings]=useState(false);
 return <LayoutContext.Provider value={layout}><div {...props} className={`pupitre-root ${props.className||''}`} data-pupitre-layout={layout} data-pupitre-activity={activity}>
  <div className="pupitre-toolbar"><span className="pupitre-title">{title}</span><button type="button" aria-label="Disposition de l’écran" aria-expanded={settings} onClick={()=>setSettings(s=>!s)}><PanelsTopLeft size={17}/>{layout==='desk'?'Pupitre':layout==='book'?'Double espace':'Disposition'}</button>{layout!=='plain'&&<button type="button" aria-label="Quitter le mode pupitre ou double espace" onClick={()=>state.choose('plain')}><X size={18}/></button>}
  {settings&&<div className="pupitre-preferences"><label>Disposition<select aria-label="Disposition de lecture" value={state.choice} onChange={e=>{state.choose(e.target.value as LayoutChoice);setSettings(false);}}><option value="auto">Automatique</option><option value="plain">Classique</option><option value="desk">Pupitre · haut et bas</option><option value="book">Double espace · côte à côte</option></select></label><p>Le mode automatique utilise la pliure lorsqu’elle est détectée. Vous pouvez aussi choisir une disposition manuellement.</p>{state.choice==='book'&&state.device.width<700&&<p>Le double espace s’affiche lorsque l’écran est suffisamment large.</p>}</div>}
  </div>{children}
 </div></LayoutContext.Provider>;
}
export function PupitreTop({children,...props}:HTMLAttributes<HTMLElement>){return <section data-scroll-key="pupitre-upper" {...props} className={`pupitre-upper ${props.className||''}`}>{children}</section>;}
export function PupitreBottom({children,...props}:HTMLAttributes<HTMLElement>){const layout=useContext(LayoutContext);return <section data-scroll-key="pupitre-lower" {...props} className={`pupitre-lower ${props.className||''}`}><div className="pupitre-console-heading" hidden={layout==='plain'}><span aria-hidden="true" className="pupitre-console-light"/>{props['aria-label']||'Votre espace de commandes'}</div>{children}</section>;}
export function PupitreOnly({children}:{children:ReactNode}){return <div className="pupitre-only">{children}</div>;}
