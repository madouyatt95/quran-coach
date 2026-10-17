import {useEffect,useRef,useState} from 'react';
export const RIBBON_MIN=64,RIBBON_MAX=620;
export function ribbonLength(origin:number,delta:number,scale:number){return Math.max(RIBBON_MIN,Math.min(RIBBON_MAX,origin+delta/Math.max(.1,scale)));}
/** Cloth stays attached at the top; only its free end follows the reader's hand. */
export function BookRibbon({marked,length=460,scale,onSave,onRemove}:{marked:boolean;length?:number;scale:number;onSave:(length:number)=>void;onRemove:()=>void}){
 const [pull,setPull]=useState<number|null>(null),[dragging,setDragging]=useState(false);
 const gesture=useRef<{id:number;y:number;origin:number;moved:boolean;length:number}|null>(null),suppress=useRef(false);
 const visible=pull??(marked?length:RIBBON_MIN);
 useEffect(()=>{setPull(null);},[marked,length]);
 return <div className={`iq-book-ribbon ${marked?'is-saved':''} ${dragging?'is-pulling':''}`} style={{height:visible}} aria-hidden={undefined}>
  <span className="iq-book-ribbon-cloth" aria-hidden="true"/>
  <button data-selection-handle className="iq-book-ribbon-grip" style={{width:Math.max(44,44/scale),height:Math.max(44,44/scale)}} aria-label={marked?'Marque-page : tirer pour ajuster ou retirer':'Marque-page : tirer vers le bas pour marquer'} aria-pressed={marked} title="Tirez le ruban vers le bas ou vers le haut"
    onPointerDown={e=>{if(e.button!==0)return;e.stopPropagation();suppress.current=false;gesture.current={id:e.pointerId,y:e.clientY,origin:visible,moved:false,length:visible};setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;e.stopPropagation();if(Math.abs(e.clientY-g.y)>5)g.moved=true;if(g.moved){g.length=ribbonLength(g.origin,e.clientY-g.y,scale);setPull(g.length);}}}
    onPointerUp={e=>{const g=gesture.current;if(!g)return;e.stopPropagation();gesture.current=null;setDragging(false);e.currentTarget.releasePointerCapture(e.pointerId);suppress.current=g.moved;if(g.moved){if(g.length<95){onRemove();setPull(null);}else{onSave(Math.round(g.length));setPull(null);}}}}
    onPointerCancel={()=>{gesture.current=null;suppress.current=true;setDragging(false);setPull(null);}}
    onClick={e=>{e.stopPropagation();if(suppress.current){suppress.current=false;return;}if(marked)onRemove();else onSave(460);}}
    onKeyDown={e=>{if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;e.preventDefault();const next=ribbonLength(visible,e.key==='ArrowDown'?40:-40,1);if(next<95)onRemove();else onSave(next);}}><span className="iq-ribbon-end" aria-hidden="true"/></button>
 </div>;
}
