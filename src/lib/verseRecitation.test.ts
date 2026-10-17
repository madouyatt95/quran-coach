import {it,expect} from 'vitest';
import {parseVerseRecitation,wordRecitationStart} from './verseRecitation';
it('pairs offsets with the exact audio file and uses the word position, not segment index',()=>{
    const source=parseVerseRecitation({audio_files:[{verse_key:'2:17',url:'Alafasy/mp3/002017.mp3',segments:[[0,1,100,980],[14,15,17660,18780],[16,17,19090,21460]]}]},'2:17');
    expect(source?.url).toBe('https://verses.quran.com/Alafasy/mp3/002017.mp3');
    expect(wordRecitationStart(source,15)?.offset).toBe(17.66);
    expect(wordRecitationStart(source,14)).toBeNull();
});
it('rejects missing, malformed or zero length timing records without inventing an offset',()=>{
    const source=parseVerseRecitation({audio_files:[{verse_key:'2:17',url:'Alafasy/mp3/002017.mp3',segments:[[1],[2,0,0],[3,-100,400],[4,400,900]]}]},'2:17');
    expect(source?.timings.words.map(w=>w.position)).toEqual([4]);
    expect(wordRecitationStart(source,1)).toBeNull();
    expect(parseVerseRecitation({audio_files:[]},'2:17')).toBeNull();
});
