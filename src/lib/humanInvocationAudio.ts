import entries from '../data/invocationHumanAudio.json';
export interface HumanInvocationAudio {
    url:string;duration:number;ranges:number[][];arabic:string;sourceArabic:string;source:string;reciter:string;audioNote?:string;
}
const recordings=entries as Record<string,HumanInvocationAudio>;
export function humanInvocationAudio(category:string,id:number):HumanInvocationAudio|null {
    return recordings[`${category}:${id}`]??null;
}
const textIndex=new Map(Object.values(recordings).map(recording=>[recording.arabic,recording]));
export function humanInvocationByText(arabic:string):HumanInvocationAudio|null {
    return textIndex.get(arabic)??null;
}
