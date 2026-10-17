import {useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {storiesForVerse} from '../../lib/editorialJourneys';
import {stopTts} from '../../lib/ttsService';
import './Journeys.css';
export default function StoryContextButton({verseKey,onClose}:{verseKey:string;onClose?:()=>void}){
 const [expanded,setExpanded]=useState(false),location=useLocation(),navigate=useNavigate();
 const [surah,ayah]=verseKey.split(':').map(Number);const matches=storiesForVerse(surah,ayah);
 if(!matches.length)return null;
 return <div className="story-context"><button aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>📖 Comprendre le récit</button>{expanded&&<div className="story-context-options">{matches.map(m=><button key={`${m.key}:${m.chapter.id}`} onClick={()=>{window.dispatchEvent(new Event('quran-stop-playback'));stopTts();onClose?.();const from=location.pathname==='/read'?`/read?surah=${surah}&ayah=${ayah}`:location.pathname+location.search;navigate(`/journeys/${m.kind}/${m.id}?${new URLSearchParams({step:`chapter-${m.chapter.id}`,from})}`);}}><strong>{m.icon} {m.title}</strong><span>{m.chapter.title}</span></button>)}</div>}</div>;
}
