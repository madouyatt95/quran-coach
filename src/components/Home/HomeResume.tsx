import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useListenStore} from '../../stores/listenStore';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {useHifdhJourneyStore} from '../../stores/hifdhJourneyStore';
import {readHifdhSession} from '../../lib/hifdhSession';
import {menuResumeOptions} from '../../lib/menuResume';
import {CHAPTERS} from '../../lib/interactiveMushaf/model';
export function HomeResume({readingTitle,readingDetail,onRead,streak}:{readingTitle:string;readingDetail:string;onRead:()=>void;streak:number}){
    const [mode,setMode]=useState<'reading'|'listening'|'memorizing'>('reading');
    const track=useListenStore(s=>s.lastListened),plan=useHifdhJourneyStore(s=>s.plan);
    const navigate=useNavigate();
    const memory=menuResumeOptions({bookmark:null,progress:null,lastListened:null,journeyPlan:plan,hifdhSession:readHifdhSession(localStorage)}).find(v=>v.kind==='memorizing');
    const title=mode==='reading'?readingTitle:mode==='listening'?(track?'Reprendre mon écoute':'Choisir une récitation'):(memory?'Reprendre ma mémorisation':'Commencer à mémoriser');
    const seconds=Math.max(0,Math.floor(track?.position||0));
    const detail=mode==='reading'?readingDetail:mode==='listening'?(track?`${track.surahName} · ${track.reciterName} · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Découvrez les récitateurs et les parcours'):memory?`${CHAPTERS[memory.surah-1]?.latin||'Sourate '+memory.surah} · verset ${memory.ayah}`:'Un passage à votre rythme';
    const open=()=>{
        if(mode==='reading'){onRead();return;}
        if(mode==='memorizing'){navigate(memory?`/hifdh?resume=${memory.journey?'journey':'session'}`:'/hifdh');return;}
        const journey=track?.playlist?.[track.playlistIndex||0]?.journey;
        if(journey)navigate(`/listen/experience?journey=${encodeURIComponent(journey.id)}&voice=${encodeURIComponent(String(track!.reciterId))}`);
        else {navigate('/listen');if(track)useAudioPlayerStore.getState().resume(track);}
    };
    return <section className="home-resume" aria-label="Reprendre une activité"><div className="home-resume-tabs" role="group" aria-label="Activité à reprendre">{([{id:'reading',text:'📖 Lire'},{id:'listening',text:'🎧 Écouter'},{id:'memorizing',text:'🎙️ Mémoriser'}] as const).map(v=><button key={v.id} aria-pressed={mode===v.id} onClick={()=>setMode(v.id)}>{v.text}</button>)}</div><button className="home-resume-action" onClick={open}><span><strong>{title}</strong><small>{detail}</small></span><span aria-hidden="true">→</span></button>{streak>0&&<small className="home-resume-streak" title="Un jour actif : lecture attentive, écoute terminée ou exercice. Plusieurs activités dans la journée comptent pour un seul jour.">🔥 {streak} jour{streak>1?'s':''} de régularité</small>}</section>;
}
