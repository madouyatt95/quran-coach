// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {it,expect,vi} from 'vitest';
import {FahmWordsPage} from './FahmWordsPage';
import {useMushafStudyStore} from '../stores/mushafStudyStore';
import {useFahmLearningStore} from '../stores/fahmLearningStore';
import {useStatsStore} from '../stores/statsStore';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import type {InteractivePage,MushafWord} from '../lib/interactiveMushaf/model';
import {loadInteractivePage} from '../lib/interactiveMushaf/service';
vi.mock('../lib/interactiveMushaf/service',()=>({loadInteractivePage:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('reviews a saved word with its supplied meaning and plays its exact word position',async()=>{
 useMushafStudyStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 useFahmLearningStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 useStatsStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 const word={key:'2:12:1',verseKey:'2:12',position:1,kind:'word',text:'أَلَآ',french:'N’est-ce pas',transliteration:'alā'} as MushafWord;
 vi.mocked(loadInteractivePage).mockResolvedValue({page:3,words:[word,{...word,key:'2:12:2',position:2,french:'Certes, ils'},{...word,key:'2:12:3',position:3,french:'eux'}]} as InteractivePage);
 useMushafStudyStore.setState({words:{[word.key]:{key:word.key,verseKey:word.verseKey,text:word.text,page:3,addedAt:0}}});useFahmLearningStore.setState({checks:{},words:{}});
 let audio!:HTMLAudioElement;vi.stubGlobal('Audio',class{src='';play=vi.fn().mockResolvedValue(undefined);pause=vi.fn();constructor(){audio=this as unknown as HTMLAudioElement;}});
 const div=document.createElement('div');document.body.append(div);const root=createRoot(div);
 try{await act(async()=>root.render(<MemoryRouter><FahmWordsPage/></MemoryRouter>));const button=(text:string)=>[...div.querySelectorAll('button')].find(b=>b.textContent===text)!;
 await act(async()=>button('5 mots').click());expect(div.textContent).toContain('Quel sens a ce mot ?');expect(div.textContent).not.toContain('Sens retrouvé');
 await act(async()=>button('N’est-ce pas').click());expect(div.textContent).toContain('Sens retrouvé');expect(useFahmLearningStore.getState().checks['word:2:12:1'].retainedAt).toBe(0);
 await act(async()=>div.querySelector<HTMLButtonElement>('[aria-label="Écouter la prononciation du mot"]')!.click());expect(audio.src).toBe('https://audio.qurancdn.com/wbw/002_012_001.mp3');
 expect(div.querySelector('a[href*="studyWord=1"]')).not.toBeNull();
 }finally{await act(async()=>root.unmount());div.remove();vi.unstubAllGlobals();}
});
