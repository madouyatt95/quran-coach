// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {createMemoryStorage} from '../../../test/memoryStorage';
import {readReadingReturn,saveReadingReturn,captureReadingReturn} from './readingReturn';
import {captureReadingAnchor} from '../../Pupitre/usePupitreContinuity';
vi.mock('../../Pupitre/usePupitreContinuity',()=>({captureReadingAnchor:vi.fn(()=>null)}));
beforeEach(()=>vi.stubGlobal('sessionStorage',createMemoryStorage()));
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
it('retains a return location until explicit dismissal, including after rereading storage',()=>{
 const point={page:4,surah:2,ayah:17,scroll:123,anchor:null};saveReadingReturn(point);expect(readReadingReturn()).toEqual(point);
 saveReadingReturn(null);expect(readReadingReturn()).toBeNull();
});
it('rejects corrupt saved positions instead of jumping to unrelated text',()=>{
 sessionStorage.setItem('quran-coach-reading-return',JSON.stringify({page:4,surah:2,ayah:1,scroll:0,anchor:null}));expect(readReadingReturn()).toBeNull();
 sessionStorage.setItem('quran-coach-reading-return','{');expect(readReadingReturn()).toBeNull();
});
it('captures the actual visible verse when a page jump left the store at verse 1',()=>{
 const root=document.createElement('div');root.className='iq-reader';const viewport=document.createElement('div');root.append(viewport);viewport.scrollTop=120;
 vi.mocked(captureReadingAnchor).mockReturnValue({attribute:'data-word-key',key:'2:20:3',offset:42,offsetX:12});
 expect(captureReadingReturn(viewport,4,2,1)).toMatchObject({page:4,surah:2,ayah:20,scroll:120});
});
