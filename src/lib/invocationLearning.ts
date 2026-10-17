import {repeatPauseSeconds,type GapMode} from './invocationPractice';
import {humanInvocationByText} from './humanInvocationAudio';
import recordings from '../data/adhkarRecordingRanges.json';
import {allInvocations,normalizeInvocation,type Invocation} from './adhkarExperience';
interface Recording {duration:number;ranges:number[][]}
const ranges = recordings as Record<string,Recording>;
const exactText=(text:string)=>text.normalize('NFC').replace(/\s+/g,' ').trim();
const recordingByText = new Map<string,{id:number;recording:Recording}>();
for(const d of allInvocations) {
    if(!d.categoryId.startsWith('hisn_') || d.categoryId==='hisn_chap_27' || !ranges[d.id])continue;
    const key=exactText(d.arabic);
    if(!recordingByText.has(key))recordingByText.set(key,{id:d.id,recording:ranges[d.id]});
}
export function invocationRecording(d: Pick<Invocation,'arabic'>) {
    const human=humanInvocationByText(d.arabic);
    if(human)return human;
    const found=recordingByText.get(exactText(d.arabic));
    return found?{...found.recording,url:`${import.meta.env.BASE_URL}audio/hisn/dua_${found.id}.mp3`}:null;
}
export type RecallStage='read'|'clues'|'memory';
export function isRecallHidden(stage:RecallStage,index:number):boolean {
    return stage==='memory'||stage==='clues'&&index%3===1;
}
export function estimatedInvocationSeconds(d:Invocation,options:{gapMode?:GapMode;arabic:boolean;french:boolean;silence:boolean;gap:number;repeats:number;rate:number}) {
    const arabic=invocationRecording(d)?.duration??Math.max(4,d.arabic.trim().split(/\s+/).length/1.8);
    const french=Math.max(3,d.translation.trim().split(/\s+/).length/2.5);
    return Math.ceil(((options.arabic?arabic*options.repeats:0)+(options.french?french:0))/options.rate+(options.silence?repeatPauseSeconds(options.gapMode||'fixed',arabic,options.rate,options.gap):0)+2);
}
/** Complete entries only; never truncate a dua or change its prescribed count. */
export function timedInvocationSelection(pool:Invocation[],minutes:number,options:Parameters<typeof estimatedInvocationSeconds>[1]) {
    const budget=minutes*60,seen=new Set<string>(),items:Invocation[]=[];let seconds=0;
    for(const d of pool){const key=normalizeInvocation(d.arabic),duration=estimatedInvocationSeconds(d,options);if(seen.has(key)||seconds+duration>budget)continue;seen.add(key);items.push(d);seconds+=duration;}
    return {items,seconds};
}
