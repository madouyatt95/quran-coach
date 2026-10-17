import {describe,expect,it} from 'vitest';
import {captionIndex,translationCaptions} from './translationCaptions';
describe('French subtitle segmentation',()=>{
    it('preserves all words and punctuation while fitting two lines',()=>{
        const text="Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux.";
        const chunks=translationCaptions(text,25,value=>value.length);
        expect(chunks.join(' ').replace(/\s+/gu,' ')).toBe(text);
        expect(chunks.length).toBeGreaterThan(1);
        for(const chunk of chunks){expect(chunk.split('\n').length).toBeLessThanOrEqual(2);for(const line of chunk.split('\n'))expect(line.length).toBeLessThanOrEqual(25);}
    });
    it('fits fewer words on a narrow screen without dropping a long word',()=>{
        const text='Voici un mot particulièrementlong à conserver.';
        const narrow=translationCaptions(text,12,value=>value.length);
        expect(narrow.join(' ').replace(/\s+/gu,' ')).toBe(text);
        expect(narrow.length).toBeGreaterThan(translationCaptions(text,80,value=>value.length).length);
    });
    it('uses the audio position, including seeking backwards and the end',()=>{
        const chunks=['12345','67890','abcde'];
        expect(captionIndex(chunks,0)).toBe(0);
        expect(captionIndex(chunks,.5)).toBe(1);
        expect(captionIndex(chunks,1)).toBe(2);
        expect(captionIndex(chunks,.1)).toBe(0);
        expect(captionIndex(chunks,NaN)).toBe(0);
        expect(captionIndex([],1)).toBe(0);
    });
});
it('favours punctuation and avoids a trailing linking word at a caption boundary',()=>{
 const text='Voici une phrase complète; une autre phrase qui possède une suite suffisamment longue pour deux lignes.';
 const chunks=translationCaptions(text,28,s=>s.length);
 expect(chunks[0]).toBe('Voici une phrase complète;');
 expect(chunks.slice(0,-1).every(c=>!/(?: qui| de| et| à)$/u.test(c))).toBe(true);
 expect(chunks.join(' ').replace(/\s+/gu,' ')).toBe(text);
});
