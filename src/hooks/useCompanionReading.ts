import { fetchPage } from '../lib/quranApi';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CompanionReadingClock } from '../lib/companion';
import { useCompanionStore, useCompanionRuntimeStore } from '../stores/companionStore';
import { useQuranStore } from '../stores/quranStore';
import { useLiveFollowStore } from '../stores/liveFollowStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
export function useCompanionReading({page,surah,ayah,ready,continuousText=false}:{page:number;surah:number;ayah:number;ready:boolean;continuousText?:boolean}) {
    const {pathname}=useLocation();
    const jump=useQuranStore(s=>s.khatmJumpSignal);
    const clock=useRef(new CompanionReadingClock());
    useEffect(()=>{
        const tick=()=>{
            const now=Date.now(),s=useCompanionStore.getState(),runtime=useCompanionRuntimeStore.getState();
            const blocked=!!document.querySelector('[aria-modal="true"],dialog[open],.mushaf-page-strip,.search-modal,.side-menu,.khatm-popup,.coach-nudge-overlay');
            const active=pathname==='/read' && ready && !document.hidden && !blocked && !useLiveFollowStore.getState().active && !Object.values(runtime.busy).some(Boolean) && !useAudioPlayerStore.getState().isPlaying && now-runtime.lastInteraction<90000;
            if(active)runtime.addActive(1000);
            if(clock.current.observe(`${surah}:${ayah}:${page}`,jump,active,now,continuousText?4000:15000)){
                s.record({page,surah,ayah:continuousText?ayah:0},now);
                if(!continuousText)void fetchPage(page).then(verses=>{for(const v of verses)useCompanionStore.getState().record({page,surah:v.surah,ayah:v.numberInSurah},now);}).catch(()=>{});
            }
        };
        clock.current=new CompanionReadingClock();
        const hide=()=>{clock.current=new CompanionReadingClock();};
        document.addEventListener('visibilitychange',hide);
        const interval=setInterval(tick,1000);
        return ()=>{clearInterval(interval);document.removeEventListener('visibilitychange',hide);};
    },[page,surah,ayah,ready,continuousText,jump,pathname]);
}
