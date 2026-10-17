import {it,expect} from 'vitest';
import {selectedWords} from './PassageSelection';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
const words=[{key:'a',kind:'word'},{key:'b',kind:'word'},{key:'end',kind:'end'},{key:'c',kind:'word'}] as MushafWord[];
it('normalizes reversed handles and excludes verse medallions',()=>{expect(selectedWords(words,{start:'c',end:'a'}).map(w=>w.key)).toEqual(['a','b','c']);});
it('does not invent a selection if either endpoint is absent',()=>{expect(selectedWords(words,{start:'a',end:'missing'})).toEqual([]);});
it('selects a continuous passage when its endpoints are on different pages',()=>{
 const firstPage=[{key:'2:1:1',verseKey:'2:1',position:1,kind:'word'},{key:'2:1:2',verseKey:'2:1',position:2,kind:'word'}] as MushafWord[];
 const secondPage=[{key:'2:2:1',verseKey:'2:2',position:1,kind:'word'},{key:'2:2:2',verseKey:'2:2',position:2,kind:'word'}] as MushafWord[];
 expect(selectedWords([...firstPage,...secondPage],{start:'2:1:2',end:'2:2:1',startPage:3,endPage:4}).map(w=>w.key)).toEqual(['2:1:2','2:2:1']);
});
