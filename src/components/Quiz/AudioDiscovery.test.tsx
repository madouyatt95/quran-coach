// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
vi.mock('../../lib/quranApi',()=>({fetchAyah:vi.fn(),fetchSurahTranslation:vi.fn(),fetchAyahAudioUrl:vi.fn()}));
import {fetchAyah,fetchSurahTranslation} from '../../lib/quranApi';
import {AudioDiscovery} from './AudioDiscovery';
import {generateAudioQuestions} from '../../lib/quizEngine';
import {legacyLearningQuestion} from '../../lib/quizLearning';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,div:HTMLDivElement;
beforeEach(()=>{div=document.createElement('div');document.body.append(div);root=createRoot(div);vi.mocked(fetchAyah).mockReset();vi.mocked(fetchSurahTranslation).mockReset();});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
it('displays the text returned for the requested verse, pairs translation by global ID and retains the exact audio and Mushaf target',async()=>{
 const q=legacyLearningQuestion(generateAudioQuestions()[0]);
 vi.mocked(fetchAyah).mockResolvedValue({number:100,numberInSurah:q.verseRef!.ayah,text:'Texte de test',surah:q.verseRef!.surah,juz:1,page:1,hizbQuarter:1});
 vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map([[100,'Traduction de test'],[101,'Autre verset']]));
 await act(async()=>root.render(<MemoryRouter><AudioDiscovery question={q}/></MemoryRouter>));
 expect(fetchAyah).toHaveBeenCalledWith(q.verseRef!.surah,q.verseRef!.ayah);expect(div.textContent).toContain('Traduction de test');expect(div.textContent).not.toContain('Autre verset');
 expect(div.querySelector('audio')?.getAttribute('src')).toBe(q.audioUrl);
 expect(div.querySelector('a')?.getAttribute('href')).toBe(`/read?surah=${q.verseRef!.surah}&ayah=${q.verseRef!.ayah}`);
});
it('shows retry and keeps the Mushaf link when the text service fails',async()=>{
 vi.mocked(fetchAyah).mockRejectedValue(new Error('offline'));vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map());
 await act(async()=>root.render(<MemoryRouter><AudioDiscovery question={legacyLearningQuestion(generateAudioQuestions()[0])}/></MemoryRouter>));
 expect(div.textContent).toContain('Réessayer le passage');expect(div.querySelector('a')).not.toBeNull();
});
