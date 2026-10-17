import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {contextReferences} from '../../lib/fahm/depth';
import {fahmWords,loadFahmVerse,type FahmVerse} from '../../lib/fahm/content';
import {normalizeFahmWord,verseKey,type VerseTarget} from '../../lib/fahm/learning';
import {useFahmLearningStore} from '../../stores/fahmLearningStore';
export function FahmWordContexts({word}:{word:MushafWord}){
 const refs=contextReferences(word),[selected,setSelected]=useState<VerseTarget|null>(null);
 if(!refs.length)return null;
 return <section className="fahm-contexts"><h3>Le reconnaître ailleurs</h3><p>Retrouvez ce même mot dans un autre verset.</p><div className="fahm-row">{refs.map(ref=><button key={verseKey(ref)} aria-pressed={selected&&verseKey(selected)===verseKey(ref)||false} onClick={()=>setSelected(ref)}>Coran {verseKey(ref)}</button>)}</div>{selected&&<ContextChallenge key={`${word.key}-${verseKey(selected)}`} word={word} target={selected}/>}</section>;
}
function ContextChallenge({word,target}:{word:MushafWord;target:VerseTarget}){
 const [data,setData]=useState<{verse:FahmVerse;words:MushafWord[]}|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const learning=useFahmLearningStore(),id=`transfer:${word.key}:${verseKey(target)}`,draft=learning.drafts[id],choice=draft?.choice;
 useEffect(()=>{let gone=false;void loadFahmVerse(target).then(async verse=>{const words=await fahmWords(verse);if(!words.some(w=>normalizeFahmWord(w.text)===normalizeFahmWord(word.text)))throw Error();if(!gone)setData({verse,words});}).catch(()=>{if(!gone)setError('Ce rapprochement n’a pas pu être vérifié.');});return()=>{gone=true;};},[target,word.text,retry]);
 if(error)return <p role="status">{error} <button onClick={()=>{setError('');setRetry(n=>n+1);}}>Réessayer</button></p>;
 if(!data)return <p role="status">Vérification du passage…</p>;
 const correct=!!choice&&data.words.some(w=>w.key===choice&&normalizeFahmWord(w.text)===normalizeFahmWord(word.text));
 return <div><p>Touchez <strong lang="ar" dir="rtl">{word.text}</strong> dans ce passage.</p><p className="fahm-study-arabic" dir="rtl" lang="ar">{data.words.map(w=><button key={w.key} disabled={correct} aria-pressed={choice===w.key} onClick={()=>{const right=normalizeFahmWord(w.text)===normalizeFahmWord(word.text);learning.check(id,target,right,!!choice);learning.draft(id,{choice:w.key});}}>{w.text}</button>)}</p>{choice&&<p role="status">{correct?'Vous avez retrouvé le mot dans ce nouveau contexte.':'Ce n’est pas le même mot. Observez sa forme complète et réessayez.'}</p>}{correct&&<><p>{data.verse.translation}</p><small>Même forme écrite ; le contexte reste nécessaire pour comprendre son emploi.</small><Link to={`/fahm?surah=${target.surah}&ayah=${target.ayah}`}>Étudier ce passage →</Link><button onClick={()=>learning.draft(id,{choice:null})}>Recommencer le repérage</button></>}</div>;
}
