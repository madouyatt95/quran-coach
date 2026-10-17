import chapters from '../lib/interactiveMushaf/chapters.json';
import {courseChapter} from './data/courseLibrary';

export type CourseReference = {kind:'verse';surah:number;ayah:number;end?:number} | {kind:'hadith';chapter:number};
export interface ReferencePart {text:string;reference?:CourseReference}
const aliases: [RegExp,number][] = [
 [/had[iî]th (?:de |des? )?Jibr[iî]l/giu,2],
 [/had[iî]th des intentions/giu,3],
 [/had[iî]th du croyant fort/giu,9],
 [/had[iî]th (?:des?|sur les) cinq piliers/giu,1],
];
export function verseReference(surah:number,ayah:number,end?:number):CourseReference|null {
 const chapter=chapters.find(chapter=>chapter.id===surah);
 return chapter&&Number.isInteger(ayah)&&ayah>=1&&ayah<=chapter.count&&(!end||end>=ayah&&end<=chapter.count)?{kind:'verse',surah,ayah,...(end?{end}:{})}:null;
}
export function referenceKey(ref:CourseReference){return ref.kind==='verse'?`quran:${ref.surah}:${ref.ayah}:${ref.end||ref.ayah}`:`hadith:${ref.chapter}`;}
export function referenceParts(text:string,moduleId?:string):ReferencePart[]{
 const matches:{start:number;end:number;reference:CourseReference}[]=[];
 const verse=/\b(?:Sourate\s+(\d{1,3})\s*,?\s*versets?\s+(\d{1,3})(?:\s*(?:[-–à]|et)\s*(\d{1,3}))?|(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)\b/giu;
 for(const match of text.matchAll(verse)){
  // “35 et 36” describes consecutive verses. A non-consecutive pair is two
  // references, not permission to include every verse between the numbers.
  const surah=Number(match[1]||match[4]),ayah=Number(match[2]||match[5]);
  const last=match[3]||match[6]?Number(match[3]||match[6]):undefined;
  if(last&&/\bet\b/i.test(match[0])&&last!==ayah+1){
   const separator=/\bet\b/i.exec(match[0])!;
   const first=verseReference(surah,ayah),second=verseReference(surah,last);
   if(first)matches.push({start:match.index!,end:match.index!+separator.index,reference:first});
   if(second)matches.push({start:match.index!+separator.index+separator[0].length,end:match.index!+match[0].length,reference:second});
   continue;
  }
  const ref=verseReference(surah,ayah,last);
  if(ref)matches.push({start:match.index!,end:match.index!+match[0].length,reference:ref});
 }
 for(const [regex,chapter] of aliases)for(const match of text.matchAll(regex))matches.push({start:match.index!,end:match.index!+match[0].length,reference:{kind:'hadith',chapter}});
 // A narrator alone does not identify a hadith (Ibn Masud occurs in several chapters).
 if(moduleId==='sabirin-hadith-8')for(const match of text.matchAll(/had[iî]th d[’']Ibn Mas[uû][’']?d/giu))matches.push({start:match.index!,end:match.index!+match[0].length,reference:{kind:'hadith',chapter:8}});
 const current=/^sabirin-hadith-(\d+)$/.exec(moduleId||'');
 if(current)for(const match of text.matchAll(/\b(?:ce (?:présent )?had[iî]th|le had[iî]th étudié)\b/giu))matches.push({start:match.index!,end:match.index!+match[0].length,reference:{kind:'hadith',chapter:Number(current[1])}});
 matches.sort((a,b)=>a.start-b.start||b.end-a.end);
 const parts:ReferencePart[]=[];let cursor=0;
 for(const match of matches){if(match.start<cursor)continue;if(match.start>cursor)parts.push({text:text.slice(cursor,match.start)});parts.push({text:text.slice(match.start,match.end),reference:match.reference});cursor=match.end;}
 if(cursor<text.length)parts.push({text:text.slice(cursor)});
 return parts;
}
export function chapterReferences(moduleId:string,texts:string[]=[]):CourseReference[]{
 const source=courseChapter(moduleId);if(!source)return[];
 const unique=new Map<string,CourseReference>();
 if(source.doc.subject==='hadith'){const ref:CourseReference={kind:'hadith',chapter:source.chapter.number};unique.set(referenceKey(ref),ref);}
 for(const text of [...texts,...source.pages.map(page=>page.text)])for(const part of referenceParts(text,moduleId))if(part.reference)unique.set(referenceKey(part.reference),part.reference);
 return [...unique.values()];
}
