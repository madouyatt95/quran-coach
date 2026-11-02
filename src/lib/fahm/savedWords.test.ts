import {it,expect} from 'vitest';
import {savedWordOptions,savedWordQueue} from './savedWords';
import type {MushafWord} from '../interactiveMushaf/model';
import type {ReviewWord} from '../../stores/mushafStudyStore';
import {updateRecall} from './recall';
const word=(french:string|null,position=1)=>({french,position,kind:'word'} as MushafWord);
it('only offers supplied French meanings and removes equivalent punctuation',()=>{
 const target=word('le livre');const options=savedWordOptions(target,[target,word('le livre.'),word('Allâh'),word('le ciel')]);
 expect(options).toHaveLength(3);expect(options).toContain('le livre');expect(new Set(options).size).toBe(3);expect(savedWordOptions(word(null),[word('test')])).toEqual([]);
});
it('selects unstudied and due saved words without postponing newer scheduled reviews',()=>{
 const words=['2:2:1','2:2:2','2:3:1'].map((key,i)=>({key,verseKey:key.slice(0,-2),text:'نص',page:2,addedAt:i} as ReviewWord));
 const now=1000000000,checks={'word:2:2:2':updateRecall(undefined,{surah:2,ayah:2},true,false,now),'word:2:3:1':updateRecall(undefined,{surah:2,ayah:3},false,false,now-86400001)};
 expect(savedWordQueue(words,checks,5,now).map(w=>w.key)).toEqual(['2:2:1','2:3:1']);
});
