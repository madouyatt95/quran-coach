// @vitest-environment jsdom
import {it,expect,beforeEach,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {searchKnowledge} from './knowledgeSearch';
import {useReaderNotesStore} from '../stores/readerNotesStore';
import {useAcademyStore} from '../stores/academyStore';
import {useArabicLearningStore} from '../stores/arabicLearningStore';
import {ARABIC_LESSONS} from '../arabic/data';
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());useReaderNotesStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useAcademyStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useArabicLearningStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});});
it('searches the real course explanations, not only module titles',async()=>{expect((await searchKnowledge('consensus')).some(r=>r.type==='course')).toBe(true);});
it('finds grammar lessons with directly addressable lesson routes',async()=>{const l=ARABIC_LESSONS[0];const result=(await searchKnowledge(l.title)).find(r=>r.id===`arabic:${l.id}`);expect(result?.link).toBe(`/academy/arabic/${l.id}?view=read`);});
it('returns a personal note attached to its exact Quran verse',async()=>{
 useReaderNotesStore.setState({notes:{'2:153':{surah:2,ayah:153,page:23,kind:'personal',text:'Ma réflexion unique sur la patience',updatedAt:1}}});
 const r=(await searchKnowledge('réflexion unique')).find(r=>r.type==='note');expect(r?.textFr).toContain('réflexion unique');expect(r?.link).toBe('/read?surah=2&ayah=153');
});
it('marks existing study progress without inventing completion',async()=>{
 useAcademyStore.setState({progress:{'sabirin-tawhid-1':{completed:false,score:0,lastVisitedAt:1}}});expect((await searchKnowledge('croyance')).find(r=>r.id==='course:sabirin-tawhid-1')?.studied).toBe(true);
 const lesson=ARABIC_LESSONS[0];useArabicLearningStore.setState({drafts:{[lesson.id]:{stage:0,answers:{},complete:false,application:false}}});expect((await searchKnowledge(lesson.title)).find(r=>r.id===`arabic:${lesson.id}`)?.studied).toBe(true);
});
it('does not duplicate ids across public and private results',async()=>{const results=(await searchKnowledge('Allah'));expect(new Set(results.map(r=>r.id)).size).toBe(results.length);expect(results.some(r=>r.type==='story')).toBe(true);});
it('finds current book passages with exact chapter links and no old public journey',async()=>{
 const results=await searchKnowledge('Adam');const books=results.filter(r=>r.id.startsWith('book:'));
 expect(books.length).toBeGreaterThan(0);expect(books.some(r=>r.link?.startsWith('/books/adam?chapter='))).toBe(true);
 expect(results.some(r=>r.id.startsWith('story:')&&r.link?.startsWith('/journeys/'))).toBe(false);
});
