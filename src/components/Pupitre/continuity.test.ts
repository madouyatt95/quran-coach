// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {captureReadingAnchor,restoreReadingAnchor} from './usePupitreContinuity';
it('restores the same semantic passage after responsive reflow, not the old pixel position',()=>{
 const root=document.createElement('div');root.innerHTML='<section class="pupitre-upper"><p data-book-passage="chapter:scene:2">Passage</p></section>';document.body.append(root);
 const upper=root.firstElementChild as HTMLElement,passage=upper.firstElementChild as HTMLElement;
 let top=100,content=200;upper.style.display='block';upper.scrollTop=120;
 upper.getBoundingClientRect=()=>({top,bottom:top+300,height:300,left:0,right:600,width:600} as DOMRect);
 passage.getBoundingClientRect=()=>({top:top+content-upper.scrollTop,bottom:top+content-upper.scrollTop+60,height:60,left:0,right:600,width:600} as DOMRect);
 const anchor=captureReadingAnchor(root);expect(anchor?.key).toBe('chapter:scene:2');expect(anchor?.offset).toBe(80);
 top=0;content=500;expect(restoreReadingAnchor(root,anchor)).toBe(true);expect(upper.scrollTop).toBe(420);expect(passage.getBoundingClientRect().top).toBe(80);
 passage.dataset.bookPassage='other-chapter';expect(restoreReadingAnchor(root,anchor)).toBe(false);root.remove();
});
