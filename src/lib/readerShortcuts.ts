export type ReaderShortcut='next'|'previous'|'toggle';
export function readerShortcut(event:KeyboardEvent,blocked:boolean):ReaderShortcut|null {
    if(blocked||event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return null;
    const target=event.target instanceof Element?event.target:null;
    if(target?.closest('input,textarea,select,button,a,summary,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="slider"],[role="tab"]'))return null;
    if(event.key==='ArrowLeft'||event.key==='PageDown')return 'next';
    if(event.key==='ArrowRight'||event.key==='PageUp')return 'previous';
    if(event.key===' '||event.code==='Space')return 'toggle';
    return null;
}
