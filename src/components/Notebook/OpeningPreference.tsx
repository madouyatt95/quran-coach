import {useEffect,useRef} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {create} from 'zustand';
import {persist} from '../../lib/profilePersist';
import {safeStudyHref} from '../../stores/studyNotebookStore';
import './StudyNotebook.css';
export type OpeningChoice='home'|'reading'|'course'|'notebook';
export const useOpeningPreference=create<{choice:OpeningChoice;reading:string;course:string;setChoice:(choice:OpeningChoice)=>void;remember:(kind:'reading'|'course',href:string)=>void}>()(persist(set=>({choice:'home',reading:'/read',course:'/academy',setChoice:choice=>set({choice}),remember:(kind,href)=>{if(safeStudyHref(href))set({[kind]:href});}}),{name:'qc-opening-preference-v1'}));
export function openingDestination(choice:OpeningChoice,reading:string,course:string){return choice==='reading'&&safeStudyHref(reading)?reading:choice==='course'&&safeStudyHref(course)?course:choice==='notebook'?'/notebook':'/';}
export function OpeningPreference(){const state=useOpeningPreference();return <label className="study-open-choice">À l’ouverture de Quran Coach<select value={state.choice} onChange={e=>state.setChoice(e.target.value as OpeningChoice)}><option value="home">Afficher l’accueil</option><option value="reading">Reprendre ma dernière lecture</option><option value="course">Retrouver mon dernier cours</option><option value="notebook">Ouvrir mon carnet d’étude</option></select><small>Les liens vers un passage précis restent prioritaires.</small></label>;}
export function OpeningNavigation(){
 const location=useLocation(),navigate=useNavigate(),first=useRef(true);
 useEffect(()=>{const state=useOpeningPreference.getState();if(first.current){first.current=false;if(location.pathname==='/'&&!location.search&&!location.hash){const target=openingDestination(state.choice,state.reading,state.course);if(target!=='/'){navigate(target,{replace:true});return;}}}const href=location.pathname+location.search+location.hash;if(location.pathname==='/read'||location.pathname.startsWith('/books/'))state.remember('reading',href);else if(location.pathname.startsWith('/academy'))state.remember('course',href);},[location.pathname,location.search,location.hash,navigate]);
 return null;
}
