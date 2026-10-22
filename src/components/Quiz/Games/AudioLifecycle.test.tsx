// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
const {fetchAudio,stop}=vi.hoisted(()=>({fetchAudio:vi.fn(),stop:vi.fn()}));
vi.mock('../../../lib/quranApi',()=>({fetchAyahAudioUrl:fetchAudio}));
vi.mock('../../../stores/audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({stop})}}));
import {AudioPlayer} from '../AudioPlayer';
import {StudyAudio} from '../QuizQuestionForm';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});let root:Root,div:HTMLDivElement;
beforeEach(()=>{fetchAudio.mockReset();stop.mockReset();vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();div=document.createElement('div');document.body.append(div);root=createRoot(div);});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();vi.useRealTimers();vi.restoreAllMocks();});
it('does not autoplay, stops other playback on an explicit play and pauses on unmount',async()=>{
 const end=vi.fn();await act(async()=>root.render(<AudioPlayer url="https://example.test/verse.mp3" onListened={end}/>));expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
 await act(async()=>div.querySelector('button')!.click());expect(stop).toHaveBeenCalledTimes(1);expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);expect(end).not.toHaveBeenCalled();await act(async()=>div.querySelector('audio')!.dispatchEvent(new Event('ended')));expect(end).toHaveBeenCalledTimes(1);
 await act(async()=>root.render(null));expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
});
it('ignores an old verse response after switching to the next complete verse',async()=>{
 let first!:(url:string)=>void;fetchAudio.mockImplementationOnce(()=>new Promise(resolve=>{first=resolve;})).mockResolvedValueOnce('https://example.test/second.mp3');
 await act(async()=>root.render(<StudyAudio target={{surah:1,ayah:2}}/>));await act(async()=>root.render(<StudyAudio target={{surah:1,ayah:3}}/>));await act(async()=>first('https://example.test/first.mp3'));expect(div.querySelector('audio')?.src).toBe('https://example.test/second.mp3');
});
it('offers a retry after an audio lookup stalls instead of waiting forever',async()=>{
 vi.useFakeTimers();fetchAudio.mockImplementation(()=>new Promise(()=>{}));await act(async()=>root.render(<StudyAudio target={{surah:1,ayah:2}}/>));await act(async()=>vi.advanceTimersByTime(12000));expect(div.textContent).toContain('Réessayer');expect(div.querySelector('audio')).toBeNull();
});
