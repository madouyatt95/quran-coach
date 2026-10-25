// @vitest-environment jsdom
import {act,useRef} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
vi.hoisted(()=>{const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}});});
import {useBookReadingPoint} from './useBookReadingPoint';
import {useAudioLibraryStore} from '../stores/audioLibraryStore';
import type {BookPassage} from '../lib/bookPassages';
const passages=['one','two','three'].map(id=>({id} as BookPassage));
let visible='one',host:HTMLDivElement,root:Root;
function Reader(){const ref=useRef<HTMLElement>(null);useBookReadingPoint(ref,'sample','v1','chapter',passages,true);return <article ref={ref}>{passages.map(p=><p key={p.id} data-book-passage={p.id}>{p.id}</p>)}</article>;}
beforeEach(()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-25T12:00:00Z'));visible='one';
 useAudioLibraryStore.setState({bookReadingPoints:{},bookReading:{},bookReadingUpdatedAt:{}});
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(function(this:HTMLElement){const top=this.dataset.bookPassage===visible?100:-500;return {top,bottom:top+200,height:200,left:0,right:300,width:300,x:0,y:top,toJSON(){return {};}};});
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.useRealTimers();});
const tick=async(ms:number)=>{await act(async()=>vi.advanceTimersByTime(ms));};
it('saves the visible paragraph and remembers only a consecutive passage viewed for four seconds',async()=>{
 await act(async()=>root.render(<Reader/>));await tick(450);
 expect(useAudioLibraryStore.getState().bookReadingPoints.sample.passageId).toBe('one');
 await tick(4000);visible='two';window.dispatchEvent(new Event('scroll'));await tick(450);
 expect(useAudioLibraryStore.getState().bookReadingPoints.sample).toMatchObject({passageId:'two',previousPassageId:'one'});
 visible='three';window.dispatchEvent(new Event('scroll'));await tick(450);
 expect(useAudioLibraryStore.getState().bookReadingPoints.sample.previousPassageId).toBeUndefined();
});
it('does not claim a skipped paragraph was read or repeatedly save an unchanged paragraph',async()=>{
 await act(async()=>root.render(<Reader/>));await tick(450);const saved=useAudioLibraryStore.getState().bookReadingPoints.sample;
 await tick(5000);window.dispatchEvent(new Event('scroll'));await tick(450);
 expect(useAudioLibraryStore.getState().bookReadingPoints.sample).toBe(saved);
 visible='three';window.dispatchEvent(new Event('scroll'));await tick(450);
 expect(useAudioLibraryStore.getState().bookReadingPoints.sample.previousPassageId).toBeUndefined();
});
