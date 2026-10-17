// @vitest-environment jsdom
import {act,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {GUIDES,REMEDIES} from './pedagogy';
import {ARABIC_LESSONS,lessonById} from './data';
import {SARF_FAMILIES,wordSegments,sarfPattern,selectSarfForm} from './sarfData';
import {SENTENCES,placeWord,sentenceCorrect} from './sentenceData';
import {AdaptiveQuestion} from './AdaptiveQuestion';
import {SentenceWorkshop} from './ArabicWorkshops';
import {SentenceBuilder} from './SentenceBuilder';
import {useArabicPracticeStore as practice} from '../stores/arabicPracticeStore';
import {useArabicLearningStore as store} from '../stores/arabicLearningStore';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let div:HTMLDivElement,root:Root;
beforeEach(()=>{practice.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});practice.setState({workshops:{},evidence:{}});div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
const click=async(el:Element|null)=>{expect(el).toBeTruthy();await act(async()=>(el as HTMLButtonElement).click());};
const button=(text:string)=>Array.from(div.querySelectorAll('button')).find(b=>b.textContent?.includes(text))!;
it('covers all existing questions with distinct distractor explanations and valid new examples',()=>{
 for(const lesson of ARABIC_LESSONS){expect(GUIDES[lesson.id].steps.length).toBe(3);for(const q of lesson.questions){const r=REMEDIES[q.id];expect(r).toBeDefined();expect(r.feedback[String(q.answer)]).toBeUndefined();expect(new Set(Object.values(r.feedback)).size).toBe(q.options.length-1);q.options.forEach((_,i)=>{if(i!==q.answer)expect(r.feedback[String(i)].length).toBeGreaterThan(15);});expect(r.check.prompt).not.toBe(q.prompt);expect(r.check.options[r.check.answer]).toBeTruthy();}}
});
it('keeps all 36 prepared Arabic forms intact and maps exactly their three radicals',()=>{
 let count=0;
 for(const f of SARF_FAMILIES){expect(f.forms).toHaveLength(10);expect(new Set(f.forms.map(x=>x.id)).size).toBe(10);for(const w of [...f.forms,...f.participles]){count++;const segments=wordSegments(w.word);expect(segments.join('')).toBe(w.word);expect(w.radicals.map(i=>segments[i][0]).join(' ')).toBe(f.root);expect(sarfPattern(w)).toContain('ع');}expect(selectSarfForm(f,'past','passive','i')).toBeUndefined();}
 expect(count).toBe(36);
 expect(selectSarfForm(SARF_FAMILIES[0],'present','active','we')?.word).toBe('نَكْتُبُ');
 expect(selectSarfForm(SARF_FAMILIES[1],'past','passive','he')?.word).toBe('فُتِحَ');
 expect(selectSarfForm(SARF_FAMILIES[2],'present','active','i')?.word).toBe('أَسْمَعُ');
});
it('never duplicates a moved word and rejects incomplete or inverted constructions',()=>{
 for(const t of SENTENCES){const correct=t.slots.map(s=>s.word);expect(sentenceCorrect(t,correct)).toBe(true);expect(sentenceCorrect(t,[...correct].reverse())).toBe(false);expect(sentenceCorrect(t,t.slots.map(()=>null))).toBe(false);const moved=placeWord(correct,1,correct[0]);expect(moved.filter(x=>x===correct[0])).toHaveLength(1);expect(moved[0]).toBeNull();for(const l of t.links){expect(t.slots[l.from]).toBeDefined();expect(t.slots[l.to]).toBeDefined();}}
});
it('preserves legacy completion and persists a specific remedial answer',async()=>{
 const storage=createMemoryStorage();store.persist.setOptions({storage:createJSONStorage(()=>storage)});
 const old={stage:2,answers:{'nominal-1':1,'nominal-2':0},complete:true,application:true};
 storage.setItem('qc-arabic-learning-v1',JSON.stringify({state:{detailed:true,last:'nominal',drafts:{nominal:old}},version:0}));await store.persist.rehydrate();
 store.getState().remedy('nominal','nominal-1',2);store.getState().remedy('nominal','nominal-1',99);await store.persist.rehydrate();
 expect(store.getState().drafts.nominal).toMatchObject({...old,remedies:{'nominal-1':2}});
});
it('requires the new example after an error, then allows another attempt without mixing questions',async()=>{
 const q=lessonById('nominal')!.questions[0];
 function Harness(){const [choice,setChoice]=useState<number|undefined>(),[remedy,setRemedy]=useState<number|undefined>();return <AdaptiveQuestion question={q} choice={choice} remedyChoice={remedy} onRemedy={setRemedy} onAnswer={setChoice}/>;}
 await act(async()=>root.render(<Harness/>));await click(div.querySelector('button'));
 expect(div.textContent).toContain(REMEDIES[q.id].feedback['0']);expect(div.querySelector('button')!.disabled).toBe(true);
 const transfer=div.querySelectorAll('.arabic-remedy .arabic-options button');await click(transfer[2]);await click(button('Revenir à la question initiale'));
 expect(div.querySelector('button')!.disabled).toBe(false);await click(div.querySelectorAll('.arabic-question > .arabic-options button')[1]);
 expect(div.textContent).toContain('Oui.');expect(div.querySelector('.arabic-remedy')).toBeNull();
});
it('accepts every word with the requested category instead of only the first matching index',async()=>{
 await act(async()=>root.render(<SentenceWorkshop lesson={lessonById('definite')!} detailed={false}/>));
 const select=div.querySelector('select')!;await act(async()=>{select.value='1';select.dispatchEvent(new Event('change',{bubbles:true}));});
 await click(div.querySelectorAll('.arabic-options button')[2]);expect(div.querySelector('[role=status]')?.textContent).toContain('Oui.');expect(div.querySelector('[role=status]')?.textContent).toContain('Un pronom');
});
it('assembles a sentence by taps and reveals its grammatical relationships',async()=>{
 await act(async()=>root.render(<SentenceBuilder lessonId="nominal"/>));
 expect(button('Vérifier').disabled).toBe(true);
 await click(div.querySelector('[aria-label="Placer الْبَابُ"]'));await click(div.querySelector('[aria-label="Placer مَفْتُوحٌ"]'));await click(button('Vérifier'));
 expect(div.textContent).toContain('La construction est juste');expect(div.querySelector('.arabic-relations')?.textContent).toContain('khabar');
 await click(button('Recommencer'));expect(button('Vérifier').disabled).toBe(true);
});
