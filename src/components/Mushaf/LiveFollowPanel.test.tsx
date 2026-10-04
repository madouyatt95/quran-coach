// @vitest-environment jsdom
import { act } from 'react';
import { createRoot,type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { LiveFollowPanel } from './LiveFollowPanel';
import { useLiveFollowStore } from '../../stores/liveFollowStore';
import type { TrackingCallbacks } from '../../lib/tilawa/service';
const mocks=vi.hoisted(()=>({start:vi.fn(),stop:vi.fn(),fetch:vi.fn(),go:vi.fn(),loaded:[] as {surah:number;numberInSurah:number;page:number}[]}));
vi.mock('../../lib/tilawa/service',()=>({tilawaService:{startTracking:mocks.start,stop:mocks.stop}}));
vi.mock('../../lib/tilawa/assets',()=>({tilawaPackStatus:vi.fn().mockResolvedValue({ready:true}),downloadTilawaPack:vi.fn()}));
vi.mock('../../lib/quranApi',()=>({fetchSurah:mocks.fetch}));
vi.mock('../../stores/quranStore',()=>({useQuranStore:{getState:()=>({goToAyah:mocks.go,currentSurahAyahs:mocks.loaded,pageAyahs:[]})}}));
vi.mock('../../stores/audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:false})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let div:HTMLDivElement;let root:Root;
beforeEach(async()=>{vi.clearAllMocks();mocks.loaded=[];mocks.start.mockResolvedValue(true);mocks.stop.mockResolvedValue(undefined);useLiveFollowStore.setState({active:false,passage:null,position:null});div=document.createElement('div');document.body.append(div);root=createRoot(div);await act(async()=>root.render(<MemoryRouter initialEntries={['/read']}><LiveFollowPanel/></MemoryRouter>));});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
it('does not start merely by reading and navigates confirmed verses without updating the bookmark',async()=>{
 expect(mocks.start).not.toHaveBeenCalled();mocks.fetch.mockResolvedValue({ayahs:[{numberInSurah:255,page:42}]});
 await act(async()=>div.querySelector('button')!.click());const cb=mocks.start.mock.calls[0][0] as TrackingCallbacks;
 await act(async()=>cb.onVerse({surah:2,ayah:255}));expect(mocks.go).toHaveBeenCalledWith(2,255,42,{silent:true});expect(useLiveFollowStore.getState().passage).toEqual({surah:2,ayah:255});
 await act(async()=>div.querySelector('button')!.click());expect(useLiveFollowStore.getState().active).toBe(false);expect(useLiveFollowStore.getState().passage).toBeNull();
});
it('ignores delayed text loads after a newer passage or cancellation',async()=>{
 let old!:(data:unknown)=>void;mocks.fetch.mockImplementationOnce(()=>new Promise(r=>{old=r;})).mockResolvedValue({ayahs:[{numberInSurah:257,page:43}]});
 await act(async()=>div.querySelector('button')!.click());const cb=mocks.start.mock.calls[0][0] as TrackingCallbacks;
 await act(async()=>{cb.onVerse({surah:2,ayah:255});cb.onVerse({surah:3,ayah:257});});
 await act(async()=>old({ayahs:[{numberInSurah:255,page:42}]}));expect(mocks.go).toHaveBeenCalledExactlyOnceWith(3,257,43,{silent:true});
 await act(async()=>div.querySelector('button')!.click());await act(async()=>cb.onVerse({surah:2,ayah:255}));expect(mocks.go).toHaveBeenCalledOnce();
});

it('paints words immediately and navigates loaded text without a network request',async()=>{
 mocks.loaded=[{surah:2,numberInSurah:255,page:42}];
 await act(async()=>div.querySelector('button')!.click());const cb=mocks.start.mock.calls[0][0] as TrackingCallbacks;
 await act(async()=>{cb.onVerse({surah:2,ayah:255});cb.onProgress?.({surah:2,ayah:255,wordIndex:1,words:['الله','لا']});});
 expect(mocks.fetch).not.toHaveBeenCalled();expect(mocks.go).toHaveBeenCalledWith(2,255,42,{silent:true});
 expect(useLiveFollowStore.getState().position?.wordIndex).toBe(1);expect(div.textContent).toContain('mot 2/2');
 await act(async()=>div.querySelector('button')!.click());
 await act(async()=>cb.onProgress?.({surah:2,ayah:255,wordIndex:2,words:['الله','لا']}));
 expect(useLiveFollowStore.getState().position).toBeNull();
});

it('keeps the listening session alive when the header host changes',async()=>{
 const first=document.createElement('div'),second=document.createElement('div');document.body.append(first,second);
 const render=(host:HTMLElement|null)=>root.render(<MemoryRouter initialEntries={['/read']}><LiveFollowPanel host={host}/></MemoryRouter>);
 await act(async()=>render(first));
 await act(async()=>first.querySelector('button')!.click());
 expect(mocks.start).toHaveBeenCalledOnce();const stopped=mocks.stop.mock.calls.length;
 await act(async()=>render(null));await act(async()=>render(second));
 expect(mocks.stop).toHaveBeenCalledTimes(stopped);expect(useLiveFollowStore.getState().active).toBe(true);
 expect(second.querySelector('button')?.getAttribute('aria-pressed')).toBe('true');
 await act(async()=>second.querySelector('button')!.click());expect(useLiveFollowStore.getState().active).toBe(false);
 first.remove();second.remove();
});
