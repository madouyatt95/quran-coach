// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {expect,it,vi} from 'vitest';
import {CoachPage} from './CoachPage';
import {coachSearch} from '../lib/coachSearch';
vi.mock('../hooks/useOpenReader',()=>({useOpenReader:()=>vi.fn()}));
vi.mock('../lib/coachSearch',()=>({QUICK_TAGS:[],coachSearch:vi.fn().mockResolvedValue({results:[{id:'c:1',type:'course',title:'Cours sur la patience',textAr:'',textFr:'Explication',score:60,emoji:'📚',studied:true},{id:'h:1',type:'hadith',title:'Hadith',textAr:'',textFr:'Patience',score:50,emoji:'📜'}],unavailable:['Coran en ligne']})}));
it('shows partial failure, filters courses, and supports studied-only without hiding the warning',async()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.useFakeTimers();const host=document.createElement('div'),root=createRoot(host);
 await act(async()=>root.render(<MemoryRouter initialEntries={['/coach?q=patience']}><CoachPage/></MemoryRouter>));
 await act(async()=>{await vi.advanceTimersByTimeAsync(400);});expect(host.textContent).toContain('Recherche partielle');expect(host.querySelectorAll('.coach-card')).toHaveLength(2);
 const courses=[...host.querySelectorAll('button')].find(b=>b.textContent==='Cours')!;await act(async()=>courses.click());await act(async()=>{await vi.advanceTimersByTimeAsync(400);});
 expect(host.querySelectorAll('.coach-card')).toHaveLength(1);expect(vi.mocked(coachSearch).mock.calls.at(-1)?.[1]?.localOnly).toBe(true);
 const check=host.querySelector('input[type="checkbox"]') as HTMLInputElement;await act(async()=>check.click());expect(host.querySelectorAll('.coach-card')).toHaveLength(1);expect(host.textContent).toContain('Déjà étudié ou annoté');
 await act(async()=>root.unmount());vi.useRealTimers();
});
