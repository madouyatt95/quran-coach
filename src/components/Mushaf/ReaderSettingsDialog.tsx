import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './TextMushaf.css';

/** Shared reader settings shell: bounded scrolling, focus restoration and safe areas. */
export function ReaderSettingsDialog({ edition, children, onClose, title = 'Confort de lecture' }: {
    edition: string; children: ReactNode; onClose: () => void; title?: string;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const element = dialog.current;
        const previous = document.activeElement as HTMLElement | null;
        element?.showModal();
        return () => { element?.close(); previous?.focus({ preventScroll: true }); };
    }, []);
    return createPortal(<dialog ref={dialog} className="text-reader-settings" aria-label="Réglages de lecture"
        onCancel={onClose} onKeyDown={e => e.stopPropagation()}
        onClick={e => {
            if (e.target !== e.currentTarget) return;
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
        }}>
        <header><div><small>{edition}</small><h2>{title}</h2></div><button aria-label="Fermer les réglages" onClick={onClose}><X size={20}/></button></header>
        <div className="text-reader-settings__body">{children}</div>
        <footer><button onClick={onClose}>Reprendre la lecture</button></footer>
    </dialog>, document.body);
}
