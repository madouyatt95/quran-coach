import {useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
import {SaveExcerpt,StudyNotebook} from './StudyNotebook';
function fingerprint(text:string){let h=0;for(const c of text)h=(Math.imul(h,31)+c.charCodeAt(0))|0;return (h>>>0).toString(36);}
export function CourseExcerpt(){
 const location=useLocation(),[text,setText]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{setText('');const selection=()=>{const s=window.getSelection(),node=s?.anchorNode?.parentElement;if(!s||!node||node.closest('.study-notebook,input,textarea'))return;setText(s.toString().trim().slice(0,12000));};document.addEventListener('selectionchange',selection);return()=>document.removeEventListener('selectionchange',selection);},[location.pathname,location.search]);
 const href=location.pathname+location.search;
 if(!location.pathname.startsWith('/academy'))return null;
 return <section className="course-excerpt"><button aria-expanded={open} onClick={()=>setOpen(v=>!v)}>Mon carnet d’étude</button>{text&&<SaveExcerpt entry={{id:`course:${href}:${fingerprint(text)}`,title:'Mon cours',text,reference:`Extrait du cours · ${new URLSearchParams(location.search).get('module')||location.pathname.split('/').at(-1)}`,href}} onSaved={()=>setOpen(true)}/>}<div hidden={!open}><StudyNotebook compact/></div></section>;
}
