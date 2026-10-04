import {afterEach,describe,it,expect,vi} from 'vitest';
import {createMemoryCaches} from '../test/memoryCache';
import {fetchWithCache} from './apiCache';
vi.mock('idb-keyval',()=>({get:vi.fn(),set:vi.fn().mockResolvedValue(undefined)}));
afterEach(()=>vi.unstubAllGlobals());
describe('downloaded text packs',()=>{
 it('reads an explicitly downloaded passage without network or a service worker',async()=>{
 const cache=createMemoryCaches();vi.stubGlobal('caches',cache);const fetcher=vi.fn().mockRejectedValue(Error('offline'));vi.stubGlobal('fetch',fetcher);
 const url='https://api.alquran.cloud/v1/surah/112/quran-uthmani';await(await cache.open('quran-coach-content-v1')).put(url,new Response(JSON.stringify({data:{ayahs:[{text:'قل هو الله أحد'}]}})));
 expect(await fetchWithCache(url)).toEqual({data:{ayahs:[{text:'قل هو الله أحد'}]}});expect(fetcher).not.toHaveBeenCalled();
 });
});
