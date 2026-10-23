// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
const platform=vi.hoisted(()=>({native:false}));
vi.mock('@capacitor/core',()=>({Capacitor:{isNativePlatform:()=>platform.native}}));
afterEach(()=>{platform.native=false;vi.unstubAllGlobals();vi.unstubAllEnvs();vi.resetModules();});
it('loads the published catalogue on iOS without relying on the web reverse proxy',async()=>{
 platform.native=true;vi.stubEnv('VITE_AUDIO_PRODUCTION_URL','/book-audio');
 const episode={id:'native-book',title:'Livre',text:'Chapitre'};
 const read=vi.fn(async(input:string)=>Response.json(input==='https://quran-coach-audio.madouyatt95.workers.dev/catalog'?[episode]:[]));
 vi.stubGlobal('fetch',read);
 const {loadAudioLibrary}=await import('./audioLibrary');
 expect(await loadAudioLibrary()).toEqual([episode]);
 expect(read).not.toHaveBeenCalledWith('/book-audio/catalog');
});
it('discovers newly published audio after visiting the library again, including narration lookups cached before publication',async()=>{
 vi.stubEnv('VITE_AUDIO_PRODUCTION_URL','https://audio.test');
 vi.resetModules();
 let available=false;
 const episode={id:'a-book-chapter',title:'Un chapitre publié',text:'Texte du chapitre.'};
 const read=vi.fn(async(input:string)=>Response.json(input==='https://audio.test/catalog'&&available?[episode]:[]));
 vi.stubGlobal('fetch',read);
 const {loadAudioLibrary,publishedNarration}=await import('./audioLibrary');
 expect(await loadAudioLibrary()).toEqual([]);
 expect(await publishedNarration(episode.text)).toBeNull();
 available=true;
 expect(await loadAudioLibrary()).toEqual([]);
 expect(await loadAudioLibrary(true)).toEqual([episode]);
 expect(await publishedNarration(episode.text)).toEqual(episode);
});
it('presents published chapters and split recordings in reading order while keeping legacy audio after them',async()=>{
 vi.stubEnv('VITE_AUDIO_PRODUCTION_URL','https://audio.test');vi.resetModules();
 const titles=['Livre · 3. Fin','Livre · 1. Début · 2/2','Livre · 2. Suite','Livre · 1. Début · 1/2'];
 const recordings=titles.map((title,index)=>({id:String(index),title,text:title}));
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>Response.json(input==='https://audio.test/catalog'?recordings:[{id:'legacy',title:'Ancien épisode',text:'Autre texte'}])));
 const {loadAudioLibrary}=await import('./audioLibrary');
 expect((await loadAudioLibrary(true)).map(item=>item.title)).toEqual(['Livre · 1. Début · 1/2','Livre · 1. Début · 2/2','Livre · 2. Suite','Livre · 3. Fin','Ancien épisode']);
});
