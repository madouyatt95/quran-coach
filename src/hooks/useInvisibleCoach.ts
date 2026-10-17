import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useInvisibleCoachStore, type Intervention } from '../stores/invisibleCoachStore';
import { useQuranStore } from '../stores/quranStore';
import { useStatsStore } from '../stores/statsStore';
import { useCompanionStore, useCompanionRuntimeStore } from '../stores/companionStore';
import { useSmartStore } from '../stores/smartStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useLiveFollowStore } from '../stores/liveFollowStore';
import { useQuizStore } from '../stores/quizStore';
import { evaluateAllTriggers, type ReadingContext, type UserContext } from '../lib/invisibleCoachEngine';
import { useSettingsStore } from '../stores/settingsStore';
import { useReaderCoachStore } from '../stores/readerCoachStore';
import { localDay } from '../lib/learning';
const SURAH_AYAH_COUNTS = [
    7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
    112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,
    89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,
    12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,
    30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];
export function useInvisibleCoach() {
    const [activeIntervention,setActiveIntervention]=useState<{scope:string;item:Intervention}|null>(null);
    const {pathname}=useLocation();
    const enabled=useInvisibleCoachStore(s=>s.enabled);
    const scope=`${pathname}:${enabled}`;
    const currentIntervention=activeIntervention?.scope===scope?activeIntervention.item:null;
    useEffect(()=>{
        useInvisibleCoachStore.getState().resetSession();
        const touch=()=>useCompanionRuntimeStore.getState().touch();
        window.addEventListener('pointerdown',touch,{passive:true});window.addEventListener('keydown',touch);window.addEventListener('scroll',touch,{capture:true,passive:true});
        return()=>{window.removeEventListener('pointerdown',touch);window.removeEventListener('keydown',touch);window.removeEventListener('scroll',touch,true);};
    },[]);
    useEffect(()=>{
        const evaluate=()=>{
            const store=useInvisibleCoachStore.getState(),c=useCompanionStore.getState(),runtime=useCompanionRuntimeStore.getState(),q=useQuranStore.getState(),stats=useStatsStore.getState(),now=Date.now();
            const blocked=document.hidden || Object.values(runtime.busy).some(Boolean) || !store.enabled || useAudioPlayerStore.getState().isPlaying || useLiveFollowStore.getState().active || pathname!=='/read' || !!document.querySelector('[aria-modal="true"]:not(.coach-celebration),dialog[open],.coach-overlay,.mushaf-page-strip,.search-modal,.side-menu,.khatm-popup');
            if(blocked){setActiveIntervention(null);return;}
            if(currentIntervention || now-runtime.lastInteraction<12000 || !store.canShowIntervention())return;
            const interactive=useSettingsStore.getState().viewMode==='tajweed-interactive';
            const today=localDay(),evidence=c.evidence.filter(e=>e.day===today),last=interactive?[...evidence].reverse().find(e=>e.page===q.currentPage):evidence[evidence.length-1];
            if(!last || now-last.at>3*60000 || (!interactive&&(last.surah!==q.currentSurah || last.ayah!==q.currentAyah)))return;
            const count=SURAH_AYAH_COUNTS[q.currentSurah-1] || 0;
            const verses=new Set(c.evidence.filter(e=>e.surah===q.currentSurah && e.ayah>0).map(e=>e.ayah));
            const reading:ReadingContext={currentSurah:q.currentSurah,currentAyah:q.currentAyah,currentPage:q.currentPage,totalAyahsInSurah:count,sessionStartTime:now-runtime.activeMs,pagesReadThisSession:new Set(evidence.map(e=>e.page)).size,completedSurah:count>0 && Array.from({length:count},(_,i)=>i+1).every(n=>verses.has(n))};
            const pageVisitCount:Record<number,number>={};
            for(const page of new Set(c.evidence.map(e=>e.page)))pageVisitCount[page]=new Set(c.evidence.filter(e=>e.page===page).map(e=>e.day)).size;
            const game=useQuizStore.getState().gameHistory[0];
            const user:UserContext={readingStreak:stats.readingStreak,todayPagesRead:stats.lastReadDate===today?stats.todayPagesRead:0,totalPagesRead:stats.totalPagesRead,lastSessionDate:stats.lastReadDate,totalJuzCompleted:0,lastQuizTheme:game?.theme || null,lastQuizScore:game?.total?Math.round(game.correct/game.total*100):null,nextPrayerName:null,nextPrayerMinutes:null,pageVisitCount};
            // Shared home recommendations own these topics; no competing toast on the home page.
            const triggers={...store.enabledTriggers,milestone:false,comeback:false,quiz_weak:false,streak_danger:false,prayer_prep:false};
            const candidate=evaluateAllTriggers(reading,user,triggers,store.isTriggerOnCooldown);
            if(!candidate || c.muted.includes(candidate.trigger))return;
            const key=`${candidate.trigger}:${candidate.trigger==='surah_complete'?q.currentSurah:q.currentPage}:${today}`;
            if(c.done[key] || c.later[key]>now)return;
            // A passive prompt stays compact. Larger presentations are reserved for verified milestones.
            const intervention={...candidate,id:key,level:candidate.level==='celebration'?'celebration' as const:'whisper' as const};
            if(candidate.trigger==='surah_complete')c.complete(key);
            if(useSmartStore.getState().globalEnabled && candidate.trigger==='prayer_prep')return;
            store.recordShown(intervention);
            if(interactive){useReaderCoachStore.getState().enqueue({...intervention,at:now,surah:q.currentSurah,ayah:q.currentAyah,page:q.currentPage});return;}
            setActiveIntervention({scope,item:intervention});
        };
        const timer=setInterval(evaluate,2000);return()=>clearInterval(timer);
    },[pathname,currentIntervention,scope]);
    const close=useCallback((reason:'dismiss'|'expire'|'action')=>{
        if(currentIntervention){const store=useInvisibleCoachStore.getState();if(reason==='dismiss')store.recordDismiss(currentIntervention.id);if(reason==='action')store.recordAction(currentIntervention.id);if(reason!=='expire')useCompanionStore.getState().complete(currentIntervention.id);}
        setActiveIntervention(null);
    },[currentIntervention]);
    return {currentIntervention,dismiss:useCallback(()=>close('dismiss'),[close]),expire:useCallback(()=>close('expire'),[close]),action:useCallback(()=>close('action'),[close]),snooze:useCallback((minutes:number)=>{useInvisibleCoachStore.getState().snooze(minutes);setActiveIntervention(null);},[])};
}
