import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {wordById} from '../../../data/quizGames';
import {normalizeFahmWord,validExamples} from '../../../lib/fahm/learning';
import {loadFahmVerse,fahmWords} from '../../../lib/fahm/content';
import {useAudioPlayerStore} from '../../../stores/audioPlayerStore';
/** Never guess a word's position from whitespace or play the next word as a fallback. */
export function WordReward({id}:{id:number}){
 const word=wordById(id),example=validExamples(word)[0];
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);const audio=useRef<HTMLAudioElement|null>(null),request=useRef(0);
 useEffect(()=>()=>{request.current++;audio.current?.pause();},[id]);
 const pronounce=async()=>{
  if(!example||busy)return;const ticket=++request.current;setBusy(true);setStatus('Préparation de la prononciation…');const timer=setTimeout(()=>{if(ticket===request.current){request.current++;setBusy(false);setStatus('Le chargement prend trop de temps. Réessaie avec une connexion.');}},12000);
  try{const verse=await loadFahmVerse(example);const words=await fahmWords(verse);const match=words.find(w=>normalizeFahmWord(w.text)===normalizeFahmWord(word.arabic));
   if(ticket!==request.current)return;
   if(!match?.audio){setStatus('La forme exacte n’est pas disponible en audio. Ouvre le verset pour l’écouter dans son contexte.');return;}
   window.dispatchEvent(new Event('quran-stop-playback'));useAudioPlayerStore.getState().stop();audio.current?.pause();audio.current=new Audio(match.audio);
   audio.current.onended=()=>{if(ticket===request.current)setStatus('Prononciation terminée.');};audio.current.onerror=()=>{if(ticket===request.current)setStatus('Audio indisponible. Réessaie avec une connexion.');};
   await audio.current.play();if(ticket===request.current)setStatus('Écoute le mot…');
  }catch{if(ticket===request.current)setStatus('Audio indisponible. Tu peux réessayer ou ouvrir le verset.');}finally{clearTimeout(timer);if(ticket===request.current)setBusy(false);}
 };
 return <aside className="qg-word-reward"><strong lang="ar" dir="rtl">{word.arabic}</strong><p>{word.transliteration} · {word.meaningFr}</p>{example?<><blockquote lang="ar" dir="rtl">{example.contextAr}</blockquote><p>{example.contextFr}</p><button onClick={()=>void pronounce()} disabled={busy}>🔊 {busy?'Préparation…':'Prononciation du mot'}</button><Link to={`/read?surah=${example.surah}&ayah=${example.ayah}`}>Lire et écouter le verset {example.surah}:{example.ayah} →</Link></>:<Link to="/vocab">Retrouver ce mot dans le lexique →</Link>}{status&&<p role="status">{status}</p>}</aside>;
}
