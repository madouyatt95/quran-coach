// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {useWordPlayback} from './useWordPlayback';
import {fetchVerseRecitation,type VerseRecitation} from '../../../lib/verseRecitation';
import type {MushafWord} from '../../../lib/interactiveMushaf/model';
vi.mock('../../../lib/quranApi',()=>({mushafReciter:()=>({quranComId:7})}));
vi.mock('../../../lib/verseRecitation',async original=>({...await original<object>(),fetchVerseRecitation:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root,host:HTMLDivElement,api:ReturnType<typeof useWordPlayback>;
const start=vi.fn(),word=(position:number)=>({key:`2:13:${position}`,verseKey:'2:13',kind:'word',position} as MushafWord);
const source:VerseRecitation={url:'https://audio.example/2-13.mp3',timings:{verseKey:'2:13',words:[{id:1,position:1,text:'',timestampFrom:0,timestampTo:900},{id:2,position:2,text:'',timestampFrom:1250,timestampTo:1900}]}};
function Harness({page=3}:{page?:number}){api=useWordPlayback(page,'alafasy',false,start);return null;}
beforeEach(()=>{host=document.createElement('div');document.body.append(host);root=createRoot(host);vi.clearAllMocks();act(()=>root.render(<Harness/>));});
afterEach(()=>{act(()=>root.unmount());host.remove();});
it('starts continuous playback at the exact source-matched word time',async()=>{
 vi.mocked(fetchVerseRecitation).mockResolvedValue(source);
 await act(async()=>api.play(word(2)));
 expect(start).toHaveBeenCalledWith(word(2),{url:source.url,offset:1.25,timings:source.timings});
});
it('ignores late results from previous taps',async()=>{
 const resolves:((v:VerseRecitation)=>void)[]=[];
 vi.mocked(fetchVerseRecitation).mockImplementation(()=>new Promise(resolve=>resolves.push(resolve)));
 act(()=>{void api.play(word(1));void api.play(word(2));});
 await act(async()=>resolves[1](source));await act(async()=>resolves[0](source));
 expect(start).toHaveBeenCalledTimes(1);expect(start.mock.calls[0][0].position).toBe(2);
});
it.each(['stop','page','global stop'])('does not start pending audio after %s',async reason=>{
 let resolve!:(v:VerseRecitation)=>void;
 vi.mocked(fetchVerseRecitation).mockImplementation(()=>new Promise(r=>resolve=r));
 act(()=>{void api.play(word(2));});
 act(()=>{if(reason==='stop')api.cancel();else if(reason==='page')root.render(<Harness page={4}/>);else window.dispatchEvent(new Event('quran-stop-playback'));});
 await act(async()=>resolve(source));expect(start).not.toHaveBeenCalled();expect(api.preparing).toBe(false);
});
it('explicitly explains a verse-start fallback when timestamps are unavailable',async()=>{
 vi.mocked(fetchVerseRecitation).mockResolvedValue(null);
 await act(async()=>api.play(word(2)));
 expect(start).toHaveBeenCalledWith(word(2),undefined);expect(api.notice).toContain('Départ au début du verset');
});
