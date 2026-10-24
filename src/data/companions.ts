import {companionPortraits} from './companionPortraits';
export interface Hadith {arabic:string;translation:string;source:string}
export interface Timeline {birth:string;conversion:string;keyEvents:string[];death:string}
export interface Companion {
 id:string;nameAr:string;nameFr:string;nameEn:string;title:string;titleAr:string;icon:string;color:string;
 category:'ashara'|'sahabi'|'sahabiyyah';summary:string;timeline:Timeline;lessons:string[];hadiths:Hadith[];
 keyVerses?:{arabic:string;translation:string;reference:string}[];
}
const ashara=new Set(['abu-bakr','umar','uthman','ali','talha','zubayr','abdurrahman','saad','said','abu-ubayda']);
/** One reviewed portrait per person; former unsourced biographies are no longer served. */
export const companions:Companion[]=companionPortraits.map(p=>({
 id:p.id,nameAr:p.nameAr,nameFr:p.nameFr,nameEn:p.aliases,title:p.title,titleAr:'',
 icon:p.group==='women'?'🌿':p.theme==='knowledge'?'📖':'🕯️',color:p.theme==='knowledge'?'#a695ce':p.theme==='solidarity'?'#84b7a1':'#d4b77a',
 category:p.group==='women'?'sahabiyyah':ashara.has(p.id)?'ashara':'sahabi',
 summary:p.paragraphs.join('\n\n'),timeline:{birth:'',conversion:'',keyEvents:[],death:''},lessons:[],hadiths:[],
}));
