import {useCallback,useEffect,useRef,useState} from 'react';
import {fetchVerseRecitation,wordRecitationStart,type WordRecitationStart} from '../../../lib/verseRecitation';
import {mushafReciter} from '../../../lib/quranApi';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';

/** Only the latest tap may start audio; leaving the page or stopping invalidates pending work. */
export function useWordPlayback(page:number,reciter:string,blocked:boolean,onStart:(word:MushafWord,start?:WordRecitationStart)=>void){
    const request=useRef(0),latest=useRef(onStart);latest.current=onStart;
    const [preparing,setPreparing]=useState(false),[notice,setNotice]=useState('');
    const cancel=useCallback(()=>{request.current++;setPreparing(false);setNotice('');},[]);
    useEffect(()=>{window.addEventListener('quran-stop-playback',cancel);return()=>window.removeEventListener('quran-stop-playback',cancel);},[cancel]);
    useEffect(()=>{request.current++;setPreparing(false);setNotice('');return()=>{request.current++;};},[page,reciter,blocked]);
    const play=async(word:MushafWord)=>{
        if(blocked)return;
        const id=++request.current;setPreparing(true);setNotice('');
        let start:WordRecitationStart|null=null;
        let timeout:ReturnType<typeof setTimeout>|undefined;
        try{if(word.kind==='word')start=wordRecitationStart(await Promise.race([fetchVerseRecitation(word.verseKey,mushafReciter(reciter).quranComId),new Promise<null>(resolve=>{timeout=setTimeout(()=>resolve(null),5000);})]),word.position);}catch{/* The complete verse is still available through the existing player. */}finally{if(timeout)clearTimeout(timeout);}
        if(id!==request.current)return;
        setPreparing(false);
        if(word.kind==='word'&&word.position>1&&!start)setNotice('Départ au début du verset : le repère de ce mot est indisponible pour cette voix.');
        latest.current(word,start??undefined);
    };
    return {play,cancel,preparing,notice};
}
