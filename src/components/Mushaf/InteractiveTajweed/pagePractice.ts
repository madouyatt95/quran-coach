import type {MushafWord} from '../../../lib/interactiveMushaf/model';
export function revealPracticeWords(words:MushafWord[],selected:MushafWord,mode:'word'|'line',revealed:Set<string>){
    const next=new Set(revealed);
    for(const word of words)if(word.kind==='word'&&(mode==='line'?word.line===selected.line:word.key===selected.key))next.add(word.key);
    return next;
}
