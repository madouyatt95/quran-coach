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
it('keeps fitted Mushaf text centered after changing the upper reading area',()=>{
 const root=document.createElement('div');root.className='iq-framing-text iq-fit-width';root.innerHTML='<section class="pupitre-upper"><div class="iq-viewport"><span data-word-key="2:17:2">mot</span></div></section>';document.body.append(root);
 const viewport=root.querySelector<HTMLElement>('.iq-viewport')!,word=root.querySelector<HTMLElement>('span')!;
 Object.defineProperties(viewport,{clientWidth:{value:820},scrollWidth:{value:968}});
 viewport.getBoundingClientRect=()=>({top:52,left:0,bottom:440} as DOMRect);
 word.getBoundingClientRect=()=>({top:180,left:740} as DOMRect);
 restoreReadingAnchor(root,{attribute:'data-word-key',key:'2:17:2',offset:80,offsetX:320});
 expect(viewport.scrollLeft).toBe(74);expect(viewport.scrollTop).toBe(48);root.remove();
});
