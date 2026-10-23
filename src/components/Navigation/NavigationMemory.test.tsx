// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {BrowserRouter,Link,Routes,Route} from 'react-router-dom';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
vi.mock('../../stores/quizStore',()=>({useQuizStore:(select:(s:{view:string})=>unknown)=>select({view:'home'})}));
import {NavigationMemory} from './NavigationMemory';
import {usePageState,useSmartBack} from '../../hooks/usePageState';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement,y=0;
function List(){const [filter,setFilter]=usePageState('filter','Tous');return <main><button onClick={()=>setFilter('Approfondir')}>Filtrer</button><output>{filter}</output><Link to="/detail">Ouvrir</Link></main>;}
function Detail(){const back=useSmartBack('/list');return <button onClick={back}>Retour</button>;}
const app=()=> <BrowserRouter><NavigationMemory/><Routes><Route path="/list" element={<List/>}/><Route path="/detail" element={<Detail/>}/></Routes></BrowserRouter>;
async function click(label:string){await act(async()=>{[...host.querySelectorAll<HTMLElement>('button,a')].find(el=>el.textContent===label)!.click();await new Promise(r=>setTimeout(r,25));});}
beforeEach(()=>{window.sessionStorage.clear();vi.stubGlobal('sessionStorage',window.sessionStorage);window.history.replaceState({idx:0,key:`start-${Math.random()}`},'', '/list');y=0;Object.defineProperty(window,'scrollY',{configurable:true,get:()=>y});vi.spyOn(window,'scrollTo').mockImplementation(((options:ScrollToOptions)=>{y=options.top??0;}) as typeof window.scrollTo);vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(0),0));vi.stubGlobal('cancelAnimationFrame',clearTimeout);host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('restores the filter and exact window position after entering a detail and pressing Back',async()=>{await act(async()=>root.render(app()));await click('Filtrer');y=740;window.dispatchEvent(new Event('scroll'));await click('Ouvrir');expect(location.pathname).toBe('/detail');expect(y).toBe(0);await click('Retour');expect(location.pathname).toBe('/list');expect(host.querySelector('output')?.textContent).toBe('Approfondir');expect(y).toBe(740);});
it('uses a safe parent destination when a detail is opened without app history',async()=>{window.history.replaceState({idx:0,key:'direct'},'','/detail');await act(async()=>root.render(app()));await click('Retour');expect(location.pathname).toBe('/list');});
it('ignores corrupt session preferences without breaking the page',async()=>{window.sessionStorage.setItem('qc-page:/list:filter','{broken');await act(async()=>root.render(app()));expect(host.querySelector('output')?.textContent).toBe('Tous');});
