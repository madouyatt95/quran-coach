import {useId,type ReactNode} from 'react';
import {Pin,PinOff} from 'lucide-react';
import {usePupitreMode} from './Pupitre';
import {usePupitreLayout,useLayoutPreferences,type ConsoleTab} from './usePupitreLayout';
import type {PupitreActivity} from './posture';
import {PupitrePreferences} from './PupitrePreferences';
export interface ConsoleAction {id:string;label:string;icon?:ReactNode;onClick?:()=>void;disabled?:boolean;pressed?:boolean;content?:ReactNode}
export function PupitreWorkspace({activity,primary,listen,understand,settings,actions=[],defaultPins=[],tab,onTabChange}:{activity:PupitreActivity;primary:ReactNode;listen:ReactNode;understand:ReactNode;settings:ReactNode;actions?:ConsoleAction[];defaultPins?:string[];tab?:ConsoleTab;onTabChange?:(tab:ConsoleTab)=>void}){
 const id=useId(),layout=usePupitreMode(),state=usePupitreLayout(true,activity),update=useLayoutPreferences(s=>s.update);
 const current=tab||state.tab,pins=state.pins??defaultPins;
 const choose=(value:ConsoleTab)=>{update(activity,{tab:value});onTabChange?.(value);};
 const toggle=(key:string)=>update(activity,{pins:pins.includes(key)?pins.filter(p=>p!==key):[...pins,key].slice(-4)});
 return <div className="pupitre-workspace" data-console-tab={current}>
  <div className="pupitre-workspace-fixed pupitre-only">{primary}{actions.length>0&&<div className="pupitre-shortcuts" aria-label="Mes raccourcis">{actions.filter(a=>pins.includes(a.id)).map(a=><div key={a.id}>{a.content||<button disabled={a.disabled} aria-pressed={a.pressed} onClick={a.onClick}>{a.icon}<span>{a.label}</span></button>}</div>)}</div>}
  <div className="pupitre-console-tabs" role="tablist" aria-label="Console de l’activité">{([['listen','Écoute'],['understand','Comprendre'],['settings','Réglages']] as const).map(([key,label])=><button key={key} id={`${id}-${key}-tab`} role="tab" aria-selected={current===key} aria-controls={`${id}-${key}`} tabIndex={current===key?0:-1} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const tabs:ConsoleTab[]=['listen','understand','settings'],next=tabs[(tabs.indexOf(current)+(e.key==='ArrowRight'?1:2))%3];choose(next);document.getElementById(`${id}-${next}-tab`)?.focus();}}} onClick={()=>choose(key)}>{label}</button>)}</div></div>
  <div className="pupitre-workspace-scroll" data-scroll-key={`${activity}-console`}>
   {([['listen',listen],['understand',understand],['settings',<>{settings}<div className="pupitre-only"><PupitrePreferences state={state}/>{actions.length>0&&<fieldset className="pupitre-pins"><legend>Mes raccourcis · quatre au maximum</legend>{actions.map(a=><button key={a.id} aria-pressed={pins.includes(a.id)} onClick={()=>toggle(a.id)}>{pins.includes(a.id)?<Pin size={15}/>:<PinOff size={15}/>} {a.label}</button>)}</fieldset>}</div></>]] as const).map(([key,content])=><section key={key} id={`${id}-${key}`} role={layout==='plain'?undefined:'tabpanel'} aria-labelledby={layout==='plain'?undefined:`${id}-${key}-tab`} hidden={layout!=='plain'&&current!==key} className="pupitre-console-panel">{content}</section>)}
  </div>
 </div>;
}
