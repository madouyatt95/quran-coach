import data from './sarf.json';
export interface SarfWord {word:string;meaning:string;phonetic:string;radicals:number[]}
export interface SarfForm extends SarfWord {id:string;aspect:string;voice:string;person:string}
export interface SarfFamily {id:string;root:string;title:string;source:string;forms:SarfForm[];participles:(SarfWord&{pattern:string})[]}
export const SARF_FAMILIES:SarfFamily[]=data;
export const PERSONS=[{id:'i',label:'Je · أَنَا'},{id:'you',label:'Tu (masc.) · أَنْتَ'},{id:'he',label:'Il / cela · هُوَ'},{id:'we',label:'Nous · نَحْنُ'}];
export const wordSegments=(word:string)=>word.match(/\p{L}\p{M}*/gu)||[];
export const sarfPattern=(word:SarfWord)=>wordSegments(word.word).map((s,i)=>{const radical=word.radicals.indexOf(i);return radical<0?s:['ف','ع','ل'][radical]+s.slice(1);}).join('');
export function selectSarfForm(family:SarfFamily,aspect:string,voice:string,person:string){return family.forms.find(f=>f.aspect===aspect&&f.voice===voice&&f.person===person);}
