// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,useLocation} from 'react-router-dom';
import {it,expect} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../test/memoryStorage';
import {useAcademyStore} from '../../stores/academyStore';
import {CourseConnections} from './CourseConnections';

Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
function Harness(){
 const location=useLocation(),id=new URLSearchParams(location.search).get('module')!;
 return <><output>{JSON.stringify({search:location.search,state:location.state})}</output><CourseConnections id={id}/></>;
}
it('keeps the initial course and exact section across two explorations, then clears the return chain',async()=>{
 useAcademyStore.persist.setOptions({storage:createJSONStorage(()=>createMemoryStorage())});
 useAcademyStore.setState({progress:{'sabirin-hadith-3':{completed:false,score:0,lastContentIdx:0,lastSectionIdx:2}}});
 const previous=useAcademyStore.getState().progress;
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 try{
  await act(async()=>root.render(<MemoryRouter initialEntries={['/academy?module=sabirin-hadith-3']}><Harness/></MemoryRouter>));
  let links=host.querySelectorAll<HTMLAnchorElement>('.course-connections li a');
  await act(async()=>links[0].click());
  let route=JSON.parse(host.querySelector('output')!.textContent!);
  expect(route.search).toBe('?module=sabirin-hadith-17&section=1');
  expect(route.state.courseReturn).toEqual({moduleId:'sabirin-hadith-3',title:'La place de l’intention',section:2});
  links=host.querySelectorAll<HTMLAnchorElement>('.course-connections li a');
  await act(async()=>links[1].click());
  route=JSON.parse(host.querySelector('output')!.textContent!);
  expect(route.search).toBe('?module=sabirin-tawhid-2&section=1');
  expect(route.state.courseReturn.moduleId).toBe('sabirin-hadith-3');
  const back=host.querySelector<HTMLAnchorElement>('.course-connection-return')!;
  expect(back.textContent).toContain('La place de l’intention');
  await act(async()=>back.click());
  route=JSON.parse(host.querySelector('output')!.textContent!);
  expect(route.search).toBe('?module=sabirin-hadith-3&section=2');
  expect(route.state.courseReturn).toBeNull();
  expect(host.querySelector('.course-connection-return')).toBeNull();
  expect(useAcademyStore.getState().progress).toBe(previous);
 }finally{await act(async()=>root.unmount());host.remove();}
});
