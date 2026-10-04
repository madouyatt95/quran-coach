import { useEffect, useRef } from 'react';

/** Focus stays in an open modal and returns to the control that opened it. */
export function useDialogFocus(onDismiss: () => void, open = true) {
    const ref = useRef<HTMLDivElement>(null);
    const dismiss = useRef(onDismiss);
    useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement as HTMLElement | null;
        const controls = () => [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ?? [])];
        (controls()[0] ?? ref.current)?.focus();
        const keydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss.current(); }
            if (event.key !== 'Tab') return;
            const buttons = controls(), first = buttons[0], last = buttons.at(-1);
            if (!first) { event.preventDefault(); ref.current?.focus(); return; }
            if (event.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) {event.preventDefault();last?.focus();}
            else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) {event.preventDefault();first.focus();}
        };
        document.addEventListener('keydown', keydown, true);
        return () => { document.removeEventListener('keydown', keydown, true); if (previous?.isConnected) previous.focus(); };
    }, [open]);
    return ref;
}
