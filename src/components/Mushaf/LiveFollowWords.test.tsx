// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { it, expect } from 'vitest';
import { LiveFollowWords, liveWordIndex } from './LiveFollowWords';
import { useLiveFollowStore } from '../../stores/liveFollowStore';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('aligns basmala and standalone pause signs without inventing a position',()=>{
 expect(liveWordIndex(['بسم','الله','الرحمن','الرحيم','قل','هو'],['قل','هو'],112,1,0)).toBe(4);
 expect(liveWordIndex(['الله','ۖ','لا'],['الله','لا'],2,255,1)).toBe(2);
 expect(liveWordIndex(['الله','لا'],['قل','هو'],2,255,1)).toBeNull();
 expect(liveWordIndex(['قل','هو'],['قل','هو'],112,1,2)).toBeNull();
});
it('moves the rendered highlight within one verse and clears it when tracking stops',async()=>{
 const div=document.createElement('div');document.body.append(div);const root=createRoot(div);
 const words=['قل','هو'];
 try {
  useLiveFollowStore.setState({active:true,passage:{surah:112,ayah:1},position:null});
  await act(async()=>root.render(<LiveFollowWords surah={112} ayah={1} words={words}>{words.map((w,i)=><span key={i} className="mih-word">{w}</span>)}</LiveFollowWords>));
  for(const wordIndex of [0,1]) {
   await act(async()=>useLiveFollowStore.setState({position:{surah:112,ayah:1,wordIndex,words}}));
   expect(div.querySelector('.mih-word--live')?.textContent).toBe(words[wordIndex]);
   expect(div.querySelectorAll('.mih-word--live')).toHaveLength(1);
  }
  await act(async()=>useLiveFollowStore.setState({active:false,passage:null,position:null}));
  expect(div.querySelector('.mih-word--live')).toBeNull();
 } finally {await act(async()=>root.unmount());div.remove();}
});
