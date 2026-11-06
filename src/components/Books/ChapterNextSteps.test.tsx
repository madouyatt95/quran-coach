// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {it,expect,vi} from 'vitest';
import {ChapterNextSteps} from './ChapterNextSteps';
import type {NarrativeBook} from '../../lib/narrativeBooks';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('offers at most three actions and only references belonging to this chapter',async()=>{
 const book={sources:[{id:'a',type:'quran',surah:2,first:30,last:34,description:'Source',checkedAt:'2026-11-06'},{id:'unused',type:'quran',surah:1,first:1,last:7}],chapters:[{id:'chapter',title:'Un chapitre',recap:'',scenes:[{id:'scene',title:'Scène',studyNote:'',paragraphs:[{text:'Texte',sources:['a']}]}]}]} as NarrativeBook;
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host),onSource=vi.fn(),onContinue=vi.fn();
 await act(async()=>root.render(<ChapterNextSteps book={book} chapter={book.chapters[0]} nextTitle="La suite" onContinue={onContinue} onSource={onSource} note="Ma note" onNote={()=>{}}/>));
 expect(host.querySelectorAll('.chapter-next-actions button')).toHaveLength(3);
 await act(async()=> (host.querySelectorAll('button')[1] as HTMLButtonElement).click());
 expect(host.querySelectorAll('.chapter-next-sources button')).toHaveLength(1);
 await act(async()=> (host.querySelector('.chapter-next-sources button') as HTMLButtonElement).click());expect(onSource).toHaveBeenCalledWith(book.sources[0]);
 await act(async()=> (host.querySelector('button') as HTMLButtonElement).click());expect(onContinue).toHaveBeenCalledOnce();
 await act(async()=>root.unmount());host.remove();
});
