import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';
import type { Ayah } from '../../../types';

export interface VerseSelection { ayah: Ayah; x: number; y: number }
/** Capture clicks before word handlers: releasing a hold or a scroll must never play audio. */
export function useVersePress(onHold: (selection: VerseSelection) => void, scope: number) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gesture = useRef<{x:number;y:number;id:number} | null>(null);
    const suppressClick = useRef(false);
    const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
    useEffect(() => () => { cancel(); gesture.current = null; }, [scope]);
    return (ayah: Ayah): HTMLAttributes<HTMLElement> => ({
        onPointerDown: e => {
            cancel();
            if (!e.isPrimary || e.button !== 0) return;
            suppressClick.current = false;
            if ((e.target as HTMLElement).closest('button,a,input,select')) return;
            const {clientX:x,clientY:y,pointerId:id} = e;
            gesture.current = {x,y,id};
            timer.current = setTimeout(() => {
                suppressClick.current = true;
                onHold({ayah,x,y});
            }, 500);
        },
        onPointerMove: e => {
            const start = gesture.current;
            if (start && (Math.hypot(e.clientX-start.x,e.clientY-start.y) > 10 || e.pointerId !== start.id)) {
                cancel(); suppressClick.current = true;
            }
        },
        onPointerUp: () => {cancel(); gesture.current = null;},
        onPointerCancel: () => {cancel(); gesture.current = null; suppressClick.current = true;},
        onPointerLeave: () => {cancel();},
        onClickCapture: e => { if (suppressClick.current) {e.preventDefault();e.stopPropagation();} },
        onContextMenu: e => {
            if ((e.target as HTMLElement).closest('button,a,input,select')) return;
            e.preventDefault(); cancel(); suppressClick.current = true;
            onHold({ayah,x:e.clientX,y:e.clientY});
        },
        onKeyDown: e => {
            if (e.target !== e.currentTarget) return;
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                onHold({ayah,x:rect.left+rect.width/2,y:rect.top});
            }
        },
    });
}
