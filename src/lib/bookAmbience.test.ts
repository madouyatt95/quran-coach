// @vitest-environment jsdom
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {setBookAmbience,stopBookAmbience} from './bookAmbience';
const created:FakeAudio[]=[];
class FakeAudio {src='';volume=0;loop=false;preload='';paused=true;constructor(){created.push(this);}play=vi.fn(async()=>{this.paused=false;});pause=vi.fn(()=>{this.paused=true;});}
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('Audio',FakeAudio);created.length=0;});
afterEach(()=>{stopBookAmbience();vi.useRealTimers();vi.unstubAllGlobals();});
it('crossfades without a hard source switch, bounds volume, then stops every layer',async()=>{
 await setBookAmbience('wind',.12);vi.advanceTimersByTime(1600);const wind=created[0];expect(wind.volume).toBe(.12);
 await setBookAmbience('water',.25);const water=created[1];vi.advanceTimersByTime(800);
 expect(wind.volume).toBeGreaterThan(0);expect(water.volume).toBeGreaterThan(0);expect(wind.src).toContain('wind.mp3');
 vi.advanceTimersByTime(800);expect(wind.paused).toBe(true);expect(water.volume).toBe(.25);
 await setBookAmbience('silence',.25);vi.advanceTimersByTime(1600);expect(water.paused).toBe(true);expect(water.volume).toBe(0);
});
it('bounds loudness and stops immediately when playback stops',async()=>{
 const promise=setBookAmbience('wind',9);await promise;expect(created[0].volume).toBe(0);
 vi.advanceTimersByTime(1600);expect(created[0].volume).toBe(.25);stopBookAmbience();expect(created[0].paused).toBe(true);
});
