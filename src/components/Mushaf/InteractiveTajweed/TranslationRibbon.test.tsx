// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {TranslationRibbon} from './TranslationRibbon';
import {fetchSurahTranslation} from '../../../lib/quranApi';
vi.mock('../../../lib/quranApi',()=>({fetchSurahTranslation:vi.fn()}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const translation='Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux.';
let root:Root,container:HTMLDivElement;
let media:{current:HTMLAudioElement|null};
let options:{surah:number;ayah:number;expanded:boolean;audioActive:boolean};
const toggle=vi.fn();
const render=()=>act(async()=>root.render(<MemoryRouter><TranslationRibbon {...options} audioRef={media} onExpanded={toggle}/></MemoryRouter>));
const caption=()=>container.querySelector('.iq-caption-text')?.textContent;
beforeEach(()=>{
    vi.useFakeTimers();vi.clearAllMocks();
    vi.mocked(fetchSurahTranslation).mockResolvedValue(new Map([[1,translation],[2,'Louange à Allah, Seigneur de l’univers.']]));
    vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({measureText:(text:string)=>({width:text.length*7})} as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLElement.prototype,'clientWidth','get').mockReturnValue(170);
    HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
    media={current:{currentTime:0,duration:20} as HTMLAudioElement};
    options={surah:1,ayah:1,expanded:true,audioActive:true};
    container=document.createElement('div');document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
it('advances subtitles from the media clock, holds while paused and supports seeking',async()=>{
    await render();const first=caption();expect(first).toContain('Au nom');
    await act(async()=>{media.current!.currentTime=19;vi.advanceTimersByTime(100);});
    const last=caption();expect(last).toContain('Miséricordieux.');expect(last).not.toBe(first);
    await act(async()=>vi.advanceTimersByTime(5000));expect(caption()).toBe(last);
    await act(async()=>{media.current!.currentTime=0;vi.advanceTimersByTime(100);});expect(caption()).toBe(first);
});
it('follows a new verse and a replaced audio element without refetching the surah',async()=>{
    await render();options.ayah=2;media.current={currentTime:0,duration:12} as HTMLAudioElement;await render();
    expect(caption()).toContain('Louange');expect(fetchSurahTranslation).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.iq-translation-hide')?.textContent).toContain('1:2');
});
it('opens the complete verse above the reader and keeps that verse if audio advances',async()=>{
    await render();await act(async()=>container.querySelector<HTMLButtonElement>('.iq-translation-caption')!.click());
    const dialog=document.querySelector('dialog');expect(dialog?.textContent).toContain(translation);
    expect(container.contains(dialog)).toBe(false);
    options.ayah=2;await render();expect(dialog?.textContent).toContain(translation);
    expect(dialog?.querySelector('a')?.getAttribute('href')).toBe('/tafsir?surah=1&ayah=1');
    await act(async()=>dialog!.querySelector('button')!.click());expect(document.querySelector('dialog')).toBeNull();
});
it('does not fetch when hidden and allows retry after a failed request',async()=>{
    options.expanded=false;await render();expect(fetchSurahTranslation).not.toHaveBeenCalled();
    vi.mocked(fetchSurahTranslation).mockRejectedValueOnce(new Error('offline'));
    options.expanded=true;await render();expect(caption()).toContain('Réessayer');
    await act(async()=>container.querySelector<HTMLButtonElement>('.iq-translation-caption')!.click());expect(caption()).toContain('Au nom');
});
it('pauses on opening full text and resumes on close only through the playback guard',async()=>{
 const resume=vi.fn(),pause=vi.fn(()=>resume);
 await act(async()=>root.render(<MemoryRouter><TranslationRibbon {...options} audioRef={media} onExpanded={toggle} onPauseForReading={pause}/></MemoryRouter>));
 await act(async()=>container.querySelector<HTMLButtonElement>('.iq-translation-caption')!.click());expect(pause).toHaveBeenCalledOnce();
 await act(async()=>document.querySelector<HTMLButtonElement>('dialog button')!.click());expect(resume).toHaveBeenCalledOnce();
});
it('allows keyboard review of captions, then restores automatic following',async()=>{
 const resume=vi.fn(),pause=vi.fn(()=>resume);
 await act(async()=>root.render(<MemoryRouter><TranslationRibbon {...options} audioRef={media} onExpanded={toggle} onPauseForReading={pause}/></MemoryRouter>));
 const first=caption();await act(async()=>container.querySelector('.iq-translation-caption')!.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
 expect(caption()).not.toBe(first);expect(pause).toHaveBeenCalledOnce();
 await act(async()=>container.querySelector<HTMLButtonElement>('[aria-label="Reprendre le suivi des sous-titres"]')!.click());expect(resume).toHaveBeenCalledOnce();expect(caption()).toBe(first);
});
