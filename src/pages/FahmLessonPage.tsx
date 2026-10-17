import {SURAH_JOURNEYS} from '../lib/fahm/surahJourneys';
import {FahmSurahMap} from '../components/Fahm/FahmSurahMap';
import {FahmListeningStudy} from '../components/Fahm/FahmListeningStudy';
import {CHAPTERS} from '../lib/interactiveMushaf/model';
import {useEffect,useRef,useState} from 'react';
import {Link,useLocation,useNavigate,useParams} from 'react-router-dom';
import {READING_PATHS} from '../data/readingPaths';
import {passageTargets,verseKey,type VerseTarget} from '../lib/fahm/learning';
import {FAHM_GUIDES,DEFAULT_GUIDE} from '../lib/fahm/guides';
import {useFahmStore} from '../stores/fahmStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {FahmVerseStudy} from '../components/Fahm/FahmVerseStudy';
import './FahmExperience.css';

export function FahmLessonPage(){
    const {pathId,day,surah}=useParams(),location=useLocation();
    const session=useFahmLearningStore(s=>s.session);
    const path=READING_PATHS.find(p=>p.id===pathId),lesson=path?.days.find(d=>d.day===Number(day));
    if(surah&&SURAH_JOURNEYS[Number(surah)])return <FahmLesson key={`surah-${surah}`} id={`surah/${surah}`} title={SURAH_JOURNEYS[Number(surah)].name} targets={Array.from({length:CHAPTERS[Number(surah)-1].count},(_,i)=>({surah:Number(surah),ayah:i+1}))} pathId="discover"/>;
    if(location.pathname==='/fahm/session')return session?<FahmLesson key={session.id} id={session.id} title={session.title} targets={session.targets} personal pathId="discover"/>:<div className="fahm-shell"><h1>Votre séance</h1><p>Choisissez votre durée pour commencer.</p><Link to="/fahm">Préparer une séance</Link></div>;
    if(!path||!lesson)return <div className="fahm-shell"><h1>Étape introuvable</h1><Link to="/fahm">Revenir aux parcours</Link></div>;
    return <FahmLesson key={`${path.id}/${lesson.day}`} id={`${path.id}/${lesson.day}`} title={lesson.title} targets={passageTargets(lesson)} pathId={path.id} day={lesson.day}/>;
}
function FahmLesson({id,title,targets,pathId,day,personal=false}:{id:string;title:string;targets:VerseTarget[];pathId:string;day?:number;personal?:boolean}){
    const state=useFahmLearningStore(),fahm=useFahmStore(),navigate=useNavigate(),location=useLocation();
    const index=Math.min(state.positions[id]||0,targets.length-1),target=targets[index];
    const [mode,setMode]=useState<'study'|'listen'>(state.modes[id]||(new URLSearchParams(location.search).get('mode')==='listen'?'listen':'study'));
    const [seenText,setSeenText]=useState(mode!=='listen');
    const [discover,setDiscover]=useState(false),[finished,setFinished]=useState(personal&&!!state.session?.finished);
    const top=useRef<HTMLDivElement>(null),guide=FAHM_GUIDES[pathId]||DEFAULT_GUIDE;
    const done=state.studied[id]||[],complete=targets.every(v=>done.includes(verseKey(v)));
    const readerReturn=location.state?.readerReturn as {to?:string;label?:string;state?:unknown}|undefined;
    const remember=state.move,saveMode=state.setMode;
    useEffect(()=>{saveMode(id,mode);},[id,mode,saveMode]);
    useEffect(()=>{remember(id,index);},[id,index,remember]);
    function move(next:number){state.move(id,Math.max(0,Math.min(targets.length-1,next)));top.current?.scrollIntoView({block:'start'});}
    function finish(){if(!targets.every(v=>useFahmLearningStore.getState().studied[id]?.includes(verseKey(v))))return;if(personal)state.finishSession();else if(day)fahm.completePathDay(pathId,day);setFinished(true);}
    function studied(){state.study(id,target);const next=targets.findIndex((v,i)=>i>index&&!useFahmLearningStore.getState().studied[id]?.includes(verseKey(v)));if(next>=0)move(next);else if(targets.every(v=>useFahmLearningStore.getState().studied[id]?.includes(verseKey(v))))finish();else move(targets.findIndex(v=>!useFahmLearningStore.getState().studied[id]?.includes(verseKey(v))));}
    return <main className="fahm-shell fahm-course" ref={top}>
        <header className="fahm-course-header"><Link to="/fahm" state={location.state}>← Mes parcours</Link>{readerReturn?.to?.startsWith('/read')&&<button onClick={()=>navigate(readerReturn.to!,{state:readerReturn.state})}>Retour au Mushaf ↗</button>}<span className="fahm-eyebrow">{personal?'MA SÉANCE':day?`ÉTAPE ${day}`:'SOURATE GUIDÉE'} · FAHM</span><h1>{title}</h1><p>{guide.goal}</p><progress aria-label="Versets étudiés" value={targets.filter(v=>done.includes(verseKey(v))).length} max={targets.length}/><small>{targets.filter(v=>done.includes(verseKey(v))).length} / {targets.length} versets étudiés</small></header>
        {finished?<><FahmSurahMap surah={target.surah} ayah={target.ayah} studied={done} complete onSelect={ayah=>{const i=targets.findIndex(v=>v.ayah===ayah&&v.surah===target.surah);if(i>=0){setFinished(false);move(i);}else navigate(`/fahm/surah/${target.surah}`);}}/><section className="fahm-card fahm-complete"><span aria-hidden="true">🌿</span><h2>{personal?'Séance terminée':'Étape terminée'}</h2><p>Vos réponses et vos notes sont enregistrées. Les difficultés reviendront dans vos séances personnelles.</p><Link className="fahm-primary" to="/fahm" state={location.state}>Retrouver mes parcours</Link><button onClick={()=>{setFinished(false);move(0);}}>Relire le passage</button></section></>:<>
        {mode==='study'&&<FahmSurahMap surah={target.surah} ayah={target.ayah} studied={done} onSelect={ayah=>{const i=targets.findIndex(v=>v.surah===target.surah&&v.ayah===ayah);if(i>=0)move(i);else navigate(`/fahm/surah/${target.surah}`);}}/>}
        <details className="fahm-card fahm-guide"><summary>Comment étudier ce passage</summary><ol>{guide.steps.map(step=><li key={step}>{step}</li>)}</ol><p>{guide.reflection}</p></details>
        <nav className="fahm-pager" aria-label="Versets du passage"><button disabled={index===0} onClick={()=>move(index-1)}>←</button><label>Verset<select aria-label="Choisir le verset à étudier" value={index} onChange={e=>move(Number(e.target.value))}>{targets.map((v,i)=><option key={`${verseKey(v)}-${i}`} value={i}>{verseKey(v)} {done.includes(verseKey(v))?'✓':''}</option>)}</select></label><span>{index+1} / {targets.length}</span><button disabled={index===targets.length-1} onClick={()=>move(index+1)}>→</button></nav>
        <div className="fahm-mode-switch" role="group" aria-label="Façon d’étudier"><button aria-pressed={mode==='study'} onClick={()=>{setMode('study');setSeenText(true);}}>Lire et comprendre</button><button aria-pressed={mode==='listen'} onClick={()=>setMode('listen')}>Comprendre à l’écoute</button></div>
        {mode==='study'?<><label className="fahm-discovery-switch"><input type="checkbox" checked={discover} onChange={e=>setDiscover(e.target.checked)}/> Essayer de comprendre avant la traduction</label>
        {target&&<FahmVerseStudy key={`${verseKey(target)}-${discover}`} lessonId={id} target={target} discover={discover} onDone={studied}/>}</>:<FahmListeningStudy key={verseKey(target)} target={target} seenText={seenText} onDone={studied} onRead={()=>{setMode('study');setSeenText(true);}}/>}
        {complete&&<button className="fahm-primary" onClick={finish}>Terminer {personal?'la séance':'cette étape'} ✓</button>}
        </>}
    </main>;
}
