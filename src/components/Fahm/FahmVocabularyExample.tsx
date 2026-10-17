import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import type {QuranWord} from '../../data/quranVocabulary';
import {exactVocabulary,validExamples} from '../../lib/fahm/learning';
import {loadFahmVerse,type FahmVerse} from '../../lib/fahm/content';
/** Display only an actual source verse containing the exact lexical form. */
export function FahmVocabularyExample({word}:{word:QuranWord}){
 const [verse,setVerse]=useState<FahmVerse|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{let gone=false;const example=validExamples(word)[0];if(!example)return;void loadFahmVerse({surah:example.surah,ayah:example.ayah}).then(v=>{if(!gone&&exactVocabulary(v.ayah.text,[word]).length)setVerse(v);}).catch(()=>{}).finally(()=>{if(!gone)setLoading(false);});return()=>{gone=true;};},[word]);
 if(!validExamples(word).length)return null;
 if(!verse)return loading?<small>Chargement de l’exemple…</small>:null;
 return <div className="vocab-flashcard__example"><div className="vocab-flashcard__example-ar" dir="rtl" lang="ar">{verse.ayah.text}</div><div className="vocab-flashcard__example-fr">{verse.translation}</div><Link to={`/fahm?surah=${verse.ayah.surah}&ayah=${verse.ayah.numberInSurah}`} onClick={e=>e.stopPropagation()}>Étudier {verse.ayah.surah}:{verse.ayah.numberInSurah} →</Link><small>Traduction : Muhammad Hamidullah</small></div>;
}
