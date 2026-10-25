import {useEffect,type RefObject} from 'react';
import type {BookPassage} from '../lib/bookPassages';
import {useAudioLibraryStore} from '../stores/audioLibraryStore';
/** Observe the paragraph actually on screen. Scroll and playback never update the catalogue at frame rate. */
export function useBookReadingPoint(article:RefObject<HTMLElement|null>,bookId:string,version:string,chapterId:string,passages:BookPassage[],enabled:boolean){
 useEffect(()=>{
  const root=article.current;if(!root||!enabled||!version||!passages.length)return;
  let timer:ReturnType<typeof setTimeout>|undefined,active='',since=0;
  const inspect=()=>{
   if(document.visibilityState==='hidden')return;
   const upper=root.querySelector('.pupitre-upper'),split=root.querySelector('[data-pupitre-layout]:not([data-pupitre-layout="plain"])');
   const toolbar=root.querySelector('.pupitre-toolbar')?.getBoundingClientRect();
   const bounds=upper?.getBoundingClientRect(),recap=root.querySelector('.book-return-recap')?.getBoundingClientRect();
   const top=Math.max(split&&bounds?Math.max(0,bounds.top,toolbar?.bottom||0):90,recap&&recap.top<innerHeight?recap.bottom+8:0),bottom=split&&bounds?Math.min(innerHeight,bounds.bottom):innerHeight;
   const nodes=[...root.querySelectorAll<HTMLElement>('[data-book-passage]')];
   const node=nodes.find(el=>{const b=el.getBoundingClientRect();return b.bottom>top+60&&b.top<bottom-60&&b.height>0;});
   const id=node?.dataset.bookPassage;if(!id||id===active)return;
   const index=passages.findIndex(p=>p.id===id),prior=passages[index-1],now=Date.now();
   const saved=useAudioLibraryStore.getState().bookReadingPoints?.[bookId];
   const previousPassageId=prior?.id===active&&now-since>=4000?active:saved?.passageId===id&&saved.version===version?saved.previousPassageId:undefined;
   active=id;since=now;
   useAudioLibraryStore.getState().saveBookReadingPoint(bookId,{chapterId,passageId:id,version,updatedAt:now,...(previousPassageId?{previousPassageId}:{})});
  };
  const schedule=()=>{if(timer)clearTimeout(timer);timer=setTimeout(inspect,450);};
  // Capture scrolls in the window as well as nested pupitre panes.
  window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);schedule();
  return()=>{if(timer)clearTimeout(timer);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);};
 },[article,bookId,version,chapterId,passages,enabled]);
}
