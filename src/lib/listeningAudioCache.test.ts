// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {audioDownloadUrl,clearAudioPreload,prefetchedSource,preloadNextVerse} from './listeningAudioCache';
const a='https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3';
const b='https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3';
afterEach(()=>{clearAudioPreload();vi.unstubAllGlobals();});
it('utilise le miroir fixe avec le bitrate de chaque voix',()=>{
 expect(audioDownloadUrl(a)).toBe('/offline-audio/1.mp3');
 expect(audioDownloadUrl('https://cdn.islamic.network/quran/audio/192/ar.abdurrahmaansudais/2.mp3')).toBe('/verse-audio/192/ar.abdurrahmaansudais/2.mp3');
 const fake='https://cdn.islamic.network/quran/audio/128/ar.unknown/1.mp3';expect(audioDownloadUrl(fake)).toBe(fake);
});
it('réutilise le verset préchargé et libère les données quittées',async()=>{
 const revoke=vi.fn();vi.stubGlobal('URL',{createObjectURL:vi.fn(()=> 'blob:next'),revokeObjectURL:revoke});
 const fetch=vi.fn(async()=>new Response('audio',{headers:{'content-type':'audio/mpeg'}}));vi.stubGlobal('fetch',fetch);
 preloadNextVerse(a,b);await vi.waitFor(()=>expect(prefetchedSource(b)).toBe('blob:next'));
 preloadNextVerse(b);expect(prefetchedSource(b)).toBe('blob:next');expect(fetch).toHaveBeenCalledTimes(1);
 clearAudioPreload();expect(revoke).toHaveBeenCalledWith('blob:next');expect(prefetchedSource(b)).toBe(b);
});
it('abandonne le prochain verset après changement de file',()=>{
 vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))))));
 preloadNextVerse(a,b);const signal=vi.mocked(fetch).mock.calls[0][1]?.signal;clearAudioPreload();expect(signal?.aborted).toBe(true);
});
