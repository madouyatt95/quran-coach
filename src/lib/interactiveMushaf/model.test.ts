import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { composePage, decodePage, isInteractivePage, parseTajweedSegments, quranWordAudioUrl, type PageNumber, type PageResponse } from './model';
import { PAGE_MANIFEST as manifest, canonicalPage, CHAPTERS, pageForVerse } from './model';
import { createHash } from 'node:crypto';
import { unicodeWord } from './fontResources';

// Synthetic non-scriptural characters exercise mapping only; not a source of Quranic text.
function fixture(page:PageNumber):PageResponse {
    const lines=manifest[page].lines;
    const entries=Object.entries(lines).flatMap(([line,keys])=>keys.map(key=>({line:Number(line),key})));
    const keys=[...new Set(entries.map(e=>e.key.split(':').slice(0,2).join(':')))];
    return {pagination:{next_page:null,total_records:keys.length},verses:keys.map(key=>{
        const [surah,ayah]=key.split(':').map(Number);
        const group=entries.filter(e=>e.key.startsWith(`${key}:`));
        return {id:ayah+CHAPTERS[surah-1].offset,verse_key:key,verse_number:ayah,page_number:page,juz_number:1,words:group.map((e,i)=>({position:i+1,code_v2:String.fromCodePoint(0xfc41+entries.indexOf(e)),text_uthmani:'ب',char_type_name:i===group.length-1?'end':'word',page_number:page,line_number:e.line,translation:{text:'Example',language_name:'english'}}))};
    })};
}
describe('Interactive Mushaf data integrity',()=>{
    it('parses source Tajweed spans into safe letter-level fallback segments',()=>{
        expect(parseTajweedSegments('بِسْمِ <tajweed class="madda_normal">اللَّهِ</tajweed> <tajweed class="ikhafa">الرَّحْمَٰنِ</tajweed>','fallback')).toEqual([
            {text:'بِسْمِ ',rule:null},{text:'اللَّهِ',rule:'madda_normal'},{text:' ',rule:null},{text:'الرَّحْمَٰنِ',rule:'ikhafa'}
        ]);
        expect(parseTajweedSegments(undefined,'الْحَمْدُ')).toEqual([{text:'الْحَمْدُ',rule:null}]);
    });
    it('resolves word audio from the verse and visible word position, not the shifted API audio_url',()=>{
        expect(quranWordAudioUrl('2:13',13)).toBe('https://audio.qurancdn.com/wbw/002_013_013.mp3');
        expect(quranWordAudioUrl('2:13',14)).toBe('https://audio.qurancdn.com/wbw/002_013_014.mp3');
        expect(quranWordAudioUrl('bad:verse',13)).toBeNull();
        const source=fixture(3);
        const verse=source.verses.find(v=>v.verse_key==='2:13')!;
        verse.words[12].audio_url='wbw/002_013_014.mp3';
        verse.words[13].audio_url='wbw/002_013_015.mp3';
        const parsed=decodePage(3,source);
        expect(parsed.words.find(w=>w.key==='2:13:13')?.audio).toBe('https://audio.qurancdn.com/wbw/002_013_013.mp3');
        expect(parsed.words.find(w=>w.key==='2:13:14')?.audio).toBe('https://audio.qurancdn.com/wbw/002_013_014.mp3');
    });
    it.each<PageNumber>([1,2,3])('keeps all verse and line references on page %i',page=>{
        const parsed=decodePage(page,fixture(page));
        expect(parsed.words.length).toBe(manifest[page].wordCount+manifest[page].endCount);
        for(const [line,keys] of Object.entries(manifest[page].lines))expect(parsed.words.filter(w=>w.line===Number(line)).map(w=>w.key)).toEqual(keys);
        expect(parsed.words.every(w=>w.french===null)).toBe(true);
    });
    it('rejects missing words, shifted codes, swapped positions, wrong edition pages and missing verses',()=>{
        const corruptions:Array<(d:PageResponse)=>void>=[d=>{d.verses[0].words.splice(0,1);},d=>{d.verses[0].words[1].code_v2='X';},d=>{d.verses[0].words[1].position=3;},d=>{d.verses[0].words[0].page_number=2;},d=>{d.verses.pop();},d=>{d.pagination.next_page=2;}];
        for(const corrupt of corruptions){const d=fixture(1);corrupt(d);expect(()=>decodePage(1,d)).toThrow();}
    });
    it('accepts all 604 pages but rejects invalid page numbers',()=>{expect([1,4,604].every(isInteractivePage)).toBe(true);expect([0,605,1.5,NaN].some(isInteractivePage)).toBe(false);});
    it.each<PageNumber>([1,2,3])('positions page %i without overlap or wrapping',page=>{
        const data=decodePage(page,fixture(page));
        const positions=composePage(data,(_,size)=>size*.85);
        expect(positions).toHaveLength(data.words.length);
        for(const [i,p]of positions.entries()){
            expect(p.x).toBeGreaterThanOrEqual(60);expect(p.x+p.width).toBeLessThanOrEqual(540);
            const prior=positions[i-1];if(prior&&prior.y===p.y)expect(p.x+p.width).toBeLessThanOrEqual(prior.x+.001);
        }
    });
    it('fits the same verified lines when a browser must use Unicode Arabic instead of QCF glyphs',()=>{
        const data=decodePage(4,fixture(4));
        const measured:string[]=[];
        const positions=composePage(data,(glyph,size)=>{measured.push(glyph);return size*.8;},unicodeWord);
        expect(positions).toHaveLength(data.words.length);
        expect(measured).toContain(data.words.find(w=>w.kind==='word')!.text);
        expect(measured).toContain('١٧');
        for(const [i,p]of positions.entries()){
            expect(p.x).toBeGreaterThanOrEqual(60);expect(p.x+p.width).toBeLessThanOrEqual(540);
            const prior=positions[i-1];if(prior&&prior.y===p.y)expect(p.x+p.width).toBeLessThanOrEqual(prior.x+.001);
        }
    });
});
const auditDir=process.env.QCF_AUDIT_DIR;
describe.skipIf(!auditDir)('Live-source snapshots, captured for this audit (not shipped)',()=>{
    it.each<PageNumber>(Array.from({length:604},(_,i)=>i+1))('validates the actual API page %i and records its hash',page=>{
        const source=JSON.parse(readFileSync(`${auditDir}/v4-api-${page}.json`,'utf8')) as PageResponse;
        const parsed=decodePage(page,source);
        for(const [line,keys]of Object.entries(manifest[page].lines))expect(parsed.words.filter(w=>w.line===Number(line)).map(w=>w.key)).toEqual(keys);
        const canonical=canonicalPage(source);
        expect(createHash('sha256').update(canonical).digest('hex')).toBe(manifest[page].sha256);
    });
});

it('indexes 6236 unique verses with 114 chapter starts and no basmala at At-Tawba',()=>{
    expect(Object.keys(manifest)).toHaveLength(604);
    expect(new Set(Object.values(manifest).flatMap(p=>p.verseKeys)).size).toBe(6236);
    expect(Object.values(manifest).reduce((n,p)=>n+p.endCount,0)).toBe(6236);
    expect(Object.values(manifest).flatMap(p=>p.layout).filter(l=>l.type==='surah')).toHaveLength(114);
    const tawba=manifest[pageForVerse(9,1)!];
    expect(tawba.layout.some(l=>l.type==='basmala')).toBe(false);
    expect(manifest[604].layout.filter(l=>l.type==='surah').map(l=>l.surah)).toEqual([112,113,114]);
});
