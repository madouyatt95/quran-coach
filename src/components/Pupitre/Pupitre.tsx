import {createContext,useContext,useLayoutEffect,useRef,useState,type CSSProperties,type HTMLAttributes,type ReactNode} from 'react';
import {PanelsTopLeft,X} from 'lucide-react';
import {type ReadingLayout,type PupitreActivity} from './posture';
import {usePupitreLayout} from './usePupitreLayout';
import {usePupitreContinuity} from './usePupitreContinuity';
import {PupitrePreferences} from './PupitrePreferences';
import './Pupitre.css';
import './Console.css';
const LayoutContext=createContext<ReadingLayout>('plain');
export const usePupitreMode=()=>useContext(LayoutContext);
export type {PupitreActivity} from './posture';
export type ReturnTypeOfLayout=ReturnType<typeof usePupitreLayout>;
/** Stable wrappers: changing posture never reparents or remounts the activity. */
export function Pupitre({title,children,enabled=true,layoutState,activity='reader',toolbar=true,documentKey=activity,...props}:HTMLAttributes<HTMLDivElement>&{title:string;children:ReactNode;enabled?:boolean;toolbar?:boolean;activity?:PupitreActivity;layoutState?:ReturnTypeOfLayout;documentKey?:string}){
 const own=usePupitreLayout(enabled,activity),state=layoutState||own;const layout=enabled?state.layout:'plain';const [settings,setSettings]=useState(false),root=useRef<HTMLDivElement>(null),drag=useRef(false);
 const fixed=layout==='desk'?state.device.vertical:layout==='book'&&state.device.horizontal;
 const nativeFold=state.device.nativeFold?.layout===layout?state.device.nativeFold:null;
 usePupitreContinuity(root,`${layout}:${state.ratio}`,documentKey);
 useLayoutEffect(()=>{
  if(layout==='plain'||activity!=='reader')return;
  const lower=root.current?.querySelector<HTMLElement>('.pupitre-lower');if(!lower)return;
  const names=['top','left','width','height'] as const;
  const measure=()=>{const r=lower.getBoundingClientRect();for(const name of names)document.documentElement.style.setProperty(`--pupitre-sheet-${name}`,`${r[name]}px`);};
  measure();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(lower);window.addEventListener('resize',measure);
  return()=>{observer?.disconnect();window.removeEventListener('resize',measure);for(const name of names)document.documentElement.style.removeProperty(`--pupitre-sheet-${name}`);};
 },[layout,state.ratio,activity]);
 const resize=(e:React.PointerEvent<HTMLDivElement>)=>{if(!drag.current||fixed||!root.current)return;const r=root.current.getBoundingClientRect(),ratio=layout==='book'?(e.clientX-r.left)/r.width:(e.clientY-r.top)/r.height;state.setRatio(Math.round(ratio*100));};
 return <LayoutContext.Provider value={layout}><div {...props} ref={root} style={{...props.style,'--pupitre-ratio':(state.ratio??50)/100,...(nativeFold?{'--native-fold-start':`${nativeFold.start}px`,'--native-fold-size':`${nativeFold.size}px`}:{})} as CSSProperties} className={`pupitre-root ${props.className||''}`} data-pupitre-layout={layout} data-pupitre-native-fold={nativeFold?.layout} data-pupitre-activity={activity} data-pupitre-toolbar={toolbar}>
  {toolbar&&<div className="pupitre-toolbar"><span className="pupitre-title">{title}</span><button type="button" aria-label="Disposition de l’écran" aria-expanded={settings} onClick={()=>setSettings(s=>!s)}><PanelsTopLeft size={17}/>{layout==='desk'?'Pupitre':layout==='book'?'Double espace':'Disposition'}</button>{layout!=='plain'&&<button type="button" aria-label="Quitter le mode pupitre ou double espace" onClick={()=>state.choose('plain')}><X size={18}/></button>}
  {settings&&<div className="pupitre-preferences"><PupitrePreferences state={state}/><button onClick={()=>setSettings(false)}>Terminé</button></div>}
  </div>}{children}<div className="pupitre-divider" role="separator" aria-label="Répartir les espaces de lecture et de commandes" aria-orientation={layout==='book'?'vertical':'horizontal'} aria-valuemin={35} aria-valuemax={70} aria-valuenow={state.ratio??50} aria-disabled={fixed} tabIndex={layout==='plain'||fixed?-1:0} onPointerDown={e=>{if(fixed)return;drag.current=true;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={resize} onPointerUp={()=>{drag.current=false;}} onPointerCancel={()=>{drag.current=false;}} onKeyDown={e=>{if(fixed)return;const delta=['ArrowDown','ArrowRight'].includes(e.key)?5:['ArrowUp','ArrowLeft'].includes(e.key)?-5:0;if(delta){e.preventDefault();state.setRatio((state.ratio??50)+delta);}else if(e.key==='Home'){e.preventDefault();state.setRatio(50);}}}><span/></div>
 </div></LayoutContext.Provider>;
}
export function PupitreTop({children,...props}:HTMLAttributes<HTMLElement>){return <section data-scroll-key="pupitre-upper" {...props} className={`pupitre-upper ${props.className||''}`}>{children}</section>;}
export function PupitreBottom({children,...props}:HTMLAttributes<HTMLElement>){const layout=useContext(LayoutContext);return <section data-scroll-key="pupitre-lower" {...props} className={`pupitre-lower ${props.className||''}`}><div className="pupitre-console-heading" hidden={layout==='plain'}><span aria-hidden="true" className="pupitre-console-light"/>{props['aria-label']||'Votre espace de commandes'}</div>{children}</section>;}
export function PupitreOnly({children}:{children:ReactNode}){return <div className="pupitre-only">{children}</div>;}
