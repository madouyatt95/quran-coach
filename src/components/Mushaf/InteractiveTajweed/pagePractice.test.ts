import {expect,it} from 'vitest';
import {revealPracticeWords} from './pagePractice';
import {edgeDrag} from './usePageGestures';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
const words=[{key:'2:1:1',kind:'word',line:1},{key:'2:1:2',kind:'word',line:1},{key:'2:1:3',kind:'end',line:1},{key:'2:2:1',kind:'word',line:2}] as MushafWord[];
it('reveals a word or its exact printed line without changing the page or revealing other lines',()=>{
 const before=new Set<string>();expect([...revealPracticeWords(words,words[0],'word',before)]).toEqual(['2:1:1']);expect(before.size).toBe(0);
 expect([...revealPracticeWords(words,words[0],'line',before)]).toEqual(['2:1:1','2:1:2']);
});
it('counts only motion beyond the scroll boundary toward a page turn',()=>{
 expect(edgeDrag(60,100,200)).toEqual({next:40,excess:0});
 expect(edgeDrag(60,40,200)).toEqual({next:0,excess:20});
 expect(edgeDrag(-70,180,200)).toEqual({next:200,excess:-50});
 expect(edgeDrag(20,200,200)).toEqual({next:180,excess:0});
});
