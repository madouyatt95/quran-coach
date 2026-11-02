import type {HTMLAttributes} from 'react';
/** Never reflow a tapped word before pointerup/click: waking expands the dock. */
export function readerWakeHandlers(wake:()=>void):HTMLAttributes<HTMLDivElement>{
 return {
  onPointerDownCapture:event=>{if(!(event.target as HTMLElement).closest('.iq-word'))wake();},
  onClickCapture:event=>{if((event.target as HTMLElement).closest('.iq-word'))wake();},
 };
}
