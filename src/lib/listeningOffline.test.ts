// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {journeyPackUrls} from './listeningOffline';
import {fetchTafsir} from './tafsirApi';
import {fetchWithCache} from './apiCache';
import type {PlaylistItem} from '../types';
afterEach(()=>vi.unstubAllGlobals());
it('réunit les quatre contenus et lit texte et explication sans réseau',async()=>{
 const item:PlaylistItem={surahNumber:1,surahName:'Fatiha',surahNameAr:'',totalAyahs:7,audioUrl:'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',verse:{number:1,globalNumber:1,text:'texte',translation:'traduction'}};
 const urls=journeyPackUrls([item]);expect(urls).toHaveLength(5);
 const jsonUrl='https://api.alquran.cloud/v1/surah/1/quran-uthmani';
 vi.stubGlobal('caches',{open:async()=>({match:async(url:string)=> url.includes('quranenc.com') ? Response.json({result:{translation:'Explication stockée',footnotes:'Note'}}) : url===jsonUrl ? Response.json({data:'Texte stocké'}) : undefined})});
 const fetch=vi.fn().mockRejectedValue(new Error('offline'));vi.stubGlobal('fetch',fetch);
 expect((await fetchTafsir('french_mokhtasar',1,1))?.text).toContain('Explication stockée');expect(await fetchWithCache(jsonUrl)).toEqual({data:'Texte stocké'});expect(fetch).not.toHaveBeenCalled();
});
