import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {Volume2,Pause,Check,ArrowRight} from 'lucide-react';
import {useMushafStudyStore,type ReviewWord} from '../stores/mushafStudyStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {loadInteractivePage} from '../lib/interactiveMushaf/service';
import {quranWordAudioUrl,type MushafWord} from '../lib/interactiveMushaf/model';
import {FRENCH_SOURCE} from '../lib/interactiveMushaf/french';
import {savedWordOptions,savedWordQueue} from '../lib/fahm/savedWords';
import './FahmExperience.css';
import './FahmWordsPage.css';

export function FahmWordsPage(){
    const words=useMushafStudyStore(s=>s.words),checks=useFahmLearningStore(s=>s.checks);
    const [queue,setQueue]=useState<ReviewWord[]|null>(null),[index,setIndex]=useState(0),[correct,setCorrect]=useState(0);
    const due=savedWordQueue(Object.values(words),checks,10),item=queue?.[index];
    const begin=(limit:number,all=false)=>{setQueue(all?Object.values(words).sort((a,b)=>b.addedAt-a.addedAt).slice(0,limit):savedWordQueue(Object.values(words),checks,limit));setIndex(0);setCorrect(0);};
    return <main className="fahm-shell fahm-saved-words"><Link to="/fahm">← Fahm</Link><header className="fahm-hero"><span className="fahm-eyebrow">DU MUSHAF À LA COMPRÉHENSION</span><h1>Mes mots à revoir</h1><p>Retrouvez leur sens avant de retourner au verset. Prononcez chaque mot, puis comparez avec son enregistrement.</p></header>
        {!queue?<section className="fahm-card"><h2>{Object.keys(words).length} mot{Object.keys(words).length>1?'s':''} enregistré{Object.keys(words).length>1?'s':''}</h2>{Object.keys(words).length===0?<><p>Dans le Mushaf, faites un appui long sur un mot puis ajoutez-le à « À revoir ».</p><Link className="fahm-primary" to="/read">Ouvrir le Mushaf →</Link></>:<><p>{due.length?`${due.length>=10?'Au moins 10':due.length} mot${due.length>1?'s':''} prêt${due.length>1?'s':''} pour une courte séance.`:'Vos rappels sont programmés. Vous pouvez aussi vous entraîner maintenant.'}</p><div className="fahm-choices"><button className="fahm-primary" onClick={()=>begin(5,!due.length)}>5 mots</button><button onClick={()=>begin(10,!due.length)}>10 mots</button></div><small>Une réponse dans la même séance reste un entraînement. Le rappel différé permet de vérifier ce qui a été retenu.</small></>}</section>:item?<SavedWordQuestion key={`${index}:${item.key}`} saved={item} position={`${index+1} / ${queue.length}`} onNext={success=>{if(success)setCorrect(c=>c+1);setIndex(i=>i+1);}}/>:<section className="fahm-card fahm-word-finish"><Check size={32}/><h2>Séance terminée</h2><p>{correct} sens retrouvé{correct>1?'s':''} sur {queue.length}. Les mots à consolider reviendront dans vos rappels.</p><button className="fahm-primary" onClick={()=>setQueue(null)}>Revenir à mes mots</button><Link to="/read">Reprendre le Mushaf →</Link></section>}
        <p className="fahm-word-source"><a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">Français mot à mot · QUL, ressource 95</a></p>
    </main>;
}
function SavedWordQuestion({saved,position,onNext}:{saved:ReviewWord;position:string;onNext:(correct:boolean)=>void}){
    const [data,setData]=useState<{word:MushafWord;options:string[]}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
    const [choice,setChoice]=useState<string|null>(null),[assisted,setAssisted]=useState(false),[status,setStatus]=useState<'idle'|'loading'|'playing'|'error'>('idle');
    const audio=useRef<HTMLAudioElement|null>(null);
    useEffect(()=>{let gone=false;setError('');void loadInteractivePage(saved.page).then(page=>{const word=page.words.find(w=>w.key===saved.key&&w.verseKey===saved.verseKey&&w.kind==='word');if(!word)throw Error();if(!gone)setData({word,options:savedWordOptions(word,page.words)});}).catch(()=>{if(!gone)setError('Ce mot n’a pas pu être chargé. Réessayez avec une connexion ou après avoir téléchargé cette page.');});return()=>{gone=true;};},[saved,retry]);
    useEffect(()=>{const stop=()=>{audio.current?.pause();setStatus('idle');};window.addEventListener('quran-stop-playback',stop);return()=>{window.removeEventListener('quran-stop-playback',stop);const el=audio.current;if(el){el.onplaying=null;el.onended=null;el.onerror=null;el.pause();}};},[]);
    const answer=(value:string,help=false)=>{
        if(choice!==null||!data?.word.french)return;setChoice(value);setAssisted(help);
        const correct=value===data.word.french&&!help,[surah,ayah]=saved.verseKey.split(':').map(Number);
        useFahmLearningStore.getState().check(`word:${saved.key}`,{surah,ayah},correct,help);
        useFahmLearningStore.getState().wordAnswer(saved.key,data.word.text,correct);
    };
    const play=()=>{
        if(status==='playing'||status==='loading'){audio.current?.pause();setStatus('idle');return;}
        const url=quranWordAudioUrl(saved.verseKey,Number(saved.key.split(':')[2]));if(!url){setStatus('error');return;}
        window.dispatchEvent(new Event('quran-stop-playback'));
        const el=audio.current||new Audio();audio.current=el;el.src=url;setStatus('loading');
        el.onplaying=()=>setStatus('playing');el.onended=()=>setStatus('idle');el.onerror=()=>setStatus('error');
        void el.play().catch(()=>setStatus('error'));
    };
    if(error)return <section className="fahm-card" role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Réessayer</button><button onClick={()=>onNext(false)}>Passer ce mot</button></section>;
    if(!data)return <p role="status">Préparation du mot…</p>;
    const {word,options}=data,answered=choice!==null,correct=choice===word.french&&!assisted;
    return <section className="fahm-card fahm-word-question"><span className="fahm-eyebrow">{position} · CORAN {saved.verseKey} · MOT {word.position}</span><h2>Quel sens a ce mot ?</h2><p className="fahm-study-arabic" dir="rtl" lang="ar">{word.text}</p>
        {word.french?options.length>=2?<div className="fahm-word-options">{options.map(option=><button key={option} aria-pressed={choice===option} disabled={answered} onClick={()=>answer(option)}>{option}</button>)}</div>:<p>Rappelez-vous son sens, puis ouvrez la réponse.</p>:<p>Le sens français de ce mot n’est pas disponible dans la source.</p>}
        {!answered&&word.french&&<button onClick={()=>answer(word.french!,true)}>Voir le sens</button>}
        {answered&&<div className="fahm-word-feedback" role="status"><strong>{correct?'Sens retrouvé':assisted?'À revoir sans aide':'À consolider'}</strong><p>{word.french}</p>{word.transliteration&&<small>{word.transliteration}</small>}<p>Dites le mot à voix haute, puis écoutez sa prononciation.</p></div>}
        <button className="fahm-word-pronounce" onClick={play} aria-label={status==='playing'?'Arrêter la prononciation':'Écouter la prononciation du mot'}>{status==='playing'?<Pause size={20}/>:<Volume2 size={20}/>} {status==='loading'?'Chargement…':status==='playing'?'Arrêter':'Prononciation'}</button>
        {status==='error'&&<p role="alert">L’enregistrement n’a pas pu être lu. Touchez « Prononciation » pour réessayer.</p>}
        <div className="fahm-word-navigation">{(answered||!word.french)&&<button className="fahm-primary" onClick={()=>onNext(correct)}>Mot suivant <ArrowRight size={17}/></button>}<Link to={`/read?surah=${saved.verseKey.split(':')[0]}&ayah=${saved.verseKey.split(':')[1]}&studyWord=${word.position}`}>Revoir dans le Mushaf →</Link></div>
    </section>;
}
