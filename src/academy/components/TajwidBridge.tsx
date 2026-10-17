import {useAudioPlayerStore} from '../../stores/audioPlayerStore';
import {useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {TAJWEED_RULES} from '../data/tajweed-rules';
import {loadInteractivePage} from '../../lib/interactiveMushaf/service';
import {pageForVerse,type MushafWord} from '../../lib/interactiveMushaf/model';
import {fetchAyahAudioUrl} from '../../lib/quranApi';
import {playMediaClip} from '../../lib/mediaPlayback';
import {useRef} from 'react';
const REFERENCES=['4:123','2:25','2:27','61:14','112:1','2:11','2:6'];
export function TajwidBridge({moduleId}:{moduleId:string}){
 const [rule,setRule]=useState(0),[words,setWords]=useState<MushafWord[]>([]),[error,setError]=useState(''),[playing,setPlaying]=useState(false);const control=useRef<AbortController|null>(null);const navigate=useNavigate();const ref=REFERENCES[rule];
 const stop=()=>{control.current?.abort();setPlaying(false);};
 useEffect(()=>{let active=true;loadInteractivePage(pageForVerse(Number(ref.split(':')[0]),Number(ref.split(':')[1]))!).then(p=>{if(active)setWords(p.words.filter(w=>w.verseKey===ref&&w.kind==='word'));}).catch(()=>{if(active)setError('L’exemple n’a pas pu être chargé.');});return()=>{active=false;control.current?.abort();};},[ref]);
 useEffect(()=>{window.addEventListener('quran-stop-playback',stop);return()=>window.removeEventListener('quran-stop-playback',stop);},[]);
 const listen=async()=>{window.dispatchEvent(new Event('quran-stop-playback'));const player=useAudioPlayerStore.getState();if(player.isPlaying||player.isLoading)player.togglePlay();const c=new AbortController();control.current=c;setPlaying(true);const [s,a]=ref.split(':').map(Number);try{const url=await fetchAyahAudioUrl(s,a);if(c.signal.aborted)return;if(!url||!await playMediaClip(new Audio(),url,{signal:c.signal}))if(!c.signal.aborted)setError('Lecture indisponible.');}catch{if(!c.signal.aborted)setError('Lecture indisponible.');}finally{if(!c.signal.aborted)setPlaying(false);}};
 return <section className="academy-interaction"><h3>📖 Retrouver la règle dans le Coran</h3><select aria-label="Règle à pratiquer" value={rule} onChange={e=>{stop();setWords([]);setError('');setRule(Number(e.target.value));}}>{TAJWEED_RULES.map((r,n)=><option value={n} key={r.id}>{r.name}</option>)}</select><p>{TAJWEED_RULES[rule].howTo}</p><div className="academy-pronunciation" dir="rtl" lang="ar">{words.map(w=><span key={w.key}>{w.tajweedSegments.map((s,n)=><span key={n} style={s.rule?{color:'#d5ab58',textDecoration:'underline'}:{}}>{s.text}</span>)}{' '}</span>)}</div><p>Coran {ref} · les segments Tajwid transmis par les données du lecteur sont soulignés.</p>{error&&<p role="alert">{error}</p>}<button onClick={()=>playing?stop():void listen()}>{playing?'Arrêter':'Écouter le verset'}</button><button onClick={()=>{stop();const [surah,ayah]=ref.split(':');navigate(`/read?surah=${surah}&ayah=${ayah}`,{state:{readerReturn:{to:`/academy?module=${moduleId}`,label:'Retour à ma leçon'}}});}}>Pratiquer dans le Mushaf →</button></section>;
}
