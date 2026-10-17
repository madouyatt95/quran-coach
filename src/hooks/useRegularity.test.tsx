// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../test/memoryStorage';
import {useRegularity} from './useRegularity';
import {useStatsStore as stats} from '../stores/statsStore';
import {useCompanionStore as reading} from '../stores/companionStore';
import {useListeningEvidenceStore as listening} from '../stores/listeningEvidenceStore';
import {useAcademyKnowledgeStore as academy} from '../stores/academyKnowledgeStore';
import {useLearningStore as learning} from '../stores/learningStore';
import {useFahmStore as fahm} from '../stores/fahmStore';
import {useAcademyStore as courses} from '../stores/academyStore';
let root:Root|undefined,host:HTMLDivElement|undefined;
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
function Harness(){useRegularity();return null;}
afterEach(async()=>{await act(async()=>root?.unmount());host?.remove();vi.restoreAllMocks();});
it('opening alone is neutral; real reading, listening and academy exercises feed the same local-day streak',async()=>{
 const memory=createMemoryStorage();stats.persist.setOptions({storage:createJSONStorage(()=>memory)});reading.persist.setOptions({storage:createJSONStorage(()=>memory)});listening.persist.setOptions({storage:createJSONStorage(()=>memory)});academy.persist.setOptions({storage:createJSONStorage(()=>memory)});learning.persist.setOptions({storage:createJSONStorage(()=>memory)});fahm.persist.setOptions({storage:createJSONStorage(()=>memory)});courses.persist.setOptions({storage:createJSONStorage(()=>memory)});
 stats.setState({activeDays:{},activityHistory:{},countedPages:{},readingStreak:0,totalPagesRead:0});reading.setState({evidence:[]});listening.setState({entries:[]});academy.setState({concepts:{}});learning.setState({records:{}});fahm.setState({learnedWords:{}});courses.setState({progress:{}});
 host=document.createElement('div');document.body.append(host);root=createRoot(host);await act(async()=>{root!.render(<Harness/>);await new Promise(r=>setTimeout(r,100));});expect(stats.getState().readingStreak).toBe(0);
 await act(async()=>academy.getState().write('sabirin-tawhid-1',0,'explanation','Une note'));expect(stats.getState().readingStreak).toBe(0);
 await act(async()=>reading.getState().record({page:4,surah:2,ayah:0}));expect(stats.getState().readingStreak).toBe(1);expect(stats.getState().totalPagesRead).toBe(1);
 await act(async()=>listening.getState().recordVerse(1,1,'passage'));await act(async()=>academy.getState().answer('sabirin-tawhid-1',0,'check',0,false));expect(stats.getState().readingStreak).toBe(1);
});
