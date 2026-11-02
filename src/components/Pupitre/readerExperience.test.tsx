// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)}});});
import {createJSONStorage} from 'zustand/middleware';
import {Pupitre,PupitreBottom} from './Pupitre';
import {PupitrePreferences} from './PupitrePreferences';
import {PupitreWorkspace} from './PupitreWorkspace';
import {usePupitreLayout,useLayoutPreferences} from './usePupitreLayout';
import {useInteractiveReaderStore} from '../../stores/interactiveReaderStore';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement;
beforeEach(()=>{vi.useFakeTimers();host=document.createElement('div');document.body.append(host);root=createRoot(host);Object.defineProperty(window,'innerWidth',{configurable:true,value:1000});useLayoutPreferences.setState({preferences:{}});useInteractiveReaderStore.persist.setOptions({storage:createJSONStorage(()=>window.localStorage)});useInteractiveReaderStore.setState({bookSpread:true});});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.useRealTimers();});
it('distinguishes a book spread from the study workspace and preserves the requested study tab',async()=>{
 function Choices(){const state=usePupitreLayout(true,'reader');return <PupitrePreferences state={state}/>;}
 await act(async()=>root.render(<Choices/>));
 const choose=async(value:string)=>act(async()=>host.querySelector<HTMLInputElement>(`input[value="${value}"]`)!.click());
 await choose('plain');expect(useInteractiveReaderStore.getState().bookSpread).toBe(false);expect(useLayoutPreferences.getState().preferences.reader?.choice).toBe('plain');
 await choose('spread');expect(useInteractiveReaderStore.getState().bookSpread).toBe(true);expect(useLayoutPreferences.getState().preferences.reader?.choice).toBe('plain');
 await choose('book');expect(useLayoutPreferences.getState().preferences.reader).toMatchObject({choice:'book',tab:'understand'});
 await choose('desk');expect(useLayoutPreferences.getState().preferences.reader?.choice).toBe('desk');
});
it('keeps the reader transport, tabs and shortcuts visible throughout playback',async()=>{
 useLayoutPreferences.getState().update('reader',{choice:'desk'});
 const render=(playing=true)=>act(async()=>root.render(<Pupitre title="Test" activity="reader"><PupitreBottom><PupitreWorkspace activity="reader" playing={playing} primary={<button>Pause</button>} listen={<p>Traduction</p>} understand={<p>Étude</p>} settings={null} actions={[{id:'range',label:'Répéter'},{id:'word',label:'Mot'}]} defaultPins={['range','word']}/></PupitreBottom></Pupitre>));
 await render();const pause=[...host.querySelectorAll('button')].find(b=>b.textContent==='Pause');
 await act(async()=>vi.advanceTimersByTime(4000));
 expect(host.querySelector('.pupitre-workspace')?.getAttribute('data-console-quiet')).toBe('false');
 expect(host.querySelector('.pupitre-console-tabs')?.hasAttribute('inert')).toBe(false);
 expect(host.querySelector('[data-essential=true]')?.hasAttribute('inert')).toBe(false);
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Pause')).toBe(pause);
 expect(host.querySelector('.pupitre-workspace-fixed')?.hasAttribute('hidden')).toBe(false);
 await act(async()=>useLayoutPreferences.getState().update('reader',{choice:'plain'}));
 expect(host.querySelector('.pupitre-workspace-fixed')?.hasAttribute('hidden')).toBe(true);
 await act(async()=>useLayoutPreferences.getState().update('reader',{choice:'desk'}));
 expect(host.querySelector('.pupitre-workspace-fixed')?.hasAttribute('hidden')).toBe(false);
 expect([...host.querySelectorAll('button')].find(b=>b.textContent==='Pause')).toBe(pause);
 await render(false);await act(async()=>vi.advanceTimersByTime(5000));expect(host.querySelector('.pupitre-console-tabs')?.hasAttribute('inert')).toBe(false);
});
it('keeps two mounted layout pickers independent at the DOM level and synchronised through preferences',async()=>{
 function Choices(){const state=usePupitreLayout(true,'reader');return <><div hidden><PupitrePreferences state={state}/></div><div data-visible><PupitrePreferences state={state}/></div></>;}
 await act(async()=>root.render(<Choices/>));
 const visible=(value:string)=>host.querySelector<HTMLInputElement>(`[data-visible] input[value="${value}"]`)!;
 await act(async()=>visible('desk').click());
 await act(async()=>visible('spread').click());
 expect(visible('spread').checked).toBe(true);
 expect(useLayoutPreferences.getState().preferences.reader?.choice).toBe('plain');
 expect(useInteractiveReaderStore.getState().bookSpread).toBe(true);
 expect(new Set([...host.querySelectorAll<HTMLInputElement>('input[type=radio]')].map(input=>input.name)).size).toBe(2);
});
