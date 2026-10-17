// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {createMemoryStorage} from '../test/memoryStorage';
import {loadReaderAudioSession,saveReaderAudioSession,type ReaderAudioSession} from './readerAudioSession';
it('persists an exact fractional timestamp, voice and selected passage',()=>{
 vi.stubGlobal('localStorage',createMemoryStorage());
 const saved={verse:{surah:2,numberInSurah:18,page:4},reciter:'ar.alafasy',url:'https://audio.example/18.mp3',offset:6.12345,speed:1.25,stopAt:25,queue:null,range:null,cuts:null,timings:{verseKey:'2:18',words:[]},savedAt:123} as unknown as ReaderAudioSession;
 saveReaderAudioSession(saved);expect(loadReaderAudioSession()).toEqual(saved);vi.unstubAllGlobals();
});
it('handles denied storage without disrupting playback',()=>{
 vi.stubGlobal('localStorage',{getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}});
 expect(loadReaderAudioSession()).toBeNull();expect(()=>saveReaderAudioSession({} as ReaderAudioSession)).not.toThrow();vi.unstubAllGlobals();
});
