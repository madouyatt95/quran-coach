import {fetchWithCache} from './apiCache';
import type {VerseWords} from './wordTimings';
export interface VerseRecitation {url:string;timings:VerseWords}
export interface WordRecitationStart {url:string;offset:number;timings:VerseWords}
export function parseVerseRecitation(data:unknown,key:string):VerseRecitation|null {
    const file=(data as {audio_files?:{verse_key:string;url:string;segments?:number[][]}[]})?.audio_files?.find(file=>file.verse_key===key);
    if(!file?.url)return null;
    const url=new URL(file.url,'https://verses.quran.com/');
    if(url.protocol!=='https:')return null;
    const words=(file.segments??[]).flatMap(segment=>{
        // The ayah API uses [index, word_position, from_ms, to_ms]; older records use triples.
        const [position,from,to]=segment.length===4?segment.slice(1):segment;
        if(![position,from,to].every(Number.isFinite)||!Number.isInteger(position)||position<1||from<0||to<=from)return [];
        return [{id:position,position,text:'',timestampFrom:from,timestampTo:to}];
    });
    return {url:url.href,timings:{verseKey:key,words}};
}
export async function fetchVerseRecitation(key:string,reciterId:number):Promise<VerseRecitation|null>{
    const data=await fetchWithCache<unknown>(`https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${key}?fields=segments`);
    return parseVerseRecitation(data,key);
}
export function wordRecitationStart(source:VerseRecitation|null,position:number):WordRecitationStart|null {
    const word=source?.timings.words.find(word=>word.position===position);
    return source&&word?{url:source.url,offset:word.timestampFrom/1000,timings:source.timings}:null;
}
