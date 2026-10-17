import {useEffect,useRef,useState} from 'react';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
import {fahmWords,loadFahmVerse,type FahmVerse} from '../../lib/fahm/content';
import {FAHM_MEANING} from '../../lib/fahm/meaning';
import {sourceUrl,verseKey,type VerseTarget} from '../../lib/fahm/learning';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {getAudioUrl} from '../../lib/quranApi';
import {useSettingsStore} from '../../stores/settingsStore';
import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
export function FahmListeningStudy({target,seenText,onRead,onDone}:{onDone:()=>void;target:VerseTarget;seenText:boolean;onRead:()=>void}){
 const learning=useFahmLearningStore(),key=verseKey(target),id=`listen:${key}`,draft=learning.listening[id];
 const [data,setData]=useState<{verse:FahmVerse;words:MushafWord[]}|null>(null),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[retry,setRetry]=useState(0);
 const markSeen=learning.listenDraft;
 useEffect(()=>{if(seenText)markSeen(id,{seenText:true});},[seenText,id,markSeen]);
 const audio=useRef<HTMLAudioElement>(null),reciter=useSettingsStore(s=>s.selectedReciter);
 useEffect(()=>{let gone=false;void loadFahmVerse(target).then(async verse=>{const words=await fahmWords(verse).catch(()=>[]);if(!gone)setData({verse,words});}).catch(()=>{if(!gone)setError('Le passage n’a pas pu être chargé.');});return()=>{gone=true;};},[target,retry]);
 useEffect(()=>{const stop=()=>audio.current?.pause();window.addEventListener('quran-stop-playback',stop);return()=>{window.removeEventListener('quran-stop-playback',stop);};},[]);
 const meaning=FAHM_MEANING[key],word=data?.words.find(w=>w.french&&w.audio);
 const options=meaning?.options||(word?[...new Set([word.french!,...data!.words.filter(w=>w.french).map(w=>w.french!)])].slice(0,3).sort((a,b)=>a.localeCompare(b)):[]);
 const answer=meaning?meaning.answer:options.indexOf(word?.french||'');
 const help=draft?.help||0,choice=draft?.choice??null,completed=!!draft?.completed;
 const patch=(p:Parameters<typeof learning.listenDraft>[1])=>learning.listenDraft(id,p);
 const play=()=>{const el=audio.current;if(!el)return;if(!el.paused){el.pause();return;}window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();if(el.ended)el.currentTime=0;void el.play().catch(()=>setError('L’audio n’a pas pu démarrer. Réessayez.'));};
 if(!data)return <section className="fahm-card"><p role="status">{error||'Préparation de l’écoute…'}</p>{error&&<button onClick={()=>{setError('');setRetry(n=>n+1);}}>Réessayer</button>}</section>;
 const canQuiz=!!meaning||options.length>1;
 return <section className="fahm-card fahm-listening"><span className="fahm-eyebrow">COMPRENDRE À L’ÉCOUTE · {key}</span><h2>{meaning?'Écouter le passage, retrouver son sens':'Écouter un mot du passage'}</h2><p>Écoutez jusqu’au bout avant de répondre. Les aides sont facultatives.</p><button className="fahm-listen-orb" onClick={play}>{playing?'Ⅱ Pause':draft?.heard?'↻ Réécouter':'▶ Écouter'}</button><audio ref={audio} src={meaning?getAudioUrl(reciter,data.verse.ayah.number):word?.audio||undefined} preload="none" onPlaying={()=>{setPlaying(true);setError('');}} onPause={()=>setPlaying(false)} onEnded={()=>{setPlaying(false);patch({heard:true});}} onError={()=>setError('Audio indisponible. Réessayez ou ouvrez le passage.')}/>{error&&<p role="alert">{error}</p>}
 {!completed&&<div className="fahm-row"><button onClick={()=>patch({help:Math.max(help,1) as 1|2})}>Aide 1 · Afficher l’arabe</button><button disabled={help<1} onClick={()=>patch({help:2})}>Aide 2 · Afficher le français</button></div>}
 {help>=1&&<p lang="ar" dir="rtl" className="fahm-study-arabic">{meaning?data.verse.ayah.text:word?.text}</p>}{help>=2&&<p>{meaning?data.verse.translation:word?.french}</p>}
 {canQuiz?<><h3>{meaning?.question||'Quel sens accompagne le mot entendu ?'}</h3><div className="fahm-choices">{options.map((text,i)=><button key={text} disabled={!draft?.heard||completed} aria-pressed={choice===i} onClick={()=>{const correct=i===answer;learning.check(id,target,correct,seenText||draft?.seenText||help>0||!!draft?.wrong);patch({choice:i,wrong:!correct||!!draft?.wrong,completed:correct});}}>{text}</button>)}</div>{choice!==null&&<p role="status">{choice===answer?'Oui. ':'À revoir. '}{meaning?.explanation||`Le mot entendu est associé à « ${word?.french} » dans le français mot à mot.`}</p>}</>:<p>L’exercice de sens n’est pas disponible pour ce passage. Vous pouvez l’étudier avec sa traduction.</p>}
 {completed&&<><p>{seenText||draft?.seenText||help>0||draft?.wrong?'Réponse obtenue avec aide : elle sera à retrouver lors d’une prochaine séance.':'Réponse retrouvée sans aide pendant cette écoute. Un rappel différé permettra de confirmer ce résultat.'}</p><button onClick={()=>patch({help:0,choice:null,heard:false,wrong:false,completed:false})}>Recommencer l’écoute</button><button className="fahm-primary" onClick={onDone}>Valider et continuer →</button></>}
 <div className="fahm-row"><button onClick={onRead}>Étudier le texte et son explication →</button><a href={sourceUrl(target)} target="_blank" rel="noreferrer">Source de l’explication ↗</a></div></section>;
}
