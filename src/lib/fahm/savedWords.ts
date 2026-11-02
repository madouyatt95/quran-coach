import type {MushafWord} from '../interactiveMushaf/model';
import type {ReviewWord} from '../../stores/mushafStudyStore';
import type {RecallCheck} from './recall';

const meaningKey=(s:string)=>s.normalize('NFC').toLocaleLowerCase('fr').replace(/[.,;:!?«»()[\]’'\s]/g,'');
export function savedWordOptions(word:MushafWord,words:MushafWord[]):string[]{
    if(!word.french?.trim())return [];
    const unique=new Map<string,string>([[meaningKey(word.french),word.french]]);
    for(const other of words){if(other.kind!=='word'||!other.french?.trim())continue;const key=meaningKey(other.french);if(!unique.has(key))unique.set(key,other.french);if(unique.size===4)break;}
    // Stable per word: no moving choices when the learning store updates.
    return [...unique.values()].sort((a,b)=>a.localeCompare(b,'fr')).map((_,i,list)=>list[(i+word.position)%list.length]);
}
export function savedWordQueue(words:ReviewWord[],checks:Record<string,RecallCheck>,limit:number,now=Date.now()):ReviewWord[]{
    return words.filter(w=>!checks[`word:${w.key}`]||checks[`word:${w.key}`].due<=now).sort((a,b)=>(checks[`word:${a.key}`]?.due||0)-(checks[`word:${b.key}`]?.due||0)||a.addedAt-b.addedAt).slice(0,limit);
}
