import type {VerseWords} from '../../../lib/wordTimings';
export interface MeaningCaption {text:string;from:number;to:number;first:number;last:number}
/** QUL French word references + timestamps of the exact audio source. No alignment of Hamidullah prose is inferred. */
export function meaningCaptions(key:string,values:Record<string,string>,timings:VerseWords|undefined,width:number,measure:(value:string)=>number):MeaningCaption[]{
    if(!timings||timings.verseKey!==key||!timings.words.length)return [];
    const words=timings.words;
    if(values[`${key}:${words.length+1}`])return []; // incomplete timing coverage
    if(words.some((w,i)=>w.position!==i+1||!values[`${key}:${w.position}`]?.trim()||!Number.isFinite(w.timestampFrom)||!Number.isFinite(w.timestampTo)||w.timestampFrom<0||w.timestampTo<=w.timestampFrom||(i>0&&w.timestampFrom<words[i-1].timestampFrom)))return [];
    const fits=(text:string)=>{let lines=1,line='';for(const token of text.split(/\s+/u)){const next=line?`${line} ${token}`:token;if(line&&measure(next)>width){lines++;line=token;}else line=next;}return lines<=2;};
    const groups:MeaningCaption[]=[];
    for(const w of words){const text=values[`${key}:${w.position}`].trim(),last=groups.at(-1);
        if(last&&last.last-last.first<2&&!/[.;!?]$/.test(last.text)&&fits(`${last.text} ${text}`)){last.text+=` ${text}`;last.to=w.timestampTo;last.last=w.position;}
        else groups.push({text,from:w.timestampFrom,to:w.timestampTo,first:w.position,last:w.position});
    }
    return groups;
}
export function meaningCaptionIndex(groups:MeaningCaption[],seconds:number):number{
    const time=Math.max(0,Number.isFinite(seconds)?seconds:0)*1000;
    // Retain the preceding meaning during a reciter's pause; seek backwards is deterministic.
    for(let i=groups.length-1;i>=0;i--)if(time>=groups[i].from)return i;
    return 0;
}
