import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useKhatmStore} from '../../../stores/khatmStore';
import {useQuranStore} from '../../../stores/quranStore';
import {useLiveFollowStore} from '../../../stores/liveFollowStore';
import {KhatmReadingTracker, MIN_KHATM_READING_MS} from '../../../lib/khatmReading';

export function useKhatmReading({page, ready, surah, ayah}: {page:number;ready:boolean;surah:number;ayah:number}) {
    const {pathname} = useLocation();
    const enabled = useKhatmStore(s => s.isActive && !s.completedAt);
    const jump = useQuranStore(s => s.khatmJumpSignal);
    const following = useLiveFollowStore(s => s.active);
    const [foreground,setForeground] = useState(()=>!document.hidden && document.hasFocus());
    const [obscured,setObscured] = useState(false);
    const tracker = useRef(new KhatmReadingTracker());
    useEffect(()=>{
        const update = () => {
            // Discard a partial visit whenever the app loses foreground, even before React renders.
            tracker.current.reset();
            setForeground(!document.hidden && document.hasFocus());
        };
        document.addEventListener('visibilitychange',update);
        window.addEventListener('blur',update);window.addEventListener('focus',update);
        return ()=>{document.removeEventListener('visibilitychange',update);window.removeEventListener('blur',update);window.removeEventListener('focus',update);tracker.current.reset();};
    },[]);
    useEffect(()=>{
        const update = () => {
            const blocked = !!document.querySelector('.khatm-popup, .mushaf-page-strip, .reading-bookmark-dialog[open], dialog[open], [aria-modal="true"]');
            if (blocked) tracker.current.reset();
            setObscured(blocked);
        };
        const observer = new MutationObserver(update);
        observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','aria-modal']});
        update();
        return ()=>observer.disconnect();
    },[]);
    useEffect(()=>{
        const observation = {page,ready,surah,ayah,jump,active:enabled && pathname === '/read' && foreground && !following && !obscured};
        const completed = tracker.current.observe(observation,performance.now());
        if (completed !== null) useKhatmStore.getState().validatePage(completed);
        const checkpoint = () => {
            if (!document.hidden && document.hasFocus() && tracker.current.qualified(observation,performance.now())) {
                useKhatmStore.getState().updateLastRead(surah,ayah,page);
            }
        };
        checkpoint();
        const timer = setTimeout(checkpoint,MIN_KHATM_READING_MS);
        return ()=>clearTimeout(timer);
    },[page,ready,surah,ayah,jump,enabled,pathname,foreground,following,obscured]);
}
