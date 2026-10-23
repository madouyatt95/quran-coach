// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.resetModules();});
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
