import {useBookCatalog} from '../../hooks/useBookCatalog';
import {useAudioLibraryStore} from '../../stores/audioLibraryStore';
import {useAcademyStore} from '../../stores/academyStore';
import {useQuranStore} from '../../stores/quranStore';
import {useLibraryPlayer} from '../../stores/libraryPlayerStore';
import {books,recordingsForBook} from '../../lib/bookLibrary';
import {latestContinuation,bookContinuations,type Continuation} from '../../lib/homeContinuation';
import {profileStorage} from '../../lib/profileStorage';
import {useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useListenStore} from '../../stores/listenStore';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {useHifdhJourneyStore} from '../../stores/hifdhJourneyStore';
import {readHifdhSession} from '../../lib/hifdhSession';
import {menuResumeOptions} from '../../lib/menuResume';
import {CHAPTERS} from '../../lib/interactiveMushaf/model';
export function HomeResume({readingTitle,readingDetail,onRead,streak}:{readingTitle:string;readingDetail:string;onRead:()=>void;streak:number}){
    const [mode,setMode]=useState<'reading'|'listening'|'memorizing'|null>(null);
    const track=useListenStore(s=>s.lastListened),plan=useHifdhJourneyStore(s=>s.plan);
    const navigate=useNavigate();
    const library=useAudioLibraryStore(),courses=useAcademyStore(s=>s.progress),reading=useQuranStore(s=>s.progress);
    const {items}=useBookCatalog(),session=readHifdhSession(profileStorage);
    const memory=menuResumeOptions({bookmark:null,progress:null,lastListened:null,journeyPlan:plan,hifdhSession:session}).find(v=>v.kind==='memorizing');
    const [courseTitles,setCourseTitles]=useState<Record<string,string>>({});
    const hasCourse=Object.values(courses).some(c=>!c.completed&&!!c.lastVisitedAt);
    useEffect(()=>{if(!hasCourse)return;let live=true;void import('../../lib/academyModules').then(({academyModules})=>{if(live)setCourseTitles(Object.fromEntries(academyModules.map(m=>[m.id,m.title])));}).catch(()=>{});return()=>{live=false;};},[hasCourse]);
    const candidates:Continuation[]=[
        {kind:'reading',title:readingTitle,detail:readingDetail,updatedAt:reading?.updatedAt||0},
        {kind:'listening',title:'Reprendre mon écoute',detail:track?`${track.surahName} · ${track.reciterName}`:'',updatedAt:track?.updatedAt||0},
        {kind:'memorizing',title:'Reprendre ma mémorisation',detail:'Retrouver mon passage',updatedAt:memory?.at||0},
        ...bookContinuations(library,items),
        ...Object.entries(courses).flatMap(([id,saved])=>!saved.completed&&saved.lastVisitedAt&&courseTitles[id]?[{kind:'course' as const,title:'Reprendre mon cours',detail:courseTitles[id],updatedAt:saved.lastVisitedAt,href:`/academy?module=${encodeURIComponent(id)}`}]:[])
    ];
    const latest=latestContinuation(candidates),effectiveMode=mode||latest?.kind||'reading';
    const smart=!mode&&(effectiveMode==='book'||effectiveMode==='course')?latest:undefined;

    const title=smart?.title||(effectiveMode==='reading'?readingTitle:effectiveMode==='listening'?(track?'Reprendre mon écoute':'Choisir une récitation'):(memory?'Reprendre ma mémorisation':'Commencer à mémoriser'));
    const seconds=Math.max(0,Math.floor(track?.position||0));
    const detail=smart?smart.detail+(smart.remaining!==undefined?` · ${Math.ceil(smart.remaining/60)} min restantes`:''):effectiveMode==='reading'?readingDetail:effectiveMode==='listening'?(track?`${track.surahName} · ${track.reciterName} · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'Découvrez les récitateurs et les parcours'):memory?`${CHAPTERS[memory.surah-1]?.latin||'Sourate '+memory.surah} · verset ${memory.ayah}`:'Un passage à votre rythme';
    const open=()=>{
        if(smart?.href){
            if(smart.audioId){const book=books.find(b=>b.id===smart.bookId),item=items.find(i=>i.id===smart.audioId);if(book&&item)void useLibraryPlayer.getState().play(item,{queue:recordingsForBook(items,book),startAt:smart.seconds||0});}
            navigate(smart.href,{state:{bookView:smart.audioId?'listen':'read'}});return;
        }
        if(effectiveMode==='reading'){onRead();return;}
        if(effectiveMode==='memorizing'){navigate(memory?`/hifdh?resume=${memory.journey?'journey':'session'}`:'/hifdh');return;}
        const journey=track?.playlist?.[track.playlistIndex||0]?.journey;
        if(journey)navigate(`/listen/experience?journey=${encodeURIComponent(journey.id)}&voice=${encodeURIComponent(String(track!.reciterId))}`);
        else {navigate('/listen');if(track)useAudioPlayerStore.getState().resume(track);}
    };
    return <section className="home-resume" aria-label="Reprendre une activité"><div className="home-resume-tabs" role="group" aria-label="Activité à reprendre">{latest&&<button aria-pressed={!mode} onClick={()=>setMode(null)}>Reprendre</button>}{([{id:'reading',text:'📖 Lire'},{id:'listening',text:'🎧 Écouter'},{id:'memorizing',text:'🎙️ Mémoriser'}] as const).map(v=><button key={v.id} aria-pressed={mode===v.id||(!latest&&effectiveMode===v.id)} onClick={()=>setMode(v.id)}>{v.text}</button>)}</div><button className="home-resume-action" onClick={open}><span><strong>{title}</strong><small>{detail}</small></span><span aria-hidden="true">→</span></button>{streak>0&&<small className="home-resume-streak" title="Un jour actif : lecture attentive, écoute terminée ou exercice. Plusieurs activités dans la journée comptent pour un seul jour.">🔥 {streak} jour{streak>1?'s':''} de régularité</small>}</section>;
}
