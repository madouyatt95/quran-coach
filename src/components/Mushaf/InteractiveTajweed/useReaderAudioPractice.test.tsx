// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {useMushafAudio,type MushafAudioState} from '../hooks/useMushafAudio';
import {useReaderAudioPractice,type ReaderAudioPractice} from './useReaderAudioPractice';
import type {Ayah} from '../../../types';
import {fetchSurah} from '../../../lib/quranApi';
vi.mock('../../../lib/quranApi',()=>({MUSHAF_RECITERS:[{id:'ar.alafasy'},{id:'ar.husary'}],mushafReciter:(id:string)=>({quranComId:id==='ar.husary'?6:7}),getAudioUrl:(id:string,n:number)=>`https://audio.test/${id}/${n}.mp3`,fetchSurah:vi.fn()}));
vi.mock('../../../lib/verseRecitation',()=>({fetchVerseRecitation:vi.fn().mockResolvedValue(null)}));
vi.mock('../../../lib/wordTimings',()=>({fetchWordTimings:vi.fn().mockResolvedValue(null)}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
class Media extends EventTarget{src='';currentTime=0;duration=30;playbackRate=1;paused=true;play=vi.fn(async()=>{this.paused=false;this.dispatchEvent(new Event('play'));});pause=vi.fn(()=>{this.paused=true;this.dispatchEvent(new Event('pause'));});}
let media:Media,root:Root,div:HTMLDivElement,audio:MushafAudioState,practice:ReaderAudioPractice,voice:string;
const verses=Array.from({length:2},(_,i)=>({surah:2,number:i+18,numberInSurah:i+11,page:3,text:'نص'} as Ayah));
function Harness(){audio=useMushafAudio({selectedReciter:voice,pageAyahs:verses,currentPage:3,nextPage:()=>{},nextSurah:()=>{}});practice=useReaderAudioPractice(audio,voice,id=>{voice=id;render();},()=>{});return null;}
const render=()=>root.render(<MemoryRouter initialEntries={['/read']}><Harness/></MemoryRouter>);
beforeEach(async()=>{voice='ar.alafasy';vi.stubGlobal('Audio',class extends Media{constructor(){super();media=this;}});vi.stubGlobal('requestAnimationFrame',()=>1);vi.stubGlobal('cancelAnimationFrame',()=>{});vi.mocked(fetchSurah).mockResolvedValue({ayahs:verses} as Awaited<ReturnType<typeof fetchSurah>>);div=document.createElement('div');document.body.append(div);root=createRoot(div);await act(async()=>render());});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.unstubAllGlobals();});
const end=()=>act(async()=>{media.paused=true;media.dispatchEvent(new Event('ended'));});
it('plays a complete passage with each selected voice and stops after the last comparison',async()=>{
 await act(async()=>practice.startComparison(['ar.alafasy','ar.husary'],verses));expect(media.src).toContain('ar.alafasy/18');
 await end();expect(media.src).toContain('ar.alafasy/19');await end();expect(voice).toBe('ar.husary');expect(media.src).toContain('ar.husary/18');
 await end();await end();expect(practice.comparison).toBeNull();expect(audio.passageComplete).toBe(true);expect(media.paused).toBe(true);
});
it('captures A and B from the actual file positions and uses the existing exact loop engine',async()=>{
 await act(async()=>audio.playAyahAtIndex(0));media.currentTime=4.2;await act(async()=>practice.markA());media.currentTime=9.7;
 await act(async()=>practice.markB());expect(audio.snapshot()?.cuts?.start.offset).toBe(4.2);expect(audio.snapshot()?.cuts?.endTime).toBe(9.7);expect(audio.passage?.repetitions).toBe(3);
 expect(media.currentTime).toBe(4.2);expect(practice.b?.offset).toBe(9.7);
 await act(async()=>audio.toggleAudio());expect(practice.b?.offset).toBe(9.7);expect(media.paused).toBe(true);
});
it('does not restart a comparison after manual playback replaces its passage',async()=>{
 await act(async()=>practice.startComparison(['ar.alafasy','ar.husary'],verses));
 await act(async()=>audio.playAyahAtIndex(0));expect(practice.comparison).toBeNull();await end();expect(voice).toBe('ar.alafasy');
});
it('ignores a pending cross-verse A–B request after cancellation',async()=>{
 let resolve!:(value:Awaited<ReturnType<typeof fetchSurah>>)=>void;vi.mocked(fetchSurah).mockReturnValueOnce(new Promise(r=>{resolve=r;}));
 await act(async()=>audio.playAyahAtIndex(0));media.currentTime=2;await act(async()=>practice.markA());await act(async()=>audio.playAyahAtIndex(1));media.currentTime=3;
 let pending!:Promise<void>;await act(async()=>{pending=practice.markB();});await act(async()=>practice.cancel());await act(async()=>{resolve({ayahs:verses} as Awaited<ReturnType<typeof fetchSurah>>);await pending;});
 expect(audio.passage).toBeNull();expect(practice.b).toBeNull();
});
