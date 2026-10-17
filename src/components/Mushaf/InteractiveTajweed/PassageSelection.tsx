import type {MushafWord} from '../../../lib/interactiveMushaf/model';
export type WordRange={start:string;end:string;startPage?:number;endPage?:number};
export function selectedWords(words:MushafWord[],range:WordRange){
 const list=words.filter(w=>w.kind==='word'),a=list.findIndex(w=>w.key===range.start),b=list.findIndex(w=>w.key===range.end);
 return a<0||b<0?[]:list.slice(Math.min(a,b),Math.max(a,b)+1);
}
