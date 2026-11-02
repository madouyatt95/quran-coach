import {useEffect,useState} from 'react';
import {Palette} from 'lucide-react';
import {RULES} from '../../../lib/interactiveMushaf/ruleLabels';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';

export function tajweedWordRules(word:MushafWord|null):string[]{
    if(!word||word.kind!=='word')return [];
    // The markup's letter/segment tags are authoritative. Never guess a rule from a glyph colour.
    return [...new Set(word.tajweedSegments.flatMap(s=>s.rule&&RULES[s.rule]?[s.rule]:[]))];
}
export function TajweedCompanion({word,verseKey,matched,enabled,onOpen}:{word:MushafWord|null;verseKey:string;matched:boolean;enabled:boolean;onOpen:()=>void}){
    const [hit,setHit]=useState<{word:MushafWord;rules:string[]}|null>(null);
    useEffect(()=>{
        const rules=tajweedWordRules(word);
        if(enabled&&matched&&word&&rules.length)setHit({word,rules});
    },[word,enabled,matched]);
    useEffect(()=>{if(!hit)return;const timer=setTimeout(()=>setHit(null),2800);return()=>clearTimeout(timer);},[hit]);
    if(!enabled||!matched||!hit||hit.word.verseKey!==verseKey)return null;
    return <button className="iq-tajweed-companion" onClick={onOpen} aria-label={`Règle rencontrée, ${hit.rules.map(r=>RULES[r]).join(', ')}. Ouvrir la légende Tajwid.`}><Palette size={15}/><span>{hit.rules.map(r=>RULES[r]).join(' · ')}</span><span lang="ar" dir="rtl">{hit.word.text}</span><small>{hit.word.verseKey}:{hit.word.position}</small></button>;
}
