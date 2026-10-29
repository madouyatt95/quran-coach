// @vitest-environment jsdom
import {act,useRef} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {readTrace,useReadingTrace} from './useReadingTrace';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let host:HTMLDivElement,reactRoot:Root;
beforeEach(()=>{vi.stubGlobal('localStorage',createMemoryStorage());vi.useFakeTimers();vi.stubGlobal('requestAnimationFrame',(f:()=>void)=>setTimeout(f,16));vi.stubGlobal('cancelAnimationFrame',clearTimeout);host=document.createElement('div');document.body.append(host);reactRoot=createRoot(host);});
afterEach(()=>{act(()=>reactRoot.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals();});
function App({explicit=false}:{explicit?:boolean}){const ref=useRef<HTMLDivElement>(null);const marker=useReadingTrace(ref,291,true,true,explicit);return <div className="iq-reader"><section className="pupitre-upper"><div ref={ref} className="iq-viewport"><span data-word-key="17:87:1">mot</span></div></section><output>{marker}</output></div>;}
it('restores a local breadcrumb and lets its marker fade without creating a bookmark',()=>{
 localStorage.setItem('quran-coach-reading-trace',JSON.stringify({page:291,key:'17:87:1',offset:40,offsetX:10}));
 act(()=>reactRoot.render(<App/>));act(()=>vi.advanceTimersByTime(20));expect(host.querySelector('output')?.textContent).toBe('17:87:1');
 act(()=>vi.advanceTimersByTime(4600));expect(host.querySelector('output')?.textContent).toBe('');expect(localStorage.getItem('quran-coach-reading-bookmark')).toBeNull();
});
it('never replaces an explicit navigation with the last reading position',()=>{
 localStorage.setItem('quran-coach-reading-trace',JSON.stringify({page:291,key:'17:87:1',offset:40,offsetX:10}));
 act(()=>reactRoot.render(<App explicit/>));act(()=>vi.advanceTimersByTime(20));expect(host.querySelector('output')?.textContent).toBe('');
});
it('ignores invalid or malformed traces',()=>{localStorage.setItem('quran-coach-reading-trace','{');expect(readTrace()).toBeNull();localStorage.setItem('quran-coach-reading-trace',JSON.stringify({page:900,key:'bad',offset:1,offsetX:2}));expect(readTrace()).toBeNull();});
