import {useEffect,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
export function HomeDialog({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){
    const ref=useRef<HTMLDialogElement>(null);
    useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.showModal();return()=>{document.body.style.overflow=overflow;previous?.focus();};},[]);
    return createPortal(<dialog ref={ref} className={`home-dialog ${wide?'home-dialog--reading':''}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="home-dialog-inner"><header><h2>{title}</h2><button aria-label={`Fermer ${title}`} onClick={onClose}><X size={22}/></button></header>{children}</div></dialog>,document.body);
}
