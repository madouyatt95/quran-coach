import {GrammarExplorer} from '../../arabic/GrammarExplorer';
import {FahmPhraseGroups} from './FahmPhraseGroups';
import {FahmWordContexts} from './FahmWordContexts';
import {useListeningEvidenceStore} from '../../stores/listeningEvidenceStore';
import {useEffect,useRef,useState} from 'react';
import DOMPurify from 'dompurify';
import {Link} from 'react-router-dom';
import {Pause,Play,Volume2,X} from 'lucide-react';
import {fahmExplanation,fahmWords,loadFahmVerse,type FahmVerse} from '../../lib/fahm/content';
import {sourceUrl,verseKey,normalizeFahmWord,type VerseTarget} from '../../lib/fahm/learning';
import {FRENCH_SOURCE} from '../../lib/interactiveMushaf/french';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
import {useFahmStore} from '../../stores/fahmStore';
import {useSettingsStore} from '../../stores/settingsStore';
import {QURAN_VOCABULARY} from '../../data/quranVocabulary';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {fetchVerseRecitation,type VerseRecitation} from '../../lib/verseRecitation';
import {getAudioUrl,mushafReciter} from '../../lib/quranApi';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {FahmExercises} from './FahmExercises';
import {FATIHA_STRUCTURE} from '../../lib/fahm/guides';
import {useOpenReader} from '../../hooks/useOpenReader';
import type {TafsirContent} from '../../lib/tafsirApi';

