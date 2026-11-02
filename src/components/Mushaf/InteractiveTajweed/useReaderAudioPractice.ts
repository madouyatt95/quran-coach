import {useEffect,useRef,useState} from 'react';
import {fetchSurah,MUSHAF_RECITERS} from '../../../lib/quranApi';
import {abPassage,abProblem} from '../../../lib/readerAudioPractice';
import {pageForVerse} from '../../../lib/interactiveMushaf/model';
import type {ReaderAudioSession} from '../../../lib/readerAudioSession';
import type {Ayah} from '../../../types';
import type {MushafAudioState} from '../hooks/useMushafAudio';

interface Comparison {voices:string[];index:number;verses:Ayah[];waiting:boolean}
export function useReaderAudioPractice(audio:MushafAudioState,reciter:string,setReciter:(id:string)=>void,onStart:()=>void){
    const latest=useRef({audio,reciter,onStart,setReciter});latest.current={audio,reciter,onStart,setReciter};
    const [a,setA]=useState<ReaderAudioSession|null>(null),[b,setB]=useState<ReaderAudioSession|null>(null);
    const [repetitions,setRepetitions]=useState(3),[busy,setBusy]=useState(false),[error,setError]=useState('');
    const [comparison,setComparison]=useState<Comparison|null>(null);
    const abVerses=useRef<Ayah[]>([]);
    const request=useRef(0),alive=useRef(true),lastReciter=useRef(reciter);
    useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current++;};},[]);
    useEffect(()=>{if(lastReciter.current!==reciter){request.current++;setA(null);setB(null);setBusy(false);setError('');lastReciter.current=reciter;}},[reciter]);
    const cancel=()=>{request.current++;abVerses.current=[];setA(null);setB(null);setBusy(false);setError('');setComparison(null);};
    const markA=()=>{
        const point=latest.current.audio.snapshot();
        if(!point){setError('Lancez une récitation pour placer A.');return;}
        request.current++;abVerses.current=[];setComparison(null);setA(point);setB(null);setError('');
    };
    const markB=async()=>{
        const point=latest.current.audio.snapshot();
        if(!a||!point){setError('Lancez une récitation, puis placez A et B.');return;}
        const problem=abProblem(a,point);if(problem){setError(problem);return;}
        const id=++request.current;setBusy(true);setError('');
        try{
            const verses=a.verse.number===point.verse.number?[a.verse]:a.queue?.some(v=>v.number===point.verse.number)?a.queue:(await fetchSurah(a.verse.surah)).ayahs;
            if(!alive.current||id!==request.current)return;
            const passage=abPassage(a,point,verses.map(v=>({...v,page:pageForVerse(v.surah,v.numberInSurah)||v.page})));
            if(!passage)throw Error('Le passage entre A et B n’a pas pu être chargé.');
            latest.current.onStart();setComparison(null);
            if(!latest.current.audio.startPassageFromAyahs(passage.verses,repetitions,passage.cuts))throw Error('Ces repères ne peuvent pas être répétés.');
            abVerses.current=passage.verses;setB(point);
        }catch(e){if(alive.current&&id===request.current)setError(e instanceof Error?e.message:'Préparation impossible.');}
        finally{if(alive.current&&id===request.current)setBusy(false);}
    };
    const changeRepetitions=(count:number)=>{
        setRepetitions(count);
        if(a&&b){const passage=abPassage(a,b,abVerses.current);if(passage)latest.current.audio.startPassageFromAyahs(passage.verses,count,passage.cuts);}
    };
    const startComparison=(voices:string[],verses:Ayah[])=>{
        const valid=[...new Set(voices)].filter(id=>MUSHAF_RECITERS.some(r=>r.id===id));
        if(valid.length<2||!verses.length)return;
        cancel();latest.current.onStart();
        const waiting=valid[0]!==reciter;
        setComparison({voices:valid,index:0,verses:[...verses],waiting});
        if(waiting)setReciter(valid[0]);else audio.startPassageFromAyahs(verses,1);
    };
    // One audio element and one queue: voice changes never overlap, nor reuse another voice's timings.
    useEffect(()=>{
        if(!comparison)return;
        const wanted=comparison.voices[comparison.index];
        if(comparison.waiting){if(reciter===wanted){latest.current.audio.startPassageFromAyahs(comparison.verses,1);setComparison({...comparison,waiting:false});}return;}
        if(reciter!==wanted||!audio.passage){setComparison(null);return;}
        if(audio.passageComplete){
            if(comparison.index+1===comparison.voices.length){setComparison(null);return;}
            const index=comparison.index+1;setComparison({...comparison,index,waiting:true});latest.current.setReciter(comparison.voices[index]);
        }
    },[comparison,reciter,audio.passage,audio.passageComplete]);
    return {a,b,repetitions,busy,error,comparison,markA,markB,changeRepetitions,cancel,startComparison,keepVoice:()=>setComparison(null)};
}
export type ReaderAudioPractice=ReturnType<typeof useReaderAudioPractice>;
