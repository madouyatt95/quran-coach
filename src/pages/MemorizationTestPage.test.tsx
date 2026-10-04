// @vitest-environment jsdom
import { act } from 'react';
import { createRoot,type Root } from 'react-dom/client';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { TestQuestion } from './MemorizationTestPage';
import type { RecognitionCallbacks } from '../lib/speechRecognition';
const mocks=vi.hoisted(()=>({start:vi.fn(),stop:vi.fn(),timings:vi.fn()}));
vi.mock('../lib/tilawa/service',()=>({tilawaService:{start:mocks.start,stop:mocks.stop,finish:vi.fn()}}));
vi.mock('../lib/tilawa/assets',()=>({tilawaPackStatus:vi.fn().mockResolvedValue({ready:true}),downloadTilawaPack:vi.fn()}));
vi.mock('../lib/wordTimings',()=>({fetchWordTimings:mocks.timings}));
vi.mock('../stores/audioPlayerStore',()=>({useAudioPlayerStore:{getState:()=>({isPlaying:false})}}));
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
let root:Root;let div:HTMLDivElement;const answer=vi.fn<(outcome:string)=>void>();
const click=async(text:string)=>{await act(async()=>{(Array.from(div.querySelectorAll('button')).find(b=>b.textContent===text) as HTMLButtonElement).click();});};
beforeEach(async()=>{vi.clearAllMocks();mocks.start.mockResolvedValue(true);mocks.stop.mockResolvedValue(undefined);div=document.createElement('div');document.body.append(div);root=createRoot(div);await act(async()=>root.render(<TestQuestion ayah={{surah:112,number:6222,numberInSurah:1,text:'قل هو الله أحد',page:604,juz:30,hizbQuarter:240}} onAnswer={outcome=>answer(outcome)}/>));});
afterEach(async()=>{await act(async()=>root.unmount());div.remove();});
it('keeps the answer hidden and prevents an assisted recall from being marked independent',async()=>{
 await click('Voir le début');expect(div.textContent).not.toContain('قل هو الله أحد');
 await click('Un indice');await click('Comparer ma récitation');expect(div.textContent).toContain('قل هو الله أحد');
 const independent=Array.from(div.querySelectorAll('button')).find(b=>b.textContent==='Sans aide')!;expect(independent.disabled).toBe(true);
 await click('Avec indice');expect(answer).toHaveBeenCalledWith('assisted');
});
it('keeps microphone failures retryable and does not pretend the test succeeded',async()=>{
 mocks.start.mockImplementation(async(_text:string,callbacks:RecognitionCallbacks)=>{callbacks.onError('Microphone refusé');callbacks.onEnd();return false;});
 await click('Voir le début');await click('Réciter au micro');expect(div.textContent).toContain('Microphone refusé');expect(div.textContent).not.toContain('Après comparaison');expect(answer).not.toHaveBeenCalled();
});
it('invalidates late microphone results when comparing or leaving',async()=>{
 await click('Voir le début');await click('Réciter au micro');const callbacks=mocks.start.mock.calls[0][1] as RecognitionCallbacks;
 await click('Comparer ma récitation');await act(async()=>callbacks.onWordMatch(1,true,'هو'));
 expect(div.textContent).toContain('0 / 3 mots');expect(mocks.stop).toHaveBeenCalled();
});
it('offers the text cue when exact audio timing is unavailable',async()=>{
 mocks.timings.mockResolvedValue(null);await click('Écouter le début');expect(div.textContent).toContain('Utilisez « Voir le début »');expect(mocks.start).not.toHaveBeenCalled();
});
