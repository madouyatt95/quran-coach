// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {createJSONStorage} from 'zustand/middleware';
import {createMemoryStorage} from '../../test/memoryStorage';
import {useDownloadStore} from '../../stores/downloadStore';
import {HifdhOffline} from './HifdhOffline';
const m=vi.hoisted(()=>({pack:vi.fn()}));
vi.mock('../../lib/tilawa/assets',()=>({tilawaPackStatus:m.pack}));
vi.mock('../Learning/TilawaPackCard',()=>({TilawaPackCard:()=>null}));
vi.mock('../../lib/quranApi',()=>({fetchSurah:async()=>({ayahs:[{surah:112,numberInSurah:1,number:6222},{surah:112,numberInSurah:2,number:6223}]}),getAudioUrl:(_r:string,n:number)=>`https://audio.example/${n}.mp3`}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let root:Root,host:HTMLDivElement;
let stored:Map<string,Response>;let fetched:string[];
const click=async()=>act(async()=>{(host.querySelector('button') as HTMLButtonElement).click();for(let i=0;i<60;i++)await Promise.resolve();});
beforeEach(()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());useDownloadStore.persist.setOptions({storage:createJSONStorage(()=>localStorage)});useDownloadStore.setState({tasks:{}});m.pack.mockResolvedValue({ready:false});stored=new Map();fetched=[];
 vi.stubGlobal('caches',{open:async()=>({match:async(u:string)=>stored.get(u)?.clone(),put:async(u:string,r:Response)=>{stored.set(u,r.clone());}})});
 vi.stubGlobal('fetch',vi.fn(async(u:string)=>{fetched.push(u);return new Response(u.endsWith('.mp3')?'audio':'{}',{status:200});}));
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
const mount=async()=>act(async()=>root.render(<MemoryRouter><HifdhOffline exercises={[{surah:112,ayah:1,kind:'transition',reason:''}]}/></MemoryRouter>));
it('downloads both sides of a transition and distinguishes missing voice assets from downloaded content',async()=>{
 await mount();await click();
 expect(fetched).toContain('https://audio.example/6222.mp3');expect(fetched).toContain('https://audio.example/6223.mp3');
 expect(host.textContent).toContain('Textes et audios de la séance téléchargés.');expect(host.textContent).toContain('Téléchargez aussi le pack vocal');
});
it('never announces offline readiness when a download fails',async()=>{
 vi.mocked(fetch).mockResolvedValue(new Response('unavailable',{status:503}));await mount();await click();
 expect(host.textContent).toContain('Préparation incomplète');expect(host.textContent).not.toContain('Textes et audios de la séance téléchargés.');
});
