// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {it,expect,vi} from 'vitest';
import {TajweedCompanion,tajweedWordRules} from './TajweedCompanion';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const word={key:'2:2:2',verseKey:'2:2',position:2,kind:'word',text:'نص',rules:['iqlab'],tajweedSegments:[{text:'ن',rule:'ghunnah'},{text:'ص',rule:'unknown_rule'}]} as MushafWord;
it('uses only documented segment tags, never the whole-word colour or a guessed rule',()=>{expect(tajweedWordRules(word)).toEqual(['ghunnah']);expect(tajweedWordRules({...word,tajweedSegments:[]})).toEqual([]);});
it('displays a rule only for a timed source and the corresponding verse, then fades it',async()=>{
 vi.useFakeTimers();const div=document.createElement('div'),root=createRoot(div);
 try{await act(async()=>root.render(<TajweedCompanion word={word} verseKey="2:2" enabled matched={false} onOpen={()=>{}}/>));expect(div.textContent).toBe('');
 await act(async()=>root.render(<TajweedCompanion word={word} verseKey="2:2" enabled matched onOpen={()=>{}}/>));expect(div.textContent).toContain('Ghunnah');
 await act(async()=>vi.advanceTimersByTime(2801));expect(div.textContent).toBe('');
 }finally{await act(async()=>root.unmount());vi.useRealTimers();}
});
