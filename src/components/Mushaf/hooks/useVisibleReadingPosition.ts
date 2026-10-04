import {useEffect, useRef, type RefObject} from 'react';
import {useQuranStore} from '../../../stores/quranStore';
import {useLiveFollowStore} from '../../../stores/liveFollowStore';

/** Select one verse at the reading line, including inline verses wrapping onto multiple lines. */
export function verseAtReadingLine(elements: Iterable<HTMLElement>, top: number, height: number): HTMLElement | null {
    const line=top+height*.35;
    let winner:HTMLElement|null=null, best=Infinity;
    for (const element of elements) {
        for (const rect of Array.from(element.getClientRects())) {
            if(rect.bottom<=top || rect.top>=top+height)continue;
            const distance=rect.top>line?rect.top-line:rect.bottom<line?line-rect.bottom:0;
            if(distance<best){best=distance;winner=element;}
        }
    }
    return winner;
}

export function useVisibleReadingPosition(containerRef:RefObject<HTMLDivElement|null>, surah:number, renderedCount:number, loading:boolean, silent:RefObject<boolean>) {
    const scrolled = useRef(false);
    useEffect(()=>{scrolled.current=false;},[surah,loading]);
    useEffect(()=>{
        const container=containerRef.current;
        if(!container || loading)return;
        let frame=0;
        const intent=(event:Event)=>{
            if(event instanceof KeyboardEvent && !["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key))return;
            scrolled.current=true;silent.current=false;
        };
        const visible=new Set<HTMLElement>();
        const update=()=>{
            frame=0;
            if(!scrolled.current || silent.current || sessionStorage.getItem('isSilentJump') || useLiveFollowStore.getState().active)return;
            const bounds=container.getBoundingClientRect();
            // DOM order resolves verses sharing one line consistently, independent of observer delivery order.
            const candidates=Array.from(container.querySelectorAll<HTMLElement>('.mih-ayah')).filter(el=>visible.has(el) && Number(el.dataset.surah)===surah);
            const winner=verseAtReadingLine(candidates,bounds.top,bounds.height);
            if(!winner)return;
            const page=Number(winner.dataset.page), ayah=Number(winner.dataset.ayah);
            const state=useQuranStore.getState();
            if(state.currentSurah!==surah || !page || !ayah)return;
            if(page!==state.currentPage || ayah!==state.currentAyah){
                useQuranStore.setState({currentPage:page,currentAyah:ayah});
                useQuranStore.getState().updateProgress();
            }
        };
        const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
        const observer=new IntersectionObserver(entries=>{
            for(const entry of entries){const el=entry.target as HTMLElement;if(entry.isIntersecting)visible.add(el);else visible.delete(el);}
            schedule();
        },{root:container,threshold:0});
        container.querySelectorAll<HTMLElement>('.mih-ayah').forEach(el=>observer.observe(el));
        container.addEventListener('scroll',schedule,{passive:true});
        for(const name of ['wheel','touchmove','keydown'])container.addEventListener(name,intent,{passive:true});
        window.addEventListener('resize',schedule);
        return ()=>{for(const name of ['wheel','touchmove','keydown'])container.removeEventListener(name,intent);observer.disconnect();cancelAnimationFrame(frame);container.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
    },[containerRef,surah,renderedCount,loading,silent]);
}
