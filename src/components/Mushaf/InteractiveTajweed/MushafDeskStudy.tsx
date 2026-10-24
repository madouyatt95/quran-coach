import {useEffect,useState,type ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {Pin,PinOff} from 'lucide-react';
import {fetchTafsir,type TafsirContent} from '../../../lib/tafsirApi';
import type {Ayah} from '../../../types';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
import type {PageFont,PaperTheme} from '../../../lib/interactiveMushaf/service';
export interface DeskStudySnapshot {verse:Ayah;translation:string;word:MushafWord|null;font:PageFont;paper:PaperTheme;page:number}
export function MushafDeskStudy({snapshot,renderWord,onListen}:{snapshot:DeskStudySnapshot|null;renderWord:(snapshot:DeskStudySnapshot,locked:boolean,onClose:()=>void)=>ReactNode;onListen:(verse:Ayah)=>void}){
 const [pinned,setPinned]=useState<DeskStudySnapshot|null>(null),[requested,setRequested]=useState(''),[tafsir,setTafsir]=useState<{key:string;value:TafsirContent|null}|null>(null),[attempt,setAttempt]=useState(0);
 const [dismissedWord,setDismissedWord]=useState('');
 const shown=pinned||snapshot,key=shown?`${shown.verse.surah}:${shown.verse.numberInSurah}`:'';
 useEffect(()=>{if(!requested||requested!==key||!shown)return;let live=true;void fetchTafsir('french_mokhtasar',shown.verse.surah,shown.verse.numberInSurah).then(value=>{if(live)setTafsir({key,value});}).catch(()=>{if(live)setTafsir({key,value:null});});return()=>{live=false;};},[requested,key,shown?.verse.surah,shown?.verse.numberInSurah,attempt]);
 if(!shown)return <p>Ouvrez la fiche d’un mot par un appui long pour étudier son sens et sa prononciation.</p>;
 const loading=requested===key&&tafsir?.key!==key;
 return <section className="iq-desk-study" aria-label="Étude du passage"><header><div><small>{pinned?'EXPLICATION ÉPINGLÉE':'VOTRE SÉLECTION'}</small><h3>Verset {key} · p. {shown.page}</h3></div><button aria-label={pinned?'Suivre la sélection':'Épingler cette explication'} aria-pressed={!!pinned} onClick={()=>{setPinned(pinned?null:shown);setDismissedWord('');}}>{pinned?<PinOff size={18}/>:<Pin size={18}/>}</button></header>
  {pinned&&<p className="iq-desk-pin-note">Cette explication reste affichée pendant votre lecture.<button onClick={()=>setPinned(null)}>Suivre la sélection</button></p>}
  {shown.word&&(!pinned||dismissedWord!==shown.word.key)&&renderWord(shown,!!pinned,()=>setDismissedWord(shown.word!.key))}
  <section className="iq-desk-verse"><p className="iq-verse-arabic" lang="ar" dir="rtl">{shown.verse.text}</p><p>{shown.translation||'La traduction de ce passage n’est pas encore disponible.'}</p><small>Traduction · Muhammad Hamidullah</small></section>
  <div className="pupitre-study-actions"><button onClick={()=>onListen(shown.verse)}>Écouter le verset</button><button disabled={loading} onClick={()=>{setRequested(key);if(tafsir?.key===key&&!tafsir.value){setTafsir(null);setAttempt(n=>n+1);}}}>{loading?'Ouverture…':tafsir?.key===key&&!tafsir.value?'Réessayer l’explication':'Expliquer ce verset'}</button><Link to={`/tafsir?surah=${shown.verse.surah}&ayah=${shown.verse.numberInSurah}`} state={{readerReturn:{to:`/read?page=${shown.page}`,label:'Retour au Mushaf'}}}>Ouvrir le Tafsir</Link></div>
  {requested===key&&tafsir?.key===key&&(tafsir.value?<section className="iq-desk-tafsir"><h4>{tafsir.value.resource_name}</h4><p>{new DOMParser().parseFromString(tafsir.value.text,'text/html').body.textContent}</p><small>Source · QuranEnc</small></section>:<p role="status">L’explication n’a pas pu être chargée. Réessayez avec une connexion.</p>)}
 </section>;
}
