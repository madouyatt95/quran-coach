import {useState} from 'react';
import type {MushafWord} from '../../lib/interactiveMushaf/model';
import {FRENCH_SOURCE} from '../../lib/interactiveMushaf/french';
import {verifiedGroups,PHRASE_ROLES} from '../../lib/fahm/depth';
import {sourceUrl,type VerseTarget,verseKey} from '../../lib/fahm/learning';
export function FahmPhraseGroups({target,words}:{target:VerseTarget;words:MushafWord[]}){
 const [active,setActive]=useState(0);const key=verseKey(target),groups=verifiedGroups(key,words);if(!groups.length)return null;
 return <details className="fahm-card fahm-groups"><summary>Comprendre par groupes de sens</summary><p>Touchez une expression : son sens mot à mot s’éclaire juste en dessous.</p><div className="fahm-group-arabic" dir="rtl" lang="ar">{groups.map((g,i)=><button key={g.from} aria-pressed={i===active} onClick={()=>setActive(i)}>{words.slice(g.from-1,g.to).map(w=>w.text).join(' ')}</button>)}</div><div className="fahm-group-french">{groups.map((g,i)=><button key={g.from} aria-pressed={i===active} onClick={()=>setActive(i)}><small>Expression {i+1} · mots {g.from}–{g.to}</small>{words.slice(g.from-1,g.to).every(w=>w.french)?words.slice(g.from-1,g.to).map(w=>w.french).join(' · '):'Sens mot à mot indisponible pour cette expression.'}</button>)}</div><p aria-live="polite">{PHRASE_ROLES[key]?.[active]||'Relisez cette expression dans le verset complet, puis comparez avec l’explication du passage.'}</p><small>Les mots français suivent ici l’arabe. La traduction complète reste disponible au-dessus.</small><div className="fahm-row"><a href={FRENCH_SOURCE} target="_blank" rel="noreferrer">Mot à mot · QUL ↗</a><a href={sourceUrl(target)} target="_blank" rel="noreferrer">Explication · Al-Mokhtasar ↗</a></div></details>;
}
