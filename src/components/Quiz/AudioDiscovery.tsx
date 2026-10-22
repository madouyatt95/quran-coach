import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {fetchAyah,fetchSurahTranslation} from '../../lib/quranApi';
import type {LearningQuestion} from '../../lib/quizLearning';
import {AudioPlayer} from './AudioPlayer';
import {StudyAudio} from './QuizQuestionForm';

export function AudioDiscovery({question:q}:{question:LearningQuestion}){
 const [data,setData]=useState<{key:string;arabic:string;translation:string}|null>(null);
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const surah=q.verseRef?.surah,ayah=q.verseRef?.ayah,key=`${surah}:${ayah}`;
 useEffect(()=>{
  if(!surah||!ayah)return;
  let active=true;setFailed(false);const timeout=setTimeout(()=>{active=false;setFailed(true);},12000);
  void Promise.all([fetchAyah(surah,ayah),fetchSurahTranslation(surah,'fr')]).then(([verse,translations])=>{
   if(active){clearTimeout(timeout);const translation=translations.get(verse.number)||'';setData({key,arabic:verse.text,translation});setFailed(!translation);}
  }).catch(()=>{clearTimeout(timeout);if(active)setFailed(true);});
  return()=>{active=false;clearTimeout(timeout);};
 },[surah,ayah,key,attempt]);
 if(!q.verseRef)return null;
 const current=data?.key===key?data:null;
 return <section className="qx-audio-discovery"><h3>Le passage que tu viens d’écouter</h3>
 <p>Coran {surah}:{ayah} · Traduction française : Muhammad Hamidullah</p>
 {current?<><p className="qx-ar" lang="ar" dir="rtl">{current.arabic}</p><blockquote>{current.translation}</blockquote></>:!failed&&<p role="status">Chargement du passage…</p>}
 {failed&&<div role="status"><p>Le texte ou sa traduction n’a pas pu être chargé.</p><button onClick={()=>setAttempt(attempt+1)}>Réessayer le passage</button></div>}
 <h3>Réécouter le verset</h3>{q.audioUrl?<AudioPlayer url={q.audioUrl}/>:<StudyAudio target={q.verseRef}/>}
 <Link className="qx-text-link" to={`/read?surah=${surah}&ayah=${ayah}`}>📖 Ouvrir dans le Mushaf →</Link>
 </section>;
}