export function FahmVerseStudy({target,discover,onDone,lessonId}:{lessonId:string;target:VerseTarget;discover:boolean;onDone:()=>void}) {
    const {surah,ayah}=target;
    const key=verseKey(target),exerciseId=`${lessonId}:${verseKey(target)}`,openReader=useOpenReader('Retour à Fahm');
    const [verse,setVerse]=useState<FahmVerse|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
    const [words,setWords]=useState<MushafWord[]>([]),[wordStatus,setWordStatus]=useState('loading'),[selected,setSelected]=useState<MushafWord|null>(null);
    const [exegesis,setExegesis]=useState<TafsirContent|null>(null),[exegesisLoading,setExegesisLoading]=useState(true);
    const [showTranslation,setShowTranslation]=useState(!discover),[showPhonetic,setShowPhonetic]=useState(false),[exercise,setExercise]=useState(()=>!!useFahmLearningStore.getState().drafts[exerciseId]);
    const [playing,setPlaying]=useState(false),[audioError,setAudioError]=useState(''),[pronouncing,setPronouncing]=useState(false),[activeWord,setActiveWord]=useState(0),[rate,setRate]=useState(1),[repeat,setRepeat]=useState(1);
    const audio=useRef<HTMLAudioElement>(null),wordAudio=useRef<HTMLAudioElement|null>(null),count=useRef(1),exerciseRef=useRef<HTMLDivElement>(null);
    const [recitation,setRecitation]=useState<VerseRecitation|null>(null);
    const reciter=useSettingsStore(s=>s.selectedReciter);
    const learned=useFahmStore(s=>s.learnedWords),known=useFahmLearningStore(s=>s.words);
    const knownText=new Set([...QURAN_VOCABULARY.filter(w=>learned[w.id]?.level>0).map(w=>normalizeFahmWord(w.arabic)),...Object.values(known).filter(w=>w.correct).map(w=>normalizeFahmWord(w.text))]);
    useEffect(()=>{let gone=false;void loadFahmVerse({surah,ayah}).then(data=>{if(gone)return;setVerse(data);void fahmWords(data).then(data=>{if(!gone){setWords(data);setWordStatus('ready');}}).catch(()=>{if(!gone)setWordStatus('error');});}).catch(()=>{if(!gone)setError('Le passage n’a pas pu être chargé. Réessayez avec une connexion.');});void fahmExplanation({surah,ayah}).then(data=>{if(!gone){setExegesis(data);setExegesisLoading(false);}});return()=>{gone=true;wordAudio.current?.pause();};},[surah,ayah,retry]); // keyed by parent
    useEffect(()=>{let gone=false;void fetchVerseRecitation(key,mushafReciter(reciter).quranComId).then(data=>{if(!gone)setRecitation(data);}).catch(()=>{});return()=>{gone=true;};},[key,reciter]);
    useEffect(()=>{if(audio.current)audio.current.playbackRate=rate;},[rate]);
    useEffect(()=>{const stop=()=>{audio.current?.pause();wordAudio.current?.pause();};window.addEventListener('quran-stop-playback',stop);return()=>window.removeEventListener('quran-stop-playback',stop);},[]);
    function prepare(){window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();document.querySelectorAll('audio').forEach(el=>{if(el!==audio.current)el.pause();});setAudioError('');}
    function play(){const el=audio.current;if(!el)return;if(!el.paused){el.pause();return;}prepare();count.current=1;if(!el.getAttribute('src'))el.src=recitation?.url||getAudioUrl(reciter,verse!.ayah.number);el.playbackRate=rate;void el.play().catch(()=>setAudioError('L’écoute n’a pas pu démarrer. Réessayez.'));}
    function pronounce(word:MushafWord){if(!word.audio)return;if(wordAudio.current&&!wordAudio.current.paused){wordAudio.current.pause();setPronouncing(false);return;}prepare();audio.current?.pause();wordAudio.current?.pause();const el=new Audio(word.audio);wordAudio.current=el;el.playbackRate=rate;el.onplaying=()=>setPronouncing(true);el.onpause=()=>setPronouncing(false);el.onended=()=>setPronouncing(false);el.onerror=()=>setAudioError('La prononciation n’a pas pu être chargée. Réessayez.');void el.play().catch(()=>setAudioError('La prononciation n’a pas pu être chargée. Réessayez.'));}
    const structure=target.surah===1?FATIHA_STRUCTURE.find(s=>target.ayah>=s.from&&target.ayah<=s.to):null;
    if(error)return <div role="alert" className="fahm-card">{error}<button onClick={()=>{setError('');setVerse(null);setWordStatus('loading');setRetry(n=>n+1);}}>Réessayer</button></div>;
    if(!verse)return <p role="status" className="fahm-card">Chargement du verset {key}…</p>;
    return <>
        <article className="fahm-card fahm-verse-study">
            <div className="fahm-section-heading"><span className="fahm-eyebrow">CORAN · {key}</span><button onClick={()=>openReader({surah:target.surah,ayah:target.ayah,page:verse.ayah.page})}>Ouvrir le Mushaf ↗</button></div>
            <p className="fahm-study-arabic" lang="ar" dir="rtl">{words.length?words.map(word=><button key={word.key} aria-label={`Étudier le mot ${word.position} : ${word.text}`} aria-pressed={selected?.key===word.key} className={`${activeWord===word.position?'is-speaking':''} ${knownText.has(normalizeFahmWord(word.text))?'is-known':''}`} onClick={()=>{wordAudio.current?.pause();setSelected(word);}}>{word.text}</button>):verse.ayah.text}</p>
            {words.length>0&&<small>Touchez un mot pour son sens et sa prononciation. Les mots déjà étudiés sont soulignés.</small>}
            {wordStatus==='loading'&&<small role="status">Préparation du mot à mot…</small>}{wordStatus==='error'&&<p>Le mot à mot n’a pas pu être chargé. <button onClick={()=>{setWordStatus('loading');void fahmWords(verse).then(w=>{setWords(w);setWordStatus('ready');}).catch(()=>setWordStatus('error'));}}>Réessayer</button></p>}
            {selected&&<aside className="fahm-word-inline" aria-label="Sens et prononciation"><button aria-label="Fermer la fiche du mot" onClick={()=>{setSelected(null);wordAudio.current?.pause();}}><X size={18}/></button><strong dir="rtl" lang="ar">{selected.text}</strong><p>{selected.french||'Consultez la traduction complète pour le sens.'}</p>{selected.transliteration&&<small>{selected.transliteration}</small>}<button onClick={()=>pronounce(selected)} disabled={!selected.audio}><Volume2 size={17}/> {pronouncing?'Arrêter la prononciation':'Prononciation'}</button><small>Mot {selected.position} · {key} · <a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">Français : QUL</a></small><FahmWordContexts key={selected.key} word={selected}/></aside>}
            {discover&&!showTranslation&&<div className="fahm-discover"><h3>Essayez de comprendre</h3><p>Repérez les mots que vous connaissez. Ouvrez seulement les aides dont vous avez besoin.</p><button onClick={()=>setShowTranslation(true)}>Comparer avec la traduction</button></div>}
            {showTranslation&&<><p className="fahm-study-translation">{verse.translation||'Traduction indisponible. Réessayez avec une connexion.'}</p><small>Traduction du sens · Muhammad Hamidullah</small></>}
            {verse.phonetic&&<><button className="fahm-text-button" aria-expanded={showPhonetic} onClick={()=>setShowPhonetic(!showPhonetic)}>Phonétique {showPhonetic?'−':'+'}</button>{showPhonetic&&<p className="fahm-phonetic">{verse.phonetic}</p>}</>}
        </article>
        {showTranslation&&<FahmPhraseGroups target={target} words={words}/>}{showTranslation&&<GrammarExplorer key={key} verseKey={key} words={words}/>}
        {showTranslation&&structure&&<section className="fahm-card"><span className="fahm-eyebrow">LE FIL DU PASSAGE · 1:{structure.from}{structure.to!==structure.from?`–${structure.to}`:''}</span><h2>{structure.title}</h2><p>{structure.text}</p></section>}
        {showTranslation&&<section className="fahm-card"><span className="fahm-eyebrow">COMPRENDRE LE VERSET</span><h2>L’explication du passage</h2>{exegesisLoading?<p role="status">Chargement de l’exégèse…</p>:exegesis?<div className="fahm-exegesis" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(exegesis.text,{ALLOWED_TAGS:['p','br','sup','strong','em'],ALLOWED_ATTR:[]})}}/>:<p>L’explication n’a pas pu être chargée. <button onClick={()=>{setExegesisLoading(true);void fahmExplanation(target).then(v=>{setExegesis(v);setExegesisLoading(false);});}}>Réessayer</button></p>}<a href={sourceUrl(target)} target="_blank" rel="noreferrer">Al-Mokhtasar · Centre d’Exégèse pour les Études Coraniques · QuranEnc ↗</a><div className="fahm-row"><Link to={`/tafsir?surah=${target.surah}&ayah=${target.ayah}`}>Consulter les autres commentaires</Link></div></section>}
        {showTranslation&&<div ref={exerciseRef}>{exercise?<FahmExercises key={key} exerciseId={exerciseId} target={target} translation={verse.translation} words={words} explanation={exegesis?.text.replace(/<[^>]*>/g,'')||''} onComplete={onDone}/>:<button className="fahm-primary fahm-start-exercise" disabled={!verse.translation||wordStatus==='loading'} onClick={()=>{setExercise(true);setShowTranslation(true);setTimeout(()=>exerciseRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),0);}}>Vérifier ma compréhension →</button>}</div>}
        <footer className="fahm-audio" aria-label="Lecteur du passage"><button aria-label={playing?'Mettre en pause':'Écouter ce verset'} onClick={play}>{playing?<Pause size={20}/>:<Play size={20}/>}</button><span>{key}</span><label>Vitesse<select value={rate} onChange={e=>setRate(Number(e.target.value))}>{[.75,1,1.25].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><label>Répéter<select value={repeat} onChange={e=>setRepeat(Number(e.target.value))}>{[1,3,5].map(n=><option key={n} value={n}>{n}×</option>)}</select></label><audio ref={audio} preload="none" onPlaying={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>{const ms=e.currentTarget.currentTime*1000;setActiveWord((recitation&&e.currentTarget.currentSrc===recitation.url?recitation:null)?.timings.words.find(w=>ms>=w.timestampFrom&&ms<w.timestampTo)?.position||0);}} onEnded={()=>{if(count.current<repeat){count.current++;const el=audio.current!;el.currentTime=0;void el.play().catch(()=>setAudioError('L’écoute a été interrompue.'));}else{setPlaying(false);setActiveWord(0);useListeningEvidenceStore.getState().recordVerse(target.surah,target.ayah,'passage');}}} onError={()=>setAudioError('L’audio est indisponible. Réessayez avec une connexion.')}/>{audioError&&<small role="alert">{audioError}</small>}</footer>
    </>;
}
